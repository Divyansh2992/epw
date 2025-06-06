const express=require("express");
const app=express();
const fs = require('fs');
const path = require('path');
const epwRoutes = require('./routes/epw');

app.use('/api/epw', epwRoutes);

app.listen(3000,()=>{
    console.log("Server is listening on port 3000");
})