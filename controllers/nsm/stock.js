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
  const listArticleCached = myCache.get("listArticleNYTimes"); 

  if(listArticleCached) {
    console.log("Use NYTimes article cached");
  
    res.send(listArticleCached);
  } else {
    const listArticle = await articleNewYorkTimes();
  
    console.log("New request NYTimes article");
  
    myCache.set("listArticleNYTimes", listArticle, 300); // Cached for 5 minutes.
  
    res.send(listArticle);
  }
};