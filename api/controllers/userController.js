const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const bcryptSalt = bcrypt.genSaltSync(10);

const profile = async (req, res) => {
  const token = req.cookies?.token;

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
      if (err) throw err;

      res.json(userData);
    });
  } else {
    res.status(401).json('no token');
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const foundUser = await User.findOne({ username });

    if (!foundUser) {
      res.status(401).json('no user');
    }

    const isMatch = bcrypt.compareSync(password, foundUser.password);

    if (!isMatch) {
      res.status(401).json('no match');
    }

    jwt.sign(
      { userId: foundUser._id, username },
      process.env.JWT_SECRET,
      (err, token) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: 'Error signing token', error: err });
        }

        res
          .cookie('token', token, { sameSite: 'none', secure: true })
          .status(201)
          .json({
            id: foundUser._id,
          });
      }
    );
  } catch (error) {}
};

const register = async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = bcrypt.hashSync(password, bcryptSalt);

    const user = await User.create({
      username,
      password: hashedPassword,
    });

    jwt.sign(
      { userId: user._id, username },
      process.env.JWT_SECRET,
      (err, token) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: 'Error signing token', error: err });
        }

        res
          .cookie('token', token, { sameSite: 'none', secure: true })
          .status(201)
          .json({
            id: user._id,
            message: 'User created successfully',
          });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error registering user', error });
  }
};

const logout = async (req, res) => {
  res
    .clearCookie('token', { sameSite: 'none', secure: true })
    .status(200)
    .json({ message: 'User logged out successfully' });
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, { _id: 1, username: 1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error getting users', error });
  }
};

module.exports = {
  profile,
  login,
  register,
  getUsers,
  logout,
};
