const mongoose = require("mongoose");

// conecta ao mongoDB
mongoose
  .connect(process.env.DB_CONNECT + process.env.DATABASE_NAME, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then((response) => {
    console.log("CONECTADO AO BANCO", process.env.DATABASE_NAME, response);
  })
  .catch((error) => {
    console.log("ERRO AO CONECTAR AO BANCO", process.env.DATABASE_NAME, error);
  });

mongoose.Promise = global.Promise;

module.exports = mongoose;
