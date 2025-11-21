import React, { useState, useEffect } from 'react';
import { ViewMode } from './types';
import { 
  LayoutGrid, 
  MessageCircle, 
  Settings, 
  Moon, 
  Sun, 
  LogOut, 
  Shield, 
  Lock,
  X,
  Save,
  GraduationCap,
  Menu
} from 'lucide-react';
import { DashboardView } from './views/DashboardView';
import { TutorView } from './views/TutorView';
import { getAiConfig, saveAiConfig } from './services/storageService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Auth & Settings
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [aiContext, setAiContext] = useState('');

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    if (showSettingsModal) {
      const config = getAiConfig();
      setAiContext(config.context);
    }
  }, [showSettingsModal]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'adm123') {
      setIsAdmin(true);
      setShowLoginModal(false);
      setPasswordInput('');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleSaveSettings = () => {
    saveAiConfig({ context: aiContext });
    setShowSettingsModal(false);
  };

  // --- Navigation Components ---

  const NavItemDesktop = ({ mode, icon: Icon, label }: { mode: ViewMode; icon: React.ElementType; label: string }) => {
    const isActive = currentView === mode;
    return (
      <button
        onClick={() => setCurrentView(mode)}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
          ${isActive 
            ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' 
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
          }
        `}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-slate-700 dark:group-hover:text-slate-200'}`} strokeWidth={2} />
        <span className="font-medium text-sm">{label}</span>
      </button>
    );
  };

  const NavItemMobile = ({ mode, icon: Icon, label }: { mode: ViewMode; icon: React.ElementType; label: string }) => {
    const isActive = currentView === mode;
    return (
      <button
        onClick={() => setCurrentView(mode)}
        className={`
          flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-all duration-300
          ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'}
        `}
      >
        <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-brand-50 dark:bg-brand-900/20' : ''}`}>
          <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
        </div>
        <span className="text-[10px] font-medium">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-500">
      
      {/* --- Desktop Sidebar --- */}
      <aside className="hidden md:flex flex-col w-72 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-30">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none text-slate-900 dark:text-white">Portal UFAL</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Painel Administrativo</p>
            </div>
          </div>

          <nav className="space-y-2">
            <NavItemDesktop mode={ViewMode.DASHBOARD} icon={LayoutGrid} label="Mural da Turma" />
            <NavItemDesktop mode={ViewMode.TUTOR} icon={MessageCircle} label="Monitor Virtual" />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100 dark:border-slate-800/50 space-y-4">
          {isAdmin ? (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Admin</span>
                </div>
                <button onClick={() => setIsAdmin(false)} className="text-slate-400 hover:text-red-500 transition-colors" title="Sair">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={() => setShowSettingsModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-white dark:bg-slate-800 rounded-xl text-sm font-medium shadow-sm border border-slate-200 dark:border-slate-700 hover:border-brand-300 transition-all"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                Configurar IA
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-sm font-medium"
            >
              <Lock className="w-4 h-4" />
              Acesso Representante
            </button>
          )}

          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center justify-between px-4 py-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-sm font-medium"
          >
            <span>Tema</span>
            {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 relative h-full w-full flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
        
        {/* Mobile Top Bar (Fixed) */}
        <header className="md:hidden fixed top-0 left-0 right-0 h-16 glass z-40 px-4 flex items-center justify-between transition-all">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-md shadow-brand-500/20">
                <GraduationCap className="w-5 h-5 text-white" />
             </div>
             <span className="font-bold text-slate-800 dark:text-white">UFAL</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            
            {isAdmin ? (
              <button 
                onClick={() => setShowSettingsModal(true)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400"
              >
                <Settings className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Content - Has padding for top/bottom bars on mobile */}
        <div className="flex-1 h-full overflow-y-auto custom-scrollbar md:p-0 pt-16 pb-20">
           {currentView === ViewMode.DASHBOARD ? (
             <DashboardView isAdmin={isAdmin} />
           ) : (
             <TutorView />
           )}
        </div>
        
        {/* Mobile Bottom Nav (Fixed) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex z-50 pb-safe">
          <NavItemMobile mode={ViewMode.DASHBOARD} icon={LayoutGrid} label="Mural" />
          <NavItemMobile mode={ViewMode.TUTOR} icon={MessageCircle} label="Monitor" />
        </nav>

      </main>

      {/* --- Login Modal --- */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-3xl shadow-2xl p-8 animate-scale-in border border-white/10">
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-900 dark:text-white">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Área Restrita</h3>
              <p className="text-sm text-slate-500 text-center mt-1">Acesso exclusivo para representantes.</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                placeholder="Senha de acesso"
                autoFocus
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-center focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
              {loginError && <p className="text-red-500 text-xs text-center font-bold animate-pulse">Senha incorreta</p>}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button type="button" onClick={() => setShowLoginModal(false)} className="py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Voltar</button>
                <button type="submit" className="py-3 rounded-xl text-sm font-bold bg-brand-600 text-white shadow-lg shadow-brand-500/25 hover:bg-brand-700 transition-all transform active:scale-95">Entrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Settings Modal --- */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[85vh] animate-slide-up overflow-hidden border border-white/10">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg">
                    <Settings className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                 </div>
                 <h3 className="font-bold text-lg text-slate-900 dark:text-white">Configurar IA</h3>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Contexto da Turma</label>
               <div className="relative">
                 <textarea 
                   className="w-full h-64 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-sm leading-relaxed focus:ring-2 focus:ring-brand-500 outline-none resize-none text-slate-700 dark:text-slate-300"
                   placeholder="Cole aqui o plano de ensino, datas importantes, regras da disciplina..."
                   value={aiContext}
                   onChange={(e) => setAiContext(e.target.value)}
                 />
               </div>
               <div className="mt-4 flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                  <div className="mt-0.5 text-blue-500"><GraduationCap className="w-5 h-5" /></div>
                  <p className="text-xs text-blue-600 dark:text-blue-300 leading-relaxed">
                    A Inteligência Artificial usará este contexto para responder dúvidas dos alunos no Monitor Virtual. Mantenha as datas e regras atualizadas.
                  </p>
               </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
               <button onClick={() => setShowSettingsModal(false)} className="px-6 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-white dark:hover:bg-slate-800 transition-all">Cancelar</button>
               <button onClick={handleSaveSettings} className="px-6 py-3 rounded-xl text-sm font-bold bg-brand-600 text-white shadow-lg shadow-brand-500/25 hover:bg-brand-700 flex items-center gap-2 transition-all transform active:scale-95">
                 <Save className="w-4 h-4" /> Salvar Alterações
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;