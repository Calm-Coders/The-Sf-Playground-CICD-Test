trigger OpportunityTrigger on Opportunity (before insert, before update) {

    for(Opportunity opp :   Trigger.new) {
        if(opp.Amount < 100) {
            opp.Amount.addError('The amount is too small!');
        }
    }
}