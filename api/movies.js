const express = require("express");
const router = express.Router();
const db = require("../db");

// GET all movies
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM movies ORDER BY id ASC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET movie by id
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM movies WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create movie
router.post("/", async (req, res) => {
  try {
    const { title, genre, description, image_url, rating } = req.body;

    const [result] = await db.query(
      "INSERT INTO movies (title, genre, description, image_url, rating) VALUES (?, ?, ?, ?, ?)",
      [title, genre, description, image_url, rating]
    );

    res.status(201).json({
      message: "Movie created",
      id: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update movie
router.put("/:id", async (req, res) => {
  try {
    const { title, genre, description, image_url, rating } = req.body;

    const [result] = await db.query(
      "UPDATE movies SET title = ?, genre = ?, description = ?, image_url = ?, rating = ? WHERE id = ?",
      [title, genre, description, image_url, rating, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json({ message: "Movie updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE movie
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM movies WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json({ message: "Movie deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;