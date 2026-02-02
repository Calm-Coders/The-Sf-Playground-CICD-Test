import { LightningElement, track } from 'lwc';

export default class Prova extends LightningElement {
    
    @track selectedMode = 'byWork';
    @track searchTerm = '';
    @track searchResults = [];

    get isByWork() {
        return this.selectedMode === 'byWork';
    }

    get isByName() {
        return this.selectedMode === 'byName';
    }

    get isByPrevious() {
        return this.selectedMode === 'byPrevious';
    }

    handleModeChange(event) {
        this.selectedMode = event.target.value;
        this.searchResults = [];
        this.searchTerm = '';
    }

    handleSearchInput(event) {
        this.searchTerm = event.target.value;

        // 🔍 Mock data – replace with Apex call
        const mockData = [
            {
                id: '1',
                name: 'Dr CommunityTest Testing',
                role: 'Technician',
                activeStatus: 'true',
                lastAppointment: '30 Jun 2025'
            }
        ];

        this.searchResults = mockData.filter(res =>
            res.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        );
    }
}