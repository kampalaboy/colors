// const backgrounds = [
//   { id: 0, color: "black", note: "./public/snare.wav", key: " " },
//   { id: 1, color: "red", note: "./public/C.mp3", key: "a" },
//   { id: 2, color: "orange", note: "./public/D.mp3", key: "s" },
//   { id: 3, color: "yellow", note: "./public/E.mp3", key: "d" },
//   { id: 4, color: "green", note: "./public/F.mp3", key: "f" },
//   { id: 5, color: "blue", note: "./public/G.mp3", key: "g" },
//   { id: 6, color: "indigo", note: "./public/A.mp3", key: "h" },
//   { id: 7, color: "violet", note: "./public/B.mp3", key: "j" },
// ];

// const instrument = document.getElementById("instrument-wrapper");

// function playInstrument() {
//   let isTouch = false;
//   let currentAudio = null;

//   backgrounds.forEach((b, index) => {
//     const instrumentButton = document.createElement("button");
//     instrument.appendChild(instrumentButton);
//     instrumentButton.style.margin = "3px";
//     instrumentButton.style.height = "150px";

//     const player = async (buttonData) => {
//       if (b.note) {
//         instrumentButton.style.backgroundColor = b.color;
//         try {
//           if (currentAudio) {
//             try {
//               audioElement.pause();
//               audioElement.currentTime = 0;
//               await currentAudio;
//             } catch (error) {
//               alert("Woah...You are typing too fast!!, Refresh the page.");
//             }
//           }
//           audioElement.src = b.note;
//           currentAudio = audioElement.play();
//           await currentAudio;
//         } catch (error) {
//           console.log(error);
//           alert(error);
//         }
//         await sendClickData(buttonData, true);
//       } else {
//         audioElement.pause();
//         audioElement.currentTime = 0;
//       }
//     };
//     instrumentButton.addEventListener("mousedown", () => {
//       player(b);
//     });
//     instrumentButton.addEventListener(
//       "touchstart",
//       () => {
//         player(b);
//       },
//       { passive: false }
//     );
//     window.addEventListener("keydown", (event) => {
//       console.log(event);
//       if (event.key === b.key && !event.repeat) {
//         player(b);
//       }
//     });
//     instrumentButton.addEventListener("mouseup", () => {
//       instrumentButton.style.backgroundColor = "";
//       audioElement.pause();
//       audioElement.currentTime = 0;
//     });
//     window.addEventListener("keyup", (event) => {
//       if (event.key === b.key) {
//         instrumentButton.style.backgroundColor = "";
//         audioElement.pause();
//         audioElement.currentTime = 0;
//       }
//     });
//     instrumentButton.addEventListener(
//       "touchend",
//       (event) => {
//         event.preventDefault();
//         instrumentButton.style.backgroundColor = "";
//       },
//       { passive: false }
//     );
//     document.addEventListener("touchcancel", () => {
//       audioElement.pause();
//       audioElement.currentTime = 0;
//     });
//   });
// }

// const sendClickData = async (buttonData, fromPlayer) => {
//   try {
// const response = await fetch("/api/click", {
//   method: "POST",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   body: JSON.stringify({
//     id: buttonData.id,
//     color: buttonData.color,
//     note: buttonData.note,
//     key: buttonData.key,
//     fromPlayer: fromPlayer,
//   }),
// });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     const result = await response.json();
//     // updateScore(result.score);
//     // updatePlayerClicksLeft(result.playerClicksLeft);
//     isLocked = false;
//     updateGameState(result.score, result.playerClicksLeft, isLocked);

//     return result;
//   } catch (error) {
//     console.error("Error sending click data:", error);
//   }
// };

// async function lockPattern() {
//   try {
//     const response = await fetch("/api/lock", {
//       method: "POST",
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const result = await response.json();
//     isLocked = true;
//     updateGameState(result.score, result.playerClicksLeft, isLocked);
//     return result;
//   } catch (error) {
//     console.error("Error locking pattern:", error);
//     alert("Must be minimum 3 random");
//   }
// }

// async function unlockPattern() {
//   try {
//     const response = await fetch("/api/unlock", {
//       method: "POST",
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const result = await response.json();
//     isLocked = false;
//     updateGameState();
//     return result;
//   } catch (error) {
//     console.error("Error locking pattern:", error);
//   }
// }

// async function resetGame() {
//   try {
//     const response = await fetch("/api/reset", {
//       method: "POST",
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     isLocked = false;
//     document.body.style.backgroundColor = "";

//     const result = await response.json();
//     // updateScore(result.score);
//     // updatePlayerClicksLeft(result.playerClicksLeft);
//     updateGameState(result.score, result.playerClicksLeft, isLocked);
//   } catch (error) {
//     console.error("Error resetting game:", error);
//   }
// }

// function updateScore(newScore) {
//   //score = newScore;
//   const scoreElement = document.getElementById("score");
//   if (scoreElement) {
//     scoreElement.textContent = `Score: ${newScore}`;
//   }
// }

// function updatePlayerClicksLeft(newClicks) {
//   //clicks = newClicks;
//   const clicksElement = document.getElementById("clicks");
//   if (clicksElement) {
//     clicksElement.textContent = `Clicks: ${newClicks}`;
//   }
// }

// window.onload = function () {
//   updateScore(0);
//   updatePlayerClicksLeft(0);
// };

// function updateGameState(s, c, l) {
//   const lockButton = document.getElementById("lockButton");
//   const statusText = document.getElementById("status");

//   if (l) {
//     lockButton.disabled = true;
//     statusText.textContent = "Match the pattern!";
//     document.body.style.backgroundColor = "";
//   } else {
//     lockButton.disabled = false;

//     statusText.innerHTML = `1. Create a pattern with color button (minimum 3 clicks)</br>
//                         2. Lock the pattern </br>
//                         3. Play the pattern on the piano for points </br></br>
//     Make pattern as long as you like.  Longer pattern matching means more points!!`;
//     updateScore(s);
//     updatePlayerClicksLeft(c);
//   }
// }

// playInstrument();

// Data for the game
const backgrounds = [
  { id: 0, color: "black", note: "./public/snare.wav", key: " " },
  { id: 1, color: "red", note: "./public/C.mp3", key: "a" },
  { id: 2, color: "orange", note: "./public/D.mp3", key: "s" },
  { id: 3, color: "yellow", note: "./public/E.mp3", key: "d" },
  { id: 4, color: "green", note: "./public/F.mp3", key: "f" },
  { id: 5, color: "blue", note: "./public/G.mp3", key: "g" },
  { id: 6, color: "indigo", note: "./public/A.mp3", key: "h" },
  { id: 7, color: "violet", note: "./public/B.mp3", key: "j" },
];

// Cached DOM Elements
const randomColorButton = document.getElementById("color");
const audioElement = document.getElementById("audio");
const instrument = document.getElementById("instrument-wrapper");
const scoreElement = document.getElementById("score");
const clicksElement = document.getElementById("clicks");
const lockButton = document.getElementById("lockButton");
const statusText = document.getElementById("status");

const socket = new WebSocket("ws://localhost:8080/ws");

socket.onmessage = function (event) {
  const data = JSON.parse(event.data);
  if (data.action === "update") {
    // Update the game UI based on received game state
    console.log("Updated game state:", data);
  }
};

// Send a click event
function sendClick(clickData, fromPlayer) {
  socket.send(
    JSON.stringify({
      action: "click",
      buttonClick: clickData,
      fromPlayer: fromPlayer,
    })
  );
}

// Send a lock event
function lockGame() {
  socket.send(JSON.stringify({ action: "lock" }));
}

// Send a reset event
function resetGame() {
  socket.send(JSON.stringify({ action: "reset" }));
  updateGameState(result.score, result.playerClicksLeft, false);
  document.body.style.backgroundColor = "";
}

// Update Functions
function updateScore(newScore) {
  if (scoreElement) {
    scoreElement.textContent = `Score: ${newScore}`;
  }
}

function updatePlayerClicksLeft(newClicks) {
  if (clicksElement) {
    clicksElement.textContent = `Clicks: ${newClicks}`;
  }
}

// function showError(message) {
//   // You can replace this with your preferred error handling UI
//   console.error(message);
//   alert(message);
// }

// // Game State Update
function updateGameState(s, c, l) {
  lockButton.disabled = l;
  statusText.innerHTML = l
    ? "Match the pattern!"
    : `1. Create a pattern with color button (minimum 3 clicks)</br>
       2. Lock the pattern </br>
       3. Play the pattern on the piano for points </br></br>
       Make pattern as long as you like. Longer pattern matching means more points!!`;

  updateScore(s);
  updatePlayerClicksLeft(c);
}

// // Game Actions
// const sendClickData = async (buttonData, fromPlayer) => {
//   try {
//     const response = await fetch("/api/click", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         id: buttonData.id,
//         color: buttonData.color,
//         note: buttonData.note,
//         key: buttonData.key,
//         fromPlayer: fromPlayer,
//       }),
//     });

//     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

//     const result = await response.json();
//     updateGameState(result.score, result.playerClicksLeft, false); // Pass false for isLocked

//     return result;
//   } catch (error) {
//     showError("Error sending click data: " + error);
//   }
// };

// // Initialize Game
// async function resetGame() {
//   try {
//     const response = await fetch("/api/reset", { method: "POST" });

//     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

//     const result = await response.json();
//     updateGameState(result.score, result.playerClicksLeft, false);
//     document.body.style.backgroundColor = "";
//   } catch (error) {
//     showError("Error resetting game: " + error);
//   }
// }

//Random Color Picker

randomColorButton.addEventListener("click", async () => {
  const chooseColor = Math.floor(Math.random() * backgrounds.length);
  const randomBackground = backgrounds[chooseColor];

  console.log(chooseColor);
  document.body.style.backgroundColor = randomBackground.color;

  if (randomBackground.note) {
    try {
      audioElement.src = randomBackground.note;
      audioElement.play();
      sendClick(randomBackground, false);
    } catch (error) {
      console.log(error);
    }
  } else {
    audioElement.pause();
    audioElement.currentTime = 0;
  }
});

// Setup Instrument Buttons
function playInstrument() {
  let currentAudio = null;

  backgrounds.forEach((b, index) => {
    const instrumentButton = document.createElement("button");
    instrument.appendChild(instrumentButton);
    instrumentButton.style.margin = "3px";
    instrumentButton.style.height = "150px";

    const player = async (buttonData) => {
      // Ensure the user has interacted before trying to play
      if (!userHasInteracted) return;

      if (b.note) {
        instrumentButton.style.backgroundColor = b.color;

        // Stop previous audio if it’s still playing
        if (currentAudio) {
          audioElement.pause();
          audioElement.currentTime = 0;
        }

        audioElement.src = b.note;

        try {
          audioElement.play(); // Only play after user interaction
          sendClick(buttonData, true);
        } catch (error) {
          console.error("Error playing audio:", error);
          alert("Playback failed: " + error.message);
        }
      } else {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    };

    instrumentButton.addEventListener("mousedown", () => {
      userHasInteracted = true; // Set user interaction flag
      player(b);
    });

    instrumentButton.addEventListener("touchstart", (event) => {
      userHasInteracted = true;
      event.preventDefault(); // Prevent default behavior for touch
      player(b);
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === b.key && !event.repeat) {
        userHasInteracted = true;
        player(b);
      }
    });

    instrumentButton.addEventListener("mouseup", () => {
      instrumentButton.style.backgroundColor = "";
      audioElement.pause();
      audioElement.currentTime = 0;
    });

    window.addEventListener("keyup", (event) => {
      if (event.key === b.key) {
        instrumentButton.style.backgroundColor = "";
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    });

    instrumentButton.addEventListener(
      "touchend",
      (event) => {
        event.preventDefault();
        instrumentButton.style.backgroundColor = "";
      },
      { passive: false }
    );

    document.addEventListener("touchcancel", () => {
      audioElement.pause();
      audioElement.currentTime = 0;
    });
  });
}

let userHasInteracted = false; // Flag to track user interaction

window.onload = function () {
  updateScore(0);
  updatePlayerClicksLeft(0);
};
playInstrument();
resetGame();
