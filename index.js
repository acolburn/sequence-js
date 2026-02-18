import { cards } from "./cards.js";

const boardCardOrder = [
  "BK",
  "2S",
  "3S",
  "4S",
  "5S",
  "6S",
  "7S",
  "8S",
  "9S",
  "BK",
  "6C",
  "5C",
  "4C",
  "3C",
  "2C",
  "AH",
  "KH",
  "QH",
  "0H",
  "0S",
  "7C",
  "AS",
  "2D",
  "3D",
  "4D",
  "5D",
  "6D",
  "7D",
  "9H",
  "QS",
  "8C",
  "KS",
  "6C",
  "5C",
  "4C",
  "3C",
  "2C",
  "8D",
  "8H",
  "KS",
  "9C",
  "QS",
  "7C",
  "6H",
  "5H",
  "4H",
  "AH",
  "9D",
  "7H",
  "AS",
  "0C",
  "0S",
  "8C",
  "7H",
  "2H",
  "3H",
  "KH",
  "0D",
  "6H",
  "2D",
  "QC",
  "9S",
  "9C",
  "8H",
  "9H",
  "0H",
  "QH",
  "QD",
  "5H",
  "3D",
  "KC",
  "8S",
  "0C",
  "QC",
  "KC",
  "AC",
  "AD",
  "KD",
  "4H",
  "4D",
  "AC",
  "7S",
  "6S",
  "5S",
  "4S",
  "3S",
  "2S",
  "2H",
  "3H",
  "5D",
  "BK",
  "AD",
  "KD",
  "QD",
  "0D",
  "9D",
  "8D",
  "7D",
  "6D",
  "BK",
];

let overlayImage = "";
let currentPlayer = "blue"; // Starting player
let bluePlayerHand = []; // Blue player's hand
let greenPlayerHand = []; // Green player's hand

// saves cell overlay image states (none, blue chip, or green chip)
const boardState = new Array(boardCardOrder.length).fill("none");
const board = document.getElementById("board"); // 10x10 grid
const deckSlot = document.getElementById("deck-slot"); // deck location
const discardSlot = document.getElementById("discard-slot"); // discard pile location
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
        // TODO overlayImage can be blue or green ...
      );
      cardDiv.appendChild(overlay);
      board.appendChild(cardDiv);

      // Add click event to toggle the overlay; if it's hidden make it visible when clicked & visa-versa
      cardDiv.addEventListener("click", () => toggleOverlay(overlay, index));
    }
  });
}

// Save the current board state
function saveBoardState() {
  // make an array corresponding to each cell. Items will be either "blue","green", or "none"
  const stateToSave = boardState.map((overlay) => overlay || "none");
  // TODO push board state array to server
  console.log("Saving board state:", stateToSave);
}

// updates the board according to boardState ... displays the blue and green chips
// called after player clicks a cell (toggle Overlay) and when switching players
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
    playerHand == bluePlayerHand ? "lightblue" : "lightgreen";
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
};

// Handle individual card click to update status
// This event ends player's turn
// Turn ends when player discards
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

  console.log(`${currentPlayer} turn has ended.`);
  switchPlayers();
}

// Switch player function
function switchPlayers() {
  // Toggle player
  currentPlayer = currentPlayer === "blue" ? "green" : "blue";

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

  // Optionally log the player's turn for debugging
  console.log(`It's now ${currentPlayer}'s turn with hand:`, currentPlayerHand);
}

// Add images to side container
function addSideContainer() {
  deckSlot.innerHTML = "";
  discardSlot.innerHTML = "";

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

async function newGame() {
  await makeDeck();
  makeBoard();

  // It looks bad, but it's the only way I could figure out how to do this, highlightCards() properly, and not throw Promise-related errors
  // make the blue player hand
  let playerHand = bluePlayerHand;
  let res = await fetch(
    `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`,
  );
  let data = await res.json();
  playerHand.push(data.cards[0].code);
  makePlayerHand(playerHand);
  res = await fetch(
    `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`,
  );
  data = await res.json();
  playerHand.push(data.cards[0].code);
  makePlayerHand(playerHand);
  res = await fetch(
    `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`,
  );
  data = await res.json();
  playerHand.push(data.cards[0].code);
  makePlayerHand(playerHand);
  res = await fetch(
    `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`,
  );
  data = await res.json();
  playerHand.push(data.cards[0].code);
  makePlayerHand(playerHand);
  res = await fetch(
    `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`,
  );
  data = await res.json();
  playerHand.push(data.cards[0].code);
  makePlayerHand(playerHand);
  res = await fetch(
    `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`,
  );
  data = await res.json();
  playerHand.push(data.cards[0].code);
  makePlayerHand(playerHand);
  res = await fetch(
    `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`,
  );
  data = await res.json();
  playerHand.push(data.cards[0].code);
  makePlayerHand(playerHand);

  // make the green player hand
  playerHand = greenPlayerHand;
  res = await fetch(
    `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`,
  );
  data = await res.json();
  playerHand.push(data.cards[0].code);
  makePlayerHand(playerHand);
  res = await fetch(
    `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`,
  );
  data = await res.json();
  playerHand.push(data.cards[0].code);
  makePlayerHand(playerHand);
  res = await fetch(
    `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`,
  );
  data = await res.json();
  playerHand.push(data.cards[0].code);
  makePlayerHand(playerHand);
  res = await fetch(
    `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`,
  );
  data = await res.json();
  playerHand.push(data.cards[0].code);
  makePlayerHand(playerHand);
  res = await fetch(
    `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`,
  );
  data = await res.json();
  playerHand.push(data.cards[0].code);
  makePlayerHand(playerHand);
  res = await fetch(
    `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`,
  );
  data = await res.json();
  playerHand.push(data.cards[0].code);
  makePlayerHand(playerHand);
  res = await fetch(
    `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`,
  );
  data = await res.json();
  playerHand.push(data.cards[0].code);
  makePlayerHand(playerHand);
  addSideContainer();
}

// Example usage
newGame();

// await makeDeck();

// overlayImage =
//   currentPlayer === "blue"
//     ? "./images/chipBlue_border_small.png"
//     : "./images/chipGreen_border_small.png";
// // hand background color determined by player = "blue" or not "blue"

// // Call the function to display cards
// makeBoard();

// // sample player hand, blue player
// let currentPlayerHand =
//   currentPlayer == "blue" ? bluePlayerHand : greenPlayerHand;
// makePlayerHand(currentPlayerHand);
// highlightCards(currentPlayerHand);

// addSideContainer();
