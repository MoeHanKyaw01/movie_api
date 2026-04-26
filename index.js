const express = require("express");
const cors = require("cors");
const movieRoutes = require("./api/movies");
const authRoutes = require("./api/auth");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Movie API is running" });
});

app.use("/api/movies", movieRoutes);

app.use("/api/auth", authRoutes); 

const PORT = 3333;

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;