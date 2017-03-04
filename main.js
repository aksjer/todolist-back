const express = require('express'),
  app = express(),
  mongoose = require('mongoose').connect('mongodb://localhost/todolist'),
  jwt = require('jsonwebtoken'),
  bodyParser = require('body-parser'),
  secret = 'baddb054-1c6d-4872-bde8-ed0a5ada6f6d',
  crypto = require('crypto'),
  hash = crypto.createHash('sha256'),
  Todos = mongoose.model('Todos', new mongoose.Schema({
    id: Number,
    title: String,
    description: String,
    status: Number,
    date: Date
  })),
  Users = mongoose.model('users', new mongoose.Schema({
    _id: Number,
    email: String,
    verified: Boolean,
    name: String,
    password: String,
    roles: []
  }));

app
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
  })
  .post('/authenticate', (req, res) => {
    Users.findOne({ email: req.body.email }, (err, user) => {
      if (err)
        return res.json({ success: false, err: err, code: 0 });
      if (!user)
        return res.json({ success: false, err: 'User not found', code: 1 });
      hash.update(req.body.password)
      if (user.password !== hash.digest('hex'))
        return res.json({ success: false, err: 'Incorrect password', code: 2 });
      return res.json({
        success: true,
        user: { name: user.name, email: user.email },
        token: jwt.sign(user, secret, {
          expiresIn: 1440
        })
      })
    })
  })
  .get('/todo/:id', auth, (req, res) => {
    Todos.find({ id: req.params.id }, (err, data) => res.json(data));
  })
  .get('/todos', auth, (req, res) => {
    Todos.find({}, (err, todos) => res.send(todos))
  })
  .post('/todo', auth, (req, res, next) => {
    Todos.create(req.body, (err, post) => {
      if (err) return next(err);
      res.json(post);
    })
  })
  .put('/todo/:id', auth, (req, res) => {
    Todos.update({ id: req.params.id }, req.body, (err, data) => res.json(data))
  })
  .delete('/todo/:id', auth, (req, res) => {
    Todos.remove({ id: req.params.id }, (err, data) => res.json(data));
  })
  .listen(3000);

function auth(req, res, next) {
  jwt.verify(req.headers.authorization, secret, (err, decoded) => {
    if (err)
      return res.status(403).send();
    if (!decoded._doc.verified)
      return res.json({ err: 'please validate your email' });
    next();
  });
}