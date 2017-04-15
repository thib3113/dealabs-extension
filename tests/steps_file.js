
'use strict';
// in this file you can append custom step methods to 'I' object

module.exports = function() {
  return actor({
        updateNotifications:function(){
            bfUrl = this.getUrl()
        },
        login:function(){

            var user = process.env.dlbs_user;
            var password = process.env.dlbs_passwd;

            this.amOnPage('https://www.dealabs.com/');
            this.click("#login_header a");
            this.wait(1);
            this.fillField("username", user);
            this.fillField("password", password);
            this.click(".validate_div .validate_button_form");
            this.wait(1);
            this.dontSee("Mot de passe incorrect.");
            // this.saveScreenshot('connexion.png');
        }
    // Define custom steps here, use 'this' to access default methods of I.
    // It is recommended to place a general 'login' function here.

  });
}
