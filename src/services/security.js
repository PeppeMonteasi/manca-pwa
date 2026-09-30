/**
 * Servizio di Sicurezza & Whitelist Email
 * Verifica che solo l'email specificata in VITE_ALLOWED_EMAIL possa accedere
 */

export const ALLOWED_EMAIL_ENV = (import.meta.env.VITE_ALLOWED_EMAIL || '').trim().toLowerCase();

// Verifica se l'email fa parte della whitelist autorizzata
export function isUserAuthorized(email) {
  if (!ALLOWED_EMAIL_ENV) {
    const localAllowed = (localStorage.getItem('manca_allowed_email') || '').trim().toLowerCase();
    if (!localAllowed) return true; // Se nessuna whitelist è configurata, consenti
    return email && email.toLowerCase() === localAllowed;
  }
  return email && email.toLowerCase() === ALLOWED_EMAIL_ENV;
}
