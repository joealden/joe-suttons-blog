import React from "react";
import styled from "../../utils/styled-components";

import { FilterSortBy } from "../../utils/types";

import SortByList from "../SortByList";
import CategoryList from "../CategoryList";

import SearchIcon from "../icons/Search";
import CrossIcon from "../icons/Cross";

import { filterTags } from "../../utils/filterTags";

type FilterProps = {
  isOpen: boolean;
  close: () => void;
  sortBy: FilterSortBy;
  setSortBy: (sortBy: FilterSortBy) => void;
  categories: Array<string>;
  selectedCategory: string | null;
  setSelectedCategory: (selectedCategory: string | null) => void;
  tags: Array<string>;
  selectedTags: Array<string>;
  addTagToSelectedTags: (tagToAdd: string) => void;
  removeTagFromSelectedTags: (tagToRemove: string) => void;
  clearSelectedTags: () => void;
};

type FilterState = {
  searchValue: string;
  inputFocused: boolean;
  showSearchList: boolean;
};

class Filter extends React.Component<FilterProps, FilterState> {
  state: Readonly<FilterState> = {
    searchValue: "",
    inputFocused: false,
    showSearchList: false
  };

  selectedTagsRef: React.RefObject<HTMLUListElement> = React.createRef();
  filteredTagsRef: React.RefObject<HTMLUListElement> = React.createRef();

  componentDidUpdate() {
    const { selectedTagsRef, filteredTagsRef } = this;

    if (selectedTagsRef.current !== null) {
      if (
        selectedTagsRef.current.scrollHeight >
        selectedTagsRef.current.offsetHeight
      ) {
        selectedTagsRef.current.className = "list-scrollable";
      } else {
        selectedTagsRef.current.className = "list-not-scrollable";
      }
    }

    if (filteredTagsRef.current !== null) {
      if (
        filteredTagsRef.current.scrollHeight >
        filteredTagsRef.current.offsetHeight
      ) {
        filteredTagsRef.current.className = "list-scrollable";
      } else {
        filteredTagsRef.current.className = "list-not-scrollable";
      }
    }
  }

  updateSearchValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchValue = event.target.value;
    this.setState({ searchValue: newSearchValue });
  };

  clearSearchValue = () => this.setState({ searchValue: "" });

  focusInput = () =>
    this.setState({
      inputFocused: true,
      showSearchList: true
    });

  blurInput = () => this.setState({ inputFocused: false });

  hideSearchList = () => {
    const { resetSearchListPosition } = this;

    this.setState({
      searchValue: "",
      inputFocused: false,
      showSearchList: false
    });

    resetSearchListPosition();
  };

  resetSearchListPosition = () => {
    const { filteredTagsRef } = this;

    if (filteredTagsRef.current !== null) {
      filteredTagsRef.current.scrollTo({
        top: 0,
        left: 0
      });
    }
  };

  resetSelectedListPosition = () => {
    const { selectedTagsRef } = this;

    if (selectedTagsRef.current !== null) {
      selectedTagsRef.current.scrollTo({
        top: 0,
        left: 0
      });
    }
  };

  preventHideSearchList = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  closeFilter = (event: React.MouseEvent) => {
    const { close } = this.props;

    const {
      preventHideSearchList,
      hideSearchList,
      resetSearchListPosition,
      resetSelectedListPosition
    } = this;

    /*
     * This is so that the click handler
     * on `FilterContainer` doesn't trigger.
     */
    preventHideSearchList(event);

    close();

    /**
     * Reset the scroll position of both
     * the lists when the filter is closed.
     */
    resetSearchListPosition();
    resetSelectedListPosition();

    /*
     * This delay is so that the search list is
     * only hidden once the filter has gone out
     * of view. Without this delay, closing the
     * filter like this didn't look right.
     */
    setTimeout(() => {
      hideSearchList();
    }, 300);
  };

  render() {
    const {
      isOpen,
      sortBy,
      setSortBy,
      categories,
      selectedCategory,
      setSelectedCategory,
      tags,
      selectedTags,
      addTagToSelectedTags,
      removeTagFromSelectedTags,
      clearSelectedTags
    } = this.props;

    const { searchValue, inputFocused, showSearchList } = this.state;

    const {
      updateSearchValue,
      clearSearchValue,
      focusInput,
      blurInput,
      hideSearchList,
      preventHideSearchList,
      closeFilter
    } = this;

    const filteredTags = filterTags(tags, searchValue);

    return (
      <>
        <FilterContainer
          onClick={hideSearchList}
          style={{
            overflowY: isOpen ? "scroll" : "auto",
            /**
             * NOTE:
             * It is translated `-101%` instead of `-100%` because
             * on chrome (at least on linux), the filter was still
             * slightly visible when it was closed, meaning that you
             * could see a small bit of the filter colour at the top
             * of the page. This was more noticable on the light
             * theme.
             */
            transform: isOpen ? "translateY(0)" : "translateY(-101%)"
          }}
        >
          <InnerFilter>
            <SortBy>
              <SortByList sortBy={sortBy} setSortBy={setSortBy} />
            </SortBy>
            <Categories>
              <CategoryList
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
              />
            </Categories>
            <SearchTags>
              <div>
                <div onClick={preventHideSearchList}>
                  <input
                    value={searchValue}
                    onChange={updateSearchValue}
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    placeholder={inputFocused ? "" : "Search Tags"}
                    onFocus={focusInput}
                    onBlur={blurInput}
                    aria-label="search tags"
                  />
                  <div>
                    {searchValue === "" ? (
                      <SearchIcon />
                    ) : (
                      <button onClick={clearSearchValue}>
                        <CrossIcon />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <div>
                  <ul ref={this.selectedTagsRef}>
                    {selectedTags.map(tag => (
                      <SelectedTagsListItem key={tag}>
                        <div>{tag}</div>
                        <div onClick={() => removeTagFromSelectedTags(tag)}>
                          <CrossIcon />
                        </div>
                      </SelectedTagsListItem>
                    ))}
                  </ul>
                  {selectedTags.length === 0 || showSearchList ? null : (
                    <div>
                      <button onClick={clearSelectedTags}>Clear all</button>
                    </div>
                  )}
                </div>
                <div
                  style={{
                    display: showSearchList ? "" : "none"
                  }}
                >
                  {filteredTags.length === 0 ? (
                    <span onClick={preventHideSearchList}>
                      No tags match your search.
                    </span>
                  ) : (
                    <div>
                      <ul
                        ref={this.filteredTagsRef}
                        onClick={preventHideSearchList}
                      >
                        {filteredTags.map(tag => (
                          <FilteredTagsListItem key={tag}>
                            <span onClick={() => addTagToSelectedTags(tag)}>
                              {tag}
                            </span>
                            <div
                              onClick={() => removeTagFromSelectedTags(tag)}
                              style={{
                                display: selectedTags.includes(tag)
                                  ? ""
                                  : "none"
                              }}
                            >
                              <CrossIcon />
                            </div>
                          </FilteredTagsListItem>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </SearchTags>
            <FilterTitle>
              <h2>Filter</h2>
            </FilterTitle>
          </InnerFilter>
          <CloseButtonContainer>
            <button onClick={closeFilter}>Close</button>
          </CloseButtonContainer>
        </FilterContainer>
        <FilterCover />
        <FilterOverlay
          style={{
            visibility: isOpen ? "visible" : "hidden"
          }}
          onClick={closeFilter}
        />
      </>
    );
  }
}

export default Filter;

const FilterContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10000;
  background-color: ${props => props.theme.accentColor};
  color: #060606;
  transition: transform ${props => props.theme.transition};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 85px 0 25px 0;
`;

const InnerFilter = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr 1fr 1fr 1fr;
  grid-template-areas: "logo sort-by categories search-tags filter-title";

  > div {
    margin: 0 30px;
  }

  h3 {
    text-transform: uppercase;
    margin: 0 0 15px 0;

    &:after {
      content: "";
      display: block;
      margin-top: 15px;
      height: 1px;
      width: 100%;
      background-color: #060606;
    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;

      span {
        padding: 1px 0;
        user-select: none;

        /**
         * NOTE:
         * This causes a weird rendering bug if the item is
         * hovered upon and the container is scrolled. This only
         * happens in Firefox, and only when the dev tools are
         * not open. I'm pretty positive that this is a Firefox
         * bug, so I will leave this as is. 
         */
        transition: opacity ${props => props.theme.transition};
      }

      &:hover {
        span {
          opacity: 0.5;
        }
      }
    }

    &.list-scrollable li div:last-child {
      padding: 0 15px;
    }
    &.list-not-scrollable li div:last-child {
      padding-left: 30px;
    }
  }
`;

const CloseButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 80px;

  button {
    color: #060606;
    transition: opacity ${props => props.theme.transition};

    &:hover {
      opacity: 0.5;
      color: #060606;
    }
  }
`;

const SortBy = styled.div`
  grid-area: sort-by;
`;

const Categories = styled.div`
  grid-area: categories;
`;

const SearchTags = styled.div`
  grid-area: search-tags;
  display: flex;
  flex-direction: column;

  > div:first-child {
    > div {
      display: flex;
      justify-content: space-between;

      input {
        flex: 1;
        min-width: 0;
        background-color: ${props => props.theme.accentColor};
        border: none;
        outline: none;
        /* NOTE: Was 15px, but for some reason was 1px off */
        padding-bottom: 14px;

        &::placeholder {
          color: #060606;
          text-transform: uppercase;
          opacity: 1;
        }
      }

      > div {
        display: flex;
        align-items: center;
        /* NOTE: Was 15px, but for some reason was 1px off */
        padding-bottom: 14px;

        svg {
          width: 18px;
        }

        > button {
          padding: 0;
          display: flex;
          align-items: center;
        }
      }
    }

    &:after {
      content: "";
      display: block;
      height: 1px;
      width: 100%;
      background-color: #060606;
    }
  }

  > div:last-child {
    position: relative;
    flex: 1;

    > div:first-child {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;

      ul {
        max-height: 100%;
        overflow: auto;

        li:first-child {
          margin-top: 15px;
        }

        /* Scrollbar CSS for Firefox */
        scrollbar-width: thin;
        scrollbar-color: #060606 ${props => props.theme.accentColor};

        /* Scrollbar CSS for Chrome and Safari */
        &::-webkit-scrollbar {
          width: 1px;
          background-color: ${props => props.theme.accentColor};
        }

        &::-webkit-scrollbar-thumb {
          background-color: #060606;
        }

        &::-webkit-scrollbar-track {
          margin-top: 15px;
        }
      }

      > div {
        margin-top: 15px;
        display: flex;
        justify-content: flex-end;

        button {
          padding: 0;
          color: #060606;
        }
      }
    }

    > div:last-child {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: ${props => props.theme.accentColor};
      z-index: 100000;

      > span {
        display: block;
        margin: 15px 0;
        padding: 1px 0;
      }

      > div {
        height: 100%;

        &:after {
          content: "";
          display: block;
          height: 1px;
          width: 100%;
          background-color: #060606;
        }

        ul {
          max-height: 100%;
          overflow: auto;

          li:first-child {
            margin-top: 15px;
          }

          li:last-child {
            margin-bottom: 15px;
          }

          /* Scrollbar CSS for Firefox */
          scrollbar-width: thin;
          scrollbar-color: #060606 ${props => props.theme.accentColor};

          /* Scrollbar CSS for Chrome and Safari */
          &::-webkit-scrollbar {
            width: 1px;
            background-color: ${props => props.theme.accentColor};
          }

          &::-webkit-scrollbar-thumb {
            background-color: #060606;
          }

          &::-webkit-scrollbar-track {
            margin: 15px 0;
          }
        }
      }
    }
  }
`;

const SelectedTagsListItem = styled.li`
  padding: 1px 0;
  user-select: none;

  /* Do as I say, not as I do (I was being lazy). */
  cursor: default !important;

  div:last-child {
    cursor: pointer;

    svg {
      width: 12px;
    }
  }
`;

const FilteredTagsListItem = styled.li`
  span:first-child {
    flex: 1;
  }

  div:last-child {
    svg {
      width: 12px;
    }
  }
`;

const FilterTitle = styled.div`
  grid-area: filter-title;
  display: flex;
  justify-content: flex-end;

  h2 {
    writing-mode: vertical-rl;
    font-size: 5vw;
    margin: 0 60px 0 0;
    line-height: 80%;
    user-select: none;
  }
`;

/**
 * This is needed so that on macOS where they have overscrolling
 * in Chrome and Safari, the over scroll background color is the
 * same color as the current themes background color when the
 * filter is closed. If this didn't exist, the user would see
 * the bottom of the filter when they overscrolled at the top of
 * the page. This was not wanted.
 */
const FilterCover = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;

  /* This much so you can't overscroll passed it */
  height: 500px;

  z-index: 10001;
  background-color: ${props => props.theme.backgroundColor};
  transition: background-color ${props => props.theme.transition};
  transform: translateY(-100%);
`;

const FilterOverlay = styled.div`
  z-index: 9000;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  cursor: pointer;
  transition: visibility ${props => props.theme.transition};
`;
