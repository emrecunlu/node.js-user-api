const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const dotenv = require('dotenv')
const bodyParser = require('body-parser')

const userRoutes = require('./app/routes/user.route')

dotenv.config()

const app = express()

app.use(express.static(path.join(__dirname, 'static')))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded( { extended: true}))

app.use('/api/users', userRoutes)

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true})
.then(result => app.listen(3000))
.catch(err => console.log(err))

