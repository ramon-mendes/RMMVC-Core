const BELLS = [0, 2, 10, 12, 14];

if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/pwa/service-worker.js')
        .then((registration) => {
            //alert('Service Worker registrado com sucesso:' + registration);
        })
        .catch((error) => {
            alert('Falha ao registrar o Service Worker:' + error);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let audioBuffer;
    let wakeLock = null;
    let startTime;
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

    console.log("Array of minutes: " + BELLS.join(', '));

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

    function playThreeBells(time) {
        let source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(time);

        source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(time + 1);

        source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(time + 2);
    }

    // Schedule the bell rings based on the given minutes array
    function scheduleBells(minutesArray) {
        const now = audioContext.currentTime;
        minutesArray.forEach((minute, index) => {
            const time = now + minute * 60; // Convert minutes to seconds

            if(index === minutesArray.length - 1) {
                playThreeBells(time);
            }
            else {
                playBell(time);
            }
        });

        const lastElement = minutesArray[minutesArray.length - 1];
        setTimeout(function() {
            try {
                let count = parseInt(localStorage.getItem("meditacoes")) || 0;
                count++;
                localStorage.setItem("meditacoes", count);
                console.log('');
                console.log(`Meditações finalizadas: ${count}`);
                console.log('');
                console.log('Para zerar a contagem: limpar o cache');
            }
            catch(err) {
                alert(err);
            }
        }, lastElement * 60 * 1000 + 10);
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

    // Start the process
    async function start() {
        startTime = Date.now();
        await loadBellSound();
        scheduleBells(BELLS);
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
