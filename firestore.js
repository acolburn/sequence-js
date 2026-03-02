import { updateGameValues } from "./index.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  remove,
  get,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
  databaseURL: "https://sequence-8f779-default-rtdb.firebaseio.com/",
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const gameInDB = ref(database, "game");
export {
  database,
  //   pushValueToDB,
  updateCurrentPlayer,
  updateDeckId,
  updateGreenPlayerHand,
  updateBluePlayerHand,
  updateBoardState,
  updateDiscardImage,
  initializeGameListener,
  updateNewGame,
  startNewGame,
  joinNewGame,
  getPlayerIdColor,
};

// Global variable to hold the game state
let gameState = {};

async function updateCurrentPlayer(newPlayer) {
  // Create a reference to the currentPlayer node
  const currentPlayerRef = ref(database, "game/currentPlayer");
  // Update the value to the new player color
  set(currentPlayerRef, newPlayer);
  // .then(() => {
  //   console.log(`Current player updated to: ${newPlayer}`);
  // })
  // .catch((error) => {
  //   console.error("Error updating current player:", error);
  // });
}

async function updateDiscardImage(discard_image) {
  const deckIdRef = ref(database, "game/discard_image");
  set(deckIdRef, discard_image);
}

async function updateDeckId(deckId) {
  const deckIdRef = ref(database, "game/deckId");
  set(deckIdRef, deckId);
}

async function updateGreenPlayerHand(greenPlayerHand) {
  //   console.log("updating green player hand");
  const deckIdRef = ref(database, "game/greenPlayerHand");
  set(deckIdRef, greenPlayerHand);
}

async function updateBluePlayerHand(bluePlayerHand) {
  //   console.log("update blue player hand");
  const deckIdRef = ref(database, "game/bluePlayerHand");
  set(deckIdRef, bluePlayerHand);
}

async function updateBoardState(boardState) {
  const deckIdRef = ref(database, "game/boardState");
  set(deckIdRef, boardState);
}

async function startNewGame(playerId) {
  // set game initiator to bluePlayerId
  let db = ref(database, "game/bluePlayerId");
  await set(db, playerId);
  // clear greenPlayerId
  db = ref(database, "game/greenPlayerId");
  await set(db, "");
}

async function joinNewGame(playerId) {
  let db = ref(database, "game/greenPlayerId");
  await set(db, playerId);
}

// Async function to find the color of the player ID
async function getPlayerIdColor(playerId) {
  // Create references to player IDs
  const dbBlue = ref(database, "game/bluePlayerId");
  const dbGreen = ref(database, "game/greenPlayerId");

  try {
    // Get the values
    const bluePlayerSnapshot = await get(dbBlue);
    const bluePlayerId = bluePlayerSnapshot.val();

    const greenPlayerSnapshot = await get(dbGreen);
    const greenPlayerId = greenPlayerSnapshot.val();

    // Compare IDs to determine color
    if (playerId === bluePlayerId) {
      return "blue";
    } else if (playerId === greenPlayerId) {
      return "green";
    } else {
      return "none";
    }
  } catch (error) {
    console.error("Error fetching player IDs: ", error);
    return "error"; // Optionally handle errors
  }
}

async function updateNewGame(boardState, bluePlayerHand, greenPlayerHand) {
  let db = ref(database, "game/boardState");
  await set(db, boardState); // Ensure this is awaited
  db = ref(database, "game/bluePlayerHand");
  await set(db, bluePlayerHand); // Ensure this is awaited
  db = ref(database, "game/greenPlayerHand");
  await set(db, greenPlayerHand); // Ensure this is awaited
  db = ref(database, "game/currentPlayer");
  await set(db, "blue"); // Ensure this is awaited
  db = ref(database, "game/discard_image");
  await set(db, "");
}

// Function to initialize the game listener
const initializeGameListener = () => {
  //   const gameInDB = ref(database, "game");
  onValue(
    gameInDB,
    (snapshot) => {
      // Update global gameState with the database snapshot
      gameState = snapshot.val() || {}; // Ensure gameState is not null
      // Now, call a function to update UI or handle logic
      updateGameValues(gameState);
    },
    (error) => {
      console.error("Error retrieving game data:", error);
    },
  );
};
