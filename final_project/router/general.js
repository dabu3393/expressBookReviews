const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    if (isValid(username)) {
      return res.status(409).json({ message: "Username already exists" });
    }
  
    users.push({ "username": username, "password": password });
    return res.status(201).json({ message: "User successfully registered. Now you can login" });
  });

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    // Wrapping the asynchronous operation in a Promise
    const getBooksPromise = new Promise((resolve, reject) => {
      try {
        const booksList = Object.values(books).map((book) => {
          return {
            title: book.title,
            author: book.author,
          };
        });
        resolve(booksList);
      } catch (error) {
        reject(error);
      }
    });
  
    // Use Promise callbacks to handle the asynchronous operation
    getBooksPromise
      .then(booksList => {
        res.json({ books: booksList });
      })
      .catch(error => {
        res.status(500).json({ message: 'Error fetching books', error: error.message });
      });
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
  
    // Wrapping the asynchronous operation in a Promise
    const getBookDetailsPromise = new Promise((resolve, reject) => {
      try {
        if (books[isbn]) {
          const bookDetails = {
            title: books[isbn].title,
            author: books[isbn].author,
            reviews: books[isbn].reviews,
          };
          resolve(bookDetails);
        } else {
          reject(new Error('Book not found'));
        }
      } catch (error) {
        reject(error);
      }
    });
  
    // Use Promise callbacks to handle the asynchronous operation
    getBookDetailsPromise
      .then(bookDetails => {
        res.json({ book: bookDetails });
      })
      .catch(error => {
        res.status(404).json({ message: error.message });
      });
  });

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
  
    // Wrapping the asynchronous operation in a Promise
    const getBooksByAuthorPromise = new Promise((resolve, reject) => {
      try {
        const booksByAuthor = Object.keys(books)
          .filter((isbn) => books[isbn].author === author)
          .map((isbn) => {
            return {
              title: books[isbn].title,
              author: books[isbn].author,
            };
          });
  
        if (booksByAuthor.length > 0) {
          resolve(booksByAuthor);
        } else {
          reject(new Error('Books by author not found'));
        }
      } catch (error) {
        reject(error);
      }
    });
  
    // Use Promise callbacks to handle the asynchronous operation
    getBooksByAuthorPromise
      .then(booksByAuthor => {
        res.json({ books: booksByAuthor });
      })
      .catch(error => {
        res.status(404).json({ message: error.message });
      });
  });

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
  
    // Wrapping the asynchronous operation in a Promise
    const getBooksByTitlePromise = new Promise((resolve, reject) => {
      try {
        const booksByTitle = Object.keys(books)
          .filter((isbn) => books[isbn].title === title)
          .map((isbn) => {
            return {
              title: books[isbn].title,
              author: books[isbn].author,
            };
          });
  
        if (booksByTitle.length > 0) {
          resolve(booksByTitle);
        } else {
          reject(new Error('Books by title not found'));
        }
      } catch (error) {
        reject(error);
      }
    });
  
    // Use Promise callbacks to handle the asynchronous operation
    getBooksByTitlePromise
      .then(booksByTitle => {
        res.json({ books: booksByTitle });
      })
      .catch(error => {
        res.status(404).json({ message: error.message });
      });
  });
  
// Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
  
    if (books[isbn]) {
      const bookReviews = books[isbn].reviews;
      return res.json({ reviews: bookReviews });
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  });

module.exports.general = public_users;
