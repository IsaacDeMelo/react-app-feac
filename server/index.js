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

// String de conexão EXATA fornecida pelo usuário
const MONGO_URI = 'mongodb+srv://isaachonorato41:brasil2021@cluster0.rxemo.mongodb.net/?appName=Cluster0';

// Middlewares
app.use(cors());
// Aumentar limite para aceitar arquivos grandes (PDFs/Imagens em Base64)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Conexão com MongoDB
// dbName garante que os dados vão para o banco 'portal-ufal' e não 'test'
mongoose.connect(MONGO_URI, { dbName: 'portal-ufal' })
  .then(() => console.log('✅ MongoDB Atlas conectado com sucesso! Pr pronto para salvar.'))
  .catch(err => {
    console.error('❌ ERRO CRÍTICO AO CONECTAR NO MONGODB:', err);
    console.error('Verifique se seu IP está liberado no MongoDB Atlas (Network Access -> Allow All).');
  });

// --- ROTAS DA API ---

app.get('/api/activities', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.warn('⚠️ Tentativa de leitura sem conexão com banco.');
      return res.status(503).json({ error: 'Banco de dados desconectado ou conectando...' });
    }
    const activities = await Activity.find().sort({ date: 1 });
    console.log(`📡 Enviando ${activities.length} atividades para o front.`);
    res.json(activities);
  } catch (error) {
    console.error('Erro GET:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/activities', async (req, res) => {
  try {
    // Verificação de segurança da conexão
    if (mongoose.connection.readyState !== 1) {
      throw new Error('O servidor não está conectado ao MongoDB. Verifique o terminal do backend.');
    }

    console.log('📝 Recebendo nova atividade:', req.body.title);
    
    const newActivity = new Activity(req.body);
    await newActivity.save();
    
    console.log('✅ Atividade salva no MongoDB com ID:', newActivity._id);
    res.status(201).json(newActivity);
  } catch (error) {
    console.error('❌ Erro ao salvar atividade:', error.message);
    res.status(400).json({ error: error.message, details: 'Falha ao gravar no banco.' });
  }
});

app.put('/api/activities/:id', async (req, res) => {
  try {
    console.log('✏️ Atualizando atividade:', req.params.id);
    const updatedActivity = await Activity.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    res.json(updatedActivity);
  } catch (error) {
    console.error('❌ Erro ao atualizar:', error);
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/activities/:id', async (req, res) => {
  try {
    console.log('🗑️ Removendo atividade:', req.params.id);
    await Activity.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Atividade removida' });
  } catch (error) {
    console.error('❌ Erro ao deletar:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- SERVIR FRONTEND EM PRODUÇÃO ---
const distPath = path.resolve(__dirname, '../dist');

app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
  console.log('⏳ Aguardando conexão com MongoDB...');
});
