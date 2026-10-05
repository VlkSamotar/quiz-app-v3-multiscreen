/*
    Copyright (C) 2026 Jakub Březa

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://gnu.org>.
*/

/**
 * ==============================================================================
 * QuizApp v3 - Produkční logika (Referenční řešení)
 * Témata: Architektura více obrazovek (showScreen), Řízení životního cyklu hry
 * (initGame, startGame, endGame), Náhodnost, Asynchronní časovače a Správa stavu
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Pomocné matematické funkce
// ------------------------------------------------------------------------------

/**
 * Generuje náhodné celé číslo v intervalu [min, max] včetně obou mezí.
 * @param {number} min - Minimální hodnota.
 * @param {number} max - Maximální hodnota.
 * @returns {number} Náhodné celé číslo.
 */
function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Náhodně promíchá kopii pole pomocí Fisher-Yates (Knuth) shuffle algoritmu.
 * Nemodifikuje původní pole (Pure Function).
 * @template T
 * @param {T[]} array - Vstupní pole.
 * @returns {T[]} Nové promíchané pole.
 */
function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

/**
 * Spočte úspěšnost v procentech zaokrouhlenou na celá čísla.
 * @param {number} correct - Počet správných odpovědí.
 * @param {number} total - Celkový počet otázek.
 * @returns {number} Procentuální úspěšnost (0-100).
 */
function calculateAccuracy(correct, total) {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
}

// ------------------------------------------------------------------------------
// 2. Zásobník otázek (Data Pool)
// ------------------------------------------------------------------------------
const QUESTIONS_POOL = [
    {
        text: 'Která CSS vlastnost slouží k aktivaci flexibilního boxového modelu?',
        options: ['display: flex;', 'position: absolute;', 'float: left;', 'grid-template: auto;'],
        correctIndex: 0
    },
    {
        text: 'Jaká JavaScriptová metoda zaokrouhlí číslo klasicky matematicky?',
        options: ['Math.round()', 'Math.floor()', 'Math.ceil()', 'Math.random()'],
        correctIndex: 0
    },
    {
        text: 'Která funkce slouží k opakovanému spouštění kódu v časovém intervalu?',
        options: ['setInterval()', 'setTimeout()', 'requestAnimationFrame()', 'delay()'],
        correctIndex: 0
    },
    {
        text: 'Jakým příkazem zastavíme běžící časovač vytvořený přes setInterval?',
        options: ['clearInterval(timerId)', 'stopTimer()', 'timer.cancel()', 'clearTimeout()'],
        correctIndex: 0
    },
    {
        text: 'Které klíčové slovo v CSS definuje vlastní animaci klíčových snímků?',
        options: ['@keyframes', '@animation', '@transitions', '@keyframes-rule'],
        correctIndex: 0
    },
    {
        text: 'Jakou vlastností v JS bezpečně nastavíme pouze textový obsah elementu?',
        options: ['element.textContent', 'element.innerHTML', 'element.outerHTML', 'element.value'],
        correctIndex: 0
    },
    {
        text: 'Jak v CSS správně odkážeme na definovanou CSS proměnnou?',
        options: ['var(--primary-color)', '$primary-color', 'val(--primary-color)', 'prop(primary-color)'],
        correctIndex: 0
    },
    {
        text: 'Kterou metodou objektu classList v JS přidáme elementu CSS třídu?',
        options: ['element.classList.add()', 'element.classList.set()', 'element.classList.push()', 'element.classList.append()'],
        correctIndex: 0
    }
];

// ------------------------------------------------------------------------------
// 3. OOP Třída Question
// ------------------------------------------------------------------------------

/**
 * Třída reprezentující jednu kvízovou otázku.
 * Zapouzdřuje data a chování pro zobrazení a validaci odpovědí.
 */
class Question {
    /**
     * @param {string} text - Text otázky.
     * @param {string[]} options - Pole možností odpovědí.
     * @param {number} correctIndex - Index správné odpovědi.
     */
    constructor(text, options, correctIndex) {
        this.text = text;
        this.options = options;
        this.correctIndex = correctIndex;
    }

    /**
     * Vytvoří novou instanci otázky s náhodně promíchaným pořadím odpovědí
     * a automaticky přepočítaným indexem správné odpovědi.
     * @param {object} rawQuestion - Surový objekt ze zásobníku.
     * @returns {Question} Nová instance se zamíchanými možnostmi.
     */
    static createShuffled(rawQuestion) {
        const originalCorrectText = rawQuestion.options[rawQuestion.correctIndex];
        const shuffledOptions = shuffle(rawQuestion.options);
        const newCorrectIndex = shuffledOptions.indexOf(originalCorrectText);
        return new Question(rawQuestion.text, shuffledOptions, newCorrectIndex);
    }

    /**
     * Vykreslí otázku a možnosti do HTML struktury.
     * @param {number} currentRound - Číslo aktuální otázky.
     * @param {number} totalQuestions - Celkový počet otázek v kvízu.
     */
    displayQuestion(currentRound, totalQuestions) {
        // 1. Aktualizace textu a odznáčků
        const badgeEl = document.querySelector('#question-badge');
        const textEl = document.querySelector('#question-text');
        const roundIndicatorEl = document.querySelector('#round-indicator');

        if (badgeEl) badgeEl.textContent = `Otázka ${currentRound}`;
        if (roundIndicatorEl) roundIndicatorEl.textContent = `${currentRound} / ${totalQuestions}`;
        if (textEl) textEl.textContent = this.text;

        // 2. Vložení textu do tlačítek odpovědí a reset stavů
        const answerButtons = document.querySelectorAll('.answer-btn');
        answerButtons.forEach((button, index) => {
            const optionTextEl = button.querySelector('.option-text');
            if (optionTextEl && this.options[index] !== undefined) {
                optionTextEl.textContent = this.options[index];
            }
            button.classList.remove('correct', 'wrong', 'disabled');
        });

        // 3. Odblokování klikání v mřížce
        const gridEl = document.querySelector('#answers-grid');
        if (gridEl) gridEl.classList.remove('disabled');
    }

    /**
     * Zkontroluje, zda zvolený index odpovídá správné odpovědi.
     * @param {number} selectedIndex - Index zvolené odpovědi (0-3).
     * @returns {boolean} True, pokud je volba správná.
     */
    isCorrect(selectedIndex) {
        return selectedIndex === this.correctIndex;
    }
}

// ------------------------------------------------------------------------------
// 4. Globální konfigurace a Herní stav (State Management)
// ------------------------------------------------------------------------------
const QUESTIONS_PER_GAME = 5;
const TIME_LIMIT_SECONDS = 10;
const TRANSITION_DELAY_MS = 1500;

const state = {
    currentRound: 0,
    totalQuestions: QUESTIONS_PER_GAME,
    correctAnswers: 0,
    answeredCount: 0,
    timeLeft: TIME_LIMIT_SECONDS,
    timerId: null,
    currentQuestion: null,
    isProcessingAnswer: false,
    questionsQueue: []
};

// ------------------------------------------------------------------------------
// 5. Architektura přepínání obrazovek (Screen Manager / User Flow)
// ------------------------------------------------------------------------------

/**
 * Zobrazí požadovanou obrazovku podle ID a skryje všechny ostatní.
 * @param {string} screenId - ID elementu obrazovky (např. 'start-screen', 'quiz-screen', 'end-screen').
 */
function showScreen(screenId) {
    // 1. Skryjeme všechny sekce obrazovek přidáním třídy .hidden a odebráním .active
    const screens = document.querySelectorAll('.screen');
    screens.forEach((screen) => {
        screen.classList.add('hidden');
        screen.classList.remove('active');
    });

    // 2. Zobrazíme cílovou obrazovku odebráním .hidden a přidáním .active
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        targetScreen.classList.add('active');
    }
}

// ------------------------------------------------------------------------------
// 6. Řízení životního cyklu hry (Game Lifecycle)
// ------------------------------------------------------------------------------

/**
 * Inicializuje výchozí stav aplikace při startu a zobrazí úvodní obrazovku.
 */
function initGame() {
    stopTimer();
    showScreen('start-screen');
}

/**
 * Spustí novou herní relaci kvízu.
 * Resetuje skóre, připraví frontu otázek a zobrazí kvízovou obrazovku.
 */
function startGame() {
    stopTimer();

    // 1. Reset herního stavu
    state.currentRound = 0;
    state.correctAnswers = 0;
    state.answeredCount = 0;
    state.isProcessingAnswer = false;

    // 2. Příprava náhodné fronty otázek pro tuto hru
    state.questionsQueue = shuffle(QUESTIONS_POOL).slice(0, QUESTIONS_PER_GAME);
    state.totalQuestions = state.questionsQueue.length;

    // 3. Přepnutí na kvízovou obrazovku
    showScreen('quiz-screen');
    updateStatsUI();

    // 4. Načtení první otázky
    loadNextQuestion();
}

/**
 * Ukončí kvíz, spočítá finální statistiky a zobrazí výsledkovou obrazovku.
 */
function endGame() {
    stopTimer();

    // 1. Výpočet výsledků
    const accuracy = calculateAccuracy(state.correctAnswers, state.totalQuestions);

    // 2. Aktualizace výsledkových DOM elementů
    const finalScoreEl = document.querySelector('#final-score');
    const finalAccuracyEl = document.querySelector('#final-accuracy');
    const finalMessageEl = document.querySelector('#final-message');
    const finalIconEl = document.querySelector('#final-icon');

    if (finalScoreEl) {
        finalScoreEl.textContent = `${state.correctAnswers} / ${state.totalQuestions}`;
    }

    if (finalAccuracyEl) {
        finalAccuracyEl.textContent = `${accuracy}%`;
    }

    // 3. Vizuální hodnocení na základě úspěšnosti
    if (finalMessageEl && finalIconEl) {
        if (accuracy >= 80) {
            finalIconEl.textContent = '🏆';
            finalMessageEl.textContent = 'Vynikající práce! Jsi opravdový mistr moderního webu.';
        } else if (accuracy >= 50) {
            finalIconEl.textContent = '👍';
            finalMessageEl.textContent = 'Dobrá práce! Máš solidní základy, zkus to dotáhnout na 100 %.';
        } else {
            finalIconEl.textContent = '💡';
            finalMessageEl.textContent = 'Nevadí, cvičení dělá mistra! Zkus kvíz znovu a překonej své skóre.';
        }
    }

    // 4. Přepnutí na výsledkovou obrazovku
    showScreen('end-screen');
}

// ------------------------------------------------------------------------------
// 7. Řízení časovače a Statistik (Asynchronní JS)
// ------------------------------------------------------------------------------

/**
 * Aktualizuje panel statistik v DOMu.
 */
function updateStatsUI() {
    const scoreEl = document.querySelector('#score');
    const accuracyEl = document.querySelector('#accuracy');
    const roundIndicatorEl = document.querySelector('#round-indicator');

    if (scoreEl) {
        scoreEl.textContent = `${state.correctAnswers}`;
    }
    if (roundIndicatorEl) {
        roundIndicatorEl.textContent = `${state.currentRound || 1} / ${state.totalQuestions}`;
    }
    if (accuracyEl) {
        const accuracy = calculateAccuracy(state.correctAnswers, state.answeredCount);
        accuracyEl.textContent = `${accuracy}%`;
    }
}

/**
 * Aktualizuje vizuální zobrazení zbývajícího času.
 */
function updateTimerUI() {
    const timerSecondsEl = document.querySelector('#timer-seconds');
    const timerDisplayEl = document.querySelector('#timer-display');
    const progressBarEl = document.querySelector('#timer-progress-bar');

    if (timerSecondsEl) {
        timerSecondsEl.textContent = state.timeLeft;
    }

    if (progressBarEl) {
        const percentage = (state.timeLeft / TIME_LIMIT_SECONDS) * 100;
        progressBarEl.style.width = `${percentage}%`;
    }

    // Vizuální výstraha při docházejícím čase
    if (timerDisplayEl && progressBarEl) {
        if (state.timeLeft <= 3) {
            timerDisplayEl.classList.add('danger');
            timerDisplayEl.classList.remove('warning');
            progressBarEl.classList.add('danger');
            progressBarEl.classList.remove('warning');
        } else if (state.timeLeft <= 5) {
            timerDisplayEl.classList.add('warning');
            timerDisplayEl.classList.remove('danger');
            progressBarEl.classList.add('warning');
            progressBarEl.classList.remove('danger');
        } else {
            timerDisplayEl.classList.remove('warning', 'danger');
            progressBarEl.classList.remove('warning', 'danger');
        }
    }
}

/**
 * Spustí odpočítávací časovač pro aktuální otázku.
 */
function startTimer() {
    stopTimer();
    state.timeLeft = TIME_LIMIT_SECONDS;
    updateTimerUI();

    state.timerId = setInterval(() => {
        state.timeLeft--;
        updateTimerUI();

        if (state.timeLeft <= 0) {
            stopTimer();
            handleTimeout();
        }
    }, 1000);
}

/**
 * Zastaví běžící odpočet.
 */
function stopTimer() {
    if (state.timerId !== null) {
        clearInterval(state.timerId);
        state.timerId = null;
    }
}

// ------------------------------------------------------------------------------
// 8. Herní logika otázek a obsluha odpovědí
// ------------------------------------------------------------------------------

/**
 * Načte další otázku z fronty nebo ukončí hru, pokud byly zodpovězeny všechny.
 */
function loadNextQuestion() {
    // 1. Kontrola, zda jsme nedosáhli limitu otázek pro tuto hru
    if (state.currentRound >= state.totalQuestions) {
        endGame();
        return;
    }

    state.isProcessingAnswer = false;
    state.currentRound++;

    // 2. Vyzvednutí připravené otázky z fronty
    const rawQuestion = state.questionsQueue[state.currentRound - 1];
    state.currentQuestion = Question.createShuffled(rawQuestion);

    // 3. Vykreslení otázky a aktualizace ukazatelů
    state.currentQuestion.displayQuestion(state.currentRound, state.totalQuestions);
    updateStatsUI();

    // 4. Spuštění odpočtu
    startTimer();
}

/**
 * Vyhodnotí odpověď uživatele po kliknutí na tlačítko možnosti.
 * @param {number} selectedIndex - Index kliknutého tlačítka.
 * @param {HTMLButtonElement} buttonEl - Element kliknutého tlačítka.
 */
function handleAnswerSelection(selectedIndex, buttonEl) {
    if (state.isProcessingAnswer || !state.currentQuestion) return;

    state.isProcessingAnswer = true;
    stopTimer();

    // 1. Deaktivace dalšího klikání během animace
    const gridEl = document.querySelector('#answers-grid');
    if (gridEl) gridEl.classList.add('disabled');

    // 2. Vyhodnocení správnosti
    const isCorrect = state.currentQuestion.isCorrect(selectedIndex);
    state.answeredCount++;

    if (isCorrect) {
        state.correctAnswers++;
        buttonEl.classList.add('correct');
        console.log(`%c✅ SPRÁVNĚ! (Otázka ${state.currentRound}/${state.totalQuestions})`, 'color: #22c55e; font-weight: bold;');
    } else {
        buttonEl.classList.add('wrong');
        const answerButtons = document.querySelectorAll('.answer-btn');
        const correctBtn = answerButtons[state.currentQuestion.correctIndex];
        if (correctBtn) correctBtn.classList.add('correct');
        console.log(`%c❌ CHYBA! (Otázka ${state.currentRound}/${state.totalQuestions})`, 'color: #ef4444; font-weight: bold;');
    }

    // 3. Aktualizace statistik
    updateStatsUI();

    // 4. Přechod na další otázku s prodlevou
    setTimeout(() => {
        loadNextQuestion();
    }, TRANSITION_DELAY_MS);
}

/**
 * Obsluha vypršení časového limitu bez reakce uživatele.
 */
function handleTimeout() {
    if (state.isProcessingAnswer || !state.currentQuestion) return;

    state.isProcessingAnswer = true;

    // 1. Zablokování tlačítek
    const gridEl = document.querySelector('#answers-grid');
    if (gridEl) gridEl.classList.add('disabled');

    // 2. Započítání odpovědi jako neúspěšné
    state.answeredCount++;
    console.log(`%c⏱️ ČAS VYPRŠEL! (Otázka ${state.currentRound}/${state.totalQuestions})`, 'color: #eab308; font-weight: bold;');

    // 3. Zvýraznění správné odpovědi
    const answerButtons = document.querySelectorAll('.answer-btn');
    const correctBtn = answerButtons[state.currentQuestion.correctIndex];
    if (correctBtn) correctBtn.classList.add('correct');

    // 4. Aktualizace statistik
    updateStatsUI();

    // 5. Přechod na další otázku
    setTimeout(() => {
        loadNextQuestion();
    }, TRANSITION_DELAY_MS);
}

// ------------------------------------------------------------------------------
// 9. Inicializace aplikace a Registrace událostí (DOM Ready)
// ------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 QuizApp v3 spuštěna v referenčním režimu (Více obrazovek & CSS Proměnné).');

    // 1. Tlačítko pro spuštění kvízu z úvodní obrazovky
    const startBtn = document.querySelector('#start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            startGame();
        });
    }

    // 2. Tlačítko pro restartování kvízu ze závěrečné obrazovky
    const restartBtn = document.querySelector('#restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            startGame();
        });
    }

    // 3. Registrace posluchačů událostí na tlačítka odpovědí
    const answerButtons = document.querySelectorAll('.answer-btn');
    answerButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const clickedIndex = parseInt(button.dataset.index, 10);
            handleAnswerSelection(clickedIndex, button);
        });
    });

    // 4. Nastavení výchozí úvodní obrazovky
    initGame();
});
