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
    .get(async function (req, res, next){
      var query = req.query;
      var result = await request('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+query.stock+'&apikey='+process.env.API_KEY, function(err,res,body){
        if (err) return err;
        
      })
    })// https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey=demo
    
    
};
