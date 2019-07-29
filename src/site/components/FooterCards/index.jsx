import React, { Fragment } from 'react'
import Header from 'Site/components/Header'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { Row, Col } from 'reactstrap'
import classNames from 'class-names'
import PropTypes from 'prop-types'

import Icon from 'Components/Icon'

import style from './style.scss'
import homeStyle from 'Site/pages/Home1/style.scss'


const FooterCards = ({ translations, cards }) => {
  return (
    <Row>
      {cards.map(card => {
        return (
          <Col key={card.heading}>
            <div className={style.footerCard}>
              <h4>{card.heading}</h4>
              <p><h4>{card.description}</h4></p>
            </div>
          </Col>
        )
      })}
    </Row>
  )}

export default compose(
  setDisplayName('FooterCards'),
  setPropTypes({
    cards: PropTypes.array.isRequired
  }),
)((FooterCards))