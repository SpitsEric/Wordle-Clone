var height = 6; // Number of rows in the game board
var width = 5;  // Number of columns in the game board

var row = 0;    // Current row being played
var col = 0;    // Current column being played
var gameOver = false; // Flag to indicate if the game is over
var word = "";   // The word the player needs to guess

// On page load
window.onload = async function () {
    // Fetch a random 5-letter word from dictionary API
    word = await getRandomWord();
    // Initialize the board
    initialize();
    // Set focus to the document body to capture keyboard events
    document.body.focus();
};

// Function to fetch a random 5-letter word from an external API
async function getRandomWord() {
    const apiUrl = "https://random-word-api.herokuapp.com/word?length=5";

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        // Check if the API response is valid
        if (Array.isArray(data) && data.length > 0) {
            return data[0].toUpperCase(); // Return the word in uppercase
        } else {
            console.error("No valid word received.");
            return "ERROR"; // Return "ERROR" if no valid word is received
        }
    } catch (error) {
        console.error("Error fetching word:", error);
        return "ERROR"; // Return "ERROR" if an error occurs during the fetch
    }
}

// Function to initialize the game board with empty tiles
function initialize() {
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            let tile = document.createElement("span");
            tile.id = i.toString() + "-" + j.toString(); // Set tile ID
            tile.classList.add("tile"); // Add tile class
            tile.innerText = ""; // Initialize tile text
            document.getElementById("board").appendChild(tile); // Append tile to the board
        }
    }
}

// Event listener for keyboard keyup events
document.addEventListener("keyup", (e) => {
    if (gameOver) return; // If game is over, do nothing

    // Handle letter key presses
    if ("KeyA" <= e.code && e.code <= "KeyZ") {
        if (col < width) {
            let currentTile = document.getElementById(row.toString() + "-" + col.toString());
            if (currentTile.innerText == "") {
                currentTile.innerText = e.code[3]; // Set tile text to the pressed letter
                col += 1; // Move to the next column
            }
        }
    } else if (e.code == "Backspace") { // Handle backspace key press
        if (col > 0 && col <= width) {
            col -= 1; // Move to the previous column
        }
        let currentTile = document.getElementById(row.toString() + "-" + col.toString());
        currentTile.innerText = ""; // Clear the tile text
    } else if (e.code == "Enter") { // Handle enter key press
        if (col == 5) { // Check if the row is full
            let guess = "";
            for (let i = 0; i < width; i++) {
                guess += document.getElementById(row.toString() + "-" + i.toString()).innerText; // Build the guess string
            }

            isValidWord(guess).then(isValid => { // Validate the guess
                if (isValid) {
                    update(); // Update tile colors and animations
                    row += 1; // Move to the next row
                    col = 0; // Reset column
                    updateKeyboardColors(); // Update keyboard colors
                } else { // Handle invalid word
                    document.getElementById(row.toString() + "-0").parentElement.classList.add("shake"); // Add shake animation
                    setTimeout(() => {
                        document.getElementById(row.toString() + "-0").parentElement.classList.remove("shake"); // Remove shake animation
                    }, 600);
                }
                if (row == height) { // Check if game is over (all rows filled)
                    gameOver = true;
                    document.getElementById("answer").innerText = word; // Display the answer
                }
            });
        }
    }

    // Function to update tile colors and animations
    function update() {
        let correct = 0;
        let delay = 0;

        for (let i = 0; i < width; i++) {
            let currentTile = document.getElementById(row.toString() + "-" + i.toString());
            let letter = currentTile.innerText;

            (function(currentDelay) { // Closure to capture the correct delay value
                setTimeout(() => {
                    if (word[i] == letter) {
                        currentTile.classList.add("correct");
                        correct += 1;
                    } else if (word.includes(letter)) {
                        currentTile.classList.add("present");
                    } else {
                        currentTile.classList.add("absent");
                    }
                    currentTile.classList.add("flip"); // Add flip animation
                    updateKeyboardColors();
                }, currentDelay);
            })(delay);

            delay += 250; // Increase delay for the next tile
            if (correct == width) { // Check if the guess is correct
                gameOver = true;
            }
        }
    }
});

// Function to validate a word against an external dictionary API
async function isValidWord(word) {
    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

    try {
        const response = await fetch(apiUrl);
        if (response.ok) {
            return true;
        } else if (response.status === 404) {
            return false;
        } else {
            console.error("API error:", response.status);
            return false;
        }
    } catch (error) {
        console.error("Network error:", error);
        return false;
    }
}

// Select all keyboard keys
const keys = document.querySelectorAll(".key");

// Add click event listeners to keyboard keys
keys.forEach(key => {
    key.addEventListener("click", () => {
        const keyValue = key.dataset.key; // Get the key's data-key attribute

        if (!keyValue) return;

        if (keyValue === "Enter") {
            processKey("Enter");
        } else if (keyValue === "Backspace") {
            processKey("Backspace");
        } else {
            processKey(keyValue);
        }
    });
});

// Function to trigger a keyup event for a given key
function processKey(key) {
    const event = new KeyboardEvent("keyup", { code: key.length === 1 ? "Key" + key.toUpperCase() : key });
    document.dispatchEvent(event);
}

// Function to update keyboard colors based on tile colors
function updateKeyboardColors() {
    const tiles = document.querySelectorAll(".tile");
    const keyboardKeys = document.querySelectorAll(".key");

    keyboardKeys.forEach(key => {
        key.classList.remove("correct", "present", "absent"); // Reset keyboard key colors
    });

    tiles.forEach(tile => {
        if (tile.innerText) {
            const letter = tile.innerText;
            const key = document.querySelector(`[data-key="${letter}"]`);

            if (key) {
                if (tile.classList.contains("correct")) {
                    key.classList.add("correct");
                } else if (tile.classList.contains("present")) {
                    key.classList.add("present");
                } else if (tile.classList.contains("absent")) {
                    key.classList.add("absent");
                }
            }
        }
    });
}