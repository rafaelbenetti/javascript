
function showName(firstName, lastName) {    
    this.nameIntro = "Your name is ";

    // This is an enclosure. You can access the values of the showName function.
    function makeFullName() {
        return nameIntro + firstName + " " + lastName;
    }   
    return makeFullName();
}
console.log(showName("Princess", "Gabby"));