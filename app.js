var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require("body-parser");
var fs = require("fs");
var jsonParser = bodyParser.json();



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + "/public"));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.get("/api/users", function(req, res){

    var content = fs.readFileSync("users.json", "utf8");
    var users = JSON.parse(content);
    res.send(users);
});


// получение одного пользователя по id
app.get("/api/users/:id", function(req, res){

    var id = req.params.id; // получаем id
    var content = fs.readFileSync("users.json", "utf8");
    var users = JSON.parse(content);
    var user = null;
    // находим в массиве пользователя по id
    for(var i=0; i<users.length; i++){
        if(users[i].id==id){
            user = users[i];
            break;
        }
    }
    // отправляем пользователя
    if(user){
        res.send(user);
    }
    else{
        res.status(404).send();
    }
});
// получение отправленных данных
app.post("/api/users", jsonParser, function (req, res) {

    if(!req.body) return res.sendStatus(400);

    var userName = req.body.name;
    var userAge = req.body.age;
    var user = {name: userName, age: userAge};

    var data = fs.readFileSync("users.json", "utf8");
    var users = JSON.parse(data);

    // находим максимальный id
    var id = Math.max.apply(Math,users.map(function(o){return o.id;}))
    // увеличиваем его на единицу
    user.id = id+1;
    // добавляем пользователя в массив
    users.push(user);
    var data = JSON.stringify(users);
    // перезаписываем файл с новыми данными
    fs.writeFileSync("users.json", data);
    res.send(user);
});
// удаление пользователя по id
app.delete("/api/users/:id", function(req, res){

    var id = req.params.id;
    var data = fs.readFileSync("users.json", "utf8");
    var users = JSON.parse(data);
    var index = -1;
    // находим индекс пользователя в массиве
    for(var i=0; i<users.length; i++){
        if(users[i].id==id){
            index=i;
            break;
        }
    }
    if(index > -1){
        // удаляем пользователя из массива по индексу
        var user = users.splice(index, 1)[0];
        var data = JSON.stringify(users);
        fs.writeFileSync("users.json", data);
        // отправляем удаленного пользователя
        res.send(user);
    }
    else{
        res.status(404).send();
    }
});
// изменение пользователя
app.put("/api/users", jsonParser, function(req, res){

    if(!req.body) return res.sendStatus(400);

    var userId = req.body.id;
    var userName = req.body.name;
    var userAge = req.body.age;

    var data = fs.readFileSync("users.json", "utf8");
    var users = JSON.parse(data);
    var user;
    for(var i=0; i<users.length; i++){
        if(users[i].id==userId){
            user = users[i];
            break;
        }
    }
    // изменяем данные у пользователя
    if(user){
        user.age = userAge;
        user.name = userName;
        var data = JSON.stringify(users);
        fs.writeFileSync("users.json", data);
        res.send(user);
    }
    else{
        res.status(404).send(user);
    }
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
