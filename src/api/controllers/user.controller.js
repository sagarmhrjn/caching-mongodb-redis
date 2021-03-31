const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require('dotenv').config();

const User = require("../models/user.model");

exports.signUp = async (req, res) => {
    try {
        const user = await User.find({ email: req.body.email }).exec();
        if (user.length >= 1) {
            return res.status(409)
                .json({
                    message: "Email exists!"
                });
        } else {
            const hash = await bcrypt.hash(req.body.password, 10);
            const newUser = new User({
                _id: mongoose.Types.ObjectId(),
                email: req.body.email,
                password: hash
            });
            await newUser.save()
            res.status(201)
                .json({
                    message: 'User created'
                });
        }
    } catch (err) {
        res.status(500)
            .json({ error: err });
    }

};

exports.login = async (req, res) => {
    try {
        const user = await User.find({ email: req.body.email }).exec()
        if (user.length < 1) {
            return res.status(401).json({
                message: "Auth failed!"
            });
        }
        const result = await bcrypt.compare(req.body.password, user[0].password);

        if (result) {
            const token = jwt.sign(
                {
                    email: user[0].email,
                    userId: user[0]._id
                },
                process.env.JWT_KEY,
                {
                    expiresIn: "1h"
                }
            );
            return res.status(200).json({
                message: "Auth successful!",
                token: token
            });
        }
        res.status(401).json({
            message: "Auth failed!"
        });
    } catch (err) {
        res.status(500)
            .json({ error: err });
    }

};

exports.delete = async (req, res) => {
    try {
        await User.deleteOne({ _id: req.params.id }).exec();
    } catch (err) {
        res.status(500)
            .json({ error: err });
    }


};