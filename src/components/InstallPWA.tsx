import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };
    checkStandalone();
    window.addEventListener('beforeinstallprompt', (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choice: any) => {
        if (choice.outcome === 'accepted') setDeferredPrompt(null);
      });
    } else {
      alert("Para instalar: Toque em Compartilhar/Menu -> Adicionar à Tela de Início");
    }
  };

  if (isStandalone) return null;

  return (
    <button onClick={handleInstall} className="p-2 mr-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
      <Download size={20} />
    </button>
  );
};

export default InstallPWA;