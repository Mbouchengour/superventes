const express = require ('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});
//app.use(require("cors")); // méthode alternative

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectId;
const url = "mongodb://localhost:27017";
const router = express.Router();

app.listen(8888);



MongoClient.connect(url, {useUnifiedTopology: true,useNewUrlParser: true}, (err, client) => {
    let db = client.db("superventes");

    /* Liste des produits */
    app.get("/produits", (req, res) => {
        console.log("/produits");
        try{
            db.collection("produits").find().toArray((err, documents) => {
                res.end(JSON.stringify(documents));
            });
        } catch(e) {
            console.log("Erreur sur /produits : " + e);
            res.end(JSON.stringify([]));
        }
    });

    app.get("/produits/:categorie", (req, res) => {
        let categorie = req.params.categorie;
        console.log("/produits/"+categorie);
        try{
            db.collection("produits").find({type:categorie}).toArray((err, documents) => {
                res.end(JSON.stringify(documents));
            });
        } catch(e) {
            console.log("Erreur sur /produits/"+categorie+" : " + e);
            res.end(JSON.stringify([]));
        }
    });

    /* Liste des catégories de produits */
    app.get("/categories", (req, res) => {
        console.log("/categories");
        categories = [];
        try{
            db.collection("produits").find().toArray((err, documents) => {
                for (let doc of documents) {
                    if (!categories.includes(doc.categorie)) 
                        categories.push(doc.categorie);
                }
                console.log("Renvoi de "+JSON.stringify(categories));
                res.end(JSON.stringify(categories));
            });
        } catch(e) {
            console.log("Erreur sur /categories : " + e);
            res.end(JSON.stringify([]));
        }
    });



    /* Connexion */
    app.post("/membres/connexion", (req, res) => {
        console.log("/membres/connexion avec "+JSON.stringify(req.body));
        try{
            db.collection("membres")
            .find(req.body)
            .toArray((err, documents) => {
                if (documents.length == 1){
                	//window.localStorage.setItem('auth', "authentifie");
                    res.end(JSON.stringify({"resultat": 1, "message": "Authentification réussie"}));
                }
                else res.end(JSON.stringify({"resultat": 0, "message": "Email et/ou mot de passe incorrect"}));
            });
        } catch(e) {
            res.end(JSON.stringify({"resultat": 0, "message": e}));
        }
    });

    app.post("/membres/add", (req, res) => {
        let mdp1 = req.body.password1;
        let mdp2 = req.body.password2;
        let prenom = req.body.prenom;
        let trouve = false;
        db.collection("membres").find().toArray((err, documents) => {  
                for (let doc of documents) {
                        if(doc.email == req.body.email){ 
                            trouve = true;
                            
                            res.end(JSON.stringify({"resultat": 0, "message": "Un utilisateur est deja associé a cet email"}));
                        }
                        else {}
                }
                if(trouve == false){ 
                    if(mdp1 == mdp2){
                        if(trouve == false){
                                let user = '{"nom":"'+req.body.nom+'",'+
                                '"prenom":"'+req.body.prenom+'",'+
                                '"email":"'+req.body.email+'",'+
                                '"password":"'+req.body.password1+
                                '"}';
                                //console.log("user avant JSON avec "+user);
                                let userJson = JSON.parse(user);
                                try{
                                    let result = db.collection("membres").insertOne(userJson, function(err, res2){
                                    if(err) {}
                                    else {
                                        db.collection("paniers").insertOne({"proprio":req.body.email, "contenu":[]}, function(err, res3){
                                            if(err){}
                                            else{
                                                res.end(JSON.stringify({"resultat": 1, "message": "Membre Ajouté"}));
                                                //console.log("reussi");
                                            }
                                        });

                                    }
                                    });
                                }
                                catch(e) {
                                    res.end(JSON.stringify({"resultat": 0, "message": e}));
                                    console.log(e);
                                }
                        }
                        else {
                            
                        }
                    }
                    else {
                        res.end(JSON.stringify({"resultat": 0, "message": "Les mots de passe ne concordent pas"}));
                    }
                }
                else {
                    console.log("email deja present");
                }
        	});
        
    	});



});
