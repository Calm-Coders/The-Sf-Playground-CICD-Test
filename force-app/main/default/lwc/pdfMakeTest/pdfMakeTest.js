import { LightningElement } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import pdfmakeResource from '@salesforce/resourceUrl/pdfmake';
import pdfmakeVFSResource from '@salesforce/resourceUrl/pdfmakeVFS';

export default class PdfMakeTest extends LightningElement {
    pdfmakeInitialized = false;

    connectedCallback() {
        if (this.pdfmakeInitialized) {
            return;
        }

        Promise.all([
            loadScript(this, pdfmakeResource),
            loadScript(this, pdfmakeVFSResource)
        ])
            .then(() => {
                // Ensure pdfMake is properly assigned
                window.pdfMake = window.pdfMake || pdfMake;
                window.pdfMake.vfs = window.pdfMake.vfs || pdfmakeVFSResource.pdfMake.vfs;
                this.pdfmakeInitialized = true;
                console.log('pdfMake Library loaded successfully');
            })
            .catch(error => {
                console.error('Error loading pdfMake:', error);
            });
    }

    generatePDF() {
        if (!this.pdfmakeInitialized || !window.pdfMake) {
            console.error('pdfMake is not loaded properly');
            return;
        }

        const docDefinition = {
            content: [
                { text: 'Hello World in PDF!', fontSize: 14, bold: true },
                { text: 'This is a test document.', italics: true },
                { text: 'Different font: ', fontSize: 12, font: 'Courier' }
            ]
        };

        window.pdfMake.createPdf(docDefinition).download('Test.pdf');
    }
}