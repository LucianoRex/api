const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');
const cors = require('cors'); // Import CORS package

const app = express();
const port = 4000;

// Conectando ao MongoDB
mongoose.connect("mongodb+srv://lucianor3x:Tec2019!@cluster0.pqdgnhr.mongodb.net/", {
    //useNewUrlParser: true,
   // useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
    console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Error connecting to MongoDB:', err.message);
});

mongoose.pluralize(null);

app.use(bodyParser.json());

// Enable CORS for all origins
app.use(cors());

// Definindo um schema para armazenar schemas dinâmicos
const dynamicSchemaSchema = new mongoose.Schema({
    schemaName: { type: String, required: true, unique: true },
    fields: [{
        name: { type: String, required: true },
        type: { type: String, required: true }
    }]
});

const DynamicSchemaModel = mongoose.model('DynamicSchema', dynamicSchemaSchema);

// Middleware de validação para criação de schema
const schemaValidation = [
    body('schemaName').isString().notEmpty(),
    body('fields').isArray().notEmpty(),
    body('fields.*.name').isString().notEmpty(),
    body('fields.*.type').isString().isIn(['String', 'Number', 'Date', 'Boolean', 'Array', 'Buffer', 'Mixed', 'ObjectId', 'Decimal128', 'Map']),
];

// Endpoint para criar ou editar schemas dinamicamente e armazená-los no banco de dados
app.post('/create-schema', schemaValidation, async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { schemaName, fields } = req.body;

    try {
        // Armazenando o schema no banco de dados
        const existingSchema = await DynamicSchemaModel.findOne({ schemaName });
        if (existingSchema) {
            existingSchema.fields = fields;
            await existingSchema.save();
        } else {
            const newSchema = new DynamicSchemaModel({ schemaName, fields });
            await newSchema.save();
        }

        res.status(200).json({ message: `Schema ${schemaName} created or updated successfully!` });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// Mapeamento de tipos de campo para tipos do Mongoose
const typeMapping = {
    'String': String,
    'Number': Number,
    'Date': Date,
    'Boolean': Boolean,
    'Array': Array,
    'Buffer': Buffer,
    'Mixed': mongoose.Schema.Types.Mixed,
    'ObjectId': mongoose.Schema.Types.ObjectId,
    'Decimal128': mongoose.Schema.Types.Decimal128,
    'Map': Map
};

// Função para construir um modelo Mongoose a partir do schema armazenado
const getDynamicModel = async (schemaName) => {
    const schemaRecord = await DynamicSchemaModel.findOne({ schemaName });
    if (!schemaRecord) {
        throw new Error(`Schema ${schemaName} not found`);
    }

    const schemaDefinition = {};
    schemaRecord.fields.forEach(field => {
        const mongooseType = typeMapping[field.type];
        if (!mongooseType) {
            throw new Error(`Invalid type for field ${field.name}: ${field.type}`);
        }
        schemaDefinition[field.name] = { type: mongooseType };
    });

    const dynamicSchema = new mongoose.Schema(schemaDefinition);

    if (mongoose.models[schemaName]) {
        delete mongoose.models[schemaName];
    }

    return mongoose.model(schemaName, dynamicSchema);
};

// Endpoint para criar um novo documento
app.post('/create-document/:schemaName', async (req, res) => {
    const schemaName = req.params.schemaName;

    try {
        const DynamicModel = await getDynamicModel(schemaName);
        const newDocument = new DynamicModel(req.body);
        const savedDocument = await newDocument.save();
        res.status(201).json(savedDocument);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Endpoint para obter todos os documentos de um schema com filtros dinâmicos
app.get('/documents/:schemaName', async (req, res) => {
    const schemaName = req.params.schemaName;
    const query = req.query; // Obtém os parâmetros de consulta diretamente

    try {
        const DynamicModel = await getDynamicModel(schemaName);
        const documents = await DynamicModel.find(query); // Usa os parâmetros diretamente na consulta
        res.status(200).json(documents);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Endpoint para obter um documento pelo _id com filtros adicionais (se necessário)
app.get('/document/:schemaName/:id', async (req, res) => {
    const schemaName = req.params.schemaName;
    const id = req.params.id;

    try {
        const DynamicModel = await getDynamicModel(schemaName);
        const document = await DynamicModel.findOne({ _id: id });
        if (!document) {
            return res.status(404).send(`Document with ID ${id} not found`);
        }
        res.status(200).json(document);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Endpoint para atualizar um documento
app.put('/update-document/:schemaName/:id', async (req, res) => {
    const schemaName = req.params.schemaName;
    const id = req.params.id;

    try {
        const DynamicModel = await getDynamicModel(schemaName);
        const updatedDocument = await DynamicModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedDocument) {
            return res.status(404).send(`Document with ID ${id} not found`);
        }
        res.status(200).json(updatedDocument);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Endpoint para excluir um documento
app.delete('/delete-document/:schemaName/:id', async (req, res) => {
    const schemaName = req.params.schemaName;
    const id = req.params.id;

    try {
        const DynamicModel = await getDynamicModel(schemaName);
        const deletedDocument = await DynamicModel.findByIdAndDelete(id);
        if (!deletedDocument) {
            return res.status(404).send(`Document with ID ${id} not found`);
        }
        res.status(200).json({ message: `Document with ID ${id} deleted` });
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
