import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.getCurrentUser();
  const requiredRoles = route.data?.['roles'] || [];

  if (requiredRoles.length === 0 || requiredRoles.includes(user?.role)) {
    return true;
  }

  // Rediriger selon le rôle
  if (user?.role === 'ADMIN') {
    router.navigate(['/admin']);
  } else if (user?.role === 'TECHNICIEN') {
    router.navigate(['/technicien']);
  } else {
    router.navigate(['/citoyen']);
  }

  return false;
};