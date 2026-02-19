import { cards } from "./cards.js";
import {
  database,
  updateCurrentPlayer,
  updateDeckId,
  updateGreenPlayerHand,
  updateBluePlayerHand,
  updateBoardState,
  initializeGameListener,
} from "./firestore.js";
import { boardCardOrder } from "./gameboard.js";

let overlayImage = "";
let currentPlayer = "blue"; // Starting player
let bluePlayerHand = []; // Blue player's hand
let greenPlayerHand = []; // Green player's hand

// saves cell overlay image states (none, blue chip, or green chip)
let boardState = new Array(boardCardOrder.length).fill("none");
const board = document.getElementById("board"); // 10x10 grid
const deckSlot = document.getElementById("deck-slot"); // deck location
const discardSlot = document.getElementById("discard-slot"); // discard pile location
const btnEndTurn = document.getElementById("end-turn");
const btnNewGame = document.getElementById("new-game");
let deckId;

// Utility Function to Create and Configure DOM Elements
const createElement = (type, className, styleProps = {}, attributes = {}) => {
  const elem = document.createElement(type);
  if (className) elem.classList.add(className);
  Object.assign(elem.style, styleProps);
  Object.entries(attributes).forEach(([key, value]) => {
    elem.setAttribute(key, value);
  });
  return elem;
};

// makes deck, assigns deckId used throughout the JavaScript
async function makeDeck() {
  const response = await fetch(
    "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1",
  );
  const data = await response.json();
  deckId = data.deck_id;
  // update database
  updateDeckId(deckId);
}

// Helper function to find card by cards.code value (see cards.js)
const findCardByCode = (code) => cards.find((card) => card.code === code);
const cardBackImage = findCardByCode("BK").image;

// Creates playing board; each cell displays card image
function makeBoard() {
  board.innerHTML = "";
  // go through every card on the board (code is the card, index is its position)
  boardCardOrder.forEach((code, index) => {
    // find card object matching card.cdoe
    const card = findCardByCode(code);
    // create a <div class='card'>, assign a card image
    if (card) {
      const cardDiv = createElement("div", "card", {
        backgroundImage: `url(${card.image})`,
      });
      // now create a visibility: hidden <img class='overlay'>
      // whose source will be either a blue or green chip
      const overlay = createElement(
        "img",
        "overlay",
        {},
        { src: overlayImage, style: "visibility: hidden;" },
      );
      cardDiv.appendChild(overlay);
      board.appendChild(cardDiv);

      // Add click event to toggle the overlay; if it's hidden make it visible when clicked & visa-versa
      cardDiv.addEventListener("click", () => toggleOverlay(overlay, index));

      // clear board & update database with blank board state
      boardState = new Array(boardCardOrder.length).fill("none");
      updateBoardState(boardState);
    }
  });
}

// Save the current board state
function saveBoardState() {
  // make an array corresponding to each cell. Items will be either "blue","green", or "none"
  const stateToSave = boardState.map((overlay) => overlay || "none");
  updateBoardState(stateToSave);
}

// updates the board (from boardState) to display the blue and green chips
// called after player clicks a cell (toggle Overlay, add chip to cell) and when switching players
function updateBoardOverlays() {
  const boardCards = board.querySelectorAll(".card"); // Select all card cells on the board

  boardCards.forEach((cardDiv, index) => {
    const overlay = cardDiv.querySelector(".overlay"); // Get the overlay image for the current card
    const currentState = boardState[index]; // Check the state for the current index

    // Determine which image to use based on the current state
    if (currentState === "blue") {
      overlay.src = "./images/chipBlue_border_small.png"; // Set overlay to blue chip
      overlay.style.visibility = "visible"; // Make overlay visible
    } else if (currentState === "green") {
      overlay.src = "./images/chipGreen_border_small.png"; // Set overlay to green chip
      overlay.style.visibility = "visible"; // Make overlay visible
    } else {
      overlay.style.visibility = "hidden"; // Hide overlay if state is none
    }
  });
}

// Toggle overlay visibility and update board state
// Event fires when player clicks board
function toggleOverlay(overlay, index) {
  if (overlay.style.visibility === "visible") {
    overlay.style.visibility = "hidden";
    boardState[index] = "none";
  } else {
    overlay.style.visibility = "visible";

    boardState[index] = overlayImage.includes("chipBlue") ? "blue" : "green";
  }
  saveBoardState(); // Save board state after every click
  updateBoardOverlays(); // Update the board visuals
}

// Highlight cards in player's hand
const highlightCards = (playerHand) => {
  const imagePath = "./images/blue_check_mark.png";

  const boardCards = board.querySelectorAll(".card");

  boardCards.forEach((cardDiv) => {
    const cardCodeMatch =
      cardDiv.style.backgroundImage.match(/\/([^\/]+)\.png/);

    if (cardCodeMatch) {
      const cardCode = cardCodeMatch[1];
      let overlay = cardDiv.querySelector(".checkmark-overlay");

      // Create overlay if it doesn't already exist
      if (!overlay) {
        overlay = createElement(
          "img",
          "checkmark-overlay",
          { visibility: "hidden" },
          { src: imagePath },
        );
        cardDiv.appendChild(overlay);
      }

      // Update overlay visibility
      overlay.style.visibility = playerHand.includes(cardCode)
        ? "visible"
        : "hidden";
    }
  });
};

// Remove overlays of a specific image from the board
const removeCardOverlays = (imagePath) => {
  const boardCards = document.querySelectorAll("#board .card");
  const absoluteImagePath = new URL(imagePath, window.location.href).href;

  boardCards.forEach((cardDiv) => {
    cardDiv.querySelectorAll(".overlay").forEach((overlay) => {
      if (overlay.src === absoluteImagePath) {
        cardDiv.removeChild(overlay);
      }
    });
  });
};

// Display player's hand in the UI
const makePlayerHand = (playerHand) => {
  const handDisplay = document.getElementById("hand-display");
  handDisplay.style.background =
    currentPlayer === "blue" ? "lightblue" : "lightgreen";
  handDisplay.innerHTML = "";
  playerHand.forEach((code) => {
    const card = findCardByCode(code);
    if (card) {
      const cardDiv = createElement("div", "card", {
        backgroundImage: `url(${card.image})`,
      });
      cardDiv.addEventListener("click", () =>
        handleCardClick(card, playerHand),
      );
      handDisplay.appendChild(cardDiv);
    }
  });

  // update board to reflect new hand
  highlightCards(playerHand);
  // update database
  currentPlayer === "blue"
    ? updateBluePlayerHand(playerHand)
    : updateGreenPlayerHand(playerHand);
};

// Handle individual card click to update status

function handleCardClick(card, playerHand) {
  //   console.log(`${card.code} Image clicked!`);
  const discardImg = createElement(
    "img",
    null,
    { width: "100%", height: "auto", border: "2px solid red" },
    { src: card.image },
  );
  discardSlot.innerHTML = "";
  discardSlot.appendChild(discardImg);

  const index = playerHand.indexOf(card.code);
  if (index !== -1) {
    playerHand.splice(index, 1);
    makePlayerHand(playerHand);
  }
  // update database
  // console.log(
  //   `When handleCardClick was clicked, currentPlayer was ${currentPlayer}`,
  // );
  currentPlayer === "blue"
    ? updateBluePlayerHand(playerHand)
    : updateGreenPlayerHand(playerHand);
}

btnEndTurn.addEventListener("click", () => switchPlayers());

// Switch player function
function switchPlayers() {
  // Toggle player
  currentPlayer = currentPlayer === "blue" ? "green" : "blue";
  // color button to match player
  document.getElementById("end-turn").style.background =
    currentPlayer == "blue" ? "lightblue" : "lightgreen";

  // Update overlay image based on the current player
  overlayImage =
    currentPlayer === "blue"
      ? "./images/chipBlue_border_small.png"
      : "./images/chipGreen_border_small.png";

  // Update board overlays
  updateBoardOverlays();

  // Update the player hand display
  let currentPlayerHand =
    currentPlayer === "blue" ? bluePlayerHand : greenPlayerHand;
  makePlayerHand(currentPlayerHand);
  highlightCards(currentPlayerHand);
  // update database
  currentPlayer == "blue"
    ? updateCurrentPlayer("blue")
    : updateCurrentPlayer("green");
  currentPlayer == "blue"
    ? updateBluePlayerHand(currentPlayerHand)
    : updateGreenPlayerHand(currentPlayerHand);

  // Optionally log the player's turn for debugging
  // console.log(`It's now ${currentPlayer}'s turn with hand:`, currentPlayerHand);
}

// Add images to side container
function addSideContainer() {
  deckSlot.innerHTML = "";
  discardSlot.innerHTML = "";
  // color button to match initial player
  document.getElementById("end-turn").style.background =
    currentPlayer == "blue" ? "lightblue" : "lightgreen";

  const deckImg = createElement(
    "img",
    null,
    { width: "100%", height: "auto" },
    { src: cardBackImage },
  );
  // Event handler for clicking deck
  deckImg.addEventListener("click", () => {
    // console.log("Deck Image clicked!")
    const playerHand =
      currentPlayer == "blue" ? bluePlayerHand : greenPlayerHand;
    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data.cards[0].code);
        playerHand.push(data.cards[0].code);
        // console.log(playerHand);
        makePlayerHand(playerHand);
        // highlightCards(playerHand);
      });
  });

  deckSlot.appendChild(deckImg);

  const discardImg = createElement(
    "img",
    null,
    { width: "100%", height: "auto" },
    { src: "./images/Blank-Playing-Card.png" },
  );
  discardImg.addEventListener("click", () =>
    console.log("Discard Image clicked!"),
  );
  discardSlot.appendChild(discardImg);
}

btnNewGame.addEventListener("click", async function () {
  await newGame();
});

async function newGame() {
  await makeDeck();
  makeBoard();
  // clear hands
  bluePlayerHand.length = 0;
  updateBluePlayerHand(bluePlayerHand);
  greenPlayerHand.length = 0;
  updateGreenPlayerHand(greenPlayerHand);

  let res;
  let data;

  let playerHand = bluePlayerHand; // playerHand local var for this method; currentPlayer is the global var
  for (let i = 0; i < 7; i++) {
    res = await fetch(
      `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`,
    );
    data = await res.json();
    playerHand.push(data.cards[0].code);
  }
  currentPlayer = "blue"; // blue goes first
  updateCurrentPlayer("blue");
  makePlayerHand(playerHand); // display blue hand
  // Update overlay image based on the current player
  overlayImage =
    currentPlayer === "blue"
      ? "./images/chipBlue_border_small.png"
      : "./images/chipGreen_border_small.png";

  // make the green player hand
  playerHand = greenPlayerHand;

  for (let i = 0; i < 7; i++) {
    res = await fetch(
      `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`,
    );
    data = await res.json();
    playerHand.push(data.cards[0].code);
  }
  // makePlayerHand(playerHand); ... make green hand, but don't display it yet
  updateGreenPlayerHand(playerHand);

  addSideContainer();
}

// Function to update game values
const updateGameValues = (gameState) => {
  if (gameState.bluePlayerHand !== undefined) {
    if (gameState.bluePlayerHand !== bluePlayerHand) {
      bluePlayerHand = gameState.bluePlayerHand;
      // updateUIForBluePlayerHand();
    }
  }
  if (gameState.greenPlayerHand !== undefined) {
    if (gameState.greenPlayerHand !== greenPlayerHand) {
      greenPlayerHand = gameState.greenPlayerHand;
      // updateUIForGreenPlayerHand();
    }
  }
  if (gameState.boardState !== undefined) {
    if (gameState.boardState !== boardState) {
      boardState = gameState.boardState;
      // updateUIForBoardState();
    }
  }
  if (gameState.currentPlayer !== undefined) {
    if (gameState.currentPlayer !== currentPlayer) {
      currentPlayer = gameState.currentPlayer;
      // updateUIForCurrentPlayer();
    }
  }
  if (gameState.deckId !== undefined) {
    if (gameState.deckId !== deckId) {
      deckId = gameState.deckId;
      // updateUIForDeckId();
    }
  }
};
export { updateGameValues };

// Example usage

initializeGameListener(); // calls updateGameValues

// if (
//   typeof gameState !== "undefined" &&
//   typeof gameState.bluePlayerHand !== "undefined"
// ) {
//   gameState.bluePlayerHand !== bluePlayerHand &&
//     (bluePlayerHand = gameState.bluePlayerHand);
// }
// if (
//   typeof gameState !== "undefined" &&
//   typeof gameState.greenPlayerHand !== "undefined"
// ) {
//   gameState.greenPlayerHand !== greenPlayerHand &&
//     (greenPlayerHand = gameState.greenPlayerHand);
// }
// if (
//   typeof gameState !== "undefined" &&
//   typeof gameState.boardState !== "undefined"
// ) {
//   gameState.boardState !== boardState && (boardState = gameState.boardState);
// }
// if (
//   typeof gameState !== "undefined" &&
//   typeof gameState.currentPlayer !== "undefined"
// ) {
//   gameState.currentPlayer !== currentPlayer &&
//     (currentPlayer = gameState.currentPlayer);
// }
// if (
//   typeof gameState !== "undefined" &&
//   typeof gameState.deckId !== "undefined"
// ) {
//   gameState.deckId !== deckId && (deckId = gameState.deckId);
// }

// updateCurrentPlayer("green");
// updateDeckId(deckId);
// updateGreenPlayerHand(greenPlayerHand);
// updateBluePlayerHand(bluePlayerHand);
// updateBoardState(boardState);
