require("dotenv").config();
var cors = require('cors')
const Router = require('./V1/routes');
const express = require('express');
const app = express();
const port = 3001;

app.use(express.static('./src/V1/upload'));
app.use(cors());
app.use(express.json());
app.use(Router);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

//TODO: transaction quand on crée une commande avec order et meal -> pour ne pas que un autre user prenne le meme repas qu'un autre en même temps