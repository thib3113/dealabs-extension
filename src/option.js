var logError=function(e){
    document.getElementById("erreur").innerHTML = 'Error : '+e.message+"<br>"+e.stack;       
}

try{
    document.getElementById("__MSG__IF_NOT_REDIRECTED_OPTIONS").innerHTML = chrome.i18n.getMessage("IF_NOT_REDIRECTED_OPTIONS");
    document.getElementById("__MSG__REDIRECTION_OPTIONS").innerHTML = chrome.i18n.getMessage("REDIRECTION_OPTIONS");


    chrome.storage.local.get(['profil'], function(value){
      try{
          if(value.profil == undefined)
            throw Error("you're not connected");

          document.location = value.profil.link+"/settings#plugin";
      }
      catch(e){
        logError(e);
      }
    }.bind(this))

}
catch(e){
    logError(e);
}