trigger TotalOpportunities on Opportunity (before insert, before delete) {

    switch on Trigger.operationType {
        when BEFORE_INSERT {
            TotalOpportunitiesHandle.insertionHandle(Trigger.new);
        }
        when BEFORE_DELETE {
            TotalOpportunitiesHandle.deletionHandle(Trigger.old);
        }
    }
}