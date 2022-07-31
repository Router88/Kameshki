const express = require('express')
const mysql = require('mysql');
const path = require('path');
const fileUpload = require('express-fileupload');
const bcrypt = require("bcrypt");
const session = require('express-session');
const app = express()




app.use(fileUpload({}));
//
const salt = 10;

const connection = mysql.createConnection({
  host: "127.0.0.1",
  database: "rocks",
  user: "root",
  password: "admin" //secret   //admin
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
app.get('/add', (req, res) => {
 
  res.render('add', {
    auth: req.session.auth
    
  })
});

app.get('/lock', isAuth, (req, res) => {
  res.render('lock', {
    auth: req.session.auth
  });
});

app.post('/delete', (req, res) => {
  console.log(req.body.id)
  connection.query(
"DELETE from items WHERE id=?",
    [[req.body.id]], (err, data, fields) => {
      if (err) throw err;

      res.redirect('/')
  });
});

app.post('/update', (req, res) => {
  connection.query(
"UPDATE items SET title=?,image=? WHERE id=?",
    [[req.body.title], [req.body.image], [req.body.id]], (err, data, fields) => {
      if (err) throw err;

      res.redirect('/')
  });
});
//------------------------------------------------------------------------------------------------------
app.post('/store2', (req, res) => {
  connection.query(  
    "INSERT INTO items (title, description, image) VALUES (?, ?, ?)",
    [[req.body.title],[req.body.description], [req.files.photo.name]], (err, data, fields) => {
      if (err){throw err;}else{
      req.files.photo.mv('public/img/'+req.files.photo.name);
      res.redirect('/')
      }
  });
  
});


app.post('/store3', (req, res) => {
  connection.query(  
    "INSERT INTO items (title, description) VALUES (?, ?)",
    [[req.body.title],[req.body.description]], (err, data, fields) => {
      if (err){throw err;}else{
        connection.query(
          "UPDATE items SET image=? Where title=?,description=?",
          [[req.files.photo.name],[req.body.title,req],[body.description]], (err, data, fields) => {
            if (err) throw err;
            req.files.photo.mv('public/img/'+req.files.photo.name);
            res.redirect('/')
            
        }); 
      
      }
  });
  
});
//----
 app.post('/store', (req, res) => {
  connection.query(
    "INSERT INTO items (title, image) VALUES (?, ?)",
    [[req.body.title], [req.body.image]], (err, data, fields) => {
      if (err) throw err;

      res.redirect('/')
  });
})

app.post('/register', (req, res) => {
  connection.query(
    "SELECT id FROM users WHERE name=?",
    [req.body.name], (err, data, fields) => {
      if (err) throw err;
      if(data.length > 0){
        console.log('Такое имя пользователя уже используется')
        res.redirect('/reg')
     }else{
      let password=bcrypt.hashSync(req.body.password, 10); 
console.log(password);
 connection.query(
    "INSERT INTO users (name, password) VALUES (?, ?)",
    [[req.body.name], [password]], (err, data, fields) => {
      if (err) throw err;

      req.session.auth = true;

      res.redirect('/')
  }); 


     }
  });
});

app.post('/login', (req, res) => {
  //[req.body.password]

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
 
 //создание формы
 app.get('/form', function (req, res) {
  res.setHeader('content-type', 'text/html;charset=utf-8');
  res.write('<form action="/upload2" method="POST" enctype="multipart/form-data" >');
  res.write('<input type="file" name="photo">');
  res.write('<input type="submit">');
  res.write('</form>');
  res.end();
});

app.post('/upload2', function(req, res) {
  console.log(req.files.photo.name); // the uploaded file object
  connection.query(
    "INSERT INTO items (image) VALUES (?)",
    [req.files.photo.name], (err, data, fields) => {
      if (err) throw err;
      req.files.photo.mv('public/img/'+req.files.photo.name);
      res.redirect('/')
  });
 
});



// код брал здесь https://dmitrytinitilov.gitbooks.io/strange-javascript/content/express/file_uploading_on_express.html