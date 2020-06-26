const mongoose = require("../../dataBase");
const bcrypt = require("bcryptjs");
const { validateEmail } = require("../utils");

//Campos do banco para usuários
//Permission: 1 - Jogador, 2 - Admin, 3 - Produtor, 4 - Master
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  permission: {
    type: Number,
    required: true,
  },
  rating: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rating",
      select: false,
    },
  ],
  email: {
    type: String,
    unique: true,
    required: true,
    uppercase: true,
    validate: [validateEmail, "Por favor, utilize um email válido!"],
  },
  cnpj: {
    type: String,
    required: false,
  },
  registerDate: {
    type: Date,
    default: Date.now,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordDateExpires: {
    type: Date,
    select: false,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
});

// Encripta o password do usuário criado
userSchema.pre("save", async function (nextData) {
  const hash = await bcrypt.hash(this.password, 10);
  this.password = hash;
  nextData();
});

//Define model
const User = mongoose.model("User", userSchema);
module.exports = User;
