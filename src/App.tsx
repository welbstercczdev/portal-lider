import React, { useState } from 'react';
import { Upload, FileJson, CheckCircle, AlertTriangle, Lock, Send, LogOut, Loader2, ShieldCheck } from 'lucide-react';
import ThemeToggle from './components/ThemeToggle';
import InstallPWA from './components/InstallPWA';

// *** COLAR SUA URL DO GOOGLE APPS SCRIPT AQUI ***
const API_URL = "https://script.google.com/macros/s/AKfycbxF14sEgps3ZRWBpaKto4CNrwE721ssgVsyhMhckRair6QGdh5CIMpDXhs8A8JQD-OO/exec";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<any[] | null>(null);
  const [leaderName, setLeaderName] = useState(localStorage.getItem('leaderName') || '');
  const [apiToken, setApiToken] = useState(localStorage.getItem('apiToken') || '');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const saveCredentials = () => {
    localStorage.setItem('leaderName', leaderName);
    localStorage.setItem('apiToken', apiToken);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      try {
        const text = await selectedFile.text();
        const data = JSON.parse(text);
        if (Array.isArray(data)) {
          setJsonData(data);
          setStatus('idle');
          setMessage(`Arquivo válido: ${data.length} registros prontos.`);
        } else {
          setJsonData(null);
          setStatus('error');
          setMessage("Formato inválido. O arquivo deve conter uma lista de coletas.");
        }
      } catch (err) {
        setJsonData(null);
        setStatus('error');
        setMessage("Erro ao ler arquivo. Verifique se é um JSON válido.");
      }
    }
  };

  const handleUpload = async () => {
    if (!jsonData || !leaderName || !apiToken) {
      setStatus('error');
      setMessage("Preencha as credenciais e selecione um arquivo.");
      return;
    }

    saveCredentials();
    setStatus('uploading');
    setMessage("Estabelecendo conexão segura...");

    try {
      const payload = {
        api: 'coletas',
        action: 'create',
        token: apiToken,
        user: leaderName,
        payload: jsonData
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setMessage(result.data.message || "Sincronização concluída com sucesso!");
        setFile(null);
        setJsonData(null);
      } else {
        throw new Error(result.error || "Acesso negado ou token inválido.");
      }
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setMessage("Falha na conexão: " + error.message);
    }
  };

  return (
    // CONTAINER PRINCIPAL: Ocupa 100% da tela, centraliza o conteúdo
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 transition-colors duration-300">
      
      {/* CARD CENTRAL: Define a largura máxima e responsividade */}
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden transition-all duration-300">
        
        {/* Header com Gradiente Suave */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl backdrop-blur-md border border-emerald-500/20 shadow-lg">
              <ShieldCheck size={28} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Portal do Líder</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-xs text-emerald-100/70 font-medium tracking-wide">SISTEMA SEGURO</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <InstallPWA />
            <ThemeToggle />
          </div>
        </div>

        {/* Corpo do App */}
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Seção de Login (Grid Responsivo) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                Nome do Líder
              </label>
              <input 
                type="text" 
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                placeholder="Ex: Supervisor Silva"
                className="w-full p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all placeholder:text-gray-400"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                Token de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input 
                  type="password" 
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-800 w-full"></div>

          {/* Área de Upload */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
              Importar Dados
            </label>
            
            {!file ? (
              <label className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl cursor-pointer bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-all group overflow-hidden">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4 z-10">
                  <div className="p-4 bg-white dark:bg-gray-700 rounded-full shadow-md mb-3 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                     <Upload className="w-6 h-6 text-brand-500" />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-200 font-semibold">
                    Clique para selecionar o arquivo JSON
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Exportado do aplicativo CensoPet
                  </p>
                </div>
                {/* Efeito visual ao passar o mouse */}
                <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <input type="file" className="hidden" accept=".json" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="flex items-center p-4 bg-brand-50 dark:bg-sky-900/20 text-brand-900 dark:text-sky-100 rounded-2xl border border-brand-100 dark:border-sky-800 animate-fade-in shadow-sm relative group">
                <div className="p-3 bg-white dark:bg-sky-900/50 rounded-xl mr-4 shadow-sm">
                   <FileJson size={24} className="text-brand-600 dark:text-sky-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{file.name}</p>
                  <p className="text-xs opacity-70 mt-0.5">{(file.size / 1024).toFixed(1)} KB &bull; Pronto para sincronizar</p>
                </div>
                <button 
                  onClick={() => { setFile(null); setJsonData(null); setMessage(''); setStatus('idle'); }} 
                  className="p-2 hover:bg-white/60 dark:hover:bg-sky-800/50 rounded-lg transition-colors text-brand-700/60 dark:text-sky-200/60 hover:text-brand-800 dark:hover:text-white"
                >
                  <LogOut size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Mensagens de Feedback */}
          {message && (
            <div className={`p-4 rounded-xl text-sm flex items-start gap-3 animate-fade-in border shadow-sm ${
              status === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-900/50' : 
              status === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-900/50' : 
              'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-900/50'
            }`}>
              {status === 'success' ? <CheckCircle size={20} className="mt-0.5 flex-shrink-0" /> : 
               status === 'error' ? <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" /> : 
               <Loader2 size={20} className="mt-0.5 flex-shrink-0 animate-spin" />}
              <span className="font-medium leading-relaxed">{message}</span>
            </div>
          )}

          {/* Botão Principal */}
          <button
            onClick={handleUpload}
            disabled={!jsonData || status === 'uploading'}
            className={`w-full py-4 px-6 rounded-xl font-bold shadow-lg transition-all transform hover:translate-y-[-2px] active:translate-y-[0px] flex items-center justify-center gap-3 text-base ${
              status === 'uploading' 
               ? 'bg-slate-700 text-slate-300 cursor-wait'
               : 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-brand-500/30'
            } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none`}
          >
            {status === 'uploading' ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Processando Envio...</span>
              </>
            ) : (
              <>
                <Send size={20} />
                <span>Enviar para Banco de Dados</span>
              </>
            )}
          </button>
        </div>
        
        {/* Rodapé */}
        <div className="bg-gray-50 dark:bg-slate-950/50 p-4 text-center">
           <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-600 font-medium">
             &copy; {new Date().getFullYear()} CensoPet SJC &bull; Módulo Administrativo v1.2
           </p>
        </div>
      </div>
    </div>
  );
}

export default App;
