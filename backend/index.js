const express = require('express');
const cors = require('cors');
const app = express();
// const https = require(`https`);
// const fs = require(`fs`);

app.use(cors());



app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));


const shopRouter = require('./routes/shop');
const userRouter = require('./routes/user');

app.use(shopRouter.router);
app.use(userRouter.router);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log("http://localhost:5000 or http://10.0.2.2:5000"));
// https.createServer(options, (req, res) => {
//     res.writeHead(200);
//     res.end(`hello world\n`);
//   }).listen(8000);