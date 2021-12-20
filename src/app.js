require("dotenv").config();
const cors = require('cors')
const Router = require('./V1/routes');
const express = require('express');
const app = express();
const port = process.env.PORT ?? 3001; //pour le port de heroku ou celui que nous choisissons pour localhost
const path = require('path');

app.use(cors());
app.use(express.static(path.join(__dirname,'./V1/upload')));
app.use(express.json());
app.use(Router);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});