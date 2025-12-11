import React, { useState } from 'react';
import { Upload, FileJson, CheckCircle, AlertTriangle, Lock, Send, LogOut } from 'lucide-react';
import ThemeToggle from './components/ThemeToggle';
import InstallPWA from './components/InstallPWA';

// *** COLAR SUA URL DO GOOGLE APPS SCRIPT AQUI ***
const API_URL = "https://script.google.com/macros/s/AKfycbypl9vj4tms_-C1LUlrdCo8xecw2Oiie_jaUPSHYm-5zQm6638X5a4_oaYktu6C6zFF/exec"; 

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<any[] | null>(null);
  const [leaderName, setLeaderName] = useState(localStorage.getItem('leaderName') || '');
  const [apiToken, setApiToken] = useState(localStorage.getItem('apiToken') || '');
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Salva credenciais para facilitar (opcional)
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
          setMessage(`Arquivo válido: ${data.length} registros.`);
        } else {
          setStatus('error');
          setMessage("Formato inválido. O arquivo deve conter uma lista de coletas.");
        }
      } catch (err) {
        setStatus('error');
        setMessage("Erro ao ler o arquivo. Verifique se é um JSON válido.");
      }
    }
  };

  const handleUpload = async () => {
    if (!jsonData || !leaderName || !apiToken) {
      setStatus('error');
      setMessage("Preencha todos os campos e selecione um arquivo.");
      return;
    }

    saveCredentials();
    setStatus('uploading');
    setMessage("Conectando ao banco de dados seguro...");

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
        throw new Error(result.error || "Acesso negado ou erro no servidor.");
      }
    } catch (error: any) {
      console.error(error);
      setStatus('error');
      setMessage("Falha no envio: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 transition-colors duration-300 font-sans">
      
      <div className="w-full max-w-md md:max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col">
        
        {/* Header Seguro */}
        <div className="bg-slate-900 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Lock size={24} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Portal do Líder</h1>
              <p className="text-xs text-slate-400">Sincronização Segura</p>
            </div>
          </div>
          <div className="flex items-center">
            <InstallPWA />
            <ThemeToggle />
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          
          {/* Inputs de Credenciais */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Líder</label>
              <input 
                type="text" 
                value={leaderName}
                onChange={(e) => setLeaderName(e.target.value)}
                placeholder="Ex: Supervisor Carlos"
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white transition-all"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Token de Acesso</label>
              <input 
                type="password" 
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Senha Mestra"
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-gray-900 dark:text-white transition-all"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800"></div>

          {/* Área de Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Arquivo de Coletas (.json)</label>
            
            {!file ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-400 group-hover:text-brand-500 transition-colors" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Toque para selecionar o arquivo</p>
                </div>
                <input type="file" className="hidden" accept=".json" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-100 dark:border-blue-900/30 animate-fade-in">
                <FileJson size={24} className="mr-3 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{file.name}</p>
                  <p className="text-xs opacity-70">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
                <button 
                  onClick={() => { setFile(null); setJsonData(null); setMessage(''); setStatus('idle'); }} 
                  className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Status Message */}
          {message && (
            <div className={`p-4 rounded-xl text-sm flex items-start gap-3 animate-fade-in ${
              status === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300' : 
              status === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 
              'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}>
              {status === 'success' ? <CheckCircle size={18} className="mt-0.5 flex-shrink-0" /> : 
               status === 'error' ? <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" /> : null}
              <span className="font-medium">{message}</span>
            </div>
          )}

          {/* Botão de Envio */}
          <button
            onClick={handleUpload}
            disabled={!jsonData || status === 'uploading'}
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {status === 'uploading' ? (
              <span className="animate-pulse">Enviando Dados...</span>
            ) : (
              <>
                <Send size={18} />
                Sincronizar Banco de Dados
              </>
            )}
          </button>

        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-950 p-4 text-center text-xs text-gray-400 dark:text-gray-600 border-t border-gray-100 dark:border-gray-800">
           Área Restrita &bull; Apenas Pessoal Autorizado
        </div>
      </div>
    </div>
  );
}

export default App;