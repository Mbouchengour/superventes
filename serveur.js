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

        app.get("/panier/get/:email", (req, res) => {
            let email = req.params.email;
            panierResultat = [];

            var retour = function() {
                res.end(JSON.stringify(panierResultat));
            }

            try{
                db.collection("paniers").find({proprio:email}).toArray((err, paniers) => {

                    for (let panier of paniers) { 
                        if (panier != undefined){
                            console.log("contenu :"+JSON.stringify(panier.contenu));
                            var produits = panier.contenu;

                            var i = 1;
                            for(let p of produits){
                                if (p != undefined){
                                    try{
                                        console.log("nom :"+ p.nom);
                                        db.collection("produits").find({"nom":p.nom}).toArray((err, produitsDetailles) => {
                                            var produit = produitsDetailles[0];
                                            produit.quantite = p.quantite; 
                                            panierResultat.push(produit);
                                            
                                            if(i == produits.length) 
                                                retour();
                                            i++;
                                        });
                                    } catch(e) {
                                        res.end(JSON.stringify([])); 
                                    }
                                }
                            }
                        }
                    }

                });
            } catch(e) {
                console.log("Erreur sur /panier : " + e);
                res.end(JSON.stringify([]));
            }
        });

        app.post("/panier/ajouter", (req, res) => {
            let email = req.body.email;
            let nom = req.body.nom;

            try{
                db.collection("paniers").find({proprio:email}).toArray((err, paniers) => {
                    for (let panier of paniers) { 
                        if (panier != undefined){
                            console.log("contenu :"+JSON.stringify(panier.contenu));
                            var produits = panier.contenu;
                            var estDansPanier = false;
                            
                            var i = 0;
                            var indiceProduit = 0;
                            for(let p of produits){
                                if (p.nom == nom) {
                                    estDansPanier = true;
                                    indiceProduit = i;
                                }
                                i++;
                            }
                            if(estDansPanier){ 
                                produits[indiceProduit].quantite++;
                                try{
                                    db.collection("paniers").updateOne(
                                        {"proprio":email},
                                        {$set:{ "contenu" : produits}}
                                    );

                                    res.end(JSON.stringify({"resultat": 1, "message": "L'ajout a bien été pris en compte!"}));
                                } catch(e){
                                    console.log("Erreur ajout produit existant panier : "+e);
                                    res.end(JSON.stringify({"resultat": 0, "message": e}));
                                }
                            }
                            else{ 
                                produits.push({"nom":nom, "quantite" : 1});
                                try{
                                    db.collection("paniers").updateOne(
                                        {"proprio":email},
                                        {$set:{ "contenu" : produits}}
                                    );
                                    res.end(JSON.stringify({"resultat": 1, "message": "L'ajout a bien été pris en compte!"}));

                                } catch(e){
                                    console.log("Erreur ajout nouveau produit panier : "+e);
                                    res.end(JSON.stringify({"resultat": 0, "message": e}));
                                }
                
                            }
                           
                        }
                    }
                });

            } catch(e) {
                console.log("Erreur get panier : "+e);
                res.end(JSON.stringify({"resultat": "", "message": e}));
            }
        });

        app.post("/panier/ajoutUn", (req, res) => {
            console.log("/panier/ajoutUn/"+JSON.stringify(req.body));
            let email = req.body.email;
            let nom = req.body.nom;
            panierResultat = [];

            var retour = function() {
                console.log("Panier retourné:"+JSON.stringify(panierResultat));
                res.end(JSON.stringify(panierResultat));
            }

            try{
                db.collection("paniers").find({proprio:email}).toArray((err, paniers) => {

                    for (let panier of paniers) { 
                        if (panier != undefined){
                            console.log("contenu :"+JSON.stringify(panier.contenu));
                            var produits = panier.contenu;

                            var i = 1;
                            for(let p of produits){
                                try{
                                    db.collection("produits").find({"nom":p.nom}).toArray((err, produitsDetailles) => {
                                        var produit = produitsDetailles[0];
                                        if(p.nom == nom){
                                            var updateQuantite = p.quantite + 1;
                                            produit.quantite = updateQuantite; 
                                            p.quantite = updateQuantite;

                                            try{
                                                db.collection("paniers").updateOne(
                                                    {"proprio":email},
                                                    {$set:{ "contenu" : produits}}
                                                );

                                            } catch(e){
                                                console.log("erreur modif :"+e);
                                            }
                                        }

                                        else
                                            produit.quantite = p.quantite; 

                                        panierResultat.push(produit);
                                        
                                        if(i == produits.length) 
                                            retour();
                                        i++;
                                    });
                                } catch(e) {
                                    console.log("/produits/"+ nom + " : " + e);
                                    res.end(JSON.stringify([])); 
                                }
                            }
                        }
                    }

                });
            } catch(e) {
                console.log("Erreur sur /panier : " + e);
                res.end(JSON.stringify([]));
            }
        });

            app.post("/panier/retraitUn", (req, res) => {
                let email = req.body.email;
                let nom = req.body.nom;
                panierResultat = [];
    
                var retour = function() {
                    console.log("Panier retourné:"+JSON.stringify(panierResultat));
                    res.end(JSON.stringify(panierResultat));
                }
    
                try{
                    db.collection("paniers").find({proprio:email}).toArray((err, paniers) => {
    
                        for (let panier of paniers) { 
                            if (panier != undefined){
                                var produits = panier.contenu;
    
                                var i = 1;
                                var nbProduitsAvant = produits.length;
                                for(let p of produits){

                                    try{
                                        db.collection("produits").find({"nom":p.nom}).toArray((err, produitsDetailles) => {
                                            var produit = produitsDetailles[0];
                                            if(p.nom == nom){
                                                var updateQuantite = p.quantite - 1;
                                                produit.quantite = updateQuantite; 
                                                p.quantite = updateQuantite;
                                                if (updateQuantite < 1){
                                                    produits.pop(p);
                                                }
                                                else
                                                    panierResultat.push(produit);
                                                try{
                                                    db.collection("paniers").updateOne(
                                                    {"proprio":email},
                                                    {$set:{ "contenu" : produits}}
                                                    );
                                                } catch(e){
                                                    console.log("erreur modif :"+e);
                                                }
            
                                            }
    
                                            else{
                                                produit.quantite = p.quantite; 
                                                panierResultat.push(produit);
                                            }
                                            
                                            if(i == nbProduitsAvant) 
                                                retour();
                                            i++;
                                        });
                                    } catch(e) {
                                        console.log("/produits/"+ nom + " : " + e);
                                        res.end(JSON.stringify([])); 
                                    }
                                }
                            }
                        }
    
                    });
                } catch(e) {
                    console.log("Erreur sur /panier : " + e);
                    res.end(JSON.stringify([]));
                }
            });

        app.post("/panier/supprimer", (req, res) => {
            let email = req.body.email;
            let nom = req.body.nom;
            var panierResultat = [];

            try{
                db.collection("paniers").find({proprio:email}).toArray((err, paniers) => {

                    for (let panier of paniers) { 
                        if (panier != undefined){
                            console.log("contenu :"+JSON.stringify(panier.contenu));
                            var produits = panier.contenu;

                            var i = 1;
                            var nbProduitsAvant = produits.length;
                            for(let p of produits){

                                try{
                                    db.collection("produits").find({"nom":p.nom}).toArray((err, produitsDetailles) => {
                                       
                                        var produit = produitsDetailles[0];
                                        if(p.nom == nom){
                                            produits.pop(p); 

                                            try{
                                                db.collection("paniers").updateOne(
                                                    {"proprio":email},
                                                    {$set:{ "contenu" : produits}}
                                                );

                                            } catch(e){
                                                console.log("erreur modif :"+e);
                                            }
                                        }

                                        else{
                                            produit.quantite = p.quantite; 
                                            panierResultat.push(produit); 
                                        }
                                        
                                        if(i == nbProduitsAvant){
                                            console.log("Panier retourné:"+JSON.stringify(panierResultat));
                                            res.end(JSON.stringify(panierResultat));
                                        }
                                        i++; 

                                    });
                                } catch(e) {
                                    console.log("/produits/"+ nom + " : " + e);
                                    res.end(JSON.stringify([])); 
                                }
                            }
                        }
                    }

                });
            } catch(e) {
                console.log("Erreur sur /panier : " + e);
                res.end(JSON.stringify([]));
            }
        });

        app.get("/panier/validerPanier/:email", (req, res) => {
            let email = req.params.email;
            panierResultat = [];

            var retour = function() {
                console.log("Panier retourné:"+JSON.stringify(panierResultat));
                res.end(JSON.stringify(panierResultat));
            }
            
            try{
                db.collection("paniers").updateOne(
                {"proprio":email},
                {$set:{ "contenu" : [] }}
                );
                retour();
            } catch(e){
                console.log("erreur vidage panier :"+e);
                retour();
            }
        });

        
});
