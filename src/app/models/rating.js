const mongoose = require("../../dataBase");

// Insere id do produto e notas atribuídas a ele pelo usuário
const RatingSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  smilles: {
    type: Number,
    required: true,
    default: 0
  },
  stars: {
    type: Number,
    required: true,
    default: 0
  },
  games: {
    type: Number,
    required: true,
    default: 0
  },
});

// Define model
const Rating = mongoose.model("Rating", RatingSchema);
module.exports = Rating;
