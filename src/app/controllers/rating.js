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
    //const user = await User.findById(req.userId)
    let product = await Product.findById(req.params.productId);

    if (!product)
      return res.status(400).send({ error: "Produto não encontrado" });

    // remove avaliação se usuário já tiver avaliado produto
    await Rating.deleteMany({
      $and: [{ userId: req.userId }, { productId: req.params.productId }],
    });

    // cria nova avaliação
    const rating = await Rating.create({
      productId: req.params.productId,
      userId: req.userId,
      ...body,
    });
    //insere no user scheme
    await User.findByIdAndUpdate(
      req.userId,
      { $push: { rating: rating } },
      { safe: true, upsert: true, new: true }
    ).then((e) => e);

    let productsAverage = await Rating.aggregate([
      {
        $group: {
          _id: "$productId",
          avgstars: { $avg: "$stars" },
          avgsmilles: { $avg: "$smilles" },
          avggames: { $avg: "$games" },
          totalAmount: { $sum: "$stars" },
        },
      },
    ]);
    //média filtrada por produto
    productsAverage = productsAverage.filter(
      (e) => e._id == req.params.productId
    );
    if (productsAverage.length === 0)
      return res.status(400).send({ error: "Produto não encontrado" });

    //Add nota ao produto no product schema

    product.ratinglength = parseInt(
      productsAverage[0].totalAmount / productsAverage[0].avgstars || 0
    );
    product.stars = productsAverage[0].avgstars;
    product.smilles = productsAverage[0].avgsmilles;
    product.games = productsAverage[0].avggames;

    // faz a união com usuário e avaliações
    product = await product
      .populate({
        path: "user",
      })
      .execPopulate();

    product.save();
    return res.status(200).send({ product });
  } catch (error) {
    return res.status(400).send({
      error: "Houve um problema ao realizar sua avaliação. Tente novamente",
    });
  }
});

const sum = (array, type) => array.reduce((a, b) => a[type] + b[type], 0);

module.exports = (app) => app.use("/rating", router);
