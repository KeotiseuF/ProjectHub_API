const express = require('express');
const cors = require('cors');
const path = require("path");

const userRoutes = require("./routes/groupomania/user");
const postRoutes = require("./routes/groupomania/post");

const app2 = express();
const corsOptions = {
  origin: [process.env.ORIGIN_APP_2]
}

app2.use(cors(corsOptions), express.json());

app2.use(express.urlencoded({ extended: true }));

app2.use('/api_2/auth', userRoutes);
app2.use('/api_2/posts', postRoutes);
app2.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app2;