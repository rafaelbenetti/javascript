function sayMyName() {
    function getFullName() {
        return 'Rafael de Oliveira Benetti';
    }

    /*
        It will show an error because getFullName isn't part of sayMyName. 
        It means that you can't access using "this" keyword.
        Instead getFullName is a function in this scope. 
        It means that you can access without "this" keyword.        
    */
    return this.getFullName();
}

sayMyName();