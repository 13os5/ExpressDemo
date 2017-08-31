"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mongodb_1 = require("mongodb");
var myConfig = require("config");
var mongodb_2 = require("../helpers/mongodb");
var multer = require("multer");
var fs = require('fs');
var config = myConfig.get('Config');
var router = express_1.Router();
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, config.uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, req.params.id);
    }
});
var upload = multer({ storage: storage });
router.get('/', function (req, res) {
    mongodb_2.mongodb.collection("user").find().toArray().then(function (data) {
        res.json(data);
    });
});
//get value by _id
router.get('/findByID/:id', function (req, res) {
    var id = new mongodb_1.ObjectID(req.params.id);
    mongodb_2.mongodb.collection("user").findOne({ _id: id })
        .then(function (data) {
        res.json(data);
    });
});
router.post('/', function (req, res) {
    var data = req.body;
    mongodb_2.mongodb.collection("user").insertOne(data).then(function (data) {
        res.json(data);
    });
});
//search
router.post('/search', function (req, res) {
    var ret = {
        row: [],
        total: Number
    };
    var data = req.body;
    mongodb_2.mongodb.collection("user").find({
        userName: new RegExp("" + data.searchText)
    }).skip(data.numPage * data.rowPerPage)
        .limit(data.rowPerPage)
        .toArray().then(function (datas) {
        ret.row = datas;
        mongodb_2.mongodb.collection("user").find({
            userName: new RegExp("" + data.searchText)
        }).count().then(function (num) {
            ret.total = num;
            res.json(ret);
        });
    });
});
router.delete('/:id', function (req, res) {
    var id = new mongodb_1.ObjectID(req.params.id);
    mongodb_2.mongodb.collection("user").deleteOne({ _id: id }).then(function (data) {
        res.json(data);
    });
});
//put
router.put('/:id', function (req, res) {
    var id = new mongodb_1.ObjectID(req.params.id);
    var data = req.body;
    mongodb_2.mongodb.collection("user").updateOne({ _id: id }, data).then(function (data) {
        res.json(data);
    });
});
router.post('/profile/:id', upload.single('avatar'), function (req, res) {
    console.log(req.body);
    res.json({
        success: true
    });
});
router.get('/profile/:id', function (req, res) {
    fs.readFile(config.uploadPath + "/" + req.params.id, function (err, data) {
        if (!err) {
            res.write(data);
            res.end();
        }
        else {
            res.end();
        }
    });
});
exports.UserController = router;
//# sourceMappingURL=D:/Train_AungularJS/IssueAPI/controller/user.js.map