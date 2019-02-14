/*
This component is used to display all participants in events
 */
import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {Participant, ParticipantService} from './participant.service';
import {Event, EventService} from '../event/event.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {AlertService} from '../alert/alert.service';

@Component({
  selector: 'app-participants',
  templateUrl: './participant.component.html',
  styleUrls: ['./participant.component.scss'],
  providers: [EventService, ParticipantService],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0', display: 'none'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ParticipantComponent implements OnInit {

  event_id: number;
  events: MatTableDataSource<Event>;
  lastPaid: Participant;
  eventColumns: string[] = ['name', 'expire', 'participants'];
  expandedParticipant: Event | null;


  constructor(
    private eventService: EventService,
    private participantService: ParticipantService,
    private alertService: AlertService,
    public dialog: MatDialog) {
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  // Load data on init
  ngOnInit() {
    this.loadData();
  }

  // Load participants
  loadParticipants(events) {

    // Load all participants from backends
    for (let event of events) {
      this.participantService.getParticipants(event.id).subscribe((participants) => {
        event.participants = participants;
      });
    }

    // Create data source for events
    this.events = new MatTableDataSource(events);
    this.events.paginator = this.paginator;
    this.events.sort = this.sort;
    this.events.sort.sortChange.subscribe(() => this.events.paginator.pageIndex = 0);
  }

  // Load events and load participants for them
  loadData() {
    this.eventService.getEvents().subscribe(events => this.loadParticipants(events));
  }

  // Apply filter for table
  applyFilter(filterValue: string) {
    this.events.filter = filterValue.trim().toLowerCase();
  }

  // Change payment status to 'paid' for participant with this participation_id and reload all data after
  pay(participation_id: number) {
    this.participantService.payParticipant(participation_id).subscribe( (participant) => {this.loadData(); this.lastPaid = participant; },
      error => {this.alertService.error(error); });
  }

  // Change payment status to 'not paid' for participant with this participation_id and reload all data after
  unPay(participation_id: number) {
    this.participantService.unPayParticipant(participation_id).subscribe((participant) => {this.loadData(); this.lastPaid = participant; },
      error => {this.alertService.error(error); });
  }

  // Show form send in sign up
  showForm(participant) {
    const dialogRef = this.dialog.open(FormDialog, {width: '750px', data: {participant: participant}});
    dialogRef.afterClosed().subscribe();
  }

}
/*
This component is used to show form on a dialog.
 */

@Component({
  selector: 'form-dialog',
  template: '' +
  '<div mat-dialog-content>' +
  '  <h5 class="w-100 text-center">{{data.participant.name}}</h5>' +
  '  <p *ngFor="let key of getKeys(data.participant.form)"><b>{{key}}</b>: {{data.participant.form[key]}}</p>' +
  '</div>' +
  '<div mat-dialog-actions>' +
  '  <button mat-button (click)="onNoClick()">Close</button>' +
  '</div>',
})
export class FormDialog {

  constructor(
    public dialogRef: MatDialogRef<FormDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {participant}) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  getKeys(object) {
    return Object.keys(object);
  }

}
