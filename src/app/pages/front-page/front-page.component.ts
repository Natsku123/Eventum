/*
This component is used to load the front page.
 */
import { Component, OnInit } from '@angular/core';
import {EventService, Event} from '../../components/event/event.service';

@Component({
  selector: 'app-front-page',
  templateUrl: './front-page.component.html',
  styleUrls: ['./front-page.component.scss']
})
export class FrontPageComponent implements OnInit {

  constructor(
    private eventService: EventService
  ) { }

  nextEvent: Event;
  isLoaded: boolean = false;

  now: any;

  // Convert string to Date
  ToDate(string) {
    return Date.parse(string);
  }

  // Sort events to chronological order
  Sorter(data) {
    this.now = new Date();
    let expired = [];
    data.forEach((event) => {

      // Mark expired events
      if(this.now >= new Date(event.expire)) {
        expired.push(event);
      }
    });

    // Delete marked events from list
    for (let event of expired) {
      data.splice(data.indexOf(event), 1);
    }

    // Sort "cleaned" list
    data.sort((a, b) => Number(this.ToDate(a.expire)) - Number(this.ToDate(b.expire)));

    // Choose next event
    this.nextEvent = data[0];

    this.isLoaded = true;
  }

  // Get events on init
  ngOnInit() {
    this.eventService.getEvents().subscribe(events => this.Sorter(events));
  }

}
