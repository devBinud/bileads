import { Users, Flame, Globe, CheckCircle, TrendingUp } from 'lucide-react';

export default function StatsBar({ stats }) {
  const items = [
    {
      label: 'Total Leads',
      value: stats.total,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-600/10',
    },
    {
      label: 'Hot Leads',
      value: stats.hot,
      icon: Flame,
      color: 'text-orange-400',
      bg: 'bg-orange-600/10',
    },
    {
      label: 'No Website',
      value: stats.noWebsite,
      icon: Globe,
      color: 'text-red-400',
      bg: 'bg-red-600/10',
    },
    {
      label: 'Contacted',
      value: stats.contacted,
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-600/10',
    },
    {
      label: 'Today',
      value: stats.contactedToday,
      icon: TrendingUp,
      color: 'text-purple-400',
      bg: 'bg-purple-600/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {items.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="card p-4 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <div>
            <p className="text-xl font-bold text-white">{value ?? 0}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
