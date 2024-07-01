const mongoose = require("mongoose");
const https = require('https');
const fs = require('fs');

const app1 = require('./app1'); // Piiquante
const app2 = require('./app2'); // Groupomania
const app3 = require('./app3'); // NSM
const { Builder, By } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const port1 = process.env.PORT_1;
const port2 = process.env.PORT_2;
const port3 = process.env.PORT_3;
const MY_ID_MANGO_DB = process.env.ID_MANGO_DB;
const MY_PASSWORD_MANGO_DB = process.env.PASSWORD_MANGO_DB;
const KEY_CERTIF = process.env.KEY_CERTIF;
const CERTIF = process.env.CERTIF;

const checkIsProd = process.env.PROD === 'true';
let options = undefined;

if (checkIsProd) {
  options = {
    key: fs.readFileSync(KEY_CERTIF),
    cert: fs.readFileSync(CERTIF),
  };
}

mongoose.connect("mongodb+srv://" + MY_ID_MANGO_DB + ":" + MY_PASSWORD_MANGO_DB +"@cluster0.a40ry.mongodb.net/?retryWrites=true&w=majority", 
{ useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch((error) => console.error(error));

if (checkIsProd) {
  https.createServer(options, app1).listen(port1, async () => {
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

    try {
      await driver.get('https://www.coingecko.com/en/coins/bitcoin/historical_data?start=2024-05-02&end=2024-05-02');

      const test = await driver.findElements(By.css('td'));
      test.forEach(async (e, id) => {
        console.log(await e.getText());
        if(id === 4) await driver.quit();
      });
    } catch {
      console.error('ERROR Historical data');
    }
    console.log(`Prod listening on port ${port1}`)
  });
  https.createServer(options, app2).listen(port2, () => console.log(`Prod listening on port ${port2}`));
  https.createServer(options, app3).listen(port3, () => console.log(`Prod listening on port ${port3}`));
} else {
  app1.listen(port1, () => console.log(`Local listening on port ${port1}`));
  app2.listen(port2, () => console.log(`Local listening on port ${port2}`));
  app3.listen(port3, () => console.log(`Local listening on port ${port3}`));
}