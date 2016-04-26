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
    settingsManager.syncSettings();
});

extension.onMessage('remove_all', function(datas){
    remove_all();
});


extension.onMessage('update', function(datas){
    if(datas!=undefined)
        cb = datas.cb || function(){};
    else
        cb = function(){};

    // cb = function(){
    //     extension.sendMessage('finish_update');
    // }

    try{
        if(datas.content != undefined)
            update(datas.content, cb);
        else
            update(null, cb);
            
    }
    catch(e){
        update(null, cb);
    }
});

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
function remove_all(){
    extension.getStorage(['notifications', 'notifications_counter'], function(value){
        notifications = value.notifications;
        var queue = async.queue(function(link, cb){
            setTimeout(function(){
                $.ajax({
                    url : link,
                    complete:function(){
                        extension.getStorage('notifications_counter', function(value){
                            notifications_counter = value.notifications_counter;
                            nb_add = 0;
                            nb_add += notifications_counter['deals'].value;
                            nb_add += notifications_counter['alerte'].value;
                            nb_add += notifications_counter['MP'].value;
                            nb_add += notifications_counter['forum'].value;
                            plus = notifications_counter['forum'].plus?"+":"";
                            nb_notifs = nb_add<1000? nb_add + plus :"999+";
                            console.log(nb_notifs);
                            extension.browserAction.setBadgeText({text:''+nb_notifs});
                            this.cb();
                        }.bind({cb:cb}))
                    }.bind({cb:cb})
                })
            }.bind({cb:cb}),500)
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

function parseUpdate(response, cb){
    $page = $(response);
    if($page.find('#login_blue').length > 0){
        extension.browserAction.setTitle({title:'Vous n\'êtes pas connecté'});
        extension.browserAction.setBadgeText({text:'!'});
        extension.browserAction.setPopup({popup:''});
        extension.browserAction.setBadgeBackgroundColor({color:'#FFE400'});
        extension.browserAction.onClicked.addListener(function(tab){
            var newURL = "https://www.dealabs.com";
            extension.openTab({ url: newURL });
        });
        extension.setStorage({'notifications':{}});
    }
    else{
        extension.browserAction.setTitle({title:'pas de notifications'});
        extension.browserAction.setBadgeText({text:''});
        extension.browserAction.setBadgeBackgroundColor({color:'#FFE400'});
        extension.browserAction.setPopup({popup:'popup.html'});

        //notifications
        current_deals = [];
        notifications_counter = {
            'deals': {value:0},
            'alerte': {value:0},
            'MP': {value:0},
            'forum': {value:0}
        }
        // settingsManager.notifications_manage.alertes
        // settingsManager.notifications_manage.MPs
        // settingsManager.notifications_manage.forum
        // 
        notifications_counter['deals'] = { value : 0 };    
        if(settingsManager.notifications_manage.deals){
            $notif_container = $page.find("#commentaires_part .item a.left_part_list");
            try{
                notifications_counter['deals'].value = parseInt($page.find("#commentaires").text().match(/\(([0-9]*)\)/)[1]);
            }
            catch(e){
            }
            for (var i = $notif_container.length - 1; i >= 0; i--) {
                temp = {
                    title : 'Nouvelle notification',
                    text : $($notif_container[i]).find('.text_color_blue').text(),
                    url  : $($notif_container[i]).get(0).href,
                    icon : $($notif_container[i]).find('img').get(0).src,
                    categorie : 'deals'
                };
                temp.slug = temp.url+temp.text;
                current_deals.push(temp);
            };
        }

        // alertes
        current_alertes = [];
        notifications_counter['alerte'] = { value : 0};
        if(settingsManager.notifications_manage.alertes){
            $alert_container = $page.find("#alertes_part .item a.left_part_list");
            try{
                notifications_counter['alerte'].value = parseInt($page.find("#alertes").text().match(/\(([0-9]*)\)/)[1]);
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
        notifications_counter['MP'] = {value:0};
        if(settingsManager.notifications_manage.MPs){
            $MPs_container = $page.find("#messagerie_popup .item");
            notifications_counter['MP'].value = parseInt($page.find('.notif_right_header_contener.mp ').text());
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
                    slug : title,
                    categorie : 'forum'
                });
            };
        }
        notifications_counter['forum'] = {value: current_forum_notifs.length, plus:false};

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
                    console.log(tempNotifs[i].categorie);
                    notifications_counter[tempNotifs[i].categorie].value -= 1;
                    continue;
                }
                if(typeof settingsManager.settings.notifications_with_sound[linkInfo[1]+'-'+linkInfo[2]] != "undefined"){
                    if(typeof notificationsNotified[tempNotifs[i].slug] == "undefined" || notificationsNotified[tempNotifs[i].slug] == null){
                        soundAlert();
                    }
                }
            }

            if(typeof saveNotifications[tempNotifs[i].categorie] == "undefined")
                saveNotifications[tempNotifs[i].categorie] = [];
            saveNotifications[tempNotifs[i].categorie].push(tempNotifs[i]);

            if(typeof notificationsNotified[tempNotifs[i].slug] == "undefined" || notificationsNotified[tempNotifs[i].slug] == null){
                if(settingsManager.notifications_manage.desktop){
                    notify(tempNotifs[i].title, tempNotifs[i].text, tempNotifs[i].icon, tempNotifs[i].url, tempNotifs[i].slug);
                }
            }
            newNotificationsNotified[tempNotifs[i].slug] = tempNotifs[i];
        }
        notificationsNotified = newNotificationsNotified;

        nb_add = 0;
        nb_add += notifications_counter['deals'].value;
        nb_add += notifications_counter['alerte'].value;
        nb_add += notifications_counter['MP'].value;
        nb_add += notifications_counter['forum'].value;
        plus = notifications_counter['forum'].plus?"+":"";
        nb_notifs = nb_add<1000? nb_add + plus :"999+";
        if(nb_notifs > 0){
            extension.browserAction.setTitle({title:nb_notifs+' notification'+(nb_notifs>1?'s':'')});
            extension.browserAction.setBadgeText({text:''+nb_notifs});
            extension.browserAction.setBadgeBackgroundColor({color:'#0012FF'});
        }

        //profil informations
        profil = {
            link : $page.find('#pseudo_right_header_contener').attr('href')
        }
        try{
            profilInfos = profil.link.match(/\/([0-9]+)\/(.*)$/);
            profil.id = profilInfos[1];
            profil.name = profilInfos[2];
        }
        catch(e){
            profil.id = null;
            profil.name = null;
        }
// nbNotifications
        extension.setStorage(
        {
            'notifications':saveNotifications,
            'notifications_counter':notifications_counter,
            profil : profil
        });
    }
    cb();
}

function update(content, cb){
    content = content || null;
    cb = cb || function(){};

    clearTimeout(notificationUpdateTimeout);
    if(content == null){
        $.ajax({
            url:"https://www.dealabs.com/forum/notifications.html",
            success:function(resp){
                resp = resp.replace(/src=["|']\/\//g, 'https://');
                parseUpdate(resp, function(){
                    popup = extension.getPopup();
                    if(popup.length >0){
                        for (var i = 0; i < popup.length; i++) {
                            popup[i].generate_popup();
                        }
                    }
                    this.cb(true);
                    notificationUpdateTimeout = setTimeout(update, settingsManager.settings.time_between_refresh);
                }.bind({cb:cb}));

            }.bind({cb:cb}),
            error:function(){
                this.cb(false);
                notificationUpdateTimeout = setTimeout(update, settingsManager.settings.time_between_refresh);
            }.bind({cb:cb})
        });
    }
    else{
        parseUpdate(content, function(){
            popup = extension.getPopup();
            if(popup.length >0){
                for (var i = 0; i < popup.length; i++) {
                    popup[i].generate_popup();
                }
            }
            cb(true);
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

extension.addContextMenu({
    title    : 'Ouvrir ...',
    id       : 'open',
    contexts : ['browser_action']
});
extension.addContextMenu({
    title    : 'Dealabs',
    id       : 'home',
    parentId : 'open',
    contexts : ['browser_action'],
    onclick  : function(info){
        openInTab('https://www.dealabs.com');
    }
});
extension.addContextMenu({
    title : 'Mon profil',
    id: 'profile',
    parentId: 'open',
    contexts : ['browser_action'],
    onclick : function(info){
        extension.getStorage(['profil'], function(value){
            openInTab(value.profil.link);
        });
    }
});

extension.addContextMenu({
    title : 'Rafraichir',
    contexts : ['browser_action'],
    id: 'refresh',
    onclick : function(info){
        update();
    }
});

extension.addContextMenu({
    title : 'Tout marquer comme vus',
    contexts : ['browser_action'],
    id: 'mark_all_read',
    onclick : function(info){
        cleanNotifications();
        extension.getStorage(['notifications', 'notifications_counter'], function(value){
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