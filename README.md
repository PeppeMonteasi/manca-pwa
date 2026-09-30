# 🛒 Manca! - Smart Shopping List & Missing Items (PWA)

Una **Progressive Web App (PWA)** moderna, privata e installabile su qualsiasi dispositivo (**PC, iPhone/iPad, Android e Tablet**), progettata per gestire facilmente le cose che mancano a casa e la lista della spesa.

Include **Single Sign-On (Google SSO)** con **Whitelist Personale**, sincronizzazione in tempo reale su **Cloud Firestore**, e un **Voicebox con Intelligenza Artificiale Open-Source** che gira direttamente nel browser a **costo zero** (senza API esterne a pagamento o token).

---

## ✨ Funzionalità Principali

- 🎙️ **Voicebox con AI Semantica Open-Source (Zero Costi & Privacy Totale)**: 
  - Riconoscimento ed estrazione semantica in tempo reale direttamente nel client.
  - **Dettatura Multi-Articolo**: Detta più prodotti in una sola frase (es. *"Mi mancano 2 litri di latte, 1 kg di mele e pasta Barilla urgentemente"*), l'AI separa automaticamente gli elementi e crea righe distinte.
  - Estrazione automatica di: **Nome prodotto**, **Quantità**, **Reparto**, **Priorità (🚨 Urgente)**, **Supermercato di preferenza** e **Note/Marca**.
- ➕ **Incremento Smart Quantità & Riattivazione Automatica**:
  - Se un articolo è già presente nella lista attiva, ne incrementa la quantità (`+1` o `+n`) sommando le unità di misura.
  - Se un articolo era stato spuntato/comprato in passato, viene **riattivato automaticamente** nella lista della spesa con la nuova quantità richiesta.
- 🖼️ **Miniature e Foto dei Prodotti Automatiche**:
  - Assegnazione dinamica delle immagini reali dei prodotti tramite Open Food Facts e libreria curata ad alta risoluzione.
- 📱 **Mobile First & PWA Standalone**:
  - Layout ottimizzato per iPhone e Android (gestione notch, safe areas, prevenzione auto-zoom).
  - Feedback aptico (vibrazione tattile leggera) al tocco.
  - Tasto flottante rapido (FAB) per l'uso comodo con una sola mano.
  - Funzionamento offline garantito dal Service Worker.
- 🔒 **Accesso Esclusivo & Sicuro (Whitelist Personale)**:
  - Solo l'email Google autorizzata può accedere all'interfaccia.
  - Regole crittografiche Firestore: nessun dato accessibile da utenti non autorizzati.
- 🎨 **Design Glassmorphism Moderno**:
  - Tema Scuro & Chiaro, animazioni con coriandoli e condivisione formattata istantanea via WhatsApp o App di sistema.

---

## 🚀 Guida al Deploy Personale (Fai da Te)

Segui questi passaggi per pubblicare e utilizzare la tua istanza personale e gratuita di **Manca!**:

### Prerequisiti
- **Node.js** (versione 18 o superiore) installato sul computer.
- Un account Google gratuito.

---

### Passo 1: Clona il progetto e installa le dipendenze

```bash
git clone https://github.com/tuo-username/manca-pwa.git
cd manca-pwa
npm install
```

---

### Passo 2: Crea il tuo progetto su Firebase (Gratuito)

1. Vai su [console.firebase.google.com](https://console.firebase.google.com) e accedi con il tuo account Google.
2. Clicca su **Aggiungi progetto** e inserisci un nome a piacere (es. `manca-spesa-tua`).
3. Una volta creato il progetto:
   - **Abilita il Login Google**: Vai su *Authentication* > *Inizia* > scheda *Sign-in method* > seleziona **Google** > spunta **Abilita**, inserisci la tua email di supporto e clicca **Salva**.
   - **Abilita il Database Firestore**: Vai su *Firestore Database* > clicca **Crea database** > scegli la località (es. Europa `eur3`) > seleziona *Modalità di produzione* > clicca **Crea**.
   - **Registra l'App Web**: Dalla schermata principale del progetto, clicca sull'icona Web (`</>`), dai un nome all'app (es. *Manca Web*) e registra l'app. Ti verrà mostrato un blocco con `firebaseConfig`.

---

### Passo 3: Configura le variabili d'ambiente (`.env`)

Copia il file di esempio `.env.example` in un nuovo file chiamato `.env`:

```bash
cp .env.example .env
```

Apri il file `.env` con il tuo editor di testo e compila i campi con i dati della tua app Firebase e la **tua email autorizzata**:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=tuo-progetto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tuo-progetto
VITE_FIREBASE_STORAGE_BUCKET=tuo-progetto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Inserisci QUI l'unico indirizzo email Google che potrà accedere all'app:
VITE_ALLOWED_EMAIL=latuaemail@gmail.com
```

> [!IMPORTANT]
> Il file `.env` è già inserito nel `.gitignore`: **non verrà mai caricato su GitHub**, proteggendo le tue chiavi e la tua email privata.

---

### Passo 4: Avvia in Locale (Test)

Per verificare l'applicazione sul tuo computer prima del deploy:

```bash
npm run dev
```

Apri il browser su `http://localhost:3000`.

---

### Passo 5: Deploy su Firebase Hosting (Online Globale)

1. Accedi alla Firebase CLI (se non lo hai già fatto):
   ```bash
   npx firebase-tools login
   ```
2. Collega il tuo progetto Firebase locale:
   ```bash
   npx firebase-tools use --add
   ```
   (Seleziona il progetto appena creato su Firebase).
3. Compila il progetto e pubblica l'app e le regole di sicurezza Firestore:
   ```bash
   npm run build
   npx firebase-tools deploy
   ```

🎉 **Fatto!** Il terminale ti restituirà l'URL pubblico HTTPS (es. `https://tuo-progetto.web.app`) accessibile ovunque da PC, telefono e tablet.

---

## 📱 Come Installare l'App su Smartphone

1. Apri l'URL della tua app dal browser del telefono:
   - **Su iPhone/iPad (Safari)**: Tocca il tasto **Condividi** in basso e seleziona **"Aggiungi alla schermata Home"**.
   - **Su Android (Chrome)**: Tocca i 3 puntini in alto a destra e seleziona **"Installa applicazione"**.
2. L'app apparirà tra le icone del telefono, aprendosi a schermo intero senza barre del browser.

---

## 🛡️ Sicurezza & Architettura

- **Frontend Guard**: L'app verifica che l'account autenticato via Google coincida rigorosamente con `VITE_ALLOWED_EMAIL`. Chiunque altro riceve una schermata di blocco immediata.
- **Backend Rules (`firestore.rules`)**:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if false;
      }
      match /users/{userId}/items/{itemId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
  ```
  Le regole di Google Cloud Firestore impediscono a chiunque di accedere a documenti che non appartengono al proprio ID utente, proteggendo il database da accessi non autorizzati.

---

## 📜 Licenza

Rilasciato sotto licenza MIT. Libero di essere utilizzato, modificato e distribuito per uso personale.
