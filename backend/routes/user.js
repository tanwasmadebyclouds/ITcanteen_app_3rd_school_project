const express = require('express');
const firebase = require('../config');
const multer = require('multer');
const uuid = require('uuid');

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024
    }
  });


router.post("/addOrders",  async(req, res)=>{
    console.log("addOrders");
    const data = req.body;

    await firebase.firestore().collection("Orders").doc().set(data);

    const snapshot = await firebase.firestore().collection('Orders').where("shop_id", "==", data.shop_id).get()
    const orders = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));

    const queue = orders.filter((order) => {
      if(order.status != "complete" && order.status != "payment"){
        return order;
      }
    });
    // console.log(queue.length)
    
    await firebase.firestore().collection("Users").doc(data.shop_id).update({
      shop_queue: queue.length
    });

    res.send({mag:"addOrders Compelet!!!", shop_queue:queue.length});

});

router.post("/login",  async(req, res)=>{
    
  console.log("Login Username:"+req.body.username);

   const snapshot = await firebase.firestore().collection("Users").where("username", "==", req.body.username).where("password", "==", req.body.password).get();
//    console.log(snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()})))
   const user_data = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
   if(user_data.length != 0){
    console.log("login Compelet!!!")
    console.log(user_data[0])
    res.send(user_data[0]);
   }
   else{
    console.log("login Fail!!!")
    res.status(404).send({mag:"login Fail!!!"});
   }

});


/////// Shop
router.post("/editProfileShop", upload.single('myImage'), async(req, res)=>{
    console.log("editProfileShop", req.body.id);
    console.log(req.body);
  
  
    if(req.body.imageChange){
      console.log("imageChange: "+req.body.imageChange);
      const storage = firebase.storage();
      const bucket = storage.bucket();
  
  
      const folder = 'profileShop'
      const token = uuid.v1();
      const name = uuid.v1();
      const fileName = `${folder}/${name}`
      const fileUpload = bucket.file(fileName);
      const blobStream = fileUpload.createWriteStream({
        metadata: {
          contentType: req.file.mimetype,
          metadata: {
            firebaseStorageDownloadTokens: token
          }
        }
      })
  
      blobStream.on('error', (err) => {
        res.status(405).json(err);
      });
  
      blobStream.on('finish', () => {
        
      });
      blobStream.end(req.file.buffer); 
  
      //ลบรูปเก่า
      await storage.bucket().file(folder+"/"+req.body.oldImageName).delete();

      
      const data = {
        name:req.body.name,
        phone:req.body.phone,
        shop_name:req.body.shop_name,
        imageName: name,
        uri:"https://firebasestorage.googleapis.com/v0/b/" + bucket.name +"/o/"+ folder + "%2F"  + name + "?alt=media&token=" + token 
          }
  
          await firebase.firestore().collection("Users").doc(req.body.id).update({
            name:req.body.name,
            phone:req.body.phone,
            shop_name:req.body.shop_name,
            imageName: name,
            uri:"https://firebasestorage.googleapis.com/v0/b/" + bucket.name +"/o/"+ folder + "%2F"  + name + "?alt=media&token=" + token 
          });
        
      res.send({mag:"Upload complete!", food_update:data});
  
    }
    else{
      console.log("imageChange: "+req.body.imageChange);
      // const visible = req.body.visible===true?"on":"off";

      const data = {
        name:req.body.name,
        phone:req.body.phone,
        shop_name:req.body.shop_name,
        imageName: req.body.imageName,
        uri: req.body.uri
          }
      
      await firebase.firestore().collection("Users").doc(req.body.id).update({
        name:req.body.name,
        phone:req.body.phone,
        shop_name:req.body.shop_name,
      });
  
      res.send({mag:"Upload complete!",food_update:data});
    }
    
  
  
  
  });

exports.router = router;