const express = require("express");
const fs = require("fs");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.json());
app.use(express.static("public"));

// 🔥 INDEX FIX
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

const FILE = "data.json";

// 🔥 LOAD
function load() {
  if (!fs.existsSync(FILE)) return [];
  return JSON.parse(fs.readFileSync(FILE));
}

// 🔥 SAVE
function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// 🔥 SOCKET
io.on("connection", (socket) => {
  console.log("User verbunden");
  socket.emit("update", load());
});

// 🔥 NEUE AKTE
app.post("/akten", (req, res) => {
  const data = load();
  data.push(req.body);
  save(data);
  io.emit("update", data);
  res.sendStatus(200);
});

// 🔥 NEUER FALL
app.post("/fall/:id", (req, res) => {
  const data = load();

  if (!data[req.params.id]) return res.sendStatus(404);

  if (!data[req.params.id].faelle) {
    data[req.params.id].faelle = [];
  }

  data[req.params.id].faelle.push(req.body);

  save(data);
  io.emit("update", data);
  res.sendStatus(200);
});

// 🔥 DEBUG (optional)
app.get("/data.json", (req, res) => {
  res.sendFile(__dirname + "/data.json");
});

// 🔥 START
http.listen(3000, () => {
  console.log("Server läuft auf Port 3001");
});