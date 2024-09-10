// ==UserScript==
// @name         vcloud-copy-paste.user.js
// @namespace    https://github.com/adryd325/vcloud-copy-paste.user.js
// @version      v1.0.0
// @description  Input text and convert to keystroke events! This is at most a proof of concept ATM
// @author       adryd
// @match        https://fast-vcloud.humber.ca/
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  const EN_US_CONVERSION_TABLE = {
    "\n": [13, "Enter", false],
    " ": [32, "Space", false],
    "`": [192, "Backquote", false],
    "~": [192, "Backquote", true],
    "1": [49, "Digit1", false],
    "!": [49, "Digit1", true],
    "2": [50, "Digit2", false],
    "@": [50, "Digit2", true],
    "3": [51, "Digit3", false],
    "#": [51, "Digit3", true],
    "4": [52, "Digit4", false],
    "$": [52, "Digit4", true],
    "5": [53, "Digit5", false],
    "%": [53, "Digit5", true],
    "6": [54, "Digit6", false],
    "^": [54, "Digit6", true],
    "7": [55, "Digit7", false],
    "&": [55, "Digit7", true],
    "8": [56, "Digit8", false],
    "*": [56, "Digit8", true],
    "9": [57, "Digit9", false],
    "(": [57, "Digit9", true],
    "0": [48, "Digit0", false],
    ")": [48, "Digit0", true],
    "-": [173, "Minus", false],
    "_": [173, "Minus", true],
    "=": [61, "Equals", false],
    "+": [61, "Equals", true],
    "q": [81, "KeyQ", false],
    "Q": [81, "KeyQ", true],
    "w": [87, "KeyW", false],
    "W": [87, "KeyW", true],
    "e": [69, "KeyE", false],
    "E": [69, "KeyE", true],
    "r": [82, "KeyR", false],
    "R": [82, "KeyR", true],
    "t": [84, "KeyT", false],
    "T": [84, "KeyT", true],
    "y": [89, "KeyY", false],
    "Y": [89, "KeyY", true],
    "u": [85, "KeyU", false],
    "U": [85, "KeyU", true],
    "i": [73, "KeyI", false],
    "I": [73, "KeyI", true],
    "o": [79, "KeyO", false],
    "O": [79, "KeyO", true],
    "p": [80, "KeyP", false],
    "P": [80, "KeyP", true],
    "[": [219, "BracketLeft", false],
    "{": [219, "BracketLeft", true],
    "]": [221, "BracketRight", false],
    "}": [221, "BracketRight", true],
    "\\": [220, "Backslash", false],
    "|": [220, "Backslash", true],
    "a": [65, "KeyA", false],
    "A": [65, "KeyA", true],
    "s": [83, "KeyS", false],
    "S": [83, "KeyS", true],
    "d": [68, "KeyD", false],
    "D": [68, "KeyD", true],
    "f": [70, "KeyF", false],
    "F": [70, "KeyF", true],
    "g": [71, "KeyG", false],
    "G": [71, "KeyG", true],
    "h": [72, "KeyH", false],
    "H": [72, "KeyH", true],
    "j": [74, "KeyJ", false],
    "J": [74, "KeyJ", true],
    "k": [75, "KeyK", false],
    "K": [75, "KeyK", true],
    "l": [76, "KeyL", false],
    "L": [76, "KeyL", true],
    ";": [59, "Semicolon", false],
    ":": [59, "Semicolon", true],
    "'": [222, "Quote", false],
    "\"": [222, "Quote", true],
    "z": [90, "KeyZ", false],
    "Z": [90, "KeyZ", true],
    "x": [88, "KeyX", false],
    "X": [88, "KeyX", true],
    "c": [67, "KeyC", false],
    "C": [67, "KeyC", true],
    "v": [86, "KeyV", false],
    "V": [86, "KeyV", true],
    "b": [66, "KeyB", false],
    "B": [66, "KeyB", true],
    "n": [78, "KeyN", false],
    "N": [78, "KeyN", true],
    "m": [77, "KeyM", false],
    "M": [77, "KeyM", true],
    ",": [188, "Comma", false],
    "<": [188, "Comma", true],
    ".": [190, "Period", false],
    ">": [190, "Period", true],
    "/": [191, "Slash", false],
    "?": [191, "Slash", true],
  };
  const KEY_DATA_TEMPLATE = {
    bubbles: true,
    cancelable: true,
    charCode: 0,
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    repeat: false,
    location: KeyboardEvent.DOM_KEY_LOCATION_STANDARD,
  };

  let shiftHeld = false;
  function createEvents(character) {
    const events = []
    const charData = EN_US_CONVERSION_TABLE[character]
    if (charData == null) {return [];}
    if (charData[2] && !shiftHeld) {
      // Hold shift
      events.push("sleep")
      events.push(new KeyboardEvent("keydown", {...KEY_DATA_TEMPLATE, code: "ShiftLeft", key:"ShiftLeft", keyCode: 16, shiftKey: true}))
      events.push("sleep")
      shiftHeld = true
    }
    if (!charData[2] && shiftHeld) {
      // Unshift
      events.push("sleep")
      events.push(new KeyboardEvent("keyup", {...KEY_DATA_TEMPLATE, code: "ShiftLeft", key:"ShiftLeft", keyCode: 16, shiftKey: false}))
      events.push("sleep")
      shiftHeld = false
    }
    events.push(new KeyboardEvent("keydown", {...KEY_DATA_TEMPLATE, code: charData[1], key:charData[1], keyCode: charData[0], shiftKey: charData[2]}))
    events.push(new KeyboardEvent("keyup", {...KEY_DATA_TEMPLATE, code: charData[1], key:charData[1], keyCode: charData[0], shiftKey: charData[2]}))
    return events;

  }

  function createInputElement() {
    const textarea = document.createElement("textarea")
    textarea.addEventListener("keydown", (event) => {
      if (event.keyCode == 13) {
        event.preventDefault()
        kpress(textarea.value)
        textarea.value = "";
      }
    })
    textarea.style.position = "absolute"
    textarea.style.zIndex = 999
    document.body.appendChild(textarea)
  }

  function sleep(ms) {return new Promise((resolve, reject) => setTimeout(resolve, ms))}

  createInputElement();

  window.kpress = async (string) => {
    const targetElement = document.getElementById("mainCanvas")
    for (let i of string) {
      console.log(i)
      for (let event of createEvents(i)) {
        if (event == "sleep") {await sleep(100); continue}
        targetElement.dispatchEvent(event)
        await sleep(10)
      }
    }
    if (shiftHeld) {
      // Unshift
      await sleep(10)
      shiftHeld = false
      targetElement.dispatchEvent(new KeyboardEvent("keyup", {...KEY_DATA_TEMPLATE, code: "ShiftLeft", key:"ShiftLeft", keyCode: 16, shiftKey: false}))
    }
  }

})();
