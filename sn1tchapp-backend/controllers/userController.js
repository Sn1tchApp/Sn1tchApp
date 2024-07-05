const User = require('../models/User');

const createUser = async (req, res) => {
  try {
    const { name, login, email } = req.body;
    const newUser = new User({ name, login, email });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

module.exports = { createUser, getUsers };
