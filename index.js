var express = require('express');
var app = express();
var pg = require('pg');
var bodyParser = require('body-parser');

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
    var conString = process.env.DATABASE_URL;
    var resultName = "";
    var client = new pg.Client(conString);
    client.connect(function (err) {
        if (err) {
            return console.error('could not connect to postgres', err);
        }
        console.log("connect ok");
        client.query('select * from users', function (err, rows) {
            if (err) {
                console.log('select error');
            }
            for (key in rows) {
                console.log(key);
            }

            res.render('pages/users', { title: 'heroku2 Express Users', users: rows.rows });
        });
    });
});
app.get('/rss', function (req, res) {
    var url = require('url');
    var url_parts = url.parse(req.url, true);
    //start=0&end=100
    var start = url_parts.query["start"];
    var end = url_parts.query["end"];
    var conString = process.env.DATABASE_URL;
    pg.connect(conString, function (err, client, done) {
        client.query('select * from RSS_ENTRY ORDER BY updateTime,ID LIMIT $1 OFFSET $2', [end - start, start], function (err, result) {
            if (err) {
                return console.error('could not select', err);
            }
            res.setHeader('Content-Type', 'application/json')
            res.write(JSON.stringify(result.rows));
            res.end();
        });
    });
});

app.post('/json', function (req, res) {
    res.setHeader('Content-Type', 'text/plain')
    res.write('you posted:\n')
    var json = JSON.stringify(req.body, null, 2);
    var p = JSON.parse(json);
    var start = p["start"];
    console.log(start);
    var entries = p["entries"];
    var conString = process.env.DATABASE_URL;
    var resultName = "";
    pg.connect(conString, function (err, client, done) {

        //var client = new pg.Client(conString);
        if (err) {
            return console.error('could not connect to postgres', err);
        }
        client.query("DELETE FROM RSS_ENTRY", function (err, result) {
            if (err) {
                return console.error('can not delete', err);
            }
        });

        entries.map(function (entry, index, array1) {
            var d = new Date(entry["updateTime"]);
            var time = comDateFormat(d, "yyyy/MM/dd HH:mm");
            client.query("INSERT INTO RSS_ENTRY (title,url,site,updateTime) VALUES ($1,$2,$3,to_timestamp($4, 'YYYY/MM/DD HH24:MI'))"
                , [entry["title"], entry["url"], entry["site"], time], function (err, result) {
                    if (err) {
                        return console.error('can not insert', err);
                    }
                });
        });
        entries.map(function (entry, index, array1) {
            if (index < 3) {
                console.log(entry["title"] + " " + entry["url"] + " " + entry["site"] + " " + entry["updateTime"]);
            }
        });
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