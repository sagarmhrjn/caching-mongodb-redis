const Article = require('./models/Article');

(async () => {
    const article = new Article({
        title: "ubuntu",
        author: "Sagar Maharjan",
        content: "this is a blog about ubuntu"
    });

    for (let i = 0; i < 10000; i++) {
        try {
            await article.save();
        } catch (err) {
            throw err;
        }
    }
    console.log('Completed seedig articles');

})()