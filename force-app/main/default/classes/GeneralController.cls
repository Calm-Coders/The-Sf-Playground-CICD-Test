public with sharing class GeneralController {




    @AuraEnabled(cacheable=true)
    public static List<Contact> getContacts() {
        return [SELECT Id, Name, email, AccountId FROM Contact LIMIT 10];
    }

}