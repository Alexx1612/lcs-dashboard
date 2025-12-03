import React, { useState, useEffect } from 'react';
import { Check, Clock, Edit2, Play, Users, Video, Film, Monitor, Gamepad2, Mic, Activity, Trash2, Plus, Wifi, Save } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query
} from 'firebase/firestore';

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyCmokg21fn4TRfFA5qoj_nXZZhQ-U2hRdM",
  authDomain: "lcs-rdv-cb02a.firebaseapp.com",
  projectId: "lcs-rdv-cb02a",
  storageBucket: "lcs-rdv-cb02a.firebasestorage.app",
  messagingSenderId: "842667818816",
  appId: "1:842667818816:web:9497824cc1b51f9ae184a5",
  measurementId: "G-VC3ZRDSL0R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Collections
const TASKS_COLLECTION = 'lcs_rdv2_tasks';

export default function App() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Authentication Setup
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth failed", err);
        setError("Authentication failed. Check internet.");
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. Data Syncing
  useEffect(() => {
    if (!user) return;

    const tasksRef = collection(db, TASKS_COLLECTION);
    const q = query(tasksRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      fetchedTasks.sort((a: any, b: any) => (a.createdAt || 0) - (b.createdAt || 0));
      setTasks(fetchedTasks);
      setLoading(false);
    }, (err) => {
      console.error("Data fetch error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // --- ACTIONS ---

  const addTask = async (category: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, TASKS_COLLECTION), {
        category,
        text: 'New Item',
        note: '',
        status: 'pending',
        createdAt: Date.now()
      });
    } catch (err) {
      console.error("Error adding:", err);
    }
  };

  const updateTask = async (id: string, updates: any) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, TASKS_COLLECTION, id), updates);
    } catch (err) {
      console.error("Error updating:", err);
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    if (!window.confirm("Delete this item?")) return;
    try {
      await deleteDoc(doc(db, TASKS_COLLECTION, id));
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  // --- UI COMPONENTS ---

  const categories = [
    { id: 'Overlays', icon: Monitor, label: 'Visual FX & Overlays' },
    { id: 'Skits', icon: Film, label: 'Skits & Ads' },
    { id: 'Webcam', icon: Video, label: 'Webcam Gags' },
    { id: 'Gameplay', icon: Gamepad2, label: 'Game Rules' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-500 text-white border-green-500';
      case 'in-progress': return 'bg-yellow-500 text-black border-yellow-500';
      default: return 'bg-gray-800 text-gray-400 border-gray-600';
    }
  };

  const toggleStatus = (task: any) => {
    const next = task.status === 'pending' ? 'in-progress' : task.status === 'in-progress' ? 'done' : 'pending';
    updateTask(task.id, { status: next });
  };

  const completedCount = tasks.filter(t => t.status === 'done').length;
  const totalCount = tasks.length || 1;
  const progress = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <header className="mb-8 flex justify-between items-center border-b border-gray-700 pb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              LCS RDV 2: Production
            </h1>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-gray-400 text-sm">Game 1 Pre-Show</span>
               {loading ?
                 <span className="text-yellow-500 text-xs animate-pulse">Connecting...</span> :
                 <span className="text-green-500 text-xs flex items-center gap-1"><Wifi size={10}/> Online</span>
               }
            </div>
            {error && <div className="text-red-400 text-xs mt-1">{error}</div>}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold font-mono">{progress}%</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider">Ready</div>
          </div>
        </header>

        {/* Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-800/50 p-1 rounded-lg inline-flex">
          {[
            { id: 'tasks', icon: Activity, label: 'Tracker' },
            { id: 'timeline', icon: Clock, label: 'Run of Show' },
            { id: 'roster', icon: Users, label: 'Rosters' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md transition-all flex items-center gap-2 text-sm font-medium ${
                activeTab === tab.id
                  ? 'bg-gray-700 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* --- MAIN CONTENT AREA --- */}

        {activeTab === 'tasks' && (
          <div className="space-y-6">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gray-800 rounded-lg text-blue-400"><cat.icon size={20} /></div>
                  <h2 className="text-lg font-bold text-gray-200">{cat.label}</h2>
                  <button
                    onClick={() => addTask(cat.id)}
                    className="ml-auto text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors"
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>

                <div className="space-y-2">
                  {tasks.filter(t => t.category === cat.id).length === 0 && (
                    <div className="text-gray-600 text-sm italic px-2">No items yet.</div>
                  )}

                  {tasks.filter(t => t.category === cat.id).map(task => (
                    <div key={task.id} className="group flex items-start gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors">
                      <button
                        onClick={() => toggleStatus(task)}
                        className={`mt-1.5 w-5 h-5 rounded border flex items-center justify-center transition-all flex-shrink-0 ${getStatusColor(task.status)}`}
                      >
                        {task.status === 'done' && <Check size={12} strokeWidth={4} />}
                      </button>

                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          defaultValue={task.text}
                          onBlur={(e) => updateTask(task.id, { text: e.target.value })}
                          className={`bg-transparent w-full font-medium focus:outline-none focus:text-blue-300 transition-colors ${
                            task.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-200'
                          }`}
                        />
                        <input
                          type="text"
                          defaultValue={task.note}
                          placeholder="Add notes..."
                          onBlur={(e) => updateTask(task.id, { note: e.target.value })}
                          className="bg-transparent w-full text-xs text-gray-500 mt-0.5 focus:outline-none focus:text-gray-400"
                        />
                      </div>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 p-1 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-gray-800/40 rounded-xl p-6 border border-gray-700/50">
            <div className="relative border-l-2 border-gray-700 ml-3 space-y-8 py-2">
              {[
                { time: '00:00', title: 'Countdown', desc: 'Stream Start / Music' },
                { time: '05:00', title: 'Intro', desc: 'Hosts Welcome' },
                { time: '10:00', title: 'Team Intros', desc: 'Video Packages' },
                { time: '25:00', title: 'GAME START', desc: 'Live Gameplay', active: true },
                { time: '55:00', title: 'Post-Game', desc: 'Interviews' },
              ].map((item, idx) => (
                <div key={idx} className="relative pl-8">
                  <div className={`absolute -left-[9px] w-4 h-4 rounded-full border-2 ${
                    item.active
                      ? 'bg-red-500 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                      : 'bg-gray-900 border-gray-600'
                  }`} />
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-blue-400 font-bold">{item.time}</span>
                    <h3 className={`font-bold ${item.active ? 'text-red-400' : 'text-gray-300'}`}>{item.title}</h3>
                  </div>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'roster' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-800/40 p-5 rounded-xl border border-gray-700/50">
              <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2"><Users size={18}/> Team Blue</h3>
              <div className="space-y-2">
                {['Player 1 (C)', 'Player 2', 'Player 3', 'Player 4', 'Player 5'].map((p, i) => (
                  <div key={i} className="p-2 bg-gray-800/50 rounded flex items-center gap-2 text-sm text-gray-300">
                    <div className="w-6 h-6 bg-blue-900/50 rounded-full flex items-center justify-center text-xs text-blue-200">{i+1}</div>
                    {p}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-800/40 p-5 rounded-xl border border-gray-700/50">
              <h3 className="text-red-400 font-bold mb-4 flex items-center gap-2"><Users size={18}/> Team Red</h3>
              <div className="space-y-2">
                {['Player 1 (C)', 'Player 2', 'Player 3', 'Player 4', 'Player 5'].map((p, i) => (
                  <div key={i} className="p-2 bg-gray-800/50 rounded flex items-center gap-2 text-sm text-gray-300">
                    <div className="w-6 h-6 bg-red-900/50 rounded-full flex items-center justify-center text-xs text-red-200">{i+1}</div>
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}