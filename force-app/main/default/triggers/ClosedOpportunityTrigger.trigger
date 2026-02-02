trigger ClosedOpportunityTrigger on Opportunity (after insert, after update) {

    List<Opportunity> toProcess = new List<Opportunity>();
    List<Task> tasks = new List<Task>();

    switch on Trigger.operationType {
        when AFTER_INSERT {
            for (Opportunity opp : Trigger.new) {
                if (opp.StageName == 'Closed Won') {
                    toProcess.add(opp);
                }
            }
        }
        when AFTER_UPDATE {
            for (Opportunity opp : Trigger.new) {
                if (opp.StageName == 'Closed Won') {
                    toProcess.add(opp);
                }
            }
        }
    }

    for (Opportunity opp : toProcess) {
        tasks.add(new Task(
            Subject = 'Follow Up Test Task',
            WhatId = opp.Id
        ));
    }

    if (tasks.size() > 0) {
        insert tasks;
    }
}