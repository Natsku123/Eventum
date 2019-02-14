/*
This component is used to create the login screen
 */
import {Component, OnInit, ViewChild} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Validators} from '@angular/forms';
import { first } from 'rxjs/operators';

import { AlertService } from '../alert/alert.service';
import { AuthenticationService } from '../auth/authentication.service';
import {DynamicFormComponent} from '../dynamic-form/dynamic-form.component';
import {FieldConfig} from '../../field.interface';

@Component({templateUrl: 'login.component.html'})
export class LoginComponent implements OnInit {
  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

  returnUrl: string;

  // Dynamic form for login form
  loginForm: FieldConfig[] = [
    {
      type: 'input',
      label: 'Username',
      name: 'username',
      inputType: 'text',
      validations: [
        {
          name: 'required',
          validator: Validators.required,
          message: 'Username is required'
        }
      ]
    },
    {
      type: 'input',
      label: 'Password',
      name: 'password',
      inputType: 'password',
      validations: [
        {
          name: 'required',
          validator: Validators.required,
          message: 'Password is required'
        }
      ]
    },
    {
      type: 'button',
      label: 'Login'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private alertService: AlertService
  ) {

    // Redirect to root if already logged in
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {

    // Get return url parameter
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit(value) {

    // Check if username and password were given
    if (!value.username || !value.password) {
      return;
    }

    // Login on backend and redirect to return url in success
    this.authenticationService.login(value.username, value.password)
      .pipe(first())
      .subscribe(
        () => {
          this.router.navigate([this.returnUrl]);
        },
        error => {
          this.alertService.error(error);
        }
      );
  }

}
