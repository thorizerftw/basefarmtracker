'use client';

// ----------------------------------------------------------------
// 1. IMPORT BÖLÜMÜ
// ----------------------------------------------------------------

// React hook'ları
import React, { useState, useEffect, useCallback, useMemo } from 'react';

// İkonlar (lucide-react)
import { Moon, Sun, Upload, Download, Plus, ChevronRight, Edit2, Trash2 } from 'lucide-react';

// useTheme hook'u (Doğru paket 'next-themes' paketidir)
import { useTheme } from 'next-themes';

// ARTIK @coinbase/onchainkit'TEN HOOK IMPORT ETMİYORUZ.
// import { useMiniApp, useIdentity, SafeArea } from '@coinbase/onchainkit/minikit'; // <--- BU SATIRLARI SİLDİK

// ----------------------------------------------------------------
// 2. ARAYÜZ (INTERFACE) BÖLÜMÜ
// ----------------------------------------------------------------

// Görev arayüzü
interface Task {
  id: string;
  text: string;
  isDone: boolean;
}

// Arkadaşının kodundan alınan Kullanıcı (User) arayüzü
type User = {
  address: string;
  displayName: string;
  avatarUrl: string;
};

// ----------------------------------------------------------------
// 3. ANA SAYFA BİLEŞENİ (COMPONENT)
// ----------------------------------------------------------------

export default function Page() {
  
  // --- TEMA (DARK MODE) DÜZELTMESİ ---
  // const { isDarkMode, toggleTheme } = useTheme(); // BU YANLIŞ KULLANIMDI
  
  // 'next-themes' paketinden 'theme' (mevcut tema) ve 'setTheme' (değiştirme fonksiyonu) alınır
  const { theme, setTheme } = useTheme();

  // Temayı değiştirmek için kendi yardımcı fonksiyonumuzu yazıyoruz
  const toggleTheme = () => {
    // Mevcut tema 'dark' ise 'light' yap, değilse 'dark' yap
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  // --- TEMA DÜZELTMESİ SONU ---

  // --- CÜZDAN & MİNİ-APP MANTIĞI (Arkadaşının kodundan alındı) ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Arkadaşının kodundaki 'buildUserProfile' fonksiyonu
  async function buildUserProfile(address: string): Promise<User> {
    try {
      const w = window as any;
      if (w.ethereum?.isCoinbaseWallet && w.ethereum?.coinbase?.getUser) {
        const user = await w.ethereum.coinbase.getUser();
        const display = user?.data?.profile?.displayName;
        const image = user?.data?.profile?.profileImageUrl;
        const initials = (display || address.substring(2, 4)).substring(0, 2).toUpperCase();
        return {
          address,
          displayName: display || `${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
          avatarUrl: image || `https://placehold.co/40x40/fbcfe8/db2777?text=${initials}`,
        };
      }
    } catch {}
    const initials = address.substring(2, 4).toUpperCase();
    return {
      address,
      displayName: `${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
      avatarUrl: `https://placehold.co/40x40/fbcfe8/db2777?text=${initials}`,
    };
  }

  // Cüzdan Bağlanma Fonksiyonu
  const handleConnect = useCallback(async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      alert("Please install a wallet extension like MetaMask or use Coinbase Wallet.");
      return;
    }
    try {
      const accounts: string[] = await ethereum.request({ method: "eth_requestAccounts" });
      if (!accounts?.length) return;
      const addr = accounts[0];
      const user = await buildUserProfile(addr);
      localStorage.setItem("baseapp_connected_user_address", addr); // Bağlantıyı hatırla
      setCurrentUser(user);
    } catch {
      // Kullanıcı reddetti
    }
  }, []);
  
  // Cüzdan Bağlantısını Kesme Fonksiyonu
  const handleDisconnect = useCallback(async () => {
    localStorage.removeItem("baseapp_connected_user_address");
    setCurrentUser(null);
    setTasks([]); // Kullanıcı değişince görevleri temizle
  }, []);

  // Sayfa yüklendiğinde bağlı cüzdanı kontrol et
  useEffect(() => {
    const savedAddress = localStorage.getItem("baseapp_connected_user_address");
    if (!savedAddress) return;

    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    ethereum
      .request({ method: "eth_accounts" })
      .then(async (accounts: string[]) => {
        if (accounts?.length && accounts[0]?.toLowerCase() === savedAddress.toLowerCase()) {
          const user = await buildUserProfile(accounts[0]);
          setCurrentUser(user);
        } else {
          localStorage.removeItem("baseapp_connected_user_address");
        }
      })
      .catch(() => {});
  }, []);


  // --- MİNİ-APP "READY" SİNYALİ (Arkadaşının kodundan alındı) ---
  // Bu useEffect, uygulamanın Base App içinde "hazır" olduğunu bildirir.
  useEffect(() => {
    const tryReady = () => {
      const m = (window as any)?.miniapp;
      if (!m) return false;

      try {
        // Yeni SDK: sdk.actions.ready()
        if (m.actions?.ready) {
          m.actions.ready();
          m.logger?.info?.("ready_sent(actions.ready)");
          return true;
        }
        // Eski/alternatif: sdk.ready()
        if (m.ready) {
          m.ready();
          m.logger?.info?.("ready_sent(ready)");
          return true;
        }
      } catch {
        // Hata olursa sessiz kal
      }
      return false;
    };

    if (tryReady()) return; // İlk denemede başarılıysa tamam

    // Eğer 'window.miniapp' objesi geç yüklenirse diye 10 saniye boyunca denemeye devam et
    let tries = 0;
    const id = setInterval(() => {
      tries++;
      if (tryReady() || tries > 20) clearInterval(id); // 20 deneme (10sn) veya başarılı olunca dur
    }, 500);

    return () => clearInterval(id); // component kapanırsa interval'i temizle
  }, []);
  // --- MİNİ-APP SİNYALİ SONU ---


  // --- GÖREV YÖNETİMİ (Senin kodun) ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');

  // LocalStorage için anahtar (Kullanıcıya özel)
  const tasksKey = useMemo(() => {
    return currentUser ? `farmtracker_tasks_${currentUser.address}` : null;
  }, [currentUser]);

  // Görevleri Yükle (Kullanıcı değişince)
  useEffect(() => {
    if (!tasksKey) return;
    try {
      const saved = localStorage.getItem(tasksKey);
      setTasks(saved ? JSON.parse(saved) : []);
    } catch {
      setTasks([]);
    }
  }, [tasksKey]);

  // Görevleri Kaydet (Görevler değiştikçe)
  useEffect(() => {
    if (!tasksKey) return;
    localStorage.setItem(tasksKey, JSON.stringify(tasks));
  }, [tasks, tasksKey]);


  const handleAddTask = useCallback(() => {
    if (newTaskText.trim() === '') return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: newTaskText,
      isDone: false
    };
    setTasks(prevTasks => [newTask, ...prevTasks]); // Yeni görevleri başa ekle
    setNewTaskText('');
  }, [newTaskText]);

  const handleToggleTask = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, isDone: !task.isDone } : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };
  // --- GÖREV YÖNETİMİ SONU ---


  // ----------------------------------------------------------------
  // 4. JSX (GÖRÜNÜM) BÖLÜMÜ
  // ----------------------------------------------------------------
  return (
    // <SafeArea> yerine normal div kullanıyoruz, çünkü import etmedik.
    <div className="flex flex-col min-h-screen p-4 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      
      {/* Başlık ve Tema Değiştirme Butonu */}
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          Base Farm Tracker
        </h1>
        <div className="flex items-center gap-3">
          {/* Cüzdan bağlıysa avatarı göster */}
          {currentUser && (
            <img
              src={currentUser.avatarUrl}
              alt="Avatar"
              className="w-10 h-10 rounded-full border-2 border-gray-300 dark:border-gray-700"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          )}
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all"
            aria-label="Temayı Değiştir"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Cüzdan bağlı değilse "Bağlan" butonu göster */}
      {!currentUser ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Welcome to Farm Tracker</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Please connect your wallet to manage your tasks.</p>
          <button
            onClick={handleConnect}
            className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        // Cüzdan bağlıysa ana uygulama arayüzünü göster
        <>
          {/* Kullanıcı Bilgisi ve Bağlantı Kesme Butonu */}
          <div className='flex justify-between items-center mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm'>
            <div className="min-w-0">
              <p className="font-semibold truncate" title={currentUser.displayName}>{currentUser.displayName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate" title={currentUser.address}>
                {currentUser.address}
              </p>
            </div>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 transition-colors flex-shrink-0"
            >
              Disconnect
            </button>
          </div>

          {/* Yeni Görev Ekleme Formu */}
          <div className="flex mb-4 shadow-sm">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="Yeni çiftlik görevi ekle..."
              className="flex-grow p-3 border-none rounded-l-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleAddTask} 
              className="p-3 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition-colors"
              aria-label="Görev Ekle"
            >
              <Plus size={24} />
            </button>
          </div>
          
          {/* Görev Listesi */}
          <div className="flex-grow space-y-3 overflow-y-auto">
            {tasks.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
                Henüz görev eklenmemiş.
              </p>
            ) : (
              tasks.map(task => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md transition-all"
                >
                  <div className="flex items-center flex-grow min-w-0" onClick={() => handleToggleTask(task.id)}>
                    <input
                      type="checkbox"
                      checked={task.isDone}
                      readOnly
                      className="mr-3 h-5 w-5 rounded text-blue-500 focus:ring-0 flex-shrink-0"
                    />
                    <span className={`text-lg break-words ${task.isDone ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                      {task.text}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Checkbox'ı tetiklememesi için
                      handleDeleteTask(task.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 ml-2 flex-shrink-0"
                    aria-label="Görevi Sil"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer (İkonları kullanmak için) */}
          <footer className="mt-auto pt-6 flex justify-around border-t border-gray-200 dark:border-gray-700">
            <button className="flex flex-col items-center text-gray-400 hover:text-blue-500 transition-colors">
              <Upload size={24} />
              <span className="text-xs">Yükle</span>
            </button>
            <button className="flex flex-col items-center text-gray-400 hover:text-green-500 transition-colors">
              <Download size={24} />
              <span className="text-xs">İndir</span>
            </button>
          </footer>
        </>
      )}
    </div>
  );
}

