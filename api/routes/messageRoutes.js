const express = require('express');
const messageController = require('../controllers/messageController');

const router = express.Router();

router.get('/:userId', messageController.profile);

module.exports = router;
