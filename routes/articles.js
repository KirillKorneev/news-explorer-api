const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const regex = /^(https?:\/\/)?([\w-]{1,32}\.[\w-]{1,32})[^\s@]*$/;

const {
  getArticles, postArticle, deleteArticle,
} = require('../controllers/articles.js');

router.get('/articles', getArticles);

router.post('/articles', celebrate({
  body: Joi.object().keys({
    keyword: Joi.string().required(),
    title: Joi.string().required(),
    text: Joi.string().required(),
    date: Joi.string().required(),
    source: Joi.string().required(),
    link: Joi.string().required().pattern(regex),
    image: Joi.string().required().pattern(regex),
  }),
}), postArticle);

router.delete('/articles/:articleId', celebrate({
  params: Joi.object().keys({
    articleId: Joi.string().length(24).hex(),
  }),
}), deleteArticle);

module.exports = router;
