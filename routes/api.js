/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var mongoose = require('mongoose');
var request = require('request');

mongoose.connect(process.env.DB, {useNewUrlParser: true});

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      var query = req.query;
      var result;
      request('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' + query.stock + '&apikey=' + process.env.API_KEY,
              function(err,res){
        var response = JSON.parse(res.body);
        res = {stockData: {stock: response["Global Quote"]["01. symbol"], price: response["Global Quote"]["05. price"]}}
        req.query.like ? result.stockData.likes = 1 : result.stockData.likes = 0
      }).pipe(res);
      // https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey=demo
    });
    
};
