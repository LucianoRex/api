// app.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Conexão com o MongoDB
mongoose.connect(/*"mongodb://localhost:27017/sistema"*/"mongodb+srv://lucianor3x:Tec2019!@cluster0.pqdgnhr.mongodb.net/", {
  //  useNewUrlParser: true,
  //useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Erro de conexão com o MongoDB:"));
db.once("open", () => {
  console.log("Conectado ao MongoDB");
});

// Esquema MongoDB
const view = new mongoose.Schema({
  nome: String,
  caminho: String,
  tipo: String,
  html: String,
  css: String,
  js: String,
  fields:Array
});
const View = mongoose.model("View", view);

app.use(cors());
// Middleware para análise de corpo JSON
app.use(express.json());

mongoose.pluralize(null)

// Endpoint para criar um novo item
app.post("/view", async (req, res) => {
  console.log(req.body);
  const { _id, nome, caminho, tipo, html, css, js,fields } = req.body;

  if (_id) {
    // Atualizar item existente
    try {
      const updatedItem = await View.findByIdAndUpdate(_id, { nome, caminho, tipo, html, css, js,fields }, { new: true, runValidators: true });
      if (!updatedItem) {
        return res.status(404).json({ message: 'Item não encontrado' });
      }
      res.json(updatedItem);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  } else {
    const newView = new View({
      // _id:req.body._id,
      nome: nome,
      caminho: caminho,
      tipo: tipo,
      html: html,
      css: css,
      js: js,
      fields:fields
    });
    try {
      await newView.save();
      res.status(201).json(newView);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
});

// Endpoint para buscar todos os itens
app.get("/view", async (req, res) => {
  try {
    const view = await View.find();
    res.send(view)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/lista-view", async (req, res) => {
  try {
    const view = await View.find(/*{},{caminho:1,title:1}*/);
    res.json(view)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

app.get("/carrega-view/:_id", async (req, res) => {
  try {
    const view = await View.findById(req.params._id);
    res.json(view)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})


app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
