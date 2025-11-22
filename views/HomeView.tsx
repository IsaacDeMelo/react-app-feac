import React from 'react';
import { LayoutGrid, MessageCircle, ArrowRight, GraduationCap, Bell, Calendar } from 'lucide-react';
import { ViewMode } from '../types';

interface HomeViewProps {
  onNavigate: (mode: ViewMode) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  return (
    <div className="h-full w-full overflow-y-auto custom-scrollbar bg-slate-100 dark:bg-slate-950">
      {/* Hero Section */}
      <div className="relative w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pb-12 pt-8 px-6 md:pt-12 md:pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-100/50 dark:bg-brand-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider mb-6 border border-brand-100 dark:border-brand-900/50">
            <GraduationCap className="w-4 h-4" />
            Portal Acadêmico UFAL
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6">
            Gestão inteligente para <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-400">sua jornada acadêmica.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed mb-10">
            Bem-vindo ao portal da turma de Administração. Acompanhe datas importantes, acesse materiais e tire dúvidas com a Luna, nossa inteligência artificial.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => onNavigate(ViewMode.DASHBOARD)}
              className="px-8 py-4 rounded-2xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition-all shadow-xl shadow-brand-500/20 flex items-center gap-2 transform active:scale-95"
            >
              <LayoutGrid className="w-5 h-5" />
              Acessar Mural
            </button>
            <button 
              onClick={() => onNavigate(ViewMode.TUTOR)}
              className="px-8 py-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5 text-brand-500" />
              Falar com a Luna
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Card Mural */}
          <div 
            onClick={() => onNavigate(ViewMode.DASHBOARD)}
            className="group cursor-pointer bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Calendar className="w-7 h-7 text-brand-600 dark:text-brand-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">Mural da Turma</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              Centralize todas as datas de provas, entregas de trabalhos e avisos importantes. Nunca mais perca um prazo da disciplina.
            </p>
            <div className="flex items-center text-brand-600 dark:text-brand-400 font-bold text-sm">
              Ver cronograma <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card Luna */}
          <div 
            onClick={() => onNavigate(ViewMode.TUTOR)}
            className="group cursor-pointer bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-50/50 to-transparent dark:from-brand-900/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            
            <div className="w-14 h-14 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform relative z-10">
              <img src="https://img.icons8.com/?size=100&id=XwL1uwivrCEF&format=png&color=000000" alt="Luna" className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors relative z-10">Monitoria Virtual</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6 relative z-10">
              Tire dúvidas sobre o conteúdo, peça explicações de conceitos e verifique o que está agendado. A Luna está disponível 24h.
            </p>
            <div className="flex items-center text-brand-600 dark:text-brand-400 font-bold text-sm relative z-10">
              Iniciar conversa <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

        {/* Info Section */}
        <div className="mt-16 bg-slate-200/50 dark:bg-slate-800/30 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left border border-slate-200 dark:border-slate-800">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm">
             <Bell className="w-6 h-6 text-brand-500" />
          </div>
          <div className="flex-1">
             <h4 className="text-lg font-bold text-slate-900 dark:text-white">Fique atento!</h4>
             <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
               Mantenha as notificações do seu grupo de WhatsApp ativas. Este portal é atualizado pelos representantes da turma.
             </p>
          </div>
        </div>
        
        <footer className="mt-16 text-center border-t border-slate-200 dark:border-slate-800 pt-8">
           <div className="flex items-center justify-center gap-2 opacity-50 mb-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Ufal.png" className="h-6 grayscale" alt="UFAL" />
           </div>
           <p className="text-slate-400 text-xs">
             © {new Date().getFullYear()} Universidade Federal de Alagoas - Faculdade de Economia, Administração e Contabilidade.
           </p>
        </footer>
      </div>
    </div>
  );
};