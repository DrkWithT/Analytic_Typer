/**
 * @file utils.js
 * @brief Contains utility classes for the type tester.
 * @author Derek Tan
 */

class TestTimer {
    /** @type {boolean} */
    #running;

    /** @type {number} @description Second count to decrement. */
    #countdown;

    /** @type {(time: number) => void} */
    #midCallback;

    /** @type {(aborted: boolean) => void} */
    #endCallback;

    /**
     * @constructor
     * @param {number} initialTime The countdown quantity in seconds.
     * @param {(time: number) => void} runHandler A callback to mutate the timer DOM.
     * @param {(aborted: boolean) => void} endHandler A callback to fire on timer end.
     */
    constructor(initialTime, runHandler, endHandler) {
        if (initialTime < 0 || initialTime > 90)
            throw Error('Invalid timer countdown.');
        
        if (!runHandler || !endHandler)
            throw Error('Missing callback for TestTimer.');
        
        this.#running = false;
        this.#countdown = initialTime;
        this.#midCallback = runHandler;
        this.#endCallback = endHandler;
    }

    /**
     * @description Start async countdown subtask that counts down to `0s` and updates the DOM with a callback. Premature stops vs. normal stops will be handled differently by the ending callback.
     * @returns {void}
     */
    start() {
        if (this.#running) return;

        // update initial countdown display and prepare to countdown...
        this.#running = true;
        this.#midCallback.call(this, [this.#countdown]);

        // run countdown task
        let countdownID = setInterval(() => {
            if (!this.#running) {
                this.#endCallback.call(null, true);
                clearInterval(countdownID);
                this.#running = false;
                return;
            }

            --this.#countdown;

            if (this.#countdown <= 0) {
                this.#endCallback.call(null, false);
                clearInterval(countdownID);
                this.#running = false;
                return;
            }

            this.#midCallback.call(this, [this.#countdown]);
        }, 1000);
    }

    reset(newTime) {
        if (newTime < 0 || newTime > 90) this.#countdown = 30;
        else this.#countdown = newTime;

        this.#running = false;
    }
}
