import { LightningElement, api, track } from 'lwc';

export default class CustomForm extends LightningElement {
    @api recordId;

 @track fieldMap = [
    {
        name: 'Name',
        label: 'Full Name',
        value: 'Apples & Oranges',
        type: 'text',
        isEdit: false,
        isText: true,
        isEmail: false,
        isPhone: false,
        isNumber: false,
        isDateTime: false
    },
    {
        name: 'Email',
        label: 'Email Address',
        value: 'example@example.com',
        type: 'email',
        isEdit: false,
        isText: false,
        isEmail: true,
        isPhone: false,
        isNumber: false,
        isDateTime: false
    },
    {
        name: 'Phone',
        label: 'Phone Number',
        value: '123-456-7890',
        type: 'phone',
        isEdit: false,
        isText: false,
        isEmail: false,
        isPhone: true,
        isNumber: false,
        isDateTime: false
    },
    {
        name: 'Potential_Value__c',
        label: 'Potential Value',
        value: 'false',
        type: 'checkbox',
        isEdit: false,
        isText: false,
        isEmail: false,
        isPhone: false,
        isNumber: false,
        isCheckbox: true,
        isDateTime: false
    },
    {
        name: 'Tier',
        label: 'Tier',
        value: 'A',
        type: 'text',
        isEdit: false,
        isText: true,
        isEmail: false,
        isPhone: false,
        isNumber: false,
        isDateTime: false
    },
    {
        name: 'CreatedDate',
        label: 'Created Date',
        value: '2023-10-01T15:30:00Z',
        type: 'datetime',
        isEdit: false,
        isText: false,
        isEmail: false,
        isPhone: false,
        isNumber: false,
        isDateTime: true
    }
];


    handleFieldEdit(event) {
    const fieldApiName = event.target.dataset.fieldApiName;
    const field = this.fieldMap.find(f => f.name === fieldApiName);
    if (field) {
        field.isEdit = true;
        this.fieldMap = [...this.fieldMap];

        setTimeout(() => {
            const input = this.template.querySelector(`lightning-input[data-field-api-name="${fieldApiName}"]`);
            if (input) {
                input.focus();
            }
        }, 0);
    }
}


    handleFieldBlur(event) {
        console.log('Inside handleFieldBlur');
        const fieldApiName = event.target.dataset.fieldApiName;
        const field = this.fieldMap.find(f => f.name === fieldApiName);
        if (field) {
            field.isEdit = false;
            field.value = event.target.value;
            this.fieldMap = [...this.fieldMap];
        }
    }
}