notificationsNotified = {};

dbg = {
    getSettings : function(){
        try{
            console.log(JSON.stringify(settingsManager));
        }
        catch(e){
            console.error("impossible de récupérer les paramètres .");
        }
    }
}

extension.onMessage('open_tab', function(datas){
    datas = datas || {};
    datas.onLoad = function(tab){
        updateNotifications();
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
            updateNotifications(datas.content, cb);
        else
            updateNotifications(null, cb);
            
    }
    catch(e){
        updateNotifications(null, cb);
    }
});

function remove_all(){
    extension.getStorage(['notifications'], function(value){
        notifications = value.notifications;
        var queue = async.queue(function(item, cb){
            setTimeout(function(){
                $.ajax({
                    url : this.item.url,
                    complete:function(){
                        extension.getStorage('notifications_counter', function(value){
                            notifications_counter = value.notifications_counter;

                            notifications_counter[item.categorie].value -= 1;

                            nb_add = 0;
                            nb_add += notifications_counter['deals'].value;
                            nb_add += notifications_counter['alertes'].value;
                            nb_add += notifications_counter['MPs'].value;
                            nb_add += notifications_counter['forum'].value;
                            plus = notifications_counter['forum'].plus?"+":"";
                            nb_notifs = nb_add<1000? nb_add + plus :"999+";
                            extension.setStorage(
                            {
                                notifications_counter:notifications_counter,
                            });
                            extension.browserAction.setBadgeText({text:''+nb_notifs});
                            this.cb();
                        }.bind({cb:this.cb, item:this.item}))
                    }.bind({cb:this.cb, item:this.item})
                })
            }.bind({cb:cb, item:item}),500)
        }, 1); // Run one simultaneous request

        queue.drain = function() {
            updateNotifications();
        };
        for(categorie in notifications){
            curCat = notifications[categorie];
            for (var i = 0; i < curCat.length; i++) {
                queue.push(curCat[i]);
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
        extension.setStorage({'notifications':{}});
    }
    else{
        extension.removeWaitFor('disconnected');
        extension.stopWaitFor('connected');

        extension.browserAction.setPopup({popup:'popup.html'});

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

        extension.setStorage({
            profil:profil
        });
    }
    cb();
}

function updateNotifications(content, cb){
    content = content || null;
    var cb = cb || function(){};

    clearTimeout(notificationUpdateTimeout);
    // if(content == null){
    var notification_list = [];
    //check connection
    $.ajax({
        url:dealabs_protocol+"www.dealabs.com",
        success:function(response){
            response = response.replace(/src=["|']\/\//g, dealabs_protocol+'');
            $page = $(response);
            if($page.find("#login_header").length>0){
                //here we are not connected
                extension.browserAction.setTitle({title:extension.i18n.getMessage("you are not connected")});
                extension.browserAction.setBadgeText({text:'!'});
                extension.browserAction.setPopup({popup:''});
                extension.browserAction.setBadgeBackgroundColor({color:'#FFE400'});
                extension.setStorage({'notifications':{}});
            }
            else{
                //we are connected
                extension.removeWaitFor('disconnected');
                extension.stopWaitFor('connected');

                extension.browserAction.setPopup({popup:'popup.html'});

                //profil informations
                profil = {
                    link : $page.find('#member_parameters a:first').attr('href')
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

                extension.setStorage({
                    profil:profil
                });
                
                async.parallel({
                    notifications: function(callback) {
                        var index = 0;
                        $.ajax({
                            cb:callback,
                            notification_list:[],
                            url:dealabs_protocol+"www.dealabs.com/ajax/notification-scroll",
                            data:{
                                index:index
                            },
                            method:"POST",
                            dataType:"json",
                            success:function(resp){
                                if(resp.notifications != undefined && resp.notifications.length > 0){
                                    for (var i = resp.notifications.length - 1; i >= 0; i--) {
                                        this.notification_list.push(resp.notifications[i])
                                    }
                                    this.data = {
                                        index: ++index
                                    }
                                    $.ajax(this);
                                }
                                else{
                                    this.cb(null, this.notification_list);
                                }
                            },
                            error:function(jqXHR, textStatus, errorThrown){
                                this.cb({
                                    "jqXHR" : jqXHR,
                                    "textStatus" : textStatus,
                                    "errorThrown" : errorThrown
                                }, this.notification_list)
                            }
                        });
                    },
                    mps: function(callback) {
                        var index = 0;
                        $.ajax({
                            cb:callback,
                            notification_list:[],
                            url:dealabs_protocol+"www.dealabs.com/ajax/mailbox-scroll",
                            data:{
                                index:index
                            },
                            method:"POST",
                            dataType:"json",
                            success:function(resp){
                                if(resp.pms != undefined && resp.pms.length > 0){
                                    for (var i = resp.pms.length - 1; i >= 0; i--) {
                                        notification = resp.pms[i];
                                        notification.type = "MP";
                                        this.notification_list.push(notification)
                                        
                                        //add the user to the cache
                                        profilsCache[notification.profile_id] = {
                                            img : notification.profile_image,
                                            pseudo : notification.profile_username
                                        }

                                    }
                                    this.data = {
                                        index: ++index
                                    }
                                    $.ajax(this);
                                }
                                else{
                                    this.cb(null, this.notification_list);
                                }
                            },
                            error:function(jqXHR, textStatus, errorThrown){
                                this.cb({
                                    "jqXHR" : jqXHR,
                                    "textStatus" : textStatus,
                                    "errorThrown" : errorThrown
                                }, this.notification_list)
                            }
                        });
                    }
                }, 
                function(err, results) {
                    if(err != null){
                        debugger;
                    }

                    notification_list = $.merge(results.notifications, results.mps);

                    async.map(notification_list, 
                        function(notification,cb){
                        return_notif = {
                            plugin_name : "unknown",
                            icon : "",
                            title : "unknown",
                            slug : "unknown",
                        }
                        switch(notification.type){
                            case "forum":
                                return_notif = {
                                    categorie : "forum",
                                    icon : "https://raw.githubusercontent.com/thib3113/dealabs-extension/gh-pages/img/message.png",
                                    title : "Nouveau message sur le forum",
                                    slug : notification.id,
                                    text : notification.title,
                                    url  : notification.url
                                };
                                // getProfile(notification.member_id, function(err,user){
                                //     this.cb(null, return_notif);
                                // }.bind({cb:cb}));
                            break;
                            case "deal":
                                return_notif = {
                                    categorie : "deals",
                                    icon : dealabs_protocol+"www.dealabs.com/"+notification.deal_thumb_image,
                                    title : "Nouvelle notification",
                                    slug : notification.id,
                                    text : notification.title,
                                    url  : notification.url
                                };
                            break;
                            case "alert":
                                return_notif = {
                                    categorie : "alertes",
                                    icon : dealabs_protocol+"www.dealabs.com/"+notification.deal_thumb_image,
                                    title : "Nouvelle alerte",
                                    slug : notification.id,
                                    text : notification.title,
                                    url  : notification.url
                                };
                            break;
                            case "MP":
                                return_notif = {
                                    categorie : "MPs",
                                    icon : notification.profile_image,
                                    title : "Nouveau message privé de "+notification.profile_username,
                                    slug : notification.id+notification.link_to_pm,
                                    text : notification.subject,
                                    url  : notification.link_to_pm
                                };
                            break;
                        }
                        // if(notification.type!="forum"){
                        cb(null, return_notif);
                        // }
                        },
                        function(err,notification_list){
                            //all notifications listed
                            //notifications
                            current_deals = [];
                            notifications_counter = {
                                'deals': {value:0},
                                'alertes': {value:0},
                                'MPs': {value:0},
                                'forum': {value:0}
                            }

                            tempNotifs = [];
                            for (let notification of notification_list) {
                                if(settingsManager.notifications_manage[notification.categorie]){
                                    notifications_counter[notification.categorie].value++;
                                    tempNotifs.push(notification)
                                }
                            }
                            
                            var newNotificationsNotified = {};
                            var saveNotifications = {};
                            var notifs_to_send = [];
                            for (var i = tempNotifs.length - 1; i >= 0; i--) {

                                //manage blacklists and sounds
                                if(linkInfo = tempNotifs[i].url.match(/\.com\/([^\/]+)\/.*\/([0-9]+)[#|\?]/)){
                                    if(typeof settingsManager.settings.blacklist[linkInfo[1]+'-'+linkInfo[2]] != "undefined"){
                                        $.get(tempNotifs[i].url);
                                        // console.log(tempNotifs[i].categorie);
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
                                        notifs_to_send.push(tempNotifs[i]);
                                    }
                                }
                                newNotificationsNotified[tempNotifs[i].slug] = tempNotifs[i];
                            }
                            if(notifs_to_send.length<=6){
                                for (var i = 0; i < notifs_to_send.length; i++) {
                                    send_desktop_notification(notifs_to_send[i].title, notifs_to_send[i].text, notifs_to_send[i].icon, notifs_to_send[i].url, notifs_to_send[i].slug);
                                }
                            }
                            else{
                                send_desktop_notification(
                                    "vous avez "+notifs_to_send.length+" notification"+(notifs_to_send.length>1?"s":"")+" non lue"+(notifs_to_send.length>1?"s":""),
                                    "vous avez "+notifs_to_send.length+" notification"+(notifs_to_send.length>1?"s":"")+" non lue"+(notifs_to_send.length>1?"s":""),
                                    "https://static.dealabs.com/images/profil/icon_profile_activity.png",
                                    "https://www.dealabs.com",
                                    "multinotif-"+Date.now(),
                                    function(items){
                                        list = [];
                                        for (var i = 0; i < items.length; i++) {
                                            list.push({
                                                title : items[i].title,
                                                message : items[i].text
                                            })
                                        }
                                        return list;
                                    }(notifs_to_send)
                                )
                            }
                            
                            //save to not notify each refresh times
                            notificationsNotified = newNotificationsNotified;

                            nb_add = 0;
                            nb_add += notifications_counter['deals'].value;
                            nb_add += notifications_counter['alertes'].value;
                            nb_add += notifications_counter['MPs'].value;
                            nb_add += notifications_counter['forum'].value;
                            // plus = notifications_counter['forum'].plus?"+":"";
                            // nb_notifs = nb_add<1000? nb_add:"999+";
                            // send desktop notifications
                            if(nb_add > 0 ){
                                extension.browserAction.getBadgeText({}, function(result){
                                    if(result != nb_add){
                                        extension.browserAction.setTitle({title:nb_add+' notification'+(nb_add>1?'s':'')});
                                        extension.browserAction.setBadgeText({text:''+nb_add});
                                        extension.browserAction.setBadgeBackgroundColor({color:'#0012FF'});
                                    }
                                });
                            }
                            else{
                                extension.browserAction.setTitle({title:'pas de notifications'});
                                extension.browserAction.setBadgeText({text:''});
                                extension.browserAction.setBadgeBackgroundColor({color:'#FFE400'});
                            }


                            // save notifications in local (for the popup)
                            extension.setStorage(
                            {
                                'notifications':saveNotifications,
                                'notifications_counter':notifications_counter
                            });

                            //update popup
                            popup = extension.getPopup();
                            if(popup.length >0){
                                for (var i = 0; i < popup.length; i++) {
                                    popup[i].generate_popup();
                                }
                            }
                            this.cb(true);
                            notificationUpdateTimeout = setTimeout(updateNotifications, settingsManager.settings.time_between_refresh);
                        }.bind({cb:this.cb})
                    );
                }.bind({cb:cb}));
            }                
        },
        error:function(){
            notificationUpdateTimeout = setTimeout(updateNotifications, settingsManager.settings.time_between_refresh);            
        }
    })

    // }
    // else{
    //     parseUpdate(content, function(){
    //         popup = extension.getPopup();
    //         if(popup.length >0){
    //             for (var i = 0; i < popup.length; i++) {
    //                 popup[i].generate_popup();
    //             }
    //         }
    //         cb(true);
    //         notificationUpdateTimeout = setTimeout(update, settingsManager.settings.time_between_refresh);
    //     });
    // }
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

extension.removeAllContextMenu(function(){
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
            openInTab(dealabs_protocol+'www.dealabs.com');
        }
    });
});

extension.waitFor('connected', function(){
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
            updateNotifications();
        }
    });
    extension.addContextMenu({
        title : 'Tout marquer comme vus',
        contexts : ['browser_action'],
        id: 'mark_all_read',
        onclick : remove_all
        // function(info){
        //     cleanNotifications();
        //     extension.getStorage(['notifications', 'notifications_counter'], function(value){
        //         notifications = value.notifications;
        //         var queue = async.queue(function(link, cb){
        //             setTimeout(function(){
        //                 $.ajax({
        //                     url : link,
        //                     complete:cb
        //                 })
        //             },500)
        //         }, 1); // Run one simultaneous request

        //         queue.drain = function() {
        //             updateNotifications();
        //         };
        //         for(categorie in notifications){
        //             curCat = notifications[categorie];
        //             for (var i = 0; i < curCat.length; i++) {
        //                 queue.push(curCat[i].url);
        //             }
        //         }
        //     });
        // }
    });
})

$(function(){
    extension.browserAction.onClicked.addListener(function(tab){
        var newURL = dealabs_protocol+"www.dealabs.com";
        extension.openTab({ url: newURL });
    });
    updateNotifications();
})