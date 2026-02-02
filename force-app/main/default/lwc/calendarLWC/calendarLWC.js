import { LightningElement } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import fullcalendarJS from '@salesforce/resourceUrl/fullcalendarJS';
import fullcalendarCSS from '@salesforce/resourceUrl/fullcalendarCSS';

export default class CalendarLWC extends LightningElement {
    calendarInitialized = false;

    connectedCallback() {
        if (this.calendarInitialized) return;
        this.calendarInitialized = true;

        Promise.all([
            loadScript(this, fullcalendarJS),
            loadStyle(this, fullcalendarCSS)
        ])
        .then(() => {
            this.initializeCalendar();
        })
        .catch(error => {
            console.error('Failed to load FullCalendar resources:', error.message || error);
        });
    }

    initializeCalendar() {
        const calendarEl = this.template.querySelector('.calendar');
        const calendar = new window.FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            events: [
                { title: 'Meeting', start: '2025-05-22' },
                { title: 'Demo', start: '2025-05-25' }
            ]
        });


        calendar.render();
    }
}