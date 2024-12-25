const express = require('express');
const router = express.Router();
const {getUser, updateUser, deleteUser} = require('../controllers/userController');
const {auth} = require('../middlewares/auth');

router.get('/', auth, getUser);
router.put('/', auth, updateUser);
router.delete('/', auth, deleteUser);

module.exports = router;