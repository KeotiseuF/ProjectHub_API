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
  let data = req.body;
  const cryptos = data.cryptos;

  let options = new chrome.Options();

  options.addArguments('--headless');
  options.addArguments('--disable-gpu'); // Applicable only for Windows OS
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  options.addArguments('accept-language=en-US,en;q=0.9');
  options.addArguments('window-size=1920,1080');
  options.addArguments('--disable-blink-features=AutomationControlled');

  let driver = await new Builder()
  .forBrowser('chrome')
  .setChromeOptions(options)
  .build();

  cryptos.forEach((crypto, idCrypto) => {
    setTimeout(async () => {
      let asset = crypto.name.split('/')[0].toLowerCase().trim();
      if(asset.includes(' ')) asset = asset.replaceAll(' ', '-');

      try {
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
      } catch {
        console.error('ERROR Historical data');
      }
    }, (idCrypto + 1) * 2000)
  })
};