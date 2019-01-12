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
      return Promise
        .all([url1,url2]
             .map(url=>fetch(url)
                  .then(response=> response.json())))
        .then(data=>{
          return [{stock: data[0]['Global Quote']['01. symbol'], price: data[0]['Global Quote']['05. price']},
                  {stock: data[1]['Global Quote']['01. symbol'], price: data[1]['Global Quote']['05. price']}];
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

  app.route('/api/stock-prices')
    .get(async function (req, res, done){
      var query = req.query;
      var likeBool = query.like || false
      var ip = req.connection.remoteAddress.slice(7);
        if (Array.isArray(query.stock)){
          try {
            var stockArr = await getStockData(query.stock);
          } catch (err){return err}
          Stock.find({stock: { $in: [stockArr[0].stock, stockArr[1].stock]}},function(err, stocks){
            console.log(stocks)
            if (stocks === undefined){
              var stock1 = new Stock({
                stock: stockArr[0].stock,
                price: stockArr[0].price,
                likes: likeBool ? 1 : 0,
                ip: ip
              })
              stock1.save(err=>{
                if (err) return err;
              })
              var stock2 = new Stock({
                stock: stockArr[1].stock,
                price: stockArr[1].price,
                likes: likeBool ? 1 : 0,
                ip: ip
              })
              stock2.save(err=>{
                if (err) return err;
              }) 
              return done(null, res.json({stockData: [
                {stock: stock1.stock, price: stock1.price, rel_likes: stock1.likes - stock2.likes},
                {stock: stock2.stock, price: stock2.price, rel_likes: stock2.likes - stock1.likes}
              ]}))
            } else if(stocks.length === 1 && stocks[0].stock !== stockArr[0].stock){
              if (stocks[0].stock === stockArr[1].stock){
                stocks[0].price = stockArr[1].price;
                stocks[0].save(err=>{
                  if (err) return res.json({error: err})
                })
              }
              var newStock = new Stock({
                stock: stockArr[0].stock,
                price: stockArr[0].price,
                likes: likeBool ? 1 : 0,
                ip: ip
              })
              newStock.save(err=>{
                if (err) return err
              })
              return done(null, res.json({stockData: [
                  {stock: newStock.stock, price: newStock.price, rel_likes: newStock.likes - stocks[0].likes},
                  {stock: stocks[0].stock, price: stocks[0].price, rel_likes: stocks[0].likes - newStock.likes}
                ]}))
            } else if (stocks.length === 1 && stocks[0].stock !== stockArr[1].stock){
              if (stocks[0].stock === stockArr[0].stock){
                stocks[0].price = stockArr[0].price;
                stocks[0].save(err=>{
                  if (err) return res.json({error: err})
                })
              }
              var newStock = new Stock({
                stock: stockArr[1].stock,
                price: stockArr[1].price,
                likes: likeBool ? 1 : 0,
                ip: ip
              })
              newStock.save(err=>{
                if (err) return err
              })
              return done(null, res.json({stockData: [
                  {stock: newStock.stock, price: newStock.price, rel_likes: newStock.likes - stocks[0].likes},
                  {stock: stocks[0].stock, price: stocks[0].price, rel_likes: stocks[0].likes - newStock.likes}
                ]}))
            } else {
              stocks[0].price = stockArr[0].price
              stocks[1].price = stockArr[1].price
              if (likeBool){
                console.log('like passed as true');
                if (stocks[0].ip !== ip){
                  stocks[0].likes += 1;
                }
                if (stocks[1].ip !== ip){
                  stocks[1].likes += 1;
                }
              }
              stocks[0].save(err=>{
                if (err) return res.json({error: err})
              })
              stocks[1].save(err=>{
                if (err) return res.json({error: err})
              })
              return done(null, res.json({stockData: [
                {stock: stocks[0].stock, price: stocks[0].price, rel_likes: stocks[0].likes - stocks[1].likes},
                {stock: stocks[1].stock, price: stocks[1].price, rel_likes: stocks[1].likes - stocks[0].likes}
              ]}))
            }
          })
        } else {
          try {
            var fetchData = await getStockData(query.stock);
          } catch(err){res.json({error: err})}
          Stock.findOne({stock: fetchData.stock}, function(err,stock){
            if (err) res.json({error: err});
            if (!stock){
              var createdStock = new Stock({
                stock: fetchData.stock,
                price: fetchData.price,
                likes: likeBool ? 1 : 0,
                ip: ip
              })
              createdStock.save(err=>{
                if (err) return res.json({error: err})
              })
              return done(null, res.json({stockData: {stock: createdStock.stock, price: createdStock.price, likes: createdStock.likes}}))
            } else {
              stock.price = fetchData.price;
              if (likeBool){
                if (stock.ip !== ip){
                  stock.likes += 1;
                }
              }
              stock.save(err=>{
                if (err) return res.json({error: err})
              })
              return done(null, res.json({stockData: {stock: stock.stock, price: stock.price, likes: stock.likes}}))
            }
          })
        }
    })// https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey=demo
    
    
};
