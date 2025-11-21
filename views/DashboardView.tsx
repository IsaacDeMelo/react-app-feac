import React, { useState, useEffect, useRef } from 'react';
import { Plus, Calendar, BookOpen, AlertTriangle, FileText, Trash2, Loader2, X, Clock, Tag, Paperclip, Download, ChevronRight } from 'lucide-react';
import { Activity, ActivityType, Attachment } from '../types';
import { getActivities, addActivity, deleteActivity } from '../services/storageService';

interface DashboardProps {
  isAdmin: boolean;
}

export const DashboardView: React.FC<DashboardProps> = ({ isAdmin }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    date: '',
    type: 'atividade' as ActivityType,
    description: '',
    attachment: null as Attachment | null
  });

  const loadData = async () => {
    setLoading(true);
    const data = await getActivities();
    setActivities(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este registro acadêmico?')) {
      await deleteActivity(id);
      loadData();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("O arquivo é muito grande para o portal demo (Max 1MB).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          attachment: {
            name: file.name,
            type: file.type,
            data: reader.result as string
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;
    
    setSubmitting(true);
    await addActivity({
      title: formData.title,
      subject: formData.subject,
      date: formData.date,
      type: formData.type,
      description: formData.description,
      attachment: formData.attachment || undefined
    });
    setSubmitting(false);
    setShowModal(false);
    setFormData({ title: '', subject: '', date: '', type: 'atividade', description: '', attachment: null });
    loadData();
  };

  const getTypeConfig = (type: ActivityType) => {
    switch (type) {
      case 'prova': return { 
        icon: <AlertTriangle className="w-4 h-4" />, 
        label: 'Avaliação', 
        style: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20' 
      };
      case 'trabalho': return { 
        icon: <FileText className="w-4 h-4" />, 
        label: 'Trabalho', 
        style: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20' 
      };
      case 'atividade': return { 
        icon: <BookOpen className="w-4 h-4" />, 
        label: 'Exercício', 
        style: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' 
      };
      case 'aviso': return { 
        icon: <Calendar className="w-4 h-4" />, 
        label: 'Aviso', 
        style: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20' 
      };
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-12 px-2">
        <div className="space-y-2">
          <h2 className="font-sans font-bold text-navy-900 dark:text-white text-4xl tracking-tight">Mural Acadêmico</h2>
          <p className="text-navy-900/60 dark:text-gray-400 text-base max-w-2xl leading-relaxed">Acompanhe prazos, materiais e comunicados oficiais da representação da turma.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-3 bg-gold-500 hover:bg-gold-600 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black px-8 py-4 rounded-2xl text-base font-bold shadow-xl shadow-gold-500/20 dark:shadow-white/10 transition-all transform hover:-translate-y-1"
          >
            <Plus className="w-5 h-5" />
            Novo Registro
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-12 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center items-center h-80">
            <Loader2 className="w-10 h-10 animate-spin text-gray-300" />
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[500px] text-gray-400 dark:text-slate-600 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2rem] bg-white/50 dark:bg-white/5">
            <div className="w-24 h-24 bg-white dark:bg-white/5 rounded-full flex items-center justify-center mb-8 shadow-sm">
              <Calendar className="w-10 h-10 opacity-40" />
            </div>
            <p className="text-2xl font-sans font-medium text-navy-900 dark:text-slate-400 tracking-tight">Nenhuma atividade pendente</p>
            <p className="text-base mt-3 text-center opacity-70 max-w-sm">O mural é atualizado automaticamente conforme as publicações dos representantes.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {activities.map((activity, idx) => {
              const config = getTypeConfig(activity.type);
              return (
                <div 
                  key={activity.id} 
                  // High contrast: White solid background on slate-100 body
                  className="group relative flex flex-col bg-white dark:bg-[#121212]/80 backdrop-blur-md rounded-[2rem] p-8 border border-transparent dark:border-white/5 hover:border-gold-400 dark:hover:border-white/20 shadow-sm hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-1.5 animate-fade-in"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  {/* Card Top */}
                  <div className="flex justify-between items-start mb-6">
                    <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border uppercase tracking-wide ${config.style}`}>
                      {config.icon}
                      {config.label}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-lg">
                      {activity.subject}
                    </span>
                  </div>
                  
                  {/* Card Body */}
                  <div className="flex-1">
                    <h3 className="font-sans font-bold text-navy-900 dark:text-slate-100 text-2xl leading-tight mb-4 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors tracking-tight">
                      {activity.title}
                    </h3>
                    <p className="text-base text-navy-900/70 dark:text-slate-400 line-clamp-3 leading-relaxed font-sans">
                      {activity.description}
                    </p>
                  </div>

                  {/* Attachment */}
                  {activity.attachment && (
                    <div className="mt-6 pt-5 border-t border-slate-50 dark:border-white/5">
                      <a 
                        href={activity.attachment.data} 
                        download={activity.attachment.name}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-500/10 border border-transparent hover:border-blue-200 dark:hover:border-blue-500/30 transition-all group/file"
                      >
                        <div className="p-2.5 bg-white dark:bg-black/20 rounded-xl text-blue-500 group-hover/file:text-blue-600 shadow-sm">
                           <Paperclip className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-navy-900 dark:text-gray-300 truncate">{activity.attachment.name}</p>
                          <p className="text-xs text-blue-500 font-medium flex items-center gap-1 mt-0.5">
                            Baixar Arquivo <ChevronRight className="w-3 h-3" />
                          </p>
                        </div>
                      </a>
                    </div>
                  )}

                  {/* Card Footer */}
                  <div className="mt-8 flex items-center justify-between text-sm font-medium">
                    <div className="flex items-center text-gray-500 dark:text-gray-500 bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-lg">
                      <Clock className="w-4 h-4 mr-2" />
                      {new Date(activity.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                    </div>
                    
                    {/* Deadline Status */}
                    <div className="text-red-500 bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                      Até 23:59
                    </div>
                  </div>

                  {/* Admin Delete Action */}
                  {isAdmin && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(activity.id);
                      }}
                      className="absolute -top-3 -right-3 w-10 h-10 flex items-center justify-center bg-white dark:bg-zinc-800 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full shadow-lg border border-slate-100 dark:border-white/10 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 z-10"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Create */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xl z-[60] flex items-center justify-center p-6 transition-opacity duration-300">
          <div className="bg-white dark:bg-[#161618] border border-gray-200/50 dark:border-white/10 w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-10 animate-slide-up max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-3xl font-sans font-bold text-navy-900 dark:text-white tracking-tight">Nova Atividade</h3>
                <p className="text-gray-500 dark:text-gray-400 text-base mt-1">Adicionar registro ao mural da turma</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-3 text-gray-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
                <X className="w-7 h-7" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Título da Publicação</label>
                <input 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-lg text-navy-900 dark:text-white focus:ring-2 focus:ring-gold-500/50 outline-none transition-all placeholder-gray-400 font-medium" 
                  placeholder="Ex: Estudo de Caso - Tesla Motors"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Disciplina</label>
                  <input 
                    required
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-navy-900 dark:text-white focus:ring-2 focus:ring-gold-500/50 outline-none transition-all placeholder-gray-400" 
                    placeholder="Ex: MKT II"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Data Limite</label>
                  <input 
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-navy-900 dark:text-white focus:ring-2 focus:ring-gold-500/50 outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Tipo de Registro</label>
                <div className="relative">
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as ActivityType})}
                    className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-navy-900 dark:text-white focus:ring-2 focus:ring-gold-500/50 outline-none appearance-none cursor-pointer transition-all text-base"
                  >
                    <option value="atividade">Atividade / Exercício</option>
                    <option value="prova">Prova / Avaliação</option>
                    <option value="trabalho">Trabalho Acadêmico</option>
                    <option value="aviso">Aviso / Comunicado</option>
                  </select>
                  <Tag className="absolute right-6 top-5 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Anexo (Opcional)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-gold-500 dark:hover:border-gold-500 rounded-2xl p-6 cursor-pointer flex items-center justify-center gap-4 bg-slate-50/50 dark:bg-white/5 transition-all group"
                >
                  <div className="p-3 bg-white dark:bg-white/10 rounded-xl group-hover:scale-110 transition-transform shadow-sm">
                    <Paperclip className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                  </div>
                  <span className="text-base text-navy-900 dark:text-gray-300 font-medium">
                    {formData.attachment ? formData.attachment.name : "Clique para selecionar arquivo (PDF/IMG)"}
                  </span>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Detalhes e Instruções</label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-navy-900 dark:text-white focus:ring-2 focus:ring-gold-500/50 outline-none transition-all resize-none placeholder-gray-400 text-base leading-relaxed" 
                  placeholder="Descreva as instruções detalhadas para a turma..."
                />
              </div>

              <button 
                type="submit"
                disabled={submitting}
                className="w-full bg-gold-500 hover:bg-gold-600 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-bold py-5 rounded-2xl mt-4 flex justify-center items-center gap-3 shadow-xl shadow-gold-500/20 dark:shadow-white/5 transition-all transform active:scale-95 text-lg"
              >
                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                Publicar no Mural
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};