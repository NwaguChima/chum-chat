const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/profile', userController.profile);

router.get('/users', userController.getUsers);

router.post('/login', userController.login);

router.post('/logout', userController.logout);

router.post('/register', userController.register);

module.exports = router;
