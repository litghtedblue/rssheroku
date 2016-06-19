var fs = require('fs');
var rs = fs.createReadStream('EIJI-1441UTF8.TXT');
var readline = require('readline');



var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db.sqlite3');

db.serialize(function () {


    var rl = readline.createInterface(rs, {});

    var num = 0;
    var tmp = "";
    var word = "";
    rl.on('line', function (line) {
        if (line.match(/^■/)) {
            word = line.replace(/^■(.+?) :.+/, function () { return RegExp.$1 });
            if (tmp != "") {
                db.run("INSERT INTO eiji (word,content) VALUES (?,?)",word, tmp);
                // 受け取ったlineを逆順にして出力
                //console.log("---\n" + word + "\n" + tmp + "\n---\n");
                tmp = "";
                word="";
            }
        }
        tmp = tmp + line.replace(/^■(.+?) :\s*/, "");
        // num++;
        // if (num > 100) {
        //     rl.close();
        // }
    });

}); 
