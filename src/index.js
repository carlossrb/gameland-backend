const express = require("express");
const bodyparser = require("body-parser");
const app = express();
require('dotenv/config');

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
// Habilitando CORS (middleware)
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header('Access-Control-Allow-Headers', 'Accept, Authorization, Content-Type, X-Requested-With, Range');
    if (req.method === 'OPTIONS') {
      return res.send(200);
    } else {
      return next();
    }
});

console.log("SERVER LIGADO NA PORTA", process.env.SERVER_PORT);

// Importa todos os controllers criados
require('./app/controllers')(app)

app.listen(process.env.SERVER_PORT);
