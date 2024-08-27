const express = require("express");
const app = express();
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");

let dbPromise = sqlite.open({
  filename: "todoApplication.db",
  driver: sqlite3.Database,
});

app.use(express.json());

// register a new user
app.post("/register", async (req, res) => {
  const db = await dbPromise;
  const { username, name, password, gender, location } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await db.get(`SELECT * FROM user WHERE username = ?`, [
    username,
  ]);
  if (user === undefined) {
    if (password.length < 5) {
      res.status(400).send("Password is too short");
    } else {
      await db.run(
        `INSERT INTO user (username, name, password, gender, location) VALUES (?, ?, ?, ?, ?)`,
        [username, name, hashedPassword, gender, location],
      );
      res.send("User created successfully");
    }
  } else {
    res.status(400).send("User already exists");
  }
});

// login a user
app.post("/login", async (req, res) => {
  const db = await dbPromise;
  const { username, password } = req.body;
  const userData = await db.get(`SELECT * FROM user WHERE username = ?`, [
    username,
  ]);
  if (userData === undefined) {
    res.status(400).send("Invalid user");
  } else {
    const isValid = await bcrypt.compare(password, userData.password);
    if (isValid) {
      res.status(200).send("Login success!");
    } else {
      res.status(400).send("Invalid password");
    }
  }
});

// change password
app.put("/change-password", async (req, res) => {
  const db = await dbPromise;
  const { username, oldPassword, newPassword } = req.body;
  const userData = await db.get(`SELECT * FROM user WHERE username = ?`, [
    username,
  ]);
  if (userData === undefined) {
    res.status(400).send("Invalid user");
  } else {
    const isValid = await bcrypt.compare(oldPassword, userData.password);
    if (!isValid) {
      res.status(400).send("Invalid current password");
    } else if (newPassword.length < 5) {
      res.status(400).send("Password is too short");
    } else {
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await db.run(`UPDATE user SET password = ? WHERE username = ?`, [
        hashedNewPassword,
        username,
      ]);
      res.send("Password updated");
    }
  }
});

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
    });

module.exports = app;
