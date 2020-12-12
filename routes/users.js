const router = require('express').Router();
const {
  getMyInfo,
} = require('../controllers/users.js');

router.get('/users/me', getMyInfo);

module.exports = router;
