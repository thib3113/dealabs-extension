function ChromeExtension(){
    this._notifications = {};
    this._tabs = {};
    this._messageListener = {};

    /**
     * save in local or sync storage
     * @author Thibaut SEVERAC (thib3113@gmail.com)
     * @param  object object save object key is the name in the storage
     * @param  boolean sync   sync or not
     */
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

    /**
     * get the popup window object
     * @author Thibaut SEVERAC (thib3113@gmail.com)
     * @return window the popup window
     */
    this.getPopup = function(){
        return chrome.extension.getViews({type:'popup'})
    }

    /**
     * get storage
     * @author Thibaut SEVERAC (thib3113@gmail.com)
     * @param  array or string   names names of storage values
     * @param  function cb    callback function
     * @param  boolean   sync  get from sync storage or local
     */
    this.getStorage = function(names, cb, sync){
        if(sync){
            chrome.storage.sync.get(names, cb);
        }
        else{
            chrome.storage.local.get(names, cb);
        }
    }

    this.addContextMenu= function(pOptions){
        defaultOption = {
            type : undefined,
            id : undefined,
            title : undefined,
            checked : undefined,
            contexts : undefined,
            onclick : pOptions.onClick,
            
            onOpen : undefined
        }

        pOptions = $.extend(defaultOption, pOptions);

        onOpen = pOptions.onOpen;
        delete pOptions.onOpen;
        delete pOptions.onClick;

        chrome.contextMenus.create(defaultOption);
    }

    this.getManifest=function(){
        return chrome.runtime.getManifest();
    }

    this.onMessage=function(message, cb){
        this._messageListener[message] = cb;
    }

    this.off=function(message){
        delete this._messageListener[message];
    }

    this.sendMessage=function(event, datas){
        this._messagePort.postMessage({"event":event, datas:datas});
    }

    //notification object
    function tabObject(pId, pOnLoad){
        this.pId = pId;
        this.pOnLoad = pOnLoad;

        this.onLoad = function(){
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
    function NotificationObject(pId, pOnClick, datas){
        this.pId = pId;
        this.pOnClick = pOnClick;
        this.datas = datas;

        this.close=function(cb){
            chrome.notifications.clear(this.pId, cb);
        }
        this.onClick = function(){
            this.close();

            if(this.pOnClick != undefined)
                this.pOnClick(this.datas);
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

            datas : undefined,
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

        datas = pOptions.datas;
        delete pOptions.datas;
        
        if(onClick != undefined)
            pOptions.isClickable = true;

        slug = pOptions.slug;
        delete pOptions.slug;

        chrome.notifications.create(slug, pOptions, function(id){
            notif = new NotificationObject(id, this.onClick, this.datas);
            this._notifications[id] = notif;

            if(typeof this.onOpen != "undefined")
                this.onOpen(notif);
        }.bind({
            _notifications:this._notifications,
            onOpen:onOpen,
            onClick: onClick,
            datas: datas
        }))
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