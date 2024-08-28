exports.articleNewYorkTimes = () => {
  return fetch(`https://api.nytimes.com/svc/news/v3/content/all/business.json?limit=${process.env.NB_ARTICLE_NY_TIMES_API}&api-key=${process.env.NY_TIMES_API}`)
  .then((articleList) => articleList.json())
  .then((articleList) => articleList)
}