// const firebase = require("firebase-admin");
// const firebase = require("firebase");
// const firebaseConfig = {
//     apiKey: "AIzaSyDDkOZbNBHph_WyWhI2dWVSRhs65wjbPHM",
//     authDomain: "testdata-aa4cf.firebaseapp.com",
//     projectId: "testdata-aa4cf",
//     storageBucket: "testdata-aa4cf.appspot.com",
//     messagingSenderId: "286861446001",
//     appId: "1:286861446001:web:79c19606b0ce8312e004d0",
//     measurementId: "G-VYSLH8SL0L"
//   };

// firebase.initializeApp(firebaseConfig);

// // const firebase = firebase.firestore();
// const firebaseDb = firebase;

// module.exports = firebaseDb; 
var admin = require("firebase-admin");
var serviceAccount = require("./mobileproject-2d0b3-firebase-adminsdk-2oe6c-782cfd3e05.json");

const firebase = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket:"gs://mobileproject-2d0b3.appspot.com",
  // databaseURL:"https://testdata-aa4cf-default-rtdb.asia-southeast1.firebasedatabase.app/"
});


module.exports = firebase;

