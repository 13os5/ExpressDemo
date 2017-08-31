"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mongodb_1 = require("mongodb");
var myConfig = require("config");
var mongodb_2 = require("../helpers/mongodb");
var async = require("async");
var config = myConfig.get('Config');
var router = express_1.Router();
// router.use(auth.authenticate());
router.get('/', function (req, res) {
    mongodb_2.mongodb.collection("company").find().toArray().then(function (data) {
        res.json(data);
    });
});
router.get('/findById/:id', function (req, res) {
    var id = new mongodb_1.ObjectID(req.params.id);
    mongodb_2.mongodb.collection("company").findOne({ _id: id })
        .then(function (data) {
        res.json(data);
    });
});
router.post('/', function (req, res) {
    var data = req.body;
    mongodb_2.mongodb.collection("company").insertOne(data).then(function (data) {
        res.json(data);
    });
});
router.delete('/:id', function (req, res) {
    var id = new mongodb_1.ObjectID(req.params.id);
    mongodb_2.mongodb.collection("company").deleteOne({ _id: id }).then(function (data) {
        res.json(data);
    });
});
router.put('/:id', function (req, res) {
    var id = new mongodb_1.ObjectID(req.params.id);
    var data = req.body;
    mongodb_2.mongodb.collection("company").updateOne({ _id: id }, data).then(function (data) {
        res.json(data);
    });
});
router.post('/search', function (req, res) {
    var ret = {
        rows: [],
        total: 0
    };
    var data = req.body;
    mongodb_2.mongodb.collection("company").find({
        compName: new RegExp("" + data.searchText)
    }).skip(data.numPage * data.rowPerPage)
        .limit(data.rowPerPage)
        .toArray().then(function (rows) {
        ret.rows = rows;
        mongodb_2.mongodb.collection("company").find({
            compName: new RegExp("" + data.searchText)
        }).count().then(function (data) {
            ret.total = data;
            res.json(ret);
        });
    });
});
router.post('/find', function (req, res) {
    var ret = {
        rows: [],
        total: 0
    };
    var data = req.body;
    async.parallel([
        function (callback) {
            mongodb_2.mongodb.collection("company").find({
                compName: new RegExp("" + data.searchText)
            }).skip(data.numPage * data.rowPerPage)
                .limit(data.rowPerPage)
                .toArray().then(function (rows) {
                callback(null, rows);
            });
        },
        function (callback) {
            mongodb_2.mongodb.collection("company").find({
                compName: new RegExp("" + data.searchText)
            }).count().then(function (data) {
                callback(null, data);
            });
        }
    ], function (err, results) {
        var ret = {
            rows: results[0],
            total: results[1]
        };
        res.json(ret);
    });
});
exports.CompanyController = router;
//# sourceMappingURL=D:/Train_AungularJS/IssueAPI/controller/company.js.map