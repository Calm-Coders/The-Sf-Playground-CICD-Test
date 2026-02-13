import { LightningElement, api } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import fullCalendar from "@salesforce/resourceUrl/fullCalendar";
import fullCalendarCSS from "@salesforce/resourceUrl/fullcalendarCSS";
import { loadStyle, loadScript } from "lightning/platformResourceLoader";
import calendarModal from 'c/calendarModal';
import FORM_FACTOR from '@salesforce/client/formFactor';

export default class FullCalendarComponent extends LightningElement {

    // Configurable properties
    @api objectName;
    @api startField;
    @api endField;
    @api titleField;
    @api colorField;
    @api allDayField;
    @api additionalFilter;
    @api aspectRatio;
    @api height;
    @api weekView;
    @api dayView;
    @api listView;

    // Private properties
    calendar;
    fullCalendarInitialized = false;
    calendarEvents = [];

    // Calendar State
    calendarLabel;
    viewMode;
    dayMode = false;
    weekMode = false;
    monthMode = true;

    // CSS Responsive Structure
    cssStructure = {
        calendarHeaderContainer: {
            desktop: "calendarHeaderContainer slds-grid slds-wrap",
            mobile: "calendarHeaderContainer slds-grid slds-wrap",
            dynamic: ""
        },
        calendarHeaderTitleClinic: {
            desktop: "calendarHeaderTitleClinic slds-col slds-size_8-of-12 slds-p-bottom_medium slds-p-left_x-small slds-p-right_small",
            mobile: "calendarHeaderTitleClinic slds-col slds-size_8-of-12 slds-p-bottom_medium slds-p-left_x-small slds-p-right_small",
            dynamic: ""
        },
        calendarHeaderControls: {
            desktop: "calendarHeaderControls slds-col slds-size_3-of-12 slds-p-left_small slds-p-right_x-small",
            mobile: "calendarHeaderControls slds-col slds-size_3-of-12 slds-p-left_small slds-p-right_x-small",
            dynamic: ""
        }
    };

    connectedCallback() {
        this.assignDynamicClasses();
    }

    renderedCallback() {
        if (this.fullCalendarInitialized) return;
        this.fullCalendarInitialized = true;

        Promise.resolve()
            .then(() => loadScript(this, fullCalendar + '/packages/core/main.js'))
            .then(() => Promise.all([
                loadStyle(this, fullCalendar + '/packages/core/main.css'),
                loadStyle(this, fullCalendarCSS)
            ]))
            .then(() => loadScript(this, fullCalendar + '/packages/interaction/main.js'))
            .then(() => loadScript(this, fullCalendar + '/packages/daygrid/main.js'))
            .then(() => loadScript(this, fullCalendar + '/packages/timegrid/main.js'))
            .then(() => loadScript(this, fullCalendar + '/packages/list/main.js'))
            .then(() => loadScript(this, fullCalendar + '/packages/moment/main.js'))
            .then(() => loadScript(this, fullCalendar + '/packages/moment-timezone/main.js'))
            .then(() => Promise.all([
                loadStyle(this, fullCalendar + '/packages/daygrid/main.css'),
                loadStyle(this, fullCalendar + '/packages/timegrid/main.css'),
                loadStyle(this, fullCalendar + '/packages/list/main.css'),
            ]))
            .then(() => this.init())
            .catch(err => {
                console.error('FullCalendar failed to load', err);
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error loading FullCalendar',
                    message: err?.message || 'Static Resources not available',
                    variant: 'error'
                }));
            });
    }

    init() {
        var calendarEl = this.template.querySelector(".calendar");
        // eslint-disable-next-line no-undef
        this.calendar = new FullCalendar.Calendar(calendarEl, {
            plugins: ["interaction", "dayGrid", "timeGrid", "list", "moment"],
            initialView: "dayGridMonth",
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
                console.log('Event clicked:', info.event);
            },
            dateClick: async info => {
                const currentView = this.calendar.view.type;

                if (currentView !== 'timeGridWeek' && currentView !== 'dayGridMonth') {
                    let inputDate = info.date;
                    let yyyy = inputDate.getFullYear();
                    let mm = String(inputDate.getMonth() + 1).padStart(2, '0');
                    let dd = String(inputDate.getDate()).padStart(2, '0');
                    let selectedDate = `${yyyy}-${mm}-${dd}`;

                    const result = await calendarModal.open({
                        size: 'small',
                        label: 'Vista Modal',
                        startDate: selectedDate
                    });
                    console.log('Modal result:', result);
                } else {
                    this.changeDailyView(info.date);
                }
            },
            header: false,
            allDaySlot: false,
            eventSources: [
                {
                    id: 'custom',
                    events: this.calendarEvents
                }
            ],
        });
        this.calendar.render();
        this.calendarLabel = this.calendar.view.title;
    }

    nextHandler() {
        this.calendar.next();
        this.calendarLabel = this.calendar.view.title;
    }

    previousHandler() {
        this.calendar.prev();
        this.calendarLabel = this.calendar.view.title;
    }

    changeDailyView(date) {
        this.calendar.changeView('timeGridDay', date);
        this.dailyViewHandler();
    }

    dailyViewHandler() {
        this.calendar.changeView('timeGridDay');
        this.calendarLabel = this.calendar.view.title;
        this.weekMode = false;
        this.monthMode = false;
        this.dayMode = true;
    }

    weeklyViewHandler() {
        this.calendar.changeView('timeGridWeek');
        this.calendarLabel = this.calendar.view.title;
        this.dayMode = false;
        this.monthMode = false;
        this.weekMode = true;
    }

    monthlyViewHandler() {
        this.calendar.changeView('dayGridMonth');
        this.calendarLabel = this.calendar.view.title;
        this.dayMode = false;
        this.weekMode = false;
        this.monthMode = true;
    }

    today() {
        this.calendar.today();
        this.calendarLabel = this.calendar.view.title;
    }

    refresh() {
        var eventSource = this.calendar.getEventSourceById('custom');
        eventSource.refetch();
    }

    // Utility
    formatDate = (dateStr) => {
        const d = new Date(dateStr);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    assignDynamicClasses() {
        const isMobile = FORM_FACTOR === 'Small';
        const variantKey = isMobile ? 'mobile' : 'desktop';

        Object.keys(this.cssStructure).forEach(key => {
            this.cssStructure[key].dynamic = this.cssStructure[key][variantKey] || '';
        });
    }

    get cls() {
        return this.cssStructure;
    }
}
