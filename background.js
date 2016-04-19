//sync setting all 30minutes
setInterval(syncSettings, 1.8e6);

chrome.notifications.onClicked.addListener(function(notificationID){
    if(typeof notificationsLinks[notificationID] != "undefined" && notificationsLinks[notificationID] != null){
        chrome.tabs.create({ url: notificationsLinks[notificationID], active : true }, function(tab){
            waitingTabs[tab.id] = update;
        });
        chrome.notifications.clear(notificationID);
        chrome.windows.getCurrent({}, function(window){
            chrome.windows.update(window.id, {focused:true});
        });
        setTimeout(update, 500);
    }
});

var waitingTabs = {};
chrome.tabs.onUpdated.addListener(function(tabId , info) {
    if(typeof waitingTabs[tabId] != "undefined" && waitingTabs[tabId] != null){
        if (info.status == "complete") {
            fn = waitingTabs[tabId];
            waitingTabs[tabId] = null; 
            fn();
        }
    }
});

notificationsNotified = {};

chrome.extension.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        if(msg.action == "open_tab"){
            if(typeof msg.url != "undefined" && msg.url != null){
                chrome.tabs.create({ url: msg.url, active : true }, function(tab){
                    waitingTabs[tab.id] = update;
                });
            }
        }

        if(msg.action == "update_settings"){
            syncSettings();
        }
    });
});

function parseUpdate(response, cb){
    $page = $(response);
    if($page.find('#login_blue').length > 0){
        chrome.browserAction.setTitle({title:'Vous n\'êtes pas connecté'});
        chrome.browserAction.setBadgeText({text:'!'});
        chrome.browserAction.setPopup({popup:''});
        chrome.browserAction.setBadgeBackgroundColor({color:'#FFE400'});
        chrome.browserAction.onClicked.addListener(function(tab){
            var newURL = "https://www.dealabs.com";
            chrome.tabs.create({ url: newURL });
        });
        chrome.storage.local.set({'notifications':{}});
    }
    else{
        chrome.browserAction.setTitle({title:'pas de notifications'});
        chrome.browserAction.setBadgeText({text:''});
        chrome.browserAction.setBadgeBackgroundColor({color:'#FFE400'});
        chrome.browserAction.setPopup({popup:'popup.html'});

        //notifications
        current_deals = [];
// plugin_settings.notifications_manage.alertes
// plugin_settings.notifications_manage.MPs
// plugin_settings.notifications_manage.forum
// 
        nb_notifs_deal = 0;    
        if(plugin_settings.notifications_manage.deals){
            $notif_container = $page.find("#commentaires_part .item a.left_part_list");
            try{
                nb_notifs_deal = parseInt($page.find("#commentaires").text().match(/\(([0-9]*)\)/)[1]);
            }
            catch(e){
            }
            for (var i = $notif_container.length - 1; i >= 0; i--) {
                temp = {
                    title : 'Nouvelle notification',
                    text : $($notif_container[i]).find('.text_color_blue').text(),
                    url  : $($notif_container[i]).get(0).href,
                    icon : $($notif_container[i]).find('img').get(0).src,
                    categorie : 'notification'
                };
                temp.slug = temp.url+temp.text;
                current_deals.push(temp);
            };
        }

        // alertes
        current_alertes = [];
        nb_alertes = 0;
        if(plugin_settings.notifications_manage.alertes){
            $alert_container = $page.find("#alertes_part .item a.left_part_list");
            try{
                nb_alertes = parseInt($page.find("#alertes").text().match(/\(([0-9]*)\)/)[1]);
            }
            catch(e){
            }
            for (var i = $alert_container.length - 1; i >= 0; i--) {
                temp ={
                    title : 'Nouvelle alerte',
                    text : $($alert_container[i]).find('.text_color_blue').text(),
                    url  : $($alert_container[i]).get(0).href,
                    icon : $($alert_container[i]).find('img').get(0).src,
                    categorie : 'alerte'
                }
                temp.slug = temp.url+temp.text;
                current_alertes.push(temp);
            };
        }

        //mps
        current_MPs = [];
        nb_mps = 0;
        if(plugin_settings.notifications_manage.MPs){
            $MPs_container = $page.find("#messagerie_popup .item");
            nb_mps = parseInt($page.find('.notif_right_header_contener.mp ').text());
            for (var i = $MPs_container.length - 1; i >= 0; i--) {
                    name_mp = $($MPs_container[i]).find('p:first()').text();
                    sender_mp = $($MPs_container[i]).find('span').text()
                    img = $($MPs_container[i]).find('img').attr('src');
                    mpUrl = $($MPs_container[i]).find('a').attr('href');

                current_MPs.push({
                    title: 'Nouveau message privé',
                    text : name_mp+' par '+sender_mp,
                    url  : mpUrl,
                    icon : img,
                    slug : 'mp-'+mpUrl+name_mp+' par '+sender_mp,
                    categorie : 'MP'
                });
            };
        }

        //forums notifications
        current_forum_notifs = [];
        if(plugin_settings.notifications_manage.forum){
            $forum_notifs_container = $page.find(".title_thread_contener");
            for (var i = $forum_notifs_container.length - 1; i >= 0; i--) {
                notifUrl = $($forum_notifs_container[i]).find('.title a:last').attr('href');
                icon = $($forum_notifs_container[i]).find('.img_bloc img').attr('src');
                title = $($forum_notifs_container[i]).find('.title').text().trim();
                author = $($forum_notifs_container[i]).find('.info_bloc a').text().trim();

                current_forum_notifs.push({
                    title: 'Nouveau message sur le forum' ,
                    text : title+" par "+author,
                    url  : notifUrl,
                    icon : icon,
                    slug : title+author,
                    categorie : 'forum'
                });
            };
        }
        nb_forum = {value : current_forum_notifs.length, plus : false};

        newNotificationsNotified = {};
        tempNotifs = [];
        for (var i = current_deals.length - 1; i >= 0; i--) {
            tempNotifs.push(current_deals[i]);
        }
        for (var i = current_alertes.length - 1; i >= 0; i--) {
            tempNotifs.push(current_alertes[i]);
        }
        for (var i = current_MPs.length - 1; i >= 0; i--) {
            tempNotifs.push(current_MPs[i]);
        }
        for (var i = current_forum_notifs.length - 1; i >= 0; i--) {
            tempNotifs.push(current_forum_notifs[i]);
        }

        var saveNotifications = {};
        for (var i = tempNotifs.length - 1; i >= 0; i--) {
            if(typeof saveNotifications[tempNotifs[i].categorie] == "undefined")
                saveNotifications[tempNotifs[i].categorie] = [];
            saveNotifications[tempNotifs[i].categorie].push(tempNotifs[i]);

            if(typeof notificationsNotified[tempNotifs[i].slug] == "undefined" || notificationsNotified[tempNotifs[i].slug] == null){
                if(plugin_settings.notifications_manage.desktop)
                    notify(tempNotifs[i].title, tempNotifs[i].text, tempNotifs[i].icon, tempNotifs[i].url);
            }
            newNotificationsNotified[tempNotifs[i].slug] = tempNotifs[i];
        }
        notificationsNotified = newNotificationsNotified;

        nb_add = 0;
        nb_add += nb_notifs_deal;     
        nb_add += nb_alertes;   
        nb_add += nb_mps;
        nb_add += nb_forum.value;
        plus = nb_forum.plus?"+":"";
        nb_notifs = nb_add<1000? nb_add + plus :"999+";
        if(nb_notifs > 0){
            chrome.browserAction.setTitle({title:nb_notifs+' notification'+(nb_notifs>1?'s':'')});
            chrome.browserAction.setBadgeText({text:''+nb_notifs});
            chrome.browserAction.setBadgeBackgroundColor({color:'#0012FF'});
        }
        chrome.storage.local.set(
        {
            'notifications':saveNotifications,
            'nbNotifications':{
                nb_notifs : nb_notifs_deal ,
                nb_alertes : nb_alertes ,
                nb_mps : nb_mps ,
                nb_forum : nb_forum
            },
            'profil_link':$page.find('#pseudo_right_header_contener').attr('href')
        });
    }
    cb();
}

function update(content){
    content = content || null;
    clearTimeout(notificationUpdateTimeout);
    if(content == null){
        $.ajax({
            url:"https://www.dealabs.com/forum/notifications.html",
            success:function(resp){
                resp = resp.replace(/src=["|']\/\//g, 'https://');
                parseUpdate(resp, function(){
                    popup = chrome.extension.getViews({type:'popup'});
                    if(popup.length >0){
                        for (var i = 0; i < popup.length; i++) {
                            console.log(popup);
                            popup[i].generate_popup();
                        }
                    }
                    notificationUpdateTimeout = setTimeout(update, plugin_settings.time_between_refresh);
                });

            },
            error:function(){
                notificationUpdateTimeout = setTimeout(update, plugin_settings.time_between_refresh);
            }
        });
    }
    else{
        parseUpdate(content, function(){
            popup = chrome.extension.getViews({type:'popup'});
            if(popup.length >0){
                for (var i = 0; i < popup.length; i++) {
                    popup[i].generate_popup();
                }
            }
            notificationUpdateTimeout = setTimeout(update, plugin_settings.time_between_refresh);
        });
    }
}

notificationUpdateTimeout = 0;

$(function(){
    update();
})