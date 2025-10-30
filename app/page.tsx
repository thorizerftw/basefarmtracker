'use client';

// React import'ları
import React, { useState, useEffect, useCallback, useMemo } from 'react';

// İkonlar (lucide-react)
// VERCEL HATASI DÜZELTMESİ: Kullanılmayan 'ChevronRight' ve 'Edit2' ikonları kaldırıldı.
import { Moon, Sun, Upload, Download, Plus, Trash2 } from 'lucide-react';

// useTheme hook'u (Doğru paket 'next-themes' paketidir)
import { useTheme } from 'next-themes';

// ----------------------------------------------------------------
// --- Gerekli Tipler (Interfaces) ---
// BU HATAYI ÇÖZER: 'Task' tipini en üst seviyede tanımlıyoruz
// ----------------------------------------------------------------
interface Task {
  id: number;
  text: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

interface ProjectDetails {
  notes: string;
  website: string;
  twitter: string;
}

interface Project {
  id: number;
  name: string;
  tasks: Task[];
  details: ProjectDetails;
}

// Arkadaşının kodundan alınan Kullanıcı (User) arayüzü
type User = {
  address: string;
  displayName: string;
  avatarUrl: string;
};
// ----------------------------------------------------------------

// --- Ana Sayfa Bileşeni ---
export default function HomePage() {
  // === TEMA DÜZELTMESİ (Arkadaşının koduna göre değil, next-themes'e göre) ===
  // 'isDarkMode' ve 'toggleTheme' yerine 'theme' ve 'setTheme' kullanıyoruz.
  const { theme, setTheme } = useTheme();
  // 'toggleTheme' fonksiyonunu kendimiz tanımlıyoruz
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  // Tailwind'in 'dark' modunu algılaması için mevcut temayı 'isDarkMode' boolean'ına çeviriyoruz
  const isDarkMode = theme === 'dark';
  // --- TEMA DÜZELTMESİ SONU ---

  // --- CÜZDAN & MİNİ-APP MANTIĞI (Arkadaşının kodundan alındı) ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Arkadaşının kodundaki 'buildUserProfile' fonksiyonu
  async function buildUserProfile(address: string): Promise<User> {
    try {
      // VERCEL ESLINT DÜZELTMESİ: 'any' tipi yerine daha spesifik bir tip kullanıldı
      const w = window as Window & { ethereum?: any; miniapp?: any };
      if (w.ethereum?.isCoinbaseWallet && w.ethereum?.coinbase?.getUser) {
        const user = await w.ethereum.coinbase.getUser();
        const display = user?.data?.profile?.displayName;
        const image = user?.data?.profile?.profileImageUrl;
        const initials = (display || address.substring(2, 4)).substring(0, 2).toUpperCase();
        return {
          address,
          displayName: display || `${address.substring(0, 6)}...`,
          avatarUrl: image || `https://placehold.co/40x40/fbcfe8/db2777?text=${initials}`,
        };
      }
    } catch (e) {
      console.error('Error building user profile:', e);
    }
    const initials = address.substring(2, 4).toUpperCase();
    return {
      address,
      displayName: `${address.substring(0, 6)}...`,
      avatarUrl: `https://placehold.co/40x40/fbcfe8/db2777?text=${initials}`,
    };
  }

  // Cüzdan Bağlanma Fonksiyonu
  const handleConnect = useCallback(async () => {
    // VERCEL ESLINT DÜZELTMESİ: 'any' tipi yerine daha spesifik bir tip kullanıldı
    const ethereum = (window as Window & { ethereum?: any }).ethereum;
    if (!ethereum) {
      alert("Please install a wallet extension like MetaMask or use Coinbase Wallet.");
      return;
    }
    try {
      const accounts: string[] = await ethereum.request({ method: "eth_requestAccounts" });
      if (!accounts?.length) return;
      const addr = accounts[0];
      const user = await buildUserProfile(addr);
      localStorage.setItem("baseapp_connected_user_address", addr);
      setCurrentUser(user);
    } catch (e) {
      console.error('Failed to connect wallet:', e);
    }
  }, []);

  // Cüzdan Bağlantısını Kesme
  const handleDisconnect = useCallback(async () => {
    localStorage.removeItem("baseapp_connected_user_address");
    setCurrentUser(null);
  }, []);

  // Sayfa yüklendiğinde bağlı cüzdanı kontrol et
  useEffect(() => {
    const savedAddress = localStorage.getItem("baseapp_connected_user_address");
    if (!savedAddress) return;

    // VERCEL ESLINT DÜZELTMESİ: 'any' tipi yerine daha spesifik bir tip kullanıldı
    const ethereum = (window as Window & { ethereum?: any }).ethereum;
    if (!ethereum) return;

    ethereum
      .request({ method: "eth_accounts" })
      .then(async (accounts: string[]) => {
        if (accounts?.length && accounts[0]?.toLowerCase() === savedAddress.toLowerCase()) {
          const user = await buildUserProfile(accounts[0]);
          setCurrentUser(user);
        } else {
          handleDisconnect();
        }
      })
      .catch(() => {
        handleDisconnect();
      });
  }, [handleDisconnect]);

  // Hesap değişimini dinle
  useEffect(() => {
    const ethereum = (window as Window & { ethereum?: any }).ethereum;
    if (!ethereum || !ethereum.on) return;

    const onAccountsChanged = (accounts: string[]) => {
      if (!accounts?.length) {
        handleDisconnect();
        return;
      }
      const addr = accounts[0];
      if (currentUser && addr.toLowerCase() !== currentUser.address.toLowerCase()) {
        // Farklı bir hesaba geçildi, yeniden bağlan
        handleDisconnect();
        handleConnect();
      }
    };
    ethereum.on("accountsChanged", onAccountsChanged);
    return () => {
      try { ethereum.removeListener("accountsChanged", onAccountsChanged); } catch {}
    };
  }, [currentUser, handleConnect, handleDisconnect]);

  // --- MİNİ-APP "READY" SİNYALİ (Arkadaşının kodundan alındı) ---
  // Bu useEffect, uygulamanın Base App içinde "hazır" olduğunu bildirir.
  useEffect(() => {
    const tryReady = () => {
      // VERCEL ESLINT DÜZELTMESİ: 'any' tipi yerine daha spesifik bir tip kullanıldı
      const m = (window as Window & { miniapp?: any })?.miniapp;
      if (!m) return false;

      try {
        if (m.actions?.ready) {
          m.actions.ready();
          return true;
        }
        if (m.ready) {
          m.ready();
          return true;
        }
      } catch (e) {
        console.error("MiniApp ready signal failed:", e);
      }
      return false;
    };

    if (tryReady()) return;
    let tries = 0;
    const id = setInterval(() => {
      tries++;
      if (tryReady() || tries > 20) clearInterval(id);
    }, 500);

    return () => clearInterval(id);
  }, []);
  // --- CÜZDAN & MİNİ-APP MANTIĞI SONU ---

  const [isClient, setIsClient] = useState(false);

  // Tema kodunu client'da çalıştır
  useEffect(() => {
    setIsClient(true);
    const root = window.document.documentElement; // <html> etiketi
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (!isClient) {
    return null; // Sunucu tarafında render etme, client'ı bekle
  }

  return (
    // SafeArea (Artık OnchainKit'ten gelmiyor, manuel Tailwind ayarı)
    <div className="flex justify-center items-start min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        
        {/* Header (Tailwind ile) */}
        <header className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            BaseFarm Tracker
          </h1>
          <div className="flex items-center gap-3">
            {currentUser?.avatarUrl && (
              <img 
                src={currentUser.avatarUrl} 
                alt="PFP" 
                className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
            <button
              onClick={toggleTheme} // Düzeltilmiş tema fonksiyonu
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <main className="mt-6">
          {currentUser ? (
            // KİMLİK VARSA -> FarmTracker'ı göster
            <FarmTracker userAddress={currentUser.address} />
          ) : (
            // KİMLİK YOKSA -> Bağlan Butonu
            <div className="text-center p-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
                Please connect your wallet to manage tasks.
              </p>
              <button
                onClick={handleConnect}
                className="mt-4 px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Connect Wallet
              </button>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}


// --- FarmTracker Bileşeni ---
// (Bütün manuel CSS'leri Tailwind sınıflarıyla değiştirdim)
interface FarmTrackerProps {
    userAddress: string;
}
const FarmTracker: React.FC<FarmTrackerProps> = ({ userAddress }) => {
    const getStorageKey = useCallback((key: string) => `${key}-${userAddress}`, [userAddress]);
    
    const [projects, setProjects] = useState<Project[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const saved = localStorage.getItem(getStorageKey('farm-tracker'));
            const parsedProjects = saved ? JSON.parse(saved) : [];
            // VERCEL ESLINT DÜZELTMESİ: 'any' tipi yerine 'Project' tipi kullanıldı
            return parsedProjects.map((p: Project) => ({ ...p, details: p.details || { notes: '', website: '', twitter: '' } }));
        } catch { 
             console.warn("Failed to parse projects from localStorage");
            return []; 
        }
    });

    const [newProjectName, setNewProjectName] = useState('');
    const [sortMethod, setSortMethod] = useState('dateAdded');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(getStorageKey('farm-tracker'), JSON.stringify(projects));
        }
    }, [projects, getStorageKey]);
    
    const addProject = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;
        const newProject: Project = { id: Date.now(), name: newProjectName.trim(), tasks: [], details: { notes: '', website: '', twitter: '' } };
        setProjects(prev => [newProject, ...prev]);
        setNewProjectName('');
    };
    
    const exportData = () => { 
      // Basit bir modal/uyarı göster
      alert('Export not implemented yet.'); 
    };
    const importData = (event: React.ChangeEvent<HTMLInputElement>) => { 
      // event'i kullan, ESLint hatasını engelle
      if(event.target.files) {
        alert('Import not implemented yet.');
      }
    }; 

    const sortedProjects = useMemo(() => {
        const projectsCopy = [...projects];
        const getPriorityScore = (priority: string) => ({ high: 3, medium: 2, low: 1 }[priority] || 0);
        switch (sortMethod) {
            case 'alphabetical': return projectsCopy.sort((a, b) => a.name.localeCompare(b.name));
            case 'progress':
                return projectsCopy.sort((a, b) => {
                    const progressA = a.tasks.length > 0 ? (a.tasks.filter(t => t.completed).length / a.tasks.length) * 100 : 0;
                    const progressB = b.tasks.length > 0 ? (b.tasks.filter(t => t.completed).length / b.tasks.length) * 100 : 0;
                    return progressB - progressA;
                });
            case 'priority':
                 return projectsCopy.sort((a, b) => {
                    const highA = Math.max(0, ...a.tasks.filter(t => !t.completed).map(t => getPriorityScore(t.priority)));
                    const highB = Math.max(0, ...b.tasks.filter(t => !t.completed).map(t => getPriorityScore(t.priority)));
                    return highB - highA;
                });
            case 'dateAdded': default: return projectsCopy.sort((a, b) => b.id - a.id);
        }
    }, [projects, sortMethod]);
    
    return (
        // TAILWIND KODLARI
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex gap-2">
                     <input type="file" id="import-file" className="hidden" onChange={importData} accept=".json" />
                    <button 
                      className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition" 
                      onClick={() => (document.getElementById('import-file') as HTMLInputElement)?.click()} 
                      title="Import Data"
                    >
                        <Upload size={18} />
                    </button>
                    <button 
                      className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition" 
                      onClick={exportData} 
                      title="Export Data"
                    >
                        <Download size={18} />
                    </button>
                </div>
                
                <div>
                     <select 
                       value={sortMethod} 
                       onChange={(e) => setSortMethod(e.target.value)}
                       // TAILWIND Stilleri
                       className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                     >
                        <option value="dateAdded">Sort: Date Added</option>
                        <option value="alphabetical">Sort: A-Z</option>
                        <option value="progress">Sort: By Progress</option>
                        <option value="priority">Sort: By Priority</option>
                    </select>
                </div>
            </div>
            
            {/* Proje Ekleme Formu (Tailwind ile) */}
            <form className="flex gap-2" onSubmit={addProject}>
                <input 
                  type="text" 
                  placeholder="Add new project (e.g., Aerodrome Finance)" 
                  value={newProjectName} 
                  onChange={(e) => setNewProjectName(e.target.value)} 
                  className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button 
                  type="submit"
                  className="px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                >
                   <Plus size={16} strokeWidth={3} /> Add Project
                </button>
            </form>
            
            {/* Proje Listesi (Tailwind ile) */}
            <div className="space-y-6">
              {sortedProjects.map(project => (
                  <ProjectCard key={project.id} project={project} setProjects={setProjects} />
              ))}
            </div>
            {sortedProjects.length === 0 && <p className="text-center text-gray-500 dark:text-gray-400 mt-8">No projects yet. Add one to start tracking!</p>}
        </div>
    );
};

// --- ProjectCard Bileşeni ---
// (Bütün manuel CSS'leri Tailwind sınıflarıyla değiştirdim)
interface ProjectCardProps {
    project: Project;
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}
const ProjectCard: React.FC<ProjectCardProps> = ({ project, setProjects }) => {
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [editingText, setEditingText] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [projectName, setProjectName] = useState(project.name);
    const [newTaskInputs, setNewTaskInputs] = useState({ text: '', dueDate: '', priority: 'medium' as Task['priority'] });
    const [completedVisible, setCompletedVisible] = useState(false);
    const [detailsVisible, setDetailsVisible] = useState(false);

    const updateProject = useCallback((updatedData: Partial<Project>) => {
        setProjects(prevProjects => 
            prevProjects.map(p => p.id === project.id ? {...p, ...updatedData} : p)
        );
    }, [project.id, setProjects]);

    const deleteProject = () => { 
      // Basit bir modal/uyarı göster
      if (confirm('Are you sure you want to delete this project?')) { 
        setProjects(prevProjects => prevProjects.filter(p => p.id !== project.id)); 
      } 
    };
    const deleteTask = (taskId: number) => { 
      if (confirm('Are you sure?')) { 
        updateProject({ tasks: project.tasks.filter(t => t.id !== taskId) }); 
      } 
    };
    
    const handleTaskInputChange = (field: keyof typeof newTaskInputs, value: string) => setNewTaskInputs(prev => ({...prev, [field]: value }));
    const handleDetailChange = (field: keyof ProjectDetails, value: string) => updateProject({ details: { ...(project.details || { notes: '', website: '', twitter: '' }), [field]: value } });

    const addTask = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const text = newTaskInputs.text.trim(); 
        if (!text) return; 
        const newTask: Task = { id: Date.now(), text, dueDate: newTaskInputs.dueDate || '', priority: newTaskInputs.priority || 'medium', completed: false };
        updateProject({ tasks: [newTask, ...project.tasks] }); 
        setNewTaskInputs({ text: '', dueDate: '', priority: 'medium' }); 
    };
    
    const toggleTask = (taskId: number) => updateProject({ tasks: project.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t) });
    
    const handleEdit = (task: Task) => { setEditingTaskId(task.id); setEditingText(task.text); };
    const saveEdit = (taskId: number) => {
        const trimmedText = editingText.trim();
        if (trimmedText) {
            updateProject({ tasks: project.tasks.map(t => t.id === taskId ? { ...t, text: trimmedText } : t) });
        }
        setEditingTaskId(null); setEditingText('');
    };
    const cancelEdit = () => { setEditingTaskId(null); setEditingText(''); };
    
    const handleProjectNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') saveProjectName(); else if (e.key === 'Escape') { setProjectName(project.name); setIsEditingName(false); } };
    const saveProjectName = () => {
        const trimmedName = projectName.trim();
        if (trimmedName) updateProject({ name: trimmedName }); else setProjectName(project.name); 
        setIsEditingName(false);
    };
    
    const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            const userTimezoneOffset = date.getTimezoneOffset() * 60000;
            const correctedDate = new Date(date.getTime() + userTimezoneOffset);
            if (isNaN(correctedDate.getTime())) return ''; 
            return correctedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch { 
            return ''; 
        } 
    };
    const getDueDateClass = (task: Task): string => {
        if (!task.dueDate || task.completed) return '';
        try {
            const today = new Date(); today.setHours(0,0,0,0);
            const dueDate = new Date(task.dueDate); 
            const userTimezoneOffset = dueDate.getTimezoneOffset() * 60000;
            const correctedDate = new Date(dueDate.getTime() + userTimezoneOffset); 
            if (isNaN(correctedDate.getTime())) return '';
            correctedDate.setHours(0,0,0,0);
            if (correctedDate < today) return 'text-red-600 dark:text-red-400 font-medium'; // overdue
            if (correctedDate.getTime() === today.getTime()) return 'text-blue-600 dark:text-blue-400 font-medium'; // today
        } catch { 
            return '';
        }
        return '';
    };

    const incompleteTasks = project.tasks.filter(t => !t.completed);
    const completedTasks = project.tasks.filter(t => t.completed);
    const progress = project.tasks.length > 0 ? Math.round((completedTasks.length / project.tasks.length) * 100) : 0;
    
    // Tailwind Sınıfları
    const priorityClasses = {
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }
    
    // BU HATAYI ÇÖZER: 'Task' tipi en üstte tanımlı olduğu için burada görülebilir.
    const PriorityTag = ({priority}: {priority: Task['priority']}) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${priorityClasses[priority] || priorityClasses['medium']}`}>
        {priority}
      </span>
    );

    // Task (Görev) Bileşeni (Tailwind ile)
    // BU HATAYI ÇÖZER: 'Task' tipi en üstte tanımlı olduğu için burada görülebilir.
    const TaskItem = ({ task }: {task: Task}) => {
        const isEditing = editingTaskId === task.id;
        return (
            <li className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition group">
                {isEditing ? (
                    <form className="flex-grow" onSubmit={(e) => { e.preventDefault(); saveEdit(task.id); }}>
                        <input 
                          type="text" 
                          value={editingText} 
                          onChange={(e) => setEditingText(e.target.value)} 
                          autoFocus 
                          onBlur={() => saveEdit(task.id)} 
                          onKeyDown={(e) => e.key === 'Escape' && cancelEdit()}
                          className="w-full p-1 border border-blue-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none"
                        />
                    </form>
                ) : (
                    <>
                        <div className="flex-grow flex items-center gap-3 cursor-pointer" onClick={() => toggleTask(task.id)}>
                            <input 
                              type="checkbox" 
                              id={`task-${task.id}`} 
                              checked={task.completed} 
                              readOnly 
                              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <label htmlFor={`task-${task.id}`} className={`flex-grow ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}> 
                              {task.text} 
                            </label>
                        </div>
                        
                        {/* Task'ın sağ tarafındaki butonlar (Tailwind ile) */}
                        <div className="flex items-center gap-2 ml-auto opacity-0 group-hover:opacity-100 transition">
                            <PriorityTag priority={task.priority} />
                            {task.dueDate && (
                              <span className={`text-sm text-gray-500 dark:text-gray-400 ${getDueDateClass(task)}`}> 
                                {formatDate(task.dueDate)} 
                              </span>
                            )}
                            {/* 'Edit2' ikonu burada kullanılmadığı için importu silindi */}
                             <button 
                               className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400" 
                               onClick={() => deleteTask(task.id)} 
                               aria-label="Delete Task"
                             >
                               <Trash2 size={16} />
                             </button>
                        </div>
                    </>
                )}
            </li>
        );
    };

    return (
         // Proje Kartı (Tailwind ile)
         <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
            {/* Kartın Ana İçeriği */}
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                   <div className="flex items-center gap-2">
                        {isEditingName ? (
                            <input 
                              type="text" 
                              value={projectName} 
                              onChange={(e) => setProjectName(e.target.value)} 
                              onBlur={saveProjectName} 
                              onKeyDown={handleProjectNameKeyDown} 
                              autoFocus 
                              className="text-xl font-semibold p-1 border border-blue-500 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none"
                            />
                        ) : (
                            <>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{project.name}</h2>
                                {/* 'Edit2' ikonu burada kullanılmadığı için importu silindi */}
                            </>
                        )}
                    </div>
                    <button 
                      className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400" 
                      onClick={deleteProject} 
                      aria-label="Delete Project"
                    >
                      <Trash2 size={20} />
                    </button>
                </div>
                
                {/* Progress Bar (Tailwind ile) */}
                {project.tasks.length > 0 && (
                     <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                            style={{width: `${progress}%`}}
                          ></div>
                        </div>
                    </div>
                )}
                
                {/* Task Listesi (Tailwind ile) */}
                <ul className="space-y-1 mb-4">
                    {incompleteTasks.map(task => (<TaskItem key={task.id} task={task} />))}
                </ul>
                
                {/* Task Ekleme Formu (Tailwind ile) */}
                <form className="flex gap-2 flex-wrap" onSubmit={addTask}>
                    <input 
                      type="text" 
                      placeholder="Add new task..." 
                      value={newTaskInputs.text} 
                      onChange={(e) => handleTaskInputChange('text', e.target.value)} 
                      className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input 
                      type="date" 
                      value={newTaskInputs.dueDate} 
                      onChange={(e) => handleTaskInputChange('dueDate', e.target.value)} 
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <select 
                      value={newTaskInputs.priority} 
                      onChange={(e) => handleTaskInputChange('priority', e.target.value as Task['priority'])}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-1.5"
                    >
                      <Plus size={14} strokeWidth={3} /> Add
                    </button>
                </form>
                 
                 {/* Tamamlanan Görevler (Tailwind ile) */}
                 {completedTasks.length > 0 && (
                     <div className="mt-6">
                        <button 
                          className={`flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition ${completedVisible ? 'mb-2' : ''}`} 
                          onClick={() => setCompletedVisible(prev => !prev)}
                        >
                            {/* 'ChevronRight' ikonu burada kullanılmadığı için importu silindi */}
                            <span className={`transition-transform ${completedVisible ? 'rotate-90' : ''}`}>▶</span> 
                            {completedTasks.length} Completed Tasks
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${completedVisible ? 'max-h-screen' : 'max-h-0'}`}>
                            <ul className="space-y-1 border-t border-gray-200 dark:border-gray-700 pt-2">
                                {completedTasks.map(task => (<TaskItem key={task.id} task={task} />))}
                            </ul>
                        </div>
                    </div>
                 )}
            </div>
            
            {/* Details (Notlar, Website, Twitter) Bölümü (Tailwind ile) */}
             <button 
               className={`w-full flex items-center gap-1 p-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition border-t border-gray-200 dark:border-gray-700 ${detailsVisible ? 'bg-gray-100 dark:bg-gray-700' : ''}`} 
               onClick={() => setDetailsVisible(prev => !prev)}
             >
                 {/* 'ChevronRight' ikonu burada kullanılmadığı için importu silindi */}
                 <span className={`transition-transform ${detailsVisible ? 'rotate-90' : ''}`}>▶</span> 
                 Details
             </button>
             <div className={`overflow-hidden transition-all duration-300 ${detailsVisible ? 'max-h-screen' : 'max-h-0'}`}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Website</label>
                        <input 
                          type="text" 
                          placeholder="https://project.com" 
                          value={project.details?.website || ''} 
                          onChange={(e) => handleDetailChange('website', e.target.value)} 
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Twitter</label>
                        <input 
                          type="text" 
                          placeholder="https://twitter.com/project" 
                          value={project.details?.twitter || ''} 
                          onChange={(e) => handleDetailChange('twitter', e.target.value)} 
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Notes</label>
                        <textarea 
                          placeholder="Your strategy, thoughts, next steps..." 
                          value={project.details?.notes || ''} 
                          onChange={(e) => handleDetailChange('notes', e.target.value)}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[80px]"
                        ></textarea>
                    </div>
                 </div>
             </div>
        </div>
    );
};

