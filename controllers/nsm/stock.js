const NodeCache = require('node-cache');
const myCache = new NodeCache();

const  { getList } = require('../../middlewares/nsm/twelvedata');

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