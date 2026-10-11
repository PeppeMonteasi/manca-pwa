import React, { useState } from 'react';
import { X, Plus, CreditCard, Tag, Sparkles, ChevronRight, Barcode, Gift } from 'lucide-react';
import { useCards } from '../../context/CardsContext';
import { AddCardModal } from './AddCardModal';
import { CardDetailModal } from './CardDetailModal';
import { triggerHaptic } from '../../services/haptics';

export const CardsDrawer = () => {
  const { cards, coupons, isDrawerOpen, setIsDrawerOpen, selectedCard, setSelectedCard, getCouponsForSupermarket } = useCards();
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);

  const activeCouponsCount = coupons.filter(c => !c.used).length;

  const handleCardClick = (card) => {
    triggerHaptic('medium');
    setSelectedCard(card);
  };

  const handleCloseDrawer = () => {
    triggerHaptic('light');
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* Backdrop scuro */}
      {isDrawerOpen && (
        <div 
          onClick={handleCloseDrawer}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 9998,
            animation: 'fadeIn 0.2s ease'
          }}
        />
      )}

      {/* Sportello Laterale Slide Drawer */}
      <aside 
        className="cards-drawer-aside"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '430px',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-color)',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          transform: isDrawerOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          paddingTop: 'calc(0.75rem + env(safe-area-inset-top))',
          paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))'
        }}
        aria-label="Sportello Carte Fedeltà"
      >
        {/* Header dello Sportello */}
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #059669 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <CreditCard size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                Sportello Carte
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {cards.length} {cards.length === 1 ? 'carta' : 'carte'} • {activeCouponsCount} {activeCouponsCount === 1 ? 'buono attivo' : 'buoni attivi'}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-icon"
            onClick={handleCloseDrawer}
            title="Chiudi sportello carte"
            style={{ width: 38, height: 38 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo dello Sportello con Lista Carte */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {/* Tasto Aggiungi Nuova Carta */}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              triggerHaptic('medium');
              setIsAddCardOpen(true);
            }}
            style={{
              padding: '0.95rem 1.2rem',
              fontSize: '1rem',
              fontWeight: 800,
              borderRadius: '16px',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <Plus size={20} strokeWidth={2.5} /> Aggiungi Nuova Carta
          </button>

          {/* Lista Cards Supermercato */}
          {cards.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              background: 'var(--bg-main)',
              borderRadius: '20px',
              border: '1px dashed var(--border-color)',
              color: 'var(--text-secondary)',
              marginTop: '1rem'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💳</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Nessuna carta registrata
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.4 }}>
                Aggiungi le tue tessere fedeltà (Esselunga, Coop, Conad, ecc.) per averle sempre con te e mostrare il codice a barre alla cassa!
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsAddCardOpen(true)}
              >
                <Plus size={16} /> Aggiungi la tua prima carta
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
              {cards.map((card) => {
                const cardCoupons = getCouponsForSupermarket(card.supermarket);
                const activeCoupons = cardCoupons.filter(c => !c.used);

                return (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(card)}
                    style={{
                      background: card.bg || card.color || 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                      borderRadius: '20px',
                      padding: '1.2rem 1.25rem',
                      color: '#ffffff',
                      cursor: 'pointer',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.28)',
                      transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '135px'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {/* Elemento grafico card sfumato di sfondo */}
                    <div style={{
                      position: 'absolute',
                      right: '-25px',
                      bottom: '-25px',
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.08)',
                      pointerEvents: 'none'
                    }} />

                    {/* Riga Superiore: Nome Supermercato + Badge Buoni */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', textShadow: '0 2px 4px rgba(0,0,0,0.25)' }}>
                          {card.supermarket}
                        </div>
                        <span style={{ fontSize: '0.72rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                          Tessera Fedeltà
                        </span>
                      </div>

                      {/* Badge Buoni se presenti */}
                      {activeCoupons.length > 0 && (
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.25)',
                          backdropFilter: 'blur(4px)',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '99px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                        }}>
                          <Gift size={13} /> {activeCoupons.length} {activeCoupons.length === 1 ? 'buono' : 'buoni'}
                        </div>
                      )}
                    </div>

                    {/* Riga Inferiore: Numero Carta e Icona Codice a barre */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '1.25rem' }}>
                      <div style={{ fontFamily: 'monospace', fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.1em', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                        {card.value ? (card.value.length > 14 ? `${card.value.slice(0, 12)}...` : card.value) : '•••• ••••'}
                      </div>

                      <div style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '10px',
                        padding: '0.35rem 0.6rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        <Barcode size={16} /> Mostra
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer dello Sportello */}
        <div style={{
          padding: '0.85rem 1.25rem',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-main)',
          fontSize: '0.76rem',
          color: 'var(--text-muted)',
          textAlign: 'center'
        }}>
          💡 Suggerimento: scorri verso destra per chiudere lo sportello
        </div>
      </aside>

      {/* Modal Aggiungi Carta */}
      <AddCardModal 
        isOpen={isAddCardOpen} 
        onClose={() => setIsAddCardOpen(false)} 
      />

      {/* Modal Dettaglio Carta Selezionata (Barcode + Buoni) */}
      <CardDetailModal 
        card={selectedCard} 
        isOpen={Boolean(selectedCard)} 
        onClose={() => setSelectedCard(null)} 
      />
    </>
  );
};
