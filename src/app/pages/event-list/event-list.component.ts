/*
This component is used to display list of events page.
 */
import { Component, OnInit, ViewChild } from '@angular/core';
import { Event, EventService} from '../../components/event/event.service';
import {MatPaginator, MatTableDataSource} from '@angular/material';

@Component({
  selector: 'app-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
  providers: [ EventService ]
})
export class EventListComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(eventService: EventService) {
    this.eventService = eventService;
  }

  error: string;
  events: MatTableDataSource<Event>;
  eventService: EventService;
  now: any;
  nowDate: Date;
  displayedColumns: string[] = ['name', 'expire'];

  // Convert string to Date
  ToDate(string) {
    return Date.parse(string);
  }

  // Get time between now and given string
  TimeDelta(string) {
    const d1 = new Date(string);
    const delta = Math.abs(d1.getTime() - this.nowDate.getTime());
    return Math.ceil(delta / (1000 * 3600 * 24));
  }

  // Sort loaded events to chronological order
  Sorter(data) {
    let expired = [];
    data.forEach((event) => {

      // Mark expired events
      if(this.nowDate >= new Date(event.expire)) {
        expired.push(event);
      }
    });

    // Delete marked events from list
    for (let event of expired) {
      data.splice(data.indexOf(event), 1);
    }

    // Sort "cleaned" list
    data.sort((a, b) => Number(this.ToDate(a.expire)) - Number(this.ToDate(b.expire)));

    // Create DataSource from events
    this.events = new MatTableDataSource<Event>(data);
    this.events.paginator = this.paginator;
  }

  // Apply filter to table
  applyFilter(filterValue: string) {
    this.events.filter = filterValue.trim().toLowerCase();
  }

  // On init update different date and time variables and get events
  ngOnInit() {
    this.now = Date.now();
    this.nowDate = new Date();
    this.eventService.getEvents()
      .subscribe(
        (data: Event[]) => this.Sorter(data),
        error => this.error = error
      );
  }


}
