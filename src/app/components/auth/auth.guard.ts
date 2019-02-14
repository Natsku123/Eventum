/*
This Auth Guard is used to prevent unauthorized access to protected pages.
*/
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    // Check if user is logged in
    const currentUser = this.authenticationService.currentUserValue;

    // If logged in, give access
    if (currentUser) {
      return true;
    }

    // If not logged in, navigate user to login screen with returnUrl and prevent access to current page
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url}});
    return false;
  }
}
