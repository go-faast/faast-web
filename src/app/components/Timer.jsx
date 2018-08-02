import React from 'react'
import { compose, setDisplayName, setPropTypes, lifecycle, defaultProps, withHandlers, withState } from 'recompose'
import { secondsToTime } from 'Utilities/convert'
import PropTypes from 'prop-types'

const TimerComponent = ({ timerCount, label }) => {
  var { hours, minutes, seconds } = secondsToTime(timerCount)
  //if hours == 0 don't show
  var hourSection = hours == 0 ? '' : `${hours}:`
  return (
    <span>{label} {hourSection}{minutes}:{seconds}</span>
  )
}

export default compose(
    setDisplayName('Timer'),
    setPropTypes({
      secondsInput: PropTypes.number,
      label: PropTypes.string,
      onTimerEnd: PropTypes.func
    }),
    withState('timerCount', 'setSecondsLeft', ({ secondsInput }) => secondsInput),
    withState('timer', 'setTimer', null),
    withHandlers({
      countDown: ({ timerCount, setSecondsLeft }) => () => {
        let secondsRemaining = timerCount - 1
        setSecondsLeft(secondsRemaining)
      }
    }),
    //second withHandlers gives access to countDown through props
    withHandlers({
      startTimer: ({ countDown, timerCount, onTimerEnd, setTimer, timer }) => () => {
        clearInterval(timer)
        if (timerCount > 0) {
          setTimer(setInterval(countDown, 1000))
        } else {
          onTimerEnd()
        }
      }
    }),
    defaultProps({
      secondsInput: 0,
      label: '',
      onTimerEnd: () => {}
    }),
    lifecycle({
      componentDidMount() {
        var { secondsInput, setSecondsLeft, startTimer } = this.props
        setSecondsLeft(secondsInput)
        startTimer()
      },
      componentWillReceiveProps(nextProps) {
        var { timerCount, startTimer } = this.props
        if (timerCount !== nextProps.timerCount) {
          startTimer()
        }
      }
    }),
  )(TimerComponent)