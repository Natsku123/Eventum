/*
This service is used to access, add and edit participants in backend
 */
import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {AppConfig} from '../../config/config.service';

export interface Participant {
  form: any;
}

@Injectable({
  providedIn: 'root',
})
export class ParticipantService {
  constructor(private http: HttpClient) { }

  // Get API address from configuration
  apiAddress = AppConfig.settings.apiAddress;

  participantsUrl = `${this.apiAddress}/participants/`;

  // Add participant to event
  addParticipant (event_id: number, participant: Participant): Observable<Participant> {

    // Setup needed parameters
    const options = event_id ?
      { params: new HttpParams().set('event_id', String(event_id)).set('mode', 'add') } : {};
    return this.http.post<Participant>(this.participantsUrl, participant, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get participants for event
  getParticipants(event_id: number): Observable<Participant[]> {

    // Setup needed parameters
    const options = { params: new HttpParams().set('event_id', String(event_id))};
    return this.http.get<Participant[]>(this.participantsUrl, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Change payment status to 'paid' for participant
  payParticipant (participant_id: number): Observable<Participant> {

    // Setup needed parameters
    const options = { params: new HttpParams().set('participant_id', String(participant_id)).set('mode', 'pay') };
    return this.http.post<Participant>(this.participantsUrl, null, options)
      .pipe(
        catchError(this.handleError)
      )
  }

  // Change payment status to 'not paid' for participant
  unPayParticipant (participant_id: number): Observable<Participant> {

    // Setup needed parameters
    const options = { params: new HttpParams().set('participant_id', String(participant_id)).set('mode', 'unpay') };
    return this.http.post<Participant>(this.participantsUrl, null, options)
      .pipe(
        catchError(this.handleError)
      )
  }

  // Handle errors thrown
  private handleError(error: HttpErrorResponse) {

    // TODO fix me
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError(
      'Something bad happened; please try again later.');
  };

}


