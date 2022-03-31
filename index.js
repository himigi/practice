// express server open
const express = require('express');
const port = 3000;

// modules
const compression = require('compression');
const session = require('express-session');
const mysql = require('mysql');
const helmet = require('helmet')
const FileStore = require('session-file-store')(session)

// run modules
const app = express();
app.use(helmet());
app.use(compression());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'a12fdf!@#!@#dfgasdg',
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
}))

// app.get('/test', function (req, res, next) {
//     console.log(req.session);
//     if(req.session.num === undefined){
//         req.session.num = 1;
//     } else {
//         req.session.num =  req.session.num + 1;
//     }
//     res.send(`Views : ${req.session.num}`);
// })

// connect MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123qwe',
    database: 'test'
})
// connection.connect();

app.get('/', (req, res) => {
    if (req.session.loggedin === true) {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Mingi's Login Sample</title>
                <meta charset="UTF-8">
            </head>
            <body>
                <p>Hello, ${req.session.email}</p></n>
                <p><a href="/mypage">My page</a></p></n>
                <p><a href="/logout">Logout</a></p>
                <h1><a href="/">Login Test</a></h1>
                <p>Something could be read(or created, updated, deleted) based on MySQL / Mongo DB ...</p></n>
                <ul>
                    <li>blah blah..</li>
                    <li>mumble..</li>
                </ul></n>
                <p>No design for this example. Sorry.</p>
            </body>
            </html> 
         `);
    } else {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Mingi's Login Sample</title>
                <meta charset="UTF-8">
            </head>
            <body>
                <h1><a href="/">Login Test</a></h1>
                <p>Something could be read(or created, updated, deleted) based on MySQL / Mongo DB ...</p></n>
                <ul>
                    <li>blah blah..</li>
                    <li>mumble..</li>
                </ul></n>
                <p>No design for this example. Sorry.</p>
                <p><a href="/login">Login/Register</a></p>
            </body>
            </html> 
         `);
    }
});

app.get('/mypage', (req, res) => {
    res.send(`Still going... <a href="/">HOME</a>`)
})

app.get('/login', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Mingi's Login Sample</title>
        <meta charset="UTF-8">
    </head>
    <body>
        <h1><a href="/">Login Test</a></h1>
        <form action="login" method="post">
            <input type="text" name="email" placeholder="email">
            <input type="password" name="password" placeholder="password">
            <input type="submit" value="Login">
        </form>
        <p>Still not our member? <a href="/register">Register</a> now!!</p>
    </body>
    </html> 
    `)
    console.log("Login Page");
})

app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    if (email && password) {
        connection.query('SELECT * FROM test WHERE email = ? AND password = ?',
            [email, password],
            function(error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {
                req.session.loggedin = true;
                req.session.email = email;
                req.session.password = password;
                req.session.save( () => {
                    res.redirect('/');
                })
            } else {
                req.session.loggedin = false;
                res.send(`Please check your info. <a href="/login">Back</a>`);
            }
        });
    } else {
        res.send(`Please input your email, password. <a href="/login">Back</a>`);
        res.end();
    }
})

app.get('/register', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Mingi's Login Sample</title>
        <meta charset="UTF-8">
    </head>
    <body>
        <h1><a href="/">Login Test</a></h1>
        <form action="/register" method="post">
            <input type="text" name="email" placeholder="email">
            <input type="password" name="password" placeholder="password">
            <input type="submit" value="Register">
        </form>
    </body>
    </html> 
    `);
    console.log("Register Page");
});

app.post('/register', (req, res) => {
    connection.query(
        `INSERT INTO test(email, password) VALUES ('${req.body.email}', '${req.body.password}');`,
        (err, rows, fields) => {
        if (err) throw err;
    });
    req.session.loggedin = true;
    req.session.email = req.body.email;
    req.session.password = req.body.password;
    req.session.save( () => {
        res.redirect('/');
    });
})

app.get('/logout', (req, res) => {
    req.session.destroy(function (err) {
        res.redirect('/');
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

// connection.end();
