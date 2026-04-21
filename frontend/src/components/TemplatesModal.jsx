import { useState } from 'react';
import { X, Copy, Check, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const TEMPLATES = [
  {
    id: 1,
    label: 'No Website — Intro',
    tag: 'Cold Outreach',
    tagColor: 'bg-violet-50 text-violet-700 border-violet-100',
    message: `Hi! I came across [Business Name] on Google Maps and noticed you don't have a website yet.

A professional website can help you get more customers online, show up in Google searches, and build trust with new clients.

I build websites for local businesses in Guwahati — quick, affordable, and mobile-friendly.

Would you be open to a quick chat? I'd love to show you what I can do for [Business Name].`,
  },
  {
    id: 2,
    label: 'High Reviews — Credibility Pitch',
    tag: 'Social Proof',
    tagColor: 'bg-purple-50 text-purple-700 border-purple-100',
    message: `Hi! I noticed [Business Name] has great reviews on Google — clearly your customers love you!

A website would help you turn that reputation into even more business. People search online before visiting, and without a website, you might be losing potential customers.

I specialize in building websites for local businesses in Guwahati. Fast, affordable, and designed to get you more clients.

Interested in a free demo? Happy to show you what it could look like.`,
  },
  {
    id: 3,
    label: 'Short & Direct',
    tag: 'Quick Pitch',
    tagColor: 'bg-green-50 text-green-700 border-green-100',
    message: `Hi [Business Name]! 👋

I build websites for local businesses in Guwahati. I noticed you don't have one yet — I can get you online quickly and affordably.

Interested? I can share some examples of my work.`,
  },
  {
    id: 4,
    label: 'Follow-Up',
    tag: 'Follow Up',
    tagColor: 'bg-amber-50 text-amber-700 border-amber-100',
    message: `Hi! Just following up on my earlier message about building a website for [Business Name].

I know things get busy — just wanted to check if you had a chance to think about it.

Happy to answer any questions or share pricing. No pressure at all!`,
  },
  {
    id: 5,
    label: 'WhatsApp Opener',
    tag: 'WhatsApp',
    tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    message: `Hi! Is this [Business Name]? 😊

I'm a web developer based in Guwahati. I help local businesses get online with professional websites.

I came across your business and thought you might be interested. Do you have a website currently?`,
  },
];

export default function TemplatesModal({ onClose }) {
  const [copied, setCopied] = useState(null);

  const handleCopy = (t) => {
    navigator.clipboard.writeText(t.message);
    setCopied(t.id);
    toast.success(`"${t.label}" copied!`);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-2xl max-h-[90dvh] sm:max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-violet-50 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-violet-600" />
            </div>
            <h2 className="font-semibold text-slate-800">Message Templates</h2>
          </div>
          <button onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Templates */}
        <div className="overflow-y-auto p-5 space-y-3">
          {TEMPLATES.map((t) => (
            <div key={t.id} className="border border-slate-200 rounded-xl p-4 space-y-3 hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-800 text-sm">{t.label}</span>
                  <span className={`badge border ${t.tagColor}`}>{t.tag}</span>
                </div>
                <button
                  onClick={() => handleCopy(t)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    copied === t.id
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {copied === t.id
                    ? <><Check className="w-3.5 h-3.5" /> Copied!</>
                    : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              </div>
              <pre className="text-xs text-slate-600 whitespace-pre-wrap font-sans leading-relaxed bg-slate-50 rounded-lg p-3">
                {t.message}
              </pre>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <p className="text-xs text-slate-400 text-center">
            Replace <span className="font-medium text-slate-600">[Business Name]</span> with the actual name before sending
          </p>
        </div>
      </div>
    </div>
  );
}
