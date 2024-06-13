// app.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Conexão com o MongoDB
mongoose.connect("mongodb://localhost:27017/sistema", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Erro de conexão com o MongoDB:"));
db.once("open", () => {
  console.log("Conectado ao MongoDB");
});

// Esquema MongoDB
const tela = new mongoose.Schema({
  title: String,
  caminho: String,
  content: String,
});
const Tela = mongoose.model("Tela", tela);

app.use(cors());
// Middleware para análise de corpo JSON
app.use(express.json());

// Endpoint para criar um novo item
app.post("/telas", async (req, res) => {
    console.log(req.body)
  const newItem = new Tela({
    title: req.body.title,
    caminho: req.body.caminho,
    content: req.body.content,
  });
  try {
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Endpoint para buscar todos os itens
app.get("/telas", async (req, res) => {
  try {
    const telas = await Tela.find();
    res.send(telas)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/lista-telas",async (req,res)=>{
    try {
        const telas = await Tela.find({},{caminho:1,title:1});
        res.json(telas)
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
})

app.get("/carrega-tela/:_id",async (req,res)=>{
    try {
        const telas = await Tela.findById(req.params._id);
        res.json(telas)
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
})


app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
