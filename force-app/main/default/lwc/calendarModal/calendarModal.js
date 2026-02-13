import { api } from "lwc";
import LightningModal from 'lightning/modal';

export default class CalendarModal extends LightningModal {

    @api startDate;

    handleClose() {
        this.close('closed');
    }
}
