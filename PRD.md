# Product Requirements Document (PRD) - FishBowl (Draft)

## 1. Inleiding

Dit document beschrijft de functionele eisen voor "FishBowl", een webapplicatie game over het kweken en verkopen van vissen. Het doel is om een winstgevende kwekerij te runnen door vissen te verzorgen, te laten voortplanten en te investeren in betere apparatuur.

## 2. Kernmechanieken

### 2.1 Vissen

Elke vis is een uniek object met specifieke eigenschappen.

- **Fysieke Eigenschappen:**
  - **Kleur, Grootte, Vorm:** Bepalen de visuele weergave en zeldzaamheid.
  - **Genetica:** Nakomelingen erven eigenschappen van ouders (mix of dominant/recessief). Kans op mutaties (speciale vissen).
- **Levenscyclus:**
  - **Jong (Fry):** Kwetsbaar, verstopt zich, eet moeilijk. Groeit snel als er voedsel is.
  - **Volwassen:** Vruchtbaar, volledige grootte, verkoopbaar.
  - **Oud:** Vruchtbaarheid neemt af, gezondheid gaat sneller achteruit, minder waard.
  - **Dood:** Als gezondheid 0 bereikt. Wordt automatisch verwijderd (om watervervuiling te voorkomen).
- **Gedrag & Behoeften:**
  - **Voeding:** Honger-meter. Te weinig eten = gezondheid omlaag. Te veel eten = vervuiling.
  - **Stress:** Beïnvloed door omgeving (weinig planten, slechte waterkwaliteit). Hoge stress = geen voortplanting, vatbaar voor ziekte.
  - **Schoolgedrag:** Sommige vissen hebben soortgenoten nodig voor geluk/gezondheid.

### 2.2 Omgeving (Het Aquarium)

De speler kan **meerdere tanks** beheren. Elke tank heeft zijn eigen ecosysteem.

- **Waterkwaliteit (Vervuiling):**
  - **Oorzaken:** Totale **biomassa** van vissen (grote vissen vervuilen meer), uitwerpselen, niet-opgegeten voedsel.
  - **Gevolgen:** Hoge vervuiling = gezondheid omlaag, stress, ziektes.
  - **Oplossingen:**
    - **Filter:** Verwijdert continu een bepaalde hoeveelheid vervuiling per minuut. Moet af en toe gereinigd worden.
    - **Water verversen:** Directe verlaging van vervuiling. Kost geld (water) en tijd. **Tijdens verversen kan er niet gevoerd worden.**
    - **Planten:** Helpen passief vervuiling (nitraten) te verlagen.
- **Zuurstof:**
  - **Verbruik:** Vissen verbruiken zuurstof op basis van grootte.
  - **Toevoer:** Oppervlakte-agitatie, Zuurstofpomp, Planten.
  - **Mechaniek:** Zuurstoftekort -> Gezondheid daalt snel.

### 2.3 Planten & Decoratie

- **Planten:** Levende organismen in de tank.
  - **Functies:**
    - Verlagen stress (schuilplekken voor jongen en schuwe vissen).
    - Verhogen voortplantingskans (afzetplek voor eitjes).
    - Passieve vermindering van vervuiling.
  - **Onderhoud:** Kunnen doodgaan bij slechte waterkwaliteit of opgegeten worden door herbivoren.
- **Decoratie:** Visueel, maar kan ook dienen als schuilplek.

### 2.4 Ziekte & Gezondheid

- **Ziekte:** Ontstaat bij langdurige stress of slechte waterkwaliteit.
  - **Voorbeelden:** Witte Stip (Ich), Schimmel.
  - **Gevolg:** Gezondheid daalt continu, besmettelijk voor andere vissen in dezelfde tank.
- **Genezing:**
  - **Medicijnen:** Kopen in de winkel (bv. "General Cure", "Anti-Fungal"). Toevoegen aan water kost geld en kan tijdelijk stress geven.
  - **Quarantaine:** Zieke vissen isoleren in een aparte tank (indien beschikbaar).

### 2.5 Speler Interacties & Tijd

- **Tijd:** De game bevat een interne klok.
  - **Snelheid:** Standaard real-time, maar speler kan "Time Warp" of versnelling kopen/activeren om processen (groeien, kweken) te versnellen.
- **Acties:**
  - **Voeren:** Handmatig of via **Automatische Voeder** (mid-game upgrade).
  - **Schoonmaken:** Water verversen, filter reinigen.
  - **Winkel:** Kopen van vissen, tanks, apparatuur, medicijnen, planten.
  - **Verkoop:** Selecteren van vissen om te verkopen.

## 3. Economie

- **Valuta:** "AquaCredits".
- **Inkomsten:** Verkoop van vissen.
  - **Prijsformule:** Basiswaarde soort _ (Grootte factor) _ (Gezondheid %) \* (Leeftijdsfactor).
- **Uitgaven:**
  - Vissen, Planten, Decoratie.
  - Voer, Medicijnen, Water.
  - Apparatuur: Filters, Pompen, **Automatische Voeder**.
  - Uitbreiding: Nieuwe/Grotere Aquariums.

## 4. Voortplanting

- **Automatisch:** Vindt plaats wanneer:
  1.  Man en Vrouw van dezelfde soort in dezelfde tank zitten.
  2.  Beiden volwassen en gezond zijn.
  3.  Stress laag is (voldoende planten/schuilplekken).
- **Resultaat:** Nieuwe jonge vissen (Fry) verschijnen.

## 5. Future Scope (Versie 2)

- **Temperatuur:** Verwarmingselementen en specifieke temperatuureisen per vissoort.
- **Complexe Genetica:** Uitgebreide stambomen en recessieve genen.

## 6. Volgende Stappen

1.  Definiëren van de MVP (Minimum Viable Product) scope.
2.  Technische stack bevestigen (React/Vue/Vanilla JS?).
