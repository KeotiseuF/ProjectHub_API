const NodeCache = require('node-cache');
const myCache = new NodeCache();
const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

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

exports.getHistoricalData = async (req, res) => {
  const data = req.body;
  const cryptos = data.cryptos;
  const options = new chrome.Options();
  let isAborted = false;

  req.socket.on('close', () => {
    isAborted = true;
  })

  options.addArguments('--headless');
  options.addArguments('--disable-gpu'); // Applicable only for Windows OS
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  options.addArguments('accept-language=en-US,en;q=0.9');
  options.addArguments('window-size=1920,1080');
  options.addArguments('--disable-blink-features=AutomationControlled');

  const driver = await new Builder()
  .forBrowser('chrome')
  .setChromeOptions(options)
  .build();

  for(const crypto of cryptos) {
    try {
      const idCrypto = Number(crypto.id.split('-')[1]);

      if(isAborted) {
        console.log('Session Chrome aborted');
        await driver.quit();
        return;
      };
      let asset = crypto.name.split('/')[0].toLowerCase().trim();
      if(asset.includes(' ')) asset = asset.replaceAll(' ', '-');
      if(asset.includes('.')) asset = asset.replaceAll('.', '-');
      await driver.get(`https://www.coingecko.com/en/coins/${asset}/historical_data?start=${crypto.date}&end=${crypto.date}`);
      const lineData = await driver.findElements(By.css('td'));
      const isLast = cryptos.length === idCrypto + 1;

      if(await lineData[3]?.getText() && !isLast) {
        cryptos[idCrypto].buyPrice = await lineData[3].getText();
      } else if(isLast) {
        if(await lineData[3]?.getText()) cryptos[idCrypto].buyPrice = await lineData[3].getText();
        else cryptos[idCrypto].buyPrice = '';

        await driver.quit();
        data.cryptos = cryptos;
        console.log('Historical data OK !');
        return res.send(data);
      } else {
        cryptos[idCrypto].buyPrice = '';
      }; 
    } catch(e) {
      console.error('Error with Coingecko: ' + e);
      res.status(418).end('Error getting historical crypto');
    }
  }
};