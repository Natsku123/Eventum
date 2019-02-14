/*
This component is used to display one event and edit it
 */
import {Component, OnInit, ViewChild, Inject} from '@angular/core';
import {FieldConfig} from '../../field.interface';
import {Validators} from '@angular/forms';
import {DynamicFormComponent} from '../dynamic-form/dynamic-form.component';
import {Event, EventService, Role } from './event.service';
import {Participant, ParticipantService} from '../participant/participant.service';
import {ActivatedRoute} from '@angular/router';

import { AuthenticationService } from '../auth/authentication.service';
import { User } from '../auth/user.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatTableDataSource} from '@angular/material';
import {AlertService} from '../alert/alert.service';
import {AppConfig} from '../../config/config.service';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
  providers: [EventService, ParticipantService],
})
export class EventComponent implements OnInit {
  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private participantService: ParticipantService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    public dialog: MatDialog
  ) {
    // Get logged in user if any
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  event: Event;
  participant: Participant;
  participants: MatTableDataSource<any>;
  eventImage: any;
  lastPaid: any;
  currentUser: User;
  event_id: number;
  isLoaded = false;
  notSent = true;
  expired = false;
  submitFailed = false;
  eventIsFull = false;
  panelOpenState = false;
  roles: Role[];
  roleNames = [];
  adminError = '';
  adminEmail = AppConfig.settings.adminEmail;

  displayedColumns: string[] = ['id', 'name', 'paid'];

  // Dynamic form configuration for adding limits and prices to event
  roleForm: FieldConfig[] = [
    {
      type: 'radiobutton',
      label: 'Choose role',
      name: 'role',
      options: [],
      value: ''
    },
    {
      type: 'input',
      label: 'Price for role',
      name: 'price',
      inputType: 'number'
    },
    {
      type: 'input',
      label: 'Sign up limit for role',
      name: 'limit',
      inputType: 'number'
    },
    {
      type: 'button',
      label: 'Add role'
    }];

  regConfig: FieldConfig[];

  // Fix validators for custom fields got from backend and do a few other things before loading page
  fix_validators(event) {

    // If user is logged in, create a fancy MatTableDataSource for participants
    if (this.currentUser) {
      this.participants = new MatTableDataSource(event.participants);
    }

    // Save event
    this.event = event;

    // If event sign up has any custom fields
    if (this.event.template.length > 0) {
      for (let item of this.event.template) {

        // Edit only fields that have validations
        if (item.hasOwnProperty('validations')) {

          // Edit validator
          for (let valid of item['validations']) {

            if (valid.hasOwnProperty('validator') && valid['validator'] === 'required') {

              // If validator is "required", replace it with the actual validator
              valid['validator'] = Validators.required;
            } else if (valid.hasOwnProperty('validator')) {

              // If the validator is something else, replace it with pattern given in template
              valid['validator'] = Validators.pattern(valid['validator']);
            }
          }
        }

        // Add field to dynamic form configuration
        this.regConfig.push(item);
      }
    }

    // Add terms of service checkbox to dynamic form
    this.regConfig.push({
      type: 'checkbox',
      label: "I accept Eventum's terms of service",
      name: 'terms'
    });

    // Add submit button to dynamic form
    this.regConfig.push({
      type: 'button',
      label: 'Sign up',
    });

    // Allow template to render everything
    this.isLoaded = true;

    // Check if event is already expired
    if (Date.now() > Date.parse(this.event.expire)) {
      this.expired = true;
    }

    // Calculate if the event is full
    let fullLimits = 0;
    for (let limit of event.limits) {
      if (limit.filled == limit.size) {
        fullLimits = fullLimits + 1;
      }
    }
    if (fullLimits == event.limits.length) {
      this.eventIsFull = true;
    }
  }

  // Load data from backend
  loadData(event_id) {
    this.event_id = event_id;
    this.isLoaded = false;
    this.notSent = true;
    this.expired = false;

    // Base for sign up dynamic form
    this.regConfig = [
      {
        type: 'input',
        label: 'Name',
        inputType: 'text',
        name: 'name',
        validations: [
          {
            name: 'required',
            validator: Validators.required,
            message: 'Name is required'
          },
          {
            name: 'pattern',
            validator: Validators.pattern('^[a-öA-Ö ]+$'),
            message: 'Real name is required'
          }
        ]
      },
      {
        type: 'input',
        label: 'Student email',
        inputType: 'email',
        name: 'email',
        validations: [
          {
            name: 'required',
            validator: Validators.required,
            message: 'Email is required'
          },
          {
            name: 'pattern',
            validator: Validators.pattern(
              '^[a-öA-Ö0-9._%+-]+@[a-ö0-9.-]+.[a-ö]{2,4}$'
            ),
            message: 'Email needs to be a valid email'
          }
        ]
      }
    ];

    // Get event and fix validators and stuff. Get participants with event if user is logged in
    this.eventService.getEvent(this.event_id, this.currentUser != undefined).subscribe(event => this.fix_validators(event));

    // Get image for event if any
    this.eventService.getImage(this.event_id).subscribe(image => this.eventImage = image);

    // Get all roles if user is logged in
    if (this.currentUser) {
      this.eventService.getRoles().subscribe(roles => this.setupRoles(roles))
    }
  }

  setupRoles(roles) {

    // Save roles
    this.roles = roles;

    // If there is less role names compared to roles
    if (this.roleNames.length != this.roles.length) {

      // Gather all names of roles
      for (let role of this.roles) {
        this.roleNames.push(role.name)
      }
    }

    // Set role names as options for first field in dynamic form
    this.roleForm[0].options = this.roleNames;

    // Set last role name as default value to first field in dynamic form
    this.roleForm[0].value = this.roleNames[this.roleNames.length-1];
  }

  // On init get id from url and load data with that id
  ngOnInit() {
    this.route.params.subscribe(params => this.loadData(params['id']));
  }

  // Change payment status to 'paid' for participant with this participation_id and reload all data after
  pay(participation_id: number) {
    this.participantService.payParticipant(participation_id).subscribe( (participant) => {
      this.loadData(this.event_id); this.lastPaid = participant;
      },
      error => {this.alertService.error(error); });
  }

  // Change payment status to 'not paid' for participant with this participation_id and reload all data after
  unPay(participation_id: number) {
    this.participantService.unPayParticipant(participation_id).subscribe((participant) => {
      this.loadData(this.event_id); this.lastPaid = participant;
      },
      error => {this.alertService.error(error); });
  }

  // Make sign up available for non-users
  makeAvailable() {

    // If event has any limits or prices, make available. Otherwise print error
    if (this.event.limits.length > 0 && this.event.prices.length > 0) {
      this.eventService.changeAvailability(this.event_id, 1).subscribe(event => this.event = event,
        error => {this.alertService.error(error); });
    } else {
      this.adminError = 'Event needs to have at least one limit and one price before making it available!';
    }
  }

  // Make sign up hidden for non-users
  makeHidden() {
    this.eventService.changeAvailability(this.event_id, 0).subscribe(event => this.event = event,
      error => {this.alertService.error(error); });
  }

  submit(value: any) {

    // If terms are accepted
    if (value.terms) {

      // If event hasn't expired while this page was loaded send participation form to backend
      if (Date.now() < Date.parse(this.event.expire)) {
        this.participantService.addParticipant(this.event_id, {'form': value})
          .subscribe((participant) => {
            this.participant = participant;

            // If the form wasn't returned, something went wrong
            if (!this.participant.form) {
              this.submitFailed = true;
            }
            this.notSent = false;
          },
            error => {this.alertService.error(error); });
      } else {
        this.expired = true;
      }
    }
  }


  // If there is any html tags to be removed, use this
  removeTags(text) {
    return text ? String(text).replace(/<[^>]+>/gm, '') : '';
  }

  // Calculate % progress
  getProgress(current, total) {
    return Math.round(100 * current / total);
  }

  // Open dialog for uploading new image for the event
  public openUploadDialog() {
    let dialogRef = this.dialog.open(FileDialog, { width: '50%', height: '50%' , data: {event_id: this.event_id}});
    dialogRef.afterClosed().subscribe( () => {

      // Load data after closed
      this.loadData(this.event_id);
    });
  }

  // Submit limits and prices for roles
  submitRoles(roles) {
    let role_id = 0;

    // Search for the role with name given in roles
    for (let role in this.roles) {
      if (this.roles[role].name === roles.role) {
        role_id = this.roles[role].id;
        break;
      }
    }

    // Create dummy limit and price
    let limit = {id: 0, size: roles.limit, role_id: role_id, event_id: this.event_id, filled: 0};
    let price = {id: 0, price: roles.price, role_id: role_id, event_id: this.event_id};

    // Create limit and price in backend and load data after
    this.eventService.createLimit(limit).subscribe(new_limit => limit = new_limit);
    this.eventService.createPrice(price).subscribe((new_price) => {
      price = new_price;
      this.loadData(this.event_id);
    });

  }

}

/*
This component is used to upload new image for event in a dialog
 */

@Component({
  selector: 'file-dialog',
  templateUrl: './file-dialog.html',
})
export class FileDialog {
  @ViewChild('file') file;
  public image: {name: string, file: File} = {name: "", file: null};

  progress;
  canBeClosed = true;
  primaryButtonText = 'Send';
  showCancelButton = true;
  uploading = false;
  uploadSuccessful = false;

  constructor(
    public dialogRef: MatDialogRef<FileDialog>,
    public eventService: EventService,
    @Inject(MAT_DIALOG_DATA) public data: {event_id: number}
  ) {}


  addFile() {
    this.file.nativeElement.click();
  }

  onFileAdded() {

    // Get one file from file selection
    this.image.file = this.file.nativeElement.files[0];

    // Get filename to 'better' location
    this.image.name = this.image.file.name;
  }

  closeDialog() {

    // Close dialog after successful upload
    if (this.uploadSuccessful) {
      return this.dialogRef.close();
    }

    this.uploading = true;

    // Upload image to backend
    this.progress = this.eventService.addImage(this.data.event_id, this.image.file);

    // Get progress of upload
    let progressObservable = this.progress.progress;

    this.primaryButtonText = 'Finish';

    this.canBeClosed = false;
    this.dialogRef.disableClose = false;

    this.showCancelButton = false;

    // When upload is done, update variables
    progressObservable.subscribe(() => {
      this.canBeClosed = true;
      this.dialogRef.disableClose = false;

      this.uploadSuccessful = true;
      this.uploading = false;
    });
  }

}
