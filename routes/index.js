const router = require('express').Router();

const articleRoutes = require('./articles.js');
const userRoutes = require('./users.js');

router.use('/', articleRoutes);
router.use('/', userRoutes);

module.exports = router;
