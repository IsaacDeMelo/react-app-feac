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
  Menu,
  ChevronRight
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

  const handleLogout = () => {
    setIsAdmin(false);
    setShowSettingsModal(false);
  };

  const handleSaveSettings = () => {
    saveAiConfig({ context: aiContext });
    setShowSettingsModal(false);
  };

  // --- Navigation Components ---

  const NavItemDesktop = ({ mode, icon: Icon, label, desc }: { mode: ViewMode; icon: React.ElementType; label: string, desc: string }) => {
    const isActive = currentView === mode;
    return (
      <button
        onClick={() => setCurrentView(mode)}
        className={`
          w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-300 group border
          ${isActive 
            ? 'bg-slate-900 text-white border-slate-900 dark:bg-brand-600 dark:border-brand-500 shadow-xl shadow-slate-900/10' 
            : 'bg-white text-slate-600 border-slate-100 hover:border-slate-200 hover:bg-slate-50 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800'
          }
        `}
      >
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl transition-colors ${isActive ? 'bg-white/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} strokeWidth={2} />
          </div>
          <div className="text-left">
            <span className="block font-bold text-sm">{label}</span>
            <span className={`text-xs ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>{desc}</span>
          </div>
        </div>
        {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
      </button>
    );
  };

  const NavItemMobile = ({ mode, icon: Icon, label }: { mode: ViewMode; icon: React.ElementType; label: string }) => {
    const isActive = currentView === mode;
    return (
      <button
        onClick={() => setCurrentView(mode)}
        className={`
          flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-all duration-300 relative
          ${isActive ? 'text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}
        `}
      >
        {isActive && (
          <span className="absolute -top-0.5 w-12 h-1 bg-red-600 dark:bg-red-400 rounded-b-xl shadow-lg shadow-red-500/50" />
        )}
        <div className={`p-2 rounded-2xl transition-all ${isActive ? 'bg-red-50 dark:bg-red-900/20 -translate-y-1' : ''}`}>
          <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
        </div>
        <span className="text-[10px] font-bold tracking-wide">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-500">
      
      {/* --- Desktop Sidebar --- */}
      <aside className="hidden md:flex flex-col w-80 h-full bg-slate-50/50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 z-30 backdrop-blur-xl">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-2 bg-white rounded-xl shadow-md border border-slate-100">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Ufal.png" 
                alt="UFAL Logo" 
                className="w-10 h-auto object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Portal UFAL</h1>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Online</p>
              </div>
            </div>
          </div>

          <nav className="space-y-3">
            <NavItemDesktop mode={ViewMode.DASHBOARD} icon={LayoutGrid} label="Mural da Turma" desc="Provas e atividades" />
            <NavItemDesktop mode={ViewMode.TUTOR} icon={MessageCircle} label="Monitor Virtual" desc="Tire dúvidas com IA" />
          </nav>
        </div>

        <div className="mt-auto p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
             <div className="flex items-center justify-between mb-4">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sistema</span>
               <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
             </div>

             {isAdmin ? (
               <div className="space-y-2">
                  <button 
                    onClick={() => setShowSettingsModal(true)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Settings className="w-4 h-4" /> Configurar IA
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sair do Admin
                  </button>
               </div>
             ) : (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-600 transition-all shadow-lg shadow-slate-900/20"
                >
                  <Lock className="w-4 h-4" />
                  Área do Representante
                </button>
             )}
          </div>
          <p className="text-[10px] text-center text-slate-400 font-medium">v2.0.4 • Portal Acadêmico</p>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 relative h-full w-full flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
        
        {/* Mobile Top Bar (Fixed & Improved) */}
        <header className="md:hidden fixed top-0 left-0 right-0 h-24 z-40 px-6 flex items-center justify-between transition-all shadow-lg bg-gradient-to-r from-red-700 to-red-900 rounded-b-[2rem]">
          <div className="flex items-center gap-4">
             <div className="bg-white p-2 rounded-2xl shadow-lg shadow-black/10">
               <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Ufal.png" 
                  alt="UFAL" 
                  className="w-8 h-auto object-contain"
               />
             </div>
             <div>
               <span className="block font-extrabold text-white text-lg leading-none tracking-tight">UFAL</span>
               <span className="text-[10px] font-bold text-red-200 uppercase tracking-widest opacity-90">Portal Acadêmico</span>
             </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-colors"
            >
              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            
            {isAdmin ? (
              <button 
                onClick={() => setShowSettingsModal(true)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-red-700 shadow-lg shadow-black/10 hover:bg-slate-50 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-colors"
              >
                <Lock className="w-5 h-5" />
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Content - PADDING FIX FOR MOBILE */}
        <div className="flex-1 h-full overflow-y-auto custom-scrollbar md:p-0 pt-28 pb-28">
           {currentView === ViewMode.DASHBOARD ? (
             <DashboardView isAdmin={isAdmin} />
           ) : (
             <TutorView />
           )}
        </div>
        
        {/* Mobile Bottom Nav (Fixed & Improved) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-start pt-2 z-50 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-none">
          <NavItemMobile mode={ViewMode.DASHBOARD} icon={LayoutGrid} label="Mural" />
          <NavItemMobile mode={ViewMode.TUTOR} icon={MessageCircle} label="Monitor" />
        </nav>

      </main>

      {/* --- Login Modal --- */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[70] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-[2rem] shadow-2xl p-8 animate-scale-in border border-white/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-700"></div>
            <div className="flex flex-col items-center mb-8 mt-2">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-900 dark:text-white shadow-inner">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Área Restrita</h3>
              <p className="text-sm text-slate-500 text-center mt-2 leading-relaxed">Acesso exclusivo para representantes de turma.</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                placeholder="Senha de acesso"
                autoFocus
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-4 text-center focus:ring-2 focus:ring-red-500 outline-none transition-all font-bold tracking-widest text-lg"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
              {loginError && <p className="text-red-500 text-xs text-center font-bold animate-pulse bg-red-50 dark:bg-red-900/20 py-2 rounded-lg">Senha incorreta</p>}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <button type="button" onClick={() => setShowLoginModal(false)} className="py-3.5 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Voltar</button>
                <button type="submit" className="py-3.5 rounded-2xl text-sm font-bold bg-red-600 text-white shadow-xl shadow-red-500/30 hover:bg-red-700 transition-all transform active:scale-95">Entrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Settings Modal --- */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[70] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2rem] shadow-2xl flex flex-col max-h-[85vh] animate-slide-up overflow-hidden border border-white/10">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-brand-100 dark:bg-brand-900/30 rounded-xl">
                    <Settings className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                 </div>
                 <div>
                   <h3 className="font-bold text-xl text-slate-900 dark:text-white">Configurações</h3>
                   <p className="text-xs text-slate-500">Administração do sistema</p>
                 </div>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"><X className="w-6 h-6 text-slate-500" /></button>
            </div>
            <div className="p-8 flex-1 overflow-y-auto bg-white dark:bg-slate-950">
               
               {/* Logout Section for Mobile within Modal */}
               <div className="md:hidden mb-8 p-5 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600">
                      <LogOut className="w-5 h-5" />
                    </div>
                    <div className="text-red-900 dark:text-red-200 font-bold">Encerrar Sessão</div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                  >
                    Sair Agora
                  </button>
               </div>

               <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4">Contexto da IA (Disciplina)</label>
               <div className="relative">
                 <textarea 
                   className="w-full h-64 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-sm leading-relaxed focus:ring-2 focus:ring-brand-500 outline-none resize-none text-slate-700 dark:text-slate-300 font-medium shadow-inner"
                   placeholder="Cole aqui o plano de ensino, datas importantes, regras da disciplina..."
                   value={aiContext}
                   onChange={(e) => setAiContext(e.target.value)}
                 />
               </div>
               <div className="mt-6 flex items-start gap-4 p-5 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                  <div className="mt-1 text-blue-600 dark:text-blue-400"><GraduationCap className="w-6 h-6" /></div>
                  <div>
                    <p className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-1">Como funciona?</p>
                    <p className="text-xs text-blue-600/80 dark:text-blue-300/70 leading-relaxed">
                      A Inteligência Artificial usará este texto base para responder dúvidas. Além disso, ela lerá automaticamente as atividades do "Mural da Turma" para informar sobre datas de provas e entregas.
                    </p>
                  </div>
               </div>
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm">
               <button onClick={() => setShowSettingsModal(false)} className="px-8 py-4 rounded-2xl text-sm font-bold text-slate-500 hover:bg-white dark:hover:bg-slate-800 transition-all">Cancelar</button>
               <button onClick={handleSaveSettings} className="px-8 py-4 rounded-2xl text-sm font-bold bg-brand-600 text-white shadow-xl shadow-brand-500/30 hover:bg-brand-700 flex items-center gap-2 transition-all transform active:scale-95">
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