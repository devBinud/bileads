import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const unsub = onAuthStateChanged(auth, (u) => setUser(u));
      return unsub;
    } catch (err) {
      console.error('Auth state change error:', err);
      setError(err.message);
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-lg p-6 border border-red-500">
          <h1 className="text-xl font-bold text-red-400 mb-4">Initialization Error</h1>
          <p className="text-slate-300 mb-4">{error}</p>
          <p className="text-sm text-slate-400">
            Please check the browser console for more details.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading BiLeads...</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard user={user} /> : <LoginPage />;
}
