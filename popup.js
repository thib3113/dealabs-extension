var port = chrome.extension.connect({name: "update Communication"});

function generate_popup(){
    //recup notifications
    chrome.storage.local.get(['notifications', 'nbNotifications', 'profil_link'], function(value){
        notifications = value.notifications;
        nbNotifications = value.nbNotifications;
        profil_link = value.profil_link;

        $('#notifications').html('');
        nb_add = 0;
        for(categorie in notifications){
            nb_add++;
            curCat = notifications[categorie];
            icon = 'https://static.dealabs.com/images/header/icon_header_notif.png';
            switch(categorie){
                case 'notification':
                    title = 'Deal'+(curCat.length>0?'s':'');
                    more_link = 'https://www.dealabs.com/notifications.html';
                    nb_notif = nbNotifications.nb_notifs;
                break;
                case 'alerte':
                    title = 'Alerte'+(curCat.length>0?'s':'');
                    more_link = 'https://www.dealabs.com/alerts/alerts.html';
                    nb_notif = nbNotifications.nb_alertes;
                break;
                case 'MP':
                    title = 'Message'+(curCat.length>0?'s':'')+' privé'+(curCat.length>0?'s':'');
                    icon = 'https://static.dealabs.com/images/header/icon_all_messages.png';
                    more_link = profil_link+'?tab=messaging&what=inbox';
                    nb_notif = nbNotifications.nb_mps;
                break;
                case 'forum':
                    title = 'Notification'+(curCat.length>0?'s':'')+' du forum';
                    more_link = 'https://www.dealabs.com/forum/notifications.html';
                    nb_notif = nbNotifications.nb_forum.value;
                break;
            }

            $('#notifications').append('<tr class="title title_'+categorie+'"><td><img class="cat_icon" src="'+icon+'" alt="'+categorie+'_icon"></td><td>'+title+'</td></tr>');
            for (var i = curCat.length - 1; i >= 0; i--) {
                nb_add++;
                $('#notifications').append('<tr class="notification" data-href="'+curCat[i].url+'"><td><img src="'+curCat[i].icon+'" alt="'+curCat[i].text+'"></td><td>'+curCat[i].text+'</td></tr>');
            }
            console.log(nb_notif, curCat.length);
            if(nb_notif > curCat.length)
                $('#notifications').append('<tr class="notification" data-href="'+more_link+'"><td style="text-align:center;">...</td><td>Voir plus de '+title.toLowerCase()+'</td></tr>');
        }
        if(nb_add == 0){
            $('#notifications').append('<tr class="notification"><td colspan="">Aucune notification</td></tr>');
            nb_add++;
        }
        $('body').css('height', nb_add*32)
    })
}

$(function(){
    $('body').on('click', '[data-href]', function(){
        newUrl = this.dataset.href;
        port.postMessage({"action" : "open_tab", "url":newUrl});
    })

    generate_popup();  

    chrome.extension.onConnect.addListener(function(port) {
        port.onMessage.addListener(function(msg) {
            if(msg.action == "update_popup"){
                generate_popup();
            }
        });
    });  
})