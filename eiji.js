var express = require('express');

var pg = require('pg');
var bodyParser = require('body-parser');
var Sequelize = require('sequelize');
var validator = require('validator');


var app = express();
app.set('port', (process.env.PORT || 3000));


if (process.env.NODE_ENV !== 'production') {
    var webpack = require('webpack')
    var webpackDevMiddleware = require('webpack-dev-middleware')
    var webpackHotMiddleware = require('webpack-hot-middleware')
    var config = require('./webpack.config')
    var compiler = webpack(config)
    app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }))
    app.use(webpackHotMiddleware(compiler))
}

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'jade');

app.get("/", function (req, res) {
    res.sendFile(__dirname + '/public/youtube.html')
})

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '100mb' }));
app.get('/eiji', function (req, res) {
    var url = require('url');
    var url_parts = url.parse(req.url, true);
    //start=0&end=100
    var word = url_parts.query["word"];
    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database('db.sqlite3');
    res.setHeader('Content-Type', 'application/json')
    db.serialize(function () {
        var sql = "SELECT word,content FROM eiji where word like '" + word + "%' order by word limit 100";
        //console.log(sql);
        db.all(sql, function (err, rows) {
            if (!err) {
                res.write(JSON.stringify(rows));

            } else {
                console.log(sql);
                console.log(err);
            }
            res.end();
        });
    });
});


app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});


