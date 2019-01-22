import axios from 'axios'

const errorResponse = (message = 'internal error', code = 500) => ({ statusCode: code, body: JSON.stringify({ message }) })
const successResponse = () => ({ statusCode: 204 })

exports.handler = async (event) => {
  const { SLACK_WEBHOOK_URL } = process.env
  if (!SLACK_WEBHOOK_URL) {
    console.error('slack build notification aborted: missing SLACK_WEBHOOK_URL env')
    return errorResponse('bad env')
  }
  const e = JSON.parse(event.body)
  console.log('event body', e)
  if (e.payload.context !== 'production') {
    console.log('slack build notification aborted: not production')
    return successResponse()
  }
  const commitHash = 'test06f4d21d68471c0f5e9efd3f90f8ce7eb8db70a9'
  const shortCommitHash = commitHash.slice(0,12)
  const deployVersion = '3.0.42-test'
  const buildLogUrl = 'https://app.netlify.com/sites/faast/deploys'
  const timeStamp = Date.now()
  try {
    const res = await axios({
      method: 'POST',
      url: SLACK_WEBHOOK_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        attachments: [{
          'mrkdwn_in': ['pretext'],
          'fallback': `${deployVersion} using git branch master, commit ${shortCommitHash}`,
          'color': '#36a64f',
          'pretext': 'Successful deploy of *faast*',
          'title': deployVersion,
          'title_link': 'https://faa.st',
          'text': `Or check out the <${buildLogUrl}|build log>`,
          'footer': `Using git branch master, commit <https://github.com/go-faast/faast-web/commit/${commitHash}|${shortCommitHash}>`,
          'ts': timeStamp,
        }]
      },
    })
    console.log('hook res', res)
    if (res.status === 200) {
      console.log('slack build notification success')
      return successResponse()
    } else {
      console.error('slack build notification failed with status ${res.status} ${res.statusText}')
      return errorResponse(res.statusText, res.statusCode)
    }
  } catch (err) {
    console.error('slack build notification failed to post', err)
    return errorResponse(err.message)
  }
}
