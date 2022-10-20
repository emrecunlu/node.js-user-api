const mongoose = require('mongoose')
const UserModel = require('../models/user.model')
const fs = require('fs')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { upload } = require('../helpers/file')

module.exports.getAllUsers = async (req, res, next) => {
    const users = await UserModel.find()

    res.send(users)
}

module.exports.insertUser = async (req, res, next) => {
    const uploadImage = upload.single('avatar')

    uploadImage(req, res, async function (err) {
        if (err) {
            res.status(301).send({ type: 'error', message: err.message})
        } else {
            try {
                
                const requiredEmail = await UserModel.findOne({ email: req.body.email})

                if (requiredEmail) {
                    throw new Error('Zaten böyle bir e-posta adresi kayıtlı!')
                } else {
                    const user = new UserModel({
                        avatar: {
                            path: req.file.filename,
                            fullPath: req.file.path
                        },
                        ...req.body
                    })
        
                    const newUser = await user.save()
        
                    if (newUser) {
                        res.status(201).send({ type: 'success', message: 'Kullanıcı kaydı başarılı.', user: newUser})
                    }
                }

            } catch(err) {

                console.log(err.message)
                
                fs.unlinkSync(req.file.path)

                res.status(301).send({ type: 'error', message: err?.message || err._message})
            }
        }
    })
}

module.exports.removeUser = async (req, res, next) => {
    const {id} = req.params

    if (mongoose.isValidObjectId(id)) {
        
        const user = await UserModel.findById(id)

        if (user) {
            const deleteUser = await UserModel.findByIdAndRemove(id)

            if (deleteUser) {
                
                fs.unlinkSync(deleteUser.avatar.fullPath)

                res.send({ type: 'success', message: 'Kullanıcı başarıyla silindi!'})
            } else {
                res.send({ type: 'error', message: deleteUser._message})
            }
        } else {
            res.send({ type: 'error', message: 'Böyle bir kullanıcı bulunamadı!'})
        }
    } else {
        res.send({ type: 'error', message: 'Lütfen geçerli bir id giriniz.'})
    }
}

module.exports.updateUser = async (req, res, next) => {
    const {id} = req.params

    if (mongoose.isValidObjectId(id)) {
        const user = await UserModel.findById(id)
        
        if (user) {

            const uploadImage = upload.single('avatar')

            uploadImage(req, res, async function (err) {
                if (req.file) {
                    
                    fs.unlinkSync(user.avatar.fullPath) 

                    const updatedUser = await UserModel.findByIdAndUpdate(id, {
                        avatar: {
                            path: req.file.filename,
                            fullPath: req.file.path
                        },
                        ...req.body
                    })
                        
                    if (updatedUser) {
                        res.send({ type: 'succes', message: 'Kullanıcı başarıyla güncellendi!', user: updatedUser})
                    } else {
                        res.send({ type: 'error', message: updatedUser._message})
                    }
                } else {
                    const updatedUser = await UserModel.findByIdAndUpdate(id, req.body)

                    if (updatedUser) {
                        res.send({ type: 'succes', message: 'Kullanıcı başarıyla güncellendi!', user: updatedUser})
                    } else {
                        res.send({ type: 'error', message: updatedUser._message})
                    }
                }
            })
        } else {
            res.send({ type: 'error', message: 'Böyle bir kullanıcı bulunamadı!'})
        }
    }
    else {
        res.send({ type: 'error', message: 'Lütfen geçerli bir id giriniz.'})
    }
}

module.exports.login = async (req, res, next) => {
    const {email, password} = req.body

    const user = await UserModel.findOne({ email})

    if (user) {

        const validPassword = await bcrypt.compare(password, user.password) 

        if (validPassword) {
            const token = jwt.sign({ email, password}, process.env.SECRET_KEY, {
                expiresIn: 60 * 60
            })

            res.send({ type: 'success', message: 'Giriş başarılı!', auth: true, token})
        } else {
            res.status(401).send({ type: 'error', message: 'E-posta adresi veya şifre hatalı!'}) 
        }
     } else {
        res.status(401).send({ type: 'error', message: 'E-posta adresi veya şifre hatalı!'})
    }
}

module.exports.auth = async (req, res, next) => {
    const {token} = req.params

    if (token) {
        try {
            const user = jwt.verify(token, process.env.SECRET_KEY)

            res.send({ type: 'success', message: 'Giriş başarılı!', auth: true})
        } catch(err) {
            res.status(401).send({ type: 'error', message: 'Lütfen giriş yapınız, token geçersiz.'})
        }
    } else {
        res.status(401).send({ type: 'error', message: 'Lütfen giriş yapınız, token geçersiz.'})
    }
}