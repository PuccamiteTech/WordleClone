"use strict";

let dictionary;
let grid;
let enterButton;
let resetButton;
let userInput;

let word;
let wordLetters;
let guesses;

async function loadDictionary() {
    const response = await fetch("dictionary.txt");

    if (response.ok) {
        return (await response.text()).toUpperCase().split("\n");
    }
    else {
        console.error("The dictionary failed to load.")
        return null;
    }
}

function startGame() {
    word = pickWord();
    wordLetters = mapLetters(word);
    guesses = 0;
    userInput.focus();
}

function pickWord() {
    return dictionary[Math.floor(Math.random() * dictionary.length)];
}

function mapLetters(input) {
    const letterMap = new Map();

    for (const LETTER of input) {
        if (letterMap.has(LETTER)) {
            letterMap.set(LETTER, letterMap.get(LETTER) + 1);
        }
        else {
            letterMap.set(LETTER, 1);
        }
    }

    return letterMap;
}

function dictionaryContains(input) {
    return (input.length == 5 && /^[a-zA-Z]+$/.test(input) && dictionary.includes(input));
}

function findAccuracy(input) {
    const gridStates = [];
    const inputMap = mapLetters(input);

    for (let index = 0; index < input.length; index++)
    {
        if (wordLetters.has(input[index]) && inputMap.get(input[index]) > wordLetters.get(input[index])) {
            inputMap.set(input[index], wordLetters.get(input[index]));
        }
        
        if (!wordLetters.has(input[index]) || inputMap.get(input[index]) <= 0) {
            gridStates[index] = "UnusedLetter";
        }
        else {
            inputMap.set(input[index], inputMap.get(input[index]) - 1);

            if (word[index] == input[index]) {
                gridStates[index] = "MatchingLetter";
            }
            else {
                gridStates[index] = "MisplacedLetter";
            }
        }
    }

    return gridStates;
}

function updateGrid(input, states) {
    const ENDING_INDEX = guesses * word.length;
    let inputIndex = 0;

    for (let index = ENDING_INDEX - word.length; index < ENDING_INDEX; index++) {
        grid[index].classList.add(states[inputIndex]);
        grid[index].innerHTML = input[inputIndex++];
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    dictionary = await loadDictionary();
    grid = document.querySelectorAll("#wordleTable tr:not(:last-child) td");
    enterButton = document.querySelector("#enterButton");
    resetButton = document.querySelector("#resetButton");
    userInput = document.querySelector("#userInput");
    startGame();

    enterButton.addEventListener("click", event => {
        const UPPERCASE_INPUT = userInput.value.toUpperCase();

        userInput.value = "";
        userInput.focus();

        if (dictionaryContains(UPPERCASE_INPUT) && guesses++ < 6) {
            updateGrid(UPPERCASE_INPUT, findAccuracy(UPPERCASE_INPUT));

            if (UPPERCASE_INPUT == word || guesses == 6) {
                event.currentTarget.hidden = true;
                resetButton.hidden = false;
                userInput.disabled = true;
                userInput.value = `Word: ${word}`;
            }
        }
    });

    userInput.addEventListener("keydown", event => {
        if (event.key == "Enter") {
            enterButton.click();
        }
    });

    resetButton.addEventListener("click", event => {
        event.currentTarget.hidden = true;
        enterButton.hidden = false;
        userInput.disabled = false;
        userInput.value = "";

        for (const cell of grid) {
            cell.innerHTML = "";
            cell.className = "";
        }

        startGame();
    });
});
