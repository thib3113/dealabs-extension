try{

    oldNotifs = {};

    function generate_popup(){
        //recup notifications
        extension.getStorage(['notifications', 'notifications_counter', 'profil_link'], function(value){
            notifications = value.notifications;
            notifications_counter = value.notifications_counter;
            profil_link = value.profil_link;
            
            $('[data-btn="refresh"]').removeClass('zmdi-hc-spin');

            if(JSON.stringify(oldNotifs) == JSON.stringify(notifications))
                return

            oldNotifs = notifications;

            $('#notifications').html('');
            nb_add = 0;
            for(categorie in notifications){
                nb_add++;
                curCat = notifications[categorie];
                icon = 'https://static.dealabs.com/images/header/icon_header_notif.png';
                switch(categorie){
                    case 'deals':
                        title = extension._n("new comment on deal", curCat.length);
                        more_link = 'https://www.dealabs.com/';
                        nb_notif = notifications_counter.deals.value;
                        more_text = 'Voir plus de '+title.toLowerCase()
                    break;
                    case 'alertes':
                        title = extension._n("new alerts", curCat.length);
                        more_link = 'https://www.dealabs.com/alerts/alerts.html';
                        nb_notif = notifications_counter.alertes.value;
                        more_text = 'Voir plus d\''+title.toLowerCase()
                    break;
                    case 'MPs':
                        title = extension._n("new private message", curCat.length);
                        icon = 'https://static.dealabs.com/images/header/icon_all_messages.png';
                        more_link = profil_link+'?tab=messaging&what=inbox';
                        nb_notif = notifications_counter.MPs.value;
                        more_text = 'Voir plus de '+title.toLowerCase()
                    break;
                    case 'forum':
                        title = extension._n("new notification on forum", curCat.length);
                        more_link = 'https://www.dealabs.com/forum.html';
                        nb_notif = notifications_counter.forum.value;
                        more_text = 'Voir plus de '+title.toLowerCase()
                    break;
                }

                $('#notifications').append('<tr class="title title_'+categorie+'" data-href="'+more_link+'"><td><img class="cat_icon" src="'+icon+'" alt="'+categorie+'_icon"></td><td>'+title+'</td></tr>');
                for (var i = curCat.length - 1; i >= 0; i--) {
                    nb_add++;
                    $('#notifications').append('<tr class="notification" data-href="'+curCat[i].url+'"><td><img src="'+curCat[i].icon+'" alt="'+curCat[i].text+'"></td><td>'+curCat[i].text+'</td></tr>');
                }

                if(nb_notif > curCat.length)
                    $('#notifications').append('<tr class="notification" data-href="'+more_link+'"><td style="text-align:center;">...</td><td>'+more_text+'</td></tr>');
            }
            if(nb_add == 0){
                $('#notifications').append('<tr class="notification"><td class="no_notification" colspan="">Aucune notification</td></tr>');
                nb_add++;
            }
            $('body').css('height', nb_add*32)
        })
    }

    $(function(){
        $('body').on('mouseup', '[data-btn]', function(event){
            if(event.which == 3) return;

            switch($(this).data('btn')){
                case 'see_profil' :
                    extension.getStorage(['profil'], function(value){
                        extension.sendMessage('open_tab', {
                            url : value.profil.link,
                            active : !(event.ctrlKey||event.which==2)                    
                        })
                    }.bind(this));
                break;
                case 'see_dealabs_home' :
                    extension.sendMessage('open_tab', {
                        url : dealabs_protocol+'www.dealabs.com',
                        active : !(event.ctrlKey||event.which==2)                    
                    })
                break;
                case 'refresh' :
                    $('[data-btn="refresh"]').addClass('zmdi-hc-spin');
                    extension.sendMessage("update");
                break;
                case 'remove_all' :
                    extension.sendMessage('remove_all');
                break;
            }
        });

        $('body').on('mouseup', '[data-href]', function(event){
            if(event.which == 3)
                return;
            newUrl = this.dataset.href;
            extension.sendMessage("open_tab", {
                url : newUrl,
                active : !(event.ctrlKey||event.which==2)
            });
        });

        generate_popup();  

        // chrome.extension.onConnect.addListener(function(port) {
        //     port.onMessage.addListener(function(msg) {
        //         if(msg.action == "update_popup"){
        //             generate_popup();
        //         }
        //     });
        // });  
    })   
}
catch(e){
    extension.log(e.message, e.stack);
}