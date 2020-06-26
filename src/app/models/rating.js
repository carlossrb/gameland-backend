const mongoose = require("../../dataBase");

// Insere id do produto e notas atribuídas a ele pelo usuário
const RatingSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  smilles: {
    type: Number,
    required: true,
  },
  stars: {
    type: Number,
    required: true,
  },
  games: {
    type: Number,
    required: true,
  },
});

// Define model
const Rating = mongoose.model("Rating", RatingSchema);
module.exports = Rating;
