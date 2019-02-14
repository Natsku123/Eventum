/*
This component is used to load the dynamic form with the input components.
 */
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { FieldConfig } from '../../field.interface';

@Component({
  exportAs: "dynamicForm",
  selector: "dynamic-form",
  template: `
  <form class="dynamic-form" [formGroup]="form" (submit)="onSubmit($event)">
  <ng-container *ngFor="let field of fields;" dynamicField [field]="field" [group]="form">
  </ng-container>
  </form>
  `,
  styles: []
})
export class DynamicFormComponent implements OnInit {
  @Input() fields: FieldConfig[] = [];

  @Output() submit: EventEmitter<any> = new EventEmitter<any>();

  form: FormGroup;

  // Get value of form
  get value() {
    return this.form.value;
  }
  constructor(private fb: FormBuilder) {}

  ngOnInit() {

    // Create control for the form
    this.form = this.createControl();
  }

  onSubmit(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    // Check if form is valid
    if (this.form.valid) {

      // Emit value of form
      this.submit.emit(this.form.value);
    } else {

      // Display errors
      this.validateAllFormFields(this.form);
    }
  }

  createControl() {

    // Create form group with FormBuilder
    const group = this.fb.group({});
    this.fields.forEach(field => {
      if (field.type === "button") return;

      // Skip this if field is a button, otherwise bind validators to field
      const control = this.fb.control(
        field.value,
        this.bindValidations(field.validations || [])
      );

      // Finalize the field creation
      group.addControl(field.name, control);
    });
    return group;
  }

  bindValidations(validations: any) {

    // If field has any validators configured
    if (validations.length > 0) {

      // Create list of validators
      const validList = [];
      validations.forEach(valid => {
        validList.push(valid.validator);
      });

      // Return composed validator of all given validators
      return Validators.compose(validList);
    }
    return null;
  }

  // Validate all fields
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {

      // Show validator errors if field is untouched
      const control = formGroup.get(field);
      control.markAsTouched({ onlySelf: true });
    });
  }
}
