import React, { useState, useEffect } from 'react';
import { ViewMode } from './types';
import { 
  LayoutDashboard, 
  MessageSquareText, 
  Settings, 
  Moon, 
  Sun, 
  LogOut, 
  ShieldCheck, 
  Lock,
  X,
  Save,
  GraduationCap
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

  const NavItem = ({ mode, icon: Icon, label }: { mode: ViewMode; icon: React.ElementType; label: string }) => {
    const isActive = currentView === mode;
    return (
      <button
        onClick={() => setCurrentView(mode)}
        className={`
          relative flex flex-col md:flex-row items-center md:gap-3 p-2 md:px-4 md:py-3 rounded-xl transition-all duration-200
          ${isActive 
            ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20' 
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
          }
        `}
      >
        <Icon className={`w-6 h-6 md:w-5 md:h-5 ${isActive ? 'fill-current opacity-20' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
        <span className={`text-[10px] md:text-sm font-medium mt-1 md:mt-0 ${isActive ? 'font-bold' : ''}`}>
          {label}
        </span>
        {isActive && (
          <span className="absolute -bottom-2 md:left-0 md:top-0 md:bottom-0 md:w-1 md:h-full w-1 h-1 rounded-full bg-brand-600 hidden md:block" />
        )}
      </button>
    );
  };

  return (
    <div className="flex h-screen w-full bg-surface-50 dark:bg-surface-900 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      
      {/* --- Desktop Sidebar --- */}
      <aside className="hidden md:flex flex-col w-72 h-full bg-white dark:bg-surface-800 border-r border-gray-200 dark:border-white/5 z-20 shadow-sm">
        <div className="p-6 flex flex-col items-center border-b border-gray-100 dark:border-white/5">
          <div className="w-16 h-16 bg-gradient-to-tr from-brand-600 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Portal UFAL</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">Administração</p>
        </div>

        <div className="flex-1 px-4 py-6 space-y-2">
          <NavItem mode={ViewMode.DASHBOARD} icon={LayoutDashboard} label="Mural Acadêmico" />
          <NavItem mode={ViewMode.TUTOR} icon={MessageSquareText} label="Monitor Virtual" />
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-white/5 space-y-3">
          {isAdmin ? (
            <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-4 border border-brand-100 dark:border-brand-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                  <span className="text-xs font-bold text-brand-700 dark:text-brand-300 uppercase">Admin</span>
                </div>
                <button onClick={() => setIsAdmin(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={() => setShowSettingsModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2 bg-white dark:bg-surface-900 rounded-lg text-sm font-medium shadow-sm hover:shadow transition-all"
              >
                <Settings className="w-4 h-4" />
                Configurar IA
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-sm font-medium"
            >
              <Lock className="w-4 h-4" />
              Acesso Representante
            </button>
          )}

          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center justify-between px-4 py-3 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-sm font-medium"
          >
            <span>Modo Escuro</span>
            {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 relative h-full w-full flex flex-col overflow-hidden">
        {/* Background Texture */}
        <div className="absolute inset-0 bg-dot-pattern opacity-[0.4] pointer-events-none" />
        
        {/* Content Container */}
        <div className="flex-1 overflow-hidden relative pb-20 md:pb-0">
           {/* Header Mobile */}
           <div className="md:hidden h-16 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-4 sticky top-0 z-30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg">UFAL</span>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full bg-gray-100 dark:bg-surface-800">
                    {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                 </button>
                 {isAdmin ? (
                   <button onClick={() => setShowSettingsModal(true)} className="p-2 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-600">
                     <Settings className="w-5 h-5" />
                   </button>
                 ) : (
                   <button onClick={() => setShowLoginModal(true)} className="p-2 rounded-full bg-gray-100 dark:bg-surface-800">
                     <Lock className="w-5 h-5" />
                   </button>
                 )}
              </div>
           </div>

           <div className="h-full overflow-y-auto custom-scrollbar">
              {currentView === ViewMode.DASHBOARD ? <DashboardView isAdmin={isAdmin} /> : <TutorView />}
           </div>
        </div>
      </main>

      {/* --- Mobile Bottom Nav --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white dark:bg-surface-800 border-t border-gray-200 dark:border-white/5 flex items-center justify-around px-6 pb-4 pt-2 z-40 shadow-lg shadow-black/10">
        <NavItem mode={ViewMode.DASHBOARD} icon={LayoutDashboard} label="Mural" />
        <NavItem mode={ViewMode.TUTOR} icon={MessageSquareText} label="Monitor" />
      </nav>

      {/* --- Login Modal --- */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-800 w-full max-w-xs rounded-3xl shadow-2xl p-6 animate-slide-up border border-white/20">
            <div className="flex flex-col items-center mb-6">
              <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center mb-3 text-brand-600">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Acesso Restrito</h3>
              <p className="text-xs text-gray-500 text-center mt-1">Apenas representantes de turma.</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="password"
                placeholder="Senha"
                autoFocus
                className="w-full bg-gray-50 dark:bg-surface-900 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-center focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
              {loginError && <p className="text-red-500 text-xs text-center font-medium">Senha incorreta.</p>}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button type="button" onClick={() => setShowLoginModal(false)} className="py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5">Cancelar</button>
                <button type="submit" className="py-2.5 rounded-xl text-sm font-bold bg-brand-600 text-white shadow-lg shadow-brand-500/20 hover:bg-brand-700">Entrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Settings Modal --- */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-800 w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[80vh] animate-slide-up border border-white/20">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-white/5">
              <h3 className="font-bold text-lg">Configurar Monitor IA</h3>
              <button onClick={() => setShowSettingsModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
               <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Contexto da Turma</label>
               <textarea 
                 className="w-full h-64 bg-gray-50 dark:bg-surface-900 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-sm leading-relaxed focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                 placeholder="Digite aqui o cronograma, regras e bibliografia..."
                 value={aiContext}
                 onChange={(e) => setAiContext(e.target.value)}
               />
               <p className="text-xs text-gray-400 mt-2">A IA usará estas informações para responder aos alunos.</p>
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-white/5 flex justify-end gap-3">
               <button onClick={() => setShowSettingsModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5">Cancelar</button>
               <button onClick={handleSaveSettings} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-600 text-white shadow-lg flex items-center gap-2">
                 <Save className="w-4 h-4" /> Salvar
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
