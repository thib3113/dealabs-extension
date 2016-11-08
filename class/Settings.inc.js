function SettingsManager(){

    this.updateInterval = 1.8e6 //30 minutes
    this._settings = {
        time_between_refresh : 60000,
        notifications_manage : {
          desktop : true,
          forum : true,
          MPs : true,
          deals : true,
          alertes : true
        },
        // turbopixAPIKey : "",
        imgurAPIKey : "",
        theme : {
            "safeName" : "default",
            "name": "Par défaut"
          },
        emoticone_theme : {
            "safeName" : "default",
            "name": "Par défaut"
        },
        blacklist: {},
        notifications_with_sound :{},
        smileys : {
            "siffle" : "https://i.imgur.com/vUB0XuB.gif",
            "fouet"  : "https://i.imgur.com/2Zis7c8.gif",
            "troll"  : "https://i.imgur.com/8q1lbcn.png",
            "jaime"  : "https://i.imgur.com/wS1LGvS.png"
        }
    }

    this.toJSON=function(){
        return this._settings;
    }

    this.syncSettings = function(){
            extension.getStorage('settings', function(value){
                this.settings = value.settings;
            }.bind(this), true);
    }

    this.init=function(){
        this.syncSettings();
        setInterval(this.syncSettings, this.updateInterval);

        for(index in this._settings){
            Object.defineProperty(this, index, {
                get: function() {
                    return this.context.settings[this.property];
                }.bind({context:this, property:index}),
                set: function(value) {
                    newSettings = this.context.settings;
                    newSettings[this.property] = value;
                    this.context.settings = newSettings;
                }
                .bind(
                    {
                        property:index,
                        context : this
                    }
                )
            });
        
        }
    }

    Object.defineProperty(this, 'settings', {
        get: function() {
            return this._settings;
        },
        set: function(value) {
            this._settings = $.extend(this._settings, value);
            this.updateSettings();
        }
    });

    this.updateSettings=function(){
        extension.setStorage({settings:this._settings}, true);
    }

    this._deepmerge = function (target, src) {
        var array = Array.isArray(src);
        var dst = array && [] || {};

        if (array) {
            target = target || [];
            dst = dst.concat(target);
            src.forEach(function(e, i) {
                if (typeof dst[i] === 'undefined') {
                    dst[i] = e;
                } else if (typeof e === 'object') {
                    dst[i] = plugin_deepmerge(target[i], e);
                } else {
                    if (target.indexOf(e) === -1) {
                        dst.push(e);
                    }
                }
            });
        } else {
            if (target && typeof target === 'object') {
                Object.keys(target).forEach(function (key) {
                    dst[key] = target[key];
                })
            }
            Object.keys(src).forEach(function (key) {
                if (typeof src[key] !== 'object' || !src[key]) {
                    dst[key] = src[key];
                }
                else {
                    if (!target[key]) {
                        dst[key] = src[key];
                    } else {
                        dst[key] = plugin_deepmerge(target[key], src[key]);
                    }
                }
            });
        }
        return dst;
    }

    this.init();
}