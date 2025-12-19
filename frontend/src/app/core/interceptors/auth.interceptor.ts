import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  // NE PAS ajouter le token aux requêtes d'authentification
  const isAuthRequest = req.url.includes('/api/auth/');
  
  if (token && !isAuthRequest) {
    console.log('Interceptor: Adding token to request', req.url);
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  } else {
    console.log('Interceptor: No token or auth request', req.url);
  }
  
  return next(req);
};