
/**
 * Modal de Autenticação Firebase: Login, Cadastro e Recuperação de Senha
 */
import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { 
  getFirebaseInstances, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut
} from '../services/firebaseConfig';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, currentUser, showToast, updateUserProfile } = usePlanner();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setErrorMessage(null);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const { auth } = getFirebaseInstances();
    if (!auth) {
      // Se Firebase ainda não foi configurado nas credenciais, permitir cadastro local suave
      if (mode === 'signup' && name.trim()) {
        updateUserProfile({ displayName: name.trim(), email: email.trim() });
        showToast('Perfil local criado com sucesso! ✨', 'success');
        handleClose();
        setIsLoading(false);
        return;
      }
      setErrorMessage('As chaves do Firebase precisam ser preenchidas em Configurações > Conexão Nuvem para login remoto.');
      setIsLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
        showToast('Login realizado com sucesso! Bem-vinda de volta.', 'success');
        handleClose();
      } else if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          updateUserProfile({ displayName: name.trim(), email: email.trim() });
        }
        showToast('Conta criada com sucesso no Firebase!', 'success');
        handleClose();
      } else if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        showToast('E-mail de recuperação enviado! Verifique sua caixa de entrada.', 'success');
        setMode('login');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ocorreu um erro na autenticação.';
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setErrorMessage('E-mail ou senha incorretos.');
      } else if (msg.includes('email-already-in-use')) {
        setErrorMessage('Este e-mail já está cadastrado.');
      } else if (msg.includes('weak-password')) {
        setErrorMessage('A senha deve conter pelo menos 6 caracteres.');
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { auth } = getFirebaseInstances();
    if (!auth) {
      setErrorMessage('Configure suas chaves do Firebase em Configurações > Conexão Nuvem.');
      return;
    }

    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user.displayName) {
        updateUserProfile({ 
          displayName: result.user.displayName, 
          email: result.user.email || '',
          avatarUrl: result.user.photoURL || undefined 
        });
      }
      showToast('Conectado via Google com sucesso!', 'success');
      handleClose();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Falha ao autenticar com Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const { auth } = getFirebaseInstances();
    if (auth) {
      await signOut(auth);
    }
    showToast('Você saiu da sua conta.', 'info');
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#F4DCE5] animate-in zoom-in-95 duration-150">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F9EAF0]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#F9EAF0] flex items-center justify-center text-[#B26E86]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-sans-planner text-lg font-bold text-[#75656D]">
                {currentUser ? 'Sua Conta' : mode === 'login' ? 'Entrar no Meu Planner' : mode === 'signup' ? 'Criar Conta' : 'Recuperar Senha'}
              </h3>
              <p className="text-[10px] text-[#A697A0]">Autenticação segura na nuvem</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-1 text-[#9B8C94] hover:text-[#75656D]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Usuário já logado */}
        {currentUser ? (
          <div className="pt-4 space-y-4 text-center">
            <div className="p-4 rounded-2xl bg-[#FFF9F4] border border-[#F4DCE5] text-xs space-y-1">
              <p className="text-[11px] text-[#A697A0]">Conectado como:</p>
              <p className="font-semibold text-[#75656D]">{currentUser.email}</p>
              <p className="text-[10px] text-emerald-600 font-medium">✓ Sessão ativa no Firebase</p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Fazer Logout (Sair)
            </button>
          </div>
        ) : (
          <form onSubmit={handleAuthSubmit} className="pt-4 space-y-3.5">
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-700 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-[#75656D] mb-1">Seu Nome</label>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#F4DCE5] text-xs">
                  <User className="w-3.5 h-3.5 text-[#D9A2B5]" />
                  <input 
                    type="text"
                    required
                    placeholder="Vitória Miranda"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-transparent outline-none text-[#75656D]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#75656D] mb-1">E-mail</label>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#F4DCE5] text-xs">
                <Mail className="w-3.5 h-3.5 text-[#D9A2B5]" />
                <input 
                  type="email"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent outline-none text-[#75656D]"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="block text-xs font-semibold text-[#75656D] mb-1">
                  Senha
                </label>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#F4DCE5] text-xs">
                  <Lock className="w-3.5 h-3.5 text-[#D9A2B5]" />

                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent outline-none text-[#75656D]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#D9A2B5] hover:text-[#B26E86] transition-colors"
                    title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] text-[#B26E86] hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-[#D9A2B5] hover:bg-[#C98A9F] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              {isLoading ? 'Carregando...' : mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Cadastrar' : 'Enviar Link de Redefinição'}
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-1.5 bg-white hover:bg-[#FFF9F4] text-[#75656D] border border-[#F4DCE5] text-xs font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.97 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Continuar com Google</span>
            </button>

            <div className="pt-2 text-center text-xs text-[#8C7A83]">
              {mode === 'login' ? (
                <p>
                  Ainda não tem conta?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="font-semibold text-[#B26E86] hover:underline"
                  >
                    Criar cadastro
                  </button>
                </p>
              ) : (
                <p>
                  Já possui conta?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-semibold text-[#B26E86] hover:underline"
                  >
                    Fazer login
                  </button>
                </p>
              )}
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
