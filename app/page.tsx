'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Check ve X kullanılmıyor, kaldırıldı
import { Moon, Sun, Upload, Download, Plus, ChevronRight, Edit2, Trash2 } from 'lucide-react'; 

// --- Gerekli Tipler (Interfaces) ---
interface Task {
  id: number;
  text: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}
interface ProjectDetails { notes: string; website: string; twitter: string; }
interface Project { id: number; name: string; tasks: Task[]; details: ProjectDetails; }
interface UserIdentity {
  address: string;
  pfpUrl: string; // Bunu artık kullanmayacağız ama tipte kalsın
  displayName: string;
}

// --- Tarayıcı Tipleri (Ethers.js için) ---
declare global {
    interface Window {
        ethers?: any; 
        ethereum?: any; 
        coinbaseWalletExtension?: any; 
    }
}

// --- Ana Sayfa Bileşeni ---
export default function HomePage() {
  const [identity, setIdentity] = useState<UserIdentity | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isClient, setIsClient] = useState(false); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  // === DÜZELTME: ACCOUNT ASSOCIATION KODU (Tip Eklendi) ===
  // BU KODU base.dev SİTESİNDEN ALIP BURAYA YAPIŞTIRMAN GEREKİYOR!
  // Şimdilik boş ama tipi string olmalı.
  const ACCOUNT_ASSOCIATION_STRING: string = ""; 
  // =======================================================

  // === MANUEL MİNİ-APP KODU (Ready Sinyali Öne Alındı) ===
  useEffect(() => {
    setIsClient(true); 
    if (window.parent !== window) {
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'mini-app-identity') {
          console.log("Identity received:", event.data.identity);
          setIdentity(event.data.identity);
          // "Ready" sinyalini artık burada GÖNDERMİYORUZ.
        }
        if (event.data.type === 'mini-app-theme') {
          setIsDarkMode(event.data.theme === 'dark');
        }
      };
      window.addEventListener('message', handleMessage);

      // 1. "Ben yüklendim" de
      console.log("Sending mini-app-loaded signal.");
      window.parent.postMessage({ type: 'mini-app-loaded' }, '*');
      
      // === YENİ: "Hazırım" sinyalini HEMEN gönder ===
      console.log("Sending mini-app-ready signal immediately.");
      window.parent.postMessage({ type: 'mini-app-ready' }, '*');
      // ===========================================
      
      // 3. Hesap İlişkilendirme Kodunu Gönder (varsa)
      if (ACCOUNT_ASSOCIATION_STRING && ACCOUNT_ASSOCIATION_STRING.startsWith('did:pkh')) {
          console.log("Sending account association string:", ACCOUNT_ASSOCIATION_STRING);
          window.parent.postMessage({
              type: 'mini-app-account-association',
              accountAssociation: ACCOUNT_ASSOCIATION_STRING
          }, '*');
      } else {
          console.warn("Account Association string is missing or invalid in page.tsx. Get it from base.dev!");
      }

      // 4. Kimlik İste (Hala istiyoruz, ama "Ready" için beklemiyoruz)
      console.log("Sending mini-app-request-identity signal.");
      window.parent.postMessage({ type: 'mini-app-request-identity' }, '*');

      // 5. Tema İste
      console.log("Sending mini-app-request-theme signal.");
      window.parent.postMessage({ type: 'mini-app-request-theme' }, '*');
      
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, []); // Sadece bir kez çalışır

  // === CÜZDAN BAĞLAMA FONKSİYONU ===
  const handleConnect = async (walletType: 'metamask' | 'coinbase') => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ethers = (window as any).ethers; 
      if (!ethers) { 
        alert("Ethers.js library failed to load. Please refresh.");
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ethereum = (window as any).ethereum; 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const coinbaseWalletExtension = (window as any).coinbaseWalletExtension;
      
      let provider: unknown = null; 

      if (walletType === 'metamask') {
          if (ethereum?.providers) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              provider = ethereum.providers.find((p: any) => p.isMetaMask);
          } else if (ethereum?.isMetaMask) {
              provider = ethereum;
          }
          if (!provider) {
              alert("MetaMask not found. Please install the extension.");
              return;
          }
      } 
      else if (walletType === 'coinbase') {
          provider = coinbaseWalletExtension;
          if (!provider && ethereum?.providers) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              provider = ethereum.providers.find((p: any) => p.isCoinbaseWallet);
          }
          if (!provider && ethereum?.isCoinbaseWallet) {
              provider = ethereum;
          }
          if (!provider) {
              alert("Coinbase Wallet not found. Please install the extension.");
              return;
          }
      }

      try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ethersProvider = new ethers.providers.Web3Provider(provider as any, undefined); 
          const accounts = await ethersProvider.send("eth_requestAccounts", []); 
          
          if (!Array.isArray(accounts) || accounts.length === 0) {
             throw new Error("No accounts found/selected.");
          }
          
          const signer = ethersProvider.getSigner();
          const address = await signer.getAddress();
          
          setIdentity({ 
              address: address, 
              displayName: 'Browser User',
              pfpUrl: '' 
          });
          
          setIsModalOpen(false);
          
          // Tarayıcıda bağlandıktan sonra "Hazırım" sinyali (eskisi gibi)
          if (window.parent === window) { 
             console.log("Browser wallet connected, sending mini-app-ready signal (for consistency).");
             window.parent.postMessage({ type: 'mini-app-ready' }, '*'); 
          }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) { 
          console.error("Connection Error:", err);
          if (err.code === 4001) { 
            // Kullanıcı popup'ı kapattı (Reddetti)
          } else {
              alert(`Connection failed: ${err.message || 'Unknown error'}`);
          }
      }
  };
  
  const handleFarcasterConnect = () => {
      alert("Farcaster sign-in only works inside the Coinbase Wallet Mini-App.");
  };

  // === GERÇEK DISCONNECT FONKSİYONU ===
  const disconnectWallet = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ethereum = (window as any).ethereum;
      if (ethereum && ethereum.request) {
          try {
              await ethereum.request({ 
                  method: 'wallet_revokePermissions', 
                  params: [{ eth_accounts: {} }] 
              });
          } catch (err: unknown) { 
              console.warn("Could not revoke permissions:", (err as Error).message); 
          }
      }
      setIdentity(null);
  }

  // === TEMA KODU ===
  useEffect(() => {
    if (isClient) { 
        if (isDarkMode) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }
  }, [isDarkMode, isClient]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (window.parent !== window) {
        window.parent.postMessage({ type: 'mini-app-set-theme', theme: newTheme ? 'dark' : 'light' }, '*');
    }
  };

  if (!isClient) {
    return null;
  }

  return (
    <>
      <div className="app-container">
        <header className="app-header">
          <h1>BaseFarm Tracker</h1>
          <div className="header-actions">
            {identity && (
              <>
                <button 
                  onClick={disconnectWallet} 
                  className="connectButton disconnect"
                  style={{padding: '0.6rem 1rem'}}
                >
                  Disconnect
                </button>
              </>
            )}
            <button
              onClick={toggleTheme}
              className="icon-button"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <main>
          {identity ? (
            <FarmTracker userAddress={identity.address} />
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--subtle-text-color)' }}>
              <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                Please connect to continue.
              </p>
              
              {/* Tarayıcıda çalışıyorsak Connect butonu */}
              {isClient && window.parent === window && (
                  <button 
                      onClick={() => setIsModalOpen(true)}
                      className="connectButton"
                  >
                    Connect Wallet
                  </button>
              )}

              {/* Mini-App içindeysek (ve kimlik bekleniyorsa) mesaj */}
              {isClient && window.parent !== window && !identity && (
                <p style={{marginTop: '1rem'}}>
                    (Waiting for identity from Coinbase Wallet...)
                    {ACCOUNT_ASSOCIATION_STRING ? '' : ' Account Association missing!'}
                </p>
              )}
            </div>
          )}
        </main>
      </div> 
      
      {isModalOpen && (
        <ConnectModal 
            onClose={() => setIsModalOpen(false)} 
            onConnect={handleConnect}
            onFarcasterConnect={handleFarcasterConnect}
        />
      )}
    </>
  );
}


// --- FarmTracker Bileşeni ---
// (Hiçbir değişiklik yok)
interface FarmTrackerProps {
    userAddress: string;
}
const FarmTracker: React.FC<FarmTrackerProps> = ({ userAddress }) => {
    const getStorageKey = useCallback((key: string) => `${key}-${userAddress}`, [userAddress]);
    
    const [projects, setProjects] = useState<Project[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const saved = localStorage.getItem(getStorageKey('farm-tracker'));
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const parsedProjects = saved ? JSON.parse(saved) : [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return parsedProjects.map((p: any) => ({ ...p, details: p.details || { notes: '', website: '', twitter: '' } }));
        } catch (err: unknown) { 
             if (err instanceof Error) {
              console.warn("Failed to parse projects from localStorage", err.message);
            }
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
    
    const exportData = () => { alert('Export not implemented yet.'); };
    const importData = (_event: React.ChangeEvent<HTMLInputElement>) => { alert('Import not implemented yet.'); }; 

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
        <div>
            <div className="top-controls">
                <div className="data-controls">
                     <input type="file" id="import-file" className="hidden" onChange={importData} accept=".json" />
                    <button className="icon-button small-icon-button" onClick={() => (document.getElementById('import-file') as HTMLInputElement)?.click()} title="Import Data">
                        <Upload size={18} />
                    </button>
                    <button className="icon-button small-icon-button" onClick={exportData} title="Export Data">
                        <Download size={18} />
                    </button>
                </div>
                <div className="sort-control">
                     <select value={sortMethod} onChange={(e) => setSortMethod(e.target.value)}
                       className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                     >
                        <option value="dateAdded">Sort: Date Added</option>
                        <option value="alphabetical">Sort: A-Z</option>
                        <option value="progress">Sort: By Progress</option>
                        <option value="priority">Sort: By Priority</option>
                    </select>
                </div>
            </div>
            
            <form className="project-form" onSubmit={addProject}>
                <input type="text" placeholder="Add new project (e.g., Aerodrome Finance)" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} 
                  className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button type="submit"
                  className="px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                >
                   <Plus size={16} strokeWidth={3} /> Add Project
                </button>
            </form>
            
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

    const deleteProject = () => { if (window.confirm('Are you sure you want to delete this project?')) { setProjects(prevProjects => prevProjects.filter(p => p.id !== project.id)); } };
    const deleteTask = (taskId: number) => { if (window.confirm('Are you sure?')) { updateProject({ tasks: project.tasks.filter(t => t.id !== taskId) }); } };
    
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
    
    const priorityClasses = {
      low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }
    const PriorityTag = ({priority}: {priority: Task['priority']}) => (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${priorityClasses[priority] || priorityClasses['medium']}`}>
        {priority}
      </span>
    );

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
                        
                        <div className="flex items-center gap-2 ml-auto opacity-0 group-hover:opacity-100 transition">
                            <PriorityTag priority={task.priority} />
                            {task.dueDate && (
                              <span className={`text-sm text-gray-500 dark:text-gray-400 ${getDueDateClass(task)}`}> 
                                {formatDate(task.dueDate)} 
                              </span>
                            )}
                            <button 
                              className="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400" 
                              onClick={() => handleEdit(task)} 
                              aria-label="Edit Task"
                            >
                              <Edit2 size={16} />
                            </button>
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
         <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
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
                                <button 
                                  className="p-1 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400" 
                                  onClick={() => setIsEditingName(true)} 
                                  aria-label="Edit Project Name"
                                >
                                  <Edit2 size={16} />
                                </button>
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
                
                <ul className="space-y-1 mb-4">
                    {incompleteTasks.map(task => (<TaskItem key={task.id} task={task} />))}
                </ul>
                
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
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-1"
                    >
                      <Plus size={14} strokeWidth={3} /> Add
                    </button>
                </form>
                 
                 {completedTasks.length > 0 && (
                     <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <button 
                          className={`w-full flex justify-between items-center text-left text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white py-1 ${completedVisible ? 'mb-2' : ''}`} 
                          onClick={() => setCompletedVisible(prev => !prev)}
                        >
                            <span>{completedTasks.length} Completed Tasks</span>
                            <ChevronRight size={16} className={`transform transition-transform ${completedVisible ? 'rotate-90' : ''}`} />
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${completedVisible ? 'max-h-96' : 'max-h-0'}`}>
                            <ul className="space-y-1 border-l-2 border-gray-300 dark:border-gray-600 pl-4 ml-2">
                                {completedTasks.map(task => (<TaskItem key={task.id} task={task} />))}
                            </ul>
                        </div>
                    </div>
                 )}
            </div>
            
             <div className="border-t border-gray-200 dark:border-gray-700">
               <button 
                 className={`w-full flex justify-between items-center text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 ${detailsVisible ? 'bg-gray-100 dark:bg-gray-700' : ''}`} 
                 onClick={() => setDetailsVisible(prev => !prev)}
               >
                   <span>Details</span>
                   <ChevronRight size={16} className={`transform transition-transform ${detailsVisible ? 'rotate-90' : ''}`} />
               </button>
               <div className={`overflow-hidden transition-all duration-300 ease-in-out ${detailsVisible ? 'max-h-96' : 'max-h-0'}`}>
                 <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-100 dark:bg-gray-700">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Website</label>
                        <input 
                          type="text" 
                          placeholder="https://project.com" 
                          value={project.details?.website || ''} 
                          onChange={(e) => handleDetailChange('website', e.target.value)} 
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Twitter</label>
                        <input 
                          type="text" 
                          placeholder="https://twitter.com/project" 
                          value={project.details?.twitter || ''} 
                          onChange={(e) => handleDetailChange('twitter', e.target.value)} 
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Notes</label>
                        <textarea 
                          placeholder="Your strategy, thoughts, next steps..." 
                          value={project.details?.notes || ''} 
                          onChange={(e) => handleDetailChange('notes', e.target.value)}
                          rows={3}
                          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
                        ></textarea>
                    </div>
                 </div>
               </div>
             </div>
        </div>
    );
};


// === Cüzdan Bağlama Popup (Modal) Bileşeni ===
interface ConnectModalProps {
    onClose: () => void;
    onConnect: (walletType: 'metamask' | 'coinbase') => void;
    onFarcasterConnect: () => void;
}
const ConnectModal: React.FC<ConnectModalProps> = ({ onClose, onConnect, onFarcasterConnect }) => (
    <div className="modal-backdrop">
        <div className="modal-content">
            <button className="modal-close" onClick={onClose}>&times;</button>
            <h2 className="text-lg font-semibold mb-4 text-center">Connect Wallet</h2>
            <div className="space-y-3">
                 
                 {/* MetaMask */}
                 <button className="w-full flex items-center justify-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition" onClick={() => onConnect('metamask')}>
                    {/* SVG İkon */}
                    <svg width="24" height="24" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M252.6 128.4L128 253.2L3.4 128.4L128 3.6l124.6 124.8z" fill="#E2761B"></path><path d="M128 3.6l-37.8 97.1l-23.5 32.2l61.3-61.9V3.6z" fill="#E2761B"></path><path d="M128 3.6v97.1l61.3 61.9l-23.5-32.2L128 3.6z" fill="#E37A20"></path><path d="M128 128.4l-61.3 61.9l21-47.5l40.3-14.4z" fill="#E37A20"></path><path d="M128 128.4l61.3 61.9l-21-47.5l-40.3-14.4z" fill="#E47D22"></path><path d="M86.8 142.7l41.2 88.3l41.2-88.3l-41.2-32.5l-41.2 32.5z" fill="#F6851B"></path><path d="M128 231l41.2-88.3L128 110.2V231z" fill="#E37A20"></path><path d="M48 163.1l-6.8 19.3c-2 5.8 4.8 11 10.3 7.8l20-11.6L48 163.1z" fill="#E2761B"></path><path d="M71.5 178.6l20 11.6c5.5 3.1 12.3-2 10.3-7.8l-6.8-19.3L71.5 178.6z" fill="#E37A20"></path><path d="M95 190.2l-6.8 19.3c-2 5.8 4.8 11 10.3 7.8l20-11.6L95 190.2z" fill="#E2761B"></path><path d="M118.5 205.8l20 11.6c5.5 3.1 12.3-2 10.3-7.8l-6.8-19.3L118.5 205.8z" fill="#E37A20"></path><path d="M162.8 163.1l23.5 15.5l-20-11.6c-5.5-3.1-12.3 2-10.3 7.8L162.8 163.1z" fill="#E2761B"></path><path d="M186.3 178.6L162.8 163.1l6.8 19.3c2 5.8 8.8 7.9 10.3 7.8L186.3 178.6z" fill="#E37A20"></path><path d="M210 190.2l-23.5-15.5l-6.8 19.3c-2 5.8 4.8 11 10.3 7.8L210 190.2z" fill="#E2761B"></path><path d="M203.2 182.4c2-5.8 8.8-7.9 10.3-7.8l-20 11.6L203.2 182.4z" fill="#E37A20"></path><path d="M128 128.4l-61.3-61.9L44.8 128l22.4 31.6l60.8-31.2z" fill="#D56A17"></path><path d="M128 128.4l61.3-61.9L211.2 128l-22.4 31.6l-60.8-31.2z" fill="#E2761B"></path><path d="M86.8 142.7l-19.6 15.1L44.8 128l22.4-31.6l19.6 46.3z" fill="#E2761B"></path><path d="M169.2 142.7l19.6 15.1L211.2 128l-22.4-31.6l-19.6 46.3z" fill="#E37A20"></path><path d="M86.8 142.7l41.2-32.5v60.1l-41.2-27.6z" fill="#C06015"></path><path d="M128 110.2l41.2 32.5v-60.1L128 110.2z" fill="#D56A17"></path></svg>
                    <span className="font-medium text-gray-900 dark:text-gray-100">MetaMask</span>
                </button>
                 
                 {/* Coinbase */}
                 <button className="w-full flex items-center justify-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition" onClick={() => onConnect('coinbase')}>
                    {/* SVG İkon */}
                    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32ZM16 23.513C20.1477 23.513 23.513 20.1477 23.513 16C23.513 11.8523 20.1477 8.48697 16 8.48697C11.8523 8.48697 8.48697 11.8523 8.48697 16C8.48697 20.1477 11.8523 23.513 16 23.513ZM16 21.513C19.0401 21.513 21.513 19.0401 21.513 16C21.513 12.9599 19.0401 10.487 16 10.487C12.9599 10.487 10.487 12.9599 10.487 16C10.487 19.0401 12.9599 21.513 16 21.513Z" fill="#0052FF"></path><path d="M12.96 12.96H19.04V19.04H12.96V12.96Z" fill="#0052FF"></path></svg>
                    <span className="font-medium text-gray-900 dark:text-gray-100">Coinbase Wallet</span>
                </button>
                
                {/* Rabby */}
                <button className="w-full flex items-center justify-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition" onClick={() => alert('Rabby Wallet support coming soon!')}>
                     <img 
                       src="https://static.debank.com/image/project/logo_url/rabby/28c113b284d3367a13c548f430543685.png" 
                       alt="Rabby Wallet Logo"
                       width="24" height="24" 
                       onError={(e) => (e.currentTarget.style.display = 'none')} 
                     />
                    <span className="font-medium text-gray-900 dark:text-gray-100">Rabby Wallet</span>
                </button>
                
                {/* Farcaster */}
                <button className="w-full flex items-center justify-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition" onClick={onFarcasterConnect}>
                    {/* SVG İkon */}
                    <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M20 40C31.0457 40 40 31.0457 40 20C40 8.9543 31.0457 0 20 0C8.9543 0 0 8.9543 0 20C0 31.0457 8.9543 40 20 40ZM20 29.3C25.1201 29.3 29.3 25.1201 29.3 20C29.3 14.8799 25.1201 10.7 20 10.7C14.8799 10.7 10.7 14.8799 10.7 20C10.7 25.1201 14.8799 29.3 20 29.3ZM20 26.3C23.4801 26.3 26.3 23.4801 26.3 20C26.3 16.5199 23.4801 13.7 20 13.7C16.5199 13.7 13.7 16.5199 13.7 20C13.7 23.4801 16.5199 26.3 20 26.3ZM15.8 15.8H20V20H15.8V15.8Z" fill="#8A63D2"></path></svg>
                    <span className="font-medium text-gray-900 dark:text-gray-100">Sign in with Farcaster</span>
                </button>
            </div>
        </div>
    </div>
);

