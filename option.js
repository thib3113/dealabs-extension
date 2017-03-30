try{
    document.getElementById("__MSG__IF_NOT_REDIRECTED_OPTIONS").innerHTML = chrome.i18n.getMessage("IF_NOT_REDIRECTED_OPTIONS");
    document.getElementById("__MSG__REDIRECTION_OPTIONS").innerHTML = chrome.i18n.getMessage("REDIRECTION_OPTIONS");
    chrome.storage.local.get(['profil'], function(value){
        profil_link = value.profil.link;

        document.location.href=profil_link+'?tab=settings&what=plugin'
    })
}
catch(e){
    document.getElementById("erreur").innerHTML = 'Error : '+e.message+"<br>"+e.stack;
}