import React, { Fragment } from 'react'
import { compose, setDisplayName } from 'recompose'
import { withRouteData } from 'react-static'
import { Container, Button } from 'reactstrap'

import Header from 'Site/components/Header'
import Footer from 'Site/components/Footer'

import { replaceStringWithJSX } from 'Utilities/display'
import classNames from 'class-names'

import { darkText } from 'Site/components/PostPreview/style.scss'

const formatCode = (p, text) => {
  if (p.type === 8) {
    return (
      <pre className='p-3' style={{ color: '#e83e8c', background: '#33353a' }}>
        <code key={p.name}>{text}</code>
      </pre>
    )
  }
}

const parseParagraph = (p, title) => {
  if (p.text && p.markups.length == 0 && p.text !== title) {
    if (p.type === 3) {
      return (<h2 className='mt-5 font-weight-bold' key={p.name}>{p.text}</h2>)
    }
    if (p.type === 8) {
      return formatCode(p, p.text)
    }
    return (<p key={p.name} className={darkText}>{p.text}</p>)
  } else if (p.metadata) {
    return (
      <div className='text-center my-4'>
        <img 
          key={p.name} 
          style={{ maxWidth: '100%' }} 
          src={`https://cdn-images-1.medium.com/max/1600/${p.metadata.id}`} 
        />
      </div>
    )
  } else if (p.text && p.markups.length > 0) {
    if (p.type === 8 && !p.markups[0].href) {
      return formatCode(p, p.text)
    }
    if (p.markups[0].href) {
      const text = replaceStringWithJSX(
        p.text, 
        p.text.substring(p.markups[0].start, p.markups[0].end), 
        (match) => (
          <a href={p.markups[0].href}>{match}</a>
        )
      )
      if (p.type === 8) {
        return formatCode(p, text)
      }
      return (
        <p>{text}</p>
      )
    } else if (p.markups[0].type === 1) {
      const text = replaceStringWithJSX(
        p.text, 
        p.text.substring(p.markups[0].start, p.markups[0].end), 
        (match) => (
          <b>{match}</b>
        )
      )
      return (<p>{text}</p>)
    }
  } else {
    console.log(p)
  }
}

export default compose(
  setDisplayName('BlogPost'),
  withRouteData
)(({ translations, mediumPost: { payload: { value: { title, mediumUrl, content: { bodyModel: { paragraphs } } } } } }) => (
  <Fragment>
    <Header translations={translations} theme='light' bgColor={'#FFFFFF'} />
    <Container>
      <div className={classNames(darkText, 'mx-auto mb-5 pb-5')} style={{ maxWidth: 1000 }}>
        <h1 className='mb-4 mt-5 font-weight-bold'>{title}</h1>
        {paragraphs.map(p => parseParagraph(p, title))}
        <div className='text-center'>
          <Button tag='a' href={mediumUrl} target='_blank noreferrer noopener' color='primary'>Read on Medium</Button>
        </div>
      </div>      
    </Container>
    <Footer translations={translations} />
  </Fragment>
))
