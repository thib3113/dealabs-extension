function ChromeExtension(){
    this._notifications = {};
    this._tabs = {};

    this.setStorage = function(name, object, sync){
        object = object || null;
        sync = sync || false;
        if(object == null) return null;

        if(sync){
            chrome.storage.sync.set(object);
        }
        else{
            chrome.storage.local.set(object);
        }
    }

    this.getStorage = function(name, cb, sync){
        if(sync){
            chrome.storage.sync.get(name, cb);
        }
        else{
            chrome.storage.local.get(name, cb);
        }
    }

    //notification object
    function tabObject(pId, pOnLoad){
        this.pId = pId;
        this.pOnLoad = pOnLoad;

        this.close=function(cb){
            chrome.notifications.clear(this.pId, cb);
        }
        this.onClick = function(){
            this.close();

            if(this.pOnLoad != undefined)
                this.pOnLoad();
        }
    }

    this.openTab=function(pOptions){
        defaultOption = {
            windowId : undefined,
            index : undefined,
            url : undefined,
            active : undefined,
            selected : undefined,
            pinned : undefined,
            openerTabId :undefined,

            onOpen: undefined
        }

        pOptions = $.extend(defaultOption, pOptions);

        onOpen = pOptions.onOpen;
        delete pOptions.onOpen;        
        
        chrome.tabs.create(pOptions, function(tab){
            newTab = new tabObject(tab.id, onOpen);
            this._tabs[tab.id] = newTab;

            if(typeof onOpen != "undefined")
                onOpen(newTab);
        }.bind(this));
    }

    //notification object
    function NotificationObject(pId, pOnClick){
        this.pId = pId;
        this.pOnClick = pOnClick;

        this.close=function(cb){
            chrome.notifications.clear(this.pId, cb);
        }
        this.onClick = function(){
            this.close();

            if(this.pOnClick != undefined)
                this.pOnClick();
        }
    }

    this.sendNotification = function(pOptions){
        defaultOption = {
            type : undefined,
            iconUrl : undefined,
            appIconMaskUrl : undefined,
            title : undefined,
            message : undefined,
            contextMessage : undefined,
            priority : undefined,
            eventTime : undefined,
            buttons : undefined,
            imageUrl : undefined,
            items : undefined,
            progress : undefined,
            isClickable : undefined,
            requireInteraction : undefined,

            slug : undefined,
            onOpen: undefined,
            onClick: undefined
        }

        pOptions = $.extend(defaultOption, pOptions)
        
        // this._notifications[pOptions.slug]
        cb = pOptions.onOpen;
        delete pOptions.onOpen;

        onClick = pOptions.onClick;
        delete pOptions.onClick;
        
        if(onClick != undefined)
            pOptions.isClickable = true;

        slug = pOptions.slug;
        delete pOptions.slug;

        chrome.notifications.create(slug, pOptions, function(id){
            notif = new NotificationObject(id, onClick);
            this._notifications[id] = notif;

            if(typeof onOpen != "undefined")
                onOpen(notif);
        }.bind(this))
    }



    this.init=function(){
        chrome.notifications.onClicked.addListener(function(notificationID){

            this._notifications[notificationID].onClick();

            // if(typeof notificationsLinks[notificationID] != "undefined" && notificationsLinks[notificationID] != null){
                // chrome.tabs.create({ url: notificationsLinks[notificationID], active : true }, function(tab){
                //     waitingTabs[tab.id] = update;
                // });
                // chrome.notifications.clear(notificationID);
                // chrome.windows.getCurrent({}, function(window){
                //     chrome.windows.update(window.id, {focused:true});
                // });
            // }
        }.bind(this));
    }

    this.init();

}