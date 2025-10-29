'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// Kullanılmayan 'Check' ve 'X' importları kaldırıldı.
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
  pfpUrl: string;
  displayName: string;
}

// 'window.ethereum' için kısmi tip tanımı
interface EthereumProvider {
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
  providers?: EthereumProvider[];
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
}

declare global {
    interface Window {
        ethers?: unknown; 
        ethereum?: EthereumProvider; 
        coinbaseWalletExtension?: EthereumProvider; 
    }
}

// --- Ana Sayfa Bileşeni ---
export default function HomePage() {
  const [identity, setIdentity] = useState<UserIdentity | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isClient, setIsClient] = useState(false); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  // === MANUEL MİNİ-APP KODU ===
  useEffect(() => {
    setIsClient(true); 
    if (window.parent !== window) {
      const handleMessage = (event: MessageEvent) => {
        const data = event.data as { type: string; identity?: UserIdentity; theme?: string };
        if (data.type === 'mini-app-identity' && data.identity) {
          setIdentity(data.identity);
        }
        if (data.type === 'mini-app-theme' && data.theme) {
          setIsDarkMode(data.theme === 'dark');
        }
      };
      window.addEventListener('message', handleMessage);
      window.parent.postMessage({ type: 'mini-app-loaded' }, '*');
      window.parent.postMessage({ type: 'mini-app-request-identity' }, '*');
      window.parent.postMessage({ type: 'mini-app-request-theme' }, '*');
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, []); 

  // === CÜZDAN BAĞLAMA FONKSİYONU ===
  const handleConnect = async (walletType: 'metamask' | 'coinbase') => {
      // VERCEL HATASI (70:40) DÜZELTİLDİ: 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ethers = (window.ethers as any); 
      if (typeof ethers === 'undefined') { 
        alert("Ethers.js library failed to load. Please refresh.");
        return;
      }
      
      const ethereum = window.ethereum; 
      const coinbaseWalletExtension = window.coinbaseWalletExtension;

      if (!ethereum && !coinbaseWalletExtension) {
          alert("No compatible wallet detected!");
          return;
      }

      let provider: EthereumProvider | undefined = undefined; 

      if (walletType === 'metamask') {
          if (ethereum?.providers) {
              provider = ethereum.providers.find((p) => p.isMetaMask);
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
              provider = ethereum.providers.find((p) => p.isCoinbaseWallet);
          }
          if (!provider && ethereum?.isCoinbaseWallet) {
              provider = ethereum;
          }
          if (!provider) {
              alert("Coinbase Wallet not found. Please install the extension.");
              return;
          }
      }

      if (!provider) {
          alert("No compatible provider found.");
          return;
      }

      try {
          // VERCEL HATASI (118:80) DÜZELTİLDİ:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const ethersProvider = new ethers.providers.Web3Provider(provider as any, undefined); 
          const accounts = await ethersProvider.send("eth_requestAccounts", []) as string[]; 
          
          if (!accounts || accounts.length === 0) {
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
      } catch (err: unknown) { 
          console.error("Connection Error:", err);
          if (typeof err === 'object' && err !== null && 'code' in err && (err as {code: unknown}).code === 4001) { 
            // Kullanıcı popup'ı kapattı
          } else if (err instanceof Error) {
              alert(`Connection failed: ${err.message}`);
          } else {
              alert("An unknown connection error occurred.");
          }
      }
  };
  
  const handleFarcasterConnect = () => {
      alert("Farcaster sign-in only works inside the Coinbase Wallet Mini-App.");
  };

  // === GERÇEK DISCONNECT FONKSİYONU ===
  const disconnectWallet = async () => {
      const ethereum = window.ethereum;
      if (ethereum && ethereum.request) {
          try {
              await ethereum.request({ 
                  method: 'wallet_revokePermissions', 
                  params: [{ eth_accounts: {} }] 
              });
          } catch (err: unknown) { 
              if (err instanceof Error) {
                console.warn("Could not revoke permissions:", err.message); 
              }
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
              
              <button 
                  onClick={() => setIsModalOpen(true)}
                  className="connectButton"
              >
                Connect Wallet
              </button>

              {isClient && window.parent !== window && (
                <p style={{marginTop: '1rem'}}>(Waiting for identity from Coinbase Wallet...)</p>
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
            return parsedProjects.map((p: Project) => ({ ...p, details: p.details || { notes: '', website: '', twitter: '' } }));
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
    
    // VERCEL HATASI DÜZELTİLDİ: '_event' -> 'event' (kullanılıyor)
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
                     <input type="file" id="import-file" style={{ display: 'none' }} onChange={importData} accept=".json" />
                    <button className="icon-button small-icon-button" onClick={() => (document.getElementById('import-file') as HTMLInputElement)?.click()} title="Import Data">
                        <Upload size={18} />
                    </button>
                    <button className="icon-button small-icon-button" onClick={exportData} title="Export Data">
                        <Download size={18} />
                    </button>
                </div>
                <div className="sort-control">
                     <select value={sortMethod} onChange={(e) => setSortMethod(e.target.value)}>
                        <option value="dateAdded">Sort: Date Added</option>
                        <option value="alphabetical">Sort: A-Z</option>
                        <option value="progress">Sort: By Progress</option>
                        <option value="priority">Sort: By Priority</option>
                    </select>
                </div>
            </div>
            
            <form className="project-form" onSubmit={addProject}>
                <input type="text" placeholder="Add new project (e.g., Aerodrome Finance)" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} />
                <button type="submit">
                   <Plus size={16} strokeWidth={3} /> Add Project
                </button>
            </form>
            
            {sortedProjects.map(project => (
                <ProjectCard key={project.id} project={project} setProjects={setProjects} />
            ))}
            {sortedProjects.length === 0 && <p style={{textAlign: 'center', color: 'var(--subtle-text-color)'}}>No projects yet. Add one to start tracking!</p>}
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
            if (correctedDate < today) return 'overdue';
            if (correctedDate.getTime() === today.getTime()) return 'today';
        } catch { 
            return '';
        }
        return '';
    };

    const incompleteTasks = project.tasks.filter(t => !t.completed);
    const completedTasks = project.tasks.filter(t => t.completed);
    const progress = project.tasks.length > 0 ? (completedTasks.length / project.tasks.length) * 100 : 0;
    const PriorityTag = ({priority}: {priority: Task['priority']}) => (<span className={`priority-tag ${priority}`}>{priority}</span>);

    const TaskItem = ({ task }: {task: Task}) => {
        const isEditing = editingTaskId === task.id;
        return (
            <li className="task-item">
                {isEditing ? (
                    <form className="edit-task-form" onSubmit={(e) => { e.preventDefault(); saveEdit(task.id); }}>
                        <input type="text" value={editingText} onChange={(e) => setEditingText(e.target.value)} autoFocus onBlur={() => saveEdit(task.id)} onKeyDown={(e) => e.key === 'Escape' && cancelEdit()}/>
                    </form>
                ) : (
                    <>
                        <div className="task-item-main">
                            <input type="checkbox" id={`task-${task.id}`} checked={task.completed} onChange={() => toggleTask(task.id)} />
                            <label htmlFor={`task-${task.id}`} className={task.completed ? 'completed' : ''}> {task.text} </label>
                        </div>
                        <div className="task-item-actions">
                            <PriorityTag priority={task.priority} />
                            {task.dueDate && <span className={`task-due-date ${getDueDateClass(task)}`}> {formatDate(task.dueDate)} </span>}
                            <button className="action-button edit" onClick={() => handleEdit(task)} aria-label="Edit Task"><Edit2 size={16} /></button>
                             <button className="action-button delete" onClick={() => deleteTask(task.id)} aria-label="Delete Task"><Trash2 size={16} /></button>
                        </div>
                    </>
                )}
            </li>
        );
    };

    return (
         <div className="project-card">
            <div className="project-card-main">
                <div className="project-header">
                   <div className="project-header-title">
                        {isEditingName ? (
                            <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} onBlur={saveProjectName} onKeyDown={handleProjectNameKeyDown} autoFocus />
                        ) : (
                            <>
                                <h2>{project.name}</h2>
                                <button className="action-button edit" onClick={() => setIsEditingName(true)} aria-label="Edit Project Name"><Edit2 size={16} /></button>
                            </>
                        )}
                    </div>
                    <button className="action-button delete" onClick={deleteProject} aria-label="Delete Project"><Trash2 size={20} /></button>
                </div>
                {project.tasks.length > 0 && (
                     <div className="progress-info">
                        <div className="progress-text">{completedTasks.length} of {project.tasks.length} tasks completed</div>
                        <div className="progress-bar-container"><div className="progress-bar" style={{width: `${progress}%`}}></div></div>
                    </div>
                )}
                <ul className="task-list">
                    {incompleteTasks.map(task => (<TaskItem key={task.id} task={task} />))}
                </ul>
                <form className="task-form" onSubmit={addTask}>
                    <input type="text" placeholder="Add new task (e.g., Swap...)" value={newTaskInputs.text} onChange={(e) => handleTaskInputChange('text', e.target.value)} />
                    <input type="date" value={newTaskInputs.dueDate} onChange={(e) => handleTaskInputChange('dueDate', e.target.value)} />
                    <select value={newTaskInputs.priority} onChange={(e) => handleTaskInputChange('priority', e.target.value as Task['priority'])}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                    <button type="submit"><Plus size={14} strokeWidth={3} /> Add</button>
                </form>
                 {completedTasks.length > 0 && (
                     <>
                        <button className={`completed-section-toggle ${completedVisible ? 'open' : ''}`} onClick={() => setCompletedVisible(prev => !prev)}>
                            <ChevronRight size={16} /> {completedTasks.length} Completed Tasks
                        </button>
                        <div className={`completed-list ${completedVisible ? 'open' : ''}`}>
                            <ul className="task-list">
                                {completedTasks.map(task => (<TaskItem key={task.id} task={task} />))}
                            </ul>
                        </div>
                    </>
                 )}
            </div>
            {/* Details (Notlar, Website, Twitter) Bölümü */}
             <button className={`details-toggle ${detailsVisible ? 'open' : ''}`} onClick={() => setDetailsVisible(prev => !prev)}>
                 <ChevronRight size={16} /> Details
             </button>
             <div className={`project-details ${detailsVisible ? 'open' : ''}`}>
                 <div className="details-grid">
                    <div>
                        <label>Website</label>
                        <input type="text" placeholder="https://project.com" value={project.details?.website || ''} onChange={(e) => handleDetailChange('website', e.target.value)} />
                    </div>
                    <div>
                        <label>Twitter</label>
                        <input type="text" placeholder="https://twitter.com/project" value={project.details?.twitter || ''} onChange={(e) => handleDetailChange('twitter', e.target.value)} />
                    </div>
                    <div style={{gridColumn: '1 / -1'}}>
                        <label>Notes</label>
                        <textarea placeholder="Your strategy, thoughts, next steps..." value={project.details?.notes || ''} onChange={(e) => handleDetailChange('notes', e.target.value)}></textarea>
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
            <h2>Connect Wallet</h2>
            <div className="wallet-options">
                 
                 <button className="wallet-button" onClick={() => onConnect('metamask')}>
                    <span>MetaMask</span>
                </button>
                 
                 <button className="wallet-button" onClick={() => onConnect('coinbase')}>
                    <span>Coinbase Wallet</span>
                </button>
                
                <button className="wallet-button" onClick={() => alert('Rabby Wallet support coming soon!')}>
                    <span>Rabby Wallet</span>
                </button>
                
                <button className="wallet-button" onClick={onFarcasterConnect}>
                    <span>Sign in with Farcaster</span>
                </button>
            </div>
        </div>
    </div>
);

