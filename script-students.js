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
 * QuizApp v3 - Pracovní JavaScript pro studenty (Studentská verze)
 * Úkoly: Přepínání obrazovek (showScreen), řízení stavů (startGame, endGame),
 * vyhodnocení výsledků a životní cyklus aplikace
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Pomocné matematické funkce (Úkol TODO 1)
// ------------------------------------------------------------------------------

/**
 * Generuje náhodné celé číslo v intervalu [min, max] včetně obou mezí.
 * (Ponecháno plně funkční z Fáze 2)
 */
function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Náhodně promíchá kopii pole pomocí Fisher-Yates shuffle algoritmu.
 * (Ponecháno plně funkční z Fáze 2)
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
 * @returns {number} Procento úspěšnosti (0-100).
 */
function calculateAccuracy(correct, total) {
    // TODO 1: Spočti úspěšnost v procentech a zaokrouhli výsledek pomocí Math.round().
    // Pokud je total === 0, vrať 0, aby nedošlo k dělení nulou.
    // NÁPOVĚDA: Math.round((correct / total) * 100)
    // PŘÍKLAD:
    // if (total === 0) return 0;
    // return Math.round((correct / total) * 100);

    // ZDE NAPIŠ SVŮJ KÓD PRO TODO 1:
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
}

// ------------------------------------------------------------------------------
// 2. Zásobník otázek (Ponecháno funkční)
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
// 3. OOP Třída Question (Ponechána funkční)
// ------------------------------------------------------------------------------
class Question {
    constructor(text, options, correctIndex) {
        this.text = text;
        this.options = options;
        this.correctIndex = correctIndex;
    }

    static createShuffled(rawQuestion) {
        const originalCorrectText = rawQuestion.options[rawQuestion.correctIndex];
        const shuffledOptions = shuffle(rawQuestion.options);
        const newCorrectIndex = shuffledOptions.indexOf(originalCorrectText);
        return new Question(rawQuestion.text, shuffledOptions, newCorrectIndex);
    }

    displayQuestion(currentRound, totalQuestions) {
        const badgeEl = document.querySelector('#question-badge');
        const textEl = document.querySelector('#question-text');
        const roundIndicatorEl = document.querySelector('#round-indicator');

        if (badgeEl) badgeEl.textContent = `Otázka ${currentRound}`;
        if (roundIndicatorEl) roundIndicatorEl.textContent = `${currentRound} / ${totalQuestions}`;
        if (textEl) textEl.textContent = this.text;

        const answerButtons = document.querySelectorAll('.answer-btn');
        answerButtons.forEach((button, index) => {
            const optionTextEl = button.querySelector('.option-text');
            if (optionTextEl && this.options[index] !== undefined) {
                optionTextEl.textContent = this.options[index];
            }
            button.classList.remove('correct', 'wrong', 'disabled');
        });

        const gridEl = document.querySelector('#answers-grid');
        if (gridEl) gridEl.classList.remove('disabled');
    }

    isCorrect(selectedIndex) {
        return selectedIndex === this.correctIndex;
    }
}

// ------------------------------------------------------------------------------
// 4. Globální konfigurace a Herní stav
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
// 5. Architektura přepínání obrazovek (Studentský úkol TODO 2)
// ------------------------------------------------------------------------------

/**
 * Zobrazí požadovanou obrazovku podle ID a skryje všechny ostatní.
 * @param {string} screenId - ID sekce obrazovky ('start-screen', 'quiz-screen', 'end-screen').
 */
function showScreen(screenId) {
    // TODO 2: Přepni viditelnost obrazovek v DOMu.
    // 1. Najdi všechny elementy s třídou '.screen' (document.querySelectorAll('.screen')).
    // 2. Projdi je cyklem forEach a každému přidej třídu 'hidden' a odeber třídu 'active'.
    // 3. Najdi cílový element podle ID (document.getElementById(screenId)).
    // 4. Pokud cílový element existuje, odeber mu třídu 'hidden' a přidej třídu 'active'.
    //
    // NÁPOVĚDA:
    // const screens = document.querySelectorAll('.screen');
    // screens.forEach(screen => {
    //     screen.classList.add('hidden');
    //     screen.classList.remove('active');
    // });
    // const targetScreen = document.getElementById(screenId);
    // if (targetScreen) {
    //     targetScreen.classList.remove('hidden');
    //     targetScreen.classList.add('active');
    // }

    // ZDE NAPIŠ SVŮJ KÓD PRO TODO 2:
    const screens = document.querySelectorAll('.screen');
    screens.forEach((screen) => {
        screen.classList.add('hidden');
        screen.classList.remove('active');
    });

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        targetScreen.classList.add('active');
    }
}

// ------------------------------------------------------------------------------
// 6. Řízení životního cyklu hry (Studentské úkoly TODO 3 a TODO 4)
// ------------------------------------------------------------------------------

/**
 * Inicializuje výchozí stav aplikace. (Ponecháno funkční)
 */
function initGame() {
    stopTimer();
    showScreen('start-screen');
}

/**
 * Spustí novou herní relaci kvízu.
 */
function startGame() {
    stopTimer();

    // TODO 3: Připrav herní stav a přepni na kvízovou obrazovku.
    // 1. Vynuluj state.currentRound = 0, state.correctAnswers = 0, state.answeredCount = 0.
    // 2. Připrav frontu otázek: state.questionsQueue = shuffle(QUESTIONS_POOL).slice(0, QUESTIONS_PER_GAME);
    // 3. Nastav state.totalQuestions = state.questionsQueue.length;
    // 4. Přepni obrazovku pomocí showScreen('quiz-screen');
    // 5. Aktualizuj statistiky zavoláním updateStatsUI();
    // 6. Načti první otázku zavoláním loadNextQuestion();
    //
    // PŘÍKLAD:
    // state.currentRound = 0;
    // state.correctAnswers = 0;
    // state.answeredCount = 0;
    // state.questionsQueue = shuffle(QUESTIONS_POOL).slice(0, QUESTIONS_PER_GAME);
    // state.totalQuestions = state.questionsQueue.length;
    // showScreen('quiz-screen');
    // updateStatsUI();
    // loadNextQuestion();

    // ZDE NAPIŠ SVŮJ KÓD PRO TODO 3:
    state.currentRound = 0;
    state.correctAnswers = 0;
    state.answeredCount = 0;
    state.isProcessingAnswer = false;
    state.questionsQueue = shuffle(QUESTIONS_POOL).slice(0, QUESTIONS_PER_GAME);
    state.totalQuestions = state.questionsQueue.length;

    showScreen('quiz-screen');
    updateStatsUI();
    loadNextQuestion();
}

/**
 * Ukončí kvíz, spočítá finální výsledky a zobrazí výsledkovou obrazovku.
 */
function endGame() {
    stopTimer();

    // TODO 4: Spočti finální výsledky a zobraz výsledkovou obrazovku.
    // 1. Spočti úspěšnost v % pomocí calculateAccuracy(state.correctAnswers, state.totalQuestions);
    // 2. Vlož výsledky do textContent prvků '#final-score' a '#final-accuracy'.
    // 3. Podle úspěšnosti nastav text '#final-message' (např. >= 80% super, >= 50% dobré, méně zkus znovu).
    // 4. Přepni na výsledkovou obrazovku pomocí showScreen('end-screen');

    // ZDE NAPIŠ SVŮJ KÓD PRO TODO 4:
    const accuracy = calculateAccuracy(state.correctAnswers, state.totalQuestions);
    const finalScoreEl = document.querySelector('#final-score');
    const finalAccuracyEl = document.querySelector('#final-accuracy');
    const finalMessageEl = document.querySelector('#final-message');
    const finalIconEl = document.querySelector('#final-icon');

    if (finalScoreEl) finalScoreEl.textContent = `${state.correctAnswers} / ${state.totalQuestions}`;
    if (finalAccuracyEl) finalAccuracyEl.textContent = `${accuracy}%`;

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

    showScreen('end-screen');
}

// ------------------------------------------------------------------------------
// 7. Řízení časovače a Statistik (Ponecháno funkční)
// ------------------------------------------------------------------------------
function updateStatsUI() {
    const scoreEl = document.querySelector('#score');
    const accuracyEl = document.querySelector('#accuracy');
    const roundIndicatorEl = document.querySelector('#round-indicator');

    if (scoreEl) scoreEl.textContent = `${state.correctAnswers}`;
    if (roundIndicatorEl) roundIndicatorEl.textContent = `${state.currentRound || 1} / ${state.totalQuestions}`;
    if (accuracyEl) {
        const accuracy = calculateAccuracy(state.correctAnswers, state.answeredCount);
        accuracyEl.textContent = `${accuracy}%`;
    }
}

function updateTimerUI() {
    const timerSecondsEl = document.querySelector('#timer-seconds');
    const timerDisplayEl = document.querySelector('#timer-display');
    const progressBarEl = document.querySelector('#timer-progress-bar');

    if (timerSecondsEl) timerSecondsEl.textContent = state.timeLeft;

    if (progressBarEl) {
        const percentage = (state.timeLeft / TIME_LIMIT_SECONDS) * 100;
        progressBarEl.style.width = `${percentage}%`;
    }

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

function stopTimer() {
    if (state.timerId !== null) {
        clearInterval(state.timerId);
        state.timerId = null;
    }
}

// ------------------------------------------------------------------------------
// 8. Herní logika otázek (Studentský úkol TODO 5)
// ------------------------------------------------------------------------------

/**
 * Načte další otázku z fronty nebo ukončí hru.
 */
function loadNextQuestion() {
    // TODO 5: Zkontroluj, zda už nebyly odehrány všechny otázky.
    // Pokud je state.currentRound >= state.totalQuestions, zavolej endGame() a ukonči funkci pomocí return.
    // NÁPOVĚDA:
    // if (state.currentRound >= state.totalQuestions) {
    //     endGame();
    //     return;
    // }

    // ZDE NAPIŠ SVŮJ KÓD PRO TODO 5:
    if (state.currentRound >= state.totalQuestions) {
        endGame();
        return;
    }

    state.isProcessingAnswer = false;
    state.currentRound++;

    const rawQuestion = state.questionsQueue[state.currentRound - 1];
    state.currentQuestion = Question.createShuffled(rawQuestion);
    state.currentQuestion.displayQuestion(state.currentRound, state.totalQuestions);
    updateStatsUI();

    startTimer();
}

function handleAnswerSelection(selectedIndex, buttonEl) {
    if (state.isProcessingAnswer || !state.currentQuestion) return;

    state.isProcessingAnswer = true;
    stopTimer();

    const gridEl = document.querySelector('#answers-grid');
    if (gridEl) gridEl.classList.add('disabled');

    const isCorrect = state.currentQuestion.isCorrect(selectedIndex);
    state.answeredCount++;

    if (isCorrect) {
        state.correctAnswers++;
        buttonEl.classList.add('correct');
    } else {
        buttonEl.classList.add('wrong');
        const answerButtons = document.querySelectorAll('.answer-btn');
        const correctBtn = answerButtons[state.currentQuestion.correctIndex];
        if (correctBtn) correctBtn.classList.add('correct');
    }

    updateStatsUI();

    setTimeout(() => {
        loadNextQuestion();
    }, TRANSITION_DELAY_MS);
}

function handleTimeout() {
    if (state.isProcessingAnswer || !state.currentQuestion) return;

    state.isProcessingAnswer = true;

    const gridEl = document.querySelector('#answers-grid');
    if (gridEl) gridEl.classList.add('disabled');

    state.answeredCount++;

    const answerButtons = document.querySelectorAll('.answer-btn');
    const correctBtn = answerButtons[state.currentQuestion.correctIndex];
    if (correctBtn) correctBtn.classList.add('correct');

    updateStatsUI();

    setTimeout(() => {
        loadNextQuestion();
    }, TRANSITION_DELAY_MS);
}

// ------------------------------------------------------------------------------
// 9. Inicializace aplikace (Ponecháno funkční)
// ------------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    console.log('📝 QuizApp v3 spuštěna ve studentském režimu. Doplňte TODO úkoly.');

    const startBtn = document.querySelector('#start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            startGame();
        });
    }

    const restartBtn = document.querySelector('#restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            startGame();
        });
    }

    const answerButtons = document.querySelectorAll('.answer-btn');
    answerButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const clickedIndex = parseInt(button.dataset.index, 10);
            handleAnswerSelection(clickedIndex, button);
        });
    });

    initGame();
});
