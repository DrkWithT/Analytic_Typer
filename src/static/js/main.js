/**
 * @file main.js
 * @brief Driver code for the type tester and reporting AJAX.
 * @author Derek Tan
 */

const AUTHOR = 'https://github.com/DrkWithT';

((doc) => {
    const DEFAULT_TIME = 30; // countdown of 30s

    /** @type {HTMLSpanElement} */
    const timeDisplay = doc.querySelector('span#time-display');

    /** @type {HTMLButtonElement} */
    const testStartButton = doc.querySelector('#start-btn');
    
    /** @type {HTMLButtonElement} */
    const testQuitButton = doc.querySelector('#quit-btn');

    /* Objects */
    const timer = new TestTimer(DEFAULT_TIME, (time) => {
        timeDisplay.innerHTML = `${time}s`;
    }, (aborted) => {
        if (aborted) timeDisplay.innerHTML = 'Canceled!';
        else timeDisplay.innerHTML = 'Time\'s up!';
    });
    // const tester = null; // TODO!

    testStartButton.addEventListener('click', () => {
        timer.start();
    });

    testQuitButton.addEventListener('click', () => {
        timer.reset(DEFAULT_TIME);
    });

    console.log(`main.js by ${AUTHOR}`);
})(document);
