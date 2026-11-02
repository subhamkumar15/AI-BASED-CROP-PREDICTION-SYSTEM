import React, { createContext, useContext, useState } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface ModalConfig {
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'info' | 'confirm';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

interface ModalContextType {
  showModal: (config: ModalConfig) => void;
  closeModal: () => void;
  openAuthModal: (defaultTab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
}

const ModalContext = createContext<ModalContextType>({} as ModalContextType);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ModalConfig | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const showModal = (c: ModalConfig) => setConfig(c);
  const closeModal = () => setConfig(null);

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <ModalContext.Provider value={{ showModal, closeModal, openAuthModal, closeAuthModal, isAuthModalOpen, authModalTab }}>
      {children}
      {config && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative overflow-hidden">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl flex-shrink-0 ${
                config.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                config.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                'bg-blue-50 text-blue-600'
              }`}>
                {config.type === 'success' ? <CheckCircle size={24} /> :
                 config.type === 'warning' ? <AlertTriangle size={24} /> :
                 <Info size={24} />}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-1">{config.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{config.message}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              {config.onConfirm ? (
                <>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    {config.cancelText || 'Cancel'}
                  </button>
                  <button
                    onClick={() => {
                      config.onConfirm?.();
                      closeModal();
                    }}
                    className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-lg shadow-brand-500/25 transition-all"
                  >
                    {config.confirmText || 'Confirm'}
                  </button>
                </>
              ) : (
                <button
                  onClick={closeModal}
                  className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
