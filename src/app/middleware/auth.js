const jwt = require("jsonwebtoken");

//Verifica se o token do usuário é válido
module.exports = (req, res, next) => {
  //busca o header
  const authHeader = req.headers.authorization;

  // Verificação 1
  if (!authHeader)
    return res.status(401).send({ error: "Não há token informado" });

  // Verificação 2
  const parts = authHeader.split(" ");
  const [scheme, token] = parts;
  if (!(parts.length === 2))
    return res.status(401).send({ error: "Erro no token" });

  // Verificação 3
  if (!/^Bearer$/i.test(scheme))
    return res.status(401).send({ error: "Token mal formatado" });

  // Verificação final (caso necessite)
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).send({ error: "Token inválido" });
    req.userId = decoded.id;
    req.permission = decoded.permission
    return next();
  });
};
