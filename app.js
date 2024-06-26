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
const menu = new mongoose.Schema({
  nome: String,
  caminho: String,
  tipo: String,
  schema:String
  //html: String,
  //css: String,
  //js: String,
  //fields: Array,
  //campos: Array
},
  {
    collection: 'menu'
  });
const Menu = mongoose.model("Menu", menu);

const aluno = new mongoose.Schema({
  nome: { type: String, alias: 'Nome completo' },
  idade: { type: String, alias: 'Idade' },
  sexo: { type: String, alias: 'Sexo' },
})

const Aluno = new mongoose.model('Aluno', aluno)


const professor = new mongoose.Schema({
  nome: { type: String, alias: 'Nome completo' },
  idade: { type: String, alias: 'Idades' }

})

const Professor = new mongoose.model('Professor', professor)

app.use(cors());
// Middleware para análise de corpo JSON
app.use(express.json());

//mongoose.pluralize(null)





app.get('/professor', async (req, res) => {
  console.log('aluno')
  try {
    const professor = await Professor.find();
    console.log(professor)
    res.send(professor)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }

})



// Endpoint para criar um novo item
app.post("/menu", async (req, res) => {
  console.log(req.body);
  const { _id, nome, caminho, tipo, schema } = req.body;

  if (_id) {
    // Atualizar item existente
    try {
      const updatedItem = await Menu.findByIdAndUpdate(_id, { nome, caminho, tipo,schema }, { new: true, runValidators: true });
      if (!updatedItem) {
        return res.status(404).json({ message: 'Item não encontrado' });
      }
      res.json(updatedItem);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  } else {
    const newMenu = new Menu({
      // _id:req.body._id,
      nome: nome,
      caminho: caminho,
      tipo: tipo,
       schema:schema
      // html: html,
      // css: css,
      // js: js,
      // fields: fields
    });
    try {
      await newMenu.save();
      res.status(201).json(newMenu);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
});


// Endpoint para buscar todos os itens
app.get("/menu", async (req, res) => {
  try {
    const menu = await Menu.find();
    console.log(menu)
    res.send(menu)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/lista-menu", async (req, res) => {
  try {
    const menu = await Menu.find(/*{},{caminho:1,title:1}*/);
    console.log(menu)
    res.json(menu)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

app.get("/carrega-menu/:_id", async (req, res) => {
  try {
    const menu = await Menu.findById(req.params._id);
    console.log(menu)
    res.json(menu)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})

app.get('/aluno', async (req, res) => {
  console.log('aluno')
  try {
    const aluno1 = await Aluno.find({idade:{$gt:25}});
    const campos = Object.keys(aluno.paths).filter(campo => campo !== '__v')
      .map(campo => ({
        campo,
        alias: aluno.paths[campo].options.alias || campo
      }));
    //console.log(aluno.paths)
    console.log(campos);
    res.send(aluno1);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }

})


app.get("/aluno/:_id", async (req, res) => {
  try {
    const aluno = await Aluno.findById(req.params._id);
    console.log(aluno)
    res.json(aluno)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
})
app.get('/campo-aluno', async (req, res) => {
  console.log('aluno')
  try {
   // const aluno1 = await Aluno.find();
    const campos = Object.keys(aluno.paths).filter(campo => campo !== '__v')
      .map(campo => ({
        campo,
        alias: aluno.paths[campo].options.alias || campo
      }));
    //console.log(aluno.paths)
    console.log(campos);
    res.send(campos)
  } catch (err) {
    res.status(500).json({ message: err.message });
  }

})

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
