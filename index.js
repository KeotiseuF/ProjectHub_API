const mongoose = require("mongoose");
require('dotenv').config();

const app1 = require('./app1'); // Piiquante
const app2 = require('./app2'); // Groupomania
const app3 = require('./app3'); // NSM

const port1 = process.env.PORT_1;
const port2 = process.env.PORT_2;
const port3 = process.env.PORT_3;
const MY_ID_MANGO_DB = process.env.ID_MANGO_DB; 
const MY_PASSWORD_MANGO_DB = process.env.PASSWORD_MANGO_DB;

mongoose.connect("mongodb+srv://" + MY_ID_MANGO_DB + ":" + MY_PASSWORD_MANGO_DB +"@cluster0.a40ry.mongodb.net/?retryWrites=true&w=majority", 
{ useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch((error) => console.error(error));

app1.listen(port1, () => console.log(`App listening on port ${port1}`));
app2.listen(port2, () => console.log(`App listening on port ${port2}`));
app3.listen(port3, () => console.log(`App listening on port ${port3}`));