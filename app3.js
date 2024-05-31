const express = require('express');
const cors = require('cors');

const stockRoutes = require("./routes/nsm/stock");
const cryptoRoutes = require("./routes/nsm/crypto");
const excelRoutes = require("./routes/nsm/excel");

const app3 = express();
const corsOptions = {
  origin: [process.env.ORIGIN_APP_3]
}
app3.use(cors(corsOptions), express.json());

app3.use(express.urlencoded({ extended: true }));

app3.use('/api_3/stock', stockRoutes);
app3.use('/api_3/crypto', cryptoRoutes);
app3.use('/api_3/excel', excelRoutes);

module.exports = app3;