import React, { useState, useRef } from 'react';
import { Mic, MicOff, Sparkles, Check, RotateCcw, Volume2, Bot, AlertCircle, Trash2, Plus, ListPlus } from 'lucide-react';
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
  const transcriptRef = useRef('');
  const resultsRef = useRef(null);

  const startVoice = () => {
    triggerHaptic('medium');
    setErrorMsg('');
    setParsedItems([]);
    setTranscript('');
    transcriptRef.current = '';

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

        // Se il motore ha completato la frase
        if (event.results[event.results.length - 1]?.isFinal) {
          handleProcessVoice(currentText);
        }
      };

      recognition.onerror = (event) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg('Permesso microfono negato. Vai nelle impostazioni del browser sul telefono e consenti il microfono.');
        } else if (event.error === 'no-speech') {
          setErrorMsg('Nessuna voce rilevata. Prova a parlare vicino al microfono.');
        } else {
          setErrorMsg(`Errore microfono: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        // Assicurati che l'ultimo testo registrato venga sempre processato
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
      // 1. Mostra IMMEDIATAMENTE i prodotti a schermo con quantità e reparti!
      setParsedItems(items);

      // 2. Fai scorrere dolcemente la schermata sulla card di conferma per renderla 100% visibile su mobile
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);

      // 3. Arricchisci con le miniature in background senza bloccare la UI
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
    transcriptRef.current = '';
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

        {/* Trascrizione Vocale in Evidenza */}
        {transcript && (
          <div style={{
            marginTop: '0.75rem',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            padding: '0.7rem 1rem',
            borderRadius: 'var(--radius-md)',
            display: 'inline-block',
            maxWidth: '96%',
            textAlign: 'left'
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>
              🎙️ Trascrizione Rilevata:
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.35 }}>
              "{transcript}"
            </div>
          </div>
        )}

        {/* Fallback se non ha rilevato segmenti ma c'è trascrizione */}
        {transcript && !isRecording && parsedItems.length === 0 && (
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.45rem' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
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
              }}
              style={{ padding: '0.5rem 0.95rem', fontSize: '0.85rem', fontWeight: 700 }}
            >
              <Plus size={16} /> Aggiungi "{transcript}"
            </button>
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

      {/* MULTI-ITEM PARSED RESULTS CARD (100% Visibile & Chiara su Smartphone) */}
      {parsedItems.length > 0 && (
        <div 
          ref={resultsRef}
          style={{
            background: 'var(--bg-main)',
            borderRadius: 'var(--radius-md)',
            padding: '1.15rem 1rem',
            border: '2px solid var(--primary)',
            boxShadow: '0 0 25px rgba(16, 185, 129, 0.25)',
            marginTop: '1rem',
            animation: 'fadeIn 0.2s ease',
            textAlign: 'left'
          }}
        >
          {/* Header risultati */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.9rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--primary)', fontWeight: 800, fontSize: '0.98rem' }}>
              <ListPlus size={19} /> Riconosciuti {parsedItems.length} {parsedItems.length === 1 ? 'prodotto' : 'prodotti'}:
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Controlla prima di salvare 👇
            </span>
          </div>

          {/* Lista card per ogni articolo estratto */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.15rem' }}>
            {parsedItems.map((item, idx) => (
              <div key={item.id || idx} className="voice-item-card">
                {/* Riga 1: Miniatura Immagine + Nome Prodotto + Cestino */}
                <div className="voice-item-row-top">
                  {/* Miniatura Foto Prodotto */}
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: '10px',
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.35rem',
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

                  {/* Nome Prodotto */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', fontWeight: 700 }}>
                      Nome Prodotto #{idx + 1}
                    </label>
                    <input
                      type="text"
                      className="quick-add-input"
                      value={item.name}
                      onChange={e => handleUpdateItem(idx, 'name', e.target.value)}
                      placeholder="Nome articolo..."
                      style={{
                        padding: '0.6rem 0.75rem',
                        fontWeight: 700,
                        fontSize: '0.96rem',
                        color: 'var(--text-main)',
                        backgroundColor: 'var(--bg-surface)'
                      }}
                    />
                  </div>

                  {/* Tasto Rimuovi riga */}
                  <button
                    type="button"
                    className="btn btn-icon"
                    onClick={() => handleRemoveItem(idx)}
                    title="Rimuovi questo articolo"
                    style={{ width: 38, height: 38, color: '#ef4444', flexShrink: 0 }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Riga 2: Quantità e Reparto affiancati con larghezza ampia */}
                <div className="voice-item-row-bottom">
                  {/* Quantità */}
                  <div style={{ minWidth: 0 }}>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', fontWeight: 700 }}>
                      Quantità
                    </label>
                    <input
                      type="text"
                      className="quick-add-input"
                      value={item.quantity}
                      onChange={e => handleUpdateItem(idx, 'quantity', e.target.value)}
                      placeholder="Es. 1 pz, 2 kg..."
                      style={{
                        padding: '0.55rem 0.7rem',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        color: 'var(--text-main)',
                        backgroundColor: 'var(--bg-surface)'
                      }}
                    />
                  </div>

                  {/* Reparto */}
                  <div style={{ minWidth: 0 }}>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.2rem', fontWeight: 700 }}>
                      Reparto Supermercato
                    </label>
                    <select
                      className="quick-add-input"
                      value={item.category}
                      onChange={e => handleUpdateItem(idx, 'category', e.target.value)}
                      style={{
                        padding: '0.55rem 0.65rem',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        color: 'var(--text-main)',
                        backgroundColor: 'var(--bg-surface)'
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

          {/* Tasto Aggiungi Altro Articolo a mano */}
          <div style={{ marginBottom: '1.15rem' }}>
            <button
              type="button"
              className="preset-chip"
              onClick={handleAddNewItem}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
            >
              <Plus size={15} /> + Aggiungi un altro articolo
            </button>
          </div>

          {/* Azioni finali di inserimento */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{
                flex: 2,
                padding: '0.9rem 1rem',
                fontSize: '1rem',
                fontWeight: 800,
                boxShadow: '0 4px 18px rgba(16, 185, 129, 0.45)'
              }}
              onClick={handleConfirmAll}
            >
              <Check size={20} strokeWidth={2.5} /> Salva {parsedItems.length} {parsedItems.length === 1 ? 'Articolo' : 'Articoli'} nella Spesa
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1, padding: '0.9rem', fontSize: '0.88rem' }}
              onClick={() => {
                triggerHaptic('light');
                setParsedItems([]);
                setTranscript('');
                transcriptRef.current = '';
              }}
              title="Annulla"
            >
              <RotateCcw size={16} /> Annulla
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
              transcriptRef.current = phrase;
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
