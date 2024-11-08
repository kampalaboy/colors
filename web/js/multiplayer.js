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
