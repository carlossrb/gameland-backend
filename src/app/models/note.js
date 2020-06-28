const mongoose = require("../../dataBase");
//Campos do banco para novos produtos
const noteSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  note: {
    type: String,
    required: true,
  },
  reply: {
    type: String,
    required: false,
  },
  permission:{
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

//Define model
const Note = mongoose.model("Note", noteSchema);
module.exports = Note;
