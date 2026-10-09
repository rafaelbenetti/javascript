function celebrityName(firstName) {
    var nameIntro = "The celebrity is ";

    // We don't have declared the lastName variable.
    function lastName(lastName) {
        console.log(nameIntro + firstName + " " + lastName);
    }

    return lastName;
}

celebrityName("Gabrielle")("Crevecoeur");
