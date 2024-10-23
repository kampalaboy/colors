// // Data for the game
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

// // Cached DOM Elements
// const randomColorButton = document.getElementById("color");
// const audioElement = document.getElementById("audio");
// const instrument = document.getElementById("instrument-wrapper");
// const scoreElement = document.getElementById("score");
// const clicksElement = document.getElementById("clicks");
// const lockButton = document.getElementById("lockButton");
// const statusText = document.getElementById("status");

// let socket;
// function connectWebSocket() {
//   socket = new WebSocket("/ws");
//   socket.OPEN;
//   socket.onopen = function () {
//     console.log("WebSocket connection opened");
//   };

//   socket.onmessage = function (event) {
//     const data = JSON.parse(event.data);
//     if (data.action === "update") {
//       updateGameState(data.score, data.playerClicksLeft, data.isLocked);
//     }
//   };

//   socket.onclose = function (event) {
//     console.log(`WebSocket closed: ${event.code} (${event.reason})`);
//     // Try to reconnect after a delay
//     setTimeout(connectWebSocket, 3000); // 3 seconds delay
//   };

//   socket.onerror = function (error) {
//     console.error("WebSocket error:", error);
//     socket.close(); // Close the connection and try to reconnect
//   };
// }

// // Initiate connection
// connectWebSocket();

// // Send a click event
// async function sendClick(clickData, fromPlayer) {
//   socket.onopen = () =>
//     socket.send(
//       JSON.stringify({
//         action: "click",
//         buttonClick: {
//           fromPlayer: fromPlayer,
//           ...clickData,
//         },
//       })
//     );
//   console.log(fromPlayer);
// }

// // Send a lock event
// function lockPattern() {
//   socket.send(JSON.stringify({ action: "lock" }));
// }

// // Send a reset event
// function resetGame() {
//   const message = JSON.stringify({
//     action: "reset",
//     score: 0,
//     playerClicksLeft: 0,
//   });

//   // Check if WebSocket is open and ready to send the message
//   if (socket.readyState === WebSocket.OPEN) {
//     socket.send(message);
//   } else {
//     // If the WebSocket is not open, wait for it to open, then send the reset message
//     socket.onopen = () => socket.send(message);
//   }

//   // Clear background and update game state visually
//   document.body.style.backgroundColor = "";

//   updateGameState(0, 0, false);
// }
// // Update Functions
// function updateScore(newScore) {
//   if (scoreElement) {
//     scoreElement.textContent = `Score: ${newScore}`;
//   }
// }

// function updatePlayerClicksLeft(newClicks) {
//   if (clicksElement) {
//     clicksElement.textContent = `Clicks: ${newClicks}`;
//   }
// }

// // // Game State Update
// function updateGameState(s, c, l) {
//   lockButton.disabled = l;
//   statusText.innerHTML = l
//     ? "Match the pattern!"
//     : `1. Create a pattern with color button (minimum 3 clicks)</br>
//          2. Lock the pattern </br>
//          3. Play the pattern on the piano for points </br></br>
//          Make pattern as long as you like. Longer pattern matching means more points!!`;

//   updateScore(s);
//   updatePlayerClicksLeft(c);
//   // console.log(`Score: ${s}, Player Clicks Left: ${c}`);
// }

// //Random Color Picker

// randomColorButton.addEventListener("click", async () => {
//   const chooseColor = Math.floor(Math.random() * backgrounds.length);
//   const randomBackground = backgrounds[chooseColor];

//   console.log(chooseColor);
//   document.body.style.backgroundColor = randomBackground.color;

//   if (randomBackground.note) {
//     audioElement.src = randomBackground.note;

//     var currentAudio = audioElement.play();
//     if (currentAudio !== undefined) {
//       currentAudio
//         .then((_) => {
//           currentAudio;
//         })
//         .catch((error) => {
//           console.log(error);
//         });
//     }
//     await sendClick(randomBackground, false);
//   }
// });

// // Setup Instrument Buttons
// function playInstrument() {
//   let currentAudio = null;

//   backgrounds.forEach((b, index) => {
//     const instrumentButton = document.createElement("button");
//     instrument.appendChild(instrumentButton);
//     instrumentButton.style.margin = "3px";
//     instrumentButton.style.height = "150px";

//     const player = async (buttonData) => {
//       if (b.note) {
//         instrumentButton.style.backgroundColor = b.color;

//         audioElement.src = b.note;
//         var currentAudio = audioElement.play();

//         var currentAudio = audioElement.play();
//         if (currentAudio !== undefined) {
//           currentAudio
//             .then((_) => {
//               currentAudio;
//             })
//             .catch((error) => {
//               console.log(error);
//             });
//         }
//         await sendClick(buttonData, true);
//       }
//     };

//     instrumentButton.addEventListener("mousedown", () => {
//       player(b);
//     });

//     instrumentButton.addEventListener("touchstart", (event) => {
//       event.preventDefault(); // Prevent default behavior for touch
//       player(b);
//     });

//     window.addEventListener("keydown", (event) => {
//       if (event.key === b.key && !event.repeat) {
//         player(b);
//       }
//     });

//     instrumentButton.addEventListener("mouseup", () => {
//       instrumentButton.style.backgroundColor = "";
//     });

//     window.addEventListener("keyup", (event) => {
//       if (event.key === b.key) {
//         instrumentButton.style.backgroundColor = "";
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
//   });
// }

// //let userHasInteracted = false; // Flag to track user interaction

// window.onload = function () {
//   updateGameState(0, 0, false);
// };
// resetGame();
// playInstrument();
// // Update Functions
// function updateScore(newScore) {
//   if (scoreElement) {
//     scoreElement.textContent = `Score: ${newScore}`;
//   }
// }

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

// const audioElement = document.getElementById("audio");
// const instrument = document.getElementById("instrument-wrapper");
// const scoreElement = document.getElementById("score");
// const clicksElement = document.getElementById("clicks");
// const lockButton = document.getElementById("lockButton");
// const statusText = document.getElementById("status");

// function updateScore(newScore) {
//   if (scoreElement) {
//     scoreElement.textContent = `Score: ${newScore}`;
//   }
// }

// function updatePlayerClicksLeft(newClicks) {
//   if (clicksElement) {
//     clicksElement.textContent = `Clicks: ${newClicks}`;
//   }
// }

// // // Game State Update
// function updateGameState(s, c) {
//   statusText.innerHTML =
//     "Get into a free server and play the color coding game!!!!";

//   updateScore(s);
//   updatePlayerClicksLeft(c);
//   // console.log(`Score: ${s}, Player Clicks Left: ${c}`);
// }

// window.onload = function () {
//   updateGameState(0, 0);
// };

// window.addEventListener("load", function (evt) {
//   var output = document.getElementById("output");
//   var input = document.getElementById("input");
//   var ws;

//   var print = function (message) {
//     var d = document.createElement("div");
//     d.textContent = message;
//     output.appendChild(d);
//     output.scroll(0, output.scrollHeight);
//   };

//   document.getElementById("open").onclick = function (evt) {
//     if (ws) {
//       return false;
//     }
//     ws = new WebSocket("/ws");
//     ws.onopen = function (evt) {
//       print("OPEN");
//     };
//     ws.onclose = function (evt) {
//       print("CLOSE");
//       ws = null;
//     };
//     ws.onmessage = function (evt) {
//       // print("RESPONSE: " + evt.data);
//       console.log("Message received:", evt.data);
//       const data = JSON.parse(evt.data);
//       if (data.action === "update") {
//         updateGameState(data.score, data.playerClicksLeft);
//       }
//       if (data.action == "updatePlayersOnline") {
//         displayOnlinePlayers(data.onlinePlayers);
//       }
//     };
//     ws.onerror = function (evt) {
//       print("ERROR: " + evt.data);
//     };
//     return false;
//   };

//   document.getElementById("loginButton").onclick = function (evt) {
//     if (!ws) {
//       return false;
//     }
//     const usernameInput = document.getElementById("username");
//     const username = usernameInput.value.trim();
//     ws.send(
//       JSON.stringify({
//         action: "login",
//         username: username,
//       })
//     );
//     return false;
//   };

//   document.getElementById("color").onclick = function (evt) {
//     if (!ws) {
//       return false;
//     }
//     const chooseColor = Math.floor(Math.random() * backgrounds.length);
//     const randomBackground = backgrounds[chooseColor];
//     document.body.style.backgroundColor = randomBackground.color;
//     ws.send(
//       JSON.stringify({
//         action: "click",
//         buttonClick: {
//           fromPlayer: false,
//           ...randomBackground,
//         },
//       })
//     );
//     // print(
//     //   JSON.stringify({
//     //     action: "click",
//     //     buttonClick: {
//     //       fromPlayer: false,
//     //       ...randomBackground,
//     //     },
//     //   })
//     // );
//     return false;
//   };

//   // Setup Instrument Buttons
//   function playInstrument() {
//     backgrounds.forEach((b, index) => {
//       const instrumentButton = document.createElement("button");
//       instrument.appendChild(instrumentButton);
//       instrumentButton.style.margin = "3px";
//       instrumentButton.style.height = "150px";

//       const player = async () => {
//         if (b.note) {
//           instrumentButton.style.backgroundColor = b.color;

//           audioElement.src = b.note;
//           var currentAudio = audioElement.play();

//           var currentAudio = audioElement.play();
//           if (currentAudio !== undefined) {
//             currentAudio
//               .then((_) => {
//                 currentAudio;
//               })
//               .catch((error) => {
//                 console.log(error);
//               });
//           }
//         }
//         if (!ws) {
//           return false;
//         }
//         ws.send(
//           JSON.stringify({
//             action: "click",
//             buttonClick: {
//               fromPlayer: true,
//               ...b,
//             },
//           })
//         );
//       };

//       instrumentButton.addEventListener("mousedown", () => {
//         player();
//       });

//       instrumentButton.addEventListener("touchstart", (event) => {
//         event.preventDefault(); // Prevent default behavior for touch
//         player();
//       });

//       window.addEventListener("keydown", (event) => {
//         if (event.key === b.key && !event.repeat) {
//           player();
//         }
//       });

//       instrumentButton.addEventListener("mouseup", () => {
//         instrumentButton.style.backgroundColor = "";
//       });

//       window.addEventListener("keyup", (event) => {
//         if (event.key === b.key) {
//           instrumentButton.style.backgroundColor = "";
//         }
//       });

//       instrumentButton.addEventListener(
//         "touchend",
//         (event) => {
//           event.preventDefault();
//           instrumentButton.style.backgroundColor = "";
//         },
//         { passive: false }
//       );
//     });
//   }

//   playInstrument();

//   document.getElementById("resetButton").onclick = function (evt) {
//     if (!ws) {
//       return false;
//     }
//     const message = JSON.stringify({
//       action: "reset",
//       score: 0,
//       playerClicksLeft: 0,
//     });

//     ws.send(message);

//     // Clear background and update game state visually
//     document.body.style.backgroundColor = "";

//     updateGameState(0, 0);
//     return false;
//   };

//   // document.getElementById("send").onclick = function (evt) {
//   //   if (!ws) {
//   //     return false;
//   //   }
//   //   print("SEND: " + input.value);
//   //   ws.send(input.value);
//   //   return false;
//   // };

//   document.getElementById("close").onclick = function (evt) {
//     if (!ws) {
//       return false;
//     }
//     ws.close();
//     return false;
//   };
// });

class gameEvent {
  constructor(type, payload) {
    this.type = type;
    this.payload = payload;
  }
}
function actionEvent(evt) {
  if (evt.type === undefined) {
    alert("Game Event Not Recognised");
  }
  console.log(evt);
  switch (evt.type) {
    case "new_gamer":
      console.log("new_gamer");
      break;
    default:
      alert("Event Type Not Supported");
      break;
  }
}

function sendEvent(eventName, payload) {
  const event = new gameEvent(eventName, payload);

  conn.send(JSON.stringify(event));
}

function changeServer() {
  //const newServer = document.getElementById("server-type");
  //const usernameInput = document.getElementById("username");

  let formData = {
    workingserver: document.getElementById("server-type").value,
    username: document.getElementById("username").value,
  };

  fetch("login", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(formData),
    mode: "cors",
  })
    .then((response) => {
      if (response.ok) {
        console.log(response);
        return response.json();
      } else {
        throw "Busy!! Try Again.";
      }
    })
    .then((data) => {
      connectServer(data.username);
    })
    .catch((error) => {
      console.log(error);
    });
  return false;
}
// if (newServer != null && usernameInput != null) {
//   console.log(`You connected to ${newServer.value} server`);

//   sendEvent(
//     "new_gamer",
//     `${usernameInput.value} connected to ${newServer.value} server`
//   );
// }
// if (usernameInput != null) {
//   console.log(usernameInput.value);

//   sendEvent("new_gamer", usernameInput.value);
// }

function connectServer(gamer) {
  if (window["WebSocket"]) {
    console.log("Supported");
    console.log(gamer);
    conn = new WebSocket("wss://" + document.location.host + "/ws");
    //conn = new WebSocket("wss://" + document.location.host + "/ws");
    conn.onmessage = function (evt) {
      const data = JSON.parse(evt.data);
      const event = Object.assign(new gameEvent(), data);

      actionEvent(event);
    };
  } else {
    alert("Web Sockets Unsupported :(");
  }
}

window.onload = function () {
  document.getElementById("server-selection").onsubmit = changeServer;
};
