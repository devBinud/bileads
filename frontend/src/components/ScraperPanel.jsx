import { useState } from 'react';
import { Search, Zap, CheckCircle, SkipForward, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../api';
import toast from 'react-hot-toast';

const QUICK_SEARCHES = [
  'restaurants in Guwahati',
  'gyms in Guwahati',
  'hotels in Guwahati',
  'salons in Guwahati',
  'clinics in Guwahati',
  'coaching centers in Guwahati',
  'bakeries in Guwahati',
  'dental clinics in Guwahati',
  'lawyers in Guwahati',
  'pharmacies in Guwahati',
];

export default function ScraperPanel({ scraping, setScraping, onComplete }) {
  const [query, setQuery]           = useState('');
  const [maxResults, setMaxResults] = useState(60);

  // Live progress state
  const [progress, setProgress] = useState(null);
  // { current, total, currentName, added, skipped, log: [{name, type}] }

  const handleScrape = async (q = query) => {
    const trimmed = q.trim();
    if (!trimmed) { toast.error('Enter a search query first'); return; }

    setScraping(true);
    setProgress({ current: 0, total: maxResults, currentName: 'Starting...', added: 0, skipped: 0, log: [] });

    try {
      await api.scrapeStream(trimmed, maxResults, (event) => {
        setProgress((prev) => {
          if (!prev) return prev;

          if (event.type === 'start') {
            return { ...prev, total: event.total || maxResults, currentName: 'Scanning Google Maps...' };
          }

          if (event.type === 'progress') {
            return {
              ...prev,
              current: event.current,
              total: event.total,
              currentName: event.name || 'Scanning...',
            };
          }

          if (event.type === 'saving') {
            return { ...prev, currentName: 'Saving to database...' };
          }

          if (event.type === 'saved') {
            return {
              ...prev,
              added: event.added,
              skipped: event.skipped,
              currentName: `Saved: ${event.name}`,
              log: [{ name: event.name, type: 'saved', score: event.score, isHot: event.isHot }, ...(prev.log || [])].slice(0, 8),
            };
          }

          if (event.type === 'skip') {
            return {
              ...prev,
              skipped: (prev.skipped || 0) + 1,
              log: [{ name: event.name, type: 'skip' }, ...(prev.log || [])].slice(0, 8),
            };
          }

          if (event.type === 'done') {
            return { ...prev, done: true, added: event.added, skipped: event.skipped, currentName: 'Complete!' };
          }

          return prev;
        });

        if (event.type === 'done') {
          setScraping(false);
          toast.success(`Done! ${event.added} leads added for "${trimmed}"`);
          onComplete(trimmed);
        }

        if (event.type === 'error') {
          setScraping(false);
          toast.error(`Scrape failed: ${event.message}`);
          setProgress(null);
        }
      });
    } catch (err) {
      setScraping(false);
      toast.error(`Scrape failed: ${err.message}`);
      setProgress(null);
    }
  };

  const pct = progress && progress.total > 0
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <div className="card border-violet-100 overflow-hidden">
      {/* Search row */}
      <div className="p-3 sm:p-4 space-y-3 bg-violet-50/40">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !scraping && handleScrape()}
              placeholder='e.g. "coaching centers in Guwahati"'
              className="input w-full pl-9"
              disabled={scraping}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              className="input flex-1 sm:w-20 sm:flex-none"
              disabled={scraping}
            >
              <option value={30}>30</option>
              <option value={60}>60</option>
              <option value={100}>100</option>
            </select>
            <button
              onClick={() => handleScrape()}
              disabled={scraping || !query.trim()}
              className="btn-primary flex items-center gap-2 whitespace-nowrap flex-1 sm:flex-none justify-center px-5"
            >
              {scraping
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Scraping...</>
                : <><Zap className="w-4 h-4" /> Fetch</>}
            </button>
          </div>
        </div>

        {/* Quick searches */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-slate-400 self-center">Quick:</span>
          {QUICK_SEARCHES.map((q) => (
            <button
              key={q}
              onClick={() => { setQuery(q); if (!scraping) handleScrape(q); }}
              disabled={scraping}
              className="text-xs bg-white border border-slate-200 hover:border-violet-300 hover:text-violet-600 text-slate-600 px-2.5 py-1 rounded-full transition-all disabled:opacity-40 shadow-sm"
            >
              {q.split(' in ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Live progress */}
      {progress && (
        <div className="border-t border-slate-100 p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {progress.done
                ? <CheckCircle className="w-4 h-4 text-green-500" />
                : <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
              <span className="text-sm font-medium text-slate-700">
                {progress.done ? 'Scraping complete' : `Scraping "${query || '...'}"` }
              </span>
            </div>
            <span className="text-xs text-slate-400">
              {progress.current}/{progress.total}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${progress.done ? 'bg-green-500' : 'bg-violet-500'}`}
              style={{ width: `${progress.done ? 100 : pct}%` }}
            />
          </div>

          {/* Current action */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 truncate max-w-[60%]">
              {progress.currentName}
            </span>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <CheckCircle className="w-3 h-3" /> {progress.added} added
              </span>
              {progress.skipped > 0 && (
                <span className="flex items-center gap-1 text-slate-400">
                  <SkipForward className="w-3 h-3" /> {progress.skipped} skipped
                </span>
              )}
            </div>
          </div>

          {/* Live log — last 8 businesses */}
          {progress.log?.length > 0 && (
            <div className="bg-slate-50 rounded-lg p-2.5 space-y-1 max-h-36 overflow-y-auto">
              {progress.log.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  {item.type === 'saved'
                    ? <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                    : <SkipForward className="w-3 h-3 text-slate-300 flex-shrink-0" />}
                  <span className={`truncate ${item.type === 'saved' ? 'text-slate-700' : 'text-slate-400'}`}>
                    {item.name}
                  </span>
                  {item.type === 'saved' && (
                    <span className={`ml-auto flex-shrink-0 font-semibold ${
                      item.score >= 70 ? 'text-green-600' : item.score >= 50 ? 'text-violet-600' : 'text-slate-400'
                    }`}>
                      {item.score}
                      {item.isHot && ' 🔥'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
