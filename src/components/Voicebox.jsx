import React, { useState, useRef } from 'react';
import { Mic, MicOff, Sparkles, Check, RotateCcw, Volume2, Bot, AlertCircle, Tag, Hash, Trash2, Plus, ListPlus } from 'lucide-react';
import { parseVoiceInputWithAI } from '../services/aiParser';
import { CATEGORIES } from '../context/ShoppingContext';
import { getProductImage } from '../services/imageService';
import { triggerHaptic } from '../services/haptics';

export const Voicebox = ({ onAddMultipleItems }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedItems, setParsedItems] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const recognitionRef = useRef(null);

  const startVoice = () => {
    triggerHaptic('medium');
    setErrorMsg('');
    setParsedItems([]);
    setTranscript('');

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

        if (event.results[0].isFinal || event.resultIndex === event.results.length - 1) {
          handleProcessVoice(currentText);
        }
      };

      recognition.onerror = (event) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg('Permesso microfono negato. Sul telefono vai in Impostazioni > Safari/Chrome e consenti il microfono.');
        } else if (event.error === 'no-speech') {
          setErrorMsg('Nessuna voce rilevata. Riprova parlando vicino al microfono.');
        } else {
          setErrorMsg(`Errore microfono: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Errore avvio microfono:', err);
      setErrorMsg('Errore di avvio: ' + (err.message || 'Controlla i permessi'));
      setIsRecording(false);
    }
  };

  const stopVoice = () => {
    triggerHaptic('light');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
  };

  const handleProcessVoice = async (text) => {
    if (!text || !text.trim()) return;
    triggerHaptic('success');
    const items = parseVoiceInputWithAI(text);
    if (items && items.length > 0) {
      setParsedItems(items);
      // Assegna foto in modo asincrono
      const withImages = await Promise.all(items.map(async (it) => ({
        ...it,
        image: await getProductImage(it.name)
      })));
      setParsedItems(withImages);
    }
  };

  // Modifica campo di un elemento specifico
  const handleUpdateItem = (index, field, value) => {
    setParsedItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Rimuovi singolo elemento dalla lista provvisoria
  const handleRemoveItem = (index) => {
    triggerHaptic('light');
    setParsedItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // Aggiungi elemento vuoto manualmente prima di salvare
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

  // Conferma e invia tutti gli elementi al database
  const handleConfirmAll = () => {
    const validItems = parsedItems.filter(i => i.name && i.name.trim());
    if (validItems.length === 0) return;

    triggerHaptic('success');
    if (onAddMultipleItems) {
      onAddMultipleItems(validItems);
    }
    setParsedItems([]);
    setTranscript('');
  };

  const testPhrases = [
    "Mi mancano 2 litri di latte, 1 kg di mele e 3 pacchi di pasta Barilla",
    "Compra pane, uova, birra e detersivo per i piatti urgentemente",
    "Caffè macinato, 6 bottiglie d'acqua e parmigiano da Esselunga"
  ];

  return (
    <div className="glass-panel" style={{ padding: '1.1rem 1.15rem', marginBottom: '1.25rem', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
          <div style={{ width: 28, height: 28, borderRadius: '8px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
            <Volume2 size={16} />
          </div>
          <span style={{ whiteSpace: 'nowrap' }}>Voicebox AI</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '0.2rem 0.55rem', borderRadius: '99px', fontWeight: 600, flexShrink: 0 }}>
          <Bot size={13} /> Multi-Articolo
        </div>
      </div>

      {/* Main Microphone Button */}
      <div style={{ textAlign: 'center', padding: '0.75rem 0' }}>
        <button
          type="button"
          onClick={isRecording ? stopVoice : startVoice}
          style={{
            width: '82px',
            height: '82px',
            borderRadius: '50%',
            border: isRecording ? '4px solid #ef4444' : '3px solid var(--primary)',
            background: isRecording ? '#ef4444' : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.4))',
            color: isRecording ? 'white' : 'var(--text-main)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: isRecording ? '0 0 35px rgba(239, 68, 68, 0.7)' : '0 8px 24px rgba(16, 185, 129, 0.25)',
            transition: 'all 0.15s ease',
            outline: 'none',
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'manipulation'
          }}
          title={isRecording ? "Tocca per fermare" : "Tocca e detta tutta la spesa"}
        >
          {isRecording ? <MicOff size={36} /> : <Mic size={36} color="var(--primary)" />}
        </button>

        <p style={{ marginTop: '0.75rem', fontSize: '0.88rem', color: isRecording ? '#ef4444' : 'var(--text-secondary)', fontWeight: 600, padding: '0 0.5rem' }}>
          {isRecording ? "🔴 In ascolto... Elenca le cose che ti mancano!" : "Tocca e detta più prodotti insieme (es. 'Latte, uova e mele')"}
        </p>

        {transcript && (
          <div style={{ marginTop: '0.65rem', background: 'var(--bg-surface)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'inline-block', maxWidth: '95%' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Hai detto: </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>"{transcript}"</span>
          </div>
        )}

        {errorMsg && (
          <div style={{ marginTop: '0.65rem', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.7rem 0.85rem', borderRadius: '12px', color: '#f87171', fontSize: '0.82rem', textAlign: 'left', maxWidth: '95%', margin: '0.65rem auto 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '0.2rem' }}>
              <AlertCircle size={15} /> Attenzione
            </div>
            {errorMsg}
          </div>
        )}
      </div>

      {/* MULTI-ITEM PARSED RESULTS CARD (Responsive & dinamica su mobile) */}
      {parsedItems.length > 0 && (
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          border: '1px solid var(--primary)',
          boxShadow: 'var(--shadow-glow)',
          marginTop: '0.85rem',
          animation: 'fadeIn 0.2s ease',
          textAlign: 'left'
        }}>
          {/* Header risultati */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.55rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.92rem' }}>
              <ListPlus size={17} /> Riconosciuti {parsedItems.length} {parsedItems.length === 1 ? 'articolo' : 'articoli'}:
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Modifica prima di salvare</span>
          </div>

          {/* Lista card per ogni articolo estratto */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1rem' }}>
            {parsedItems.map((item, idx) => (
              <div key={item.id || idx} className="voice-item-card">
                {/* Miniatura Foto Prodotto */}
                <div className="voice-item-img" style={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
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

                {/* Nome */}
                <div className="voice-item-name" style={{ minWidth: 0 }}>
                  <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.15rem', fontWeight: 600 }}>
                    Prodotto #{idx + 1}
                  </label>
                  <input
                    type="text"
                    className="quick-add-input"
                    value={item.name}
                    onChange={e => handleUpdateItem(idx, 'name', e.target.value)}
                    placeholder="Nome articolo..."
                    style={{ padding: '0.5rem 0.65rem' }}
                  />
                </div>

                {/* Tasto Rimuovi riga */}
                <div className="voice-item-del" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-icon"
                    onClick={() => handleRemoveItem(idx)}
                    title="Rimuovi questo articolo"
                    style={{ width: 34, height: 34, color: '#ef4444' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Quantità */}
                <div className="voice-item-qty" style={{ minWidth: 0 }}>
                  <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.15rem', fontWeight: 600 }}>
                    Quantità
                  </label>
                  <input
                    type="text"
                    className="quick-add-input"
                    value={item.quantity}
                    onChange={e => handleUpdateItem(idx, 'quantity', e.target.value)}
                    placeholder="1 pz, 2 kg..."
                    style={{ padding: '0.5rem 0.65rem' }}
                  />
                </div>

                {/* Reparto */}
                <div className="voice-item-cat" style={{ minWidth: 0 }}>
                  <label style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.15rem', fontWeight: 600 }}>
                    Reparto
                  </label>
                  <select
                    className="quick-add-input"
                    value={item.category}
                    onChange={e => handleUpdateItem(idx, 'category', e.target.value)}
                    style={{ padding: '0.5rem 0.55rem' }}
                  >
                    {Object.values(CATEGORIES).map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* Tasto Aggiungi Altro Articolo a mano */}
          <div style={{ marginBottom: '1rem' }}>
            <button
              type="button"
              className="preset-chip"
              onClick={handleAddNewItem}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              <Plus size={14} /> + Aggiungi un'altra riga
            </button>
          </div>

          {/* Azioni finali di inserimento */}
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 2, padding: '0.75rem', fontSize: '0.9rem', fontWeight: 700 }}
              onClick={handleConfirmAll}
            >
              <Check size={17} /> Salva nella Spesa
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.75rem', fontSize: '0.85rem' }}
              onClick={() => {
                triggerHaptic('light');
                setParsedItems([]);
              }}
              title="Annulla"
            >
              <RotateCcw size={15} /> Annulla
            </button>
          </div>
        </div>
      )}

      {/* Simulator buttons con frasi multi-prodotto */}
      <div style={{ marginTop: '0.75rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Prova rapida:</span>
        {testPhrases.map((phrase, idx) => (
          <button
            key={idx}
            type="button"
            className="preset-chip"
            style={{ fontSize: '0.74rem', padding: '0.2rem 0.5rem' }}
            onClick={() => {
              triggerHaptic('light');
              setTranscript(phrase);
              handleProcessVoice(phrase);
            }}
          >
            "{phrase.split(' ').slice(0, 3).join(' ')}..."
          </button>
        ))}
      </div>
    </div>
  );
};
