import { LightningElement } from 'lwc';
import eCalendar from "@salesforce/resourceUrl/eCalendar";
import { loadStyle, loadScript } from "lightning/platformResourceLoader";

export default class ECalendar extends LightningElement {
    calendarInitialized = false;

    renderedCallback() {
        if (this.calendarInitialized) {
            return;
        }
        this.calendarInitialized = true;

        Promise.all([
            loadScript(this, eCalendar + '/eCalendar/main.js'),
            loadStyle(this, eCalendar + '/eCalendar/main.css')
        ])
        .then(() => {
            console.log('Calendar library loaded');
            this.initializeCalendar();
        })
        .catch(error => {
            console.error('Error loading calendar resources', error);
        });
    }

initializeCalendar() {
    const container = this.template.querySelector('.ec');
    if (!container || !window.EventCalendar) {
        return console.error('Calendar container or API not found');
    }

    this.calendarInstance = window.EventCalendar.create(container, {
        headerToolbar: {
            start: 'today timeGridDay timeGridWeek dayGridMonth',
            center: 'title',
            end: 'prev,next'
        },

        view: 'resourceTimeGridDay',
        resources: [
            { id: 'r1', title: 'Room A' },
            { id: 'r2', title: 'Room B' },
            { id: 'r3', title: 'Room C' }
        ],
        events: [
            { id: 1, resourceIds: ['r1'], start: '2025-05-30 09:00', end: '2025-05-30 11:00', title: 'Meeting with A' },
            { id: 2, resourceIds: ['r1'], start: '2025-05-30 10:00', end: '2025-05-30 12:00', title: 'Meeting with A2' },
            { id: 3, resourceIds: ['r2'], start: '2025-05-30 11:00', end: '2025-05-30 12:00', title: 'Meeting with B' },
            { id: 4, resourceIds: ['r3'], start: '2025-05-30 14:00', end: '2025-05-30 17:00', title: 'Meeting with C' }
        ],

        // ─── new drag-to-create options ───
        editable:    true, 
        selectable:  true, 
        selectMirror: true,

        select: info => {
            // prompt the user for a title
            const title = prompt('Enter event title:');
            if (title) {
                this.calendarInstance.addEvent({
                    title,
                    start: info.startStr,
                    end:   info.endStr,
                    // if dragging inside a resource column, carry over the resource
                    resourceIds: info.resource ? [info.resource.id] : undefined
                });
            }
            // clear the selection highlight
            this.calendarInstance.unselect();
        },

        // ─── existing handlers ───
        datesSet:  info => console.log('datesSet:', info.startStr, info.view.type),
        eventClick: info => console.log('eventClick on', info.event.title),

        allDaySlot:  false,
        slotMinTime: '07:00:00',
        slotMaxTime: '20:00:00',
        nowIndicator: true
    });
}

  disconnectedCallback() {
    if (this.calendarInstance) {
      window.EventCalendar.destroy(this.calendarInstance);
      this.calendarInstance = null;
    }
  }
}