# Quiz-frågor Format

Detta dokument beskriver JSON-formatet för quizfrågorna till Doktor Landgren-quizet.

## Format

Skapa en fil som heter `quizfragor.json` med följande struktur:

```json
{
  "title": "Quiz om Doktor Landgrens Avhandling",
  "author": "Martin Landgren",
  "totalPoints": 9,
  "questions": [
    {
      "id": 1,
      "question": "Vilken är avhandlingens huvudfrågeställning?",
      "alternatives": [
        "Alternativ A - beskrivning",
        "Alternativ B - beskrivning",
        "Alternativ C - beskrivning",
        "Alternativ D - beskrivning"
      ],
      "correctAnswer": 0,
      "explanation": "Kort förklaring av varför detta är rätt svar och vad frågan handlar om."
    },
    {
      "id": 2,
      "question": "Nästa fråga här...",
      "alternatives": [
        "Alternativ A",
        "Alternativ B",
        "Alternativ C",
        "Alternativ D"
      ],
      "correctAnswer": 2,
      "explanation": "Förklaring av svaret..."
    }
  ]
}
```

## Fältbeskrivning

### Rot-nivå
- **title** (string): Titeln på quizet
- **author** (string): Namn på doktoranden
- **totalPoints** (number): Totalt antal poäng för att vinna (vanligtvis 9)
- **questions** (array): Lista med alla quizfrågor

### Question-objekt
- **id** (number): Unikt ID för frågan (1, 2, 3, ...)
- **question** (string): Själva frågan som ska ställas
- **alternatives** (array av strings): Exakt 4 svarsalternativ
- **correctAnswer** (number): Index för rätt svar (0-3, där 0 = första alternativet)
- **explanation** (string): Förklaring som admin kan läsa upp efter frågan besvarats

## Exempel med flera frågor

```json
{
  "title": "Quiz om Doktor Landgrens Avhandling",
  "author": "Martin Landgren",
  "totalPoints": 9,
  "questions": [
    {
      "id": 1,
      "question": "Vilket ämnesområde behandlar avhandlingen?",
      "alternatives": [
        "Biologi och ekologi",
        "Fysik och astronomi",
        "Datavetenskap och AI",
        "Medicin och hälsa"
      ],
      "correctAnswer": 0,
      "explanation": "Avhandlingen handlar om biologiska processer i ekosystem."
    },
    {
      "id": 2,
      "question": "Hur många studier ingick i avhandlingen?",
      "alternatives": [
        "2 studier",
        "3 studier",
        "4 studier",
        "5 studier"
      ],
      "correctAnswer": 2,
      "explanation": "Avhandlingen baseras på fyra separata men sammanhängande studier."
    },
    {
      "id": 3,
      "question": "Vilken metod användes huvudsakligen?",
      "alternatives": [
        "Kvalitativ intervjustudie",
        "Kvantitativ surveyundersökning",
        "Experimentell laboratoriestudie",
        "Litteraturstudie och metaanalys"
      ],
      "correctAnswer": 1,
      "explanation": "Forskningen baserades främst på storskaliga enkätundersökningar."
    },
    {
      "id": 4,
      "question": "Vilket år påbörjades forskningsprojektet?",
      "alternatives": [
        "2018",
        "2019",
        "2020",
        "2021"
      ],
      "correctAnswer": 1,
      "explanation": "Projektet startade hösten 2019 och pågick i fem år."
    },
    {
      "id": 5,
      "question": "Vad är avhandlingens viktigaste bidrag?",
      "alternatives": [
        "En ny teoretisk modell",
        "Upptäckt av ny art",
        "Utveckling av ny mätmetod",
        "Policy-rekommendationer"
      ],
      "correctAnswer": 0,
      "explanation": "Avhandlingens största bidrag är den nya teoretiska ramverket."
    },
    {
      "id": 6,
      "question": "Hur många sidor är avhandlingen?",
      "alternatives": [
        "Ca 150 sidor",
        "Ca 200 sidor",
        "Ca 250 sidor",
        "Ca 300 sidor"
      ],
      "correctAnswer": 2,
      "explanation": "Den slutgiltiga avhandlingen blev cirka 250 sidor."
    },
    {
      "id": 7,
      "question": "Vid vilket universitet disputerades avhandlingen?",
      "alternatives": [
        "Uppsala universitet",
        "Lunds universitet",
        "Stockholms universitet",
        "Göteborgs universitet"
      ],
      "correctAnswer": 0,
      "explanation": "Martin Landgren disputerade vid Uppsala universitet."
    },
    {
      "id": 8,
      "question": "Vilken är avhandlingens praktiska tillämpning?",
      "alternatives": [
        "Förbättrad diagnostik",
        "Miljöskydd och hållbarhet",
        "Utbildningsmetoder",
        "Företagsledning"
      ],
      "correctAnswer": 1,
      "explanation": "Forskningen har viktiga implikationer för miljöarbete."
    },
    {
      "id": 9,
      "question": "Vem var huvudhandledare?",
      "alternatives": [
        "Professor Anna Andersson",
        "Professor Bengt Bengtsson",
        "Professor Carl Carlsson",
        "Professor Diana Danielsson"
      ],
      "correctAnswer": 0,
      "explanation": "Professor Anna Andersson var Martins huvudhandledare."
    },
    {
      "id": 10,
      "question": "Vilken slutsats drar avhandlingen?",
      "alternatives": [
        "Mer forskning behövs",
        "Hypotesen bekräftades helt",
        "Hypotesen förkastades",
        "Resultat var blandade men lovande"
      ],
      "correctAnswer": 3,
      "explanation": "Resultaten var komplexa men visar på lovande framtida forskningsriktningar."
    }
  ]
}
```

## Tips

- Skapa minst 10-15 frågor för ett komplett quiz
- Håll frågorna korta och koncisa för att passa 15-sekunders tidsgräns
- Gör alternativen ungefär lika långa för att inte ge bort svaret
- Explanations används av admin för att prata om svaret innan nästa fråga
- correctAnswer använder 0-indexering: 0 = första alternativet, 1 = andra, osv.

## Ladda upp filen

När du skapat `quizfragor.json`, lägg den i repositoryt i roten eller i en `data/`-mapp.
