import { useState } from 'react';
import {
  Flame, Globe, Phone, MapPin, Star, ExternalLink,
  ChevronDown, ChevronUp, Trash2, CheckCircle,
  Copy, StickyNote, Tag, MessageCircle, X, Send,
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

/**
 * WhatsApp message templates with professional introduction and response options
 */
const MESSAGE_TEMPLATES = {
  intro: (leadName) => `Hi! I'm a Software & Mobile App Developer with 5+ years of experience based in Guwahati.

I came across *${leadName}* and noticed you might benefit from a professional website or mobile app to grow your business.

I specialize in:
✅ Custom Websites & Web Apps
✅ Mobile Apps (Android & iOS)
✅ E-commerce Solutions
✅ Business Automation

Would you be interested in discussing how I can help?

Please reply:
1️⃣ *Interested* - Let's discuss
2️⃣ *Not Now* - Maybe later
3️⃣ *More Info* - Tell me more`,

  followUp: (leadName) => `Hello! 👋

I'm Binud, a Software & Mobile App Developer in Guwahati with 5+ years of experience.

I help businesses like *${leadName}* establish a strong digital presence through:
• Professional websites
• Mobile applications
• Online booking systems
• Digital marketing solutions

I'd love to show you how technology can help grow your business.

Are you available for a quick 10-minute call?

Reply:
1️⃣ *Yes, let's talk*
2️⃣ *Send details first*
3️⃣ *Not interested*`,

  noWebsite: (leadName) => `Hi there! 👋

I noticed *${leadName}* doesn't have a website yet. In today's digital world, that's a huge missed opportunity!

I'm a Software & Mobile App Developer based in Guwahati with 5+ years of experience helping local businesses get online.

I can help you with:
🌐 Professional Website
📱 Mobile App
🛒 Online Ordering System
📊 Business Management Tools

*Quick, affordable, and mobile-friendly solutions!*

Interested in taking your business online?

Reply:
1️⃣ *Interested* - Let's discuss
2️⃣ *Get Quote* - Send pricing
3️⃣ *Not Now* - Maybe later`,
};

/**
 * WhatsApp Message Template Modal
 */
function WhatsAppModal({ lead, onClose }) {
  const [selectedTemplate, setSelectedTemplate] = useState('intro');
  const [customMessage, setCustomMessage] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const waNum = toWhatsAppNumber(lead.phone);
  if (!waNum) return null;

  const getMessage = () => {
    if (useCustom) return customMessage;
    return MESSAGE_TEMPLATES[selectedTemplate](lead.name);
  };

  const handleSend = () => {
    const msg = encodeURIComponent(getMessage());
    window.open(`https://wa.me/${waNum}?text=${msg}`, '_blank');
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getMessage());
    toast.success('Message copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-green-50">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
              WhatsApp Message
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Choose a template or write your own message
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/80 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Lead Info */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <p className="text-sm font-semibold text-slate-700">{lead.name}</p>
            <p className="text-xs text-slate-500 mt-1">{lead.phone}</p>
            {lead.category && (
              <span className="inline-block mt-2 text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded">
                {lead.category}
              </span>
            )}
          </div>

          {/* Template Selection */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Choose Template:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={() => { setSelectedTemplate('intro'); setUseCustom(false); }}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedTemplate === 'intro' && !useCustom
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <p className="text-sm font-semibold text-slate-800">Introduction</p>
                <p className="text-xs text-slate-500 mt-1">Professional intro with services</p>
              </button>
              
              <button
                onClick={() => { setSelectedTemplate('followUp'); setUseCustom(false); }}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedTemplate === 'followUp' && !useCustom
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <p className="text-sm font-semibold text-slate-800">Follow Up</p>
                <p className="text-xs text-slate-500 mt-1">Quick call request</p>
              </button>
              
              <button
                onClick={() => { setSelectedTemplate('noWebsite'); setUseCustom(false); }}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  selectedTemplate === 'noWebsite' && !useCustom
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <p className="text-sm font-semibold text-slate-800">No Website</p>
                <p className="text-xs text-slate-500 mt-1">For businesses without website</p>
              </button>
            </div>
          </div>

          {/* Custom Message Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="useCustom"
              checked={useCustom}
              onChange={(e) => setUseCustom(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
            />
            <label htmlFor="useCustom" className="text-sm font-medium text-slate-700 cursor-pointer">
              Write custom message
            </label>
          </div>

          {/* Message Preview */}
          <div>
            <p className="text-sm font-semibold text-slate-700 mb-2">Message Preview:</p>
            {useCustom ? (
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Write your custom message here..."
                rows={12}
                className="w-full bg-white border-2 border-slate-200 text-slate-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 placeholder-slate-400 resize-none font-mono"
              />
            ) : (
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto">
                {getMessage()}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-200 p-4 sm:p-6 bg-slate-50 flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg border-2 border-slate-200 transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy Message
          </button>
          <button
            onClick={handleSend}
            disabled={useCustom && !customMessage.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors shadow-lg shadow-emerald-600/20"
          >
            <Send className="w-4 h-4" />
            Send via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LeadCard({ lead, onUpdate, onDelete }) {
  const [expanded, setExpanded]       = useState(false);
  const [notes, setNotes]             = useState(lead.notes || '');
  const [savingNotes, setSavingNotes] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

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
    <>
      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <WhatsAppModal
          lead={lead}
          onClose={() => setShowWhatsAppModal(false)}
        />
      )}

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
              {lead.phone && toWhatsAppNumber(lead.phone) && (
                <button
                  onClick={() => setShowWhatsAppModal(true)}
                  className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </button>
              )}

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
            {lead.phone && toWhatsAppNumber(lead.phone) && (
              <button
                onClick={() => setShowWhatsAppModal(true)}
                className="col-span-2 flex items-center justify-center gap-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200 px-3 py-2.5 rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Send WhatsApp Message
              </button>
            )}
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
    </>
  );
}
