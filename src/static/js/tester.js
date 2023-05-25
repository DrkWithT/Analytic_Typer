/**
 * @file tester.js
 * @description Implements the type tester classes which model its state and actions.
 * @author Derek Tan
 */

const WRONG_LETTER_COLOR = '#f1692b';
const CORRECT_LETTER_COLOR = '#8bda84';
const KEY_COOLDOWN = 40;  // ms delay until accepting next letter

class WordSequence {
    /** @type {HTMLUListElement} */
    #element;

    /** @type {HTMLSpanElement[]} */
    #letterElements;

    /** @type {string} @description The raw, original text data. */
    #originalText;

    /** @type {string} @description The user's typed text for the test. */
    #userText;

    /** @type {RegExp} */
    #wordRGX;

    /** @type {number} */
    #length;

    /** @type {number} */
    #position;

    /** @type {number} */
    #colorPosition;

    /**
     * @constructor
     * @param {HTMLUListElement} pageElement 
     * @param {string} rawText 
     */
    constructor (pageElement = null, rawText = null) {
        if (!pageElement || !rawText) throw Error('tester.js: HTML and text required!');

        this.#element = pageElement;
        this.#letterElements = [];
        this.#originalText = rawText;
        this.#userText = '';
        this.#wordRGX = new RegExp('\w|\ |.');
        this.#length = this.#originalText.length;
        this.#position = 0;
        this.#colorPosition = 0;

        this.#loadWordElements();
    }

    #loadWordElements() {
        // @note Fill in letterElement reference array, as I need to track corresponding letters to color based on type correctness.
        let index = 0;
        let tempWordLI = document.createElement('li');
        tempWordLI.className = 'word';

        for (index; index <= this.#length; index++) {
            const letterChar = this.#originalText[index] || null;

            if (!letterChar || letterChar === ' ') {
                // add word container to DOM...
                this.#element.appendChild(tempWordLI);

                // reset word container to a new one to add...
                tempWordLI = document.createElement('li');
                tempWordLI.className = 'word';
                continue;
            }

            let newLetterSpan = document.createElement('span');
            newLetterSpan.className = 'letter';
            newLetterSpan.innerText = letterChar;

            // add reference to colorable letter element!
            this.#letterElements.push(newLetterSpan);

            tempWordLI.appendChild(newLetterSpan);
        }
    }

    reset() {
        // Remove words with their letters from HTML DOM...
        const wordElementCount = this.#element.childElementCount;
        for (var i = 0; i < wordElementCount; i++) this.#element.lastChild.remove();

        this.#letterElements = [];
        this.#userText = '';
        this.#position = 0;
        this.#colorPosition = 0;

        this.#loadWordElements();
    }

    atEnd() {
        return this.#position > this.#length - 1;
    }

    /**
     * @param {string} keyValue 1 letter string.
     * @returns {boolean} If the key char was accepted.
     */
    #eatLetter(keyValue) {
        if (this.atEnd()) return false;
        
        if (!this.#wordRGX.test(keyValue)) {
            this.#userText += '\u00A0'; // use NBSP for invalid letter placeholder!
        } else {
            this.#userText += keyValue; // add normal letters
        }

        return true;
    }

    /**
     * @param {string} keyValue 1 letter string.
     * @returns {boolean} If the update worked (the letter sequence is not finished).
     */
    updateCurrentLetter(keyValue) {
        if (!this.#eatLetter(keyValue))
           return false;
        
        const letterData = this.#originalText[this.#position];
        let letterDOM = null;

        // NOTE: spaces have no special span elements, so we avoid trying those references!
        if (letterData !== ' ') letterDOM = this.#letterElements[this.#colorPosition];

        if (letterDOM !== null) {
            if (letterData !== keyValue) {
                letterDOM.style.color = WRONG_LETTER_COLOR;  // Colorize wrong letters as reddish-orange!
            } else {
                letterDOM.style.color = CORRECT_LETTER_COLOR;  // Colorize correct, non-space letters as green!
            }
            
            this.#colorPosition++;
        }

        this.#position++;

        return true;
    }

    getResultData() {
        return {
            original: this.#originalText,
            user: this.#userText
        };
    }
}

class TypeTester {
    /** @type {boolean} */
    #isRunning;

    /** @type {boolean} */
    #keyCooldown;

    /** @type {TestTimer} */
    #timerObject;

    /** @type {WordSequence} */
    #wordStorage;

    /**
     * @param {HTMLElement} pageBodyDOM The test's UI HTML body.
     * @param {string} rawText The test's text to type.
     * @param {number} initialTime The test timer's initially set time.
     * @param {(time: number) => void} runHandler Callback invoked for updating timer html.
     * @param {(aborted: boolean) => void} endHandler Callback invoked on test end or quit.
     */
    constructor (pageBodyDOM=null, rawText = null, initialTime = 30, runHandler, endHandler) {
        if (!pageBodyDOM || !rawText || !initialTime) throw Error('tester.js: Missing HTML page body or typer text.');

        this.#isRunning = false;
        this.#keyCooldown = true;

        const wordUList = pageBodyDOM.querySelector('ul#text-display');

        this.#wordStorage = new WordSequence(wordUList, rawText);
        this.#timerObject = new TestTimer(initialTime, runHandler, endHandler);
    }

    isDone() { return this.#wordStorage.atEnd(); }

    isRunning() { return this.#isRunning; }

    /**
     * @param {number} mode Determines what components in `TypeTester` will be reset.
     * @param {number} newTime The seconds to reset the timer to. 
     */
    reset(mode, newTime) {
        if (!this.isRunning()) return;

        if (mode === 1) {
            // full reset including word data (for typer test abortions!)
            this.#isRunning = false;
            this.#keyCooldown = true;
            this.#wordStorage.reset();
            this.#timerObject.reset(newTime);
        } else if (mode === 2) {
            // partial reset (for early typer test completion)
            this.#isRunning = false;
            this.#keyCooldown = true;
            this.#timerObject.reset(newTime);
        }
    }

    start() {
        if (this.#isRunning) return;

        this.#isRunning = true;
        this.#keyCooldown = false;
        this.#timerObject.start();
    }

    /**
     * @description Processes user's key input for the test. Is key-hold-down spam resistant.
     * @param {string} keyValue 1 letter string.
     * @returns {void}
     */
    takeInput(keyValue) {
        if (!this.#isRunning) return;
        
        if (this.#keyCooldown) return;

        if (!this.#keyCooldown) {
            this.#keyCooldown = true;

            setTimeout(() => {
                this.#keyCooldown = false;  // 50 ms key cooldown should be ok for now...
            }, KEY_COOLDOWN);

            this.#isRunning = this.#wordStorage.updateCurrentLetter(keyValue);
        }
    }

    fetchDataAsJSON() {
        let result = null;

        try {
            result = JSON.stringify(this.#wordStorage.getResultData());
        } catch (error) {
            console.error(`JSON stringify error: ${error}`);
            result = '{}';
        }

        return result;
    }
}
