
Feature('Connexion');

Scenario('Test connexion to dealabs', (I) => {
    //check if preview button is not on login page
    // I.amOnPage('/');
    // I.click("#login_header a");
    // I.wait(1);
    // I.dontSeeElementInDOM("#login_form .enter_validate:nth-child(2)");
    // I.click("#close_login");
    I.login();
});
