const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("./authMiddleware");

// REGISTER new user
router.post("/register", async (req, res) => {
  try {
    const { name, username, password, profile_image } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({
        message: "Name, username and password required",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (name, username, password, profile_image) VALUES (?, ?, ?, ?)",
      [name, username, hashedPassword, profile_image || null]
    );

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LOGIN user
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const [users] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PROFILE using token
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, name, username, profile_image, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE PROFILE
router.put("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { name, avatar } = req.body;

    if (!name || !avatar) {
      return res.status(400).json({ message: "Name and avatar are required" });
    }

    const [result] = await db.query(
      "UPDATE users SET name = ?, avatar = ? WHERE id = ?",
      [name, avatar, decoded.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

router.put("/update-profile", verifyToken, async (req, res) => {
  try {
    const { name, username, profile_image } = req.body;

    await db.query(
      "UPDATE users SET name = ?, username = ?, profile_image = ? WHERE id = ?",
      [name, username, profile_image, req.user.id]
    );

    res.json({
      message: "Profile updated successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;