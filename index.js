// index.js

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const connection = require("./connection");
const routes = require("./routes");
const { createTables } = require("./tables");

const app = express();
const PORT = process.env.PORT || 4040;

app.use(bodyParser.json());

app.use("/", routes);
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome To PlanetScale",
  });
});

connection.connect(function (err) {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to database.");

  createTables();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  });
});

process.on("SIGINT", () => {
  connection.end();
  process.exit();
});
