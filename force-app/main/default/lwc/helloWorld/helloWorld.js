import { LightningElement, api } from 'lwc';
export default class HelloWorld extends LightningElement {

    message = 'Private Property';
    @api recordId; 
    greeting = 'World';
    changeHandler(event) {
        this.greeting = event.target.value;
    }
}