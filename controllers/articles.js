const Article = require('../models/article.js');
const { NotFoundError } = require('../utils/NotFoundError.js');
const { InvalidError } = require('../utils/InvalidError.js');
const { ForbiddenError } = require('../utils/ForbiddenError.js');

const getArticles = (req, res, next) => {
  Article.find({}).select('+owner')
    .then((data) => {
      const yourData = [];
      for (let i = 0; i < data.length; i++) {
        if (data[i].owner.toString() === req.user.id) {
          yourData.push(data[i]);
        }
      }
      res.status(200).send(yourData);
    })
    .catch((err) => next(err));
};

const postArticle = (req, res, next) => {
  const {
    keyword,
    title,
    text,
    date,
    source,
    link,
    image,
  } = req.body;
  const { id } = req.user;
  Article.create({
    keyword, title, text, date, source, link, image, owner: id,
  })
    .then((article) => {
      res.status(200).send({
        data: {
          keyword: article.keyword,
          title: article.title,
          text: article.text,
          date: article.date,
          source: article.source,
          link: article.link,
          image: article.image,
        },
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const error = new InvalidError('Validation Error');
        next(error);
      } else {
        next(err);
      }
    });
};

const deleteArticle = (req, res, next) => {
  Article.findById(req.params.articleId).select('+owner')
    .orFail(() => {
      const error = new NotFoundError('There is no such article');
      throw error;
    })
    .then((article) => {
      if (article.owner.toString() === req.user.id) {
        Article.findByIdAndRemove(req.params.articleId)
          .then((articleOne) => {
            res.status(200).send({
              keyword: articleOne.keyword,
              title: articleOne.title,
              text: articleOne.text,
              date: articleOne.date,
              source: articleOne.source,
              link: articleOne.link,
              image: articleOne.image,
            });
          })
          .catch((err) => {
            if (err.kind === 'ObjectId') {
              const error = new InvalidError('There is no such article');
              next(error);
            } else {
              next(err);
            }
          });
      } else {
        const error = new ForbiddenError('It is not your article');
        next(error);
      }
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = {
  getArticles, postArticle, deleteArticle,
};
