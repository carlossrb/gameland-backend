const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Product = require("../models/product");
// após a verificação do token no middleware. Todas essas rotas estão protegidas pela autenticação

router.use(authMiddleware);

// Listagem de produtos (todos os usuários) com filtros aplicados caso existam
router.post("/list", async (req, res) => {
  const { search, category, platform } = req.body.activeFilter;
  let body = {};
  if (search) body.title = { $regex: "^" + search + "$", $options: "i" };
  if (category.length > 0) body.category = { $in: category };
  if (platform.length > 0) body.platforms = { $in: platform };

  try {
    let products = await Product.find(body).populate({
      path : 'user'
      // populate : {
      //   path : 'rating'
      // }
    });
    if (!products)
      return res.status(400).send({
        error: "Houve um problema ao listar os jogos. Tente novamente",
      });
    return res.status(200).send({ products });
  } catch (error) {
    return res.status(400).send({
      error: "Houve um problema ao listar os jogos. Tente novamente",
    });
  }
});

// Criação de algum produto (PRODUCER ou MASTER)
router.post("/", async (req, res) => {
  try {
    if (
      parseInt(req.permission) !== parseInt(process.env.PRODUCER) &&
      parseInt(req.permission) !== parseInt(process.env.MASTER)
    )
      return res
        .status(400)
        .send({ error: "Você não possui permissão para isso!" });

    let product = await Product.create({ ...req.body, user: req.userId });
    if (!product)
      return res.status(400).send({
        error:
          "Houve um problema ao inserir o jogo na base de dados. Tente novamente",
      });
    return res.status(200).send();
  } catch (error) {
    return res.status(400).send({
      error:
        "Houve um problema ao inserir o jogo na base de dados. Tente novamente",
    });
  }
});

// Atualização de dados do cartão
router.put("/update/:productId", async (req, res) => {
  try {
    if (
      parseInt(req.permission) !== parseInt(process.env.PRODUCER) &&
      parseInt(req.permission) !== parseInt(process.env.MASTER)
    )
      return res
        .status(400)
        .send({ error: "Você não possui permissão para isso!" });

    return await Product.findOneAndUpdate(
      {
        $and: [{ _id: req.params.productId }, { user: req.userId }],
      },
      {
        $set: {
          ...req.body,
          user: req.userId,
        },
      }
    ).then((response) => {
      if (response) return res.status(200).send({ success: "Tudo Ok!" });
      return res.status(400).send({
        error: "Houve um problema ao listar os jogos. Tente novamente",
      });
    });
  } catch (error) {
    return res.status(400).send({
      error: "Houve um problema ao listar os jogos. Tente novamente",
    });
  }
});

// Deleta um produto específico (MASTER, PRODUCER, ADMIN)
// MASTER e ADMIN todos os produtos;
// PRODUCER apenas os seus jogos
router.delete("/:productId", async (req, res) => {
  try {
    if (
      parseInt(req.permission) === parseInt(process.env.MASTER) ||
      parseInt(req.permission) === parseInt(process.env.ADMIN)
    )
      return await Product.findByIdAndDelete(req.params.productId).then(
        (response) => {
          if (response)
            return res
              .status(200)
              .send({ success: "Jogo excluído com sucesso!" });
          return res
            .status(400)
            .send({ error: "Jogo já foi excluído anteriormente!" });
        }
      );
    else if (parseInt(req.permission) === parseInt(process.env.PRODUCER)) {
      return await Product.findByIdAndDelete({
        _id: req.params.productId,
        user: req.userId,
      }).then((response) => {
        if (response)
          return res
            .status(200)
            .send({ success: "Jogo excluído com sucesso!" });
        return res
          .status(400)
          .send({ error: "Jogo já foi excluído anteriormente!" });
      });
    }
    return res
      .status(400)
      .send({ error: "Você não possui permissão para isso!" });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      error: "Houve um problema ao deletar o jogo. Tente novamente",
    });
  }
});


module.exports = (app) => app.use("/product", router);
