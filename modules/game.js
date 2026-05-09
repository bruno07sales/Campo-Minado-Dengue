import * as board from './board.js';
import * as timer from './timer.js';
import { MOSQUITO_VALUE } from './board.js';

export let isGameOver = false;
export let mosquitosLeft;

const difficulties = [
    { id: 'easy', boardWidth: 6, boardHeight: 5, mosquitos: 6, hexWidth: 45, hexHeight: 26, fontSize: 1.35 },
    { id: 'normal', boardWidth: 10, boardHeight: 9, mosquitos: 14, hexWidth: 40, hexHeight: 23, fontSize: 1.2 },
    { id: 'hard', boardWidth: 15, boardHeight: 13, mosquitos: 35, hexWidth: 36, hexHeight: 20, fontSize: 1.1 },
];

export function start() {
    $('.title').text('Campo ContaMinado');
    isGameOver = false;
    timer.clear();

    const difficulty = _loadDifficulty();
    setMosquitosLeft(difficulty.mosquitos);
    board.generate(difficulty);
    board.draw(difficulty);
}

export function setMosquitosLeft(mosquitos) {
    mosquitosLeft = mosquitos;
    $('#mosquitos-left').text(mosquitosLeft);
}

export function checkWin() {
    let allSelected = true;

    board.boardMatrix.forEach((row) => {
        row.forEach((item) => {
            if (!item || item.value === MOSQUITO_VALUE) return;
            if (!item.isSelected) allSelected = false;
        });
    });

    if (allSelected) end('Você ganhou!');
}

export function end(message) {
    isGameOver = true;
    timer.stop();
    $('.title').text(message);
}

function _loadDifficulty() {
    const targetDifficulty = window.localStorage.getItem('difficulty') || difficulties[0].id;
    let difficulty;

    difficulties.forEach((item) => {
        const $option = $(`#${item.id}`);

        if (item.id === targetDifficulty) {
            difficulty = item;
            $option.addClass('option-active');
            $('body').css('--hex-width', `${difficulty.hexWidth}px`);
            $('body').css('--hex-height', `${difficulty.hexHeight}px`);
            $('body').css('--hex-font-size', `${difficulty.fontSize}rem`);
        } else {
            $option.removeClass('option-active');
        }
    });

    return difficulty;
}

