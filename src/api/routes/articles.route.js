var express = require('express');
var router = express.Router();
const articleController = require('../controllers/article.controller');

router.get('/', articleController.getArticles);

router.get('/:id', articleController.getArticleById);

router.post('/', articleController.createArticle);

module.exports = router;
