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
      console.log(query)
      request('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' + query.stock + '&apikey=' + process.env.API_KEY,
              function(err,res){
        result = {stockData: {stock: res.body["Global Quote"]["01. symbol"], price: res.body["Global Quote"]["05. price"]}}
        req.query.like ? result.likes = 1 : result.likes = 0
        console.log(result)
      }).pipe(res.json(result))
      // https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey=demo
    });
    
};
