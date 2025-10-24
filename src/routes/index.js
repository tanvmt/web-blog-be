const express = require("express");
const authRoute = require("./auth.route");
const articleRoute = require("./article.routes");
const commentRoute = require("./comment.route");
const userRoute = require("./user.route");

const router = express.Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: "/articles",
    route: articleRoute,
  },
  {
    path: "/comments",
    route: commentRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
