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
    if (Array.isArray(stock)){
      var url1 = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock[0]}&apikey=${process.env.API_KEY}`
      var url2 = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock[1]}&apikey=${process.env.API_KEY}`
      Promise
        .all([url1,url2]
             .map(url=>fetch(url)
                  .then(response=> response.json())))
        .then(data=>{
          return [{stock: data[0]['Global Quote']['01. symbol'], price: data[0]['Global Quote']['05. price']},
                  {stock: data[1]['Global Quote']['01. symbol'], price: data[1]['Global Quote']['05. price']}]
        })
    } else {
      var url = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+stock+'&apikey='+process.env.API_KEY
      return fetch(url)
        .then(response=>{
          return response.json()
        })
        .then(theJson=>{
          return ({stock: theJson['Global Quote']['01. symbol'], price: theJson['Global Quote']['05. price']})
        })
    }
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
          try {
            var stockArr = await getStockData(query.stock);
            console.log(stockArr)
          } catch (err){return err}
          var stock2 = await getStockData(query.stock[1]);
        } else {
          try {
            var fetchData = await getStockData(query.stock);
          } catch(err){res.json({error: err})}
          fetchData.ip = req.connection.remoteAddress;
          Stock.findOne({stock: fetchData.stock}, function(err,stock){
            if (err) res.json({error: err});
            if (!stock){
              fetchData.likes = likeBool ? 1: 0
              var createdStock = new Stock({
                stock: fetchData.stock,
                price: fetchData.price,
                likes: fetchData.likes,
                ip: fetchData.ip,
              })
              console.log(createdStock)
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
