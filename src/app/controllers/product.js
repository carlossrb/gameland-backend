const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Product = require("../models/product");
//const Task = require("../models/thread");

// após a verificação do token no middleware. Todas essas rotas estão protegidas pela autenticação

router.use(authMiddleware);

// Listagem de produtos (todos os usuários)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("user");
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

// Listagem de produto específico (todos os usuários)
router.get("/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).populate(
      "user"
    );
    if (!product)
      return res.status(400).send({
        error: "Houve um problema ao listar o jogo. Tente novamente",
      });
    return res.status(200).send({ product });
  } catch (error) {
    return res.status(400).send({
      error: "Houve um problema ao listar o jogo. Tente novamente",
    });
  }
});

// Criação de algum produto (PRODUCER ou MASTER)
router.post("/", async (req, res) => {
  try {
    if (
      req.permission !== process.env.PRODUCER ||
      req.permission !== process.env.MASTER
    )
      res.status(403).send({ error: "Você não possui permissão para isso!" });

    const product = await Product.create({ ...req.body, user: req.userId });

    if (!product)
      res.status(400).send({
        error:
          "Houve um problema ao inserir o jogo na base de dados. Tente novamente",
      });
    return res.status(200).send({ product });
  } catch (error) {
    return res.status(400).send({
      error:
        "Houve um problema ao inserir o jogo na base de dados. Tente novamente",
    });
  }
});

// Deleta um produto específico (MASTER, PRODUCER, ADMIN)
// MASTER e ADMIN todos os produtos;
// PRODUCER apenas os seus jogos
router.delete("/:productId", async (req, res) => {
  try {
    if (
      req.permission === process.env.MASTER ||
      req.permission === process.env.ADMIN
    )
      await Product.findByIdAndDelete(req.params.productId).then(() =>
        res.status(200).send()
      );
    else if (req.permission === process.env.PRODUCER) {
      await Product.findByIdAndDelete({
        id: req.params.productId,
        user: req.userId,
      }).then(() => res.status(200).send());
    }
    res.status(403).send({ error: "Você não possui permissão para isso!" });
  } catch (error) {
    return res.status(400).send({
      error: "Houve um problema ao deletar o jogo. Tente novamente",
    });
  }
});

//Filtros por produtor, plataforma, categoria (todos)
// Listagem de produtos (todos os usuários)
router.get("/filter", async (req, res) => {
  const { user, _id, category, platforms } = req.body; //user - obj usuário , _id - id do produto
  try {
    const products = await Product.findOne({
      user,
      _id,
      category,
      platforms,
    });
    if (!products)
      return res.status(400).send({
        error: "Nenhum jogo a ser listado com esses filtros",
      });
    return res.status(200).send({ products });
  } catch (error) {
    return res.status(400).send({
      error: "Houve um problema ao filtrar os jogos. Tente novamente",
    });
  }
});

//Sistema de avaliação (USERPLAYER, ADMIN)
//Usuário avalia e é mostrada a media no produto
router.put("/:productId", async (req, res) => {
  const { value } = req.body;

  try {
    if (
      req.permission === process.env.USERPLAYER ||
      req.permission === process.env.ADMIN
    ) {
      const product = await Product.findById(req.params.productId);
      if (!product)
        return res.status(400).send({ error: "Produto não encontrado" });

      product.stars.push(value);
      product.save();
      return res.send();
    }
    return res.status(400).send({ error: "Produto não encontrado" });
  } catch (error) {}
});

module.exports = (app) => app.use("/product", router);
