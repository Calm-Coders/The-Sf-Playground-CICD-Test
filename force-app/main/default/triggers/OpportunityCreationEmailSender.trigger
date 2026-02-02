trigger OpportunityCreationEmailSender on Opportunity (after insert) {

    switch on Trigger.operationType {
        when AFTER_INSERT {
            OpportunityCreationEmailSenderHandler.emailHandler(Trigger.new);
        }
    }
}