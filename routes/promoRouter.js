const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate'); // !!! var???

const Promotions = require('../models/promotions');

const promoRouter = express.Router();

promoRouter.use(bodyParser.json());

// case: promotions
promoRouter.route('/')
  .get((req,res,next) => {
    Promotions.find({})
    .then((promos) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(promos);
    }, (err) => next(err))
    .catch((err) => next(err));
  })
  .post(authenticate.verifyUser,
    (req, res, next) => authenticate.verifyAdmin(req.user.admin, next),
    (req, res, next) => {
    Promotions.create(req.body)
    .then((promo) => {
        console.log('Promotion Created ', promo);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);
    }, (err) => next(err))
    .catch((err) => next(err));
  })
  .put(authenticate.verifyUser,
    (req, res, next) => authenticate.verifyAdmin(req.user.admin, next),
    (req, res, next) => {
      res.statusCode = 403;
      res.end('PUT operation not supported on /promotions');
  })
  .delete(authenticate.verifyUser,
    (req, res, next) => authenticate.verifyAdmin(req.user.admin, next),
    (req, res, next) => {
    Promotions.deleteMany({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
  });

// case: promotions/:promoId
promoRouter.route('/:promoId')
  .get((req,res,next) => {
      Promotions.findById(req.params.promoId)
      .then((promo) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(promo);
      }, (err) => next(err))
      .catch((err) => next(err));
    })
  .post(authenticate.verifyUser,
    (req, res, next) => authenticate.verifyAdmin(req.user.admin, next),    (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /promotions/'+ req.params.promoId);
  })
  .put(authenticate.verifyUser,
    (req, res, next) => authenticate.verifyAdmin(req.user.admin, next),
    (req, res, next) => {
    Promotions.findByIdAndUpdate(req.params.promoId, {
        $set: req.body
    }, { new: true })
    .then((promo) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promo);
    }, (err) => next(err))
    .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser,
    (req, res, next) => authenticate.verifyAdmin(req.user.admin, next),
    (req, res, next) => {
    Promotions.findByIdAndRemove(req.params.promoId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
  });

module.exports = promoRouter;
