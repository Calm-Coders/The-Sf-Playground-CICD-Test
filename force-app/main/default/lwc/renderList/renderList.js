import { LightningElement } from 'lwc';
import getContacts from '@salesforce/apex/GeneralController.getContacts'

export default class RenderList extends LightningElement {
    contacts = [];
    error;

    connectedCallback() {
        this.fetchContactsAndProcessAsyncAwait();
    }

    fetchContactsAndProcessPromise() {
        getContacts()
            .then((result) => {
                console.log(result);
                console.log('Result Length: ' + result.length);
                this.contacts = result.map(cont => {
                    let nameLength = cont.Name?.length || 0;
                    let email = cont.Email || '';

                    if (!cont.hasOwnProperty("Email")) {
                        email = '_'.repeat(30 - nameLength) + '=NO MAIL=';
                    }
                    else{
                        email = '_'.repeat(30 - nameLength) + cont.Email;

                    }

                    return { ...cont, Email: email };
                });
            })
            .catch((error) => {
                this.error = error;
                console.log("Error fetching contacts: " + error);
            });
    }

    async fetchContactsAndProcessAsyncAwait() {
        const result = await getContacts();
        try {
            this.contacts = result.map(cont => {
                let nameLength = cont.Name?.length || 0;
                let email = cont.Email || '';

                if (!cont.hasOwnProperty("Email")) {
                    email = '_'.repeat(30 - nameLength) + '=NO MAIL=';
                }
                else{
                    email = '_'.repeat(30 - nameLength) + cont.Email;

                }

                return { ...cont, Email: email };
            });
        }catch(error) {
            this.error = error;
            console.log("Error fetching contacts: " + error);
        }
    }
}

/* 
t.map(cont => ({
                    ...cont,
                    Email: cont.Email ? cont.Email : "=NO MAIL=" 
                }));
*/