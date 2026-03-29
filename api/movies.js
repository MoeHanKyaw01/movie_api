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
    const { title, genre, description, image_url, rating, likes } = req.body;

    const [result] = await db.query(
      "INSERT INTO movies (title, genre, description, image_url, rating, likes) VALUES (?, ?, ?, ?, ?, ?)",
      [title, genre, description, image_url, rating, likes ?? 0]
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
    const { title, genre, description, image_url, rating, likes } = req.body;

    const [result] = await db.query(
      "UPDATE movies SET title = ?, genre = ?, description = ?, image_url = ?, rating = ?, likes = ? WHERE id = ?",
      [title, genre, description, image_url, rating, likes ?? 0, req.params.id]
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

// PATCH like movie (increment likes by 1)
router.patch("/:id/like", async (req, res) => {
  try {
    const [result] = await db.query(
      "UPDATE movies SET likes = likes + 1 WHERE id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const [rows] = await db.query(
      "SELECT likes FROM movies WHERE id = ?",
      [req.params.id]
    );

    res.json({
      message: "Movie liked",
      likes: rows[0].likes,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET comments for a movie
router.get("/:id/comments", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM movie_comments WHERE movie_id = ? ORDER BY id ASC",
      [req.params.id]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST add comment for a movie
router.post("/:id/comments", async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment || comment.trim() === "") {
      return res.status(400).json({ message: "Comment is required" });
    }

    const [movieRows] = await db.query(
      "SELECT id FROM movies WHERE id = ?",
      [req.params.id]
    );

    if (movieRows.length === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }

    const [countRows] = await db.query(
      "SELECT COUNT(*) AS total FROM movie_comments WHERE movie_id = ?",
      [req.params.id]
    );

    const nextUserNumber = countRows[0].total + 1;
    const username = `Anonymous User ${nextUserNumber}`;

    const [result] = await db.query(
      "INSERT INTO movie_comments (movie_id, username, comment) VALUES (?, ?, ?)",
      [req.params.id, username, comment.trim()]
    );

    res.status(201).json({
      message: "Comment added",
      id: result.insertId,
      username,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;