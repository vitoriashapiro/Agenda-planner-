/**
 * Central de Lembretes e Sistema de Notificações
 */
import React, { useState } from 'react';
import { 
  Clock, 
  Plus, 
  Bell, 
  BellRing, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  Trash2, 
  Sparkles, 
  Volume2, 
  Info,
  Calendar,
  Heart
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { PlannerReminder } from '../types/planner';
import { notificationService } from '../services/notificationService';
import { sound } from '../services/sound';
import { getTodayString } from '../services/storageService';

type ReminderTab = 'future' | 'sent' | 'completed' | 'overdue';

export const RemindersView: React.FC = () => {
  const { 
    reminders, 
    addReminder, 
    updateReminder, 
    deleteReminder, 
    updateReminderStatus, 
    toggleReminderFavorite,
    openQuickAdd,
    showToast,
    userProfile 
  } = usePlanner();

  const [activeTab, setActiveTab] = useState<ReminderTab>('future');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => 
    notificationService.getPermission()
  );

  const todayStr = getTodayString();
  const now = new Date();
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const handleRequestPermission = async () => {
    const res = await notificationService.requestPermission();
    setNotificationPermission(res);
    if (res === 'granted') {
      showToast('Permissão de notificações concedida com sucesso! 🔔', 'success');
      notificationService.sendNotification('Meu Planner', {
        body: 'Notificações ativadas! Você receberá seus lembretes pontualmente.',
      });
    } else {
      showToast('Permissão de notificações não foi autorizada no navegador.', 'warning');
    }
  };

  const handleTestSound = () => {
    sound.playChime();
    showToast('Som suave de lembrete reproduzido! 🎶', 'info');
  };

  const handleTestNotification = () => {
    const sent = notificationService.sendNotification('Teste do Meu Planner 🌸', {
      body: 'Este é um exemplo real de notificação do seu planner pessoal.',
      playAudio: true,
    });
    if (sent) {
      showToast('Notificação de teste disparada!', 'success');
    } else {
      showToast('Não foi possível exibir notificação nativa. Ative a permissão acima.', 'warning');
    }
  };

  // Filtragem dos lembretes por status
  const filteredReminders = reminders.filter((rem) => {
    const isPastDateTime = rem.date < todayStr || (rem.date === todayStr && rem.time < currentTimeStr);

    if (activeTab === 'completed') {
      return rem.status === 'completed';
    }
    if (activeTab === 'sent') {
      return rem.status === 'sent';
    }
    if (activeTab === 'overdue') {
      return rem.status === 'pending' && isPastDateTime;
    }
    // future
    return rem.status === 'pending' && !isPastDateTime;
  });

  const counts = {
    future: reminders.filter((r) => r.status === 'pending' && (r.date > todayStr || (r.date === todayStr && r.time >= currentTimeStr))).length,
    sent: reminders.filter((r) => r.status === 'sent').length,
    completed: reminders.filter((r) => r.status === 'completed').length,
    overdue: reminders.filter((r) => r.status === 'pending' && (r.date < todayStr || (r.date === todayStr && r.time < currentTimeStr))).length,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Topo da Central de Lembretes */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-[#F4DCE5] shadow-planner">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#FBF7EE] text-[#C5A059]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-sans-planner text-2xl font-bold text-[#75656D]">
              Sistema de Lembretes
            </h2>
            <p className="text-[11px] text-[#A697A0]">
              Nunca perca um compromisso especial ou momento de autocuidado
            </p>
          </div>
        </div>

        <button
          onClick={() => openQuickAdd('reminder')}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#D9A2B5] hover:bg-[#C98A9F] text-white text-xs font-semibold shadow-xs transition-colors active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Lembrete</span>
        </button>
      </div>

      {/* Cartão de Permissão do Navegador e Push Service Worker */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#FFF9F4] via-[#F9EAF0] to-[#F4DCE5] border border-[#F4DCE5] shadow-planner">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-2xl bg-white text-[#B26E86] shadow-2xs mt-0.5">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#63535B] flex items-center gap-2">
                Notificações Reais do Navegador
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  notificationPermission === 'granted'
                    ? 'bg-emerald-100 text-emerald-800'
                    : notificationPermission === 'denied'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {notificationPermission === 'granted' ? 'Ativadas' : notificationPermission === 'denied' ? 'Bloqueadas no Navegador' : 'Aguardando Permissão'}
                </span>
              </h3>
              <p className="text-xs text-[#8C7A83] mt-1 max-w-xl leading-relaxed">
                O Meu Planner usa a Notification API do navegador e Service Worker para alertar você no horário exato dos seus lembretes com som suave.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {notificationPermission !== 'granted' && (
              <button
                onClick={handleRequestPermission}
                className="px-3.5 py-1.5 rounded-xl bg-[#D9A2B5] hover:bg-[#C98A9F] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Permitir Notificações
              </button>
            )}
            <button
              onClick={handleTestNotification}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F9EAF0] text-[#75656D] border border-[#E8C2D1] text-xs font-medium transition-colors"
            >
              Testar Notificação
            </button>
            <button
              onClick={handleTestSound}
              className="p-2 rounded-xl bg-white hover:bg-[#F9EAF0] text-[#B26E86] border border-[#E8C2D1] transition-colors"
              title="Testar som delicado"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Informação sobre notificações com o site fechado */}
        <div className="mt-3 pt-3 border-t border-[#D9A2B5]/30 flex items-start gap-2 text-[11px] text-[#75656D]">
          <Info className="w-4 h-4 text-[#B26E86] shrink-0 mt-0.5" />
          <span>
            <strong>Notificações em segundo plano:</strong> O Service Worker já está registrado e ativo para receber eventos push. Enquanto a aba estiver aberta ou em segundo plano, os lembretes internos tocam automaticamente a cada 25 segundos.
          </span>
        </div>
      </div>

      {/* Abas da Central de Notificações */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        {[
          { id: 'future' as ReminderTab, label: 'Lembretes Futuros', count: counts.future },
          { id: 'sent' as ReminderTab, label: 'Enviados / Ativos', count: counts.sent },
          { id: 'overdue' as ReminderTab, label: 'Atrasados', count: counts.overdue },
          { id: 'completed' as ReminderTab, label: 'Concluídos', count: counts.completed },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#D9A2B5] text-white font-semibold shadow-2xs'
                : 'bg-white text-[#75656D] hover:bg-[#F9EAF0] border border-[#F4DCE5]'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === tab.id ? 'bg-white/30 text-white' : 'bg-[#F9EAF0] text-[#75656D]'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Lista de Lembretes */}
      <div className="bg-white rounded-3xl border border-[#F4DCE5] p-5 sm:p-6 shadow-planner">
        {filteredReminders.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#A697A0]">
            <Clock className="w-8 h-8 mx-auto mb-2 text-[#D9A2B5]/50" />
            <p className="font-semibold text-sm text-[#75656D]">Nenhum lembrete nesta categoria</p>
            <p className="mt-1">Agende lembretes para beber água, fazer pausas, reuniões ou tarefas importantes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReminders.map((rem) => (
              <div
                key={rem.id}
                className="p-4 rounded-2xl bg-[#FFF9F4] hover:bg-[#FDF3F7] border border-[#F4DCE5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <button
                    onClick={() => updateReminderStatus(rem.id, rem.status === 'completed' ? 'pending' : 'completed')}
                    className="text-[#D9A2B5] hover:text-[#B26E86] mt-0.5 sm:mt-0 shrink-0"
                    title={rem.status === 'completed' ? 'Reabrir lembrete' : 'Marcar como concluído'}
                  >
                    {rem.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold text-[#63535B] ${rem.status === 'completed' ? 'line-through text-[#A697A0]' : ''}`}>
                        {rem.title}
                      </span>
                      {rem.isFavorite && (
                        <Heart className="w-3.5 h-3.5 fill-[#D9A2B5] text-[#D9A2B5] shrink-0" />
                      )}
                    </div>

                    {rem.description && (
                      <p className="text-[11px] text-[#8C7A83] mt-0.5 line-clamp-1">
                        {rem.description}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[10px] text-[#A697A0] mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#B26E86]" />
                        {rem.date === todayStr ? 'Hoje' : rem.date}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-[#75656D]">
                        <Clock className="w-3 h-3 text-[#B26E86]" />
                        {rem.time}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${
                    rem.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : rem.status === 'sent'
                      ? 'bg-blue-100 text-blue-700'
                      : activeTab === 'overdue'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {rem.status === 'completed' ? 'Concluído' : rem.status === 'sent' ? 'Notificado' : activeTab === 'overdue' ? 'Atrasado' : 'Agendado'}
                  </span>

                  <button
                    onClick={() => toggleReminderFavorite(rem.id)}
                    className="p-1.5 text-[#D9A2B5] hover:text-[#B26E86]"
                    title="Favoritar"
                  >
                    <Heart className={`w-4 h-4 ${rem.isFavorite ? 'fill-[#D9A2B5]' : ''}`} />
                  </button>

                  <button
                    onClick={() => deleteReminder(rem.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
