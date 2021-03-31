var express = require('express');
var router = express.Router();
const userController = require('../controllers/user.controller');
const checkAuth = require("../middleware/check-auth");

router.post("/signup", userController.signUp);

router.post("/login", userController.login);

router.delete("/:id", checkAuth, userController.delete);

module.exports = router;
