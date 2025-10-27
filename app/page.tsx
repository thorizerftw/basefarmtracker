// 'use client', bu sayfanın tarayıcıda çalışacağını belirtir.
// Çünkü 'useState', 'useEffect' ve 'localStorage' gibi
// sadece tarayıcıda olan özellikleri kullanacağız.
'use client';

// React kancalarını (hook) import ediyoruz (içe aktarıyoruz)
import { useState, useEffect } from 'react';

// Bir "Görev" (Task) objesinin nasıl görüneceğini tanımlıyoruz.
// Bu, kodumuzu daha okunaklı yapar.
interface Task {
  id: string; // Görevin benzersiz kimliği
  text: string; // Görevin metni (örn: "LayerZero'da hacim yap")
  isCompleted: boolean; // Tamamlandı mı? (true/false)
}

// Ana Sayfa Bileşenimiz (Ekranda görünen her şey)
export default function Home() {
  // 1. STATE TANIMLAMALARI (Bileşenin Hafızası)

  // 'tasks' state'i: Tüm görevlerimizi bir dizi (liste) içinde tutar.
  // Başlangıçta boş bir listedir: [].
  const [tasks, setTasks] = useState<Task[]>([]);

  // 'taskText' state'i: Kullanıcının input'a yazdığı metni tutar.
  // Başlangıçta boş bir metindir: "".
  const [taskText, setTaskText] = useState<string>('');

  // 2. useEffect KANCALARI (Yan Etkiler)

  // Bu 'useEffect', sayfa İLK YÜKLENDİĞİNDE sadece 1 kez çalışır.
  // Görevi: Tarayıcının hafızasından ('localStorage') eski görevleri yüklemek.
  useEffect(() => {
    // Hafızadan 'airdropTasks' anahtarıyla kayıtlı veriyi çekmeyi dene.
    const storedTasks = localStorage.getItem('airdropTasks');
    // Eğer veri varsa (boş değilse),
    if (storedTasks) {
      // Çektiğin metni (JSON) tekrar listeye (diziye) çevir
      // ve 'tasks' state'ine ata.
      setTasks(JSON.parse(storedTasks));
    }
    // '[]' boş dizi, bu effect'in sadece ilk açılışta çalışmasını sağlar.
  }, []);

  // Bu 'useEffect', 'tasks' listesi (state'i) DEĞİŞTİĞİ her an çalışır.
  // Görevi: Görev listesinin son halini tarayıcının hafızasına kaydetmek.
  useEffect(() => {
    // 'tasks' listesini metne (JSON) çevir
    // ve 'airdropTasks' anahtarıyla hafızaya kaydet.
    localStorage.setItem('airdropTasks', JSON.stringify(tasks));
    // [tasks] bağımlılığı, 'tasks' listesi değiştiğinde bu effect'in tetiklenmesini sağlar.
  }, [tasks]);

  // 3. FONKSİYONLAR (Butonlara tıklandığında ne olacağı)

  // "Ekle" butonuna tıklandığında çalışır
  const handleAddTask = () => {
    // Input'un içindeki metnin başındaki/sonundaki boşlukları sil
    const trimmedText = taskText.trim();

    // Eğer metin boş değilse (kullanıcı bir şey yazdıysa)
    if (trimmedText !== '') {
      // Yeni bir görev objesi oluştur
      const newTask: Task = {
        id: Date.now().toString(), // Benzersiz bir ID için şu anki zamanı kullan
        text: trimmedText,
        isCompleted: false, // Yeni görev "tamamlanmadı" olarak başlar
      };

      // 'tasks' listesini güncelle:
      // Mevcut listenin (...tasks) sonuna yeni görevi (newTask) ekle.
      setTasks([...tasks, newTask]);

      // Input kutusunu temizle
      setTaskText('');
    }
  };

  // "Sil" butonuna tıklandığında çalışır
  // Hangi görevin silineceğini 'id' parametresi ile bilir
  const handleDeleteTask = (id: string) => {
    // 'tasks' listesini filtrele:
    // Sadece ID'si tıklanan ID'ye eşit OLMAYAN görevleri tut.
    // (Tıklananı dışarıda bırakmış oluruz)
    const updatedTasks = tasks.filter((task) => task.id !== id);

    // 'tasks' listesini bu yeni filtrelenmiş liste ile güncelle.
    setTasks(updatedTasks);
  };

  // Checkbox'a (onay kutusu) tıklandığında çalışır
  const handleToggleTask = (id: string) => {
    // 'tasks' listesindeki her bir elemanı 'map' ile dön
    const updatedTasks = tasks.map((task) => {
      // Eğer ID'si tıklanan ID ile eşleşirse
      if (task.id === id) {
        // Görevin diğer tüm bilgilerini (...task) koru,
        // ama 'isCompleted' durumunu tam tersine çevir (!task.isCompleted).
        return { ...task, isCompleted: !task.isCompleted };
      }
      // Eşleşmiyorsa, görevi olduğu gibi (değiştirmeden) bırak.
      return task;
    });

    // 'tasks' listesini bu güncellenmiş liste ile değiştir.
    setTasks(updatedTasks);
  };

  // 4. JSX (Ekranda görünecek HTML kodları)
  // Tailwind CSS sınıfları (className) ile stillendirilmiştir.
  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24 bg-gray-950 text-gray-100">
      <div className="w-full max-w-2xl">
        {/* Başlık */}
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Base Drop Tracker
        </h1>

        {/* Yeni Görev Ekleme Formu */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            value={taskText} // Input'un değeri 'taskText' state'ine bağlı
            onChange={(e) => setTaskText(e.target.value)} // Her tuşa basıldığında 'taskText' state'ini güncelle
            placeholder="Yeni bir farm görevi girin (örn: ZkSync'te hacim yap)"
            className="flex-grow p-4 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddTask} // Tıklandığında 'handleAddTask' fonksiyonunu çalıştır
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 font-semibold text-lg transition-all duration-200"
          >
            Ekle
          </button>
        </div>

        {/* Görev Listesi */}
        <div className="space-y-4">
          {/* 'tasks' listesindeki her bir 'task' için bir 'div' oluştur */}
          {tasks.map((task) => (
            <div
              key={task.id} // React'ın listeyi takip edebilmesi için benzersiz 'key'
              className="flex items-center justify-between p-5 bg-gray-800 rounded-lg border border-gray-700 shadow-lg"
            >
              <div className="flex items-center flex-grow">
                {/* Tamamlandı Checkbox'ı */}
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => handleToggleTask(task.id)}
                  className="w-6 h-6 mr-5 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500 cursor-pointer"
                />
                {/* Görev Metni */}
                <span
                  className={`text-lg break-all ${
                    task.isCompleted ? 'line-through text-gray-500' : ''
                  }`}
                >
                  {task.text}
                </span>
              </div>
              {/* Sil Butonu */}
              <button
                onClick={() => handleDeleteTask(task.id)}
                className="ml-4 px-4 py-2 bg-red-600 rounded-lg text-sm hover:bg-red-700 transition-colors duration-200"
              >
                Sil
              </button>
            </div>
          ))}
        </div>

        {/* Görev listesi boşsa gösterilecek mesaj */}
        {tasks.length === 0 && (
          <p className="text-center text-gray-500 mt-10">
            Henüz hiç görev eklemediniz.
          </p>
        )}
      </div>
    </main>
  );
}

