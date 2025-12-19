import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  
  message?: string;
  isSuccess = false;
  isLoading = false;
  showPassword = false;
  currentStep = 1;
  termsAccepted = false;

  form = new FormGroup<{
    nom: FormControl<string>;
    prenom: FormControl<string>;
    email: FormControl<string>;
    motDePasse: FormControl<string>;
    role: FormControl<'TECHNICIEN' | 'ADMIN'>;
  }>({
    nom: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    prenom: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    email: new FormControl('', { validators: [Validators.required, Validators.email], nonNullable: true }),
    motDePasse: new FormControl('', { validators: [Validators.required, Validators.minLength(6)], nonNullable: true }),
    role: new FormControl('TECHNICIEN', { nonNullable: true })
  });

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  getPasswordStrength(): string {
    const password = this.form.controls.motDePasse.value;
    if (!password) return 'empty';
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 3) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'weak': return 'Faible';
      case 'medium': return 'Moyen';
      case 'strong': return 'Fort';
      default: return '';
    }
  }

  hasUppercase(): boolean {
    const password = this.form.controls.motDePasse.value;
    return password ? /[A-Z]/.test(password) : false;
  }

  hasNumber(): boolean {
    const password = this.form.controls.motDePasse.value;
    return password ? /[0-9]/.test(password) : false;
  }

  toggleTerms(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.termsAccepted = target.checked;
  }

  nextStep(): void {
    if (this.currentStep < 3 && this.isStepValid(this.currentStep)) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        return this.form.controls.prenom.valid && 
               this.form.controls.nom.valid && 
               this.form.controls.email.valid;
      case 2:
        return this.form.controls.motDePasse.valid;
      case 3:
        return this.form.controls.role.valid && this.termsAccepted;
      default:
        return false;
    }
  }

  // ⭐ CORRECTION PRINCIPALE
  onSubmit() {
    console.log('📝 onSubmit called');
    console.log('📝 Form valid:', this.form.valid);
    console.log('📝 Terms accepted:', this.termsAccepted);

    if (this.form.invalid || !this.termsAccepted) {
      console.log('❌ Form invalid or terms not accepted');
      return;
    }

    const raw = this.form.getRawValue();
    console.log('📝 Form raw values:', raw);

    const payload: Partial<User> & { motDePasse: string } = {
      nom: raw.nom,
      prenom: raw.prenom,
      email: raw.email,
      motDePasse: raw.motDePasse,
      role: raw.role
    };

    console.log('📤 Payload to send:', payload);

    this.isLoading = true;
    this.auth.register(payload).subscribe({
      next: (res) => {
        console.log('✅ Register response received:', res);
        this.isLoading = false;
        this.message = 'Inscription réussie ! Redirection...';
        this.isSuccess = true;

        // ⭐ ATTENDRE que le token soit bien stocké
        console.log('✅ Token stocké:', localStorage.getItem('token'));
        console.log('✅ User stocké:', localStorage.getItem('currentUser'));

        // ⭐ Redirection immédiate selon le rôle
        setTimeout(() => {
          console.log('🚀 Redirection vers:', res.role);
          if (res.role === 'ADMIN') {
            this.router.navigate(['/admin']).then(success => {
              console.log('Navigation success:', success);
            });
          } else if (res.role === 'TECHNICIEN') {
            this.router.navigate(['/technicien']).then(success => {
              console.log('Navigation success:', success);
            });
          }
        }, 500); // Réduire le délai à 500ms
      },
      error: (err) => {
        this.isLoading = false;
        console.error('❌ Erreur d\'inscription:', err);
        console.error('❌ Erreur complète:', JSON.stringify(err, null, 2));
        this.message = err?.error?.message || 'Erreur lors de l\'inscription';
        this.isSuccess = false;
      }
    });
  }
}