import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterService } from '../services/register.service'
import { AuthentificationService } from '../services/authentification.service'

@Component({
  selector: 'app-new-user',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})


export class RegisterComponent {
	
  private utilisateur = {"nom":"", "prenom":"","email":"", "password1":"", "password2":""};
  private message: string = "";

 constructor(private newUser: RegisterService, private router: Router, private authService: AuthentificationService) { }

  ngOnInit() {
  }

  onSubmit() {
    this.newUser.saveUser(this.utilisateur).subscribe(reponse => {
      this.message = reponse['message'];
      if (reponse['resultat']){
        this.authService.connect(this.utilisateur.email);
        this.newUser.connect(this.utilisateur.email);
        this.router.navigate(['/produits']);
      }
      setTimeout( () => { this.router.navigate(['/produits']); }, 1000);
    });
  }
}
