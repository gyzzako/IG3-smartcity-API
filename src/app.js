const express = require('express');
const app = express();

const port  = process.env.port || 3000;

//test
app.get('/',(req,res) =>{
    res.send(`<h2>Hello Smartcity</2>`)
});

app.listen(port,() => console.log(`The server is running on port ${port}`));