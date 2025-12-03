import React, { useState, useEffect } from 'react';
import { Check, Clock, Edit2, Play, Users, Video, Film, Monitor, Gamepad2, Mic, Activity, Trash2, Plus, Wifi, Save } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp
} from 'firebase/firestore';

// --- YOUR REAL FIREBASE CONFIG (From Photo) ---
const firebaseConfig = {
  apiKey: "AIzaSyCmokg21fn4TrFFA5qoj_nXZZHq-U2hRdM",
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

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setConnectionStatus('Connected');
      } else {
        // Attempt to sign in if not signed in
        signInAnonymously(auth).catch((error) => {
          console.error("Auth Error:", error);
          setConnectionStatus('Authentication failed. Check internet.');
        });
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-indigo-400 mb-2">LCS RDV 2: Production</h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-orange-400">Game 1 Pre-Show</span>
              <span className={`font-bold ${user ? 'text-green-500' : 'text-red-500'}`}>
                {connectionStatus}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold mb-1">0%</div>
            <div className="text-xs text-slate-500 uppercase tracking-wider">READY</div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="space-y-6">
            <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
               <h2 className="text-xl font-semibold mb-4 text-white">Visual FX & Overlays</h2>
               <div className="text-slate-400 italic">No items yet.</div>
               <button className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-sm font-medium transition-colors">
                 + Add Item
               </button>
            </div>

            <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
               <h2 className="text-xl font-semibold mb-4 text-white">Skits & Ads</h2>
               <div className="text-slate-400 italic">No items yet.</div>
               <button className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-sm font-medium transition-colors">
                 + Add Item
               </button>
            </div>
        </div>
      </div>
    </div>
  );
}

export default App;