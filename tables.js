const connection = require("./connection");

function createTables() {
  const createUserTableQuery = `
    CREATE TABLE IF NOT EXISTS user (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    )
  `;

  const createTodoTableQuery = `
    CREATE TABLE IF NOT EXISTS todo (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        user_id INT NOT NULL
    )
  `;

  connection.query(createUserTableQuery, function (err, results) {
    if (err) {
      console.error("Error creating user table:", err);
      return;
    }
    console.log("User table created successfully.");
  });

  connection.query(createTodoTableQuery, function (err, results) {
    if (err) {
      console.error("Error creating todo table:", err);
      return;
    }
    console.log("Todo table created successfully.");
  });
}

module.exports = {
  createTables,
};
