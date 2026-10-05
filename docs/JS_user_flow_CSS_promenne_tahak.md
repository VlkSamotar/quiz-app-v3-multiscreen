# Tahák: Architektura více obrazovek & CSS Proměnné

Tento přehled slouží jako rychlá referenční příručka pro řízení stavu aplikace, přepínání obrazovek v JavaScriptu a nastavení čistého design systému pomocí CSS proměnných.

---

## 1. JavaScript: Správa stavu aplikace (User Flow)

Při tvorbě webových aplikací nebo her bez použití komplexních frameworků řídíme uživatelský průchod (User Flow) přepínáním viditelnosti jednotlivých sekcí (obrazovek).

### Logika průchodu aplikací

Běžný životní cyklus jednoduché aplikace nebo hry má 3 hlavní stavové obrazovky:

$$\text{Úvodní obrazovka (Start)} \longrightarrow \text{Herní / Hlavní obrazovka} \longrightarrow \text{Závěrečná obrazovka (Game Over / Výsledky)}$$

---

### Způsoby přepínání obrazovek

#### Způsob A: Řízení zobrazení přes třídy (Doporučeno)

Nejčistší přístup. JavaScript pouze přepíná třídy na DOM prvcích, CSS řeší samotný vzhled a skrytí.

```html
<!-- HTML Struktura -->
<section id="screen-start" class="screen">...</section>
<section id="screen-game" class="screen hidden">...</section>
<section id="screen-end" class="screen hidden">...</section>

```

```css
/* CSS */
.screen {
  display: flex;
  flex-direction: column;
}

.screen.hidden {
  display: none !important;
}

```

```javascript
// JS: Helper funkce pro přepínání
function showScreen(screenId) {
  // Skryje všechny obrazovky
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden');
  });

  // Zobrazí požadovanou obrazovku
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
  }
}

// Použití v logice aplikace:
// 1. Po načtení / kliknutí na Start
showScreen('screen-game');

// 2. Po skončení hry
showScreen('screen-end');

```

#### Způsob B: Řízení přes inline styly (`element.style.display`)

Rychlý způsob pro menší skripty, vnáší však CSS pravidla přímo do HTML prvků.

```javascript
const startScreen = document.getElementById('screen-start');
const gameScreen = document.getElementById('screen-game');

// Skrytí startovní a zobrazení herní obrazovky
startScreen.style.display = 'none';
gameScreen.style.display = 'flex'; // nebo 'block'

```

> **Porovnání:** Přístup přes `.classList` udržuje styly v CSS a umožňuje snadnější přidání přechodových animací (např. fade-in/fade-out).

---

## 2. CSS3: Design systémy & Témata

Custom Properties (CSS proměnné) umožňují centralizovat hodnoty vzhledu na jedno místo, což usnadňuje údržbu a škálovatelnost.

### Definice a použití CSS proměnných

```css
/* Definice globálních proměnných v kořeni dokumentu */
:root {
  /* Barevná paleta */
  --primary-color: #ff5722;
  --secondary-color: #2196f3;
  --bg-color: #f5f5f5;
  --text-color: #212121;

  /* Typografie */
  --font-main: 'Inter', system-ui, sans-serif;
  --font-size-base: 1rem;     /* 16px */
  --font-size-title: 2.25rem; /* 36px */

  /* Layout & Mezery */
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 32px;
  --radius-sm: 4px;
  --radius-lg: 12px;
}

/* Použití proměnných */
body {
  background-color: var(--bg-color);
  color: var(--text-color);
  font-family: var(--font-main);
  padding: var(--spacing-md);
}

.button-primary {
  background-color: var(--primary-color);
  border-radius: var(--radius-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  color: #ffffff;
}

```

---

### Převod návrhu z Figmy do CSS

Při přenosu vizuálního designu z Figmy postupujeme systémově:

#### 1. Extrakce barevných kódů

* V panelu **Design** ve Figmě získej barevné kódování (HEX `#FF5722`, RGB `rgb(255, 87, 34)` nebo HSL).
* Ulož je do `:root` jako sémantické proměnné (např. `--color-primary`, `--color-bg-dark`).

#### 2. Definice typografické škály

* Převeď velikosti písem, výšku řádku (`line-height`) a váhu (`font-weight`).
* Pro responzivitu se doporučuje převádět pixely z Figmy na jednotky `rem` (při základu $1\text{rem} = 16\text{px}$ propočítáš jako $\frac{\text{hodnota v px}}{16}$).

#### 3. Nastavení mezer a zaoblení

* Odpozoruj opakující se hodnoty pro `margin`, `padding` a `border-radius`.
* Zaveď konzistentní mřížkovou škálu (např. násobky 4px / 8px: `8px`, `16px`, `24px`, `32px`).

---

### Praktická ukázka: Figma tokeny vs. CSS kód

| Prvek ve Figmě | Extrahovaná hodnota | Název CSS proměnné |
| --- | --- | --- |
| **Primary Brand** | `#FF5722` | `--primary-color` |
| **Main Background** | `#121212` | `--bg-dark` |
| **Card Radius** | `12px` | `--radius-lg` |
| **H1 Heading** | `32px / Bold` | `--font-h1: bold 2rem/1.2 var(--font-main)` |
| **Gap / Padding** | `16px` | `--spacing-md` |