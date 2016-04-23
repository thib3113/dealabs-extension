//sync setting all 30minutes
// setInterval(syncSettings, 1.8e6);

// chrome.notifications.onClicked.addListener(function(notificationID){
//     if(typeof notificationsLinks[notificationID] != "undefined" && notificationsLinks[notificationID] != null){
//         chrome.tabs.create({ url: notificationsLinks[notificationID], active : true }, function(tab){
//             waitingTabs[tab.id] = update;
//         });
//         chrome.notifications.clear(notificationID);
//         chrome.windows.getCurrent({}, function(window){
//             chrome.windows.update(window.id, {focused:true});
//         });
//         setTimeout(update, 500);
//     }
// });

// var waitingTabs = {};
// chrome.tabs.onUpdated.addListener(function(tabId , info) {
//     if(typeof waitingTabs[tabId] != "undefined" && waitingTabs[tabId] != null){
//         if (info.status == "complete") {
//             fn = waitingTabs[tabId];
//             waitingTabs[tabId] = null; 
//             fn();
//         }
//     }
// });

notificationsNotified = {};

extension.onMessage('open_tab', function(datas){
    datas = datas || {};
    datas.onLoad = function(tab){
        update();
    };
    extension.openTab(datas);
})

extension.onMessage('update_settings', function(datas){
    syncSettings();
})

// chrome.extension.onConnect.addListener(function(port) {
//     port.onMessage.addListener(function(msg) {
//         if(msg.action == "open_tab"){
//             if(typeof msg.url != "undefined" && msg.url != null){
//                 chrome.tabs.create({ url: msg.url, active : true }, function(tab){
//                     waitingTabs[tab.id] = update;
//                 });
//             }
//         }

//         if(msg.action == "update_settings"){
//             syncSettings();
//         }
//     });
// });

function parseUpdate(response, cb){
    $page = $(response);
    if($page.find('#login_blue').length > 0){
        extension.browserAction.setTitle({title:'Vous n\'êtes pas connecté'});
        extension.browserAction.setBadgeText({text:'!'});
        extension.browserAction.setPopup({popup:''});
        extension.browserAction.setBadgeBackgroundColor({color:'#FFE400'});
        extension.browserAction.onClicked.addListener(function(tab){
            var newURL = "https://www.dealabs.com";
            chrome.tabs.create({ url: newURL });
        });
        chrome.storage.local.set({'notifications':{}});
    }
    else{
        extension.browserAction.setTitle({title:'pas de notifications'});
        extension.browserAction.setBadgeText({text:''});
        extension.browserAction.setBadgeBackgroundColor({color:'#FFE400'});
        extension.browserAction.setPopup({popup:'popup.html'});

        //notifications
        current_deals = [];
        // settingsManager.notifications_manage.alertes
        // settingsManager.notifications_manage.MPs
        // settingsManager.notifications_manage.forum
        // 
        nb_notifs_deal = 0;    
        if(settingsManager.notifications_manage.deals){
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
        if(settingsManager.notifications_manage.alertes){
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
        if(settingsManager.notifications_manage.MPs){
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
        if(settingsManager.notifications_manage.forum){
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
            if(linkInfo = tempNotifs[i].url.match(/\.com\/([^\/]+)\/.*\/([0-9]+)[#|\?]/)){
                if(typeof settingsManager.settings.blacklist[linkInfo[1]+'-'+linkInfo[2]] != "undefined"){
                    $.get(tempNotifs[i].url);
                    continue;
                }
            }

            if(typeof saveNotifications[tempNotifs[i].categorie] == "undefined")
                saveNotifications[tempNotifs[i].categorie] = [];
            saveNotifications[tempNotifs[i].categorie].push(tempNotifs[i]);

            if(typeof notificationsNotified[tempNotifs[i].slug] == "undefined" || notificationsNotified[tempNotifs[i].slug] == null){
                if(settingsManager.notifications_manage.desktop)
                    notify(tempNotifs[i].title, tempNotifs[i].text, tempNotifs[i].icon, tempNotifs[i].url, tempNotifs[i].slug);
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
            extension.browserAction.setTitle({title:nb_notifs+' notification'+(nb_notifs>1?'s':'')});
            extension.browserAction.setBadgeText({text:''+nb_notifs});
            extension.browserAction.setBadgeBackgroundColor({color:'#0012FF'});
        }
        extension.setStorage(
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
                            popup[i].generate_popup();
                        }
                    }
                    notificationUpdateTimeout = setTimeout(update, settingsManager.settings.time_between_refresh);
                });

            },
            error:function(){
                notificationUpdateTimeout = setTimeout(update, settingsManager.settings.time_between_refresh);
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
            notificationUpdateTimeout = setTimeout(update, settingsManager.settings.time_between_refresh);
        });
    }
}

function openInTab(url, loadedCB){
    cb = loadedCB || function(){};
    extension.openTab(
        { 
            url : url, 
            active : true, 
            onLoad : cb 
        }
    );
}

function cleanNotifications(){
    extension.getAllExtensions(function(notifications){
        for(id in notifications){
            notifications[id].close();
        }
    })
}

notificationUpdateTimeout = 0;

chrome.contextMenus.create({
    title    : 'Ouvrir ...',
    id       : 'open',
    contexts : ['browser_action']
});
chrome.contextMenus.create({
    title    : 'Dealabs',
    id       : 'home',
    parentId : 'open',
    contexts : ['browser_action'],
    onclick  : function(info){
        openInTab('https://www.dealabs.com');
    }
});
chrome.contextMenus.create({
    title : 'Mon profil',
    id: 'profile',
    parentId: 'open',
    contexts : ['browser_action'],
    onclick : function(info){
        chrome.storage.local.get(['profil_link'], function(value){
            openInTab(value.profil_link);
        });
    }
});

chrome.contextMenus.create({
    title : 'Rafraichir',
    contexts : ['browser_action'],
    id: 'refresh',
    onclick : function(info){
        update();
    }
});

chrome.contextMenus.create({
    title : 'Tout marquer comme vus',
    contexts : ['browser_action'],
    id: 'mark_all_read',
    onclick : function(info){
        cleanNotifications();
        chrome.storage.local.get(['notifications'], function(value){
            notifications = value.notifications;
            var queue = async.queue(function(link, cb){
                setTimeout(function(){
                    $.ajax({
                        url : link,
                        complete:cb
                    })
                },500)
            }, 1); // Run one simultaneous request

            queue.drain = function() {
                update();
            };
            for(categorie in notifications){
                curCat = notifications[categorie];
                for (var i = 0; i < curCat.length; i++) {
                    queue.push(curCat[i].url);
                }
            }
        });
    }
})




$(function(){
    update();
})