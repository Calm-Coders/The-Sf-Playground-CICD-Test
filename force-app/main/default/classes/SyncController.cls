public with sharing class SyncController {

    @InvocableMethod(label='SyncButton')
    public static void syncController(List<Id> recordId) {
        Account acc = new Account(name=recordId[0]);
        insert acc;
    }
}