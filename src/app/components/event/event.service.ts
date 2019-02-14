/*
This service is used to access, create and edit events in backend. Also manage roles, limits and prices.
 */
import { Injectable } from '@angular/core';
import {HttpClient, HttpResponse, HttpErrorResponse, HttpParams, HttpRequest, HttpEventType} from '@angular/common/http';
import {Observable, Subject, throwError} from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import {AppConfig} from '../../config/config.service';

export interface Event {
  id: number;
  name: string;
  description: string;
  template: any;
  updated: string;
  expire: string;
  participants: any;
  prices: any;
  limits: any;
  available: number;
}

export interface Newest {
  newest: number;
}

export interface Role {
  id: number;
  name: string;
  power: number;
}

export interface Limit {
  id: number;
  role_id: number;
  event_id: number;
  size: number;
  filled: number;
}

export interface Price {
  id: number;
  role_id: number;
  event_id: number;
  price: number;
}

@Injectable({
  providedIn: 'root',
})
export class EventService {
  constructor(private http: HttpClient) { }

  // Get API address from configuration
  apiAddress = AppConfig.settings.apiAddress;

  // All urls needed
  eventsUrl = `${this.apiAddress}/events/`;
  newestUrl = `${this.apiAddress}/events/newest/`;
  rolesUrl = `${this.apiAddress}/roles/`;
  limitsUrl = `${this.apiAddress}/limits/`;
  pricesUrl = `${this.apiAddress}/prices/`;
  imagesUrl = `${this.apiAddress}/images/`;


  // Get all events
  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.eventsUrl)
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  // Get event with event_id and maybe fetch participants
  getEvent(event_id: number, participants: boolean): Observable<Event> {
    if (participants) {

      // Setup parameters needed
      const options = { params: new HttpParams().set('event_id', String(event_id)).set('participants', 'true')};
      return this.http.get<Event>(this.eventsUrl, options)
        .pipe(
          retry(3),
          catchError(this.handleError)
        );
    } else {

      // Setup parameters needed
      const options = { params: new HttpParams().set('event_id', String(event_id))};
      return this.http.get<Event>(this.eventsUrl, options)
        .pipe(
          retry(3),
          catchError(this.handleError)
        );
    }
  }

  // Get newest event id
  getNewestEvent(): Observable<Newest> {
    return this.http.get<Newest>(this.newestUrl)
      .pipe(
        retry(3),
        catchError(this.handleError)
      );
  }

  // Add event to backend
  addEvent (event: Event): Observable<Event> {

    // Setup needed parameters
    const options = { params: new HttpParams().set('mode', 'new')};
    return this.http.post<Event>(this.eventsUrl, event, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Add image to event with event_id
  addImage(event_id: number, file: File) {

    // Send image 'as form'
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    // Setup HTTP request
    const req = new HttpRequest('POST', this.imagesUrl, formData, {
      reportProgress: true,
      params: new HttpParams().set('event_id', String(event_id))
    });

    // Setup progress reporting
    const progress = new Subject<number>();

    // Send HTTP request
    this.http.request(req).subscribe(event => {

      // If upload is in progress
      if (event.type === HttpEventType.UploadProgress) {

        // Calculate percentage
        const percentDone = Math.round(100 * event.loaded / event.total);
        progress.next(percentDone);
      } else if (event instanceof HttpResponse) {

        // Complete upload
        progress.complete();
      }
    });

    return {file: file.name, progress: progress.asObservable() }
  }

  // Get image for event
  getImage(event_id: number) {

    // Setup needed parameters
    const options = { params: new HttpParams().set('event_id', String(event_id))};
    return this.http.get(this.imagesUrl, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get role with role_id
  getRole(role_id: number): Observable<Role> {

    // Setup needed parameters
    const options = { params: new HttpParams().set('role_id', String(role_id))};
    return this.http.get<Role>(this.rolesUrl, options)
      .pipe(
        catchError(this.handleError)
      )
  }

  // Change availability of event
  changeAvailability(event_id: number, available: number): Observable<Event> {

    // Setup needed parameters
    const options = { params: new HttpParams().set('event_id', String(event_id)).set('available', String(available))
        .set('mode', 'available')};
    return this.http.post<Event>(this.eventsUrl, {}, options)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get all roles
  getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(this.rolesUrl)
      .pipe(
        retry(3),
        catchError( this.handleError)
      );
  }

  // Create new limit
  createLimit(limit: Limit): Observable<Limit> {

    // Setup needed parameters
    const options = { params: new HttpParams().set('role_id', String(limit.role_id)).set('event_id', String(limit.event_id))
        .set('mode', 'new')};
    return this.http.post<Limit>(this.limitsUrl, limit, options)
      .pipe(
        catchError( this.handleError)
      );
  }

  // Create new price
  createPrice(price: Price): Observable<Price> {

    // Setup needed parameters
    const options = { params: new HttpParams().set('event_id', String(price.event_id)).set('mode', 'new')};
    return this.http.post<Price>(this.pricesUrl, price, options)
      .pipe(
        catchError( this.handleError)
      );
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


