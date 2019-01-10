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
    request.get(url, function(err, response, body){
      
    })
  }

  app.route('/api/stock-prices')
    .get(function (req, res){
      var query = req.query;
      if (Array.isArray(query.stock)){
        console.log('double stock');
      } else {
      var url = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+query.stock+'&apikey='+process.env.API_KEY
      request.get(url, function(err, response, body){
        if (err) return res.json({error: err});
        var result = JSON.parse(response.body);
        var symbol = result['Global Quote']['01. symbol']
        var price = result['Global Quote']['05. price']
        var likeTotal = query.like ? 1 : 0
        Stock.findOne({stock: symbol},function (err,stock){
          if (err) return res.json(err);
          if(!stock){
            var newStock = new Stock({
              stock: symbol,
              price: price,
              likes: likeTotal
            })
            newStock.save((err)=>{
              if (err) return res.json(err)
            })
            var stockObj = {stockData: newStock}
            res.json(stockObj);
          } else {
            if (query.like && stock.likes === 0){
              stock.likes = 1;
            }
            stock.price = price;
            stock.save((err,updated)=>{
              if (err) return res.json(err)
              res.json({stockData: stock});
            })
          }
        })
      })
      }
    })// https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey=demo
    
    
};
