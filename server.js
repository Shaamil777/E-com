const path = require('path')
const express=require('express')
const userRoutes = require('./routers/user')
const adminRoutes = require('./routers/admin')
const app = express()
const startCronJobs = require('./config/startCronJobs')
const connectDB = require('./db/connectDB')
const session = require('express-session')
const passport = require('./config/passport')
const userAuth = require('./middleware/userAuth')
require('dotenv').config()

app.set('view engine','ejs')

app.set('views',path.join(__dirname,'views'))

app.use(session({
    secret:'MuhammadShamilm2324',
    resave:false,
    saveUninitialized:false,
    cookie:{
        secure:false,
        maxAge:24*60*60*1000
    }
}));

connectDB();
app.use(express.static(path.join(__dirname,'public')))
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(userAuth)

app.use(passport.initialize())
app.use(passport.session())

app.use('/',userRoutes);
app.use('/admin',adminRoutes)

startCronJobs()

app.listen(3000,()=>{
    console.log("server is running");
})