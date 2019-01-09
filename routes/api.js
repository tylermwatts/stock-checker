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
  function getStockJson(stock,callback){
    request.get('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+stock+'&apikey='+process.env.API_KEY, function(err,res,body){
      if (err) return JSON.stringify(err)
      body = JSON.parse(body)
      return callback(null, body);
    })
  }

  app.route('/api/stock-prices')
    .get(function (req, res){
      var query = req.query;
      var result = getStockJson(query.stock)
      console.log(result);
    })// https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey=demo
    
    
};
