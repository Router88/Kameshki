const express = require('express')
const mysql = require('mysql');
const path = require('path');
const multer = require("multer");
const bcrypt = require("bcrypt");
const session = require('express-session');
const fs = require("fs");
const app = express();

//куда сохраняется картинка 
const upload = multer({ dest: "public/img/" });



app.use(express.static('public'))
//
const salt = 10;

const dotenv=require('dotenv').config();

const connection = mysql.createConnection(
{
 host: process.env.DB_HOST,
 database: process.env.DB_NAME,
 user: process.env.DB_USER,
 password: process.env.DB_PASS,
});

connection.connect(function (err) { if (err) throw err; });

// Путь к директории файлов ресурсов (css, js, images)
app.use(express.static('public'))

// Настройка шаблонизатора
app.set('view engine', 'ejs')

// Путь к директории файлов отображения контента
app.set('views', path.join(__dirname, 'views'))

// Обработка POST-запросов из форм
app.use(express.urlencoded({ extended: true }))

// Инициализация сессии
app.use(session({secret: "Secret", resave: false, saveUninitialized: true}));

// Middleware
function isAuth(req, res, next) {
  if (req.session.auth) {
    next();
  } else {
    res.redirect('/');
  }
}
// Запуск веб-сервера по адресу http://localhost:3000
app.listen(3000)

/**
 * Маршруты
 */
app.get('/', (req, res) => {
  connection.query("SELECT * FROM items", (err, data, fields) => {
    if (err) throw err;

    res.render('home', {
      items: data,
      auth: req.session.auth
    });
  });
});

app.get('/items/:id', (req, res) => {
  connection.query("SELECT * FROM items WHERE id=?", [req.params.id],
    (err, data, fields) => {
      if (err) throw err;

      res.render('item', {
        item: data[0],
        auth: req.session.auth
      })
  });
});
app.get('/logout', (req, res) => {
  req.session.auth = false;
  res.redirect('')
});
app.get('/log', (req, res) => {
  res.render('login', {
    auth: req.session.auth
  });
});
app.get('/reg', (req, res) => {
  res.render('register', {
    auth: req.session.auth
  });
});
app.get('/usrAgr', (req, res) => {
  res.render('userAgreement', {
  });
});
app.get('add',isAuth, (req, res) => {
 
  res.render('add', {
    auth: req.session.auth
    
  })
});


app.get('/ac',isAuth, (req, res) => {
  res.render('account', {
    auth: req.session.auth,
  });
});


app.post('/delete', (req, res) => {
  console.log(req.body.id)
  connection.query(
"DELETE from items WHERE id=?",
    [[req.body.id]], (err, data, fields) => {
      if (err){ throw err;}
      //удаление файла изображения
      else if (req.body.image.lenght >0) {
        fs.unlinkSync(req.body.image);
      }
      
      
      res.redirect('/');
  });
});

app.post('/update', upload.single("image"), (req, res) => {
  const tempPath = req.file.path;
  connection.query(
"UPDATE items SET title=?,description=?,image=? WHERE id=?",
    [[req.body.title], [req.body.description],[req.file.originalname], [req.body.id]], (err, data, fields) => {
      if (err) {throw err;}

        const targetPath = path.join(
          __dirname,
          "public/img/" + req.file.originalname
        );
        fs.rename(tempPath, targetPath, (err) => {
          if (err) console.log(err);
        });

      
      res.redirect('/');
  });
});

///-------------------
app.post("/upload", upload.single("image"), (req, res) => {
  const tempPath = req.file.path;
  connection.query(
    "INSERT INTO items (title, description, image) VALUES (?, ?,?)",
    [[req.body.title], [req.body.description], [req.file.originalname]], (err, data, fields) => {
      if (err) throw err;
  });
  const targetPath = path.join(
    __dirname,
    "public/img/" + req.file.originalname
  );

  fs.rename(tempPath, targetPath, (err) => {
    if (err) console.log(err);
    
    res.redirect('/');
  });
});

app.post('/register', (req, res) => {
  connection.query(
    "SELECT id FROM users WHERE name=?",
    [req.body.name], (err, data, fields) => {
      if (err) {throw err;}
      else if(data.length > 0){

        console.log('Такое имя пользователя уже используется')
        res.redirect('/reg')
     }else{
      let password=bcrypt.hashSync(req.body.password, 10); 
console.log(password);
 connection.query(
    "INSERT INTO users (name, password) VALUES (?, ?)",
    [[req.body.name], [password]], (err, data, fields) => {
      if (err){ throw err;
      }else{
      req.session.auth = true;
      res.redirect('/')}
  }); 
     }
  });
});

app.post('/login', (req, res) => {
  connection.query(
     "SELECT password FROM users WHERE name=?",
     [[req.body.name]], (err, data, fields) => {
       if (err){ throw err;}
       else{
        if(data.length > 0){

      let compare=bcrypt.compareSync(req.body.password, data[0].password);
      if( compare == true){
        req.session.auth = true;
        res.redirect('/')
      }else{
        req.session.auth = false;
        res.redirect('/log')
      }
    }else{res.redirect('/log')}
    }//else
   }); 

 });


 //чтобы сделать два запроса добавь connection.querry в другом connection.querry

// код брал здесь https://dmitrytinitilov.gitbooks.io/strange-javascript/content/express/file_uploading_on_express.html