import axios from 'axios'
import urlJoin from 'url-join'

const errorResponse = (message = 'internal error', code = 500) => ({ statusCode: code, body: JSON.stringify({ message }) })
const successResponse = () => ({ statusCode: 204 })
const round = (v, dp) => { const n = Math.pow(10, dp); return Math.round(v * n) / n }
const formatDuration = (seconds) => seconds > 60 ? `${round(seconds / 60, 1)}m` : `${seconds}s`

const PROD_URL = 'https://faa.st'
const ONLY_CONTEXT = 'production'

exports.handler = async (event) => {
  const { SLACK_WEBHOOK_URL } = process.env
  if (!SLACK_WEBHOOK_URL) {
    console.error('slack build notification aborted: missing SLACK_WEBHOOK_URL env')
    return errorResponse('bad env')
  }
  const e = JSON.parse(event.body)
  const { context } = e.payload
  if (ONLY_CONTEXT && context !== ONLY_CONTEXT) {
    console.log(`slack build notification aborted: not ${ONLY_CONTEXT}`)
    return successResponse()
  }
  const {
    commit_ref: commitRef, commit_url: commitUrl, published_at: publishedAtString,
    branch: deployBranch, title: deployTitle, admin_url: adminUrl, build_id: buildId,
    committer: commitAuthor, deploy_ssl_url: deployUrl, deploy_time: deployTime
  } = e.payload
  const shortCommitRef = commitRef.slice(0, 12)
  const buildLogUrl = urlJoin(adminUrl, 'deploys', buildId)
  const siteUrl = context === 'production' ? PROD_URL : deployUrl
  const deployEnv = context === 'production' ? context : deployBranch
  const deployTimeString = formatDuration(deployTime)
  const hookData = {
    text: `Successful deploy of *faast* to *${deployEnv}*`,
    attachments: [{
      'mrkdwn_in': ['text'],
      'fallback': `${deployTitle} using git branch ${deployBranch}, commit ${shortCommitRef} by ${commitAuthor}`,
      'color': '#36a64f',
      'title': deployTitle,
      'title_link': siteUrl,
      'text': `View on ${siteUrl}\nOr check out the <${buildLogUrl}|build log>\n_Deploy took ${deployTimeString}_`,
      'footer': `Using git branch ${deployBranch}, commit <${commitUrl}|${shortCommitRef}> by ${commitAuthor}`,
      'ts': Date.parse(publishedAtString) / 1000,
    }]
  }
  try {
    const res = await axios({
      method: 'POST',
      url: SLACK_WEBHOOK_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      data: hookData,
    })
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
