import LightningModal from 'lightning/modal';
import getPersonAccount from '@salesforce/apex/FullCalendarController.getPersonAccount';

export default class VistaModal extends LightningModal {
    searchTerm = '';
    records = [];
    selectedRecord;
    showDropdown = false;

    handleInputChange(event) {
        this.searchTerm = event.target.value;
        if (this.searchTerm.length > 1) {
            getPersonAccount({ searchTerm: this.searchTerm })
                .then(result => {
                    this.records = result;
                    this.showDropdown = true;
                    console.log(`>>> ${this.records}`);
                })
                .catch(error => {
                    console.error('Error fetching person accounts: ', error);
                    this.records = [];
                });
        } else {
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

    handleClose() {
        this.close('closed');
    }

    handleNext() {
        this.close(this.selectedRecord);
    }
}