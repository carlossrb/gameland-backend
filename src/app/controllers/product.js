const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Product = require("../models/product");
//const Task = require("../models/thread");

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
    const products = await Product.find(body).populate("user");
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

// Faz um filtro com a busca (todos os usuários)
router.post("/search", async (req, res) => {
  const { search } = req.body;
  try {
    const products = await Product.findOne({
      $or: [
        { title: { $regex: "^" + search + "$", $options: "i" } },
        { description: { $regex: "^" + search + "$", $options: "i" } },
      ],
    }).populate("user");

    if (!products)
      return res.status(400).send({
        error: "Não há nenhum produto com este nome",
      });

    return res.status(200).send({ products: [products] });
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      error: "Houve um problema ao realizar a busca. Tente novamente",
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
