import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import { Row, Col } from 'reactstrap'

import styles from './style'

export default compose(
  setDisplayName('DataLayout'),
  setPropTypes({
    rows: PropTypes.arrayOf(PropTypes.oneOfType([
      null,
      PropTypes.boolean,
      PropTypes.arrayOf(PropTypes.node),
    ]))
  })
)(({ rows }) => (
  <div className={styles.dataLayout}>
    {rows.map((row, i) => !Array.isArray(row) ? null : (
      <Row className='gutter-x-2 mb-1' key={i}>
        <Col xs='12' sm='3' lg='2' className={styles.dataLabel}>
          {row[0]}
        </Col>
        {row.slice(1).map((cell, i) => (
          <Col xs='12' sm key={i} className={styles.dataValue}>
            {cell}
          </Col>
        ))}
      </Row>
    ))}
  </div>
))
