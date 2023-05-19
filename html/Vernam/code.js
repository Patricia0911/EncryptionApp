keyTextbox = document.getElementById("key");
plainTextbox = document.getElementById("plaintext");
encodeButton = document.getElementById("cipher");
decodeButton = document.getElementById("decipher");
const cyr = ['а', 'б', 'в', 'г', 'д', 'е', 'ё', 'ж', 'з', 'и', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ъ', 'ы', 'ь', 'э', 'ю', 'я'];
const lat = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const punct = ['.', ',', ';', '/', '\\', '?', '!', '-', '(', ')', '[', ']', '"', "#", "$", "%", "^", "&", "*", "@"];

function parseText(txt) {
    punct.forEach(p => {
        if (txt.includes(p)) {
            p = p.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); // escape all special characters (? => \\?)
            let pReg = new RegExp(p, "g");
            txt = txt.replace(pReg, "");
        }
    });
    txt = txt.toLowerCase().trim().replace(/\s/g, "ß"); // identifier for whitespaces
    return txt;
}
timeout = () => {};
function showMessage(msg, type) {
    clearTimeout(timeout); // ensure to not start on top of other timeout
    let warning = document.getElementById("warning");
    warning.textContent = msg;
    warning.className = type;
    timeout = setTimeout(() => {
        warning.className = "";
        warning.textContent = "";
    }, 2000);
}
function validate() {
    const keyValue = parseText(keyTextbox.value);
    const txtValue = parseText(plainTextbox.value);
    let keyAlphabet;
    let txtAlphabet;
    if (lat.includes(keyValue.charAt(0))) {
        keyAlphabet = lat;
    } else {
        keyAlphabet = cyr;
    }
    if (lat.includes(txtValue.charAt(0))) {
        txtAlphabet = lat;
    } else {
        txtAlphabet = cyr;
    }
    for (const char of keyValue) {
        if (!keyAlphabet.includes(char) && char !== "ß") {
            showMessage("Mixed key characters.", "error");
        }
        if (!isNaN(parseInt(char, 10))) {
            showMessage("Cannot encode numbers.", "error")
        }
    }
    for (const char of txtValue) {
        if (!txtAlphabet.includes(char) && char !== "ß") {
            showMessage("Mixed text characters.", "error");
        }
        if (!isNaN(parseInt(char, 10))) {
            showMessage("Cannot encode numbers.", "error")
        }
    }
    if (keyAlphabet != txtAlphabet) {
        showMessage("Key and text alphabets don't match.", "error");
    }
}
function encode() {
    // console.log("encode");
    const keyValue = keyTextbox.value;
    const txtValue = plainTextbox.value;

    var txt = parseText(txtValue);
    var key = parseText(keyValue);
    var cipher = [];
    var alphabet;
    if (key.length < txt.length) {
        key = key.repeat(Math.ceil(txt.length / key.length)).slice(0, txt.length); // fit key to text length
    }
    if (lat.includes(txt.charAt(0))) {
        alphabet = lat;
    } else {
        alphabet = cyr;
    }
    for (let i = 0; i < txt.length; i++) {
        if (txt.charAt(i) === "ß") { // ignore parsed whitespace identifiers (e.g. helloßworld)
            cipher.push("ß");
        } else {
            let txtChar = txt.charAt(i);
            let txtIndex = alphabet.indexOf(txtChar);
            let keyChar = key.charAt(i);
            let keyIndex = alphabet.indexOf(keyChar);
            if (txtIndex === -1 || keyIndex === -1) {
                showMessage("Key and text alphabets don't match.", "error");
                return false;
            }
            let sumIndex = txtIndex + keyIndex;
            if (sumIndex >= alphabet.length) { // cycle to the beginning when out of range
                sumIndex -= alphabet.length;
            }
            let sumChar = alphabet[sumIndex];
            cipher.push(sumChar);
        }
    }
    cipher = cipher.join('');
    plainTextbox.value = cipher;
}
function decode() {
    // console.log("decode");
    const keyValue = keyTextbox.value;
    const cipValue = plainTextbox.value;

    var cip = parseText(cipValue);
    var key = parseText(keyValue);
    var plaintext = [];
    var alphabet;

    if (key.length < cip.length) {
        key = key.repeat(Math.ceil(cip.length / key.length)).slice(0, cip.length); // fit key to text length
    }
    if (lat.includes(cip.charAt(0))) {
        alphabet = lat;
    } else {
        alphabet = cyr;
    }
    for (let i = 0; i < cip.length; i++) {
        if (cip.charAt(i) === "ß") {
            plaintext.push(" ");
        } else {
            let cipChar = cip.charAt(i);
            let cipIndex = alphabet.indexOf(cipChar);
            let keyChar = key.charAt(i);
            let keyIndex = alphabet.indexOf(keyChar);
            if (cipIndex === -1 || keyIndex === -1) {
                showMessage("Key and text alphabets don't match.", "error");
                return false;
            }
            let sumIndex = cipIndex - keyIndex;
            if (sumIndex < 0) { // cycle to the end when out of range
                sumIndex += alphabet.length;
            }
            let sumChar = alphabet[sumIndex];
            plaintext.push(sumChar);
        }
    }
    plaintext = plaintext.join('');
    plainTextbox.value = plaintext;
}
function copyText() {
    // console.log("copy");
    plainTextbox.select();
    document.execCommand("copy");
    showMessage("Text copied!", "info")
}