/*
This interceptor is used to intercept HTTP responses for errors.
 */

import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/internal/operators';

import { AuthenticationService } from './authentication.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthenticationService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // Let request through and catch errors that are in the response
    return next.handle(request).pipe(catchError(err => {

      // If returned error code is 401 (which means user if any is unauthorized), logout user if any
      if (err.status === 401) {
        this.authenticationService.logout();
        location.reload(true);
      }

      // Throw found error
      const error = err.error.message || err.statusText;
      return throwError(error);
    }));
  }
}
