require("dotenv").config();
const Router = require('./routes');
const express = require('express');
const app = express();
const port = 3001;

app.use(express.json());
app.use(Router);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});


//TODO: FK delete on cascade ? pour quand on supprime un user -> tous les meals et order reliés à cet user sont aussi supprimé
//TODO: transaction quand on crée une commande avec order et meal -> pour ne pas que un autre user prenne le meme repas qu'un autre en même temps