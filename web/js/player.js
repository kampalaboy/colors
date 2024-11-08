//Data for the game

const backgrounds = [
  { id: 0, color: "black", note: "./public/S.mp3", key: " " },
  { id: 1, color: "red", note: "./public/C.mp3", key: "a" },
  { id: 2, color: "orange", note: "./public/D.mp3", key: "s" },
  { id: 3, color: "yellow", note: "./public/E.mp3", key: "d" },
  { id: 4, color: "green", note: "./public/F.mp3", key: "f" },
  { id: 5, color: "blue", note: "./public/G.mp3", key: "g" },
  { id: 6, color: "indigo", note: "./public/A.mp3", key: "h" },
  { id: 7, color: "violet", note: "./public/B.mp3", key: "j" },
];

// Controls for the game

const randomColorbutton = document.getElementById("color");
const audioElement = document.getElementById("audio");
const instrument = document.getElementById("instrument-wrapper");
const scoreElement = document.getElementById("score");
const clicksElement = document.getElementById("clicks");
const lockButton = document.getElementById("lockButton");
const statusText = document.getElementById("status");
const graphics = new Graphics([]);

// Create and preload audio elements for each note
const audioElements = {};

function preloadAudioElements() {
  backgrounds.forEach((b) => {
    const audio = new Audio();
    audio.src = b.note;
    audio.preload = "auto";
    audioElements[b.note] = audio;
  });
}

function playInstrument() {
  preloadAudioElements();

  backgrounds.forEach((b, index) => {
    const instrumentButton = document.createElement("button");
    instrument.appendChild(instrumentButton);

    instrumentButton.id = `piano-key-${b.id}`;
    // instrumentButton.style.height = "150px";
    // instrumentButton.style.width = "2px";
    instrumentButton.classList.add("instrument-button");

    const player = async (buttonData) => {
      if (b.note) {
        instrumentButton.style.backgroundColor = b.color;

        // Use the preloaded audio element
        const audio = audioElements[b.note];
        audio.currentTime = 0; // Reset playback position
        var currentAudio = audio.play();

        if (currentAudio !== undefined) {
          currentAudio.catch((error) => {
            console.log(error);
          });
        }

        const clickData = {
          id: b.id,
          note: b.note,
          color: b.color,
          key: b.key,
          fromPlayer: true,
        };

        sendEvent("new_clicks", clickData);
        graphics.drawNoteOnPress(b.note, b.key, b.color);
      }
    };
    instrumentButton.addEventListener("mousedown", () => {
      player(b);
    });
    instrumentButton.addEventListener(
      "touchstart",
      () => {
        player(b);
      },
      { passive: false }
    );
    window.addEventListener("keydown", (event) => {
      console.log(event);
      if (event.key === b.key && !event.repeat) {
        player(b);
      }
    });
    instrumentButton.addEventListener("mouseup", () => {
      instrumentButton.style.backgroundColor = "";
    });
    window.addEventListener("keyup", (event) => {
      if (event.key === b.key) {
        instrumentButton.style.backgroundColor = "";
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
  });
}

playInstrument();

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
      console.log("new gamer");
      break;
    case "new_clicks":
      console.log("new click");
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

window.onload = function () {
  const helpfulText = document.getElementById("status");
  helpfulText.innerHTML = `
                          1. You may want to play around with the piano</br> 
                          2. Make explosions for points</br>
                          3. A little music theory won't hurt 
                          `;

  if (window["WebSocket"]) {
    console.log("Supported");

    conn = new WebSocket("wss://" + document.location.host + "/ws");

    conn.onmessage = function (evt) {
      const data = JSON.parse(evt.data);

      const event = Object.assign(new gameEvent(), data);
      actionEvent(event);

      console.log(evt);
    };
  } else {
    alert("Web Sockets Unsupported :(");
  }
};
