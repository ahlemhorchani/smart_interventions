import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterLink],
  templateUrl: './login.component.html',  
  styleUrls: ['./login.component.scss'] 
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
    form = new FormGroup<{
    email: FormControl<string>;
    motDePasse: FormControl<string>;
  }>({
    email: new FormControl('', { 
      validators: [Validators.required, Validators.email], 
      nonNullable: true 
    }),
    motDePasse: new FormControl('', { 
      validators: [Validators.required], 
      nonNullable: true 
    })
  });
  error?: string;
  isLoading = false;
  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.form.invalid) return;
    const { email, motDePasse } = this.form.value;
    this.auth.login(email!, motDePasse!).subscribe({
  next: (res) => {
    // Stocker correctement
    const currentUser = {
      nom: res.nom,
      prenom: res.prenom,
      email: email!,
      role: res.role
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    if (currentUser.role === 'ADMIN') {
  this.router.navigate(['/admin']);
} else if (currentUser.role === 'TECHNICIEN') {
  this.router.navigate(['/technicien']);
} else {
  this.router.navigate(['/']);
}

  },
  error: (err) => this.error = err?.error?.message || 'Erreur de connexion'
});

  }
}
