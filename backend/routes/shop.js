const express = require('express');
const firebase = require('../config');
const multer = require('multer');
const uuid = require('uuid');

const router = express.Router();

// const storage = multer.diskStorage({
//     destination(req, file, callback) {
//       callback(null, './images');
//     },
//     filename(req, file, callback) {
//       callback(null, `${file.fieldname}_${Date.now()}_${file.originalname}.jpg`);
//     },
//   });
//   const upload = multer({ storage r});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

router.post("/addFood", upload.single('myImage'), async(req, res)=>{
    console.log("addFood")
    console.log(req.body);
    console.log(req.file);

    const storage = firebase.storage();
    const bucket = storage.bucket();


    const folder = 'images'
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
    
    const data = {
      shop_id:req.body.shop_id,
      name:req.body.name,
      price:req.body.price, 
      category:req.body.category,
      optionDetails: req.body.optionDetails,
      visible:req.body.visible==="true"?true:false,
      imageName: name,
      timestamp: req.body.timestamp,
      uri:"https://firebasestorage.googleapis.com/v0/b/" + bucket.name +"/o/"+ folder + "%2F"  + name + "?alt=media&token=" + token 
        }    

    let doc_id;     
    const snapshot = await firebase.firestore().collection("Foods").add(data)
    .then((docRef) => {
      console.log("Document written with ID: ", docRef.id);
      doc_id = docRef.id
  })
    .catch((error) => {
      console.error("Error adding document: ", error);
  });
  data.id = doc_id


  res.send({addFood:data, mag:"Add Compelet!!!"});
     
    

});


router.get("/getFoods",  async(req, res)=>{
  console.log("getFoods Shop: "+ req.query.shop_id);
  

  // เรียกวิธีการเพื่อรับข้อมูล
  const snapshot = await firebase.firestore().collection('Foods').where("shop_id", "==", req.query.shop_id).get();
  // console.log(snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()})))
  const data = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));

  //เรียงเวลา
  data.sort(function(a,b){
    return new Date(a.timestamp) - new Date(b.timestamp);
  });

  res.send(data)

});

router.post("/editFood", upload.single('myImage'), async(req, res)=>{
  console.log("editFood");


  if(req.body.imageChange){
    console.log("imageChange: "+req.body.imageChange);
    const storage = firebase.storage();
    const bucket = storage.bucket();


    const folder = 'images'
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
    const visible = req.body.visible==="true"?true:false;
    
    const data = {
      shop_id:req.body.shop_id,
      name:req.body.name,
      price:req.body.price,
      category:req.body.category,
      optionDetails: req.body.optionDetails,
      visible: visible,
      imageName: name,
      timestamp: req.body.timestamp,
      uri:"https://firebasestorage.googleapis.com/v0/b/" + bucket.name +"/o/"+ folder + "%2F"  + name + "?alt=media&token=" + token 
        }    

    await firebase.firestore().collection("Foods").doc(req.body.id).set(data);
      
    res.send({mag:"Upload complete!", food_update:data});

  }
  else{
    console.log("imageChange: "+req.body.imageChange);
    // const visible = req.body.visible===true?"on":"off";
    const data = {
      category: req.body.category,
      name: req.body.name,
      price: req.body.price,
      shop_id: req.body.shop_id,
      optionDetails: req.body.optionDetails,
      visible: req.body.visible,
      timestamp: req.body.timestamp,
      imageName: req.body.imageName,
      uri: req.body.uri,
    }
    await firebase.firestore().collection("Foods").doc(req.body.id).set(data);

    res.send({mag:"Upload complete!", uri: req.body.uri});
  }
  



});


router.post("/deleteFood",  async(req, res)=>{
  console.log("deleteFood: "+req.body.id,req.body.imageName)

  const storage = firebase.storage();
  const folder = 'images'

  await firebase.firestore().collection("Foods").doc(req.body.id).delete();
  await storage.bucket().file(folder+"/"+req.body.imageName).delete();

  res.send({mag:"Deleted", id:req.body.id})

});

router.post("/setVisibleFood",  async(req, res)=>{
  console.log("setVisibleFood: "+req.body.id, req.body.visible)

  const visible = req.body.visible;


  await firebase.firestore().collection("Foods").doc(req.body.id).update({
    visible: visible
  });

  res.send({mag:"setVisibleFood Complete!!!", id:req.body.id, visible:visible})

});

router.post("/setVisibleShop",  async(req, res)=>{
  console.log("setVisibleShop: "+req.body.id, req.body.visible)

  const visible = req.body.visible;


  await firebase.firestore().collection("Users").doc(req.body.id).update({
    visible: visible
  });

  res.send({mag:"setVisibleShop Complete!!!", id:req.body.id, visible:visible})

});

//Order


//GetOrders
router.get("/getOrders",  async(req, res)=>{
  console.log("getOrders Shop: "+ req.query.shop_id);
  

  // เรียกวิธีการเพื่อรับข้อมูล
  const snapshot = await firebase.firestore().collection('Orders').where("shop_id", "==", req.query.shop_id).get()
  const data = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));

  //เรียงเวลา
  data.sort(function(a,b){
    return new Date(a.timestamp) - new Date(b.timestamp);
  });

  res.send(data)
});







//PostChangeStatus Order
router.post("/ordersPendingToProcess",  async(req, res)=>{
  console.log("ordersPendingToProcess: "+req.body.id)


  await firebase.firestore().collection("Orders").doc(req.body.id).update({
    status: 'process'
  });

  res.send({mag:"ordersPendingToProcess Complete!!!", id:req.body.id})

});

router.post("/ordersPendingToCancel",  async(req, res)=>{
  console.log("ordersPendingToCancel: "+req.body.id)
  console.log("ordersPendingToCancel: "+req.body.shop_id)


  await firebase.firestore().collection("Orders").doc(req.body.id).update({
    status: 'cancel'
  });

  const snapshot = await firebase.firestore().collection('Orders').where("shop_id", "==", req.body.shop_id).get()
  const orders = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));

    const queue = orders.filter((order) => {
      if(order.status != "complete" && order.status != "payment" && order.status != "cancel"){
        return order;
      }
    });
    // console.log(queue.length)
    
    await firebase.firestore().collection("Users").doc(req.body.shop_id).update({
      shop_queue: queue.length
    });

  res.send({mag:"ordersPendingToCancel Complete!!!", id:req.body.id})

});




router.post("/ordersProcessToPayment",  async(req, res)=>{
  console.log("ordersProcessToPayment: "+req.body.id)


  await firebase.firestore().collection("Orders").doc(req.body.id).update({
    status: 'payment'
  });

  const snapshot = await firebase.firestore().collection('Orders').where("shop_id", "==", req.body.shop_id).get()
  const orders = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));

    const queue = orders.filter((order) => {
      if(order.status != "complete" && order.status != "payment" && order.status != "cancel"){
        return order;
      }
    });
    // console.log(queue.length)
    
    await firebase.firestore().collection("Users").doc(req.body.shop_id).update({
      shop_queue: queue.length
    });

  res.send({mag:"ordersProcessToPayment Complete!!!", id:req.body.id})

});

router.post("/ordersPaymentToComplete",  async(req, res)=>{
  console.log("ordersPaymentToComplete: "+req.body.id)
  console.log("user_id: "+req.body.user_id)

  await firebase.firestore().collection("Orders").doc(req.body.id).update({
    status: 'complete'
  });

  await firebase.firestore().collection("Users").doc(req.body.user_id).update({
    blacklist: false
  });

  res.send({mag:"ordersPaymentToComplete Complete!!!", id:req.body.id})

});

router.post("/ordersPaymentToBlackList",  async(req, res)=>{
  

  console.log("ordersPaymentToBlackList: "+req.body.id)
  console.log("user_id: "+req.body.user_id)

  await firebase.firestore().collection("Orders").doc(req.body.id).update({
    status: 'blacklist'
  });

  await firebase.firestore().collection("Users").doc(req.body.user_id).update({
    blacklist: true
  });

  res.send({mag:"ordersPaymentToBlackList Complete!!!", id:req.body.id})

});





exports.router = router;