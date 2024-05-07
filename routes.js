const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const connection = require("./connection");

const router = express.Router();

//Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden" });
    }
    req.user = { userId: decoded.userId }; // Add user ID to request object
    next();
  });
}

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const insertUserQuery = "INSERT INTO user (email, password) VALUES (?, ?)";
    connection.query(
      insertUserQuery,
      [email, hashedPassword],
      function (err, results) {
        if (err) {
          console.error("Error creating user:", err);
          return res.status(500).json({ error: "Failed to create user" });
        }
        console.log("User created successfully.");
        res.status(201).json({ message: "User created successfully" });
      }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const getUserQuery = "SELECT * FROM user WHERE email = ?";
    connection.query(getUserQuery, [email], async function (err, results) {
      if (err) {
        console.error("Error fetching user:", err);
        return res.status(500).json({ error: "Failed to login" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Incorrect password" });
      }
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.json({ token });
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

router.post("/todo", authenticateToken, (req, res) => {
  const { title, description } = req.body;
  const userId = req.user.userId; // Extracted from JWT payload
  const insertTodoQuery =
    "INSERT INTO todo (title, description, user_id) VALUES (?, ?, ?)";
  connection.query(
    insertTodoQuery,
    [title, description, userId],
    function (err, results) {
      if (err) {
        console.error("Error creating todo:", err);
        return res.status(500).json({ error: "Failed to create todo" });
      }
      console.log("Todo created successfully.");
      res.status(201).json({ message: "Todo created successfully" });
    }
  );
});

router.get("/todos", authenticateToken, (req, res) => {
  const userId = req.user.userId; // Extracted from JWT payload
  const selectTodosQuery = "SELECT * FROM todo WHERE user_id = ?";
  connection.query(selectTodosQuery, [userId], function (err, results) {
    if (err) {
      console.error("Error fetching todos:", err);
      return res.status(500).json({ error: "Failed to fetch todos" });
    }
    res.json(results);
  });
});

router.get("/todos/:id", authenticateToken, (req, res) => {
  const todoId = req.params.id;
  const userId = req.user.userId;
  const selectTodoQuery = "SELECT * FROM todo WHERE id = ? AND user_id = ?";
  connection.query(selectTodoQuery, [todoId, userId], function (err, results) {
    if (err) {
      console.error("Error fetching todo:", err);
      return res.status(500).json({ error: "Failed to fetch todo" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json(results[0]);
  });
});

router.put("/todos/:id", authenticateToken, (req, res) => {
  const todoId = req.params.id;
  const { title, description } = req.body;
  const userId = req.user.userId;
  const updateTodoQuery =
    "UPDATE todo SET title = ?, description = ? WHERE id = ? AND user_id = ?";
  connection.query(
    updateTodoQuery,
    [title, description, todoId, userId],
    function (err, results) {
      if (err) {
        console.error("Error updating todo:", err);
        return res.status(500).json({ error: "Failed to update todo" });
      }
      res.json({ message: "Todo updated successfully" });
    }
  );
});

router.delete("/todos/:id", authenticateToken, (req, res) => {
  const todoId = req.params.id;
  const userId = req.user.userId;
  const deleteTodoQuery = "DELETE FROM todo WHERE id = ? AND user_id = ?";
  connection.query(deleteTodoQuery, [todoId, userId], function (err, results) {
    if (err) {
      console.error("Error deleting todo:", err);
      return res.status(500).json({ error: "Failed to delete todo" });
    }
    res.json({ message: "Todo deleted successfully" });
  });
});

module.exports = router;
