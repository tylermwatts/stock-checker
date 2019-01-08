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
var rp = require('request');

mongoose.connect(process.env.DB, {useNewUrlParser: true});

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      var query = req.query;
      var result;
      request('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' + query.stock + '&apikey=' + process.env.API_KEY,
              function(err,res){
         result = JSON.parse(res.body);
         console.log(result)
      })
      // https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey=demo
    });
    
};
