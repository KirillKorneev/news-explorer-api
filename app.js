require('dotenv').config();
const { celebrate, Joi, errors } = require('celebrate');

const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = 3000;
const cors = require('cors');
const articleRoutes = require('./routes/articles.js');
const userRoutes = require('./routes/users.js');

const {
  login, newUser,
} = require('./controllers/users.js');
const { requestLogger, errorLogger } = require('./middlewares/logger.js');

const mongoDbUrl = 'mongodb://localhost:27017/diplomadb';
const mongoConnectOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

mongoose.connect(mongoDbUrl, mongoConnectOptions);

const auth = require('./middlewares/auth.js');

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(requestLogger);

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().min(2).max(30),
    password: Joi.string().required().min(2).max(30),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().min(2).max(30),
    password: Joi.string().required().min(2).max(30),
    name: Joi.string().min(2).max(30),
  }),
}), newUser);

app.use(auth);
app.use('/', articleRoutes);
app.use('/', userRoutes);

app.use('*', (req, res) => {
  res.status(404).send({ message: 'The requested resource was not found!' });
});

app.use(errors());

app.use(errorLogger);

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'An error occurred on the server'
        : message,
    });

  next();
});

app.listen(PORT, () => {});
