const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const todosRoutes = require('./routes/todos-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

// app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/todos', todosRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || 'An unknown error occurred!' });
});

mongoose
  .connect('mongodb+srv://oussa:oussa@cluster0.kxzkxcu.mongodb.net/todos?retryWrites=true&w=majority')
  .then(() => {
    app.listen(5000);
  })
  .catch(err => {
    console.log(err);
  });

