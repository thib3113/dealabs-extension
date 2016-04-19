chrome.storage.local.get(['profil_link'], function(value){
    profil_link = value.profil_link;

    document.location.href=profil_link+'?tab=settings&what=plugin'
})