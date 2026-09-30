import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageSquare } from 'lucide-react';
import { useShopping } from '../context/ShoppingContext';

export const ShareModal = ({ isOpen, onClose }) => {
  const { getFormattedShareText } = useShopping();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const textToShare = getFormattedShareText();

  const handleCopy = () => {
    navigator.clipboard.writeText(textToShare);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(textToShare);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'La mia Lista Spesa',
        text: textToShare
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.15rem' }}>
            <Share2 size={22} color="var(--primary)" /> Condividi Lista Spesa
          </div>
          <button className="btn btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem', maxHeight: '180px', overflowY: 'auto' }}>
          <pre style={{ fontFamily: 'inherit', fontSize: '0.82rem', whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>
            {textToShare}
          </pre>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <button className="btn btn-primary" onClick={handleWhatsApp} style={{ background: '#25D366' }}>
            <MessageSquare size={18} /> Invia su WhatsApp
          </button>

          <button className="btn btn-secondary" onClick={handleCopy}>
            {copied ? <Check size={18} color="var(--primary)" /> : <Copy size={18} />}
            {copied ? 'Copiato negli appunti!' : 'Copia Testo Lista'}
          </button>

          {navigator.share && (
            <button className="btn btn-secondary" onClick={handleNativeShare}>
              <Share2 size={18} /> Condividi con altre app
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
