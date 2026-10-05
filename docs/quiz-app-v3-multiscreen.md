# QuizApp v3: Víceobrazovková Architektura a Redesign

## 1. Cíl aplikace a fáze vývoje
Tato verze představuje **3. fázi (architektonické rozšíření a nový vizuální design)**. 

Cílem je přetvořit jednonástěnkovou aplikaci na plnohodnotný produkt s kompletním uživatelským průchodem (User Flow) skrze 3 samostatné obrazovky. Zároveň se architektura CSS upraví pomocí CSS proměnných tak, aby bylo možné aplikaci snadno přestylovat (redesignovat) podle specifikací v grafickém editoru (Figma) nebo brandbooku klienta.

---

## 2. Pohled uživatele (User Experience)
1. **Úvodní obrazovka (Start Screen):** Uživatel je přivítán grafikou, názevem kvízu, krátkým návodem a tlačítkem "Spustit kvíz".
2. **Kvízová obrazovka (Quiz Screen):** Po kliknutí na start úvodní obrazovka zmizí a zobrazí se herní rozhraní s otázkou, časovačem a statistikami. Uživatel odpovídá na sérii otázek.
3. **Závěrečná obrazovka (End Screen):** Po odehrání stanoveného počtu otázek kvízová obrazovka zmizí a zobrazí se výsledková obrazovka s celkovým hodnocením, finálním skóre v procentech a tlačítkem "Hraj znovu".
4. **Restart:** Kliknutí na "Hraj znovu" resetuje stav hry a vrátí uživatele zpět na Start nebo rovnou do nového kvízu.

---

## 3. Architektura a souborová struktura

```text
quiz-app-v3-multiscreen/
├── index.html            # HTML5 se 3 samostatnými sekcemi obrazovek
├── style.css             # CSS s vymezenými CSS proměnnými (:root) a styly obrazovek
├── styles-students.css   # Pracovní verze CSS s instrukcemi k CSS proměnným
├── script.js             # JS logika se správou stavů a přepínáním obrazovek
├── script-students.js    # Pracovní verze JS s nápovědou k přepínání obrazovek
└── README.md             # Dokumentace, architektura obrazovek a UML diagram
```

---

## 4. Detailní specifikace komponent a technologií

### A. HTML5 (Struktura více obrazovek)
* **Koncepce 3 hlavních kontejnerů:**
  * `<section id="start-screen" class="screen active">`: Úvodní obrazovka s uvítáním a tlačítkem `#start-btn`.
  * `<section id="quiz-screen" class="screen hidden">`: Obrazovka kvízu (otázka, časovač, odpovědi, průběžné skóre).
  * `<section id="end-screen" class="screen hidden">`: Výsledková obrazovka s finálním vyhodnocením a tlačítkem `#restart-btn`.

### B. CSS3 (CSS Proměnné a řízení viditelnosti)
* **CSS Proměnné (Custom Properties):**
  * Definice globálních tématických proměnných v `:root`:
    ```css
    :root {
      --bg-color: #f4f7f6;
      --card-bg: #ffffff;
      --primary-color: #4a90e2;
      --accent-color: #50e3c2;
      --text-color: #333333;
      --font-family: 'Poppins', sans-serif;
      --border-radius: 12px;
    }
    ```
* **Pravidla viditelnosti obrazovek:**
  * Trída `.screen.hidden { display: none !important; }`
  * Třída `.screen.active { display: flex; flex-direction: column; align-items: center; }`
* **Redesign podle Figmy:**
  * Snadná změna celkového vizuálu aplikace pouhou úpravou hodnot v bloku `:root`.

### C. JavaScript ES6+ (Správa stavů a User Flow)
* **Funkce pro přepínání obrazovek:**
  * Pomocná funkce `showScreen(screenId)`:
    1. Skryje všechny prvky s třídou `.screen` (přidáním `.hidden` / odebráním `.active`).
    2. Zobrazí požadovanou obrazovku podle id (odebráním `.hidden` / přidáním `.active`).
* **Řízení životního cyklu hry:**
  * `initGame()`: Nastavení výchozího stavu, zobrazení `start-screen`.
  * `startGame()`: Vynulování skóre, reset časovače, zobrazení `quiz-screen` a načtení 1. otázky.
  * `endGame()`: Zastavení časovače, výpočet finálních statistik, zápis dat do `end-screen` a jeho zobrazení.

---

## 5. Akceptační kritéria pro vývojáře
- [ ] HTML obsahuje 3 jasně oddělené sekce obrazovek (`#start-screen`, `#quiz-screen`, `#end-screen`).
- [ ] V CSS jsou použity CSS proměnné (`:root`) pro barvy, písma a zaoblení.
- [ ] V daný moment je na stránce viditelná vždy právě jedna obrazovka.
- [ ] Kliknutí na "Spustit kvíz" převede uživatele ze startovní obrazovky do kvízu.
- [ ] Po dokončení série otázek aplikace automaticky přepne na závěrečnou obrazovku s výsledky.
- [ ] Tlačítko "Hraj znovu" na výsledkové obrazovce správně resetuje hru a spustí ji od začátku.
