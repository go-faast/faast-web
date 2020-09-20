import React, { Fragment } from 'react'
import { compose, setDisplayName, lifecycle } from 'recompose'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { Table, Card, CardHeader, CardBody } from 'reactstrap'
import { timeSince } from 'Utilities/display'
import Link from 'Components/Link'
import { isNewsLoading, getNewsArticlesBySymbols } from 'Selectors/news'
import { fetchNews } from 'Actions/news'

const findSourceOfArticle = (article) => {
  let props = {
    icon: 'link',
    bgColor: '#6c7a86'
  }
  if (!article) {
    return props
  }
  if (article.source.domain === 'twitter.com') {
    props.icon = 'twitter'
    props.bgColor = '#1DA1F2'
  } else if (article.source.domain === 'reddit.com') {
    props.icon = 'reddit-alien'
    props.bgColor = '#FF5700'
  } 
  return props
}

const ArticleRow = ({ article }) => {
  const sourceDesign = findSourceOfArticle(article)
  return (
    <tr 
      className='cursor-pointer'
      tabIndex='0'
    >
      <td colSpan='auto'>
        <div 
          className='text-center ml-1 position-relative'
          style={{ height: 25, width: 25, borderRadius: '50%', top: 5, backgroundColor: sourceDesign.bgColor }}>
          <i className={`fa fa-${sourceDesign.icon}`} style={{ fontSize: 12 }} />
        </div>
      </td>
      <td style={{}}>
        <a href={article.url} className='d-block text-white' target='_blank noreferrer'>{article.title}</a>
        <p className='font-xxs m-0 p-0 text-muted'>
          ({article.source.domain}) - <a className='font-xxs text-muted' href={article.url} target='_blank noreferrer'>Discuss on cryptopanic</a>  -  <span className='font-xxs text-muted'>{timeSince(new Date(article.published_at).getTime())}</span>
        </p>
      </td>
      <td className='text-right mr-2' style={{ maxWidth: 90 }}>
        <div className='pr-2'>
          {article && article.currencies && article.currencies.slice(0,4).map((c,i) => {
            return (
              <Link style={{ whiteSpace: 'nowrap' }} className={`font-xs ${i !== article.currencies.length - 1 && (i + 1) % 2 !== 0 && 'mb-1'}`} key={c.code} to={`/assets/${c.code}`}>{c.code} </Link>
            )
          })}
        </div>
      </td>
    </tr>
  )
}

const NewsTable = ({ articles, cardTitle, articlesLoading, size = 'lg', maxHeight }) => {
  return (
    <Fragment>
      <Card className='mt-3 pb-0'>
        <CardHeader className='border-bottom-0'>
          <h5>{cardTitle || 'Latest Crypto News'}</h5>
        </CardHeader>
        <CardBody style={{ maxHeight: size == 'lg' ? '100%' : maxHeight ? maxHeight : 275, overflowY: 'scroll' }} className='p-0 m-0'>
          {articlesLoading ? (
            <span className='py-4 text-center d-block'>
              <i className='fa fa-spinner fa-pulse'/>
            </span>
          ) : articles && articles.length === 0 && !articlesLoading ? (
            <p className='text-center mt-3'>
              <i>No news to show</i>
            </p>
          ) : (
            <Table className='mb-0'  hover striped responsive>
              <thead>
              </thead>
              <tbody>
                {articles && articles.map(article => (
                  <ArticleRow key={article.id} article={article} />)
                )}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </Fragment>
  )
}

export default compose(
  setDisplayName('NewsTable'),
  connect(createStructuredSelector({
    articlesLoading: isNewsLoading,
    articles: (state, { symbols }) => getNewsArticlesBySymbols(state, symbols)
  }), {
    fetchNews
  }),
  lifecycle({
    componentDidMount() {
      const { fetchNews, symbols } = this.props
      fetchNews(symbols)
    },
    componentDidUpdate(prevProps) {
      const { symbols, fetchNews } = this.props
      if (JSON.stringify(symbols) !== JSON.stringify(prevProps.symbols)) {
        fetchNews(symbols)
      }
    }
  })
)(NewsTable)