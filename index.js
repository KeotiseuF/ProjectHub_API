const mongoose = require("mongoose");
const https = require('https');
const fs = require('fs');
const { RateLimiter } = require('limiter');

const app1 = require('./app1'); // Piiquante
const app2 = require('./app2'); // Groupomania
const app3 = require('./app3'); // NSM

const port1 = process.env.PORT_1;
const port2 = process.env.PORT_2;
const port3 = process.env.PORT_3;
const MY_ID_MANGO_DB = process.env.ID_MANGO_DB;
const MY_PASSWORD_MANGO_DB = process.env.PASSWORD_MANGO_DB;
const KEY_CERTIF = process.env.KEY_CERTIF;
const CERTIF = process.env.CERTIF;

const checkIsProd = process.env.PROD === 'true';
let options = undefined;

const limiter = new RateLimiter({
  tokensPerInterval: 250,
  interval: "hour",
  fireImmediately: true
});

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

const requestHandler = async (request, response, next) => {
  const remainingRequests = await limiter.removeTokens(1);
  if (remainingRequests < 0) {
    console.error('Too requests the user is limited');
    response.status(429).end('Too Many Requests - your IP is being rate limited');
  } else next();
}

app1.use(requestHandler);
app2.use(requestHandler);
app3.use(requestHandler);

if (checkIsProd) {
  https.createServer(options, app1).listen(port1, () => console.log(`Prod listening on port ${port1}`));
  https.createServer(options, app2).listen(port2, () => console.log(`Prod listening on port ${port2}`));
  https.createServer(options, app3).listen(port3, () => console.log(`Prod listening on port ${port3}`));
} else {
  app1.listen(port1, () => console.log(`Local listening on port ${port1}`));
  app2.listen(port2, () => console.log(`Local listening on port ${port2}`));
  app3.listen(port3, () => console.log(`Local listening on port ${port3}`));
}