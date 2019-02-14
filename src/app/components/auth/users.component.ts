/*
This component is used to load users -page and control users overall
 */
import { Component, OnInit, OnDestroy, Inject, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import {MatDialog, MatTableDataSource, MatDialogRef, MAT_DIALOG_DATA, MatSort} from '@angular/material';

import { UserService, User } from './user.service';
import { AuthenticationService } from './authentication.service';
import { AlertService } from '../alert/alert.service';


@Component({ templateUrl: 'users.component.html' })
export class UsersComponent implements OnInit, OnDestroy {
  currentUser: User;
  currentUserSubscription: Subscription;
  data: MatTableDataSource<any>;
  isLoaded = false;
  username: string;

  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ['id', 'name', 'reset', 'delete'];

  constructor(
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private alertService: AlertService,
    public dialog: MatDialog
  ) {
    // Fetch logged in user
    this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  // Load all users on Init
  ngOnInit() {
    this.loadAllUsers();
  }

  ngOnDestroy() {
    this.currentUserSubscription.unsubscribe();
  }

  deleteUser(id: number) {

    // Delete user
    this.userService.delete(id).pipe(first()).subscribe(() => {
      this.loadAllUsers();
    });
  }

  // Show returned password on a dialog window. Because of this functionality, HTTPS is REQUIRED!
  showCreatedPassword(returned) {

    // Open dialog with NewPassword component
    const dialogRef = this.dialog.open(NewPassword, {width: '750px', data: {returned: returned}});

    // Update user data after dialog is closed
    dialogRef.afterClosed().subscribe(() => { this.loadAllUsers(); });
  }

  // Create new user
  createUser(): void {

    // Open username asking dialog on user creation
    const dialogRef = this.dialog.open(NewUsername, {width: '250px', data: {username: this.username}});

    // After dialog is closed, create new user in backend.
    dialogRef.afterClosed().subscribe(result => {
      this.username = result;

      // Show generated password in dialog after user has been created
      this.userService.register(this.username).subscribe(password => this.showCreatedPassword(password),
        error => { this.alertService.error(error); });
    });
  }

  // Update password
  updatePwd(id: number, user: string) {

    // Show generated password in dialog after user has been updated
    this.userService.update(id, user).pipe(first()).subscribe(password => this.showCreatedPassword(password),
      error => { this.alertService.error(error); });
  }

  // Apply filter to table
  applyFilter(filterValue: string) {
    this.data.filter = filterValue.trim().toLowerCase();
  }

  // Load all users from backend
  private loadAllUsers() {
    this.userService.getAll().pipe(first()).subscribe(users => {

      // Insert loaded users to MatTableDataSource so it can be shown nicely
      this.data = new MatTableDataSource(users);
      this.data.sort = this.sort;
    });
    this.isLoaded = true;
  }
}

/*
This component is used to ask new username for a new user
 */
@Component({
  selector: 'new-username',
  templateUrl: 'new-username.html',
})
export class NewUsername {

  constructor(
    public dialogRef: MatDialogRef<NewUsername>,
    @Inject(MAT_DIALOG_DATA) public data: {username}) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}

/*
This component is used to show new generated password
 */
@Component({
  selector: 'new-password',
  template: '' +
  '<div mat-dialog-content>' +
  '  <p>Generated password: </p>' +
  '  <p>{{data.returned.password}}</p>' +
  '</div>' +
  '<div mat-dialog-actions>' +
  '  <button mat-button (click)="onNoClick()">Close</button>' +
  '</div>',
})
export class NewPassword {

  constructor(
    public dialogRef: MatDialogRef<NewPassword>,
    @Inject(MAT_DIALOG_DATA) public data: {returned}) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
