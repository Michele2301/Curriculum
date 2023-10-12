'use strict'
const PORT=3000;
const session = require("express-session");
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const app = express();
const staticExpress=require('express-static');

//SESSION
app.use(session({
    secret: "truyrytrr",
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.authenticate('session'));

//AUTHENTICATION
let userdao=require('./DAO/user_dao.js');
let LocalStrategy=require('passport-local');
passport.use(new LocalStrategy((username, password, callback) => {
    // verify function
    userdao.getUser(username, password).then((user) => {
        callback(null, user);
    }).catch((err) => {
        callback(null, false, err)
    });
}));

passport.serializeUser((user, callback) => {
    callback(null, user);
});
passport.deserializeUser((user, callback) => {
    callback(null, user);
});

//CORS
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
};
app.use(cors(corsOptions));

//MIDDLEWARE
const morgan=require('morgan');
app.use(express.json());
app.use(morgan('combined'));
app.use('/static',staticExpress('Public'));

//ROUTES
const router = require("./Routes/routes.js");

app.post('/api/login',  passport.authenticate('local'),(req, res) => {
    res.json({userId:req.user.userId,userName:req.user.userName,email:req.user.email,role:req.user.role});
});

app.post('/api/logout', (req, res) => {
    req.logout(()=>{res.end()});
});

app.get('/api/user', (req, res) => {
    if(req.user){
        res.status(200).json({userId:req.user.userId,userName:req.user.userName,email:req.user.email,role:req.user.role});
    }else{
        res.status(401).json({message:'Unauthorized'});
    }
})

app.use("/api", router);


app.listen(PORT, () => { console.log(`Server started on http://localhost:${PORT}/`) });