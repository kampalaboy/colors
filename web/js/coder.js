const cards = [
  { id: 0, name: "A♠️", face: "./public/AS.png" },
  { id: 1, name: "K♦️", face: "./public/KD.png" },
  { id: 2, name: "Q♥️", face: "./public/QH.png" },
  { id: 3, name: "Q♦️", face: "./public/QD.png" },
  { id: 4, name: "J♣️", face: "./public/JC.png" },
  { id: 5, name: "10♦️", face: "./public/10D.png" },
  { id: 6, name: "10♠️", face: "./public/10S.png" },
];

const playerCards = document.getElementById("cards-slot");
playerCards.style.display = "flex";

function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function dealtHand(deck) {
  return deck.slice(0, 2); // Deal the top two cards
}

//For the multiplayers
// function encryptCardData(card) {
//   return {
//     id: btoa(card.id.toString()), // Encode ID to Base64
//     name: btoa(card.name), // Encode name to Base64
//     face: btoa(card.face), // Encode face URL to Base64
//   };
// }

function displayCards() {
  playerCards.innerHTML = ""; // Clear previous cards
  const shuffledDeck = shuffleDeck([...cards]); // Create a shuffled copy of cards
  const hand = dealtHand(shuffledDeck);

  hand.forEach((card) => {
    const cardElement = document.createElement("img");
    cardElement.src = card.face;
    cardElement.alt = card.name;
    cardElement.style.height = "100px";
    cardElement.style.height = "100px";
    playerCards.appendChild(cardElement);
  });
}

displayCards();
new Player();
new RadarGraphics();

window.onload = function () {
  const helpfulText = document.getElementById("status");
  helpfulText.innerHTML = `
                          HIGHLY Recommend you first try Festival Game.<br/>

                          With this one you need to figure out how to use card combo<br/>
                          and a coded melody to earn points.  We are still working with<br/> 
                          particle stream!!
                          `;
};
