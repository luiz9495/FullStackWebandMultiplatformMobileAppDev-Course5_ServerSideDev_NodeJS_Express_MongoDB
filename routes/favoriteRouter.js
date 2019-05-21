const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate'); // !!! var???
const cors = require('./cors');
const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

// case: favorites
favoriteRouter.route('/')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorite) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser,
    (req, res, next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorite) => {
      if (favorite) { // fav(user) doc already exist: add the dishes
        req.body.forEach((dish) => {
          if (favorite.dishes.indexOf(dish._id) < 0) { // dish not yet in favorites array
            console.log('dish added to favorite[]: ', dish);
            favorite.dishes.push(dish._id);
          }
        });
        favorite.save()
          .then((favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
          }, (err) => next(err))
          .catch((err) => next(err));
      }
      else { // // fav(user) doc must be created, and dishes added
        Favorites.create({user: req.user._id, dishes: req.body})
        .then((favorite) => {
          console.log('Favorites Created: ', req.body);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorite);
        }, (err) => next(err))
        .catch((err) => next(err));
      }
    }, (err) => next(err))
    .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser,
    (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on \"favorites\"');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser,
    (req, res, next) => {
      Favorites.findOneAndDelete({user: req.user._id})
        .then((resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));
    });

// case: favorites/:dishId
favoriteRouter.route('/:dishId')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }
        else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
        }

    }, (err) => next(err))
    .catch((err) => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyUser,
    (req, res, next) => {
      Favorites.findOne({user: req.user._id})
        .then((favorite) => {
          if (favorite) { // fav(user) doc already exist: add the dishes
            if (favorite.dishes.indexOf(req.params.dishId) < 0) { // dish not yet in favorites array
              console.log('dish added to favorites array: ', req.params.dishId);
              favorite.dishes.push(req.params.dishId);
              favorite.save()
                .then((favorite) => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(favorite);
                }, (err) => next(err))
                .catch((err) => next(err));
              }
          }
          else { // if fav(user) does not exist: create it
            Favorites.create({user: req.user._id, dishes: [req.params.dishId]})
            .then((favorite) => {
              console.log('Favorites Created: ', req.params.dishId);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorite);
            }, (err) => next(err))
            .catch((err) => next(err));
          }
        }, (err) => next(err))
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser,
    (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on \"favorites\": '+ req.params.dishId);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser,
    (req, res, next) => {
      Favorites.findOne({user: req.user._id})
      .then((favorite) => {
        if (favorite) { // fav(user) doc already exist
          var index = favorite.dishes.indexOf(req.params.dishId);
          if (index >= 0) { // dish in favorites array
            console.log('dish deleted from favorites: ', req.params.dishId);
            favorite.dishes.splice(index, 1);
            favorite.save()
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
          }
          else {
            err = new Error('Dish ' + req.params.dishId + ' not in Favorite');
            err.status = 404;
            return next(err);
          }
        }
      }, (err) => next(err))
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
