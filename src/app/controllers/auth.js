const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const mailer = require("../../modules/mailer");
const { generateToken } = require("../utils");
const User = require("../models/user");
const authMiddleware = require("../middleware/auth");

// Definição das rotas pelo express
const router = express.Router();

/**
 * Rota principal de cadastro (cadastra e faz login)
 */
router.post("/register", async (req, res) => {
  const { checked } = req.body;

  const data = {
    permission: checked
      ? parseInt(process.env.PRODUCER)
      : parseInt(process.env.USERPLAYER),
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    cnpj: checked ? req.body.cnpj : null,
  };

  const { email, cnpj, username } = data;
  try {
    // Verifica se já existe o email ou o usuário antes de criar o cadastro
    if ((await User.findOne({ email })) || email === process.env.MASTER_LOGIN)
      return res.status(400).send({ error: "Email já cadastrado!" });

    if (
      (await User.findOne({
        username: { $regex: "^" + username + "$", $options: "i" },
      })) ||
      email === process.env.MASTER_LOGIN
    )
      return res.status(400).send({ error: "Username já cadastrado!" });
    // CNPJ ou CPF já existente
    if ((await User.findOne({ cnpj })) && cnpj)
      return res
        .status(400)
        .send({ error: "CNPJ/CPF já cadastrado no sistema" });
    if (!email || (!cnpj && checked) || !username)
      return res
        .status(400)
        .send({ error: "Dados insuficientes para realizar o cadastro" });
    // cria novo usuário
    let user = await User.create(data);
    user = await user.populate("rating").execPopulate()

    // apaga senha no retorno
    user.password = undefined;
    // Token jwt com permissões e id do usuário
    return res.send({ user, token: generateToken(user.id, user.permission) });
  } catch (err) {
    console.log(err);
    return res.status(400).send(err.message);
  }
});

/**
 * Faz a autenticação do usuário para acessar o sistema
 */
router.post("/validate", async (req, res) => {
  const { email, password } = req.body;

  //Caso seja o user master
  if (
    email.toUpperCase() === process.env.MASTER_LOGIN.toUpperCase() &&
    password.toUpperCase() === process.env.SENHA.toUpperCase()
  )
    return res.send({
      user: {
        username: process.env.MASTER_LOGIN.toUpperCase(),
        email: process.env.MASTER_LOGIN.toUpperCase(),
        permission: parseInt(process.env.MASTER),
        _id:process.env.ID_MASTER
      },
      token: generateToken(process.env.ID_MASTER, parseInt(process.env.MASTER)),
    });

  const user = await User.findOne({
    $or: [
      { email: email },
      { username: { $regex: "^" + email + "$", $options: "i" } },
    ],
  }).select("+password").populate('rating');

  if (!user) return res.status(400).send({ error: "Usuário não encontrado" });

  // Verifica se e senha está correta
  if (!(await bcrypt.compare(password, user.password)))
    return res
      .status(400)
      .send({ error: "Senha não confere com a senha do usuário" });

  user.password = undefined;
  return res.send({ user, token: generateToken(user.id, user.permission) });
});

/**
 * Confere o token se válido de params e retorna email
 */
router.get("/reset/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordDateExpires: { $gt: new Date() },
    });

    if (!user)
      return res.status(400).send({ error: "Token inválido ou expirado" });

    return res.status(200).send({ email: user.email });
  } catch (err) {
    return res
      .status(400)
      .send({ error: "Houve um problema ao validar o link" });
  }
});

/**
 * Caso o usuário tenha esquecido a senha, envia email
 */
router.post("/forgot_password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(400)
        .send({ error: "Usuário não possui cadastro ativo" });

    //geração de token para redefinição de senha
    const token = crypto.randomBytes(15).toString("hex");
    //data de expiração do token (1 hora)
    const expired = new Date();
    expired.setHours(expired.getHours() + 1);

    // update no user com token e data de expiração
    await User.findByIdAndUpdate(user.id, {
      $set: {
        passwordResetToken: token,
        passwordDateExpires: expired,
      },
    });

    // Envia email de recuperação de senha
    mailer.sendMail(
      {
        to: email,
        from: "game@land.com.br",
        template: "password-reset",
        context: {
          link: process.env.MAIN_ADDRESS + "reset/" + token, // Modificar para fazer geração de link e redirecionamento para a tela de cadastro
          username: user.username,
        },
      },
      (err) => {
        if (err)
          return res
            .status(400)
            .send({ error: "Erro ao enviar email de recuperação" });
        return res.status(200).send({ success: "Email enviado com sucesso!" });
      }
    );
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ error: "Erro ao redefinir sua senha. Tente novamente!" });
  }
});

/**
 * Troca a senha do usuário após confirmação com o link enviado e faz login no sistema
 */
router.post("/reset_password", async (req, res) => {
  const { email, newPassword, token } = req.body;
  try {
    const user = await User.findOne({
      email,
      passwordResetToken: token,
      passwordDateExpires: { $gt: new Date() },
    });
    if (!user)
      return res.status(400).send({ error: "Token inválido ou expirado" });

    user.password = newPassword;
    user.save();
    return res.send({
      user: {
        id: user.id,
        email: user.email,
        cnpj: user.cnpj,
        registerDate: user.registerDate,
        username: user.username,
        permission: user.permission,
      },
      token: generateToken(user.id, user.permission),
    });
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({ error: "Informações incompatíveis, tente novamente" });
  }
});

/**
 * Verifica usuário e direciona a rota do frontend
 */
router.get("/check", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('rating');
    if (!user)
      return res
        .status(400)
        .send({ error: "Usuário inexistente. Erro de autenticação" });
    return res.send({ user, token: generateToken(user.id, user.permission) });
  } catch (err) {
    return res.status(400).send({ error: "Erro na autenticação" });
  }
});

/**
 * Concede acesso de admin para jogador
 */
router.put("/admin", authMiddleware, async (req, res) => {
  const { email } = req.body;
  try {
    if (req.permission === parseInt(process.env.MASTER))
      return await User.findOneAndUpdate(
        { email, permission: parseInt(process.env.USERPLAYER) },
        {
          $set: {
            permission: parseInt(process.env.ADMIN),
          },
        }
      ).then((response) => {
        if (response) return res.send({ success: "Permissão concedida!" });
        else
          return res
            .status(400)
            .send({ error: "Erro no processo de concessão permissões" });
      });
    else
      return res
        .status(400)
        .send({ error: "Você não tem permissão para executar essa tarefa" });
  } catch (err) {
    return res
      .status(400)
      .send({ error: "Erro no processo de concessão permissões" });
  }
});

module.exports = (app) => app.use("/auth", router);
