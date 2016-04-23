function ChromeExtension(){
    this._notifications = {};
    this._tabs = {};
    this._messageListener = {};

    this.setStorage = function(object, sync){
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

    this.getStorage = function(names, cb, sync){
        if(sync){
            chrome.storage.sync.get(names, cb);
        }
        else{
            chrome.storage.local.get(names, cb);
        }
    }

    this.onMessage=function(message, cb){
        this._messageListener[message] = cb;
    }

    this.sendMessage=function(event, datas){
        this._messagePort.postMessage({"event":event, datas:datas});
    }

    //notification object
    function tabObject(pId, pOnLoad){
        this.pId = pId;
        this.pOnLoad = pOnLoad;

        this.close=function(cb){
            cb = cb || function(){}
            chrome.notifications.clear(this.pId, cb);
        }
        this.onLoad = function(){
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

            onOpen: undefined,
            onLoad: undefined,
        }

        pOptions = $.extend(defaultOption, pOptions);

        onOpen = pOptions.onOpen;
        delete pOptions.onOpen;   

        onLoad = pOptions.onLoad;
        delete pOptions.onLoad;        
        
        chrome.tabs.create(pOptions, function(tab){
            newTab = new tabObject(tab.id, onLoad);
            this._tabs[tab.id] = newTab;

            if(typeof onOpen != "undefined")
                onOpen(newTab);
        }.bind(this));
    }

    this.getAllExtensions=function(cb){
        chrome.notifications.getAll(function(notifications){
            for(index in notifications){
                notifications[index] = this._notifications[index];
            }

            cb(notifications);
        }.bind(this))
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

    this.browserAction = chrome.browserAction;

    this.init=function(){
        chrome.extension.onConnect.addListener(function(port) {
            port.onMessage.addListener(function(msg) {
                if(this._messageListener[msg.event] != undefined){
                    this._messageListener[msg.event](msg.datas);
                }
            }.bind(this));
        }.bind(this));

        if(chrome.tabs != undefined){
            chrome.tabs.onUpdated.addListener(function(tabId , info) {
                if(this._tabs[tabId] != undefined){
                    if (info.status != "complete") return;
                    console.log(this._tabs[tabId]);
                    this._tabs[tabId].onLoad();
                }
            }.bind(this));
        }

        this._messagePort = chrome.extension.connect({name: "message"});
        if(chrome.notifications == undefined){
            //notifications are not available
            this._notificationPort = chrome.extension.connect({name: "notify"});
        }
        else{
            chrome.notifications.onClicked.addListener(function(notificationID){
                this._notifications[notificationID].onClick();
            }.bind(this));
        }
    }

    this.init();

}