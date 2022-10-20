const express = require('express')
const router = express.Router()

const { getAllUsers, insertUser, removeUser, updateUser, login, auth } = require('../controllers/user.controller')

router.get('/', getAllUsers)
router.post('/new', insertUser)
router.delete('/delete/:id', removeUser)
router.put('/update/:id', updateUser)
router.post('/login', login)
router.get('/auth/:token', auth)

module.exports  = router