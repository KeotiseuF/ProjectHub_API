const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../models/groupomania/User");

const MY_APP_SECRET = process.env.APP_SECRET;

exports.signup = (req, res) => {
  bcrypt
  .hash(req.body.password, 10) 
  .then((hash) => {
    const user = new User({
      email: req.body.email,
      password: hash,
      role: req.body.role,
    });

    user.save()
    .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
    .catch((error) => res.status(400).json({ error }));
  })
  .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res) => {
  User.findOne({ email: req.body.email })
  .then((user) => {
    if(!user) throw new Error("An error occured with the login.");

    bcrypt.compare(req.body.password, user.password)
    .then((valid) => {
      if(!valid) throw new Error("An error occured with the login.");

      res.status(200).json({
        userId: user._id,
        userRole: user.role,
        token: jwt.sign(
          { userId: user._id, userRole: user.role },
          MY_APP_SECRET,
          { expiresIn: "24h" }
        ),
      });
    })
    .catch((error) => res.status(500).json({ error }));
  })
  .catch((error) => res.status(500).json({ error }));
};