const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Product = require("../models/product");
const User = require("../models/user");
const Note = require("../models/note");

router.use(authMiddleware);

/**
 * Sistema para inserção de comentário para determinado produto de um produtor
 * O mesmo usuário não pode responder seu prórpio comentário
 * Admin/master e produtor pode apagar comentário
 * Apenas o produtor pode responder sobre seu produto
 * Todos podem ler os comentários
 */

/**
 * Lista todos os comentários para produto específico
 */
router.get("/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product)
      return res.status(400).send({ error: "Produto não encontrado" });

    const notes = await Note.find({
      productId: req.params.productId,
    }).populate("user");

    if (!notes)
      return res
        .status(400)
        .send({ error: "Produto sem nenhum comentário ainda" });
    return res.status(200).send({ notes });
  } catch (error) {
    return res.status(400).send({
      error: "Houve um problema ao buscar comentários. Tente novamente",
    });
  }
});

/**
 * Criação de comentário por qualquer usuário
 */
router.post("/create/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product)
      return res.status(400).send({ error: "Produto não encontrado" });

    let note = await Note.create({
      productId: req.params.productId,
      user: req.userId,
      note: req.body.note,
      permission: req.permission,
    });

    // popula com dados do usuário
    note = await note.populate("user").execPopulate();

    if (!note)
      return res
        .status(400)
        .send({ error: "Não foi possível inserir seu comentário" });
    return res.status(200).send({ note });
  } catch (error) {
    return res.status(400).send({
      error: "Houve um problema ao inserir comentários. Tente novamente",
    });
  }
});

// Responde a um comentário específico
router.put("/:noteId", async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId);
    if (!note)
      return res.status(400).send({ error: "Comentário não encontrado" });

    const product = await Product.findOne({
      user: req.userId,
      _id: req.body.productId,
    });
    if (!product)
      res.status(400).send({
        error: "Você não tem permissão para isso",
      });

    return await Note.findOneAndUpdate(
      { _id: req.params.noteId, user: req.body.user },
      {
        $set: {
          reply: req.body.reply,
        },
      }
    ).then((data) => {
      if (data) return res.status(200).send();
      return res.status(400).send({
        error: "Houve um problema ao responder. Tente novamente",
      });
    });
  } catch (error) {
    return res.status(400).send({
      error: "Houve um problema ao responder. Tente novamente",
    });
  }
});

// deleta o comentário completo
router.delete("/:noteId", async (req, res) => {
  try {
    return await Note.findByIdAndDelete(req.params.noteId).then((e)=>{
      if(e) return res.status(200).send()
      return res.status(400).send({
        error: "Houve um problema ao excluir. Tente novamente",
      });
    })
    
  } catch (error) {
    return res.status(400).send({
      error: "Houve um problema ao excluir. Tente novamente",
    });
  }
});

module.exports = (app) => app.use("/note", router);
