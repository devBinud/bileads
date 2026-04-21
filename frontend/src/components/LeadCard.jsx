import { useState } from 'react';
import {
  Flame, Globe, Phone, MapPin, Star, ExternalLink,
  ChevronDown, ChevronUp, Trash2, CheckCircle,
  Copy, StickyNote, Tag, MessageCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  new:       'bg-violet-50 text-violet-700 border-blue-100',
  contacted: 'bg-green-50 text-green-700 border-green-100',
  replied:   'bg-purple-50 text-purple-700 border-purple-100',
  closed:    'bg-slate-100 text-slate-500 border-slate-200',
};

const STATUS_NEXT   = { new: 'contacted', contacted: 'replied', replied: 'closed', closed: 'new' };
const STATUS_LABELS = { new: 'Mark Contacted', contacted: 'Mark Replied', replied: 'Mark Closed', closed: 'Reopen' };

/**
 * Converts a raw phone number to a WhatsApp-compatible number.
 * - Strips all non-digit characters
 * - If the number doesn't start with a country code (less than 11 digits),
 *   prepends India's code: 91
 * Returns null if the number is too short to be valid.
 */
function toWhatsAppNumber(raw) {
  if (!raw) return null;
  // Remove everything except digits and leading +
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 7) return null;
  // Already has country code (10+ digits starting with country code)
  // Indian mobile: 10 digits → prepend 91
  // If already 12 digits starting with 91, use as-is
  if (digits.length === 10) return `91${digits}`;
  if (digits.length >= 11)  return digits;
  return digits;
}

export default function LeadCard({ lead, onUpdate, onDelete }) {
  const [expanded, setExpanded]       = useState(false);
  const [notes, setNotes]             = useState(lead.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);

  const score = lead.score || 0;
  const scoreStyle =
    score >= 80 ? { ring: 'ring-green-200',  bg: 'bg-green-50',  text: 'text-green-700'  } :
    score >= 60 ? { ring: 'ring-violet-200',   bg: 'bg-violet-50',   text: 'text-violet-700'   } :
    score >= 40 ? { ring: 'ring-orange-200', bg: 'bg-orange-50', text: 'text-orange-700' } :
                  { ring: 'ring-slate-200',  bg: 'bg-slate-50',  text: 'text-slate-500'  };

  const handleStatusChange = () => {
    const next = STATUS_NEXT[lead.status] || 'new';
    onUpdate(lead.id, { status: next });
    toast.success(`Marked as ${next}`);
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    await onUpdate(lead.id, { notes });
    setSavingNotes(false);
    toast.success('Notes saved');
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <div className={`card-hover ${lead.isHot ? 'border-orange-200 bg-orange-50/20' : ''}`}>

      {/* ── Main Row ─────────────────────────────────────────── */}
      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-3">

          {/* Score badge */}
          <div className={`flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl ring-2 ${scoreStyle.ring} ${scoreStyle.bg} flex flex-col items-center justify-center`}>
            <span className={`text-sm sm:text-base font-bold leading-none ${scoreStyle.text}`}>{score}</span>
            <span className="text-[8px] sm:text-[9px] text-slate-400 mt-0.5">score</span>
          </div>

          {/* Info block */}
          <div className="flex-1 min-w-0">

            {/* Name + expand button row */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-800 text-sm leading-snug break-words pr-1">
                {lead.name}
              </h3>
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex-shrink-0 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition-colors mt-0.5"
              >
                {expanded
                  ? <ChevronUp className="w-4 h-4" />
                  : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {lead.isHot && (
                <span className="badge bg-orange-100 text-orange-600 border border-orange-200">
                  <Flame className="w-3 h-3" /> Hot
                </span>
              )}
              {!lead.hasWebsite && (
                <span className="badge bg-red-50 text-red-600 border border-red-100">
                  <Globe className="w-3 h-3" /> No Website
                </span>
              )}
              <span className={`badge border ${STATUS_STYLES[lead.status] || STATUS_STYLES.new}`}>
                {lead.status}
              </span>
            </div>

            {/* Meta info */}
            <div className="mt-2 space-y-1">
              {lead.category && (
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Tag className="w-3 h-3 flex-shrink-0 text-slate-400" />
                  <span className="truncate">{lead.category}</span>
                </p>
              )}
              {lead.rating != null && (
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Star className="w-3 h-3 flex-shrink-0 text-amber-400 fill-amber-400" />
                  <span>{lead.rating} · {lead.reviewCount?.toLocaleString() ?? 0} reviews</span>
                </p>
              )}
              {lead.phone && (
                <p className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Phone className="w-3 h-3 flex-shrink-0 text-slate-400" />
                  <span className="truncate">{lead.phone}</span>
                </p>
              )}
              {lead.address && (
                <p className="flex items-start gap-1.5 text-xs text-slate-400">
                  <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5 text-slate-300" />
                  <span className="line-clamp-2">{lead.address}</span>
                </p>
              )}
            </div>

            {/* Quick action buttons — always visible */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
                  className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 active:bg-green-200 border border-green-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call
                </a>
              )}

              {/* WhatsApp button */}
              {lead.phone && (() => {
                const waNum = toWhatsAppNumber(lead.phone);
                if (!waNum) return null;
                const msg = encodeURIComponent(
                  `Hi! I came across ${lead.name} on Google Maps. I build websites for local businesses in Guwahati — quick, affordable, and mobile-friendly. Would you be open to a quick chat?`
                );
                return (
                  <a
                    href={`https://wa.me/${waNum}?text=${msg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>
                );
              })()}

              {lead.mapsUrl && (
                <a
                  href={lead.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 active:bg-blue-200 border border-violet-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Maps
                </a>
              )}
              <button
                onClick={handleStatusChange}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors ml-auto"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                {STATUS_LABELS[lead.status] || 'Update'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Expanded Section ──────────────────────────────────── */}
      {expanded && (
        <div className="border-t border-slate-100 p-3 sm:p-4 space-y-4 bg-slate-50/60 rounded-b-xl">

          {/* Score reasons */}
          {lead.scoreReasons?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">Score breakdown</p>
              <div className="flex flex-wrap gap-1.5">
                {lead.scoreReasons.map((r) => (
                  <span key={r} className="badge bg-white border border-slate-200 text-slate-600">{r}</span>
                ))}
              </div>
            </div>
          )}

          {/* Website */}
          {lead.website && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1">Website</p>
              <a
                href={lead.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-violet-600 hover:underline flex items-center gap-1 break-all"
              >
                <Globe className="w-3 h-3 flex-shrink-0" />
                {lead.website}
              </a>
            </div>
          )}

          {/* Notes */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
              <StickyNote className="w-3.5 h-3.5" /> Notes
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this lead..."
              rows={3}
              className="w-full bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 placeholder-slate-400 resize-none shadow-sm"
            />
            {notes !== (lead.notes || '') && (
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="btn-primary mt-2 py-2 text-sm"
              >
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            )}
          </div>

          {/* Action buttons grid */}
          <div className="grid grid-cols-2 gap-2">
            {lead.phone && (
              <button
                onClick={() => copyToClipboard(lead.phone, 'Phone')}
                className="flex items-center justify-center gap-1.5 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 px-3 py-2.5 rounded-lg transition-colors"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Phone
              </button>
            )}
            <button
              onClick={() => copyToClipboard(lead.name, 'Name')}
              className="flex items-center justify-center gap-1.5 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 px-3 py-2.5 rounded-lg transition-colors"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Name
            </button>
            {/* WhatsApp with pre-filled message */}
            {lead.phone && (() => {
              const waNum = toWhatsAppNumber(lead.phone);
              if (!waNum) return null;
              const msg = encodeURIComponent(
                `Hi! I came across ${lead.name} on Google Maps. I build websites for local businesses in Guwahati — quick, affordable, and mobile-friendly. Would you be open to a quick chat?`
              );
              return (
                <a
                  href={`https://wa.me/${waNum}?text=${msg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="col-span-2 flex items-center justify-center gap-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200 px-3 py-2.5 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp with Message
                </a>
              );
            })()}
            <button
              onClick={() => { if (confirm(`Delete "${lead.name}"?`)) onDelete(lead.id); }}
              className="col-span-2 flex items-center justify-center gap-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 active:bg-red-200 border border-red-100 px-3 py-2.5 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Lead
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
