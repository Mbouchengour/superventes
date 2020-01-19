import { Component, OnInit } from '@angular/core';
import { AuthentificationService } from '../services/authentification.service';
import { ActivatedRoute, Params } from '@angular/router';
import { ProduitsService } from '../services/produits.service';
import { Router } from "@angular/router";
import { Observable } from 'rxjs';
import { PanierService } from '../services/panier.service';



@Component({
  selector: 'app-produits',
  templateUrl: './produits.component.html',
  styleUrls: ['./produits.component.css']
})
export class ProduitsComponent implements OnInit {

  private user: Observable<string>;
  private produits: Object[] = new Array();


  constructor(private route: ActivatedRoute, private authService: AuthentificationService, private produitsService: ProduitsService, private PanierService: PanierService, private router: Router) { 
    this.user = this.authService.getUser();
  }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      if (params["categorie"] !== undefined) {
        this.produitsService.getProduitsParCategorie(params["categorie"]).subscribe(produits => { this.produits = produits;
          //console.log("Produits : "+JSON.stringify(this.produits)); 
        })
      }
      else{
        this.produitsService.getProduits().subscribe(produits => {
          this.produits = produits;
        });
      }
    });
  }

  onAddToCart(produit){
    var e;
    this.user.subscribe(email=>{e = email;})

    this.PanierService.panierAjouterProduit({"email":e, "nom":produit}).subscribe(reponse => {
      if (reponse['resultat']){
        console.log("Message reçu : "+reponse["message"]);
        this.router.navigate(['/panier']);
      }
    });
  }


}
