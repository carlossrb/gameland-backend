const jwt = require("jsonwebtoken");


/**
 * Validar email schema
 * @param {*} email
 */
const validateEmail = (email) => {
  const reg = /^\w+([.-]\w+)*@\w+([.-]\w+)*\.\w{1,}$/;
  return reg.test(email);
};

/**
 * Criação de token com criptografia jwt
 * @param {String} id id buscado do usuário
 * @param {1|2|3|4} permission permissão
 */
const generateToken = (id,permission) => {
  return jwt.sign({ id, permission }, process.env.SECRET_KEY, {
    expiresIn: 86400, //1 dia para expirar
  });
};

module.exports = {
  validateEmail,
  generateToken,
};
