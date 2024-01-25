const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;


const app = express();

app.use(express.json());

app.use(session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

app.use("/customer/auth/*", function auth(req, res, next) {
  if (req.session.authorization) {
    const token = req.session.authorization.accessToken;

    try {
      const decodedToken = jwt.verify(token, 'access');

      // If the token is valid, you can proceed with the next middleware or route handler
      req.user = decodedToken; // Assuming you want to store the decoded token in the request
      next();
    } catch (error) {
      // If the token is invalid, return an unauthorized response
      res.status(403).json({ message: 'User not authenticated' });
    }
  } else {
    // If there's no session data, return an unauthorized response
    res.status(403).json({ message: 'User not logged in' });
  }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
