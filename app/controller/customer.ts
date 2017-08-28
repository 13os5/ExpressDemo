import  {Router,Request,Response} from 'express';
import { MongoClient,ObjectID } from 'mongodb';


const router:Router=Router();
var mongodb;

router.get('/',  (req:Request, res:Response) => {
    mongodb.collection("customer").find().toArray().then((data)=> {
        res.json(data);
    });
});

//get value by _id
router.get('/findByID/:id',  (req:Request, res:Response) => {
    let id=new ObjectID(req.params.id);
    mongodb.collection("customer").findOne({_id:id})
        .then((data)=> {
        res.json(data);
    });
});

//post
//test post in postman
//router.post('/',  (req:Request, res:Response) => {
    //ข้อมูลที่ได้มากจากการ post จะเป็น req.body
   //res.json(req.body);
//});
router.post('/',  (req:Request, res:Response) => {
    //ข้อมูลที่ได้มากจากการ post จะเป็น req.body
    //insert into mongodb from post in postman
    let data=req.body;
    mongodb.collection("customer").insertOne(data).then((data)=>{
        res.json(data);
    });
    //res.json(req.body);
});
//search
router.post('/search',  (req:Request, res:Response) => {
    //ข้อมูลที่ได้มากจากการ post จะเป็น req.body
    //insert into mongodb from post in postman
    
    let ret={
        row:[],
        total:Number
    };
    let data=req.body;
    mongodb.collection("customer").find({
        cusName: new RegExp(`${data.searchText}`)
    }).skip(data.numPage*data.rowPerPage)
    .limit(data.rowPerPage)
    .toArray().then((datas)=>{
        ret.row=datas;
        mongodb.collection("customer").find({
        cusName: new RegExp(`${data.searchText}`)
    }).count().then((num)=>{
                ret.total=num; 
                res.json(ret);
            });
       
       
    });
    //res.json(req.body);
});
//delete
///:id คือ parameter ที่รับเข้ามา ในรูปแบบของ url
router.delete('/:id',  (req:Request, res:Response) => {
    // req.params.id คือ parameter ที่ได้ ObjectID คือ _id จาก mongodb
    // ถ้าเป็น ฟิล ธรรมดา ไม่ต้องใช้ ObjectID แค่เปลี่ยน _id เป็น ชื่อฟิล เลย
    let id=new ObjectID(req.params.id);
    mongodb.collection("customer").deleteOne({_id : id}).then((data)=>{
        res.json(data);
    });
});

//put
router.put('/:id',  (req:Request, res:Response) => {
   
    let id=new ObjectID(req.params.id);
    let data=req.body;
    mongodb.collection("customer").updateOne({_id : id},data).then((data)=>{
        res.json(data);
    });
});

MongoClient.connect("mongodb://localhost:27017/issuedb", (err, db) => {

    if (err) {
        console.log(err);
    }
    else {
        mongodb = db;

    }
});

export const CustomerController:Router=router;