const mongoose = require('mongoose').connect('mongodb://localhost/myapi'),
  express = require('express'),
  jwt = require('jsonwebtoken'),
  passwordHash = require('password-hash'),
  bodyParser = require('body-parser'),
  app = express(),
  Todo = mongoose.model('todo', new mongoose.Schema({
    id: Number,
    title: String,
    finish: Boolean,
    description: String,
    update_at: { type: Date, default: Date.now }
  })),
  User = mongoose.model('users', new mongoose.Schema({
    id: Number,
    name: String,
    password: String
  }))
secret = 'baddb054-1c6d-4872-bde8-ed0a5ada6f6d';

app
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    // res.setHeader("Access-Control-Allow-Credentials", "true");

    // console.log(req.url)
    // const token = req.headers.Authorization
    // console.log(token)
    // if (token) {
    //   jwt.verify(token, secret, function (err, decoded) {
    //     if (err)
    //       return res.json({ success: false, err: err, code: 0 })
    //     next();
    //   })
    // }
    // else if (req.url === '/authenticate') {

    // }
    // else
    //   return res.status(403).send({
    //     success: false,
    //     err: 'No token provided'
    //   })


    next();
  })
  .post('/authenticate', (req, res) => {
    User.findOne({ id: req.body.id }, (err, user) => {
      if (err)
        return res.json({ success: false, err: err, code: 0 });
      if (!user)
        return res.json({ success: false, err: 'User not found', code: 1 });
      if (user.password !== req.body.password)
        return res.json({ success: false, err: 'Incorrect password', code: 2 });
      return res.json({
        success: true,
        user: user,
        token: jwt.sign(user, secret, {
          expiresIn: 1440 // expires in 24 hours
        })
      })
    })
  })
  .get('/todo/:id', (req, res) => {
    Todo.find({ id: req.params.id }, (err, data) => res.json(data));
  })
  .get('/todos', (req, res) => {
    // console.log(req.headers.authorization)
    jwt.verify(req.headers.authorization, secret, (err, decoded) => {
      // console.log(decoded)
      if (err)
        return res.json(err)
      Todo.find({}, (err, data) => res.json(data));
    })

    // setTimeout(() => {

    // }, 5000);

  })
  .post('/todo', (req, res, next) => {
    Todo.create(req.body, (err, post) => {
      if (err) return next(err);
      res.json(post);
    })
  })
  .put('/todo/:id', (req, res) => {
    Todo.update({ id: req.params.id }, req.body, (err, data) => {
      res.json(data);
    })
  })
  .delete('/todo/:id', (req, res) => {
    Todo.remove({ id: req.params.id }, (err, data) => res.json(data));
  })
  .listen(3000);