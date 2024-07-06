const express = require('express');
const cryptoRouter = express.Router();

const crypto = require('../../controllers/nsm/crypto');

cryptoRouter.get('/', crypto.getCryptos);
cryptoRouter.post('/historical-data', crypto.getHistoricalData);

module.exports = cryptoRouter;