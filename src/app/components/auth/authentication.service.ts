/*
This service manages authentication with Eventum API.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from './user.service';
import {AppConfig} from '../../config/config.service';

@Injectable({providedIn: 'root'})
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  apiAuthAddress = AppConfig.settings.apiAuthAddress;

  constructor(private http: HttpClient) {

    // Get logged in user from local storage
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {

    // Return current user if exists
    return this.currentUserSubject.value;
  }

  login(username: string, password: string) {

    // Authenticate user with backend
    return this.http.post<any>(`${this.apiAuthAddress}`, { 'username': username, 'password': password})
      .pipe(map(user => {

        // If access_token was given in response, save user in local storage
        if (user && user.access_token) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }

        return user;
      }));
  }

  logout() {

    // Remove current user from local storage
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

}
