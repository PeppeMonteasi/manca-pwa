import React, { useState, useRef } from 'react';
import { Mic, MicOff, Check, RotateCcw, Volume2, Bot, AlertCircle, Trash2, Plus, ListPlus, X, Sparkles } from 'lucide-react';
import { parseVoiceInputWithAI } from '../services/aiParser';
import { CATEGORIES } from '../context/ShoppingContext';
import { getProductImage } from '../services/imageService';
import { triggerHaptic } from '../services/haptics';

export const Voicebox = ({ onAddMultipleItems }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedItems, setParsedItems] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const resultsRef = useRef(null);

  const startVoice = () => {
    triggerHaptic('medium');
    setErrorMsg('');
    setParsedItems([]);
    setTranscript('');
    transcriptRef.current = '';
    setIsModalOpen(false);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg('Il tuo browser non supporta il riconoscimento vocale. Su iPhone usa Safari, su Android usa Chrome.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'it-IT';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setErrorMsg('');
      };

      recognition.onresult = (event) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setTranscript(currentText);
        transcriptRef.current = currentText;

        if (event.results[event.results.length - 1]?.isFinal) {
          handleProcessVoice(currentText);
        }
      };

      recognition.onerror = (event) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg('Permesso microfono negato. Vai nelle impostazioni del telefono e consenti il microfono.');
        } else if (event.error === 'no-speech') {
          setErrorMsg('Nessuna voce rilevata. Prova a parlare vicino al microfono.');
        } else {
          setErrorMsg(`Errore microfono: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        if (transcriptRef.current && transcriptRef.current.trim()) {
          handleProcessVoice(transcriptRef.current);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Errore avvio microfono:', err);
      setErrorMsg('Errore di avvio microfono: ' + (err.message || 'Controlla i permessi'));
      setIsRecording(false);
    }
  };

  const stopVoice = () => {
    triggerHaptic('light');
    setIsRecording(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (transcriptRef.current && transcriptRef.current.trim()) {
      handleProcessVoice(transcriptRef.current);
    }
  };

  const handleProcessVoice = async (text) => {
    if (!text || !text.trim()) return;
    triggerHaptic('success');
    
    const items = parseVoiceInputWithAI(text);
    if (items && items.length > 0) {
      setParsedItems(items);
      setIsModalOpen(true);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);

      try {
        const withImages = await Promise.all(items.map(async (it) => ({
          ...it,
          image: await getProductImage(it.name)
        })));

        setParsedItems(prev => {
          if (!prev || prev.length === 0) return withImages;
          return prev.map(p => {
            const found = withImages.find(w => w.name.toLowerCase() === p.name.toLowerCase());
            return found?.image ? { ...p, image: found.image } : p;
          });
        });
      } catch (e) {
        console.warn('Errore fetch immagini:', e);
      }
    }
  };

  const handleUpdateItem = (index, field, value) => {
    setParsedItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveItem = (index) => {
    triggerHaptic('light');
    setParsedItems(prev => {
      const updated = prev.filter((_, idx) => idx !== index);
      if (updated.length === 0) {
        setIsModalOpen(false);
      }
      return updated;
    });
  };

  const handleAddNewItem = () => {
    triggerHaptic('light');
    setParsedItems(prev => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        name: '',
        quantity: '1',
        category: 'altro',
        priority: 'media',
        supermarket: 'Tutti',
        notes: ''
      }
    ]);
  };

  const handleConfirmAll = () => {
    const validItems = parsedItems.filter(i => i.name && i.name.trim());
    if (validItems.length === 0) return;

    triggerHaptic('success');
    if (onAddMultipleItems) {
      onAddMultipleItems(validItems);
    }
    setParsedItems([]);
    setTranscript('');
    transcriptRef.current = '';
    setIsModalOpen(false);
  };

  const testPhrases = [
    "Mi mancano 2 litri di latte, 1 kg di mele e 3 pacchi di pasta Barilla",
    "Compra pane, uova, birra e detersivo per i piatti urgentemente",
    "Caffè macinato, 6 bottiglie d'acqua e parmigiano da Esselunga"
  ];

  // Riquadro Prodotti Grande & Ad Alta Visibilità (Riutilizzato inline o nel modal)
  const renderConfirmationContent = (isInsideModal = false) => (
    <div>
      {/* Box Trascrizione Vocale Grande e Ben Leggibile */}
      {transcript && (
        <div style={{
          marginBottom: '1.25rem',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '2px solid rgba(16, 185, 129, 0.45)',
          padding: '1rem 1.25rem',
          borderRadius: '16px',
          textAlign: 'left'
        }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
            🎙️ Cosa hai detto:
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.4 }}>
            "{transcript}"
          </div>
        </div>
      )}

      {/* Lista Articoli Riconosciuti con Dimensioni Grandi */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
        {parsedItems.map((item, idx) => (
          <div 
            key={item.id || idx}
            style={{
              background: 'var(--bg-surface)',
              border: '2px solid var(--border-color)',
              borderRadius: '18px',
              padding: '1.15rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            {/* Riga Superiore: Foto (54px) + Nome Prodotto Grande + Cestino (44px) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1.5px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.65rem',
                flexShrink: 0
              }}>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <span>{CATEGORIES[item.category]?.icon || '🛒'}</span>
                )}
              </div>

              {/* Nome Prodotto Input Grande */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Prodotto #{idx + 1}
                </label>
                <input
                  type="text"
                  className="quick-add-input"
                  value={item.name}
                  onChange={e => handleUpdateItem(idx, 'name', e.target.value)}
                  placeholder="Nome articolo..."
                  style={{
                    padding: '0.8rem 1rem',
                    fontWeight: 700,
                    fontSize: '1.18rem',
                    minHeight: '52px',
                    color: 'var(--text-main)',
                    backgroundColor: 'var(--bg-main)',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border-color)'
                  }}
                />
              </div>

              {/* Cestino grande e comodo */}
              <button
                type="button"
                className="btn btn-icon"
                onClick={() => handleRemoveItem(idx)}
                title="Rimuovi questo articolo"
                style={{ width: 44, height: 44, color: '#ef4444', borderRadius: '12px', flexShrink: 0 }}
              >
                <Trash2 size={20} />
              </button>
            </div>

            {/* Riga Inferiore: Quantità (50%) + Reparto (50%) con Input Grandi */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: '0.65rem', width: '100%' }}>
              {/* Quantità */}
              <div style={{ minWidth: 0 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Quantità
                </label>
                <input
                  type="text"
                  className="quick-add-input"
                  value={item.quantity}
                  onChange={e => handleUpdateItem(idx, 'quantity', e.target.value)}
                  placeholder="Es. 1 pz, 2 kg..."
                  style={{
                    padding: '0.75rem 0.95rem',
                    fontWeight: 700,
                    fontSize: '1.12rem',
                    minHeight: '48px',
                    color: 'var(--text-main)',
                    backgroundColor: 'var(--bg-main)',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border-color)'
                  }}
                />
              </div>

              {/* Reparto */}
              <div style={{ minWidth: 0 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Reparto
                </label>
                <select
                  className="quick-add-input"
                  value={item.category}
                  onChange={e => handleUpdateItem(idx, 'category', e.target.value)}
                  style={{
                    padding: '0.75rem 0.95rem',
                    fontWeight: 700,
                    fontSize: '1.08rem',
                    minHeight: '48px',
                    color: 'var(--text-main)',
                    backgroundColor: 'var(--bg-main)',
                    borderRadius: '12px',
                    border: '1.5px solid var(--border-color)'
                  }}
                >
                  {Object.values(CATEGORIES).map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tasto Aggiungi Altro Articolo */}
      <div style={{ marginBottom: '1.35rem' }}>
        <button
          type="button"
          className="preset-chip"
          onClick={handleAddNewItem}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.92rem', padding: '0.6rem 1.15rem', fontWeight: 700 }}
        >
          <Plus size={18} /> + Aggiungi un altro articolo
        </button>
      </div>

      {/* Azioni Finali Grandi per Smartphone */}
      <div style={{ display: 'flex', gap: '0.85rem' }}>
        <button
          type="button"
          className="btn btn-primary"
          style={{
            flex: 2,
            padding: '1.1rem 1.25rem',
            fontSize: '1.12rem',
            fontWeight: 800,
            minHeight: '58px',
            boxShadow: '0 6px 22px rgba(16, 185, 129, 0.45)',
            letterSpacing: '-0.01em'
          }}
          onClick={handleConfirmAll}
        >
          <Check size={24} strokeWidth={2.8} /> Conferma ({parsedItems.length} {parsedItems.length === 1 ? 'Articolo' : 'Articoli'})
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          style={{ flex: 1, padding: '1.1rem 1rem', fontSize: '0.98rem', fontWeight: 600, minHeight: '58px' }}
          onClick={() => {
            triggerHaptic('light');
            setParsedItems([]);
            setTranscript('');
            transcriptRef.current = '';
            setIsModalOpen(false);
          }}
          title="Annulla"
        >
          <RotateCcw size={18} /> Annulla
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.25rem', border: '1.5px solid rgba(16, 185, 129, 0.35)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '9px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
              <Volume2 size={18} />
            </div>
            <span style={{ whiteSpace: 'nowrap' }}>Voicebox Vocale</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '0.25rem 0.65rem', borderRadius: '99px', fontWeight: 700, flexShrink: 0 }}>
            <Bot size={14} /> Multi-Articolo
          </div>
        </div>

        {/* Pulsante Microfono Grande */}
        <div style={{ textAlign: 'center', padding: '0.85rem 0' }}>
          <button
            type="button"
            onClick={isRecording ? stopVoice : startVoice}
            style={{
              width: '92px',
              height: '92px',
              borderRadius: '50%',
              border: isRecording ? '4px solid #ef4444' : '3.5px solid var(--primary)',
              background: isRecording ? '#ef4444' : 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.45))',
              color: isRecording ? 'white' : 'var(--text-main)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: isRecording ? '0 0 38px rgba(239, 68, 68, 0.75)' : '0 8px 28px rgba(16, 185, 129, 0.3)',
              transition: 'all 0.15s ease',
              outline: 'none',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation'
            }}
            title={isRecording ? "Tocca per fermare" : "Tocca e detta tutta la spesa"}
          >
            {isRecording ? <MicOff size={40} /> : <Mic size={40} color="var(--primary)" />}
          </button>

          <p style={{ marginTop: '0.9rem', fontSize: '0.98rem', color: isRecording ? '#ef4444' : 'var(--text-secondary)', fontWeight: 700, padding: '0 0.5rem' }}>
            {isRecording ? "🔴 In ascolto... Elenca tutto quello che ti manca!" : "Tocca e detta più cose (es. 'Latte, uova e mele')"}
          </p>

          {/* Trascrizione in evidenza */}
          {transcript && !isModalOpen && (
            <div style={{
              marginTop: '0.85rem',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1.5px solid rgba(16, 185, 129, 0.4)',
              padding: '0.85rem 1.15rem',
              borderRadius: '14px',
              display: 'inline-block',
              maxWidth: '96%',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                🎙️ Trascrizione Rilevata:
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.35 }}>
                "{transcript}"
              </div>
            </div>
          )}

          {/* Tasto per riaprire il riquadro se ci sono articoli */}
          {parsedItems.length > 0 && !isModalOpen && (
            <div style={{ marginTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsModalOpen(true)}
                style={{ padding: '0.85rem 1.5rem', fontSize: '1.05rem', fontWeight: 800 }}
              >
                <ListPlus size={20} /> Mostra Riquadro di Conferma ({parsedItems.length})
              </button>
            </div>
          )}

          {/* Fallback se non ha rilevato segmenti ma c'è trascrizione */}
          {transcript && !isRecording && parsedItems.length === 0 && (
            <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Non ho separato i prodotti in automatico. Vuoi inserire ciò che hai detto?
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  const fallbackItem = {
                    id: `custom-${Date.now()}`,
                    name: transcript.charAt(0).toUpperCase() + transcript.slice(1),
                    quantity: '1',
                    category: 'altro',
                    priority: 'media',
                    supermarket: 'Tutti',
                    notes: ''
                  };
                  setParsedItems([fallbackItem]);
                  setIsModalOpen(true);
                }}
                style={{ padding: '0.65rem 1.15rem', fontSize: '0.92rem', fontWeight: 700 }}
              >
                <Plus size={18} /> Inserisci "{transcript}"
              </button>
            </div>
          )}

          {errorMsg && (
            <div style={{ marginTop: '0.75rem', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem 1rem', borderRadius: '12px', color: '#f87171', fontSize: '0.85rem', textAlign: 'left', maxWidth: '95%', margin: '0.75rem auto 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                <AlertCircle size={16} /> Attenzione
              </div>
              {errorMsg}
            </div>
          )}
        </div>

        {/* RIQUADRO INLINE (visibile se non è aperto il modal) */}
        {parsedItems.length > 0 && !isModalOpen && (
          <div ref={resultsRef} style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '2px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ListPlus size={22} color="var(--primary)" /> Riquadro Articoli ({parsedItems.length})
              </h3>
              <button
                type="button"
                className="preset-chip"
                onClick={() => setIsModalOpen(true)}
                style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
              >
                Apri a schermo intero ↗
              </button>
            </div>
            {renderConfirmationContent(false)}
          </div>
        )}

        {/* Simulator buttons con frasi multi-prodotto */}
        <div style={{ marginTop: '0.95rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Prova rapida:</span>
          {testPhrases.map((phrase, idx) => (
            <button
              key={idx}
              type="button"
              className="preset-chip"
              style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
              onClick={() => {
                triggerHaptic('light');
                setTranscript(phrase);
                transcriptRef.current = phrase;
                handleProcessVoice(phrase);
              }}
            >
              "{phrase.split(' ').slice(0, 3).join(' ')}..."
            </button>
          ))}
        </div>
      </div>

      {/* DEDICATED FULL-SIZE CONFIRMATION MODAL (RIQUADRO GRANDE E BEN LEGGIBILE) */}
      {isModalOpen && parsedItems.length > 0 && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-card"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '580px',
              width: '100%',
              maxHeight: '94vh',
              overflowY: 'auto',
              border: '2.5px solid var(--primary)',
              boxShadow: '0 0 50px rgba(16, 185, 129, 0.4)',
              padding: '1.5rem 1.25rem',
              borderRadius: '24px'
            }}
          >
            {/* Header del Riquadro Grande */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ListPlus size={22} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.28rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>
                    Conferma Prodotti ({parsedItems.length})
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Verifica o modifica prima di aggiungere
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-icon"
                onClick={() => setIsModalOpen(false)}
                title="Chiudi riquadro"
                style={{ width: 40, height: 40, borderRadius: '12px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenuto Grande & Spazioso */}
            {renderConfirmationContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
