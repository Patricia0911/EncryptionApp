"use strict";

let alphabetField = document.querySelector(".alphabet-field");
let inputField = document.querySelector(".input-field");
let inputFieldTitle = document.querySelector(".input-field-title");
let outputField = document.querySelector(".output-field");
let outputFieldTitle = document.querySelector(".output-field-title");
let keyOption = document.querySelector(".key-option");
let keyFieldLabel = document.querySelector(".key-field-label");
let keyField = document.querySelector(".key-field");
let actionButton = document.querySelector(".action-button");
let modeSelect = document.querySelector("#mode");
let keyLengthField = document.querySelector(".key-length-field");
let commonCharField = document.querySelector(".common-char-field");
let solveOptions = document.querySelectorAll(".solve-option");
let solutionInfo = document.querySelector(".solution-info");

let previousMode = "";
let currentMode = "encode";

let solveModeAlphabet;
let solveModeCiphertext;
let solveModeKeyLengths;
let solveModeCommonCharacter;
let solveModeObtainedKeys = false;
let solveModeCurrentSolution = 0;
let solveModeDecryptionKeys = [];

actionButton.onclick = () => {
    try {
        if (currentMode === "encode")
            encode();
        else if (currentMode === "decode")
            decode();
        else if (currentMode === "solve")
            solve();
    } catch (error) {
        console.log(error);
        alert(error.message);
    }
};

modeSelect.addEventListener('change', function() {
    if (this.value === "encode") {
        previousMode = currentMode;
        currentMode = "encode";

        keyOption.style.display = "flex";
        solutionInfo.style.display = "none";
        solveOptions.forEach(element => {
            element.style.display = "none";
        });

        actionButton.textContent = "Encrypt";
        inputFieldTitle.textContent = "Plaintext";
        outputFieldTitle.textContent = "Ciphertext";
        inputField.placeholder = "e.g., Hello, world!";

        if (previousMode === "decode")
            [inputField.value, outputField.value] = [outputField.value, inputField.value];
        else if (previousMode === "solve")
            [inputField.value, outputField.value] = ["", ""];
    } else if (this.value === "decode") {
        previousMode = currentMode;
        currentMode = "decode";

        keyOption.style.display = "flex";
        solutionInfo.style.display = "none";
        solveOptions.forEach(element => {
            element.style.display = "none";
        });

        actionButton.textContent = "Decrypt";
        inputFieldTitle.textContent = "Ciphertext";
        outputFieldTitle.textContent = "Plaintext";
        inputField.placeholder = "e.g., Hsclb, csfcd!";

        if (previousMode === "encode")
            [inputField.value, outputField.value] = [outputField.value, inputField.value];
        else if (previousMode === "solve")
            [inputField.value, outputField.value] = ["", ""];
    } else if (this.value === "solve") {
        previousMode = currentMode;
        currentMode = "solve";

        keyOption.style.display = "none";
        solutionInfo.style.display = "block";
        solveOptions.forEach(element => {
            element.style.display = "flex";
        });

        actionButton.textContent = "Cycle Solution";
        inputFieldTitle.textContent = "Ciphertext";
        outputFieldTitle.textContent = "Possible Solution";
        inputField.placeholder = "e.g., Hsclb, csfcd!";

        if (previousMode === "encode") {
            inputField.value = outputField.value;
            outputField.value = "";

            if (keyField.value)
                keyLengthField.value = `${keyField.value.length}-${keyField.value.length}`;
        } else if (previousMode === "decode") {
            outputField.value = "";

            if (keyField.value)
                keyLengthField.value = `${keyField.value.length}-${keyField.value.length}`;
        }
    }
});

function encode() {
    checkAlphabet();
    let alphabet = alphabetField.value;

    checkKey(alphabet);
    let key = keyField.value;

    checkInputField();
    let plaintext = inputField.value;

    let ciphertext = encrypt(plaintext, key, alphabet);
    outputField.value = ciphertext;
}

function checkAlphabet() {
    let alphabet = alphabetField.value;

    if (alphabet.length < 1)
        throw Error("Alphabet should be at least one character.");

    for (let i = 0; i < alphabet.length; i++)
        for (let j = i + 1; j < alphabet.length; j++)
            if (alphabet[i] == alphabet[j])
                throw Error("Alphabet should contain unique characters.");
}

function checkKey(alphabet) {
    let key = keyField.value;

    if (key.length < 1)
        throw Error("Key should be at least one character."); 

    for (let i = 0; i < key.length; i++)
        if (!alphabet.includes(key[i]))
            throw Error("Key should not have characters that are not in the provided alphabet."); 
}

function checkInputField() {
    let input = inputField.value;

    if (input.length < 1)
        throw Error("Input should be at least one character."); 
}

function encrypt(plaintext, key, alphabet) {
    let n = key.length;
    let nSizedChunks = chunkString(plaintext, n)

    let ciphertext = "";
    let offset = 0;
    for (let chunk of nSizedChunks)
        for (let i = 0; i < chunk.length; i++)
            if (alphabet.includes(chunk[i])) {
                let indexOfChar = alphabet.indexOf(chunk[i]);
                let desiredKeyIndex = posMod(i - offset, key.length);
                let indexOfKeyChar = alphabet.indexOf(key[desiredKeyIndex]);
                let indexOfNewChar = (indexOfChar + indexOfKeyChar) % alphabet.length;
                ciphertext += alphabet[indexOfNewChar];
            } else {
                ciphertext += chunk[i];
                offset++;
            }
    
    return ciphertext;
}

function chunkString(str, length) {
    return str.match(new RegExp('(.|[\r\n]){1,' + length + '}', 'g'));
}

function posMod(n, m) {
    return ((n % m) + m) % m;
}

function decode() {
    checkAlphabet();
    let alphabet = alphabetField.value;

    checkKey(alphabet);
    let key = extractKey(keyField.value, alphabet);

    checkInputField();
    let ciphertext = inputField.value;

    let plaintext = encrypt(ciphertext, key, alphabet);
    outputField.value = plaintext;
}

function extractKey(encodeKey, alphabet) {
    let key = "";
    
    for (let i = 0; i < encodeKey.length; i++)
        key += alphabet[posMod((alphabet.length - alphabet.indexOf(encodeKey.charAt(i))), alphabet.length)];

    return key;
}

function solve() {
    checkAlphabet();
    let alphabet = alphabetField.value;

    checkInputField();
    let ciphertext = inputField.value;
    let cleanedCiphertext = ciphertext.replace(new RegExp('\r?\n','g'), "");

    let [shortestKeyLength, longestKeyLength] = getKeyLengths();

    let possibleKeyLengths = [];
    for (let i = shortestKeyLength; i <= longestKeyLength; i++) 
        possibleKeyLengths.push(i);

    checkCommonCharacter(alphabet);
    let commonCharacter = commonCharField.value;

    if (solveModeObtainedKeys) {
        if (!inputChanged(alphabet, ciphertext, possibleKeyLengths, commonCharacter)) {
            let newDecryptionKeyIndex = ++solveModeCurrentSolution % solveModeDecryptionKeys.length;
            let key = solveModeDecryptionKeys[newDecryptionKeyIndex];
            let plaintext = encrypt(ciphertext, key, alphabet);
            outputField.value = plaintext;
            solutionInfo.textContent = `Key Length: ${key.length}, Key Used to Encrypt: ${extractKey(key, alphabet)}`;
            return;
        } else {
            solveModeObtainedKeys = false;
            solveModeAlphabet = solveModeCiphertext = solveModeKeyLengths = solveModeCommonCharacter = null;
            solveModeCurrentSolution = 0;
            solveModeDecryptionKeys = [];
        }
    }

    for (let possibleKeyLength of possibleKeyLengths) {
        let possibleDecryptionKey = "";
        for (let i of range(possibleKeyLength)) {
            let newCleanedCiphertext = "";
            for (let j = 0; j < cleanedCiphertext.length; j++)
                if (alphabet.includes(cleanedCiphertext[j]))
                    newCleanedCiphertext += cleanedCiphertext[j];
            newCleanedCiphertext = newCleanedCiphertext.slice(i);

            let ithCharacterEveryPartitionOfKeyLength = "";
            for (let j = 0; j < newCleanedCiphertext.length; j += possibleKeyLength)
                ithCharacterEveryPartitionOfKeyLength += newCleanedCiphertext[j];

            let frequencies = [];
            for (let j of range(alphabet.length)) {
                frequencies.push((ithCharacterEveryPartitionOfKeyLength.split(alphabet[j]).length - 1)/ithCharacterEveryPartitionOfKeyLength.length);
            }
            
            let indexOfEncryptionKey = posMod(frequencies.indexOf(Math.max(...frequencies)) - alphabet.indexOf(commonCharacter), alphabet.length)
            let indexOfDecryptionKey = posMod(alphabet.length - alphabet.indexOf(alphabet[indexOfEncryptionKey]), alphabet.length)
            possibleDecryptionKey += alphabet[indexOfDecryptionKey];
        }
        solveModeDecryptionKeys.push(possibleDecryptionKey);
    }

    solveModeObtainedKeys = true;
    let key = solveModeDecryptionKeys[0];
    let plaintext = encrypt(ciphertext, key, alphabet);
    outputField.value = plaintext;
    solutionInfo.textContent = `Key Length: ${key.length}, Key Used to Encrypt: ${extractKey(key, alphabet)}`;
    [
        solveModeAlphabet,
        solveModeCiphertext, 
        solveModeKeyLengths, 
        solveModeCommonCharacter,
    ] = [
        alphabet, 
        ciphertext, 
        possibleKeyLengths, 
        commonCharacter,
    ];
}

function inputChanged(alphabet, ciphertext, possibleKeyLengths, commonCharacter) {
    if (
        alphabet !== solveModeAlphabet ||
        ciphertext !== solveModeCiphertext ||
        JSON.stringify(possibleKeyLengths) !== JSON.stringify(solveModeKeyLengths) ||
        commonCharacter !== solveModeCommonCharacter
    )
        return true;
    else
        return false;
}

function range(size, startAt = 0) {
    return [...Array(size).keys()].map(i => i + startAt);
}

function getKeyLengths() {
    checkKeyLength();

    let splitInput = keyLengthField.value.split("-");

    return [+splitInput[0], +splitInput[1]];
}

function checkKeyLength() {
    let keyLengthInput = keyLengthField.value;

    if (keyLengthInput.length < 1)
        throw Error("Key length range is required to solve ciphertext.");

    let splitInput = keyLengthInput.split("-");

    if (
        splitInput.length !== 2 ||
        isNaN(+splitInput[0]) ||
        isNaN(+splitInput[1]) ||
        +splitInput[0] <= 0 ||
        +splitInput[0] > +splitInput[1]
    )
        throw Error("Key length range should have the following form: number-number. e.g., 3-10.")
}

function checkCommonCharacter(alphabet) {
    let commonCharacter = commonCharField.value;

    if (commonCharacter.length !== 1)
        throw Error("Most common character should be one character.");

    if (!alphabet.includes(commonCharacter))
        throw Error("Most common character should be from your provided alphabet.")
}