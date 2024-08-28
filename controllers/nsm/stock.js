const NodeCache = require('node-cache');
const myCache = new NodeCache();

const  { getList } = require('../../middlewares/nsm/twelvedata');
const { articleNewYorkTimes } = require('../../middlewares/nsm/newYorkTimes');

exports.getStocks = async (req, res) => {
  const listStockCached = myCache.get("listStock");
  if(listStockCached) {
    console.log("Use stock list cached");

    res.send(listStockCached);
  } else {
    const listStock = await getList();
    const resizeList = [];

    listStock.data.forEach(list => resizeList.push({ name: list.name, symbol: list.symbol }));

    console.log("First request stock list");

    myCache.set("listStock", resizeList, 600000); // Cached for 1 week.

    res.send(resizeList);
  }
};

exports.getArticleNYTimes = async (req, res) => {
  const listArticle = await articleNewYorkTimes();
  const filteredListArticle = [];

  listArticle.results.forEach((article) => {
    filteredListArticle.push({
      title: article.title,
      url: article.url,
      source: article.source,
      first_published_date: article.first_published_date,
    })
  });

  console.log("Articles New York Times OK !");

  res.send(filteredListArticle);
};