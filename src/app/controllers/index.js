const fs = require("fs");
const path = require("path");

// Fazer a inclusão de todas as rotas automaticamente no index, sem ter que requerir uma por uma
module.exports = (app) => {
  fs.readdirSync(__dirname)
    .filter((file) => file.indexOf(".") !== 0 && file !== "index.js")
    .forEach((file) => require(path.resolve(__dirname, file))(app));
};
