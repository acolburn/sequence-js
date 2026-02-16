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

const board = document.getElementById("board");
const deckSlot = document.getElementById("deck-slot");
const discardSlot = document.getElementById("discard-slot");

// Helper function to find card by cards.code value
const findCardByCode = (code) => cards.find((card) => card.code === code);
// const with path to card back image
const cardBackImage = findCardByCode("BK").image;

// creates playing board; each cell displays card image
// clicking cell/card image toggles overlay image, e.g., colored chip
function displayCards() {
  board.innerHTML = ""; // Clear any existing cards

  boardCardOrder.forEach((code) => {
    const card = findCardByCode(code);
    if (card) {
      const cardDiv = document.createElement("div");
      cardDiv.classList.add("card");
      cardDiv.style.backgroundImage = `url(${card.image})`;
      // Create the overlay
      const overlay = document.createElement("img");
      overlay.src = overlayImage; // Set the path to your overlay image
      overlay.classList.add("overlay");
      cardDiv.appendChild(overlay);
      board.appendChild(cardDiv);

      // Add click event to toggle the overlay
      cardDiv.addEventListener("click", () => {
        overlay.style.visibility =
          overlay.style.visibility === "visible" ? "hidden" : "visible";
      });
    }
  });
}

// playerHand is array with cards in player's hand
// imagePath assigns blue or green check mark
// method overlays check mark over each square corresponding with a card in player's hand
const highlightCards = (playerHand, imagePath) => {
  const boardCards = board.querySelectorAll(".card");

  boardCards.forEach((cardDiv) => {
    // Get the code of the card based on the background image
    const cardCode = cardDiv.style.backgroundImage.match(/\/([^\/]+)\.png/)[1]; // Extracts '2D', '4S', etc.

    if (playerHand.includes(cardCode)) {
      const overlay = document.createElement("img");
      overlay.src = imagePath; // Set the path to the overlay image
      overlay.classList.add("overlay");
      overlay.style.visibility = "visible"; // Show overlay
      cardDiv.appendChild(overlay);
    }
  });
};

// imagePath corresponds to overlay image
// method clears [imagePath] overlay images from playing board
const removeCardOverlays = (imagePath) => {
  const boardCards = document.querySelectorAll("#board .card"); // Ensure it targets only board cards
  const absoluteImagePath = new URL(imagePath, window.location.href).href; // Convert to absolute URL

  boardCards.forEach((cardDiv) => {
    // Find overlay images that match the provided image path
    const overlays = cardDiv.querySelectorAll(".overlay");
    overlays.forEach((overlay) => {
      // Check if the overlay source matches
      if (overlay.src === absoluteImagePath) {
        cardDiv.removeChild(overlay);
      }
    });
  });
};

// playerHand is an array with card.codes for a player's hand
// method displays player's hand in #hand-display element
const displayPlayerCards = (playerHand) => {
  const cardDisplay = document.getElementById("hand-display");
  cardDisplay.innerHTML = ""; // Clear existing displayed cards

  playerHand.forEach((code) => {
    const card = findCardByCode(code); // Find the card object based on the code
    if (card) {
      const cardDiv = document.createElement("div");
      cardDiv.classList.add("card");
      cardDiv.style.backgroundImage = `url(${card.image})`;
      // Add click event listener to the div with the card image
      // When clicked, display the card in the discard pile
      // and display a blank card in the player hand where the clicked card used to be
      cardDiv.addEventListener("click", function () {
        console.log(`${card.code} Image clicked!`); // Replace with your desired functionality
        const clickedCard = findCardByCode(card.code);
        if (clickedCard) {
          const discardImg = document.createElement("img"); // Create an img element
          discardImg.src = clickedCard.image; // Set the image source
          discardImg.style.width = "100%"; // Adjust width
          discardImg.style.height = "auto"; // Maintain aspect ratio
          discardImg.style.border = "2px solid red"; // Optional: add border for visibility

          // Clear previous contents and append the new image to the discard slot
          discardSlot.innerHTML = ""; // Clear previous images
          discardSlot.appendChild(discardImg); // Append the new image
          // remove card from playerHand & re-displayPlayerCards
          const index = playerHand.indexOf(card.code);
          if (index != -1) {
            playerHand.splice(index, 1);
            displayPlayerCards(playerHand);
          }
        }
      });
      cardDisplay.appendChild(cardDiv);
    }
  });
};

// method adds image(s) to side container
// one image denotes the deck
// other image denotes discard pile
function addSideContainer() {
  // Clear existing images (if necessary)
  deckSlot.innerHTML = "";
  discardSlot.innerHTML = "";

  // intialize deck slot image
  const img = document.createElement("img");
  img.src = cardBackImage;
  img.style.width = "100%";
  img.style.height = "auto";

  // Add click event listener to the image
  img.addEventListener("click", function () {
    console.log("Image clicked!"); // Replace with desired functionality
  });

  // Append the image to the deck slot
  deckSlot.appendChild(img);

  // initialize discard slot image
  const img2 = document.createElement("img");
  img2.src = "./images/Blank-Playing-Card.png";
  img2.style.width = "100%";
  img2.style.height = "auto";

  // Add click event listener to the image
  img2.addEventListener("click", function () {
    console.log("Image clicked!"); // Replace with desired functionality
  });

  // Append the image to the discard slot
  discardSlot.appendChild(img2);
}

// Example usage

overlayImage = "./images/chipBlue_border_small.png";
// Call the function to display cards
displayCards();

// sample player hand, blue player
let player1Hand = ["2D", "3D", "4D", "AC", "2C", "QH", "JD"];
displayPlayerCards(player1Hand);
highlightCards(player1Hand, "./images/blue_check_mark_small.png");

// removeCardOverlays("./images/blue_check_mark_small.png");
addSideContainer();
