const mongoose = require("../../dataBase");
//Campos do banco para novos produtos
const productSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // thread: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "thread",
  // }],
  description: {
    type: String,
    required: false,
  },
  stars:{
    type: [Number],
    required: false
  },
  title: {
    type: String,
    required: true,
    uppercase: true,
  },
  category: {
    type: [String],
    required: true,
  },
  platforms: {
    type: [String],
    required: true,
  },
  registerDate: {
    type: Date,
    default: Date.now,
  },
  img: {
    type: String,
    required: true,
  },
});

//Define model
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
