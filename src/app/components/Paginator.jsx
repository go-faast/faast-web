import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { Pagination, PaginationItem, PaginationLink } from 'reactstrap'
import Link from 'Components/Link'

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
    previous: PropTypes.bool
  }),
  defaultProps({
    active: false,
    disabled: false,
    next: false,
    previous: false
  }),
)(({ page, active, disabled, next, previous }) => 
  typeof page === 'number' ? (
    <PaginationItem disabled={disabled} active={active}>
      <PaginationLink tag={Link} merge to={{ search: { page } }} next={next} previous={previous}>
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
    pages: PropTypes.number.isRequired
  })
)(({ page, pages, ...extraProps }) => (
  <Pagination {...extraProps}>
    <PageLink page={page - 1} disabled={page <= 1} previous />
    {getDisplayedPageNumbers(page, pages).map((pageNum, i) => (
      <PageLink key={pageNum === null ? `ellipsis-${i}` : pageNum} page={pageNum} active={pageNum === page}/>
    ))}
    <PageLink page={page + 1} disabled={page >= pages} next />
  </Pagination>
))
