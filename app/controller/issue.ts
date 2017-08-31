import { Router, Request, Response } from 'express';
import { MongoClient, ObjectID } from 'mongodb';
import * as myConfig from 'config';
import { mongodb } from '../helpers/mongodb';
import * as auth from '../helpers/auth';
import * as async from 'async';
import * as multer from 'multer';
import * as shortid from 'shortid';
import * as fs from 'fs';
var mailer = require("nodemailer");

let config: any = myConfig.get('Config');
const router: Router = Router();
//router.use(auth.authenticate());

var smtpTransport = mailer.createTransport(config.smtp);
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let folder = config.uploadPathAttach + req.params.folderName;
        console.log(folder);
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
        cb(null, folder);
    },
    filename: function (req, file, cb) {
        console.log(file);
        cb(null, file.originalname);
    }
})

var upload = multer({ storage: storage });

router.get('/', (req: Request, res: Response) => {
    mongodb.collection("issue").find().toArray().then((data) => {
        res.json(data);
    });
});

router.get('/findById/:id', (req: Request, res: Response) => {
    let id = new ObjectID(req.params.id);
    mongodb.collection("issue").findOne({ _id: id }).then((data) => {
        res.json(data);
    });
});

router.post('/', (req: Request, res: Response) => {
    let data = req.body;
    data.issueno = shortid.generate();
    mongodb.collection("issue").insertOne(data).then((data) => {
        var mail = {
            to: 'to@email.com',
            subject: `Your issue no ${data.issueno}`,
            html: `
                <h4>Your issue no ${data.issueno}</h4>
                <b>Thank you</b>
            `
        }
        smtpTransport.sendMail(mail, function (error, response) {
            smtpTransport.close();
            if (error) {
                res.json(error);
            } else {
                res.json(data);
            }
        });
        
    });
});

router.delete('/:id', (req: Request, res: Response) => {
    let id = new ObjectID(req.params.id);
    mongodb.collection("issue").deleteOne({ _id: id }).then((data) => {
        res.json(data);
    });
});

router.put('/:id', (req: Request, res: Response) => {
    let id = new ObjectID(req.params.id);
    let data = req.body;
    mongodb.collection("issue").updateOne({ _id: id }, data).then((data) => {
        res.json(data);
    });
});

router.post('/search', (req: Request, res: Response) => {
    let ret = {
        rows: [],
        total: 0
    };
    let data = req.body;
    mongodb.collection("issue").find(
        {
            compName: new RegExp(`${data.searchText}`)
        }
    ).skip(data.numPage * data.rowPerPage)
        .limit(data.rowPerPage)
        .toArray().then((rows) => {
            ret.rows = rows;
            mongodb.collection("issue").find(
                {
                    compName: new RegExp(`${data.searchText}`)
                }
            ).count().then((data) => {
                ret.total = data;
                res.json(ret);
            })
        });
});

router.post('/find', (req: Request, res: Response) => {
    let ret = {
        rows: [],
        total: 0
    };
    let data = req.body;
    async.parallel([
        function (callback) {
            mongodb.collection("issue").find(
                {
                    compName: new RegExp(`${data.searchText}`)
                }
            ).skip(data.numPage * data.rowPerPage)
                .limit(data.rowPerPage)
                .toArray().then((rows) => {
                    callback(null, rows);
                });
        },
        function (callback) {
            mongodb.collection("issue").find(
                {
                    compName: new RegExp(`${data.searchText}`)
                }
            ).count().then((data) => {
                callback(null, data);
            })
        }
    ],
        function (err, results) {
            let ret = {
                rows: results[0],
                total: results[1]
            }

            res.json(ret);
        });
});
router.post('/profile/:id', upload.single('avatar'), (req: Request, res: Response) => {
    console.log(req.body);
    res.json({
        success: true
    });
});

router.get('/profile/:id', (req: Request, res: Response) => {
    fs.readFile(`${config.IssueFileUpload}/${req.params.id}`, (err, data) => {
        if (!err) {
            res.write(data);
            res.end();
        } else {
            res.end();
        }
    });
});

//upload file
router.post('/attach/:folderName', upload.single('attach'), (req: Request, res: Response) => {
    res.json({
        success: true
    });
});

//get file
router.get('/attach/:folderName', (req: Request, res: Response) => {
    let folder = config.uploadPathAttach + req.params.folderName;
    if (fs.existsSync(folder)) {
        fs.readdir(folder, (err, files) => {
            res.json(files);
        });
    } else {
        res.json([]);
    }

});
router.get('/view-attach/:folderName/:fileName', (req: Request, res: Response) => {
    fs.readFile(`${config.uploadPathAttach}${req.params.folderName}/${req.params.fileName}`, (err, data) => {
        if (!err) {
            res.write(data);
            res.end();
        } else {
            res.end();
        }
    });
});
router.delete('/del-attach/:folderName/:fileName', (req: Request, res: Response) => {

    fs.unlink(`${config.uploadPathAttach}${req.params.folderName}/${req.params.fileName}`, (err) => {

        if (!err) {
            res.json({
                success: true
            });
        } else {
            res.end();
        }
    });
});


export const IssueController: Router = router;