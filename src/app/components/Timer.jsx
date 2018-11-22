import React from 'react'
import { compose, setDisplayName, setPropTypes, lifecycle, defaultProps, withHandlers, withState } from 'recompose'
import { secondsToTime } from 'Utilities/convert'
import PropTypes from 'prop-types'

const TimerComponent = ({ secondsLeft, label, className, style }) => {
  var { hours, minutes, seconds } = secondsToTime(secondsLeft)
  //if hours == 0 don't show
  var hourSection = hours == 0 ? '' : `${hours}:`
  return (
    <span className={className} style={style}>{label} {hourSection}{minutes}:{seconds}</span>
  )
}

export default compose(
  setDisplayName('Timer'),
  setPropTypes({
    seconds: PropTypes.number, // timer starting seconds
    label: PropTypes.node, // something to place before timer text
    onTimerEnd: PropTypes.func, // callback to call when timer reaches 0
  }),
  defaultProps({
    seconds: 0,
    label: '',
    onTimerEnd: () => {},
  }),
  withState('secondsLeft', 'setSecondsLeft', ({ seconds }) => seconds),
  withState('timer', 'setTimer', null),
  withHandlers({
    /** Decrement the timer */
    countDown: ({ secondsLeft, setSecondsLeft, onTimerEnd, timer }) => () => {
      if (secondsLeft > 0) {
        setSecondsLeft(secondsLeft - 1)
      } else {
        clearInterval(timer)
        onTimerEnd()
      }
    }
  }),
  // second withHandlers gives access to countDown through props
  withHandlers({
    /** Reset the timer to seconds */
    startTimer: ({ setSecondsLeft, countDown, onTimerEnd, setTimer, timer }) => (seconds) => {
      clearInterval(timer)
      if (seconds > 0) {
        setSecondsLeft(seconds)
        setTimer(setInterval(countDown, 1000))
      } else {
        onTimerEnd()
      }
    }
  }),
  lifecycle({
    componentDidMount() {
      var { seconds, startTimer } = this.props
      startTimer(seconds)
    },
    componentWillReceiveProps(nextProps) {
      var { seconds, startTimer } = this.props
      if (seconds !== nextProps.seconds) {
        startTimer(nextProps.seconds)
      }
    },
    componentWillUnmount() {
      var { timer } = this.props
      clearInterval(timer)
    }
  }),
)(TimerComponent)
