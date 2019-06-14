import * as React from 'react'
import { compose, setDisplayName, withProps, setPropTypes, withHandlers, defaultProps } from 'recompose'
// import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import {
  NavLink,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle
} from 'reactstrap'
import Icon from 'Components/Icon'
import withToggle from 'Hoc/withToggle'
import classNames from 'class-names'
import { createStructuredSelector } from 'reselect'
import { getAppLanguage } from 'Common/selectors/app'
import { selectLanguage } from 'Common/actions/app'
import { translations as languages } from 'Config/translations'

import PropTypes from 'prop-types'

import { darkestText } from 'Site/components/PostPreview/style.scss'

export default compose(
  setDisplayName('LanguageSelector'),
  setPropTypes({
    onSelect: PropTypes.func,
    showCode: PropTypes.bool,
    theme: PropTypes.string
  }),
  defaultProps({
    onSelect: () => {},
    showCode: true
  }),
  connect(createStructuredSelector({
    currentLanguage: getAppLanguage
  }), {
    selectLanguage,
  }),
  withProps(({ currentLanguage }) => {
    currentLanguage = languages.filter(l => l.selectable).find(l => l.code === currentLanguage) || languages[0]
    return ({
      currentLanguage
    })
  }),
  withHandlers({
    handleSelect: ({ onSelect, selectLanguage }) => (lang) => {
      selectLanguage(lang)
      onSelect(lang)
    }
  }),
  withToggle('dropdownOpen'),
)(({ theme, showCode, handleSelect, currentLanguage = {}, isDropdownOpen, toggleDropdownOpen, }) => (
  <Dropdown nav isOpen={isDropdownOpen} size="sm" toggle={toggleDropdownOpen}>
    <DropdownToggle 
      tag={NavLink} 
      to={'/assets'}
      onClick={((e) => e.preventDefault())}
      className={classNames((theme == 'light' ? darkestText : 'text-light'), 'cursor-pointer mr-4')}
      caret
      nav
    >
      <Icon style={{ width: 20, height: 20, marginRight: 10, position: 'relative', top: -1 }} src={currentLanguage.flag} />
      {showCode && <span>{currentLanguage.code.toUpperCase()}</span>}
    </DropdownToggle>
    <DropdownMenu style={{ borderRadius: 2, borderColor: '#fff' }} className='p-0'>
      {languages.filter(l => l.selectable).map((lang, i) => (
        <DropdownItem key={lang.url} onClick={() => handleSelect(lang.code)} tag={'button'} style={{ backgroundColor: '#fff', borderTop: '1px solid #ECEFF7' }} className={classNames(i === 0 && 'border-0','border-left-0 text-muted py-2')}>
          <Icon style={{ width: 20, height: 20, marginRight: 10 }} src={lang.flag} />
          <span style={{ color: '#333' }}>{lang.name}</span>
        </DropdownItem>
      ))}
    </DropdownMenu>
  </Dropdown>
))