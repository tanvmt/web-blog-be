// src/routes/index.js
const express = require('express');
const authRoute = require('./auth.route');
const articleRoute = require('./article.routes');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
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