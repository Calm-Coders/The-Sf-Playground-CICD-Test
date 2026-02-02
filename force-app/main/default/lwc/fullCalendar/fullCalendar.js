/* eslint-disable no-console */
import { LightningElement, api, track } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from 'lightning/navigation';
import fullCalendar from "@salesforce/resourceUrl/fullCalendar";
import { loadStyle, loadScript } from "lightning/platformResourceLoader";
import getEventsNearbyDynamic from "@salesforce/apex/FullCalendarController.getEventsNearbyDynamic";
import getPersonAccount from "@salesforce/apex/FullCalendarController.getPersonAccount";
import VistaModal from 'c/vistaModal';
import LightningModal from 'lightning/modal';

// Global variables
var objectName;
var startField;
var endField;
var colorField;
var additionalFilter;
var allDayField;
var titleField;

export default class FullCalendarComponent extends NavigationMixin(LightningElement) {
    // Private properties
    calendar;
    fullCalendarInitialized = false;
    salesforceEvents = [ 
        { id: "1",  workType: "Operazione", allDay: false, textColor: "black", color: "rgb(201, 160, 220)", start: "2025-06-16T08:00:00", end: "2025-06-16T10:00:00", title: "Operazione 1" },
        { id: "51", workType: "Visita",     allDay: false, textColor: "black", color: "rgb(173, 216, 230)", start: "2025-06-16T08:30:00", end: "2025-06-16T11:00:00", title: "Visita 51" },        
        { id: "52", workType: "Operazione", allDay: false, textColor: "black", color: "rgb(201, 160, 220)", start: "2025-06-16T11:30:00", end: "2025-06-16T12:30:00", title: "Operazione 52" },
        { id: "2",  workType: "Laser",      allDay: false, textColor: "black", color: "rgb(240, 128, 128)", start: "2025-06-16T13:00:00", end: "2025-06-16T15:00:00", title: "Laser 2" },
        { id: "3",  workType: "Visita",     allDay: false, textColor: "black", color: "rgb(173, 216, 230)", start: "2025-06-17T08:00:00", end: "2025-06-17T10:00:00", title: "Visita 3" },
        { id: "4",  workType: "Operazione", allDay: false, textColor: "black", color: "rgb(201, 160, 220)", start: "2025-06-17T13:00:00", end: "2025-06-17T15:00:00", title: "Operazione 4" },
        { id: "5",  workType: "Laser",      allDay: false, textColor: "black", color: "rgb(240, 128, 128)", start: "2025-06-18T08:00:00", end: "2025-06-18T10:00:00", title: "Laser 5" },
        { id: "6",  workType: "Visita",     allDay: false, textColor: "black", color: "rgb(173, 216, 230)", start: "2025-06-18T13:00:00", end: "2025-06-18T15:00:00", title: "Visita 6" },
        { id: "7",  workType: "Operazione", allDay: false, textColor: "black", color: "rgb(201, 160, 220)", start: "2025-06-19T08:00:00", end: "2025-06-19T10:00:00", title: "Operazione 7" },
        { id: "8",  workType: "Laser",      allDay: false, textColor: "black", color: "rgb(240, 128, 128)", start: "2025-06-19T13:00:00", end: "2025-06-19T15:00:00", title: "Laser 8" },
        { id: "9",  workType: "Visita",     allDay: false, textColor: "black", color: "rgb(173, 216, 230)", start: "2025-06-20T08:00:00", end: "2025-06-20T10:00:00", title: "Visita 9" },
        { id: "10", workType: "Operazione", allDay: false, textColor: "black", color: "rgb(201, 160, 220)", start: "2025-06-20T13:00:00", end: "2025-06-20T15:00:00", title: "Operazione 10" },

        { id: "11", workType: "Laser",      allDay: false, textColor: "black", color: "rgb(240, 128, 128)", start: "2025-06-23T08:00:00", end: "2025-06-23T10:00:00", title: "Laser 11" },
        { id: "12", workType: "Visita",     allDay: false, textColor: "black", color: "rgb(173, 216, 230)", start: "2025-06-23T13:00:00", end: "2025-06-23T15:00:00", title: "Visita 12" },
        { id: "13", workType: "Operazione", allDay: false, textColor: "black", color: "rgb(201, 160, 220)", start: "2025-06-24T08:00:00", end: "2025-06-24T10:00:00", title: "Operazione 13" },
        { id: "14", workType: "Laser",      allDay: false, textColor: "black", color: "rgb(240, 128, 128)", start: "2025-06-24T13:00:00", end: "2025-06-24T15:00:00", title: "Laser 14" },
        { id: "15", workType: "Visita",     allDay: false, textColor: "black", color: "rgb(173, 216, 230)", start: "2025-06-25T08:00:00", end: "2025-06-25T10:00:00", title: "Visita 15" },
        { id: "16", workType: "Operazione", allDay: false, textColor: "black", color: "rgb(201, 160, 220)", start: "2025-06-25T13:00:00", end: "2025-06-25T15:00:00", title: "Operazione 16" },
        { id: "17", workType: "Laser",      allDay: false, textColor: "black", color: "rgb(240, 128, 128)", start: "2025-06-26T08:00:00", end: "2025-06-26T10:00:00", title: "Laser 17" },
        { id: "18", workType: "Visita",     allDay: false, textColor: "black", color: "rgb(173, 216, 230)", start: "2025-06-26T13:00:00", end: "2025-06-26T15:00:00", title: "Visita 18" },
        { id: "19", workType: "Operazione", allDay: false, textColor: "black", color: "rgb(201, 160, 220)", start: "2025-06-27T08:00:00", end: "2025-06-27T10:00:00", title: "Operazione 19" },
        { id: "20", workType: "Laser",      allDay: false, textColor: "black", color: "rgb(240, 128, 128)", start: "2025-06-27T13:00:00", end: "2025-06-27T15:00:00", title: "Laser 20" },

        { id: "21", workType: "Visita",     allDay: false, textColor: "black", color: "rgb(173, 216, 230)", start: "2025-06-30T08:00:00", end: "2025-06-30T10:00:00", title: "Visita 21" },
        { id: "22", workType: "Operazione", allDay: false, textColor: "black", color: "rgb(201, 160, 220)", start: "2025-06-30T13:00:00", end: "2025-06-30T15:00:00", title: "Operazione 22" },
        { id: "23", workType: "Laser",      allDay: false, textColor: "black", color: "rgb(240, 128, 128)", start: "2025-07-01T08:00:00", end: "2025-07-01T10:00:00", title: "Laser 23" },
        { id: "24", workType: "Visita",     allDay: false, textColor: "black", color: "rgb(173, 216, 230)", start: "2025-07-01T13:00:00", end: "2025-07-01T15:00:00", title: "Visita 24" },
        { id: "25", workType: "Operazione", allDay: false, textColor: "black", color: "rgb(201, 160, 220)", start: "2025-07-02T08:00:00", end: "2025-07-02T10:00:00", title: "Operazione 25" },
        { id: "26", workType: "Laser",      allDay: false, textColor: "black", color: "rgb(240, 128, 128)", start: "2025-07-02T13:00:00", end: "2025-07-02T15:00:00", title: "Laser 26" },
        { id: "27", workType: "Visita",     allDay: false, textColor: "black", color: "rgb(173, 216, 230)", start: "2025-07-03T08:00:00", end: "2025-07-03T10:00:00", title: "Visita 27" },
        { id: "28", workType: "Operazione", allDay: false, textColor: "black", color: "rgb(201, 160, 220)", start: "2025-07-03T13:00:00", end: "2025-07-03T15:00:00", title: "Operazione 28" },
        { id: "29", workType: "Laser",      allDay: false, textColor: "black", color: "rgb(240, 128, 128)", start: "2025-07-04T08:00:00", end: "2025-07-04T10:00:00", title: "Laser 29" },
        { id: "30", workType: "Visita",     allDay: false, textColor: "black", color: "rgb(173, 216, 230)", start: "2025-07-04T13:00:00", end: "2025-07-04T15:00:00", title: "Visita 30" },

        { id: "31", workType: "Operazione", allDay: false, textColor: "black", color: "rgb(201, 160, 220)", start: "2025-07-07T08:00:00", end: "2025-07-07T10:00:00", title: "Operazione 31" },
        { id: "32", workType: "Laser",      allDay: false, textColor: "black", color: "rgb(240, 128, 128)", start: "2025-07-07T13:00:00", end: "2025-07-07T15:00:00", title: "Laser 32" },
        { id: "33", workType: "Visita",     allDay: false, textColor: "black", color: "rgb(173, 216, 230)", start: "2025-07-08T08:00:00", end: "2025-07-08T10:00:00", title: "Visita 33" },
        { id: "34", workType: "Operazione", allDay: false, textColor: "black", color: "rgb(201, 160, 220)", start: "2025-07-08T13:00:00", end: "2025-07-08T15:00:00", title: "Operazione 34" },
        { id: "35", workType: "Laser",      allDay: false, textColor: "black", color: "rgb(240, 128, 128)", start: "2025-07-09T08:00:00", end: "2025-07-09T10:00:00", title: "Laser 35" },
        { id: "36", workType: "Visita",     allDay: false, textColor: "black", color: "rgb(173, 216, 230)", start: "2025-07-09T13:00:00", end: "2025-07-09T15:00:00", title: "Visita 36" },
        { id: "37", workType: "Operazione", allDay: false, textColor: "black", color: "rgb(201, 160, 220)", start: "2025-07-10T08:00:00", end: "2025-07-10T10:00:00", title: "Operazione 37" },
        { id: "38", workType: "Laser",      allDay: false, textColor: "black", color: "rgb(240, 128, 128)", start: "2025-07-10T13:00:00", end: "2025-07-10T15:00:00", title: "Laser 38" },
        { id: "39", workType: "Visita",     allDay: false, textColor: "black", color: "rgb(173, 216, 230)", start: "2025-07-11T08:00:00", end: "2025-07-11T10:00:00", title: "Visita 39" },
        { id: "40", workType: "Operazione", allDay: false, textColor: "black", color: "rgb(201, 160, 220)", start: "2025-07-11T13:00:00", end: "2025-07-11T15:00:00", title: "Operazione 40" },

        // Extra 10 events (41–45 in mornings, 46–50 in afternoons of first week)
        { id: "41", workType: "Laser",      allDay: false, textColor: "black", color: "rgb(240, 128, 128)", start: "2025-06-16T09:00:00", end: "2025-06-16T11:00:00", title: "Laser 41" },
        { id: "42", workType: "Visita",     allDay: false, textColor: "black", color: "rgb(173, 216, 230)", start: "2025-06-17T09:00:00", end: "2025-06-17T11:00:00", title: "Visita 42" },
        { id: "43", workType: "Operazione", allDay: false, textColor: "black", color: "rgb(201, 160, 220)", start: "2025-06-18T09:00:00", end: "2025-06-18T11:00:00", title: "Operazione 43" },
        { id: "44", workType: "Laser",      allDay: false, textColor: "black", color: "rgb(240, 128, 128)", start: "2025-06-19T09:00:00", end: "2025-06-19T11:00:00", title: "Laser 44" },
        { id: "45", workType: "Visita",     allDay: false, textColor: "black", color: "rgb(173, 216, 230)", start: "2025-06-20T09:00:00", end: "2025-06-20T11:00:00", title: "Visita 45" },

        { id: "46", workType: "Operazione", allDay: false, textColor: "black", color: "rgb(201, 160, 220)", start: "2025-06-16T14:00:00", end: "2025-06-16T16:00:00", title: "Operazione 46" },
        { id: "47", workType: "Laser",      allDay: false, textColor: "black", color: "rgb(240, 128, 128)", start: "2025-06-17T14:00:00", end: "2025-06-17T16:00:00", title: "Laser 47" },
        { id: "48", workType: "Visita",     allDay: false, textColor: "black", color: "rgb(173, 216, 230)", start: "2025-06-18T14:00:00", end: "2025-06-18T16:00:00", title: "Visita 48" },
        { id: "49", workType: "Operazione", allDay: false, textColor: "black", color: "rgb(201, 160, 220)", start: "2025-06-19T14:00:00", end: "2025-06-19T16:00:00", title: "Operazione 49" },
        { id: "50", workType: "Laser",      allDay: false, textColor: "black", color: "rgb(240, 128, 128)", start: "2025-06-20T14:00:00", end: "2025-06-20T16:00:00", title: "Laser 50" }
    ];

    shiftOccurance = [
        // 16 Jun
        { workType: "Operazione", start: "2025-06-16T08:00:00", end: "2025-06-16T16:00:00" },
        { workType: "Laser",      start: "2025-06-16T09:00:00", end: "2025-06-16T15:00:00" },
        // 17 Jun
        { workType: "Operazione", start: "2025-06-17T13:00:00", end: "2025-06-17T15:00:00" },
        { workType: "Laser",      start: "2025-06-17T14:00:00", end: "2025-06-17T16:00:00" },
        { workType: "Visita",     start: "2025-06-17T08:00:00", end: "2025-06-17T11:00:00" },
        // 18 Jun
        { workType: "Operazione", start: "2025-06-18T09:00:00", end: "2025-06-18T11:00:00" },
        { workType: "Laser",      start: "2025-06-18T08:00:00", end: "2025-06-18T10:00:00" },
        { workType: "Visita",     start: "2025-06-18T13:00:00", end: "2025-06-18T16:00:00" },
        // 19 Jun
        { workType: "Operazione", start: "2025-06-19T08:00:00", end: "2025-06-19T16:00:00" },
        { workType: "Laser",      start: "2025-06-19T09:00:00", end: "2025-06-19T15:00:00" },
        // 20 Jun
        { workType: "Operazione", start: "2025-06-20T13:00:00", end: "2025-06-20T15:00:00" },
        { workType: "Laser",      start: "2025-06-20T14:00:00", end: "2025-06-20T16:00:00" },
        { workType: "Visita",     start: "2025-06-20T08:00:00", end: "2025-06-20T11:00:00" },
        // 23 Jun
        { workType: "Laser",      start: "2025-06-23T08:00:00", end: "2025-06-23T10:00:00" },
        { workType: "Visita",     start: "2025-06-23T13:00:00", end: "2025-06-23T15:00:00" },
        // 24 Jun
        { workType: "Operazione", start: "2025-06-24T08:00:00", end: "2025-06-24T10:00:00" },
        { workType: "Laser",      start: "2025-06-24T13:00:00", end: "2025-06-24T15:00:00" },
        // 25 Jun
        { workType: "Visita",     start: "2025-06-25T08:00:00", end: "2025-06-25T10:00:00" },
        { workType: "Operazione", start: "2025-06-25T13:00:00", end: "2025-06-25T15:00:00" },
        // 26 Jun
        { workType: "Laser",      start: "2025-06-26T08:00:00", end: "2025-06-26T10:00:00" },
        { workType: "Visita",     start: "2025-06-26T13:00:00", end: "2025-06-26T15:00:00" },
        // 27 Jun
        { workType: "Operazione", start: "2025-06-27T08:00:00", end: "2025-06-27T10:00:00" },
        { workType: "Laser",      start: "2025-06-27T13:00:00", end: "2025-06-27T15:00:00" },
        // 30 Jun
        { workType: "Operazione", start: "2025-06-30T13:00:00", end: "2025-06-30T15:00:00" },
        { workType: "Visita",     start: "2025-06-30T08:00:00", end: "2025-06-30T10:00:00" },
        // 01 Jul
        { workType: "Laser",      start: "2025-07-01T08:00:00", end: "2025-07-01T10:00:00" },
        { workType: "Visita",     start: "2025-07-01T13:00:00", end: "2025-07-01T15:00:00" },
        // 02 Jul
        { workType: "Operazione", start: "2025-07-02T08:00:00", end: "2025-07-02T10:00:00" },
        { workType: "Laser",      start: "2025-07-02T13:00:00", end: "2025-07-02T15:00:00" },
        // 03 Jul
        { workType: "Operazione", start: "2025-07-03T13:00:00", end: "2025-07-03T15:00:00" },
        { workType: "Visita",     start: "2025-07-03T08:00:00", end: "2025-07-03T10:00:00" },
        // 04 Jul
        { workType: "Laser",      start: "2025-07-04T08:00:00", end: "2025-07-04T10:00:00" },
        { workType: "Visita",     start: "2025-07-04T13:00:00", end: "2025-07-04T15:00:00" },
        // 07 Jul
        { workType: "Operazione", start: "2025-07-07T08:00:00", end: "2025-07-07T10:00:00" },
        { workType: "Laser",      start: "2025-07-07T13:00:00", end: "2025-07-07T15:00:00" },
        // 08 Jul
        { workType: "Operazione", start: "2025-07-08T13:00:00", end: "2025-07-08T15:00:00" },
        { workType: "Visita",     start: "2025-07-08T08:00:00", end: "2025-07-08T10:00:00" },
        // 09 Jul
        { workType: "Laser",      start: "2025-07-09T08:00:00", end: "2025-07-09T10:00:00" },
        { workType: "Visita",     start: "2025-07-09T13:00:00", end: "2025-07-09T15:00:00" },
        // 10 Jul
        { workType: "Operazione", start: "2025-07-10T08:00:00", end: "2025-07-10T10:00:00" },
        { workType: "Laser",      start: "2025-07-10T13:00:00", end: "2025-07-10T15:00:00" },
        // 11 Jul
        { workType: "Operazione", start: "2025-07-11T13:00:00", end: "2025-07-11T15:00:00" },
        { workType: "Visita",     start: "2025-07-11T08:00:00", end: "2025-07-11T10:00:00" }
    ];
    workTypeEvents = [];

    // Public API properties
    @api workTypeName;
    @api titleField;
    @api objectName;
    @api startField;
    @api endField;
    @api colorField;
    @api additionalFilter;
    @api aspectRatio;
    @api allDayField;
    @api height;
    @api weekView;
    @api dayView;
    @api listView;
    @api viewMode;

    // Modal properties
    @track isModalOpen = false;

    // Parent Calendar this.state
    
    // Select Person Account
    dayMode = false;
    weekMode = false;
    monthMode = true;
    @track modal_selectAccount = false;

    @track searchTerm = '';
    @track records = [];
    @track selectedRecord;
    @track showDropdown = false;

    @track calendarLabel;

  connectedCallback() {
      this.addEventListener('fceventclick', this.handleEventClick.bind(this));
      this.workTypeEvents = this.salesforceEvents;
  }

  renderedCallback() {
        if (this.fullCalendarInitialized) {
            return;
        }
        this.fullCalendarInitialized = true;

        // Set global vars
        objectName = this.objectName;
        startField = this.startField;
        endField = this.endField;
        colorField = this.colorField;
        additionalFilter = this.additionalFilter;
        allDayField = this.allDayField;
        titleField = this.titleField;

        loadScript(this, fullCalendar + '/packages/core/main.js')
        loadStyle(this, fullCalendar + '/packages/core/main.css')
        .then(() => loadScript(this, fullCalendar + '/packages/daygrid/main.js'))
        .then(() => loadScript(this, fullCalendar + '/packages/list/main.js'))
        .then(() => loadScript(this, fullCalendar + '/packages/timegrid/main.js'))
        .then(() => loadScript(this, fullCalendar + '/packages/interaction/main.js'))
        .then(() => loadScript(this, fullCalendar + '/packages/moment/main.js'))
        .then(() => loadScript(this, fullCalendar + '/packages/moment-timezone/main.js'))
        // all JS are guaranteed executed in order now
        .then(() => {
            // load all CSS in parallel
            return Promise.all([
            loadStyle(this, fullCalendar + '/packages/daygrid/main.css'),
            loadStyle(this, fullCalendar + '/packages/list/main.css'),
            loadStyle(this, fullCalendar + '/packages/timegrid/main.css')
            ]);
        })
        .then(() => {
            console.log(`init ${this.workTypeName}`);
            this.init();
        })
        .catch(error => {
            console.error('FullCalendar failed to load', error);
            this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error loading FullCalendar',
                message: error.message,
                variant: 'error'
            })
            );
        });
    }

  init() {
    var calendarEl = this.template.querySelector(".calendar");
    // eslint-disable-next-line no-undef
    this.calendar = new FullCalendar.Calendar(calendarEl, {
      plugins: ["dayGrid", "timeGrid", "list", "interaction", "moment"],
        minTime: "07:00:00",
        maxTime: "20:00:00",
        eventOverlap: true,
        height: this.height,
        locale: 'it',
        views: {
            listDay: { buttonText: "list day" },
            listWeek: { buttonText: "list week" },
            listMonth: { buttonText: "list month" },
            timeGridWeek: { buttonText: "week time" },
            timeGridDay: { buttonText: "day time" },
            dayGridMonth: { 
                buttonText: "month",
                eventLimit: 5
            },
            dayGridWeek: { buttonText: "week" },
            dayGridDay: { buttonText: "day" },
            timeGrid: { 
                eventLimit: 6
            },
        },
        eventClick: info => {
          const selectedEvent = new CustomEvent('fceventclick', { detail: info });
          console.log("eventClick",info);
          this.dispatchEvent(selectedEvent);
          },
        eventMouseEnter: info => {console.log("mouse enter", info)},
        dateClick: async info => {
          console.log('inside DAteCLick inside calendar init');
          const currentView = this.calendar.view.type;
          if (currentView !== 'timeGridWeek' && currentView !== 'dayGridMonth') {
            console.log('werwerwerwerwerwe',this.clickedInsideShift(this.shiftOccurance, info.date));
              if (this.clickedInsideShift(this.shiftOccurance, info.date)) {
                console.log('open module');
                  const result = await VistaModal.open({
                      size: 'small',
                      label: 'Cerca Paziente'
                  });


                  if (result) {
                      console.log('Selected patient: ', result.Name);
                      // do something with result
                  }
              }
          } else {
            this.changeDailyView(info.date)
          }
        },
        header: false,
        allDaySlot: false,
        eventSources: [ 
          {
              id: 'custom',
              events: this.workTypeEvents
          }
        ],
    });
    this.calendar.render();
    this.calendarLabel = this.calendar.view.title;
  }

  nextHandler() {
    console.log('Inside nextHandler');
    this.calendar.next();
    this.calendarLabel = this.calendar.view.title;
    this.handleShiftOccurance(this.shiftOccurance);
  }

  previousHandler() {
    console.log('Inside previousHandler');
    this.calendar.prev();
    this.calendarLabel = this.calendar.view.title;
    this.handleShiftOccurance(this.shiftOccurance);
  }

  changeDailyView(date) {
    console.log('Inside today');
    this.calendar.changeView('timeGridDay', date);
    this.dailyViewHandler();
    this.handleShiftOccurance(this.shiftOccurance);
  }

  dailyViewHandler() {
    console.log('Inside dailyViewHandler');
    this.calendar.changeView(this.dayView);
    this.calendarLabel = this.calendar.view.title;
    this.weekMode = false;
    this.monthMode = false;
    this.dayMode = true;
    this.handleShiftOccurance(this.shiftOccurance);
  }

  weeklyViewHandler() {
    console.log('Inside weeklyViewHandler');
    this.calendar.changeView(this.weekView);
    this.calendarLabel = this.calendar.view.title;
    this.dayMode = false;
    this.monthMode = false;
    this.weekMode = true;
    this.handleShiftOccurance(this.shiftOccurance);
    }

  monthlyViewHandler() {
    console.log('Inside monthlyViewHandler');
    this.calendar.changeView('dayGridMonth');
    this.calendarLabel = this.calendar.view.title;
    this.dayMode = false;
    this.weekMode = false;
    this.monthMode = true;
    this.handleShiftOccurance(this.shiftOccurance);
  }

  today() {
    console.log('Inside today');
    this.calendar.today();
    this.calendarLabel = this.calendar.view.title;
    this.handleShiftOccurance(this.shiftOccurance);
  }

  refresh() {
    console.log('Inside refresh');
    var eventSource = this.calendar.getEventSourceById('custom');
    eventSource.refetch();
    this.handleShiftOccurance(this.shiftOccurance);
  }

  handleScroll(event) {
    console.log("handleScroll");
    event.stopImmediatePropogation();
  }


  handleEventClick(event) {
    let info = event.detail;
    console.log('Event: ' + info.event.title);
    console.log('Coordinates: ' + info.jsEvent.pageX + ',' + info.jsEvent.pageY);
    console.log('View: ' + info.view.type);
    console.log(info);
    this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: {
          recordId: info.event.id,
          actionName: 'view',
      },
    });
    // change the border color just for fun
    //info.el.style.borderColor = 'red';

  }

  eventSourceHandler(info, successCallback, failureCallback) {
    getEventsNearbyDynamic({
      startDate: info.start,
      endDate: info.end,
      objectName: objectName,
      titleField: titleField,
      startField: startField,
      endField: endField,
      colorField: colorField,
      allDayField: allDayField,
      additionalFilter: additionalFilter
    })
      .then(result => {
        if (result) {
          let events = result;
          let e = [];
          for (let event in events) {
            if (event) {
              e.push({
                title: events[event][titleField],
                start: events[event][startField],
                end: events[event][endField],
                Id: events[event].Id,
                id: events[event].Id,
                color: events[event][colorField],
                allDay: events[event][allDayField]
              });
            }
          }
          console.log("num events = ",e.length);
          successCallback(e);
        }
      })
      .catch(error => {
        console.error("error calling apex controller:",error);
        failureCallback(error);
      });
  }

    // Shift occurrence background highlighting
    handleShiftOccurance(shiftOccurance) {
        console.log('Inside Shift Occurance');

        console.log('DAY: ' + this.dayMode);
        console.log('WEEK: ' + this.weekMode);
        console.log('MONTH: ' + this.monthMode);

        if (!this.weekMode && !this.monthMode) {
            console.log('[shift:occ]: Daily If');
            // Grouping by workType
            const grouped = {};
            console.log('checkpoint1');
            for (const occ of shiftOccurance) {
              console.log('checkpoint2');
                if (!grouped[occ.workType]) {
                    grouped[occ.workType] = [];
                }
                grouped[occ.workType].push(occ);
            }

            // Call each calendar once with its group's entries
            for (const workType in grouped) {
                console.log('checkpoint3');
                // Pass the full group for that workType
                this.handleDailyShiftOccurance(grouped[workType]);
            }

        }
         else if (this.weekMode) {
            console.log('checkpoint4')
            console.log('[shift:occ]: Weekly else if');
            this.handleWeeklyShiftOccurance(shiftOccurance);
        }
    }

    handleDailyShiftOccurance(shiftOccurencyGroup) {
        console.log('inside handledailyshiftoccurance');
        const calendarDate = this.calendar.view.currentStart;
        console.log('calendarDate: ' + calendarDate);
        shiftOccurencyGroup.forEach(shift => {
            const shiftStartDate = new Date(shift.start);
            const shiftEndDate = new Date(shift.end);
            let isSelectedDayShift = false;

            if (calendarDate && shiftStartDate) {
                isSelectedDayShift =
                    calendarDate.getFullYear() === shiftStartDate.getFullYear() &&
                    calendarDate.getMonth() === shiftStartDate.getMonth() &&
                    calendarDate.getDate() === shiftStartDate.getDate();
            }

            if (isSelectedDayShift) {
                const startTimeSeconds = this.timeToSeconds(shiftStartDate.toTimeString().split(' ')[0]);
                const endTimeSeconds = this.timeToSeconds(shiftEndDate.toTimeString().split(' ')[0]);
                const rows = this.template.querySelectorAll('.fc-slats tr > td:nth-child(2)');
                console.log('ROW????: ' + rows);
                for (const node of rows) {
                    const rowTimeSeconds = this.timeToSeconds(node.parentElement.getAttribute('data-time'));
                    if (rowTimeSeconds >= startTimeSeconds && rowTimeSeconds <= endTimeSeconds) {
                        node.style.backgroundColor = 'rgb(223, 250, 170)';
                    }
                }
            }
        });
    }

    handleWeeklyShiftOccurance(shiftOccurance) {
        console.log(`Inside ShiftOcc - WEEK`);
        let shiftDays = [];
        for(let shift of shiftOccurance) { 
            let shiftDate = new Date(shift.start);
            let dateStr = `${shiftDate.getFullYear()}-${String(shiftDate.getMonth() + 1).padStart(2, '0')}-${String(shiftDate.getDate()).padStart(2, '0')}`;
            shiftDays.push(dateStr);
        }
        const headers = document.querySelectorAll('.fc-head-container .fc-day-header[data-date]');
        for (const node of headers) {
            let nodeDate = node.getAttribute('data-date');

            if(shiftDays.includes(nodeDate)) { 
                node.style.setProperty('background-color', 'rgb(223, 250, 170)', 'important');
            }
        }
    }

    clickedInsideShift(shiftOccurance, date) {
      console.log('INSIDE clickedInsideShift');
        let clickedDate = new Date(date);
        let clickedDateSeconds = this.timeToSeconds(clickedDate.toTimeString().split(' ')[0]);

        for (let i = 0; i < shiftOccurance.length; i++) {
            let shift = shiftOccurance[i];
            let shiftStartDate = new Date(shift.start);
            let shiftEndDate = new Date(shift.end);
            let shiftStartSeconds = this.timeToSeconds(shiftStartDate.toTimeString().split(' ')[0]);
            let shiftEndSeconds = this.timeToSeconds(shiftEndDate.toTimeString().split(' ')[0]);

            if (clickedDateSeconds >= shiftStartSeconds &&
                clickedDateSeconds <= shiftEndSeconds &&
                clickedDate.getDate() === shiftStartDate.getDate() &&
                clickedDate.getMonth() === shiftStartDate.getMonth() &&
                clickedDate.getYear() === shiftStartDate.getYear()) {
                return true;
            }
        }

        return false;
    }

    // Utility methods
    timeToSeconds(timeStr) {
        const [h, m, s] = timeStr.split(':').map(Number);
        return h * 3600 + m * 60 + s;
    }

    // Modal methods
    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    handleInputChange(event) {
        this.searchTerm = event.target.value;
        if(this.searchTerm.length > 1) {
            getPersonAccount( { searchTerm: this.searchTerm} )
                .then(result => {
                    console.log('inside getpersonaccount LWC');
                    this.records = result;
                    this.showDropdown = true;
                })
                .catch(error => {
                    console.log('error: ' + error);
                    this.records = [];
                });
        }
        else { 
            this.records = [];
            this.showDropdown = false;
        }
    }

    handleSelect(event) {
        const recordId = event.currentTarget.dataset.id;
        const recordName = event.currentTarget.dataset.name;
        this.selectedRecord = { Id: recordId, Name: recordName };
        this.searchTerm = recordName;
        this.records = [];
        this.showDropdown = false;
    }

}