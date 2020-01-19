import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { PanierService } from "../services/panier.service";
import { AuthentificationService } from 'src/app/services/authentification.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-panier',
  templateUrl: './panier.component.html',
  styleUrls: ['./panier.component.css']
})
export class PanierComponent implements OnInit {
  id: string;
  private panier: Object[];
  private dataProduitPanier = {"email":"", "nom":""};
  private user:Subject<string> = new BehaviorSubject<string>(undefined);
  private email: string;

  constructor(
    private panierService: PanierService,
    private router: Router,
    private authService: AuthentificationService
   ) 
   {
    this.user = this.authService.getUser();
    this.user.subscribe(email=>{this.email = email;});
    this.dataProduitPanier["email"] = this.email;
   }

  ngOnInit() {
    this.panierService.getPanier(this.email).subscribe(value => {
     this.panier = value;
    });
  }

  moinsUn(nom){ 
  this.dataProduitPanier["nom"] = nom;
    this.panierService.panierRetraitUn(this.dataProduitPanier).subscribe(value => {
      this.panier = value;
    });
  }

  plusUn(nom){
    this.dataProduitPanier["nom"] = nom;
    this.panierService.panierAjoutUn(this.dataProduitPanier).subscribe(value => {
      this.panier = value;
    });
  }

  supprimerProduit(nom){
    this.dataProduitPanier["nom"] = nom;
    this.panierService.panierSupprimerProduit(this.dataProduitPanier).subscribe(value => {
      this.panier = value;
      this.router.navigate(['/produits']);
    });
  }

  validerCommande(){
    this.panierService.validerCommande(this.email).subscribe(value => {
      this.panier = value;
      this.router.navigate(['/produits']);
    });
  }

}
