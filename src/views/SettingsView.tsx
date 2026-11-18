/**
 * Página de Configurações do Meu Planner
 */
import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  Palette, 
  Calendar, 
  Bell, 
  Cloud, 
  Tag, 
  Plus, 
  Trash2, 
  Check, 
  RefreshCw, 
  ExternalLink,
  Volume2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { Category, UserProfile } from '../types/planner';
import { sound } from '../services/sound';
import { getStoredFirebaseConfig, FirebaseConfigParams } from '../services/firebaseConfig';

const AVATAR_OPTIONS = [
  '/imagens/kurumi.jpg',
  '/imagens/pachacco.jpg',
  '/imagens/pomporim.jpg',
  '/imagens/chococat.jpg',
  '/imagens/keropi.jpg',
];
export const SettingsView: React.FC = () => {
  const { 
    userProfile, 
    updateUserProfile, 
    categories, 
    addCategory, 
    deleteCategory,
    firebaseStatus,
    saveFirebaseCredentials,
    disconnectFirebase,
    testCloudConnection,
    showToast
  } = usePlanner();

  // Formulário Perfil
  const [name, setName] = useState(userProfile.displayName);
  const [email, setEmail] = useState(userProfile.email);
  const [avatar, setAvatar] = useState(userProfile.avatarUrl);
  const [customAvatarInput, setCustomAvatarInput] = useState('');

  // Formulário Categoria
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#D9A2B5');

  // Formulário Firebase
  const initialFirebase = getStoredFirebaseConfig() || {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    appId: '',
  };
  const [fbApiKey, setFbApiKey] = useState(initialFirebase.apiKey || '');
  const [fbAuthDomain, setFbAuthDomain] = useState(initialFirebase.authDomain || '');
  const [fbProjectId, setFbProjectId] = useState(initialFirebase.projectId || '');
  const [fbStorageBucket, setFbStorageBucket] = useState(initialFirebase.storageBucket || '');
  const [fbAppId, setFbAppId] = useState(initialFirebase.appId || '');
  const [isTestingCloud, setIsTestingCloud] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      displayName: name,
      email: email,
      avatarUrl: customAvatarInput.trim() || avatar,
    });
    setCustomAvatarInput('');
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    addCategory({
      name: newCatName.trim(),
      color: newCatColor,
      bgColor: `${newCatColor}18`,
      iconName: 'Tag',
      isCustom: true,
    });

    setNewCatName('');
  };

  const handleSaveFirebase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fbApiKey.trim() || !fbProjectId.trim()) {
      showToast('Por favor, informe pelo menos API Key e Project ID.', 'warning');
      return;
    }

    setIsTestingCloud(true);
    await saveFirebaseCredentials({
      apiKey: fbApiKey.trim(),
      authDomain: fbAuthDomain.trim() || `${fbProjectId.trim()}.firebaseapp.com`,
      projectId: fbProjectId.trim(),
      storageBucket: fbStorageBucket.trim() || undefined,
      appId: fbAppId.trim() || undefined,
    });
    setIsTestingCloud(false);
  };

  const handleManualTestCloud = async () => {
    setIsTestingCloud(true);
    const res = await testCloudConnection();
    setIsTestingCloud(false);
    if (res.success) {
      showToast(res.message, 'success');
    } else {
      showToast(res.message, 'warning');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      
      {/* Topo de Configurações */}
      <div className="p-5 rounded-3xl bg-white border border-[#F4DCE5] shadow-planner flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-[#F9EAF0] text-[#B26E86]">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-sans-planner text-2xl font-bold text-[#75656D]">
            Configurações & Personalização
          </h2>
          <p className="text-[11px] text-[#A697A0]">
            Personalize seu perfil, aparência, notificações e armazenamento em nuvem
          </p>
        </div>
      </div>

      {/* 1. SEÇÃO PERFIL DA USUÁRIA */}
      <div className="bg-white rounded-3xl border border-[#F4DCE5] p-6 shadow-planner space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F9EAF0]">
          <User className="w-4 h-4 text-[#B26E86]" />
          <h3 className="font-sans-planner text-lg font-bold text-[#75656D]">
            Perfil da Usuária
          </h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <img 
              src={avatar} 
              alt={name} 
              className="w-16 h-16 rounded-full object-cover border-2 border-[#D9A2B5] shadow-sm"
            />
            <div className="space-y-1.5 text-center sm:text-left">
              <span className="text-xs font-semibold text-[#75656D] block">Escolha um avatar delicado:</span>
              <div className="flex gap-2 justify-center sm:justify-start">
                {AVATAR_OPTIONS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatar(url)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform ${
                      avatar === url ? 'border-[#B26E86] scale-110 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="Avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#75656D] mb-1">Nome de Exibição</label>
              <input 
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4DCE5] outline-none text-[#75656D]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#75656D] mb-1">E-mail</label>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#F4DCE5] outline-none text-[#75656D]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#D9A2B5] hover:bg-[#C98A9F] text-white text-xs font-semibold shadow-xs"
            >
              Salvar Perfil
            </button>
          </div>
        </form>
      </div>

      {/* 2. SEÇÃO PREFERÊNCIAS DE CALENDÁRIO & FORMATO */}
      <div className="bg-white rounded-3xl border border-[#F4DCE5] p-6 shadow-planner space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#F9EAF0]">
          <Calendar className="w-4 h-4 text-[#B26E86]" />
          <h3 className="font-sans-planner text-lg font-bold text-[#75656D]">
            Preferências do Calendário
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-[#75656D] mb-1">Primeiro dia da semana</label>
            <select
              value={userProfile.firstDayOfWeek}
              onChange={(e) => updateUserProfile({ firstDayOfWeek: e.target.value as 'sunday' | 'monday' })}
              className="w-full px-3 py-2 rounded-xl border border-[#F4DCE5] bg-white outline-none text-[#75656D]"
            >
              <option value="sunday">Domingo (Padrão tradicional)</option>
              <option value="monday">Segunda-feira (Padrão de trabalho)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#75656D] mb-1">Formato de Data</label>
            <select
              value={userProfile.dateFormat}
              onChange={(e) => updateUserProfile({ dateFormat: e.target.value as UserProfile['dateFormat'] })}
              className="w-full px-3 py-2 rounded-xl border border-[#F4DCE5] bg-white outline-none text-[#75656D]"
            >
              <option value="DD/MM/YYYY">DD/MM/AAAA (Brasil)</option>
              <option value="YYYY-MM-DD">AAAA-MM-DD (ISO)</option>
              <option value="MM/DD/YYYY">MM/DD/AAAA (EUA)</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-xs text-[#75656D] cursor-pointer">
            <input 
              type="checkbox"
              checked={userProfile.soundEnabled}
              onChange={(e) => updateUserProfile({ soundEnabled: e.target.checked })}
              className="rounded text-[#D9A2B5] focus:ring-[#F9EAF0]"
            />
            <span>Sons harmoniosos em lembretes e tarefas concluídas</span>
          </label>
        </div>
      </div>

      {/* 3. SEÇÃO CATEGORIAS PERSONALIZADAS */}
      <div className="bg-white rounded-3xl border border-[#F4DCE5] p-6 shadow-planner space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F9EAF0]">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#B26E86]" />
            <h3 className="font-sans-planner text-lg font-bold text-[#75656D]">
              Categorias Personalizadas ({categories.length})
            </h3>
          </div>
        </div>

        {/* Lista de Categorias Atuais */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              style={{ backgroundColor: cat.bgColor, borderColor: `${cat.color}40` }}
              className="p-3 rounded-2xl border flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span 
                  style={{ backgroundColor: cat.color }} 
                  className="w-3 h-3 rounded-full shrink-0" 
                />
                <span className="text-xs font-semibold text-[#63535B] truncate">
                  {cat.name}
                </span>
              </div>
              {cat.isCustom && (
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="text-rose-400 hover:text-rose-600 p-0.5"
                  title="Excluir categoria"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Criar Nova Categoria */}
        <form onSubmit={handleAddCategory} className="pt-3 border-t border-[#F9EAF0] flex flex-col sm:flex-row items-center gap-3">
          <input 
            type="text"
            required
            placeholder="Nome da nova categoria (ex: Academia, Finanças, Viagens)..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 w-full px-3 py-2 text-xs rounded-xl border border-[#F4DCE5] outline-none text-[#75656D]"
          />

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#75656D]">Cor:</span>
            {['#D9A2B5', '#B399D4', '#E8A598', '#97C1A9', '#80B3B3', '#C5A059', '#F4A261'].map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setNewCatColor(c)}
                style={{ backgroundColor: c }}
                className={`w-6 h-6 rounded-full transition-transform ${
                  newCatColor === c ? 'ring-2 ring-[#75656D] scale-110' : 'opacity-80 hover:opacity-100'
                }`}
              />
            ))}
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#D9A2B5] hover:bg-[#C98A9F] text-white text-xs font-semibold shadow-xs shrink-0"
          >
            + Adicionar
          </button>
        </form>
      </div>

      {/* 4. SEÇÃO BANCO DE DADOS & ARMAZENAMENTO NA NUVEM (FIREBASE) */}
      <div className="bg-white rounded-3xl border border-[#F4DCE5] p-6 shadow-planner space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F9EAF0]">
          <div className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-[#B26E86]" />
            <div>
              <h3 className="font-sans-planner text-lg font-bold text-[#75656D]">
                Armazenamento na Nuvem & Firebase
              </h3>
              <p className="text-[11px] text-[#A697A0]">
                Cloud Firestore & Firebase Authentication
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
            firebaseStatus.isConnected
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-amber-100 text-amber-800 border border-amber-200'
          }`}>
            {firebaseStatus.isConnected ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Nuvem Conectada e Ativa</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Modo Local Seguro</span>
              </>
            )}
          </div>
        </div>

        {/* Mensagem explicativa */}
        <div className="p-4 rounded-2xl bg-[#FFF9F4] border border-[#F4DCE5] text-xs text-[#75656D] space-y-2 leading-relaxed">
          <p>
            🔒 <strong>Seus dados estão 100% seguros:</strong> Toda a sua rotina, compromissos, tarefas e anotações são salvas automaticamente em tempo real e permanecem intactas ao fechar o navegador ou atualizar a página.
          </p>
          <p className="text-[#8C7A83]">
            Para sincronizar com os servidores do Firebase Cloud Firestore, preencha os dados do seu projeto abaixo ou teste a conexão imediata.
          </p>
        </div>

        {/* Formulário Firebase */}
        <form onSubmit={handleSaveFirebase} className="space-y-3 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-[#75656D] mb-1">API Key *</label>
              <input 
                type="text"
                placeholder="AIzaSy..."
                value={fbApiKey}
                onChange={(e) => setFbApiKey(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-[#F4DCE5] outline-none text-[#75656D]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#75656D] mb-1">Project ID *</label>
              <input 
                type="text"
                placeholder="meu-planner-app"
                value={fbProjectId}
                onChange={(e) => setFbProjectId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-[#F4DCE5] outline-none text-[#75656D]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-[#75656D] mb-1">Auth Domain (opcional)</label>
              <input 
                type="text"
                placeholder="projeto.firebaseapp.com"
                value={fbAuthDomain}
                onChange={(e) => setFbAuthDomain(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-[#F4DCE5] outline-none text-[#75656D]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#75656D] mb-1">Storage Bucket (opcional)</label>
              <input 
                type="text"
                placeholder="projeto.appspot.com"
                value={fbStorageBucket}
                onChange={(e) => setFbStorageBucket(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-[#F4DCE5] outline-none text-[#75656D]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#75656D] mb-1">App ID (opcional)</label>
              <input 
                type="text"
                placeholder="1:123456789:web:abcdef"
                value={fbAppId}
                onChange={(e) => setFbAppId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-[#F4DCE5] outline-none text-[#75656D]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
            <button
              type="button"
              onClick={handleManualTestCloud}
              disabled={isTestingCloud}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#F9EAF0] text-[#75656D] border border-[#E8C2D1] text-xs font-medium transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#B26E86] ${isTestingCloud ? 'animate-spin' : ''}`} />
              <span>Testar Conexão em Tempo Real</span>
            </button>

            <div className="flex items-center gap-2">
              {firebaseStatus.isConfigured && (
                <button
                  type="button"
                  onClick={disconnectFirebase}
                  className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors"
                >
                  Desconectar
                </button>
              )}
              <button
                type="submit"
                disabled={isTestingCloud}
                className="px-5 py-2 rounded-xl bg-[#D9A2B5] hover:bg-[#C98A9F] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Salvar Credenciais da Nuvem
              </button>
            </div>
          </div>
        </form>
      </div>

    </div>
  );
};
