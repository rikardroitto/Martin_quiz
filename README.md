# Doktor Landgren Quiz

Ett realtids-quiz med WebSocket-stöd för festbruk, där alla spelare svarar samtidigt via sina mobiler.

## Funktioner

- **QR-kod anslutning**: Spelare scannar QR-kod för att ansluta direkt
- **Realtids-kommunikation**: WebSockets för snabb synkronisering
- **Kollektiv poängräkning**: Majoritetsröstning avgör om gruppen får +1 eller -1 poäng
- **Progressiv bildavslöjning**: En 3x3 grid avslöjar bilden bit för bit
- **Statistik**: Visa hur många som svarade vad efter varje fråga
- **15 sekunders timer**: Automatisk tidsbegränsning per fråga

## Installation

1. Klona repot:
```bash
git clone <repo-url>
cd Martin_quiz
```

2. Installera dependencies:
```bash
npm install
```

3. Skapa `quizfragor.json` enligt formatet i `QUIZFRAGOR_FORMAT.md`

4. (Valfritt) Ersätt `public/images/landgren.jpg` med den riktiga bilden

## Användning

### Starta servern

```bash
npm start
```

Servern startar på `http://localhost:3000`

### Admin-gränssnitt

1. Öppna `http://localhost:3000/admin.html` i din webbläsare
2. QR-koden visas automatiskt för spelarna att scanna
3. Tryck på "Starta Quiz" när alla anslutit
4. Tryck på "Nästa Fråga" för att visa varje fråga
5. Efter 15 sekunder eller när alla svarat avslutas frågan automatiskt
6. Läs förklaringen och tryck "Nästa Fråga" igen

### Spelar-gränssnitt

1. Öppna `http://localhost:3000` eller scanna QR-koden
2. Vänta på att admin startar quizet
3. Svara på frågorna genom att trycka på ett av alternativen
4. Se statistik och poängförändring efter varje fråga
5. Bilden avslöjas gradvis allteftersom poängen ökar

## Spelregler

- **Poängräkning**: När majoriteten (>50%) svarar rätt får gruppen +1 poäng
- **Fel svar**: Om majoriteten svarar fel får gruppen -1 poäng (men aldrig lägre än 0)
- **Mål**: Nå 9 poäng för att vinna
- **Vinst**: När 9 poäng uppnås visas hela bilden med texten "Skål för Doktor Landgren!"

## Filstruktur

```
Martin_quiz/
├── server.js                 # WebSocket server
├── package.json              # Dependencies
├── quizfragor.json          # Quiz data (skapas av dig)
├── QUIZFRAGOR_FORMAT.md     # Format-guide för quiz-frågor
├── README.md                # Denna fil
└── public/
    ├── index.html           # Spelar-interface
    ├── admin.html           # Admin-interface
    ├── player.js            # Spelar-logik
    ├── admin.js             # Admin-logik
    ├── styles.css           # All styling
    └── images/
        └── landgren.jpg     # Bilden som avslöjas (ersätt med riktig bild)
```

## Teknisk info

- **Backend**: Node.js med Express och Socket.io
- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Realtid**: Socket.io för WebSocket-kommunikation
- **QR-kod**: QRCode.js för generering

## Deployment

För att köra på en server synlig på lokalt nätverk:

```bash
# I server.js, ändra PORT om önskat
PORT=3000 npm start
```

Hitta din lokala IP-adress:
```bash
# Linux/Mac
ifconfig

# Windows
ipconfig
```

Spelarnas URL blir då: `http://[DIN-IP]:3000`

## Nästa steg

1. Skapa din `quizfragor.json` enligt `QUIZFRAGOR_FORMAT.md`
2. Ersätt placeholder-bilden med en riktig bild på Martin Landgren
3. Testa appen lokalt
4. Deploya till en server eller kör på lokalt nätverk för festen!

## Licens

MIT
