import { LightningElement } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import fcs from '@salesforce/resourceUrl/fcs';

export default class Fcs extends LightningElement {
  // Prevent re-initialization on subsequent renderings
  fullCalendarInitialized = false;

  renderedCallback() {
    if (this.fullCalendarInitialized) {
      return;
    }
    this.fullCalendarInitialized = true;

    // Load CSS and JS resources
    Promise.all([
      loadStyle(this, fcs + '/fcs/main.min.css'),
      loadScript(this, fcs + '/fcs/main.css'),

      loadScript(this, fcs + '/fcs/main.min.js'),
      loadScript(this, fcs + '/fcs/main.js')
    ])
    .then(() => {
        console.log('before initialize scheduler');
        console.log(window.FullCalendar , 'adasdasdas');
        this.initializeScheduler();
    })
    .catch(error => {
      // Handle load errors
      // eslint-disable-next-line no-console
      console.error('Failed to load FullCalendar Scheduler', error);
    });
  }

  initializeScheduler() {
    console.log('inside inicialize scehduler')
    // Query the div.calendar container
    const calendarEl = this.template.querySelector('.calendar');
    console.log(calendarEl + 'calednarEL');
    // eslint-disable-next-line no-undef
    const calendar = window.FullCalendar.Calendar(calendarEl, {
      schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',
      plugins: [ 'interaction', 'resourceTimeline' ],
      timeZone: 'local',
      initialView: 'resourceTimelineDay',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'resourceTimelineDay,resourceTimelineWeek'
      },
      selectable: true,
      resources: [
        { id: 'a', title: 'Room A' },
        { id: 'b', title: 'Room B' }
      ],
      events: [
        {
          id: '1',
          resourceId: 'a',
          start: new Date().toISOString().slice(0,10) + 'T09:00:00',
          end:   new Date().toISOString().slice(0,10) + 'T12:00:00',
          title: 'Morning Meeting'
        }
      ]
    });
    console.log('before render');
    calendar.render();
  }
}