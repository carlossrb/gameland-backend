const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Product = require("../models/product");
const User = require("../models/user");
const Rating = require("../models/rating");

router.use(authMiddleware);

//Sistema de avaliação (todos os usuários, inclusive o próprio produtor)
//Usuário avalia e é mostrada a media no produto
router.put("/:productId", async (req, res) => {
  const { body } = req; //stars, smilles, games

  try {
    const product = await Product.findById(req.params.productId);
    if (!product)
      return res.status(400).send({ error: "Produto não encontrado" });

    // Cria nova avaliação
    const rating = await Rating.create({
      productId: req.params.productId,
      ...body,
    });
    await User.findByIdAndUpdate(
      req.userId,
      { $push: { rating: rating } },
      { safe: true, upsert: true, new: true }
    ).then((e) => e);

    //user = await user.populate("rating").execPopulate();

    //Add nota ao produto no product schema

    product.ratinglength = body.ratinglength;
    product.stars = body.stars;
    product.smilles = body.smilles;
    product.games = body.games;

    product.save();
    return res.status(200).send();
  } catch (error) {
    return res.status(400).send({
      error: "Houve um problema ao realizar sua avaliação. Tente novamente",
    });
  }
});

module.exports = (app) => app.use("/rating", router);
