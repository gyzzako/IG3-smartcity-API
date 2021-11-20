require("dotenv").config();
var cors = require('cors')
const Router = require('./routes');
const express = require('express');
const app = express();
const port = 3001;

app.use(express.static('./upload'));
app.use(cors()); //TODO: a voir avec le prof car son tuto pour accéder à notre api depuis react ne fonctionne pas -> donc ça en attentant
app.use(express.json());
app.use(Router);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});


//TODO: FK delete on cascade ? pour quand on supprime un user -> tous les meals et order reliés à cet user sont aussi supprimé
//TODO: transaction quand on crée une commande avec order et meal -> pour ne pas que un autre user prenne le meme repas qu'un autre en même temps