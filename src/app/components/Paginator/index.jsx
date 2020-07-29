import React from 'react'
import { pick } from 'lodash'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps, withHandlers } from 'recompose'
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap'
import Link from 'Components/Link'
import classNames from 'class-names'

import { pageLink, pageItem  } from './style.scss'

function getDisplayedPageNumbers (page, pages, maxDisplayed = 5) {
  const pageNumbers = []
  let first = page - Math.ceil((maxDisplayed - 1) / 2)
  if (first < 1) {
    first = 1
  } else if (first + maxDisplayed > pages) {
    first = pages - maxDisplayed + 1
  }
  const last = first + maxDisplayed - 1
  for (let i = first; i <= last; i++) {
    if (i >= 1 && i <= pages) {
      pageNumbers.push(i)
    }
  }
  if (first > 1) {
    pageNumbers.splice(0, 1, 1, null)
  }
  if (last < pages) {
    pageNumbers.splice(-1, 1, null, pages)
  }
  return pageNumbers
}

const PageLink = compose(
  setDisplayName('PageLink'),
  setPropTypes({
    page: PropTypes.number,
    active: PropTypes.bool,
    disabled: PropTypes.bool,
    next: PropTypes.bool,
    previous: PropTypes.bool,
    handlePageClick: PropTypes.func
  }),
  defaultProps({
    active: false,
    disabled: false,
    next: false,
    previous: false,
  }),
)(({ page, active, disabled, next, previous, handlePageClick, theme }) => 
  typeof page === 'number' ? (
    <PaginationItem disabled={disabled} active={active}>
      <PaginationLink 
        onClick={handlePageClick} 
        className={theme === 'light' && !active ? pageLink : theme === 'light' && active ? classNames(pageItem, pageLink) : null } 
        tag={Link} 
        merge 
        to={{ search: { page } }} 
        next={next} 
        previous={previous}
      >
        {!(next || previous) && page}
      </PaginationLink>
    </PaginationItem>
  ) : (
    <PaginationItem disabled>
      <PaginationLink>...</PaginationLink>
    </PaginationItem>
  )
)

export default compose(
  setDisplayName('Paginator'),
  setPropTypes({
    page: PropTypes.number.isRequired,
    pages: PropTypes.number.isRequired,
    onPageClick: PropTypes.func,
    theme: PropTypes.string
  }),
  defaultProps({
    onPageClick: undefined,
    theme: 'dark'
  }),
  withHandlers({
    handlePageClick: ({ onPageClick }) => (page) => {
      if (onPageClick) {
        onPageClick(page)
      }
      window.scroll(0,0)
    }
  })
)(({ page, pages, handlePageClick, theme, ...extraProps }) => (
  <Pagination {...pick(extraProps, Object.keys(Pagination.propTypes))}>
    <PageLink 
      page={page - 1} 
      disabled={page <= 1} 
      handlePageClick={() => handlePageClick(page - 1)} 
      theme={theme}
      previous
    />
    {getDisplayedPageNumbers(page, pages).map((pageNum, i) => (
      <PageLink 
        key={pageNum === null ? `ellipsis-${i}` : pageNum} 
        handlePageClick={() => handlePageClick(i + 1)}
        page={pageNum} 
        active={pageNum === page}
        theme={theme}
      />
    ))}
    <PageLink 
      page={page + 1} 
      handlePageClick={() => handlePageClick(page + 1)} 
      disabled={page >= pages} 
      theme={theme}
      next 
    />
  </Pagination>
))
