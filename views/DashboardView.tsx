import React, { useState, useEffect, useRef } from 'react';
import { Plus, Calendar, BookOpen, AlertCircle, FileText, Trash2, Loader2, X, Clock, Tag, Paperclip, Download, Filter, CheckCircle2 } from 'lucide-react';
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
  const [filter, setFilter] = useState<'ALL' | ActivityType>('ALL');
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
    if (confirm('Tem certeza que deseja excluir esta atividade?')) {
      await deleteActivity(id);
      loadData();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("Arquivo muito grande. Máximo 1MB.");
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

  const filteredActivities = activities.filter(a => filter === 'ALL' || a.type === filter);

  // Color Helpers
  const getTypeColor = (type: ActivityType) => {
    switch (type) {
      case 'prova': return 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/30';
      case 'trabalho': return 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-900/30';
      case 'atividade': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'aviso': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30';
    }
  };

  const getTypeIcon = (type: ActivityType) => {
    switch (type) {
      case 'prova': return <AlertCircle className="w-3.5 h-3.5" />;
      case 'trabalho': return <FileText className="w-3.5 h-3.5" />;
      case 'atividade': return <BookOpen className="w-3.5 h-3.5" />;
      case 'aviso': return <Clock className="w-3.5 h-3.5" />;
    }
  };

  // Date formatting
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return {
      day: date.getDate(),
      month: date.toLocaleString('pt-BR', { month: 'short' }).toUpperCase(),
      full: date.toLocaleDateString('pt-BR')
    };
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Mural da Turma</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
            Acompanhe datas de provas, entregas de trabalhos e comunicados oficiais da disciplina.
          </p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setShowModal(true)} 
            className="group flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-3 rounded-xl font-semibold shadow-xl shadow-slate-900/10 dark:shadow-white/10 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Atividade</span>
          </button>
        )}
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 hide-scrollbar">
        <div className="flex p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
          {(['ALL', 'prova', 'trabalho', 'atividade', 'aviso'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all duration-300 whitespace-nowrap ${
                filter === t 
                  ? 'bg-slate-900 text-white shadow-md dark:bg-brand-600' 
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {t === 'ALL' ? 'Tudo' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {!loading && filteredActivities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-fade-in">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Nenhuma atividade encontrada</h3>
          <p className="text-slate-500 max-w-xs mx-auto">Não há atividades cadastradas para esta categoria no momento.</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
        </div>
      )}

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((item, idx) => {
          const dateObj = formatDate(item.date);
          return (
            <div 
              key={item.id}
              className="group relative bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/30 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Header: Date & Type */}
              <div className="flex justify-between items-start mb-5">
                <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-800 rounded-2xl p-2.5 min-w-[60px] border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{dateObj.month}</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white leading-none mt-0.5">{dateObj.day}</span>
                </div>
                <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 uppercase tracking-wider ${getTypeColor(item.type)}`}>
                   {getTypeIcon(item.type)}
                   {item.type}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{item.subject}</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-snug mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-4">
                  {item.description}
                </p>
              </div>

              {/* Attachment */}
              {item.attachment && (
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                   <a href={item.attachment.data} download={item.attachment.name} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors group/file">
                      <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-slate-400 group-hover/file:text-brand-500 transition-colors">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{item.attachment.name}</p>
                         <p className="text-[10px] text-slate-400 group-hover/file:text-brand-500 font-bold uppercase mt-0.5">Baixar Anexo</p>
                      </div>
                      <div className="p-2 text-slate-300 group-hover/file:text-brand-500">
                        <Download className="w-4 h-4" />
                      </div>
                   </a>
                </div>
              )}

              {/* Delete Button (Admin) */}
              {isAdmin && (
                <button 
                  onClick={(e) => {e.stopPropagation(); handleDelete(item.id)}} 
                  className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Nova Atividade */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
           <div className="bg-white dark:bg-slate-950 w-full max-w-xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-scale-in border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                 <div>
                   <h3 className="font-bold text-xl text-slate-900 dark:text-white">Nova Atividade</h3>
                   <p className="text-xs text-slate-500 mt-1">Preencha os detalhes abaixo</p>
                 </div>
                 <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-950">
                 <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Título</label>
                       <input 
                         required 
                         value={formData.title} 
                         onChange={e => setFormData({...formData, title: e.target.value})} 
                         className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-all" 
                         placeholder="Ex: Prova de Marketing Digital" 
                       />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Disciplina</label>
                         <input 
                           required 
                           value={formData.subject} 
                           onChange={e => setFormData({...formData, subject: e.target.value})} 
                           className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-brand-500 outline-none transition-all" 
                           placeholder="Ex: MKT01" 
                         />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Data</label>
                         <input 
                           type="date" 
                           required 
                           value={formData.date} 
                           onChange={e => setFormData({...formData, date: e.target.value})} 
                           className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-brand-500 outline-none transition-all" 
                         />
                       </div>
                    </div>
                    
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipo</label>
                       <div className="grid grid-cols-4 gap-2">
                         {(['atividade', 'prova', 'trabalho', 'aviso'] as ActivityType[]).map((type) => (
                           <button
                             key={type}
                             type="button"
                             onClick={() => setFormData({...formData, type})}
                             className={`py-2.5 rounded-xl text-xs font-bold uppercase border transition-all ${
                               formData.type === type 
                                 ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 border-brand-500 ring-1 ring-brand-500' 
                                 : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                             }`}
                           >
                             {type}
                           </button>
                         ))}
                       </div>
                    </div>
                    
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Descrição</label>
                       <textarea 
                         rows={4} 
                         value={formData.description} 
                         onChange={e => setFormData({...formData, description: e.target.value})} 
                         className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-brand-500 outline-none resize-none transition-all text-sm leading-relaxed" 
                         placeholder="Detalhes sobre o conteúdo, regras ou instruções..." 
                       />
                    </div>
                    
                    {/* Attachment Custom Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Anexo (Opcional)</label>
                      <div 
                        onClick={() => fileInputRef.current?.click()} 
                        className={`border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group ${
                          formData.attachment 
                            ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/10' 
                            : 'border-slate-200 dark:border-slate-800 hover:border-brand-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                      >
                         {formData.attachment ? (
                           <>
                             <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center text-brand-600">
                               <CheckCircle2 className="w-5 h-5" />
                             </div>
                             <p className="text-sm font-medium text-brand-700 dark:text-brand-300">{formData.attachment.name}</p>
                             <p className="text-xs text-brand-500">Clique para alterar</p>
                           </>
                         ) : (
                           <>
                             <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 group-hover:text-brand-500 transition-colors">
                               <Paperclip className="w-5 h-5" />
                             </div>
                             <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Clique para upload</p>
                             <p className="text-xs text-slate-400">PDF, JPG ou PNG (Max 1MB)</p>
                           </>
                         )}
                         <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.jpg,.png,.doc,.docx" onChange={handleFileChange} />
                      </div>
                    </div>

                    <button type="submit" disabled={submitting} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-brand-500/20 flex justify-center items-center gap-2 transition-all transform active:scale-[0.98]">
                       {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publicar Atividade"}
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};