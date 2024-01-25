const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{
    "username": "davis",
    "password": "password123"
}];

const isValid = (username) => {
  let usersWithSameName = users.filter((user) => {
    return user.username === username;
  });
  return usersWithSameName.length > 0;
}

const authenticatedUser = (username, password) => {
  let validUsers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validUsers.length > 0;
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    };

    return res.status(200).json({ message: "User successfully logged in" });
  } else {
    return res.status(401).json({ message: "Invalid login. Check username and password" });
  }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization?.username;
    const isbn = req.params.isbn;
    const reviewText = req.query.review;
  
    if (!username) {
      return res.status(403).json({ message: "User not logged in" });
    }
  
    if (!isbn || !reviewText) {
      return res.status(400).json({ message: "ISBN and review are required" });
    }
  
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    if (!books[isbn].reviews) {
      books[isbn].reviews = {};
    }
  
    // Check if the user already posted a review for the same ISBN
    if (books[isbn].reviews[username]) {
      // Modify the existing review
      books[isbn].reviews[username] = reviewText;
    } else {
      // Add a new review
      books[isbn].reviews[username] = reviewText;
    }
  
    return res.status(200).json({ message: "Review added or modified successfully" });
  });
  
// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization?.username;
    const isbn = req.params.isbn;
  
    if (!username) {
      return res.status(403).json({ message: "User not logged in" });
    }
  
    if (!isbn) {
      return res.status(400).json({ message: "ISBN is required" });
    }
  
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
      return res.status(404).json({ message: "Review not found for the user" });
    }
  
    // Delete the user's review for the specified ISBN
    delete books[isbn].reviews[username];
  
    return res.status(200).json({ message: "Review deleted successfully" });
  });
  
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;