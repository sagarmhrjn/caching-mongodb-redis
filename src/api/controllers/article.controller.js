const Article = require('../models/article.model');

// Create Article
exports.createArticle = async (req, res) => {
    const { title, author, content } = req.body;

    const article = new Article({
        title,
        author,
        content
    });
    try {
        await article.save();
        res.status(201)
            .json(article);
    } catch (err) {
        res.status(500)
            .json(err.message);
    }
}

/**
 * Get Articles
 * To use caching logic, we simply append .cache() to the end of our mongoose query. 
 * We also pass in expire: 10 option to expire the cache in 10 seconds.
 *  */
exports.getArticles = async (req, res) => {
    console.log(req);
    try {
        const start = new Date();
        const doc = await Article.find()
            .select("_id title author content createdAt")
            .lean()
            .cache({ expire: 10 });
        const end = new Date() - start;
        res.status(200)
            .json({
                count: doc.length,
                articles: doc,
                request: {
                    type: "GET",
                    description: "Get all articles",
                    url: "http://localhost:3000/articles"
                },
                response_time: end
            });
    } catch (err) {
        res.status(500)
            .json({ error: err })
    }

}

// Get Article by id
exports.getArticleById = async (req, res) => {
    try {
        const start = new Date();
        const doc = await Article.findById(req.params.id)
        .select("_id title author content createdAt")
        .lean()
        .cache({ expire: 10 });
        const end = new Date() - start;
        res.status(200)
            .json({
                article: doc,
                request: {
                    type: "GET",
                    description: "Get article by" + req.params.id,
                    url: "http://localhost:3000/article/" + req.params.id
                },
                response_time: end
            });
    } catch (err) {
        res.status(500)
            .json({ error: err })
    }

}