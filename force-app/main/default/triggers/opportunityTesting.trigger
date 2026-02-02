trigger opportunityTesting on Opportunity (before insert, before update, after update) {

    switch on Trigger.operationType {

        when BEFORE_INSERT {
            System.debug('brenda is insert switch');
            OpportunityTestingHandler.handleBeforeInsert(Trigger.new);
        }
        when BEFORE_UPDATE {
            System.debug('brenda in before update switch');
            OpportunityTestingHandler.handleBeforeUpdate(Trigger.oldMap, Trigger.newMap);
        }
        when AFTER_UPDATE {
            System.debug('brenda in after update switch');
            OpportunityTestingHandler.handleAfterUpdate(Trigger.oldMap, Trigger.newMap);
        }
    }
}