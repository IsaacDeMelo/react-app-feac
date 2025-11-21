import React, { useState, useEffect, useRef } from 'react';
import { Plus, Calendar, BookOpen, AlertCircle, FileText, Trash2, Loader2, X, Clock, Tag, Paperclip, Download, Filter, CheckCircle2, MoreVertical, Pencil } from 'lucide-react';
import { Activity, ActivityType, Attachment } from '../types';
import { getActivities, addActivity, updateActivity, deleteActivity } from '../services/storageService';

interface DashboardProps {
  isAdmin: boolean;
}

export const DashboardView: React.FC<DashboardProps> = ({ isAdmin }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<'ALL' | ActivityType>('ALL');
  const [editingId, setEditingId] = useState<string | null>(null);
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

  const handleEdit = (activity: Activity) => {
    setFormData({
      title: activity.title,
      subject: activity.subject,
      date: activity.date,
      type: activity.type,
      description: activity.description,
      attachment: activity.attachment || null
    });
    setEditingId(activity.id);
    setShowModal(true);
  };

  const handleOpenNew = () => {
    setFormData({ title: '', subject: '', date: '', type: 'atividade', description: '', attachment: null });
    setEditingId(null);
    setShowModal(true);
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

    if (editingId) {
      // Update existing
      const original = activities.find(a => a.id === editingId);
      if (original) {
        await updateActivity({
          id: editingId,
          createdAt: original.createdAt,
          title: formData.title,
          subject: formData.subject,
          date: formData.date,
          type: formData.type,
          description: formData.description,
          attachment: formData.attachment || undefined
        });
      }
    } else {
      // Create new
      await addActivity({
        title: formData.title,
        subject: formData.subject,
        date: formData.date,
        type: formData.type,
        description: formData.description,
        attachment: formData.attachment || undefined
      });
    }

    setSubmitting(false);
    setShowModal(false);
    setEditingId(null);
    setFormData({ title: '', subject: '', date: '', type: 'atividade', description: '', attachment: null });
    loadData();
  };

  const filteredActivities = activities.filter(a => filter === 'ALL' || a.type === filter);

  // Color Helpers - MANTIDOS SEMANTICAMENTE para diferenciar Tipos de Atividade
  const getTypeStyle = (type: ActivityType) => {
    switch (type) {
      case 'prova': return {
        bg: 'bg-red-50 dark:bg-red-900/10',
        text: 'text-red-600 dark:text-red-400',
        border: 'border-red-100 dark:border-red-900/20',
        icon: AlertCircle
      };
      case 'trabalho': return {
        bg: 'bg-blue-50 dark:bg-blue-900/10',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-100 dark:border-blue-900/20',
        icon: FileText
      };
      case 'atividade': return {
        bg: 'bg-emerald-50 dark:bg-emerald-900/10',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-100 dark:border-emerald-900/20',
        icon: BookOpen
      };
      case 'aviso': return {
        bg: 'bg-amber-50 dark:bg-amber-900/10',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-100 dark:border-amber-900/20',
        icon: Clock
      };
    }
  };

  // Date formatting
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return {
      day: date.getDate(),
      month: date.toLocaleString('pt-BR', { month: 'short' }).toUpperCase(),
      weekday: date.toLocaleString('pt-BR', { weekday: 'long' }),
      full: date.toLocaleDateString('pt-BR')
    };
  };

  return (
    <div className="px-6 md:px-10 w-full max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Mural da Turma</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
            Acompanhe o calendário acadêmico e não perca prazos.
          </p>
        </div>
        
        {isAdmin && (
          <button 
            onClick={handleOpenNew} 
            className="group flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-xl shadow-brand-900/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Atividade</span>
          </button>
        )}
      </div>

      {/* Filter Pills - UNIFICADOS COM BRAND COLOR */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-4 hide-scrollbar">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap border ${
            filter === 'ALL' 
              ? 'bg-brand-600 text-white border-brand-600 dark:bg-brand-600 dark:border-brand-600 shadow-lg shadow-brand-500/30' 
              : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 hover:border-slate-300'
          }`}
        >
          Todos
        </button>
        {(['prova', 'trabalho', 'atividade', 'aviso'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap border ${
              filter === t 
                ? 'bg-brand-600 text-white border-brand-600 dark:bg-brand-600 dark:border-brand-600 shadow-lg shadow-brand-500/30' 
                : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {!loading && filteredActivities.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center animate-fade-in bg-white dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Tudo tranquilo por aqui</h3>
          <p className="text-slate-500 max-w-xs mx-auto text-sm">Nenhuma atividade cadastrada para esta categoria.</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
        </div>
      )}

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((item, idx) => {
          const dateObj = formatDate(item.date);
          const style = getTypeStyle(item.type);
          const Icon = style.icon;

          return (
            <div 
              key={item.id}
              className="group relative bg-white dark:bg-slate-900 rounded-[2rem] p-7 border border-slate-100 dark:border-slate-800 shadow-[0_2px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-none dark:hover:bg-slate-800/50 transition-all duration-300 flex flex-col h-full hover:-translate-y-1"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Top Row */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${style.bg} ${style.text}`}>
                      <Icon className="w-6 h-6" />
                   </div>
                   <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.type}</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{item.subject}</span>
                   </div>
                </div>
                
                <div className="text-right">
                   <span className="block text-xl font-extrabold text-slate-900 dark:text-white leading-none">{dateObj.day}</span>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{dateObj.month}</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 mb-6">
                <h3 className="font-bold text-lg leading-tight text-slate-900 dark:text-white mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-4">
                  {item.description}
                </p>
              </div>

              {/* Footer */}
              <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
                 <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {dateObj.weekday}
                 </div>

                 {item.attachment && (
                   <a href={item.attachment.data} download={item.attachment.name} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/30 dark:hover:text-brand-400 transition-colors" title="Baixar anexo">
                      <Paperclip className="w-3.5 h-3.5" /> Anexo
                   </a>
                 )}
              </div>

              {/* Admin Actions */}
              {isAdmin && (
                <div className="absolute top-5 right-5 flex items-center gap-1">
                  <button 
                    onClick={(e) => {e.stopPropagation(); handleEdit(item)}} 
                    className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 bg-slate-100 hover:text-blue-600 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-blue-900/30 dark:text-slate-400 transition-all shadow-sm"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => {e.stopPropagation(); handleDelete(item.id)}} 
                    className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 bg-slate-100 hover:text-red-600 hover:bg-red-100 dark:bg-slate-800 dark:hover:bg-red-900/30 dark:text-slate-400 transition-all shadow-sm"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Nova/Editar Atividade */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
           <div className="bg-white dark:bg-slate-950 w-full max-w-xl rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] animate-scale-in border border-white/10 overflow-hidden">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                 <div>
                   <h3 className="font-bold text-2xl text-slate-900 dark:text-white tracking-tight">
                     {editingId ? 'Editar Atividade' : 'Nova Atividade'}
                   </h3>
                   <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-wide">
                     {editingId ? 'Atualizar informações' : 'Adicionar ao Mural'}
                   </p>
                 </div>
                 <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
              </div>
              
              <div className="p-8 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-950">
                 <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-1">Título da Atividade</label>
                       <input 
                         required 
                         value={formData.title} 
                         onChange={e => setFormData({...formData, title: e.target.value})} 
                         className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none transition-all placeholder-slate-400" 
                         placeholder="Ex: Prova de Marketing Digital" 
                       />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-5">
                       <div>
                         <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-1">Disciplina</label>
                         <input 
                           required 
                           value={formData.subject} 
                           onChange={e => setFormData({...formData, subject: e.target.value})} 
                           className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-all" 
                           placeholder="Ex: MKT01" 
                         />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-1">Data</label>
                         <input 
                           type="date" 
                           required 
                           value={formData.date} 
                           onChange={e => setFormData({...formData, date: e.target.value})} 
                           className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 font-medium focus:ring-2 focus:ring-brand-500 outline-none transition-all text-slate-600 dark:text-slate-300" 
                         />
                       </div>
                    </div>
                    
                    <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">Tipo de Atividade</label>
                       <div className="grid grid-cols-4 gap-3">
                         {(['atividade', 'prova', 'trabalho', 'aviso'] as ActivityType[]).map((type) => (
                           <button
                             key={type}
                             type="button"
                             onClick={() => setFormData({...formData, type})}
                             className={`py-3 rounded-xl text-[10px] sm:text-xs font-bold uppercase border transition-all ${
                               formData.type === type 
                                 ? 'bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-500/25' 
                                 : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                             }`}
                           >
                             {type}
                           </button>
                         ))}
                       </div>
                    </div>
                    
                    <div>
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-1">Descrição Detalhada</label>
                       <textarea 
                         rows={4} 
                         value={formData.description} 
                         onChange={e => setFormData({...formData, description: e.target.value})} 
                         className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-brand-500 outline-none resize-none transition-all text-sm leading-relaxed" 
                         placeholder="Adicione detalhes sobre o conteúdo, regras, capítulos do livro ou instruções de entrega..." 
                       />
                    </div>
                    
                    {/* Attachment Custom Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 ml-1">Anexo (Opcional)</label>
                      <div 
                        onClick={() => fileInputRef.current?.click()} 
                        className={`border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all flex items-center gap-4 group ${
                          formData.attachment 
                            ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/10' 
                            : 'border-slate-200 dark:border-slate-800 hover:border-brand-300 hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                      >
                         {formData.attachment ? (
                           <>
                             <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center text-brand-600 shadow-sm">
                               <CheckCircle2 className="w-6 h-6" />
                             </div>
                             <div className="flex-1">
                               <p className="text-sm font-bold text-brand-700 dark:text-brand-300">{formData.attachment.name}</p>
                               <p className="text-xs text-brand-500 mt-0.5">Arquivo selecionado</p>
                             </div>
                             <button type="button" onClick={(e) => {e.stopPropagation(); setFormData({...formData, attachment: null})}} className="p-2 hover:bg-brand-200 rounded-full transition-colors text-brand-600"><X className="w-4 h-4" /></button>
                           </>
                         ) : (
                           <>
                             <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 group-hover:text-brand-500 transition-colors">
                               <Paperclip className="w-5 h-5" />
                             </div>
                             <div>
                               <p className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-brand-600 transition-colors">Anexar arquivo</p>
                               <p className="text-xs text-slate-400">PDF ou Imagem (Max 1MB)</p>
                             </div>
                           </>
                         )}
                         <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.jpg,.png,.doc,.docx" onChange={handleFileChange} />
                      </div>
                    </div>

                    <button type="submit" disabled={submitting} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-brand-500/20 flex justify-center items-center gap-3 transition-all transform active:scale-[0.98] mt-4">
                       {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (editingId ? "Atualizar Atividade" : "Publicar Atividade")}
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};