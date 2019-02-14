/*
This module is for the main App.
 */
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { APP_INITIALIZER } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppConfig} from './config/config.service';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingIconComponent } from './components/loading-icon/loading-icon.component';
import { InputComponent } from './components/input/input.component';
import { ButtonComponent } from './components/button/button.component';
import { SelectComponent } from './components/select/select.component';
import { DateComponent } from './components/date/date.component';
import { RadiobuttonComponent } from './components/radiobutton/radiobutton.component';
import { CheckboxComponent } from './components/checkbox/checkbox.component';
import { TextareaComponent } from './components/textarea/textarea.component';
import { DynamicFieldDirective } from './components/dynamic-field/dynamic-field.directive';
import { DynamicFormComponent } from './components/dynamic-form/dynamic-form.component';
import { EventListComponent } from './pages/event-list/event-list.component';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { EventCreateComponent } from './pages/event-create/event-create.component';
import { FrontPageComponent } from './pages/front-page/front-page.component';
import {EventComponent, FileDialog} from './components/event/event.component';
import { TermsComponent } from './pages/terms/terms.component';

import { AlertComponent } from './components/alert/alert.component';
import { JwtInterceptor } from './components/auth/jwt.interceptor';
import { AuthGuard } from './components/auth/auth.guard';
import { ErrorInterceptor } from './components/auth/error.interceptor';
import {UsersComponent, NewUsername, NewPassword} from './components/auth/users.component';
import { LoginComponent } from './components/login/login.component';
import {FormDialog, ParticipantComponent} from './components/participant/participant.component';

const appRoutes: Routes = [
  { path: '', component: FrontPageComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'participants', component: ParticipantComponent, canActivate: [AuthGuard] },
  { path: 'users', children: [
      { path: '', component: UsersComponent, canActivate: [AuthGuard] },
    ]},
  { path: 'events', children: [
      { path: '', component: EventListComponent },
      { path: 'create', component: EventCreateComponent, canActivate: [AuthGuard] },
      { path: ':id', component: EventComponent }
    ]},
  { path: '**', component: PageNotFoundComponent }
];

export function initializeApp(appConfig: AppConfig) {
  return () => appConfig.load();
}

@NgModule({
  declarations: [
    AppComponent,
    LoadingIconComponent,
    InputComponent,
    ButtonComponent,
    SelectComponent,
    DateComponent,
    RadiobuttonComponent,
    CheckboxComponent,
    TextareaComponent,
    DynamicFieldDirective,
    DynamicFormComponent,
    EventListComponent,
    PageNotFoundComponent,
    EventCreateComponent,
    FrontPageComponent,
    EventComponent,
    ParticipantComponent,
    AlertComponent,
    UsersComponent,
    NewUsername,
    NewPassword,
    FormDialog,
    FileDialog,
    LoginComponent,
    TermsComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true }
    ),
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
    AppConfig,
    { provide: APP_INITIALIZER, useFactory: initializeApp, deps: [AppConfig], multi: true}

  ],
  bootstrap: [AppComponent],
  entryComponents: [
    LoadingIconComponent,
    InputComponent,
    ButtonComponent,
    SelectComponent,
    DateComponent,
    RadiobuttonComponent,
    CheckboxComponent,
    TextareaComponent,
    NewUsername,
    NewPassword,
    FormDialog,
    FileDialog
  ]
})
export class AppModule {}
