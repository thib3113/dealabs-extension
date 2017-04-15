
Feature('Options');

Scenario('Test options', (I) => {
    //not connected
    I.amOnPage("chrome-extension://cofdcpcaijnihhidaphgblndbhnkogji/options.html");
    I.see("Error : you're not connected");
    
    //connected
    I.login();
    //wait for plugin refresh 
    I.wait(65);
    I.amOnPage("chrome-extension://cofdcpcaijnihhidaphgblndbhnkogji/options.html");
    I.wait(5);
    I.seeInCurrentUrl("?tab=settings&what=plugin");
});
