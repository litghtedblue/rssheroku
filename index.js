var express = require('express');
var app = express();

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
//app.set('view engine', 'ejs');
app.set('view engine', 'jade');

//app.get('/', function(request, response) {
//  response.render('pages/index');
//});

app.get('/', function(req, res) {
    var pg = require('pg');
    var conString = process.env.DATABASE_URL;
    var resultName = "";
    var client = new pg.Client(conString);
    client.connect(function(err) {
        if (err) {
            return console.error('could not connect to postgres', err);
        }
        console.log("connect ok");
        client.query('select * from users', function(err, rows) {
           if(err){
              console.log('select error');
           }
for(key in rows){
 console.log(key);
}           

res.render('pages/users', { title: 'heroku2 Express Users', users: rows.rows });
        });
    });
});


app.post('/json',function(req,res){
  res.setHeader('Content-Type', 'text/plain')
  res.write('you posted:\n')
  var json=JSON.stringify(req.body, null, 2);
  var p=JSON.parse(json);
  var entries=p["entries"];
  entries.map(function(entry, index, array1){
      console.log(entry["title"]+" "+entry["url"]+" "+entry["site"]+" "+entry["updateTime"]);
  });
  res.end();
});




app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

