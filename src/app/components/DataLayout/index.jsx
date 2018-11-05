import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'

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
  <table className={styles.tableLayout}>
    <tbody>
      {rows.map((row, i) => !Array.isArray(row) ? null : (
        <tr key={i}>
          {row.map((cell, i) => (
            <td key={i}>{cell}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
))
