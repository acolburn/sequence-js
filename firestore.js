import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  remove,
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
  initializeGameListener,
};

// function pushValueToDB(inputValue) {
//   push(gameInDB, inputValue);
// }

function updateCurrentPlayer(newPlayer) {
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

function updateDeckId(deckId) {
  const deckIdRef = ref(database, "game/deckId");
  set(deckIdRef, deckId);
}

function updateGreenPlayerHand(greenPlayerHand) {
  const deckIdRef = ref(database, "game/greenPlayerHand");
  set(deckIdRef, greenPlayerHand);
}

function updateBluePlayerHand(bluePlayerHand) {
  const deckIdRef = ref(database, "game/bluePlayerHand");
  set(deckIdRef, bluePlayerHand);
}

function updateBoardState(boardState) {
  const deckIdRef = ref(database, "game/boardState");
  set(deckIdRef, boardState);
}

// Function to initialize the game listener
const initializeGameListener = () => {
  //   const gameInDB = ref(database, "game");
  onValue(
    gameInDB,
    (snapshot) => {
      return snapshot.val();
      //   const gameData = snapshot.val();
      //   console.log("bluePlayerHand:", gameData.bluePlayerHand);
      //   console.log("greenPlayerHand:", gameData.greenPlayerHand);
      //   console.log("currentPlayer:", gameData.currentPlayer);
      //   console.log("deckId:", gameData.deckId);
    },
    (error) => {
      console.error("Error retrieving game data:", error);
    },
  );
};
