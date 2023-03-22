const Message = require('../models/Message');
const jwt = require('jsonwebtoken');

const getMessage = async (req, res) => {
  const userId = req.params?.userId;
  let token = req.cookies?.token;
  let user;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
      if (err) throw err;

      user = userData;
    });
  } else {
    res.status(401).json('Unauthorized');
  }

  try {
    const messages = await Message.find({
      $or: [
        { sender: user.userId, recipient: userId },
        { sender: userId, recipient: user.userId },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  getMessage,
};
