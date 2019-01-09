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
      request.get('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+query.stock+'&apikey='+process.env.API_KEY, function(err, response, body){
        if (err) return res.json({error: err});
        var result = JSON.parse(response.body);
        var stockObj = {stockData: {stock: result['Global Quote']['01. symbol'], price: result['Global Quote']['05. price']}}
        query.like ? stockObj.stockData.likes = 1 : stockObj.stockData.likes = 0;
        res.json(stockObj);
      })
    })// https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey=demo
    
    
};
