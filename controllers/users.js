const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
require('dotenv').config();

const { NODE_ENV, JWT_SECRET } = process.env;

const { NotFoundError } = require('../utils/NotFoundError.js');
const { InvalidError } = require('../utils/InvalidError.js');
const { WrongAuth } = require('../utils/WrongAuth.js');
const { ConflictError } = require('../utils/ConflictError.js');

const getMyInfo = (req, res, next) => {
  User.findOne({ _id: req.user.id })
    .orFail(() => {
      const error = new NotFoundError('There is no user with such id');
      throw error;
    })
    .then((userPer) => {
      res.send({ name: userPer.name, email: userPer.email });
      return userPer;
    })
    .catch((err) => {
      if (err.kind === 'ObjectId') {
        const error = new InvalidError('Wrong id');
        next(error);
      } else {
        next(err);
      }
    });
};

const newUser = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const err = new InvalidError('Неверный логин или пароль!');
    throw err;
  }

  User.findOne({ email })
    .then((user) => {
      if (user) {
        const err = new ConflictError('Такой пользователь уже есть');
        throw err;
      }
      return bcrypt.hash(password, 10);
    })
    .then((hash) => {
      User.create({
        ...req.body,
        password: hash,
      })
        .then(({ _id }) => res.status(200).send({ _id }))
        .catch((err) => {
          if (err.name === 'ValidationError') {
            const error = new InvalidError('Validation error');
            next(error);
          } else if (err.kind === 'ObjectId') {
            const error = new InvalidError('Wrong id');
            next(error);
          } else {
            next(err);
          }
        });
    })
    .catch((err) => { next(err); });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new InvalidError('Неверный логин или пароль!');
    throw (error);
  }

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        const error = new WrongAuth('Неверный логин или пароль!');
        throw (error);
      }

      bcrypt.compare(password, user.password)
      .then((matched) => {
        if (matched) {
          const token = jwt.sign({
            id: user._id,
          }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
          return res.send({
            token,
          });
        }
        const error = new WrongAuth('Неверный логин или пароль!');
        throw (error);
      })
      .catch((err) => {
        next(err);
      });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = {
  getMyInfo, login, newUser,
};
