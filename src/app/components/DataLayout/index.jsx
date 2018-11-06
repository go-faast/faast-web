import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import classNames from 'class-names'

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
  <table className={styles.dataLayout}>
    <tbody>
      {rows.map((row, i) => !Array.isArray(row) ? null : ([
        <tr key={`inline-${i}`}>
          <td className={classNames(styles.dataLabel)}>
            {row[0]}
          </td>
          {row.slice(1).map((cell, i) => (
            <td key={i} className={classNames(styles.dataValueDesktop)}>
              {cell}
            </td>
          ))}
        </tr>,
        <tr key={`stack-${i}`} className={styles.dataRowMobile}>
          {row.slice(1).map((cell, i) => (
            <td key={i} className={styles.dataValueMobile}>
              {cell}
            </td>
          ))}
        </tr>
      ]))}
    </tbody>
  </table>
))
