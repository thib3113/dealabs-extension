class WebExtension{
    setStorage(object, sync, cb){
        object = object || null;
        sync = sync || false;
        if(object == null) return null;

        if(sync){
            chrome.storage.sync.set(object, cb);
        }
        else{
            chrome.storage.local.set(object, cb);
        }
    }

    getPopup(){
        return chrome.extension.getViews({type:'popup'})
    }

    stopWaitFor(event){
        if(this._waitForWaiter[event] != undefined){
            for (var i = this._waitForWaiter[event].length - 1; i >= 0; i--) {
                this._waitForWaiter[event][i]();
            }
            delete this._waitForWaiter[event];
        }
        this._waitFor[event] = true;
    }

    removeWaitFor(event){
        if(this._waitForWaiter[event] != undefined){
            delete this._waitForWaiter[event];
        }
    }

    waitFor(event, cb){
        if(this._waitFor[event] != undefined){
            cb();
        }
        else{
            if(this._waitForWaiter[event] == undefined)
                this._waitForWaiter[event] = [];
            this._waitForWaiter[event].push(cb);
        }
    }

    getStorage(names, cb, sync){
        if(sync){
            chrome.storage.sync.get(names, cb);
        }
        else{
            chrome.storage.local.get(names, cb);
        }
    }

    updateContextMenu(id, updateProperties, cb){
        cb = cb || function(){};

        var defaultOption = this.getDefaultOptions("updateContextMenu");

        var updateProperties = $.extend(defaultOption, updateProperties);

        chrome.contextMenus.update(id, updateProperties,cb);
    }
    removeContextMenu(name, cb){
        cb = cb || function(){};

        chrome.contextMenus.remove(name,cb);
    }

    removeAllContextMenu(cb){
        cb = cb || function(){};
        chrome.contextMenus.removeAll(cb);
    }

    addContextMenu(pOptions){

        var defaultOption = this.getDefaultOptions("newContextMenu");

        var pOptions = $.extend(defaultOption, pOptions);
        delete pOptions.onClick;

        chrome.contextMenus.create(defaultOption);
    }

    getManifest(){
        return chrome.runtime.getManifest();
    }

    onMessage(message, cb, allowExternal){
        allowExternal = allowExternal || false;
        this._messageListener[message] = {
            cb : cb,
            allowExternal : allowExternal
        };
    }

    off(message){
        delete this._messageListener[message];
    }

    sendMessage(event, datas, cb){
        cb = cb || function(){};

        if(!this.isBackgroundPage) // background can't send message to background page ....
            chrome.runtime.sendMessage({"event":event, "datas":datas}, cb)
        else{
            chrome.tabs.query({
                url:chrome.runtime.getManifest().content_scripts[0].matches
            }, function(tabs) {
               for (var i = tabs.length - 1; i >= 0; i--) {
                  chrome.tabs.sendMessage(tabs[i].id, {"event":event, datas:datas}, cb);
               }
            });
        }
    }

    openTab(pOptions){
        var defaultOption = this.getDefaultOptions("newTab");

        var pOptions = $.extend(defaultOption, pOptions);

        var onOpen = pOptions.onOpen;
        delete pOptions.onOpen;   

        var onLoad = pOptions.onLoad;
        delete pOptions.onLoad;        
        
        chrome.windows.getCurrent({}, function(current_window){
            var openInTabFn = function(){
                chrome.tabs.create(pOptions, function(tab){
                    var newTab = new tabObject(tab.id, onLoad);
                    this._tabs[tab.id] = newTab;

                    if(typeof onOpen == "function")
                        onOpen(newTab);
                }.bind(this));
            }.bind(this);

            if(chrome.runtime.lastError!=undefined){
                //create a, empty window
                chrome.windows.create({}, openInTabFn);
            }
            else{
                openInTabFn();
            }
        }.bind(this))
    }

    getAllExtensions(cb){
        chrome.notifications.getAll(function(notifications){
            for(index in notifications){
                notifications[index] = this._notifications[index];
            }

            cb(notifications);
        }.bind(this))
    }

    getNavigator(){
        if(navigator.userAgent.match(/Chrome/gi)){ 
            return "chrome"
        } 
        else if(navigator.userAgent.match(/Firefox/gi)){ 
            return "firefox"
        } 
        else
            throw new Error("unknown navigator "+navigator.userAgent); 
    }

    getPluginUrl(){
        switch(this.getNavigator()){
            case "chrome":
                return 'https://chrome.google.com/webstore/detail/'+(extension.getManifest().name.replace(/\s+/g, "-").replace(/--/g, "-").toLowerCase())+'/'+(chrome.runtime.id)
            break;
            case "firefox":
                return "https://addons.mozilla.org/fr/developers/addon/dealabs-non-officiel";
            break;
            default:
                return "javascript:;";
            break;
        }
    }

    sendNotification(pOptions){
        // console.log("sendNotification()");
        var defaultOption = this.getDefaultOptions("newNotification");

        if(chrome.notifications == undefined){
            this.sendMessage("notify", pOptions);
        }
        else{
            pOptions = $.extend(defaultOption, pOptions)
            
            var onOpen = pOptions.onOpen;
            delete pOptions.onOpen;

            var onClick = pOptions.onClick;
            delete pOptions.onClick;

            var datas = pOptions.datas;
            delete pOptions.datas;
            
            if(typeof onOpen == "function")
                pOptions.isClickable = true;

            var slug = pOptions.slug;
            delete pOptions.slug;

            var createTime = Date.now();
            chrome.notifications.create(slug, pOptions, function(id){
                var notif = new NotificationObject(id, this.onClick, this.datas);
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

    _(text){
        if(chrome.i18n == undefined)
            return text;
        try{
            return this.i18n.getMessage.apply(this, arguments);
        }
        catch(e){
            debugger;
        }
    }

    _n(text,number){
        if(chrome.i18n == undefined)
            return text;

        var args = Array.prototype.slice.call(arguments);
        if(number>1){
            args[0] = this.i18n.sanitize(text)+"_p";
        }
        else{
            args[0] = this.i18n.sanitize(text);
        }

        args.slice(1,1);
        var message = this.i18n.getMessage.apply(this, args);
        if(message == args[0])
            return text;
        else
            return message;
    }

    log(message, stack){
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

    getLogs(cb){
        this.getStorage(['logs'], function(logs){
            cb(logs);
        }.bind(this));
    }

    cleanLogs(){
        this.setStorage({
            logs:[]
        })
    }

    getDefaultOptions(type){
        return Object.assign({}, this.defaultOptions[type]);
    }

    constructor(){
        this._notifications = {};
        this._tabs = {};
        this._messageListener = {};
        this._waitFor = {};
        this._waitForWaiter = {};

        this.extension = chrome.extension;

        this.browserAction = chrome.browserAction;

        this.defaultOptions = {
            "newTab":{
                windowId : undefined,
                index : undefined,
                url : undefined,
                active : undefined,
                selected : undefined,
                pinned : undefined,
                openerTabId :undefined,

                onOpen: null,
                onLoad: null,
            },
            "newContextMenu":{
                type : undefined,
                id : undefined,
                title : undefined,
                checked : undefined,
                contexts : undefined,
                onclick : undefined,
                parentId: undefined,
                documentUrlPatterns : undefined,
                targetUrlPatterns : undefined,
                enabled : undefined
            },
            "updateContextMenu":{
                type : undefined,
                title : undefined,
                checked : undefined,
                contexts : undefined,
                onclick : undefined,
                parentId: undefined,
                documentUrlPatterns : undefined,
                targetUrlPatterns : undefined,
                enabled : undefined
            },
            "newNotification":{
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
                requireInteraction: undefined,

                datas : null,
                slug : null,
                onOpen: null,
                onClick: null
            }
        }

        if(chrome.i18n != undefined){
            this.i18n = { 
                getAcceptLanguages: chrome.i18n.getAcceptLanguages, 
                getUILanguage: chrome.i18n.getUILanguage, 
                detectLanguage: chrome.i18n.detectLanguage 
            } 

            this.i18n.sanitize = function(text){
                return text.replace(/[^\w]/gi, "_").replace(/_+/gi, "_");
            }

            this.i18n.getMessage=function(){
                var message = arguments[0]
                arguments[0] = this.i18n.sanitize(message);
                var text = chrome.i18n.getMessage.apply(this, arguments) || "";
                if(text.length == 0){
                    console.warn("oops, text for : \n \""+message+"\" \n with key : \""+arguments[0]+"\" \n is missing from the current language "+this.i18n.getUILanguage())
                    return message;
                }
                else
                    return text;
            }.bind(this);
        }

        this.isBackgroundPage = location.href.match(/chrome-extension:\/\/[a-z]+\/_generated_background_page\.html/g)!=null;

        // if(this.isBackgroundPage){

        //     chrome.runtime.onConnect.addListener(function(port) {
        //         //todo !!
        //         //cb don't exist
        //         port.onMessage.addListener(function(msg, sender, cb) {
        //             console.log("Receive a message "+(sender.tab ? "from a content script:" + sender.tab.url : "from the extension"));
        //             console.log(msg);
        //             if(this._messageListener[msg.event] != undefined){
        //                 this._messageListener[msg.event](msg.datas, cb);
        //             }
        //         }.bind(this));
        //     }.bind(this));
        // }
        // else{
        // }
        // 
        
        //handle request from dealabs website
        if(this.isBackgroundPage){
            chrome.runtime.onMessageExternal.addListener(
                function(msg, sender, sendResponse) {
                    console.log("Receive a message from a webpage : "+sender.url);
                    console.log(msg);
                    if(this._messageListener[msg.event] != undefined && this._messageListener[msg.event]["allowExternal"]){
                        return this._messageListener[msg.event](msg.datas, sendResponse);
                    }
                }.bind(this)
            );
        }

        chrome.runtime.onMessage.addListener(
          function(msg, sender, cb) {
            console.log("Receive a message "+(sender.tab ? "from a content script:" + sender.tab.url : "from the extension"));
            console.log(msg);
            if(this._messageListener[msg.event] != undefined){
                return this._messageListener[msg.event]["cb"](msg.datas, cb);
            }
          }.bind(this)
        );

        if(chrome.tabs != undefined){
            chrome.tabs.onUpdated.addListener(function(tabId , info) {
                if(this._tabs[tabId] != undefined){
                    if (info.status != "complete") return;
                    this._tabs[tabId].onLoad();
                }
            }.bind(this));
        }

        // if(!this.isBackgroundPage){
        //     this._messagePort = chrome.runtime.connect({name: "message"});
        //     this._messagePort.onDisconnect.addListener(function(){
        //         console.log("disconnected", chrome.runtime.lastError);
        //     }.bind(this))
        // }

        if(chrome.notifications == undefined){
            //notifications are not available
            // this._notificationPort = chrome.extension.connect({name: "notify"});
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
}

class tabObject{
    constructor(pId, pOnLoad){
        this.pId = pId;
        this.pOnLoad = pOnLoad;
    }
    onLoad(){
        if(typeof this.pOnLoad == "function")
            this.pOnLoad();
    }
}

class NotificationObject{
    constructor(pId, pOnClick, datas){
        this.pId = pId;
        this.pOnClick = pOnClick;
        this.datas = datas;
    }   
    
    close(cb){
        chrome.notifications.clear(this.pId, cb);
    }   

    onClick(){
        this.close();

        if(typeof this.pOnClick == "function")
            this.pOnClick(this.datas);
        else if(this.datas.url != undefined && this.datas.url.length>0){
          extension.openTab({
            active : true,
            url : this.datas.url
          })
        }
    }
    onOpen(){
        if(typeof this.pOnOpen == "function")
            this.pOnOpen();
        
        if(this.createTime > Date.now()+120000)
            this.close();
    }
    update(pOptions, cb){
        var defaultOption = {
            type : undefined,
            iconUrl : undefined,
            appIconMaskUrl : undefined,
            title : undefined,
            message : undefined,
            contextMessage : undefined,
            priority : undefined,
            eventTime : undefined,
            // buttons : undefined, //firefox don't support 
            imageUrl : undefined,
            items : undefined,
            progress : undefined,
            isClickable : undefined,
            datas : undefined,
            slug : undefined,
            onOpen: undefined,
            onClick: undefined
        }

        var pOptions = $.extend(defaultOption, pOptions)

        this.pOnOpen = pOptions.onOpen;
        delete pOptions.onOpen;

        this.onClick = pOptions.onClick;
        delete pOptions.onClick;

        this.datas = pOptions.datas;
        delete pOptions.datas;
        
        if(typeof onClick == "function")
            pOptions.isClickable = true;

        delete pOptions.slug;

        cb = cb || function(){};

        chrome.extension.update(this.pId, pOptions, cb);
    }
}