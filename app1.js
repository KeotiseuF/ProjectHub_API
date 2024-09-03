const express = require('express');
const cors = require('cors');
const path = require("path");
const requestHandler = require("./middlewares/limiter");

const userRoutes = require("./routes/piiquante/user");
const sauceRoutes = require("./routes/piiquante/sauce");

const app1 = express();
const corsOptions = {
  origin: [process.env.ORIGIN_APP_1]
}

app1.use(cors(corsOptions), express.json());
app1.use(requestHandler);
app1.use(express.urlencoded({ extended: true }));

app1.use('/api_1/auth', userRoutes);
app1.use('/api_1/sauces', sauceRoutes);
app1.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app1;