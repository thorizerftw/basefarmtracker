'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Fragment,
} from 'react';
import {
  Upload,
  Download,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
} from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
// --- WAGMI HOOK'LARINI (KANCALARINI) İMPORT EDİYORUZ ---
import { useConnect, useAccount, useDisconnect } from 'wagmi';

// --- Tipler (Interfaces) ---

type User = {
  address: string;
  displayName: string;
  avatarUrl: string;
};

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

// --- ÇÖZÜM ADIM 1: TÜM UYGULAMA MANTIĞINI BU YENİ BİLEŞENE TAŞIDIK ---
// Bu bileşen, SADECE "isAppReady" true olduktan sonra render edilecek.
function FarmTrackerApp() {
  // --- YENİ WAGMI CÜZDAN YÖNETİMİ ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { address, isConnected } = useAccount(); // Wagmi'den bağlantı durumunu al
  const { disconnect } = useDisconnect(); // Wagmi'den bağlantı kesme fonksiyonunu al
  const { connect, connectors } = useConnect(); // Wagmi'den cüzdan seçeneklerini al
  // --- /YENİ WAGMI CÜZDAN YÖNETİMİ ---

  const buildUserProfile = useCallback(async (address: string): Promise<User> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (w.ethereum?.isCoinbaseWallet && w.ethereum?.coinbase?.getUser) {
        const user = await w.ethereum.coinbase.getUser();
        const display = user?.data?.profile?.displayName;
        const image = user?.data?.profile?.profileImageUrl;
        const initials = (display || address.substring(2, 4))
          .substring(0, 2)
          .toUpperCase();
        return {
          address,
          displayName:
            display ||
            `${address.substring(0, 6)}...${address.substring(
              address.length - 4,
            )}`,
          avatarUrl:
            image ||
            `https://placehold.co/40x40/fbcfe8/db2777?text=${initials}`,
        };
      }
    } catch (e) {
      console.warn('Coinbase user profile fetch failed', e);
    }
    const initials = address.substring(2, 4).toUpperCase();
    return {
      address,
      displayName: `${address.substring(0, 6)}...${address.substring(
        address.length - 4,
      )}`,
      avatarUrl: `https://placehold.co/40x40/fbcfe8/db2777?text=${initials}`,
    };
  }, []);

  // --- WAGMI'NİN DURUMUNA GÖRE KULLANICIYI GÜNCELLE ---
  useEffect(() => {
    // Bu bileşen zaten "Ready" olduktan sonra çalıştığı için
    // "isAppReady" kilidine burada artık gerek yok.
    if (isConnected && address) {
      buildUserProfile(address).then(setCurrentUser);
      localStorage.setItem('basefarm_connected_address', address);
    } else if (!isConnected) {
      setCurrentUser(null);
      localStorage.removeItem('basefarm_connected_address');
    }
  }, [isConnected, address, buildUserProfile]);

  // Temayı <html> tag'ine uygula
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // --- MODAL İÇİN CÜZDANLARI LİSTELE ---
  // Artık "No wallet connector found" hatası almayacağız
  const walletButtons = connectors
    .filter((c) => c.ready)
    .map((connector) => (
      <button
        key={connector.id}
        onClick={() => connect({ connector })}
        className="mt-6 w-full px-5 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        {connector.name}
      </button>
    ));

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-100 dark:bg-gray-900 p-4 pt-24 sm:p-8 sm:pt-32">
      {/* Header (Başlık) */}
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center w-full max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          BaseFarm Tracker
        </h1>
        {currentUser ? (
          <UserMenu
            user={currentUser}
            onDisconnect={() => disconnect()}
          />
        ) : (
          connectors[0] && (
            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Connect Wallet
            </button>
          )
        )}
      </header>

      {/* Ana İçerik */}
      <main className="w-full max-w-3xl">
        {currentUser ? (
          <FarmTracker userAddress={currentUser.address} />
        ) : (
          <ConnectScreen walletButtons={walletButtons} />
        )}
      </main>
    </div>
  );
}


// --- ÇÖZÜM ADIM 2: ANA SAYFA BİLEŞENİ (PAGE) ARTIK SADECE "READY" SİNYALİ VERİYOR ---
export default function Page() {
  const [isClient, setIsClient] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);

  // --- "NOT READY" SİNYALİNİ YOLLA VE KİLİDİ AÇ ---
  useEffect(() => {
    setIsClient(true); 

    const tryReady = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const m = (window as any)?.miniapp;
      if (!m) return false;

      try {
        if (m.actions?.ready) {
          m.actions.ready();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (m.logger?.info || console.log)("ready_sent(actions.ready)");
          setIsAppReady(true); // <-- KİLİDİ AÇ
          return true;
        }
        if (m.ready) {
          m.ready();
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (m.logger?.info || console.log)("ready_sent(ready)");
          setIsAppReady(true); // <-- KİLİDİ AÇ
          return true;
        }
      } catch (e) {
         console.warn('Ready signal failed', e);
      }
      return false;
    };

    if (tryReady()) return;

    let tries = 0;
    const id = setInterval(() => {
      tries++;
      if (tryReady() || tries > 20) {
        clearInterval(id);
        if (!isAppReady) setIsAppReady(true); 
      }
    }, 500);

    return () => clearInterval(id);
  }, []);

  if (!isClient) {
    return null; // SSR'da hiçbir şey gösterme
  }

  // Kilit açılana kadar (isAppReady=true) cüzdan kancaları (hook) çağrılmaz
  return (
    <>
      {isAppReady ? (
        <FarmTrackerApp />
      ) : (
        // Sayfa yüklenirken "Not Ready" demesin diye basit bir yükleme ekranı
        <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
          <p className="text-gray-900 dark:text-gray-100">Loading Base Tracker...</p>
        </div>
      )}
    </>
  );
}


// --- Bileşen: ConnectScreen (Cüzdan Bağlantı Ekranı) ---
interface ConnectScreenProps {
  walletButtons: React.ReactNode[]; // Butonları prop olarak al
}
const ConnectScreen: React.FC<ConnectScreenProps> = ({ walletButtons }) => (
  <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md relative">
    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
      Welcome to Farm Tracker
    </h2>
    <p className="mt-2 text-gray-600 dark:text-gray-300">
      Please connect your wallet to manage tasks.
    </p>
    <div className="mt-4 space-y-2">
      {walletButtons.length > 0 ? (
        walletButtons
      ) : (
        // Bu hata artık görünmemeli
        <p className="text-red-500">
          No wallet connector found. Please install MetaMask or Coinbase Wallet.
        </p>
      )}
    </div>
  </div>
);


// --- Bileşen: UserMenu (Sağ Üst Menü) ---
interface UserMenuProps {
  user: User;
  onDisconnect: () => void;
}
const UserMenu: React.FC<UserMenuProps> = ({
  user,
  onDisconnect,
}) => {
  return (
    <div className="relative inline-block text-left">
      <Menu>
        <Menu.Button className="flex items-center gap-2 p-1.5 pr-3 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
          <img
            src={user.avatarUrl}
            alt="Avatar"
            className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-600"
          />
          <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            {user.displayName}
          </span>
          <ChevronDown
            size={16}
            className="text-gray-500 dark:text-gray-400"
          />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }: { active: boolean }) => (
                  <button
                    onClick={onDisconnect} 
                    className={`${
                      active
                        ? 'bg-red-50 dark:bg-gray-700 text-red-600 dark:text-red-400'
                        : 'text-gray-700 dark:text-gray-300'
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    <Trash2 size={16} className="mr-2" />
                    Disconnect
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};


// --- Bileşen: FarmTracker (Ana Uygulama) ---
interface FarmTrackerProps {
  userAddress: string;
}
const FarmTracker: React.FC<FarmTrackerProps> = ({ userAddress }) => {
  const getStorageKey = useCallback(
    (key: string) => `${key}-${userAddress}`,
    [userAddress],
  );

  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const storageKey = getStorageKey('farm-tracker');
      const saved = localStorage.getItem(storageKey);
      const parsedProjects = (saved ? JSON.parse(saved) : []) as Project[];
      return parsedProjects.map((p) => ({
        ...p,
        details: p.details || { notes: '', website: '', twitter: '' },
      }));
    } catch {
      console.warn('Failed to parse projects from localStorage');
      return [];
    }
  });

  const [newProjectName, setNewProjectName] = useState('');
  const [sortMethod, setSortMethod] = useState('dateAdded');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storageKey = getStorageKey('farm-tracker');
      localStorage.setItem(storageKey, JSON.stringify(projects));
    }
  }, [projects, getStorageKey]);

  const addProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const newProject: Project = {
      id: Date.now(),
      name: newProjectName.trim(),
      tasks: [],
      details: { notes: '', website: '', twitter: '' },
    };
    setProjects((prev) => [newProject, ...prev]);
    setNewProjectName('');
  };

  const exportData = () => {
    try {
      const dataStr = JSON.stringify(projects, null, 2);
      const dataUri =
        'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = 'farm-tracker-backup.json';
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (err) {
      console.error('Failed to export data', err);
      alert('Failed to export data.');
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (readerEvent) => { 
      try {
        const text = readerEvent.target?.result as string; 
        const importedProjects: Project[] = JSON.parse(text);

        if (
          Array.isArray(importedProjects) &&
          importedProjects.every((p) => p.id && p.name && Array.isArray(p.tasks))
        ) {
          if (
            window.confirm(
              'Are you sure you want to import? This will overwrite your current projects.',
            )
          ) {
            setProjects(importedProjects);
          }
        } else {
          throw new Error('Invalid file format');
        }
      } catch (err) {
        console.error('Failed to import data', err);
        alert('Failed to import data: Invalid file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const sortedProjects = useMemo(() => {
    const projectsCopy = [...projects];
    const getPriorityScore = (priority: string) =>
      ({ high: 3, medium: 2, low: 1 }[priority] || 0);
    switch (sortMethod) {
      case 'alphabetical':
        return projectsCopy.sort((a, b) => a.name.localeCompare(b.name));
      case 'progress':
        return projectsCopy.sort((a, b) => {
          const progressA =
            a.tasks.length > 0
              ? (a.tasks.filter((t) => t.completed).length / a.tasks.length) * 100
              : 0;
          const progressB =
            b.tasks.length > 0
              ? (b.tasks.filter((t) => t.completed).length / b.tasks.length) * 100
              : 0;
          return progressB - progressA;
        });
      case 'priority':
        return projectsCopy.sort((a, b) => {
          const highA = Math.max(
            0,
            ...a.tasks
              .filter((t) => !t.completed)
              .map((t) => getPriorityScore(t.priority)),
          );
          const highB = Math.max(
            0,
            ...b.tasks
              .filter((t) => !t.completed)
              .map((t) => getPriorityScore(t.priority)),
          );
          return highB - highA;
        });
      case 'dateAdded':
      default:
        return projectsCopy.sort((a, b) => b.id - a.id);
    }
  }, [projects, sortMethod]);

  return (
    <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <header className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          My Projects
        </h1>
      </header>

      <main className="mt-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex gap-2">
              <input
                type="file"
                id="import-file"
                className="hidden"
                onChange={importData}
                accept=".json"
              />
              <button
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                onClick={() =>
                  (document.getElementById('import-file') as HTMLInputElement)?.click()
                }
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
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="dateAdded">Sort: Date Added</option>
                <option value="alphabetical">Sort: A-Z</option>
                <option value="progress">Sort: By Progress</option>
                <option value="priority">Sort: By Priority</option>
              </select>
            </div>
          </div>

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

          <div className="space-y-6">
            {sortedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                setProjects={setProjects}
              />
            ))}
          </div>
          {sortedProjects.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-8">
              No projects yet. Add one to start tracking!
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

// --- Bileşen: ProjectCard ---
interface ProjectCardProps {
  project: Project;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}
const ProjectCard: React.FC<ProjectCardProps> = ({ project, setProjects }) => {
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [projectName, setProjectName] = useState(project.name);
  
  type TaskPriority = Task['priority'];
  const [newTaskInputs, setNewTaskInputs] = useState({
    text: '',
    dueDate: '',
    priority: 'medium' as TaskPriority,
  });
  
  const [completedVisible, setCompletedVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const updateProject = useCallback(
    (updatedData: Partial<Project>) => {
      setProjects((prevProjects) =>
        prevProjects.map((p) =>
          p.id === project.id ? { ...p, ...updatedData } : p,
        ),
      );
    },
    [project.id, setProjects],
  );

  const deleteProject = () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects((prevProjects) =>
        prevProjects.filter((p) => p.id !== project.id),
      );
    }
  };
  const deleteTask = (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      updateProject({
        tasks: project.tasks.filter((t) => t.id !== taskId),
      });
    }
  };

  const handleTaskInputChange = (
    field: keyof typeof newTaskInputs,
    value: string | TaskPriority,
  ) => {
    setNewTaskInputs((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleDetailChange = (field: keyof ProjectDetails, value: string) =>
    updateProject({
      details: {
        ...(project.details || { notes: '', website: '', twitter: '' }),
        [field]: value,
      },
    });

  const addTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = newTaskInputs.text.trim();
    if (!text) return;
    const newTask: Task = {
      id: Date.now(),
      text,
      dueDate: newTaskInputs.dueDate || '',
      priority: newTaskInputs.priority || 'medium',
      completed: false,
    };
    updateProject({ tasks: [newTask, ...project.tasks] });
    setNewTaskInputs({ text: '', dueDate: '', priority: 'medium' });
  };

  const toggleTask = (taskId: number) =>
    updateProject({
      tasks: project.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t,
      ),
    });

  const handleEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };
  const saveEdit = (taskId: number) => {
    const trimmedText = editingText.trim();
    if (trimmedText) {
      updateProject({
        tasks: project.tasks.map((t) =>
          t.id === taskId ? { ...t, text: trimmedText } : t,
        ),
      });
    }
    setEditingTaskId(null);
    setEditingText('');
  };
  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditingText('');
  };

  const handleProjectNameKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Enter') saveProjectName();
    else if (e.key === 'Escape') {
      setProjectName(project.name);
      setIsEditingName(false);
    }
  };
  const saveProjectName = () => {
    const trimmedName = projectName.trim();
    if (trimmedName) updateProject({ name: trimmedName });
    else setProjectName(project.name);
    setIsEditingName(false);
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      const correctedDate = new Date(date.getTime() + userTimezoneOffset);
      if (isNaN(correctedDate.getTime())) return '';
      return correctedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };
  const getDueDateClass = (task: Task): string => {
    if (!task.dueDate || task.completed) return '';
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(task.dueDate); 
      const userTimezoneOffset = dueDate.getTimezoneOffset() * 60000;
      const correctedDate = new Date(dueDate.getTime() + userTimezoneOffset);
      if (isNaN(correctedDate.getTime())) return '';
      correctedDate.setHours(0, 0, 0, 0);
      if (correctedDate < today)
        return 'text-red-600 dark:text-red-400 font-medium';
      if (correctedDate.getTime() === today.getTime())
        return 'text-blue-600 dark:text-blue-400 font-medium';
    } catch {
      return '';
    }
    return '';
  };

  const incompleteTasks = project.tasks.filter((t) => !t.completed);
  const completedTasks = project.tasks.filter((t) => t.completed);
  const progress =
    project.tasks.length > 0
      ? Math.round((completedTasks.length / project.tasks.length) * 100)
      : 0;

  const priorityClasses: Record<TaskPriority, string> = {
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    medium:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };
  
  const PriorityTag: React.FC<{ priority: TaskPriority }> = ({ priority }) => (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
        priorityClasses[priority] || priorityClasses['medium']
      }`}
    >
      {priority}
    </span>
  );

  const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
    const isEditing = editingTaskId === task.id;
    return (
      <li className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition group">
        {isEditing ? (
          <form
            className="flex-grow"
            onSubmit={(e) => {
              e.preventDefault();
              saveEdit(task.id);
            }}
          >
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
            <div
              className="flex-grow flex items-center gap-3 cursor-pointer"
              onClick={() => toggleTask(task.id)}
            >
              <input
                type="checkbox"
                id={`task-${task.id}`}
                checked={task.completed}
                readOnly
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor={`task-${task.id}`}
                className={`flex-grow ${
                  task.completed
                    ? 'line-through text-gray-500 dark:text-gray-400'
                    : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {task.text}
              </label>
            </div>

            <div className="flex items-center gap-2 ml-auto opacity-0 group-hover:opacity-100 transition">
              <PriorityTag priority={task.priority} />
              {task.dueDate && (
                <span
                  className={`text-sm text-gray-500 dark:text-gray-400 ${getDueDateClass(
                    task,
                  )}`}
                >
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
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {project.name}
                </h2>
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
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <ul className="space-y-1 mb-4">
          {incompleteTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
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
            onChange={(e) =>
              handleTaskInputChange('priority', e.target.value as TaskPriority)
            }
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

        {completedTasks.length > 0 && (
          <div className="mt-6">
            <button
              className={`flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition ${
                completedVisible ? 'mb-2' : ''
              }`}
              onClick={() => setCompletedVisible((prev) => !prev)}
            >
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  completedVisible ? 'rotate-0' : '-rotate-90'
                }`}
              />
              {completedTasks.length} Completed Tasks
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                completedVisible ? 'max-h-screen' : 'max-h-0'
              }`}
            >
              <ul className="space-y-1 border-t border-gray-200 dark:border-gray-700 pt-2">
                {completedTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      <button
        className={`w-full flex items-center gap-1 p-4 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition border-t border-gray-200 dark:border-gray-700 ${
          detailsVisible ? 'bg-gray-100 dark:bg-gray-700' : ''
        }`}
        onClick={() => setDetailsVisible((prev) => !prev)}
      >
        <ChevronDown
          size={16}
          className={`transition-transform ${
            detailsVisible ? 'rotate-0' : '-rotate-90'
          }`}
        />
        Details
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          detailsVisible ? 'max-h-screen' : 'max-h-0'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Website
            </label>
            <input
              type="text"
              placeholder="https://project.com"
              value={project.details?.website || ''}
              onChange={(e) => handleDetailChange('website', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Twitter
            </label>
            <input
              type="text"
              placeholder="https://twitter.com/project"
              value={project.details?.twitter || ''}
              onChange={(e) => handleDetailChange('twitter', e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Notes
            </label>
            {/* --- BENİM YAZIM HATAMDI, DÜZELTTİM --- */}
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