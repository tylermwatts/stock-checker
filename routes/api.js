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
  
  const getStockPrice = function(stock){
    var url = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+stock+'&apikey='+process.env.API_KEY;
    // https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={API_KEY}
    request.get(url, function(err, response, body){
      if (err) return err;
      var result = JSON.parse(response.body);
      var symbol = result['Global Quote']['01. symbol']
      var price = result['Global Quote']['05. price']
      return {stock: symbol, price}
    })
  }

  app.route('/api/stock-prices')
    .get(function (req, res){
      var query = req.query;
      if (Array.isArray(query.stock)){
        console.log('double stock');
      } else {
        var likeTotal = query.like ? 1 : 0
        Stock.findOne({stock: query.stock}, function(err,stock){
          if (err) return res.json({error: err});
          if (!stock){
            var newStock = new Stock({})
          }
        })
      }
    
    
})
};
