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
    request.get('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+stock+'&apikey='+process.env.API_KEY, function(err,res,body){
      if (err) return JSON.stringify(err)
      body = JSON.parse(body)
      return body;
    })
  }

  app.route('/api/stock-prices')
    .get(async function (req, res, next){
      var query = req.query;
      try{
          var getResult = await getStockJson(query.stock)
          return res.json(getResult);
       catch{
      }
    })// https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey=demo
    
    
};
