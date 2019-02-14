/*
This service is used to access users (admins) from backend.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {AppConfig} from '../../config/config.service';

export class User {
  id: number;
  access_token: string;
}


@Injectable({ providedIn: 'root'})
export class UserService {
  constructor(private http: HttpClient) { }

  // Read configured API address from config
  apiAddress = AppConfig.settings.apiAddress;


  // Get all users from backend
  getAll() {
    return this.http.get<User[]>(`${this.apiAddress}/users/`);
  }

  // Get one user from backend with user_id
  getById(id: number) {
    return this.http.get(`${this.apiAddress}/users/${id}/`);
  }

  // Create new user
  register(username: string) {
    return this.http.post(`${this.apiAddress}/users/create/`, {'username': username});
  }

  // Regenerate password and update username with this user_id
  update(id: number, username: string) {
    return this.http.post(`${this.apiAddress}/users/${id}/update/`, {'username': username});
  }

  // Delete user with this user_id from backend
  delete(id: number) {
    return this.http.delete(`${this.apiAddress}/users/${id}/delete/`);
  }
}
