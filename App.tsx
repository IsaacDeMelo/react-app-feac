import React, { useState, useEffect } from 'react';
import { ViewMode } from './types';
import { LayoutDashboard, Briefcase, Menu, Lock, LogOut, Settings, Moon, Sun, X, Save, ShieldCheck } from 'lucide-react';
import { DashboardView } from './views/DashboardView';
import { TutorView } from './views/TutorView';
import { getAiConfig, saveAiConfig } from './services/storageService';

// UFAL Logo Component
const AdmSymbol = ({ className }: { className?: string }) => (
  <img 
    src="https://ufal.br/ufal/comunicacao/identidade-visual/brasao/sigla/png.png" 
    alt="Brasão UFAL" 
    className={`object-contain drop-shadow-md ${className}`}
  />
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to Light Mode
  
  // Auth & Settings State
  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [loginError, setLoginError] = useState(false);
  
  // AI Config Form
  const [aiContext, setAiContext] = useState('');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (showSettingsModal) {
      const config = getAiConfig();
      setAiContext(config.context);
    }
  }, [showSettingsModal]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'adm123') {
      setIsAdmin(true);
      setShowLoginModal(false);
      setPasswordInput('');
      setLoginError(false);
    } else {
      setLoginError(true);
      // Shake effect could go here
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

  const renderView = () => {
    switch (currentView) {
      case ViewMode.DASHBOARD:
        return <DashboardView isAdmin={isAdmin} />;
      case ViewMode.TUTOR:
        return <TutorView />;
      default:
        return <DashboardView isAdmin={isAdmin} />;
    }
  };

  const NavItem = ({ mode, icon: Icon, label }: { mode: ViewMode; icon: React.ElementType; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(mode);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl transition-all duration-300 group ${
        currentView === mode
          ? 'bg-navy-900 text-white dark:bg-white dark:text-black shadow-xl shadow-navy-900/20 dark:shadow-white/10 font-semibold'
          : 'text-navy-900/60 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-navy-900 dark:hover:text-white'
      }`}
    >
      <Icon className={`w-6 h-6 transition-transform duration-300 group-hover:scale-110 ${currentView === mode ? '' : ''}`} />
      <span className="font-sans tracking-tight text-[15px]">{label}</span>
    </button>
  );

  return (
    <div className={`flex h-screen transition-all duration-1000 ease-in-out ${
      isAdmin 
        ? 'border-[6px] border-gold-500/30 dark:border-gold-400/20 animate-admin-glow' 
        : 'border-[0px] border-transparent'
    }`}>
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 glass border-b border-gray-200/50 dark:border-white/10 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 relative flex items-center justify-center">
             <AdmSymbol className="w-full h-full" />
           </div>
           <h1 className="text-xl font-sans font-bold text-navy-900 dark:text-white tracking-tight">Portal UFAL</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-slate-300">
             {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-slate-300">
            <Menu className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-96 bg-white dark:bg-[#0f1115]/90 backdrop-blur-3xl border-r border-slate-200 dark:border-white/5 transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1)
        ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-10 h-full flex flex-col">
          {/* Logo Area */}
          <div className="flex flex-col items-center gap-6 mb-14 pt-6">
            <div className="relative group cursor-default">
              <div className="absolute -inset-10 bg-gradient-to-r from-blue-500/20 to-navy-900/20 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition duration-700"></div>
              <div className="relative w-40 h-40 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
                <AdmSymbol className="w-full h-full" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <h1 className="text-3xl font-sans font-bold text-navy-900 dark:text-white leading-none tracking-tight">Administração</h1>
              <p className="text-sm text-navy-900/50 dark:text-gray-400 font-medium tracking-[0.2em] uppercase">UFAL</p>
            </div>
          </div>

          <nav className="space-y-3 flex-1">
            <NavItem mode={ViewMode.DASHBOARD} icon={LayoutDashboard} label="Mural Acadêmico" />
            <NavItem mode={ViewMode.TUTOR} icon={Briefcase} label="Monitoria Virtual" />
          </nav>
          
          <div className="space-y-5 pt-8 mt-8 border-t border-slate-100 dark:border-white/5">
            {/* Theme Toggle Desktop */}
            <button 
              onClick={toggleTheme}
              className="hidden lg:flex w-full items-center justify-between px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-navy-900/50 dark:text-slate-400 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <span>Tema {isDarkMode ? 'Escuro' : 'Claro'}</span>
              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {!isAdmin ? (
              <button 
                onClick={() => { setIsMobileMenuOpen(false); setShowLoginModal(true); }}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-navy-900/60 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                <Lock className="w-5 h-5" />
                <span className="text-[15px] font-medium">Acesso dos Representantes</span>
              </button>
            ) : (
              <div className="bg-gradient-to-b from-gold-500/10 to-transparent rounded-3xl p-6 border border-gold-500/20 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-gold-600 dark:text-gold-400" />
                    <span className="text-xs font-bold text-gold-700 dark:text-gold-400 uppercase tracking-widest">Modo Admin</span>
                  </div>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
                
                <button 
                  onClick={() => setShowSettingsModal(true)}
                  className="w-full flex items-center justify-center gap-3 py-3.5 bg-white dark:bg-white/10 backdrop-blur-sm rounded-2xl text-sm font-bold text-navy-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 shadow-sm transition-all"
                >
                  <Settings className="w-4 h-4" />
                  Treinar Monitor
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden transition-opacity duration-500"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 h-full pt-24 lg:pt-0 p-6 lg:p-12 overflow-hidden relative bg-slate-100 dark:bg-transparent">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-white to-transparent dark:from-navy-900/20 dark:to-transparent -z-10 pointer-events-none"></div>
        
        <div className="max-w-screen-2xl mx-auto h-full flex flex-col animate-fade-in">
          {renderView()}
        </div>
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xl z-[60] flex items-center justify-center p-6 transition-all duration-500">
          <div className="bg-white dark:bg-[#161618] border border-gray-200/50 dark:border-white/10 w-full max-w-md rounded-[2rem] shadow-2xl p-10 animate-slide-up">
            <div className="mb-10 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lock className="w-7 h-7 text-navy-900 dark:text-white" />
              </div>
              <h2 className="text-3xl font-sans font-bold text-navy-900 dark:text-white tracking-tight">Área dos Representantes</h2>
              <p className="text-gray-500 dark:text-gray-400 text-base mt-3">Acesso exclusivo para a administração da turma.</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <input
                  type="password"
                  autoFocus
                  placeholder="Senha de acesso"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-2xl px-6 py-4 text-center text-lg text-navy-900 dark:text-white focus:ring-2 focus:ring-navy-800 dark:focus:ring-gold-500/50 outline-none transition-all placeholder-gray-400"
                />
              </div>
              {loginError && (
                <p className="text-red-500 text-sm text-center font-medium animate-bounce">
                  Senha incorreta. Tente novamente.
                </p>
              )}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => { setShowLoginModal(false); setLoginError(false); setPasswordInput(''); }}
                  className="py-4 rounded-2xl text-gray-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 font-medium transition-colors text-base"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="py-4 rounded-2xl bg-navy-900 hover:bg-navy-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-bold shadow-lg transition-transform active:scale-95 text-base"
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xl z-[60] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-[#161618] border border-gray-200/50 dark:border-white/10 w-full max-w-3xl rounded-[2rem] shadow-2xl flex flex-col max-h-[85vh] animate-slide-up overflow-hidden">
            <div className="flex justify-between items-center p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gold-500/10 rounded-xl">
                   <Settings className="w-6 h-6 text-gold-600 dark:text-gold-500" />
                </div>
                <div>
                  <h3 className="text-xl font-sans font-bold text-navy-900 dark:text-white tracking-tight">Configuração Acadêmica</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Personalize o comportamento do Monitor Virtual</p>
                </div>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-10 overflow-y-auto flex-1">
              <div className="bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-6 rounded-3xl mb-8">
                <h4 className="text-base font-bold text-navy-900 dark:text-blue-400 mb-3">Instruções da Representação</h4>
                <p className="text-base text-navy-900/70 dark:text-blue-300/80 leading-relaxed">
                  As informações inseridas abaixo serão utilizadas pela Inteligência Artificial para contextualizar as respostas aos alunos. Inclua cronogramas, bibliografias e avisos importantes.
                </p>
              </div>

              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 pl-2">Contexto da Disciplina</label>
              <textarea 
                value={aiContext}
                onChange={(e) => setAiContext(e.target.value)}
                className="w-full h-80 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-3xl p-6 text-navy-900 dark:text-white focus:ring-2 focus:ring-gold-500/50 outline-none transition-all resize-none font-mono text-base leading-relaxed shadow-inner"
                placeholder="Ex: Prezados alunos, a prova bimestral cobrirá os capítulos 1 a 4 do livro do Chiavenato..."
              />
            </div>

            <div className="p-8 border-t border-slate-100 dark:border-white/5 flex justify-end gap-4 bg-slate-50/50 dark:bg-white/5 backdrop-blur-xl">
               <button 
                onClick={() => setShowSettingsModal(false)}
                className="px-8 py-4 rounded-2xl text-navy-900/60 dark:text-gray-300 hover:bg-slate-200/50 dark:hover:bg-white/5 font-medium transition-colors text-base"
              >
                Descartar
              </button>
              <button 
                onClick={handleSaveSettings}
                className="px-10 py-4 rounded-2xl bg-navy-900 hover:bg-navy-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-bold shadow-lg flex items-center gap-3 transition-all transform active:scale-95 text-base"
              >
                <Save className="w-5 h-5" />
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;