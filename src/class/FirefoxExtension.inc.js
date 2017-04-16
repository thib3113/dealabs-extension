class FirefoxExtension extends WebExtension{
    constructor(){
        super();

        //delete unsupported options
        delete this.defaultOptions.newTab.selected
        delete this.defaultOptions.newTab.openerTabId
        delete this.defaultOptions.newTab.openerTabId

        delete this.defaultOptions.newNotification.buttons
        delete this.defaultOptions.newNotification.requireInteraction
    }

    sendNotification(pOptions){
        // console.log("sendNotification()");
        defaultOption = this.defaultOptions.newNotification;

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
}