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

const button = document.getElementById("color");
const audioElement = document.getElementById("audio");
const instrument = document.getElementById("instrument-wrapper");

button.addEventListener("click", async () => {
  const chooseColor = Math.floor(Math.random() * backgrounds.length);
  const randomBackground = backgrounds[chooseColor];

  console.log(chooseColor);
  document.body.style.backgroundColor = randomBackground.color;

  if (randomBackground.note) {
    try {
      audioElement.src = randomBackground.note;
      audioElement.play();
      await sendClickData(randomBackground, false);
    } catch (error) {
      console.log(error);
    }
  } else {
    audioElement.pause();
    audioElement.currentTime = 0;
  }
});

function playInstrument() {
  let isTouch = false;
  let currentAudio = null;

  backgrounds.forEach((b, index) => {
    const instrumentButton = document.createElement("button");
    instrument.appendChild(instrumentButton);
    instrumentButton.style.margin = "3px";
    instrumentButton.style.height = "150px";

    const player = async (buttonData) => {
      if (b.note) {
        instrumentButton.style.backgroundColor = b.color;
        try {
          if (currentAudio) {
            try {
              audioElement.pause();
              audioElement.currentTime = 0;
              await currentAudio;
            } catch (error) {
              alert("Woah...You are typing too fast!!, Refresh the page.");
            }
          }
          audioElement.src = b.note;
          currentAudio = audioElement.play();
          await currentAudio;
        } catch (error) {
          console.log(error);
          alert(error);
        }
        await sendClickData(buttonData, true);
      } else {
        audioElement.pause();
        audioElement.currentTime = 0;
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

const sendClickData = async (buttonData, fromPlayer) => {
  try {
    const response = await fetch("/api/click", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: buttonData.id,
        color: buttonData.color,
        note: buttonData.note,
        key: buttonData.key,
        fromPlayer: fromPlayer,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    updateScore(result.score);
    updatePlayerClicksLeft(result.playerClicksLeft);

    isLocked = false;
    updateGameState();
    return result;
  } catch (error) {
    console.error("Error sending click data:", error);
  }
};

async function lockPattern() {
  try {
    const response = await fetch("/api/lock", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    isLocked = true;
    updateGameState();
    return result;
  } catch (error) {
    console.error("Error locking pattern:", error);
    alert("Must be minimum 3 random");
  }
}

async function unlockPattern() {
  try {
    const response = await fetch("/api/unlock", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    isLocked = false;
    updateGameState();
    return result;
  } catch (error) {
    console.error("Error locking pattern:", error);
  }
}

async function resetGame() {
  try {
    const response = await fetch("/api/reset", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    isLocked = false;
    document.body.style.backgroundColor = "";
    updateGameState();
    const result = await response.json();
    updateScore(result.score);
    updatePlayerClicksLeft(result.playerClicksLeft);
  } catch (error) {
    console.error("Error resetting game:", error);
  }
}

function updateScore(score) {
  const scoreElement = document.getElementById("score");
  if (scoreElement) {
    scoreElement.textContent = `Score: ${score}`;
  }
}

function updatePlayerClicksLeft(clicks) {
  const clicksElement = document.getElementById("clicks");
  if (clicksElement) {
    clicksElement.textContent = `Clicks: ${clicks}`;
  }
}

function updateGameState() {
  const lockButton = document.getElementById("lockButton");
  const statusText = document.getElementById("status");

  if (isLocked) {
    lockButton.disabled = true;
    statusText.textContent = "Match the pattern!";
    document.body.style.backgroundColor = "";
  } else {
    lockButton.disabled = false;
    statusText.innerHTML = `1. Create a pattern with color button (minimum 3 clicks)</br>
                        2. Lock the pattern </br>
                        3. Play the pattern on the piano for points </br></br>
    Make pattern as long as you like.  Longer pattern matching means more points!!`;
  }
}

playInstrument();
