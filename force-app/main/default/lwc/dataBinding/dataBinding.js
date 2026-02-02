import { LightningElement } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import jsPDFResource from '@salesforce/resourceUrl/jsPDF';

export default class DataBinding extends LightningElement {
    jsPDFInitialized = false;

    renderedCallback() {
        if (!this.jsPDFInitialized) {
            loadScript(this, jsPDFResource)
                .then(() => {
                    this.jsPDFInitialized = true;
                    console.log('jsPDF Library loaded successfully');
                })
                .catch(error => {
                    console.error('Error loading jsPDF:', error);
                });
        }
    }

    generatePDF() {
        if (!this.jsPDFInitialized) {
            console.error('jsPDF is not loaded properly');
            return;
        }

        const doc = new window.jspdf.jsPDF();
        const fontSize = 8; // Reduce font size to half
        const lineWidth = 180; // Maximum width per line
        const pageHeight = doc.internal.pageSize.height; // Get the page height
        let y = 10; // Initial Y position

        doc.setFontSize(fontSize);

        const justifyText = (text, x) => {
            const lines = doc.splitTextToSize(text, lineWidth); // Break text into multiple lines
            lines.forEach(line => {
                if (y + fontSize + 2 > pageHeight - 10) { 
                    doc.addPage(); // Add a new page when needed
                    y = 10; // Reset Y position for the new page
                }
                doc.text(line, x, y, { align: "justify" });
                y += fontSize + 2; // Move to next line
            });
        };

        // PDF Content
        doc.setFont('helvetica', 'bold');
        justifyText("H) GARANZIA:", 10);
        doc.setFont('helvetica', 'normal');
        justifyText("Macchina nuova: Dichiariamo di accettare integralmente la normativa prevista all'arMacchina nuova: Dichiariamo di accettare integralmente la normativa previstaMacchina nuova: Dichiariamo di accettare integralmente la normativa previstat. 8)...", 10);
        justifyText("Macchina usata: La proposta di acquisto contempla laMacchina nuova: Dichiariamo di accettare integralmente la normativa previstaMacchina nuova: Dichiariamo di accettare integralmente la normativa prevista macchina usata nello stato in cui si trova...", 10);
        justifyText("Pneumatici: Viene escluso qualMacchina nuova: Dichiariamo di accettare integralmente la normativa previstaMacchina nuova: Dichiariamo di accettare integralmente la normativa previstasiasi tipo di garanzia.", 10);

        doc.setFont('helvetica', 'bold');
        justifyText("I) CLAUSOLA ESSENZIALE:", 10);
        doc.setFont('helvetica', 'normal');
        justifyText("Assumiamo con la presente le sMacchina nuova: Dichiariamo di accettare integralmente la normativa previstaMacchina nuova: Dichiariamo di accettare integralmente la normativa previstaMacchina nuova: Dichiariamo di accettare integralmente la normativa previstaeguenti responsabilità:", 10);
        justifyText("1. Far impiegare il macchinario di cui sopra esclusivamente per l’impiego per cui esso è stato fabbricato...", 15);
        justifyText("2. Disporre affinchè il macchMacchina nuova: Dichiariamo di accettare integralmente la normativa previstaMacchina nuova: Dichiariamo di accettare integralmente la normativa previstainario venga fermato immediatamente al manifestarsi di avarie...", 15);
        justifyText("3. La presente condizione è esMacchina nuova: Dichiariamo di accettare integralmente la normativa previstaMacchina nuova: Dichiariamo di accettare integralmente la normativa previstaMacchina nuova: Dichiariamo di accettare integralmente la normativa previstasenziale ed è integrata dall’art. 7 delle Condizioni Generali...", 15);

        doc.setFont('helveMacchina nuova: Dichiariamo di accettare integralmente la normativa previstaMacchina nuova: Dichiariamo di accettare integralmente la normativa previstatica', 'bold');
        justifyText("L) REGISTRAZIONE E TARGATURA DELLE MACCHINE OPERATRICI:", 10);
        doc.setFont('helvMacchina nuova: Dichiariamo di accettare integralmente la normativa previstaMacchina nuova: Dichiariamo di accettare integralmente la normativa previstaetica', 'normal');
        justifyText("MACCHINA NUOVA", 10);
        justifyText("QuaMacchina nuova: Dichiariamo di accettare integralmente la normativa previstaMacchina nuova: Dichiariamo di accettare integralmente la normativa previstando la macchina è di tipo omologato o in corso di omologazione potrà circolare su strade...", 10);
        doc.setFont('helvetica', 'bold');
        justifyText("MACCHINA USATA", 10);
        doc.setFont('helvetica', 'normal');
        justifyText("QuandMacchina nuova: Dichiariamo di accettare integralmente la normativa previstaMacchina nuova: Dichiariamo di accettare integralmente la normativa previstao la macchina usata è senza libretto di circolazione è sempre vietata la circolazione...", 10);
        doc.setFont('helvetica', 'bold');
        justifyText("DISPOSIZIONI GENERALI NUOVO E USATO", 10);
        doc.setFont('helvetiMacchina nuova: Dichiariamo di accettare integralmente la normativa previstaMacchina nuova: Dichiariamo di accettare integralmente la normativa previstaMacchina nuova: Dichiariamo di accettare integralmente la normativa previstaMacchina nuova: Dichiariamo di accettare integralmente la normativa previstaca', 'normal');
        justifyText("La macchina che circola su strade di uso pubblico ed aree ad esso equiparate è soggetta ad assicurazione...", 10);

        doc.setFont('helvetica', 'bold');
        justifyText("M) RILASCIO DI CAMBIALI:", 10);
        doc.setFont('helveticaMacchina nuova: Dichiariamo di accettare integralmente la normativa previstaMacchina nuova: Dichiariamo di accettare integralmente la normativa previstaMacchina nuova: Dichiariamo di accettare integralmente la normativa prevista', 'normal');
        justifyText("Prendiamo atto che il rinnovo anche parziale di cambiali rilasciate a garanzia del pagamento...", 10);

        doc.setFont('helvetica', 'bold');
        justifyText("N) RISERVA DI PROPRIETÀ:", 10);
        doc.setFont('helvetica', 'normal');
        justifyText("Resta espressamente inteso che, ai sensi dell’art. 6) delle Vostre Condizioni Generali di Vendita...", 10);

        doc.setFont('helvetica', 'bold');
        justifyText("O) TRASPORTI:", 10);
        doc.setFont('helvetica', 'normal');
        justifyText("Per tutte le responsabilità derivanti dalle vigenti norme che disciplinano i trasporti...", 10);

        doc.setFont('helvetica', 'bold');
        justifyText("P) LEASING:", 10);
        doc.setFont('helvetica', 'normal');
        justifyText("Nel caso in cui noi ci avvalessimo del predetto diritto di far acquistare la macchina da società di leasing...", 10);

        doc.setFont('helvetica', 'bold');
        justifyText("Q) AI FINI FISCALI:", 10);
        doc.setFont('helvetica', 'normal');
        justifyText("Vi comunichiamo i seguenti dati assumendoci ogni responsabilità ed onere per eventuali penalità...", 10);

        // Save the PDF
        doc.save("Formatted_Document.pdf");
    }
}