import React, { useState, useEffect, useRef } from 'react';
import { Plus, Calendar, BookOpen, AlertCircle, FileText, Trash2, Loader2, X, Clock, Tag, Paperclip, Download, ChevronRight, Bell, Filter } from 'lucide-react';
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
    if (confirm('Remover item?')) {
      await deleteActivity(id);
      loadData();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("Max 1MB.");
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

  const getTypeStyles = (type: ActivityType) => {
    switch (type) {
      case 'prova': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-500/20';
      case 'trabalho': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-500/20';
      case 'atividade': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20';
      case 'aviso': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-500/20';
    }
  };

  const getTypeIcon = (type: ActivityType) => {
    switch (type) {
      case 'prova': return <AlertCircle className="w-4 h-4" />;
      case 'trabalho': return <FileText className="w-4 h-4" />;
      case 'atividade': return <BookOpen className="w-4 h-4" />;
      case 'aviso': return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Mural da Turma</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Próximas entregas e avisos importantes.</p>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
           {isAdmin && (
             <button onClick={() => setShowModal(true)} className="flex-shrink-0 bg-brand-600 hover:bg-brand-700 text-white p-3 md:px-4 md:py-2 rounded-xl shadow-lg shadow-brand-500/20 flex items-center gap-2 transition-all">
               <Plus className="w-5 h-5" />
               <span className="hidden md:inline font-medium text-sm">Novo Aviso</span>
             </button>
           )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['ALL', 'prova', 'trabalho', 'atividade', 'aviso'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-colors whitespace-nowrap border ${
              filter === t 
                ? 'bg-slate-800 text-white border-slate-800 dark:bg-white dark:text-slate-900' 
                : 'bg-white dark:bg-surface-800 text-slate-500 border-slate-200 dark:border-white/10 hover:bg-slate-50'
            }`}
          >
            {t === 'ALL' ? 'Todos' : t}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
      ) : filteredActivities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white dark:bg-surface-800 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
          <Calendar className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-sm font-medium">Sem atividades para este filtro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredActivities.map((item, idx) => (
            <div 
              key={item.id}
              className="group bg-white dark:bg-surface-800 rounded-2xl p-5 border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Left Color Bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getTypeStyles(item.type).split(' ')[0].replace('bg-', 'bg-').replace('100', '500')}`}></div>

              <div className="flex justify-between items-start mb-3 pl-2">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md border flex items-center gap-1.5 uppercase tracking-wider ${getTypeStyles(item.type)}`}>
                   {getTypeIcon(item.type)}
                   {item.type}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-white/5 px-2 py-1 rounded">
                  {item.subject}
                </span>
              </div>

              <div className="pl-2 mb-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-tight mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {item.attachment && (
                <div className="pl-2 mb-4">
                   <a href={item.attachment.data} download={item.attachment.name} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5 hover:border-brand-300 transition-colors group/att">
                      <div className="p-1.5 bg-white dark:bg-white/10 rounded-lg shadow-sm text-brand-500">
                        <Paperclip className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{item.attachment.name}</p>
                         <p className="text-[10px] text-brand-500 font-bold uppercase">Download</p>
                      </div>
                   </a>
                </div>
              )}

              <div className="pl-2 flex items-center justify-between pt-3 border-t border-slate-50 dark:border-white/5">
                <div className="flex items-center text-xs font-medium text-slate-400">
                  <Clock className="w-3.5 h-3.5 mr-1.5" />
                  {new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </div>
                {isAdmin && (
                  <button onClick={(e) => {e.stopPropagation(); handleDelete(item.id)}} className="text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Activity Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white dark:bg-surface-800 w-full max-w-xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-slide-up overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
                 <h3 className="font-bold text-xl text-slate-900 dark:text-white">Nova Publicação</h3>
                 <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar">
                 <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Título</label>
                       <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-slate-50 dark:bg-surface-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Ex: Prova de Marketing" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Disciplina</label>
                         <input required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-slate-50 dark:bg-surface-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Ex: MKT01" />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Data</label>
                         <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 dark:bg-surface-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none" />
                       </div>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tipo</label>
                       <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ActivityType})} className="w-full bg-slate-50 dark:bg-surface-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none">
                          <option value="atividade">Atividade</option>
                          <option value="prova">Prova</option>
                          <option value="trabalho">Trabalho</option>
                          <option value="aviso">Aviso</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Descrição</label>
                       <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 dark:bg-surface-900 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-500 outline-none resize-none" placeholder="Instruções..." />
                    </div>
                    
                    {/* Attachment */}
                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-xl p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                       <Paperclip className="w-5 h-5 text-slate-400" />
                       <span className="text-sm text-slate-500">{formData.attachment ? formData.attachment.name : "Anexar Arquivo (PDF/IMG)"}</span>
                       <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.jpg,.png,.doc" onChange={handleFileChange} />
                    </div>

                    <button type="submit" disabled={submitting} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-brand-500/20 flex justify-center items-center gap-2">
                       {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publicar"}
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
