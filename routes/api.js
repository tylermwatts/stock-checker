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
  function getStockJson(stock){
    request('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+stock+'&apikey='+process.env.API_KEY, function(err,res){
      if (err) return JSON.stringify(err)
      var stringifiedJson = JSON.parse(res.body);
      return stringifiedJson;
    })
  }

  app.route('/api/stock-prices')
    .get(function (req, res){
      var query = req.query;
      var result = getStockJson(query.stock)
      var returnObj = {stockData: {stock: result['Global Quote']['01. symbol'], price: result['Global Quote']['05. price']}}
      req.query.like ? returnObj.stockData.likes = 1 : returnObj.stockData.likes = 0
      res.json(returnObj);
    })// https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey=demo
    
    
};
