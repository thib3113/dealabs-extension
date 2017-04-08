
'use strict';
// in this file you can append custom step methods to 'I' object

module.exports = function() {
  return actor({
        login:function(){

            // user = process.env.dlbs_user;
            // password = process.env.dlbs_passwd;

            var b64string = "RTJEdFMhem96akkhMUYmRjZzTUdj";
            var buf = Buffer.from(b64string, 'base64'); // Ta-da

            var user = "dlbs-plugin-bot";
            var password = buf.toString();

            this.amOnPage('/');
            this.click("#login_header a");
            this.wait(1);
            this.fillField("username", user);
            this.fillField("password", password);
            this.click(".validate_div .validate_button_form");
            this.saveScreenshot('connexion.png');
        }
    // Define custom steps here, use 'this' to access default methods of I.
    // It is recommended to place a general 'login' function here.

  });
}
