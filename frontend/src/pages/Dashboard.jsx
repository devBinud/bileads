import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { api, warmUp } from '../api';
import toast from 'react-hot-toast';
import {
  Target, LogOut, RefreshCw, Flame, Globe, Users,
  MessageSquare, X, LayoutDashboard, Zap,
  CheckCircle, ChevronRight, Search, ChevronLeft,
  Tag, Menu,
} from 'lucide-react';
import LeadCard from '../components/LeadCard';
import ScraperPanel from '../components/ScraperPanel';
import TemplatesModal from '../components/TemplatesModal';

const PAGE_SIZE = 15;

const STATUS_NAV = [
  { id: 'all',       label: 'All Leads',  icon: LayoutDashboard },
  { id: 'hot',       label: 'Hot Leads',  icon: Flame           },
  { id: 'nowebsite', label: 'No Website', icon: Globe           },
  { id: 'new',       label: 'New',        icon: Users           },
  { id: 'contacted', label: 'Contacted',  icon: CheckCircle     },
  { id: 'replied',   label: 'Replied',    icon: MessageSquare   },
  { id: 'closed',    label: 'Closed',     icon: X               },
];

function SidebarContent({
  user, leads, activeNav, activeQuery, scrapeQueries,
  showScraper, setShowScraper,
  setActiveNav, setActiveQuery, setShowTemplates,
  onNavClick,
}) {
  const getNavCount = (id) => {
    if (!leads.length) return 0;
    if (id === 'all')       return leads.length;
    if (id === 'hot')       return leads.filter(l => l.isHot).length;
    if (id === 'nowebsite') return leads.filter(l => !l.hasWebsite).length;
    if (id === 'new')       return leads.filter(l => l.status === 'new').length;
    if (id === 'contacted') return leads.filter(l => l.status === 'contacted').length;
    if (id === 'replied')   return leads.filter(l => l.status === 'replied').length;
    if (id === 'closed')    return leads.filter(l => l.status === 'closed').length;
    return 0;
  };

  return (
    <>
      {/* Logo */}
      <div className="px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <img src="/logo192.png" alt="BiLeads" className="w-8 h-8 rounded-lg" />
          <div>
            <p className="font-bold text-slate-800 text-sm leading-none">BiLeads</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Client Acquisition Engine</p>
          </div>
        </div>
      </div>

      {/* Fetch button */}
      <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
        <button
          onClick={() => setShowScraper(!showScraper)}
          className="w-full flex items-center justify-between bg-violet-600 hover:bg-violet-700 active:bg-blue-800 text-white text-sm font-medium px-3 py-2.5 rounded-lg transition-colors shadow-sm select-none"
        >
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4" /> Fetch New Leads
          </span>
          <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${showScraper ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1.5">Views</p>
          <div className="space-y-0.5">
            {STATUS_NAV.map(({ id, label, icon: Icon }) => {
              const count = getNavCount(id);
              const isActive = activeNav === id && activeQuery === 'all';
              return (
                <button
                  key={id}
                  onClick={() => { setActiveNav(id); setActiveQuery('all'); onNavClick?.(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors select-none ${
                    isActive
                      ? 'bg-violet-50 text-violet-700 border border-violet-100'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-violet-600' : 'text-slate-400'}`} />
                  <span className="flex-1 text-left">{label}</span>
                  <span className={`text-xs font-semibold min-w-[20px] text-center px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'
                  }`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {scrapeQueries.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1.5">By Category</p>
            <div className="space-y-0.5">
              {scrapeQueries.map((q) => {
                const count = leads.filter(l => l.searchQuery === q).length;
                const isActive = activeQuery === q;
                const shortLabel = q.split(' in ')[0]
                  .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                return (
                  <button
                    key={q}
                    onClick={() => { setActiveQuery(q); setActiveNav('all'); onNavClick?.(); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors select-none ${
                      isActive
                        ? 'bg-violet-50 text-violet-700 border border-violet-100'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-transparent'
                    }`}
                  >
                    <Tag className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-violet-600' : 'text-slate-400'}`} />
                    <span className="flex-1 text-left truncate">{shortLabel}</span>
                    <span className={`text-xs font-semibold min-w-[20px] text-center px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'
                    }`}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1.5">Tools</p>
          <button
            onClick={() => { setShowTemplates(true); onNavClick?.(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-transparent transition-colors select-none"
          >
            <MessageSquare className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>Message Templates</span>
          </button>
        </div>
      </nav>

      {/* User */}
      <div className="px-4 py-3 border-t border-slate-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-violet-600">{user?.email?.[0]?.toUpperCase()}</span>
            </div>
            <p className="text-xs text-slate-600 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => signOut(auth)}
            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}

export default function Dashboard({ user }) {
  const [leads, setLeads]         = useState([]);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scraping, setScraping]   = useState(false);

  const [activeNav, setActiveNav]           = useState('all');
  const [activeQuery, setActiveQuery]       = useState('all');
  const [searchText, setSearchText]         = useState('');
  const [filterMinScore, setFilterMinScore] = useState(0);

  const [showTemplates, setShowTemplates] = useState(false);
  const [showScraper, setShowScraper]     = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [page, setPage]                   = useState(1);

  const mainRef = useRef(null);

  const fetchLeads = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      await warmUp(); // wake backend if sleeping
      const data = await api.getLeads();
      setLeads(data.leads || []);
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getStats();
      setStats(data);
    } catch {}
  }, []);

  useEffect(() => { fetchLeads(); fetchStats(); }, [fetchLeads, fetchStats]);
  useEffect(() => { setPage(1); }, [activeNav, activeQuery, searchText, filterMinScore]);

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1024) setMobileSidebarOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchLeads(true), fetchStats()]);
      toast.success('Refreshed');
    } finally {
      setRefreshing(false);
    }
  };

  const handleScrapeComplete = (query) => {
    setScraping(false);
    fetchLeads(true);
    fetchStats();
    if (query) { setActiveQuery(query); setActiveNav('all'); }
  };

  const handleUpdateLead = async (id, updates) => {
    try {
      await api.updateLead(id, updates);
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));
      fetchStats();
    } catch { toast.error('Failed to update lead'); }
  };

  const handleDeleteLead = async (id) => {
    try {
      await api.deleteLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      toast.success('Lead removed');
      fetchStats();
    } catch { toast.error('Failed to delete lead'); }
  };

  const scrapeQueries = useMemo(() =>
    [...new Set(leads.map((l) => l.searchQuery).filter(Boolean))].sort(),
    [leads]
  );

  const filteredLeads = useMemo(() => leads.filter((lead) => {
    if (activeNav === 'hot'       && !lead.isHot)          return false;
    if (activeNav === 'nowebsite' && lead.hasWebsite)       return false;
    if (['new','contacted','replied','closed'].includes(activeNav) && lead.status !== activeNav) return false;
    if (activeQuery !== 'all' && lead.searchQuery !== activeQuery) return false;
    if (lead.score < filterMinScore) return false;
    if (searchText) {
      const q = searchText.toLowerCase();
      if (!lead.name?.toLowerCase().includes(q) &&
          !lead.category?.toLowerCase().includes(q) &&
          !lead.address?.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [leads, activeNav, activeQuery, searchText, filterMinScore]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE));
  const pagedLeads = filteredLeads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const topLeads = useMemo(() =>
    [...leads].filter((l) => l.status === 'new').sort((a, b) => b.score - a.score).slice(0, 5),
    [leads]
  );

  const pageTitle = activeQuery !== 'all'
    ? activeQuery.split(' in ')[0].split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : STATUS_NAV.find(n => n.id === activeNav)?.label || 'All Leads';

  const sidebarProps = {
    user, leads, activeNav, activeQuery, scrapeQueries,
    showScraper, setShowScraper,
    setActiveNav, setActiveQuery, setShowTemplates,
  };

  return (
    <div className="min-h-screen flex bg-slate-50">

      {/* ── Desktop Sidebar (fixed, no layout shift) ─────────────── */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-white border-r border-slate-200 flex-col fixed top-0 left-0 h-screen z-20">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* ── Mobile Sidebar Overlay ────────────────────────────────── */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}
      <aside className={`fixed top-0 left-0 h-screen w-72 bg-white border-r border-slate-200 flex flex-col z-50 lg:hidden shadow-xl transition-transform duration-300 ease-in-out ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent {...sidebarProps} onNavClick={() => setMobileSidebarOpen(false)} />
      </aside>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen" ref={mainRef}>

        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 lg:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="font-semibold text-slate-800 text-base truncate">{pageTitle}</h1>
              <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
                {filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}
                {activeQuery !== 'all' && ` · ${activeQuery}`}
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors disabled:opacity-60 flex-shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-6 space-y-4">

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              {[
                { label: 'Total',      value: stats.total,     icon: Users,       color: 'text-violet-600',   bg: 'bg-violet-50'   },
                { label: 'Hot',        value: stats.hot,       icon: Flame,       color: 'text-orange-500', bg: 'bg-orange-50' },
                { label: 'No Website', value: stats.noWebsite, icon: Globe,       color: 'text-red-500',    bg: 'bg-red-50'    },
                { label: 'Contacted',  value: stats.contacted, icon: CheckCircle, color: 'text-green-600',  bg: 'bg-green-50'  },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="card p-3 flex items-center gap-2.5">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg sm:text-xl font-bold text-slate-800 leading-none">{value ?? 0}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Scraper */}
          {showScraper && (
            <ScraperPanel scraping={scraping} setScraping={setScraping} onComplete={handleScrapeComplete} />
          )}

          {/* Top 5 */}
          {topLeads.length > 0 && activeNav === 'all' && activeQuery === 'all' && (
            <div className="card p-3 sm:p-4">
              <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" /> Top 5 Opportunities
              </h2>
              <div className="space-y-1.5">
                {topLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                    {lead.isHot && <Flame className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />}
                    <span className="text-slate-700 font-medium text-sm flex-1 truncate">{lead.name}</span>
                    <span className="text-violet-600 font-bold text-xs bg-violet-50 px-2 py-0.5 rounded-full flex-shrink-0">{lead.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search + score filter */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by name, category, address..."
                className="input w-full pl-9"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterMinScore}
                onChange={(e) => setFilterMinScore(Number(e.target.value))}
                className="input flex-1 sm:flex-none"
              >
                <option value={0}>Any score</option>
                <option value={50}>Score ≥ 50</option>
                <option value={60}>Score ≥ 60</option>
                <option value={70}>Score ≥ 70</option>
                <option value={80}>Score ≥ 80</option>
              </select>
              {(searchText || filterMinScore > 0) && (
                <button
                  onClick={() => { setSearchText(''); setFilterMinScore(0); }}
                  className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Count row */}
          {!loading && filteredLeads.length > 0 && (
            <div className="flex items-center justify-between text-xs text-slate-400 px-0.5">
              <span>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredLeads.length)} of {filteredLeads.length} leads
              </span>
              {totalPages > 1 && <span>Page {page} of {totalPages}</span>}
            </div>
          )}

          {/* Leads */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="relative w-12 h-12">
                <div className="w-12 h-12 border-4 border-violet-100 rounded-full" />
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute inset-0" />
              </div>
              <div className="text-center">
                <p className="text-slate-600 font-medium text-sm">Loading leads...</p>
                <p className="text-slate-400 text-xs mt-1">Fetching from database</p>
              </div>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-slate-600 font-semibold">No leads found</p>
              <p className="text-slate-400 text-sm mt-1.5">
                {leads.length === 0
                  ? 'Tap "Fetch New Leads" to get started'
                  : 'Try a different filter or search term'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2.5">
                {pagedLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} onUpdate={handleUpdateLead} onDelete={handleDeleteLead} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-2 flex-wrap">
                  <button
                    onClick={() => { setPage(p => Math.max(1, p - 1)); mainRef.current?.scrollTo(0, 0); }}
                    disabled={page === 1}
                    className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) =>
                        typeof p === 'string' ? (
                          <span key={`dot-${i}`} className="w-8 text-center text-slate-400 text-sm">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => { setPage(p); mainRef.current?.scrollTo(0, 0); }}
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                              page === p
                                ? 'bg-violet-600 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}
                  </div>

                  <button
                    onClick={() => { setPage(p => Math.min(totalPages, p + 1)); mainRef.current?.scrollTo(0, 0); }}
                    disabled={page === totalPages}
                    className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {showTemplates && <TemplatesModal onClose={() => setShowTemplates(false)} />}
    </div>
  );
}
