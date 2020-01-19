import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const httpOptions = {
    headers: new HttpHeaders({
      "Access-control-Allow-Methods": "GET,POST",
      "Access-control-Allow-Headers": "Content-type",
      "Content-type": "application/json",
      "Access-control-Allow-Origin": "*"
    })
  };

@Injectable({providedIn: 'root'})

export class PanierService {

    private urlBase: string = 'http://localhost:8888/';

    constructor(private http: HttpClient) {}

    getPanier(email): Observable<any> {
        return this.http.get(this.urlBase+'panier/get/'+email);
    }

    panierAjouterProduit(data): Observable<any> {
        return this.http.post(this.urlBase+'panier/ajouter', JSON.stringify(data), httpOptions);
    }

    panierSupprimerProduit(data): Observable<any> {
        return this.http.post(this.urlBase+'panier/supprimer', JSON.stringify(data), httpOptions);
    }

    panierAjoutUn(data): Observable<any> {
        return this.http.post(this.urlBase+'panier/ajoutUn', JSON.stringify(data), httpOptions);
    }

    panierRetraitUn(data): Observable<any> {
        return this.http.post(this.urlBase+'panier/retraitUn', JSON.stringify(data), httpOptions);
    }

    validerCommande(email): Observable<any> {
        return this.http.get(this.urlBase+'panier/validerPanier/'+email);
    }
    
    
}