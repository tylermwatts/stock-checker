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
var fetch = require('node-fetch');
var expressip = require('express-ip');

mongoose.connect(process.env.DB, {useNewUrlParser: true});

const stockSchema = mongoose.Schema({
  stock: {type: String, required: true},
  price: {type: String, required: true},
  likes: {type: Number, required: true, default: 0},
  ip: {type: String, required: true}
})

const Stock = mongoose.model('Stock', stockSchema);

module.exports = function (app) {
  
  function getStockData(stock){
    var url = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+stock+'&apikey='+process.env.API_KEY
    return fetch(url)
      .then(response=>{
        return response.json()
      })
      .then(theJson=>{
        return ({stock: theJson['Global Quote']['01. symbol'], price: theJson['Global Quote']['05. price']})
      })
  }
  
  function createNewStock(stockObj){
    var newStock = new Stock({
      stock: stockObj.stock,
      price: stockObj.price,
      likes: stockObj.likes,
      ip: stockObj.ip,
    })
    return newStock.save((err,data)=>{
      if (err) return {error: err}
      return data;
    })
  }
  
  function stockSearch(stockToSearch, bool){
    Stock.findOne({stock: stockToSearch.stock}, function(err,stock){
      if (err) return ({error: err});
        if (!stock){
          stockToSearch.likes = bool ? 1: 0
          var createdStock = createNewStock(stockToSearch);
          return ({stock: createdStock.stock, price: createdStock.price, likes: createdStock.likes})
        } else {
          stock.price = stockToSearch.price;
          if (stock.ip !== stockToSearch.ip && bool === true){
            stock.likes++;
          }
          console.log(stock);
          return ({stock: stock.stock, price: stock.price, likes: stock.likes})
        }
    })
  }

  app.route('/api/stock-prices')
    .get(async function (req, res){
      var query = req.query;
      var likeBool = query.like ? true : false
        if (query.stock.isArray){
          var stock1 = await getStockData(query.stock[0]);
          console.log(stock1)
        } else {
          var fetchData = await getStockData(query.stock);
          fetchData.ip = req.connection.remoteAddress;
          Stock.findOne({stock: fetchData.stock}, function(err,stock){
            if (err) res.json({error: err});
            if (!stock){
              fetchData.likes = likeBool ? 1: 0
              var createdStock = createNewStock(fetchData);
              return res.json({stockData: {stock: createdStock.stock, price: createdStock.price, likes: createdStock.likes}})
            } else {
              stock.price = fetchData.price;
              if (stock.ip !== fetchData.ip && likeBool === true){
                stock.likes++;
              }
              return res.json({stockData: {stock: stock.stock, price: stock.price, likes: stock.likes}})
            }
          })
        }
    })// https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey=demo
    
    
};
