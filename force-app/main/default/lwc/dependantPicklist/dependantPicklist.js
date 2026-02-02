import { LightningElement, wire } from 'lwc';
import { getObjectInfo, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';

export default class DependantPicklist extends LightningElement {
    parentValue = '';
    childValue = '';
    parentOptions = [];
    filteredChildOptions = [];
    recordTypeId;
    controllerValues = {};

    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT })
    objectInfo({ data }) {
        if (data) {
            this.recordTypeId = Object.keys(data.recordTypeInfos).find(rti => data.recordTypeInfos[rti].master);
        }
    }

    @wire(getPicklistValuesByRecordType, { objectApiName: ACCOUNT_OBJECT, recordTypeId: '$recordTypeId' })
    picklistValues({ data }) {
        if (data) {
            const parent = data.picklistFieldValues?.ParentCtrl__c;
            const child = data.picklistFieldValues?.ChildDepend__c;
            console.log('parent' + JSON.stringify(parent));
            console.log('child' + JSON.stringify(child));
            if (parent) this.parentOptions = parent.values.map(i => ({ label: i.label, value: i.value }));
            if (child && parent) {
                this.controllerValues = {};
                child.values.forEach(c => c.validFor?.forEach(idx => {
                    const pv = parent.values[idx].value;
                    (this.controllerValues[pv] = this.controllerValues[pv] || []).push({ label: c.label, value: c.value });
                }));
            }
        }
    }

    handleParentChange(event) {
        this.parentValue = event.detail.value;
        this.filteredChildOptions = this.controllerValues[this.parentValue] || [];
        if (!this.filteredChildOptions.some(o => o.value === this.childValue)) this.childValue = '';
    }

    handleChildChange(event) {
        this.childValue = event.detail.value;
    }

    get isChildDisabled() {
        return !this.parentValue;
    }
}