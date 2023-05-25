/**
 * @file main.js
 * @brief Driver code for the type tester and reporting AJAX.
 * @author Derek Tan
 */

const AUTHOR = 'https://github.com/DrkWithT';

/**
 * @description Attempts to GET a sequence of words in JSON for the typer test.
 * @param {(value: any) => void} dataHandler 
 * @param {(error: any) => void} errHandler 
 */
const fetchTestData = async () => {
    let result = null;

    try {
        const response = await fetch('/api/typer', {
            method: 'GET',
            headers: {
                'Host': 'localhost',
                'Accept': 'application/json;charset=UTF-8'
            },
            cache: 'no-cache' // NOTE: do not cache this json in the client browser, as this is dynamic data!
        });

        result = await response.json()
    } catch (error) {
        console.error(`Fetch error: ${error}`);
    }

    return result;
};

/**
 * @description Sends the typer test text and user response to the server as JSON.
 * @see `TypeTester.fetchDataAsJSON` For JSON object form.
 * @param {string} jsonString JSON text storing results from the test.
 */
const uploadTestResults = async (jsonString) => {
    let result = null;
    
    console.log(`DEBUG: test results: ${jsonString}`);

    if (!jsonString) return result;
    
    try {
        const response = await fetch('/api/typer', {
            method: 'POST',
            headers: {
                'Host': 'localhost',
                'Content-Type': 'application/json',
                'Accept': 'application/json;charset=UTF-8'
            },
            body: jsonString
        });

        result = await response.text();
    } catch (error) {
        console.error(`Upload error: ${error}`);
    }

    return result;
};

((doc) => {
    /* Vars */
    const DEFAULT_TIME = 30; // countdown of 30s

    /** @type {HTMLElement} */
    const pageBody = doc.body;

    /** @type {HTMLSpanElement} */
    const timeDisplay = doc.querySelector('span#time-display');
    
    /** @type {HTMLButtonElement} */
    const testQuitButton = doc.querySelector('#quit-btn');

    /* Objects */
    /** @type {TypeTester | null} */
    let tester = null;

    /* Helpers */
    const handleResults = (jsonString) => {
        uploadTestResults(jsonString)
            .then((value) => {
                console.log(`${value}`);  // TODO: display response value on page. This line should later print JSON containing the histogram picture link?
            })
            .catch((error) => {
                console.error(`${error}`);
            });
    };

    /* Loading */
    fetchTestData()
        .then((value) => {
            tester = new TypeTester(doc.body, value.original, DEFAULT_TIME, (time) => {
                timeDisplay.innerText = `${time}s`;
            }, (aborted) => {
                if (aborted) {
                    timeDisplay.innerText = 'Test Aborted';
                } else {
                    timeDisplay.innerText = 'Test Done';
                    handleResults(tester.fetchDataAsJSON());
                }
            });

            /* Listener Setup */
            pageBody.addEventListener('keypress', (keyEvent) => {
                keyEvent.preventDefault();

                if (!tester.isRunning() && keyEvent.shiftKey && keyEvent.key === 'Enter') {
                    // handle test beginning
                    tester.start();
                } else if (tester.isRunning() && tester.isDone()) {
                    // handle early test finish by last keypress
                    tester.reset(2, DEFAULT_TIME);
                    timeDisplay.innerText = 'Test Done';
                    handleResults(tester.fetchDataAsJSON());
                } else {
                    // handle in-progress test with keypressing
                    tester.takeInput(keyEvent.key[0]);
                }
            });

            testQuitButton.addEventListener('click', () => {                
                tester.reset(1, DEFAULT_TIME);
            });
        })
        .catch((error) => console.error(`${error}`))
        .finally(() => console.log(`main.js by ${AUTHOR}`));

})(document);
