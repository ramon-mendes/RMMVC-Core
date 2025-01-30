if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/pwa/service-worker.js')
        .then((registration) => {
            alert('Service Worker registrado com sucesso:' + registration);
        })
        .catch((error) => {
            alert('Falha ao registrar o Service Worker:' + error);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('h2').textContent = 'meowwww';

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let audioBuffer;
    let wakeLock = null;
    let startTime;
    let elapsedTimeInterval;
    let logTextarea = document.getElementById('logTextarea');

    // Override console.log to print to the textarea
    const originalConsoleLog = console.log;
    console.log = function(message) {
        originalConsoleLog(message);
        if(logTextarea) {
            logTextarea.value += message + '\n';
            logTextarea.scrollTop = logTextarea.scrollHeight;
        }
    };

    // Global error handler
    window.onerror = function(message, source, lineno, colno, error) {
        if(logTextarea) {
            logTextarea.value += `Error: ${message} at ${source}:${lineno}:${colno}\n`;
            logTextarea.scrollTop = logTextarea.scrollHeight;
        }
        return false; // Let the browser handle the error as well
    };

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', function(event) {
        if(logTextarea) {
            logTextarea.value += `Unhandled Rejection: ${event.reason}\n`;
            logTextarea.scrollTop = logTextarea.scrollHeight;
        }
    });

    // Load the bell sound
    async function loadBellSound() {
        const response = await fetch('/pwa/tempbell.mp3');
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        console.log('Bell sound loaded');
    }

    // Play the bell sound
    function playBell(time) {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(time);
    }

    // Schedule the bell rings based on the given minutes array
    function scheduleBells(minutesArray) {
        const now = audioContext.currentTime;
        minutesArray.forEach(minute => {
            const time = now + minute * 60; // Convert minutes to seconds
            playBell(time);
        });
    }

    // Request a wake lock
    async function requestWakeLock() {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            wakeLock.addEventListener('release', () => {
                console.log('Wake lock released');
            });
            console.log('Wake lock acquired');
        } catch(err) {
            console.error(`${err.name}, ${err.message}`);
        }
    }

    // Update the elapsed time
    function updateElapsedTime() {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById('elapsedTime').textContent = `Elapsed Time: ${elapsedTime} seconds`;
    }

    // Start the process
    async function start() {
        startTime = Date.now();
        elapsedTimeInterval = setInterval(updateElapsedTime, 1000);
        await loadBellSound();
        scheduleBells([0, 1, 5]);
        await requestWakeLock();
    }

    // Ensure AudioContext is resumed after user interaction
    document.querySelector('.play-button').addEventListener('click', () => {
        start();

        if(audioContext.state === 'suspended') {
            audioContext.resume();
        }
    });
});
