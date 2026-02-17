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

async function makeDeck() {
  const response = await fetch("https://deckofcardsapi.com/api/deck/new/");
  const data = await response.json();
  deckId = data.deck_id;
}

// Helper function to find card by cards.code value (see cards.js)
const findCardByCode = (code) => cards.find((card) => card.code === code);
const cardBackImage = findCardByCode("BK").image;

// Creates playing board; each cell displays card image
function makeBoard() {
  board.innerHTML = "";
  boardCardOrder.forEach((code, index) => {
    const card = findCardByCode(code);
    if (card) {
      const cardDiv = createElement("div", "card", {
        backgroundImage: `url(${card.image})`,
      });
      const overlay = createElement(
        "img",
        "overlay",
        {},
        { src: overlayImage, style: "visibility: hidden;" },
      );
      cardDiv.appendChild(overlay);
      board.appendChild(cardDiv);

      // Add click event to toggle the overlay
      cardDiv.addEventListener("click", () => toggleOverlay(overlay, index));
    }
  });
}

// Save the current board state
function saveBoardState() {
  const stateToSave = boardState.map((overlay) => overlay || "none");
  console.log("Saving board state:", stateToSave);
}

// Toggle overlay visibility and update board state
function toggleOverlay(overlay, index) {
  if (overlay.style.visibility === "visible") {
    overlay.style.visibility = "hidden";
    boardState[index] = "none";
  } else {
    overlay.style.visibility = "visible";
    boardState[index] = overlayImage.includes("chipBlue") ? "blue" : "green";
  }
  saveBoardState(); // Save board state after every click
}

// Highlight cards in player's hand
const highlightCards = (playerHand) => {
  const imagePath =
    player === "blue"
      ? "./images/blue_check_mark_small.png"
      : "./images/green_check_mark_small.png";

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
  handDisplay.style.background = player === "blue" ? "lightblue" : "lightgreen";
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
  deckImg.addEventListener("click", () => {
    console.log("Deck Image clicked!");
    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data.cards[0].code);
        player1Hand.push(data.cards[0].code);
        console.log(player1Hand);
        makePlayerHand(player1Hand);
        highlightCards(player1Hand);
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

// Example usage

await makeDeck();
// console.log(deckId);

let player = "green";

overlayImage =
  player === "blue"
    ? "./images/chipBlue_border_small.png"
    : "./images/chipGreen_border_small.png";
// hand background color determined by player = "blue" or not "blue"

// Call the function to display cards
makeBoard();

// sample player hand, blue player
let player1Hand = ["2D", "3D", "4D", "AC", "2C", "QH", "JD"];
makePlayerHand(player1Hand);
highlightCards(player1Hand);

// removeCardOverlays("./images/blue_check_mark_small.png");
addSideContainer();
// console.log(overlayImage);
