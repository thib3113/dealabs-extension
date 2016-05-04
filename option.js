try{
    chrome.storage.local.get(['profil_link'], function(value){
        profil_link = value.profil_link;

        document.location.href=profil_link+'?tab=settings&what=plugin'
    })
}
catch(e){
    document.getElementById("erreur").innerHTML = 'Error : '+err.message;
}