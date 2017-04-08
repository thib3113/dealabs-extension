function FirefoxExtension(){
    this._notifications = {};
    this._tabs = {};
    this._messageListener = {};
    this._waitFor = {};
    this._waitForWaiter = {};
    self = this;

    /**
     * save in local or sync storage
     * @author Thibaut SEVERAC (thib3113@gmail.com)
     * @param  object object save object key is the name in the storage
     * @param  boolean sync   sync or not
     */
    this.setStorage = function(object, sync, cb){
        object = object || null;
        sync = sync || false;

        //firefox don't support sync before 0.53 (beta for the moment)
        sync = false;

        if(object == null) return null;

        if(sync){
            chrome.storage.sync.set(object, cb);
        }
        else{
            chrome.storage.local.set(object, cb);
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

    this.stopWaitFor = function(event){
        if(this._waitForWaiter[event] != undefined){
            for (var i = this._waitForWaiter[event].length - 1; i >= 0; i--) {
                this._waitForWaiter[event][i]();
            }
            delete this._waitForWaiter[event];
        }
        this._waitFor[event] = true;
    }

    this.removeWaitFor = function(event){
        if(this._waitForWaiter[event] != undefined){
            delete this._waitForWaiter[event];
        }
    }

    this.waitFor= function(event, cb){
        if(this._waitFor[event] != undefined){
            cb();
        }
        else{
            if(this._waitForWaiter[event] == undefined)
                this._waitForWaiter[event] = [];
            this._waitForWaiter[event].push(cb);
        }
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

    this.updateContextMenu = function(id, updateProperties, cb){
        cb = cb || function(){};

        defaultOption = {
            type : undefined,
            title : undefined,
            checked : undefined,
            contexts : undefined,
            onclick : updateProperties.onClick,
            parentId: undefined,
            documentUrlPatterns : undefined,
            targetUrlPatterns : undefined,
            enabled : undefined
        }

        updateProperties = $.extend(defaultOption, updateProperties);

        chrome.contextMenus.update(id, updateProperties,cb);
    }
    this.removeContextMenu = function(name, cb){
        cb = cb || function(){};

        chrome.contextMenus.remove(name,cb);
    }

    this.removeAllContextMenu = function(cb){
        cb = cb || function(){};

        chrome.contextMenus.removeAll(cb);
    }

    this.addContextMenu= function(pOptions){
        defaultOption = {
            type : undefined,
            id : undefined,
            title : undefined,
            checked : undefined,
            contexts : undefined,
            onclick : pOptions.onClick,
            parentId: undefined,
            documentUrlPatterns : undefined,
            targetUrlPatterns : undefined,
            enabled : undefined
        }

        pOptions = $.extend(defaultOption, pOptions);
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
        if(!this.isBackgroundPage) // background can't send message to background page ....
            this._messagePort.postMessage({"event":event, datas:datas});
        else{
            chrome.tabs.query({
                url:chrome.runtime.getManifest().content_scripts[0].matches
            }, function(tabs) {
               for (var i = tabs.length - 1; i >= 0; i--) {
                  chrome.tabs.sendMessage(tabs[i].id, {"event":event, datas:datas});
               }
            });
        }
    }

    //tabObject object
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
            pinned : undefined,

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
            else if(this.datas.url != undefined && this.datas.url.length>0){
              extension.openTab({
                active : true,
                url : this.datas.url
              })
            }
        }

        this.onOpen = function(){
            if(this.pOnOpen != undefined)
                this.pOnOpen();
            
            if(this.createTime > Date.now()+120000)
                this.close();
        }

        this.update=function(pOptions, cb){
            defaultOption = {
                type : undefined,
                iconUrl : undefined,
                appIconMaskUrl : undefined,
                title : undefined,
                message : undefined,
                contextMessage : undefined,
                priority : undefined,
                eventTime : undefined,
                // buttons : undefined,
                imageUrl : undefined,
                items : undefined,
                progress : undefined,
                isClickable : undefined,

                datas : undefined,
                slug : undefined,
                onOpen: undefined,
                onClick: undefined
            }

            pOptions = $.extend(defaultOption, pOptions)

            this.pOnOpen = pOptions.onOpen;
            delete pOptions.onOpen;

            this.onClick = pOptions.onClick;
            delete pOptions.onClick;

            this.datas = pOptions.datas;
            delete pOptions.datas;
            
            if(onClick != undefined)
                pOptions.isClickable = true;

            delete pOptions.slug;

            cb = cb || function(){};

            chrome.extension.update(this.pId, pOptions, cb);
        }
    }

    this.sendNotification = function(pOptions){
        // console.log("sendNotification()");
        defaultOption = {
            type : undefined,
            iconUrl : undefined,
            appIconMaskUrl : undefined,
            title : undefined,
            message : undefined,
            contextMessage : undefined,
            priority : undefined,
            eventTime : undefined,
            // buttons : undefined,
            imageUrl : undefined,
            items : undefined,
            progress : undefined,
            isClickable : undefined,
            // requireInteraction: undefined,

            datas : undefined,
            slug : undefined,
            onOpen: undefined,
            onClick: undefined
        }

        if(chrome.notifications == undefined){
            this.sendMessage("notify", pOptions);
        }
        else{
            pOptions = $.extend(defaultOption, pOptions)
            
            // this._notifications[pOptions.slug]
            onOpen = pOptions.onOpen;
            delete pOptions.onOpen;

            onClick = pOptions.onClick;
            delete pOptions.onClick;

            datas = pOptions.datas;
            delete pOptions.datas;
            
            if(onClick != undefined)
                pOptions.isClickable = true;

            slug = pOptions.slug;
            delete pOptions.slug;

            if(pOptions.type == "list" && pOptions.items.length>0)
                pOptions.message = null;

            createTime = Date.now();
            browser.notifications.create(slug, pOptions, function(id){
                notif = new NotificationObject(id, this.onClick, this.datas);
                notif.createTime = this.createTime;

                notif.pOnOpen = this.onOpen;
                
                this._notifications[id] = notif;
                notif.onOpen();

            }.bind({
                _notifications:this._notifications,
                onOpen:onOpen,
                onClick: onClick,
                createTime:createTime,
                datas: datas
            }))
        }

    }

    this.browserAction = chrome.browserAction;

    this.i18n = {
        getAcceptLanguages: chrome.i18n.getAcceptLanguages,
        getUILanguage: chrome.i18n.getUILanguage,
        detectLanguage: chrome.i18n.detectLanguage
    }

    this._ = function(text){
        return this.i18n.getMessage.apply(this, arguments);
    }

    this._n=function(text,number){
        args = Array.prototype.slice.call(arguments);
        if(number>1){
            args[0] = self.i18n.sanitize(text)+"-p";
        }
        else{
            args[0] = self.i18n.sanitize(text);
        }
        //todo 
        args.slice(1,1);
        message = chrome.i18n.getMessage.apply(this, args);
        if(message.length == 0)
            return text;
        else
            return message;
    }

    this.i18n.sanitize = function(text){
        return text.replace(/[^\w]/gi, "_").replace(/_+/gi, "_");
    }

    this.i18n.getMessage=function(){
        message = arguments[0]
        arguments[0] = self.i18n.sanitize(message);
        text = chrome.i18n.getMessage.apply(this, arguments);
        if(text.length == 0){
            console.warn("oops, text for : \n \""+message+"\" \n with key : \""+arguments[0]+"\" \n is missing from the current language "+this.i18n.getUILanguage())
            return message;
        }
        else
            return text;
    }

    this.log=function(message, stack){
        this.getStorage(['logs'], function(logs){
            if(logs.push == undefined)
                logs = [];

            logs.push({
                message:message,
                stack:stack
            });

            this.setStorage({
                logs:logs
            });
        }.bind(this));
    }

    this.getLogs=function(cb){
        this.getStorage(['logs'], function(logs){
            cb(logs);
        }.bind(this));
    }

    this.cleanLogs=function(){
        this.setStorage({
            logs:[]
        })
    }

    this.init=function(){
        this.isBackgroundPage = location.href.match(/chrome-extension:\/\/[a-z]+\/_generated_background_page\.html/g)!=null;

        if(this.isBackgroundPage){
            chrome.extension.onConnect.addListener(function(port) {
                port.onMessage.addListener(function(msg, sender, cb) {
                    console.log("Receive a message "+(sender.tab ? "from a content script:" + sender.tab.url : "from the extension"));
                    console.log(msg);
                    if(this._messageListener[msg.event] != undefined){
                        this._messageListener[msg.event](msg.datas);
                    }
                }.bind(this));
            }.bind(this));
        }
        else{
            chrome.runtime.onMessage.addListener(
              function(msg, sender, cb) {
                console.log("Receive a message "+(sender.tab ? "from a content script:" + sender.tab.url : "from the extension"));
                console.log(msg);
                if(this._messageListener[msg.event] != undefined){
                    this._messageListener[msg.event](msg.datas);
                }
              }.bind(this)
            );
        }

        if(chrome.tabs != undefined){
            chrome.tabs.onUpdated.addListener(function(tabId , info) {
                if(this._tabs[tabId] != undefined){
                    if (info.status != "complete") return;
                    this._tabs[tabId].onLoad();
                }
            }.bind(this));
        }

        this._messagePort = browser.runtime.connect({name: "message"});
        this._messagePort.onDisconnect.addListener(function(){
            //if disconnect try to reconnect
            this._messagePort = browser.runtime.connect({name: "message"});
        }.bind(this))

        if(chrome.notifications == undefined){
            //notifications are not available
            // this._notificationPort = browser.runtime.connect({name: "notify"});
        }
        else{

            this.onMessage('notify', function(datas){
                this.sendNotification(datas);
            }.bind(this));

            chrome.notifications.onClicked.addListener(function(notificationID){
                this._notifications[notificationID].onClick();
            }.bind(this));
        }
    }

    this.init();

}