const express = require('express');
const { appendFile } = require('fs-extra');
const ejs = require('ejs')
const rout = require('./routs')

const app = express();

app.use(express.json())
app.use(rout)

// listening on port
const port = process.env.PORT || 5000;
app.listen(port,()=>{
    console.log(`port is runing on ${port}`)
})