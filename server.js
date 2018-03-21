let express = require('express');
let path = require('path');
let ejs = require('ejs');
let app = express();
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let api = require('./api')
//设置静态文件夹
app.use(express.static(path.join(__dirname, '')));
//设置模板文件夹
app.set('views', path.join(__dirname, ''));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use(function (req, res, next) {
  next();
});
api.use(app);

// 开启服务器
app.listen(9999, function () {
  // c.exec('start http://localhost:2017');
  console.log('成功')
});



