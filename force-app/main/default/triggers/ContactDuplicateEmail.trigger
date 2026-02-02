trigger ContactDuplicateEmail on Contact (before insert, before update) {

    switch on Trigger.operationType { 
        when BEFORE_INSERT {
            ContactDuplicateEmailHandler.duplicateInsert(Trigger.new);
        }
        when BEFORE_UPDATE{ 
            ContactDuplicateEmailHandler.duplicateUpdate(Trigger.new, Trigger.oldMap);
        }
    }
}