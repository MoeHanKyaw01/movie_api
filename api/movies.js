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

// GET comments by movie id
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

// POST create new comment
router.post("/:id/comments", async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment || comment.trim() === "") {
      return res.status(400).json({ message: "Comment is required" });
    }

    const [countRows] = await db.query(
      "SELECT COUNT(*) AS total FROM movie_comments WHERE movie_id = ?",
      [req.params.id]
    );

    const nextUserNumber = countRows[0].total + 1;
    const username = `Anonymous User ${nextUserNumber}`;

    const [result] = await db.query(
      "INSERT INTO movie_comments (movie_id, username, comment) VALUES (?, ?, ?)",
      [req.params.id, username, comment]
    );

    res.status(201).json({
      message: "Comment added",
      id: result.insertId,
      username: username
    });
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
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update whole movie
router.put("/:id", async (req, res) => {
  try {
    const { title, genre, description, image_url, rating } = req.body;

    const [result] = await db.query(
      "UPDATE movies SET title=?, genre=?, description=?, image_url=?, rating=? WHERE id=?",
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

// PATCH update rating only
router.patch("/:id/rating", async (req, res) => {
  try {
    const { rating } = req.body;

    const [result] = await db.query(
      "UPDATE movies SET rating=? WHERE id=?",
      [rating, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.json({ message: "Rating updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE movie
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM movies WHERE id=?",
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