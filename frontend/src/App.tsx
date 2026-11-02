import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MarketTicker } from './components/MarketTicker';
import { AIChatbot } from './components/AIChatbot';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './views/DashboardView';
import { PredictionView } from './views/PredictionView';
import { WeatherView } from './views/WeatherView';
import { SoilHealthView } from './views/SoilHealthView';
import { PestDetectionView } from './views/PestDetectionView';
import { HistoryView } from './views/HistoryView';
import { ProfileView } from './views/ProfileView';
import { AdminTrainingView } from './views/AdminTrainingView';
import { AdminUserView } from './views/AdminUserView';
import { AuthProvider } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';

export const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<any>(null);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header
          activeTab={activeTab}
          onMenuClick={() => setIsSidebarOpen(true)}
          setActiveTab={setActiveTab}
        />

        <MarketTicker />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                setActiveTab={setActiveTab}
                onSelectPreset={(preset) => setSelectedPreset(preset)}
              />
            )}

            {activeTab === 'predict' && (
              <PredictionView initialFormData={selectedPreset} />
            )}

            {activeTab === 'weather' && <WeatherView />}

            {activeTab === 'soil' && <SoilHealthView />}

            {activeTab === 'pest-detection' && <PestDetectionView />}

            {activeTab === 'history' && <HistoryView />}

            {activeTab === 'profile' && <ProfileView />}

            {activeTab === 'training' && <AdminTrainingView />}

            {activeTab === 'users' && <AdminUserView />}
          </div>
        </main>

        {/* Floating AI Agricultural Assistant */}
        <AIChatbot activeCropContext={selectedPreset} />

        {/* Authentication Modal */}
        <AuthModal />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <MainLayout />
      </ModalProvider>
    </AuthProvider>
  );
}
