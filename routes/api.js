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

const stockSchema = mongoose.Schema({
  stock: {type: String, required: true},
  price: {type: String, required: true},
  likes: {type: Number, required: true, default: 0}
})

const Stock = mongoose.model('Stock', stockSchema);

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      var query = req.query;
      request.get('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+query.stock+'&apikey='+process.env.API_KEY, function(err, response, body){
        if (err) return res.json({error: err});
        var result = JSON.parse(response.body);
        var symbol = result['Global Quote']['01. symbol']
        var price = result['Global Quote']['05. price']
        Stock.findOne({stock: symbol},(err,stock)=>{
          if (err) return res.json(err);
          if (stock){
            stock.price = price
          }
          var stockObj = {stockData: {stock: symbol, price: price}}

        })
        query.like ? stockObj.stockData.likes = 1 : stockObj.stockData.likes = 0;
        
        res.json(stockObj);
      })
    })// https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey=demo
    
    
};
