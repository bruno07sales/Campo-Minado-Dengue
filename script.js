import * as game from './modules/game.js';

window.onload = () => {
    window.addEventListener('contextmenu', (e) => e.preventDefault());
    game.start();
    listenClickEvents();
};

function listenClickEvents() {
    listenDifficulty();
    listenRestart();
    listenAlgorithm();
}

function listenDifficulty() {
    $('.difficulty .options').children().each((_, difficulty) => {
        const $option = $(`#${difficulty.id}`);
        $option.click(() => {
            if ($option.hasClass('option-active')) return;

            window.localStorage.setItem('difficulty', difficulty.id);
            game.start();
        });
    });
}

function listenRestart() {
    $('#restart').click(() => {
       game.start();
    });
}

function listenAlgorithm() {
    const firstAlgorithm = $('.algorithm .options').children().first()[0].id;
    const algorithm = window.localStorage.getItem('algorithm') ?? firstAlgorithm;
    window.localStorage.setItem('algorithm', algorithm);

    $(`.algorithm .option#${algorithm}`).addClass('option-active');

    $('.algorithm .options').children().click((event) => {
        $('.algorithm .options').children().removeClass('option-active');
        $(event.target).addClass('option-active');
        window.localStorage.setItem('algorithm', $(event.target)[0].id);
    });
}
