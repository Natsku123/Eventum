/*
This component is used to display event creation page.
 */
import {Component, OnInit, ViewChild} from '@angular/core';
import { EventService, Event, Role } from '../../components/event/event.service';
import {DynamicFormComponent} from '../../components/dynamic-form/dynamic-form.component';
import {FieldConfig} from '../../field.interface';
import {Validators} from '@angular/forms';
import {MatSnackBar} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {AlertService} from '../../components/alert/alert.service';

@Component({
  selector: 'app-event-create',
  templateUrl: './event-create.component.html',
  styleUrls: ['./event-create.component.scss'],
  providers: [EventService]
})
export class EventCreateComponent implements OnInit {
  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private alertService: AlertService,
    private snackBar: MatSnackBar,
  ) { }

  isLoaded = false;
  eventSent = false;
  roleNames = [];
  roles: Role[];

  // Dynamic form for basic event information
  basicFields: FieldConfig[] = [
    {
      type: 'input',
      label: 'Event name',
      inputType: 'text',
      name: 'eventName',
      validations: [
        {
          name: 'required',
          validator: Validators.required,
          message: 'Name for event is required'
        }
      ]
    },
    {
      type: 'textarea',
      label: 'Event description',
      inputType: 'text',
      name: 'eventDescription'
    },
    {
      type: 'date',
      label: 'Event sign up expiration date',
      name: 'eventExpire',
      validations: [
        {
          name: 'required',
          validator: Validators.required,
          message: 'Sign up needs to end'
        }
      ]
    },
    {
      type: 'button',
      label: 'Submit'
    }
  ];

  eventForm = [];

  newEvent: Event;

  // Dynamic form additional questions
  newEventForm: FieldConfig[] = [
    {
      type: 'input',
      label: 'Question',
      name: 'qName',
      inputType: 'text'
    },
    {
      type: 'input',
      label: 'Field name',
      name: 'qShort',
      inputType: 'text'
    },
    {
      type: 'radiobutton',
      label: 'Field type',
      name: 'qType',
      options: [
        'radiobutton',
        'checkbox',
        'date',
        'input',
        'select',
        'textarea'
      ],
      value: 'input'
    },
    {
      type: 'radiobutton',
      label: "If type is 'input'",
      name: 'inputType',
      options: [
        'color',
        'email',
        'number',
        'search',
        'tel',
        'text',
        'url',
      ],
      value: 'text'
    },
    {
      type: 'input',
      label: "If type is 'radiobutton' or 'select', write choices here with ';' as separator",
      name: 'choices',
      inputType: 'text'
    },
    {
      type: 'checkbox',
      label: 'Is required',
      name: 'requirement'
    },
    {
      type: 'button',
      label: 'Add question'
    }
  ];

  setupRoles(roles) {

    // Save roles
    this.roles = roles;

    // Collect role names
    for (let role of this.roles) {
      this.roleNames.push(role.name)
    }

    // Allow template to render actual page
    this.isLoaded = true;
  }

  // Load roles on init
  ngOnInit() {
    this.eventService.getRoles().subscribe(roles => this.setupRoles(roles))
  }

  // Submit event to backend
  submitEvent(event) {

    // Dummy event
    let newEvent = {
      id: 0,
      description: event.eventDescription,
      name: event.eventName,
      expire: event.eventExpire,
      template: this.eventForm,
      updated: "",
      participants: [],
      prices: [],
      limits: [],
      available: 0,
    };

    // Send dummy event to backend and redirect to newly created event page
    this.eventService.addEvent(newEvent).subscribe((reEvent) => {
      this.newEvent = reEvent;
      this.router.navigate(['/events/' + String(this.newEvent.id)]);
    },
      error => {
        this.alertService.error(error);
    });
    this.eventSent = true;
  }

  // Add additional questions to event
  submitEventForm(eventForm) {

    // Basic field model
    let question = {
      type: eventForm.qType,
      label: eventForm.qName,
      name: eventForm.qShort,
      validations: []
    };
    let questionV2 = {};

    // Add properties based on field type
    if (eventForm.qType === 'input' ) {
      questionV2 = {
        inputType: eventForm.inputType,
      }
    } else if (eventForm.qType === 'radiobutton' || eventForm.qType === 'select') {
      let options = eventForm.choices.split(';');
      questionV2 = {
        options: options,
        value: options[0],
      }
    } else {
      questionV2 = {};
    }

    // Combine objects
    let question_final = {...question, ...questionV2};

    // Add required validator if wanted
    if (eventForm.requirement) {
      question_final.validations =  [{
        name: 'required',
        validator: 'required',
        message: question.name + ' is required'
      }]
    }

    // Add to event template
    this.eventForm.push(question_final);

    // Show informational snackbar
    let snackBarRef = this.snackBar.open('Question "' + question_final.name + '" added.', 'Ok');
    snackBarRef.onAction().subscribe( () => this.snackBar.dismiss());
  }

}
