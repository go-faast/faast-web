import React from 'react'
import PropTypes from 'prop-types'
import {
  compose, setDisplayName, setPropTypes, withProps, withState, withHandlers, lifecycle,
} from 'recompose'
import classNames from 'class-names'
import LazyLoad from 'react-lazyload'
import { sortObjOfArray } from 'Utilities/helpers'

import style from './style.scss'

export default compose(
  setDisplayName('IconCarousel'),
  setPropTypes({
    items: PropTypes.arrayOf(PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.node.isRequired,
      iconUrl: PropTypes.string.isRequired,
      link: PropTypes.string.isRequired,
      marketCap: PropTypes.oneOfType([PropTypes.number, PropTypes.object]).isRequired
    })).isRequired,
  }),
  withProps({
    refs: {
      wrapper: React.createRef(),
      carousel: React.createRef(),
      leftArrow: React.createRef(),
      rightArrow: React.createRef(),
      firstIcon: React.createRef(),
    }
  }),
  withState('shiftAmount', 'setShiftAmount', 0),
  withState('assetList', 'updateAssetList', ({ items }) => items),
  withHandlers(({ refs, setShiftAmount }) => {
    const getWidth = (elem) => (elem && elem.getBoundingClientRect().width) || 0

    function shiftIcons(shiftAmount, right) {
      const carouselWidth = getWidth(refs.carousel.current)
      const wrapperWidth = getWidth(refs.wrapper.current)
      const leftArrowWidth = getWidth(refs.leftArrow.current)
      const rightArrowWidth = getWidth(refs.rightArrow.current)
      const iconWidth = getWidth(refs.firstIcon.current)
      const viewPort = wrapperWidth - leftArrowWidth - rightArrowWidth
      const minShift = 0
      const maxShift = carouselWidth - viewPort
      const increment = viewPort - (viewPort % iconWidth) // Round down to multiple of icon width
      const newShift = right ? Math.min(maxShift, shiftAmount + increment) : Math.max(minShift, shiftAmount - increment)
      setShiftAmount(newShift)
    }
    
    return {
      handleClickRight: ({ shiftAmount }) => () => shiftIcons(shiftAmount, true),
      handleClickLeft: ({ shiftAmount }) => () => shiftIcons(shiftAmount, false),
    }
  }),
  lifecycle({
    componentWillMount() {
      const { items, updateAssetList } = this.props
      updateAssetList(sortObjOfArray(items, 'marketCap', 'desc'))
    }
  })
)(({ assetList, refs, shiftAmount, handleClickLeft, handleClickRight }) => (
  <div className={style.wrapper} ref={refs.wrapper}>
    <div className={classNames(style.arrow, style.arrowLeft)} ref={refs.leftArrow} onClick={handleClickLeft}>
      <h2 className='fa fa-caret-left'></h2>
    </div>
    <div className={classNames(style.arrow, style.arrowRight)} ref={refs.rightArrow} onClick={handleClickRight}>
      <h2 className='fa fa-caret-right'></h2>
    </div>
    <div className={style.carousel} ref={refs.carousel} style={{ transform: `translate3d(-${shiftAmount}px, 0, 0)` }}>
      {assetList.map(({ key, label, iconUrl, link }, i) => (
        <div key={key} className={style.icon} {...(i === 0 ? { ref: refs.firstIcon } : {})}>
          <a className='d-block text-white' href={link}>
            <LazyLoad offset={600} height={72}>
              <img className={style.iconImg} src={iconUrl}/>
            </LazyLoad>
            <div className={style.iconLabel}>{label}</div>
          </a>
        </div>
      ))}
    </div>
  </div>
))
