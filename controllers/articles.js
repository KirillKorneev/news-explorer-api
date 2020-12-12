const Article = require('../models/article.js');
const { NotFoundError } = require('../utils/NotFoundError.js');
const { InvalidError } = require('../utils/InvalidError.js');

const getArticles = (req, res, next) => {
  Article.find({})
    .populate('owner')
    .then((data) => res.status(200).send(data))
    .catch((err) => next(err));
};

const postArticle = (req, res, next) => {
  const {
    keyword,
    title,
    text,
    data,
    source,
    link,
    image,
  } = req.body;
  const { id } = req.user;
  Article.create({
    keyword, title, text, data, source, link, image, owner: id,
  })
    .then((article) => {
      res.status(200).send({ data: article });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const error = InvalidError('Validation Error');
        next(error);
      } else {
        next(err);
      }
    });
};

const deleteArticle = (req, res, next) => {
  Article.findById(req.params.articleId)
    .orFail(() => {
      const error = new NotFoundError('There is no such article');
      throw error;
    })
    .then((article) => {
      if (article.owner.toString() === req.user.id) {
        Article.findByIdAndRemove(req.params.articleId)
          .then((articleOne) => {
            res.status(200).send({ data: articleOne });
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
        const error = new InvalidError('It is not your article');
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
