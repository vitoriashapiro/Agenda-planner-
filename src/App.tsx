
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import SpotifyPlayer from './components/SpotifyPlayer';
import { PlannerProvider, usePlanner } from './context/PlannerContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { QuickAddModal } from './components/QuickAddModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/ToastContainer';

import { HomeView } from './views/HomeView';
import { CalendarView } from './views/CalendarView';
import { TasksView } from './views/TasksView';
import { NotesView } from './views/NotesView';
import { RemindersView } from './views/RemindersView';
import { FavoritesView } from './views/FavoritesView';
import { HistoryView } from './views/HistoryView';
import { SettingsView } from './views/SettingsView';

const MainContent: React.FC = () => {
  const { currentTab } = usePlanner();

  const renderCurrentView = () => {
    switch (currentTab) {
      case 'home':
        return <HomeView />;
      case 'calendar':
        return <CalendarView />;
      case 'tasks':
        return <TasksView />;
      case 'notes':
        return <NotesView />;
      case 'reminders':
        return <RemindersView />;
      case 'favorites':
        return <FavoritesView />;
      case 'history':
        return <HistoryView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FFF8FA] text-[#756570] font-sans-planner selection:bg-[#F3D6E3] selection:text-[#95677A]">

      {/* Menu Lateral */}
      <Sidebar />

      {/* Estrutura Principal */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FFF8FA]">

        {/* Cabeçalho */}
        <Header />

        {/* Conteúdo */}
        <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 py-5 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-7 md:pb-9 lg:px-8 lg:py-9 animate-in fade-in duration-300">
          <div className="w-full min-w-0">
            {renderCurrentView()}
          </div>
        </main>
      </div>

      {/* Navegação Mobile */}
      <BottomNav />

      {/* Modais e notificações */}
      <QuickAddModal />
      <GlobalSearchModal />
      <AuthModal />
      <ToastContainer />

      {/* Spotify */}
      <SpotifyPlayer />

    </div>
  );
};

export default function App() {
  return (
    <PlannerProvider>
      <MainContent />
    </PlannerProvider>
  );
}
