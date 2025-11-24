import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Activity } from './models/Activity.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração para __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// String de conexão fornecida (MongoDB Atlas)
const MONGO_URI = 'mongodb+srv://isaachonorato41:brasil2021@cluster0.rxemo.mongodb.net/portal-ufal?appName=Cluster0';

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Conexão com MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas conectado com sucesso'))
  .catch(err => console.error('❌ Erro ao conectar no MongoDB:', err));

// --- ROTAS DA API ---

app.get('/api/activities', async (req, res) => {
  try {
    const activities = await Activity.find().sort({ date: 1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/activities', async (req, res) => {
  try {
    const newActivity = new Activity(req.body);
    await newActivity.save();
    res.status(201).json(newActivity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/activities/:id', async (req, res) => {
  try {
    const updatedActivity = await Activity.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    res.json(updatedActivity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/activities/:id', async (req, res) => {
  try {
    await Activity.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Atividade removida' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- SERVIR FRONTEND EM PRODUÇÃO ---
// Faz o Express servir os arquivos estáticos gerados pelo Vite (pasta dist)
app.use(express.static(path.join(__dirname, '../dist')));

// Qualquer rota que não seja da API, manda para o index.html (Client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});