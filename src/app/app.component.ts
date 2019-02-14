/*
This component is used to load the whole App itself.
 */
import {Component} from "@angular/core";
import { Router } from "@angular/router";

import { AuthenticationService } from "./components/auth/authentication.service";
import { User} from "./components/auth/user.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  currentUser: User;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
    // Check if the user is logged in
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  // Logout and redirect to front page.
  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/'])
  }

}
