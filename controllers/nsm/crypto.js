const NodeCache = require('node-cache');
const myCache = new NodeCache();

const  { getList } = require('../../middlewares/nsm/coingecko');

exports.getCryptos = async (req, res) => {
  const listCryptoCached = myCache.get("listCrypto");
  
  if(listCryptoCached) {
    console.log("Use crypto list cached");

    res.send(listCryptoCached);
  } else {
    const listCrypto = await getList();

    console.log("First request crypto list");

    myCache.set("listCrypto", listCrypto, 600000); // Cached for 1 week.

    res.send(listCrypto);
  }
};