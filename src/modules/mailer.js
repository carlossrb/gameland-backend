const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");

// criação de transporter de emails (utilizei o mailtrap)
const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

viewEngine = {
  extName: '.html',
  partialsDir: path.resolve("./src/resources/mails/"),
  layoutsDir: path.resolve("./src/resources/mails/"),
  defaultLayout: '',
}
transport.use(
  "compile",
  hbs({
    viewEngine,
    viewPath: path.resolve("./src/resources/mails/"),
    extName: ".html",
  })
);
module.exports = transport;
