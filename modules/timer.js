export let isRunning = false;
let timer;

export function start() {
    if (isRunning) return;

    isRunning = true;
    let secs = 0;

    timer = setInterval(() => {
        secs += 1;
        $('#timer').text(`${secs} (s)`);
    }, 1000);
}

export function stop() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }

    isRunning = false;
}

export function clear() {
    stop();
    $('#timer').text('0 (s)');
}

