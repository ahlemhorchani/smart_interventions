import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();
  const user = auth.getCurrentUser();

  if (!token || !user) {
    router.navigate(['/auth/login']);
    return false;
  }

  return true;
};