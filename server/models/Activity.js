import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  date: { type: String, required: true }, // Formato YYYY-MM-DD
  type: { 
    type: String, 
    enum: ['prova', 'trabalho', 'atividade', 'aviso'], 
    required: true 
  },
  description: String,
  createdAt: { type: Number, default: Date.now },
  attachment: {
    name: String,
    type: String,
    data: String // Base64 string
  }
});

// Transforma _id em id para o frontend
ActivitySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

export const Activity = mongoose.model('Activity', ActivitySchema);