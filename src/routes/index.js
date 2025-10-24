// src/routes/index.js
const express = require('express');
const authRoute = require('./auth.route');
const articleRoute = require('./article.routes');
const userRoute = require('./user.route');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/articles',
    route: articleRoute, 
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;