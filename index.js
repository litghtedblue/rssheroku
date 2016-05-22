var express = require('express');
var app = express();
var pg = require('pg');
var bodyParser = require('body-parser');
var Sequelize = require('sequelize');
var validator = require('validator');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '100mb' }));


app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));


// views is directory for all template files
app.set('views', __dirname + '/views');
//app.set('view engine', 'ejs');
app.set('view engine', 'jade');

//app.get('/', function(request, response) {
//  response.render('pages/index');
//});

app.get('/', function (req, res) {
    res.render('pages/users', {});
});
app.get('/rss', function (req, res) {
    var url = require('url');
    var url_parts = url.parse(req.url, true);
    //start=0&end=100
    var start = url_parts.query["start"];
    var end = url_parts.query["end"];
    var conString = process.env.DATABASE_URL;
    pg.connect(conString, function (err, client, done) {
        client.query('select * from RSS_ENTRIES ORDER BY ID DESC LIMIT $1 OFFSET $2', [end - start, start], function (err, result) {
            if (err) {
                return console.error('could not select', err);
            }
            res.setHeader('Content-Type', 'application/json')
            var r = result.rows;
            r.map(function (entry, index, array1) {
                entry["title"] = validator.unescape(entry["title"]);
                var updateTime = entry["updatetime"];
                entry["updateTime"] = updateTime.getTime();
            });
            res.write(JSON.stringify(r));
            res.end();
        });
    });
});

app.post('/json', function (req, res) {
    //var json = JSON.stringify(req.body, null, 2);
    var p = req.body;//JSON.parse(json);
    var start = p["start"];
    console.log(start);
    var entries = p["entries"];
    var conString = process.env.DATABASE_URL;
    var sequelize = new Sequelize(conString, {
        dialect: 'postgres'
        //,
        // native:true,

        , dialectOptions: {
            ssl: true
        }
    });

    var Rssentry = sequelize.define("rss_entry", {
        title: Sequelize.STRING,
        url: Sequelize.STRING,
        site: Sequelize.STRING,
        updatetime: Sequelize.DATE
    });

    Promise.resolve().then(function () {
        entries.map(function (entry, index, array1) {
            var d = new Date(entry["updateTime"]);
            delete entry["updateTime"];
            entry["updatetime"] = d;
        });
    }).then(
        function () {
            if (start != 0) {
                return;
            }
            return Rssentry.destroy({ where: { id: { gt: 1 } } });
        }
        ).then(function () {
            var tmp = entries[0];
            return Rssentry.bulkCreate(
                entries
            );
        }).then(function () {
            res.setHeader('Content-Type', 'text/plain')
            res.write('you posted:\n')
            res.end();
        });
});




app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});

/**************************************************
     * [機能]	日付オブジェクトから文字列に変換します
     * [引数]	date	対象の日付オブジェクト
     * 			format	フォーマット
     * [戻値]	フォーマット後の文字列
     **************************************************/
function comDateFormat(date, format) {

    var result = format;

    var f;
    var rep;

    var yobi = new Array('日', '月', '火', '水', '木', '金', '土');

    f = 'yyyy';
    if (result.indexOf(f) > -1) {
        rep = date.getFullYear();
        result = result.replace(/yyyy/, rep);
    }

    f = 'MM';
    if (result.indexOf(f) > -1) {
        rep = comPadZero(date.getMonth() + 1, 2);
        result = result.replace(/MM/, rep);
    }

    f = 'ddd';
    if (result.indexOf(f) > -1) {
        rep = yobi[date.getDay()];
        result = result.replace(/ddd/, rep);
    }

    f = 'dd';
    if (result.indexOf(f) > -1) {
        rep = comPadZero(date.getDate(), 2);
        result = result.replace(/dd/, rep);
    }

    f = 'HH';
    if (result.indexOf(f) > -1) {
        rep = comPadZero(date.getHours(), 2);
        result = result.replace(/HH/, rep);
    }

    f = 'mm';
    if (result.indexOf(f) > -1) {
        rep = comPadZero(date.getMinutes(), 2);
        result = result.replace(/mm/, rep);
    }

    f = 'ss';
    if (result.indexOf(f) > -1) {
        rep = comPadZero(date.getSeconds(), 2);
        result = result.replace(/ss/, rep);
    }

    f = 'fff';
    if (result.indexOf(f) > -1) {
        rep = comPadZero(date.getMilliseconds(), 3);
        result = result.replace(/fff/, rep);
    }

    return result;

}


/**************************************************
 * [機能]	文字列から日付オブジェクトに変換します
 * [引数]	date	日付を表す文字列
 * 			format	フォーマット
 * [戻値]	変換後の日付オブジェクト
 **************************************************/
function comDateParse(date, format) {

    var year = 1990;
    var month = 1;
    var day = 1;
    var hour = 0;
    var minute = 0;
    var second = 0;
    var millisecond = 0;

    var f;
    var idx;

    f = 'yyyy';
    idx = format.indexOf(f);
    if (idx > -1) {
        year = date.substr(idx, f.length);
    }

    f = 'MM';
    idx = format.indexOf(f);
    if (idx > -1) {
        month = parseInt(date.substr(idx, f.length), 10) - 1;
    }

    f = 'dd';
    idx = format.indexOf(f);
    if (idx > -1) {
        day = date.substr(idx, f.length);
    }

    f = 'HH';
    idx = format.indexOf(f);
    if (idx > -1) {
        hour = date.substr(idx, f.length);
    }

    f = 'mm';
    idx = format.indexOf(f);
    if (idx > -1) {
        minute = date.substr(idx, f.length);
    }

    f = 'ss';
    idx = format.indexOf(f);
    if (idx > -1) {
        second = date.substr(idx, f.length);
    }

    f = 'fff';
    idx = format.indexOf(f);
    if (idx > -1) {
        millisecond = date.substr(idx, f.length);
    }

    var result = new Date(year, month, day, hour, minute, second, millisecond);

    return result;

}

/**************************************************
 * [機能]	ゼロパディングを行います
 * [引数]	value	対象の文字列
 * 			length	長さ
 * [戻値]	結果文字列
 **************************************************/
function comPadZero(value, length) {
    return new Array(length - ('' + value).length + 1).join('0') + value;
}