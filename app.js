// app.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Conexão com o MongoDB
mongoose.connect(/*"mongodb://localhost:27017/sistema"*/"mongodb+srv://lucianor3x:Tec2019!@cluster0.pqdgnhr.mongodb.net/", {
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
  nome: String,
  caminho: String,
  html: String,
  css:String,
  js:String
});
const Tela = mongoose.model("Tela", tela);

app.use(cors());
// Middleware para análise de corpo JSON
app.use(express.json());

// Endpoint para criar um novo item
app.post("/telas", async (req, res) => {
    console.log(req.body);
    const {_id,nome,caminho,html,css,js}=req.body;

    if (_id) {
        // Atualizar item existente
        try {
            const updatedItem = await Tela.findByIdAndUpdate(_id, { nome,caminho,html,css,js }, { new: true, runValidators: true });
            if (!updatedItem) {
                return res.status(404).json({ message: 'Item não encontrado' });
            }
            res.json(updatedItem);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    } else{
  const newItem = new Tela({
   // _id:req.body._id,
    nome: nome,
    caminho: caminho,
    html: html,
    css:css,
    js:js
  });
  try {
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
    }}
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
        const telas = await Tela.find(/*{},{caminho:1,title:1}*/);
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
