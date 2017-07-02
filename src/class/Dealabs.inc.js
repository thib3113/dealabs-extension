class Dealabs extends EventEmitter{ 
    _matchAll(re, str, m){
        var retour = [];
        while ((m = re.exec(str)) !== null) {
          if (m.index === re.lastIndex) {
              re.lastIndex++;
          }
          retour.push(m);
        }
        return retour;
    }

    _nl2br(str) {
        return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ '<br>' +'$2');
    }

    _getUrls(content){
        var re = /((?:http|ftp|https):\/\/[\w\-]+(?:\.[\w\-]+)+(?:[\w.,@?\^=%&amp;:\/~+#\-]*[\w@?\^=%&amp;\/~+#\-])?)/g;
        return content.match(re) || [];
    }

    generatePreview(commentContainer, vars, formType){
        vars = vars || {};

        var replacements = {};

        var after;

        var baseURLSmileys = "https://static.dealabs.com/images/smiley/";

        if (typeof vars.commentaire == "undefined")
            return;

        vars.commentaire = this.parseEmoticons(vars.commentaire, formType)

        for (var i = 0; i < this.BBcodes.length; i++) {
            if($.inArray(formType, this.BBcodes[i].not_supported) >= 0)
                continue;
            if (typeof replacements[this.BBcodes[i].name] == "undefined")
                replacements[this.BBcodes[i].name] = [];

            var bbcodes_found = this._matchAll(this.BBcodes[i].regex, vars.commentaire);
            for (var j = bbcodes_found.length - 1; j >= 0; j--) {
                var cur_bbcodes_found = bbcodes_found[j][0];

                var subst = this.BBcodes[i].name + '_' + replacements[this.BBcodes[i].name].length

                vars.commentaire = vars.commentaire.replace(new RegExp(this.escapeRegExp(cur_bbcodes_found)), '[' + subst + ']');
                replacements[this.BBcodes[i].name].push({
                    subst: subst,
                    after: cur_bbcodes_found.replace(this.BBcodes[i].regex, this.BBcodes[i].html)
                });
            }
        }

        //match url, and replace by bbcode, for escape smiley
        if (typeof replacements["link"] == "undefined")
            replacements["link"] = [];
        var urls = this._getUrls(vars.commentaire);
        for (var i = urls.length - 1; i >= 0; i--) {
            subst = 'link_' + replacements["link"].length
            vars.commentaire = vars.commentaire.replace(new RegExp(this.escapeRegExp(urls[i])), '[' + subst + ']');
            //url length
            if (urls[i].length <= 25)
                after = '<a href="' + urls[i] + '">' + urls[i] + '</a>';
            else
                after = '<a class="link_a_reduce" href="' + urls[i] + '">' + urls[i].substr(0, 15) + '<i></i><span>' + urls[i].substr(15, urls[i].length - 10 - 15) + '</span>' + urls[i].substr(urls[i].length - 10, urls[i].length) + '</a>';

            replacements.link.push({
                subst: subst,
                after: after
            });
        }

        //transform smileys to a bbcode
        for (var i = 0; i < this.BBcodesSmiley.length; i++) {
            vars.commentaire = vars.commentaire.replace(new RegExp(this.escapeRegExp(this.BBcodesSmiley[i].smiley), 'gi'), '[' + this.BBcodesSmiley[i].name + ']');
        }

        //transform smiley bbcode to image
        for (var i = 0; i < this.BBcodesSmiley.length; i++) {
            vars.commentaire = vars.commentaire.replace(
                new RegExp(
                    this.escapeRegExp('[' + this.BBcodesSmiley[i].name + ']'),
                    'gi'
                ),
                '<img src="' + baseURLSmileys + this.BBcodesSmiley[i].icon + '.png" width="auto" height="auto" alt="' + this.BBcodesSmiley[i].smiley + '" title="' + this.BBcodesSmiley[i].smiley + '" class="bbcode_smiley">'
            )
        }

        for (var code in replacements) {
            for (var i = 0; i < replacements[code].length; i++) {
                var cur_code = replacements[code][i];
                vars.commentaire = vars.commentaire.replace(new RegExp('\\[' + cur_code.subst + '\\]'), cur_code.after);
            }
        }

        var html = commentContainer(vars);
        return html;
    }

    injectScript(func){
        var script = document.createElement('script');
        script.appendChild(document.createTextNode(func));
        (document.body || document.head || document.documentElement).appendChild(script);
    }

    escapeRegExp(str){
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    parseEmoticons(text, formType){
        if(text == undefined || text.length == 0)
            return text

        var smileys_supported = false;
        for(var bbcode of this.BBcodes){
            if(bbcode.name == "img" && $.inArray(formType, bbcode.not_supported) < 0){
                smileys_supported = true
                break;
            }
        }
        if(!smileys_supported)
            return text;

        var current_smileys = settingsManager.smileys
        for (var nom in current_smileys) {
            text = text.replace(new RegExp(':' + this.escapeRegExp(nom) + ':', 'g'), '[img size=300px]' + current_smileys[nom] + '#plugin_smiley[/img]');
        };

        return text;
    }

    initBGListeners(){
        this.initBgTemplatePart();
        extension.onMessage("content-parse_emoticons", function(datas, cb){
            var text = datas.text;
            var formType = datas.formType;
            var returnCb = function() {
                var self = this;
                text = this.parseEmoticons(text, formType);
                cb({
                    success:true,
                    text:text
                })
            }.bind(this)
            
            var ids = this._matchAll(/\[img_wait_upload:([0-9]+)\]/g, text);
            if(ids.length > 0){
                extension.sendMessage("waitImgUpload", {ids:ids}, function(){
                    cb({
                        retry:true
                    })
                }.bind(this))
            }
            else{
                returnCb();
            }
            return true;
        }.bind(this), true);
    }

    pushTextInSelection(text, input){
        var scrollTop = input.scrollTop;
        var scrollLeft = input.scrollLeft;

        input.focus();
        var cursorPos = $(input).prop('selectionStart');
        var v = $(input).val()
        v = v.slice(0, input.selectionStart) + v.slice(input.selectionEnd);
        var textBefore = v.substring(0, cursorPos);
        var textAfter = v.substring(cursorPos, v.length);
        $(input).val(textBefore + text + textAfter);

        //positionne cursor in input
        var selectionStart = (textBefore + text).length
        var selectionEnd = selectionStart;
        if (input.setSelectionRange) {
            input.focus();
            input.setSelectionRange(selectionStart, selectionEnd);
        } else if (input.createTextRange) {
            var range = input.createTextRange();
            range.collapse(true);
            range.moveEnd('character', selectionEnd);
            range.moveStart('character', selectionStart);
            range.select();
        }

        // input.value += ':'+nom+":";
        input.scrollTop = scrollTop;
        input.scrollLeft = scrollLeft;
    }

    changeClassForSmileyAddByPlugin(){
        //update the smileys image for themes
        $(".BBcode_image").each(function(){
            if(this.src.match(/#plugin_smiley$/g)){
                $(this).removeClass("BBcode_image").addClass("bbcode_smiley").attr("onclick", null);
            }
        })
    }

    reCheckQuotes(){
        //recheck quote
        $('.commentaire_div > div.quote').each(function() {
            var quote_height_max = parseInt($(".quote_message").css("max-height"), 10);
            var current_height = $(this).find('.quote_message').height();
            if (current_height == quote_height_max) {
                $(this).find('a.open:first').stop().fadeTo('fast', 1);
                $(this).find('a.open:first').text("Afficher l'intégralité de la citation")
            } else if (current_height > quote_height_max) {
                $(this).find('a.open:first').stop().fadeTo('fast', 1);
                $(this).find('a.open:first').text("Masquer la citation")
            }
        });
    }

    checkEmbedInPreview(){
        $('[data-userscript="comment_container"] a.link_a_reduce').each(function(){
            self.EmbedLinksManager.addLink(this);
        });
    }

    _getParameterByName(name, url){
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    injectCss(css, role, link){
        role = role || "css";
        link = link || false;
        if(link){
            //need to add some css
            var linkObj = document.createElement( "link" );
            linkObj.href = css;
            linkObj.type = "text/css";
            linkObj.rel = "stylesheet";
            linkObj.dataset.pluginRole = role;
            linkObj.media = "screen,print";
            document.getElementsByTagName("head")[0].appendChild( linkObj );
        }        
        else{
            //need to add some css
            var style = document.createElement( "style" );
            style.innerText = css;
            style.dataset.pluginRole = role;
            document.getElementsByTagName("head")[0].appendChild( style );
        }
    }

    generateTemplate(formType, cb){
        self.getTemplate("previews/"+formType, cb);
    }

    initSettingsPageListeners(){
        //load emoticone themes
        $(document).on('change', '#emoticone_theme', function(){
            self.setTheme($(this).find(":selected").data("value"), "emoticone_theme_css");
        })

        $(document).on('change', '#plugin_theme', function(){
            self.setTheme($(this).find(":selected").data("value"), "theme_css");
        })

        $(document).on('click', '[data-plugin-role="add_new_smiley"]', function() {
            self.getTemplate("partials/customSmileyTemplate", function(tpl){
                $(this).parents('tr').before(tpl());
            }.bind(this));
        })


        var tryToBecomeDevelopper = 0;
        $(document).on("click", '[data-plugin-role="version"]', function(){
            tryToBecomeDevelopper++;

            var numberToBecomeDeveloper = 7;

            if(tryToBecomeDevelopper >= numberToBecomeDeveloper-3){
                if(tryToBecomeDevelopper == numberToBecomeDeveloper && !settingsManager.imadevelopper){
                    new Noty({
                        type: 'success',
                        text: extension._('Yeahhh, you are now considerate like a developer')+' <img src="https://static.dealabs.com/images/smiley/emoji_smiling.png" width="auto" height="auto" alt=":)" title=":)" class="bbcode_smiley">',
                        killer:true
                    }).show();
                    settingsManager._updateCb = function(){
                        extension.sendMessage('update_settings', {});
                        settingsManager._updateCb = null;
                    }
                    settingsManager.imadevelopper = true;
                    tryToBecomeDevelopper = 0;
                }
                else if(settingsManager.imadevelopper){
                    new Noty({
                        type: 'warning',
                        text: extension._('You already are a developer')+' <img src="https://static.dealabs.com/images/smiley/emoji_wink.png" width="auto" height="auto" alt=";)" title=";)" class="bbcode_smiley">',
                        killer:true
                    }).show();
                    return;   
                }
                else{
                    new Noty({
                        type: 'information',
                        text: extension._('$number$ more to become a developer ', ""+(numberToBecomeDeveloper-tryToBecomeDevelopper))+' <img src="https://static.dealabs.com/images/smiley/emoji_wink.png" width="auto" height="auto" alt=";)" title=";)" class="bbcode_smiley">',
                        killer:true
                    }).show();
                }
            }
        });

        $(document).on("click", '[data-plugin-role="leave_developer_world"]', function(){
            event.stopPropagation();
            settingsManager._updateCb = function(){
                extension.sendMessage('update_settings', {});
                settingsManager._updateCb = null;
            }
            settingsManager.imadevelopper = false;
            new Noty({
                text:extension._("You leave the developer world ... bye")+' <img src="https://static.dealabs.com/images/smiley/emoji_loudly_crying.png" width="auto" height="auto" alt=":\'(" title=":\'(" class="bbcode_smiley">'
            }).show();
            $(".plugin-debug").remove();
        });
        
        $(document).on("click", '[data-plugin-role="clean_error_list"]', function(event){
            event.stopPropagation();
            extension.cleanLogs();
            $("#debug-logs").text("");
        })

        //update settings
        $(document).on('click', '[data-plugin-role="update_settings"]', function() {
            var newSettings = {};

            newSettings.smileys = {};
            $('#plugin_smileys_list tbody tr').each(function() {
                var smiley_url = $(this).find('[data-plugin-role="smiley_url"]').val();
                if($(this).find('[data-plugin-role="smiley_url"]').val() != undefined){
                    var smiley_name = $(this).find('[data-plugin-role="smiley_name"]').val().replace(/[^\w]/gi, "_").replace(/_+/gi, "_");
                    if (smiley_url != "" && typeof smiley_url != "undefined" && smiley_name != "" && typeof smiley_name != "undefined")
                        newSettings.smileys[smiley_name] = smiley_url;
                }
            });


            $('[data-plugin-option]').each(function(){
                var val;
                var $this = $(this);

                switch(this.nodeName.toUpperCase()){
                    case "SELECT":
                        val = $this.find(":selected");
                    break;
                    case "INPUT":
                        switch(this.type.toUpperCase()){
                            case "CHECKBOX":
                                val = $this.is(":checked");
                            break;
                            default :
                                val = $this.val();
                        }
                    break;
                }

                //check if a sub_cat existe
                var cat = false;
                if($this.data("plugin-option-cat") != undefined)
                    cat = $this.data("plugin-option-cat");

                //check if a data-value exist
                if($(val).data("value") != undefined)
                    val = $(val).data("value");
                else if (val instanceof jQuery)
                    val = $(val).val();

                //convert string representing int to int
                if(parseInt(val) == val)
                    val = parseInt(val);

                var sub_cat = $this.data("plugin-option");

                if(cat){
                    if(newSettings[cat] == undefined)
                        newSettings[cat] = {};

                    newSettings[cat][sub_cat] = val;
                }
                else
                    newSettings[sub_cat] = val;
            });

            new Noty({
                type: 'success',
                text: 'Vos paramètres ont bien été enregistrés.'
            }).show();

            settingsManager._updateCb = function(){
                extension.sendMessage('update_settings', {});
                settingsManager._updateCb = null;
            }
            settingsManager.settings = newSettings;
        });
    }

    setTheme(theme, type){
        type = type || "theme_css";
        var container_url = (type=="theme_css"?theme_url:emoticone_theme_url) 
        //remove current nodes with same role
        var themeAlreadyInjected = document.querySelectorAll('[data-plugin-role="'+type+'"]');
        for (var i = 0; i < themeAlreadyInjected.length; i++) {
            themeAlreadyInjected[i].parentNode.removeChild(themeAlreadyInjected[i]);
        }

        var url;
        if(theme.safeName != "default"){
            for (var i = 0; i < theme.styles.length; i++) {
                if(theme.styles[i].urlRegex == undefined ||  window.location.pathname.match(theme.styles[i].urlRegex)){                   
                    if(theme.styles[i].url.slice(0,5) == "https")
                        url = theme.styles[i].url;
                    else
                        url = container_url+theme.styles[i].url+(theme.styles[i].version!=undefined? "?v="+theme.styles[i].version:"");
                   
                    self.injectCss(url, type, true);
                }
            }
        }
    }

    generateThemesLists(){
        self.getTemplate("settings/list", function(tpl){
            var asyncLists = tpl;
            $('#emoticone_theme').html("");
            var theme_list = [
              {
                "safeName" : "default",
                "name": "Par défaut"
              },
            ];

            try{
                if(settingsManager.emoticone_theme.safeName != "default")
                    theme_list.append(settingsManager.emoticone_theme);
            }
            catch(e){
            }
            var $option;
            for(name in theme_list){
                $option = $(asyncLists({
                    value :  theme_list[name].safeName,
                    selected :  (settingsManager.emoticone_theme.safeName == theme_list[name].safeName),
                    name :  theme_list[name].name,
                }));
                $option.data("value", theme_list[name]);
                $('#emoticone_theme').append($option);
            }

            $.ajax({
              url: emoticone_theme_list_url,
              dataType: "json",
              success: function(theme_list){
                $('#emoticone_theme').html("");
                for(name in theme_list){
                    $option = $(asyncLists({
                        value :  theme_list[name].safeName,
                        selected :  (settingsManager.emoticone_theme.safeName == theme_list[name].safeName),
                        name :  theme_list[name].name,
                    }));
                    $option.data("value", theme_list[name]);
                    $('#emoticone_theme').append($option);
                }
              }
            });
    
            $('#plugin_theme').html("");
            theme_list = [
              {
                "safeName" : "default",
                "name": "Par défaut"
              },
            ];

            try{
                if(settingsManager.theme.safeName != "default")
                    theme_list.append(settingsManager.theme);
            }
            catch(e){
            }
            
            for(name in theme_list){
                $option = $(asyncLists({
                    value :  theme_list[name].safeName,
                    selected :  (settingsManager.theme.safeName == theme_list[name].safeName),
                    name :  theme_list[name].name,
                }));
                $option.data("value", theme_list[name]);
                $('#plugin_theme').append($option);
            }

            $.ajax({
              url: theme_list_url,
              dataType: "json",
              success: function(theme_list){
                $('#plugin_theme').html("");
                for(name in theme_list){
                    $option = $(asyncLists({
                        value :  theme_list[name].safeName,
                        selected :  (settingsManager.theme.safeName == theme_list[name].safeName),
                        name :  theme_list[name].name,
                    }));
                    $option.data("value", theme_list[name]);
                    $('#plugin_theme').append($option);
                }
              }
            });
        }.bind(this));
    }

    generateSettingsMenu(){
        self.getTemplate("settings/menu", function(tpl){
            $('#left_profil_param').append(tpl());
            if(self._getParameterByName('what', location.href) == "plugin")
                $('#plugin_tab').get(0).click();
        });
    }

    generateSettingsPage(){
        self.getTemplate("settings/body", function(tpl){
            var blacklisted_thread = {};
            var sounded_thread = {};
            for(var thread in settingsManager.blacklist){
                var thread_split = thread.split("-");
                blacklisted_thread[thread] = "https://www.dealabs.com/"+thread_split[0]+"/X/X/X/"+thread_split[1];
            }
            for(var thread in settingsManager.notifications_with_sound){
                var thread_split = thread.split("-");
                sounded_thread[thread] = "https://www.dealabs.com/"+thread_split[0]+"/X/X/X/"+thread_split[1];
            }

            $('#right_profil_param .padding_right_profil_param').append(tpl({
                extension_version : extension.getManifest().version,
                smileys : settingsManager.smileys,
                refresh_list : time_between_refresh_list,
                time_between_refresh : settingsManager.time_between_refresh/1000,
                notifications_manage : settingsManager.notifications_manage,
                blacklisted_thread:blacklisted_thread,
                sounded_thread:sounded_thread,
                show_imgur_connection_under_form: settingsManager.show_imgur_connection_under_form
            }));

            //generate async parameters
            //check imgur API
            // imgurManager.checkConnection(function(response){
            //     if(response!=false){
            //         $("#imgur-connection").html(extension._("you are connected with account $account$", response.url));
            //     }
            //     else{
            //         $("#imgur-connection").html(extension._("you are not connected :")+"<em data-plugin-role=\"ask_for_imgur_token\" style=\"cursor:pointer\">"+extension._("click here")+"</em>");
                    // 
            //     }
            // });
        
            if(settingsManager.imadevelopper){
                extension.getLogs(function(result){
                    // if(result == undefined || result.logs == undefined || result.logs.length==0){
                    //     $(".plugin-debug").hide();
                    //     return;
                    // }

                    var logs = result.logs;
                    var text = "";
                    for (var i = logs.length - 1; i >= 0; i--) {
                        text += logs[i].stack
                        if(i-1>=0)
                            text+= "=================";
                    }
                    this.textarea.innerText = text;
                }.bind({textarea:document.querySelector("#debug-logs")}))
            }
            else{
                var debugElements = document.querySelectorAll(".plugin-debug");
                for (var i = 0; i < debugElements.length; i++) {
                    debugElements[i].remove();
                }
            }

            self.generateThemesLists();
            self.generateSettingsMenu();
        }.bind(this));

    }

    getTemplate(tplName, cb){
        this.compiledTemplates = {}

        var compileFunction = function(){
            if(this.compiledTemplates[tplName] != undefined){
                cb(this.compiledTemplates[tplName]);
            }

            extension.sendMessage("getTemplate", {template:tplName}, function(template){
                var compiledTemplate = Handlebars.compile(template);
                this.compiledTemplates[tplName] = compiledTemplate;
                cb(this.compiledTemplates[tplName]);
            }.bind(this));
        }.bind(this);

        //check if partials are loaded
        if(!this.partialsLoaded && !this.partialsLoading){
            var basicParams = arguments;
            //set it here to avoid multiple calls
            this.partialsLoading = true;
            
            this.on("partialsLoaded", function(){
                compileFunction();
            }.bind(this))
            
            $.ajax({
                url:extension.extension.getURL("assets/templates/partials/partials.json"),
                dataType:"json",
                success : function(response){
                    async.each(response, function(file, cb){
                        var partialName = basename(file, ".tpl");
                        extension.sendMessage("getTemplate", {template:"partials/"+partialName}, function(template){
                            var compiledTemplate = Handlebars.compile(template);
                            Handlebars.registerPartial(partialName,template);
                            this.compiledTemplates["partials/"+partialName] = compiledTemplate;
                            cb(null);
                        }.bind(this));
                    }.bind(this),
                    function(err){
                        this.partialsLoaded = true;
                        this.partialsLoading = false;
                        this.emit("partialsLoaded");
                    }.bind(this))
                }.bind(this),
                error:function(){
                    throw new Error("Can't load partials.json");
                }
            })
            return;
        }

        if(this.partialsLoading){
            this.on("partialsLoaded", function(){
                compileFunction();
            }.bind(this))
        }
        else{
            compileFunction();
        }

    }

    initBgTemplatePart(){
        this.templates = {};
        // load templates
        extension.onMessage("getTemplate", function(datas, cb){
            var template = datas.template;

            if(this.templates[template] != undefined){
                cb(this.templates[template]);
                return;
            }
            else{
                $.ajax({
                    url : extension.extension.getURL("assets/templates/"+template+".tpl"),
                    type : "html",
                    success : function(tpl){
                        this.templates[template] = tpl;
                        cb(tpl);
                    }.bind(this),
                    error : function(){
                        cb(false)
                    }
                })
            }
            return true;
        }.bind(this));
    }

    uploadImage(textarea, img, upload, width){
        var id = Object.size(this.imgUploading)+1;
        this.imgUploading[id] = new ImgUploading({
            img : img,
            onProgress: null,
            onFinish:null,
            textarea:textarea,
            upload:upload,
            $container:$('[plugin-role="image_upload_container"]'),
            id:id,
            width:width
        }); 
    }

    bbcodeSupported(bbcodeName, formType){
        for(var bbcode of this.BBcodes){
            if(bbcode.name == bbcodeName && $.inArray(formType, bbcode.not_supported) < 0){
                return true;
            }
        }
        return false;
    }

    constructor(){
        super();
        this.imgUploading = {};

        this.registerUniqEvent("partialsLoaded");

        //parse context 
        if(document.location.pathname.match(/_generated_background_page.html/)){
            this.context = "background";
        }
        else if(document.location.pathname.match(/popup.html/)){
            this.context = "popup";
        }
        else{
            this.context = "content";
        }

        if(this.context == "content"){
            self = this;

            //update theme on init
            extension.getStorage('settings', function(value){
                self.setTheme(value.settings.theme, "theme_css");
                self.setTheme(value.settings.emoticone_theme, "emoticone_theme_css");
            }, true);

            var dlbs_plugin_init = function dlbs_plugin_init(options){
                //this function is injected, don't use vars not in the window
                var extensionId = options.extensionId;

                lang = options.lang;

                //add listener to check tipsy
                window.onmessage = function(request) {
                    if (request.data.event == "recheckTipsy"){
                        $('.reward_tipsy').tipsy({
                            gravity: 'n',
                            opacity: 1
                        });
                        $('.like_tipsy').tipsy({
                            gravity: 'n',
                            opacity: 1
                        });
                        $('.pinned_hide').tipsy({
                            gravity: 'w',
                            opacity: 1
                        });
                        $('.pinned_explain').tipsy({
                            gravity: 'n',
                            opacity: 1
                        });
                        $('.vote_button_pinned_up').tipsy({
                            gravity: 'e',
                            opacity: 1
                        });
                        $('.vote_button_pinned_down').tipsy({
                            gravity: 'e',
                            opacity: 1
                        });
                    }
                }

                $("form").each(function(){
                    //check if this form is supported
                    var formType = null;

                    for(var name in options.forms_matches){
                        if (this.name.match(new RegExp(options.forms_matches[name],"g")))
                            formType = name;
                    }

                    if(null == formType)
                        return;

                    //continue with supported forms
                    formError = function(error, event){
                        // event.stopPropagation();
                        $('.spinner_validate').hide(0);
                        console.error(error);
                        alert(error);
                    }
                    
                    //remove validate listener
                    submit_btn = $(this).find(".validate_comment, .validate_button_form");
                    if(submit_btn.length==0)
                        console.error("submit button not found, design change ?");

                    submit_btn.get(0)._onclick = submit_btn.get(0).onclick;
                    submit_btn.attr("onclick", null); 
                    submit_btn.off();

                    submit_btn.on("click", function(event, overrideDisabled){
                        if(this.disabled && !overrideDisabled)
                            return;
                        this.disabled = true;
                        $(this).find(".spinner_validate").show(0);

                        event.stopPropagation();
                        $form = $(this).parents("form");
                        $textarea = $form.find('[name="post_content"]');

                        chrome.runtime.sendMessage(extensionId,{
                                "event":"content-parse_emoticons", 
                                "datas" : {
                                    "text":$textarea.val(),
                                    "formType":formType
                                }
                            },
                            function(response){
                                if(response == undefined){
                                    response = {
                                        success : false,
                                        error : "error with extension"
                                    }
                                }
                                this.disabled = false;
                                if(response.success){
                                    $textarea.val(response.text);
                                    $(this).find(".spinner_validate").hide(0);
                                    //execute normal process
                                    this._onclick();
                                }
                                else if (response.retry){
                                    submit_btn.trigger("click", {overrideDisabled:true});
                                    return;
                                }
                                else{
                                    formError(response.error);
                                    return false;
                                }
                            }.bind(this)
                        );
                    });
                });
            }
            this.injectScript(dlbs_plugin_init);
            $(function(){
                var options = {
                    extensionId : chrome.runtime.id,
                    forms_matches : {
                        "new_comment" : "^comment_form",
                        "edit_comment" : "formedit_[0-9]+",
                        "new_MP" : "new_MP_form",
                        "reply_MP" : "reply_MP_form_[0-9+]",
                        "add_thread" : "add_thread_form",
                        "new_deal" : "add_deal_form"
                    },
                    lang: {
                        preview : extension._("preview")
                    }
                }

                self.injectCss(extension.extension.getURL("assets/css/noty.css"), "lib_css", true);
                Noty.overrideDefaults({
                    layout   : 'bottomRight',
                    theme    : 'relax',
                    type     : 'success',
                    closeWith: ['click', 'button'],
                    progressBar: true,
                    timeout: 5000
                }); 
                
                self.injectScript("$(function(){\n\
                    var options =  JSON.parse('"+JSON.stringify(options).replace(/'/g, "&#39;")+"');\n\
                    dlbs_plugin_init(options)\n\
                })");

                self.changeClassForSmileyAddByPlugin();

                //add the listener for the emoticons
                $(document).on("click", '[data-role="plugin_emoticone_add"]', function(){
                    var $textarea = $(this).parents("form").find("textarea");
                    if ($textarea.length > 0) {
                        var textarea = $textarea.get(0);
                    }
                    else{
                        return;
                    }

                    var nom = this.getElementsByTagName('img')[0].getAttribute("title");
                    self.pushTextInSelection(":" + nom + ":" ,textarea);
                })

                var tabIndex = 1;
                //add functions to forms
                $("form").each(function(){
                    //check if this form is supported
                    var formType = null;

                    for(var name in options.forms_matches){
                        if (this.name.match(new RegExp(options.forms_matches[name],"g")))
                            formType = name;
                    }

                    if(null == formType)
                        return;


                    //add formType for other uses
                    $(this).data("plugin-formType", formType);

                    //add image container
                    self.getTemplate("UI/imageWaitingUploadContainer", function(tpl){
                        if(formType != "reply_MP" && formType != "new_MP"){
                            $(this).find(".validate_form").before(tpl());
                        }
                        else{
                            $(this).find("> .input_left").after(tpl());
                        }
                    }.bind(this));

                    //check if emoticons work on this field
                    var smileys_supported = false;
                    for(var bbcode of self.BBcodes){
                        if(bbcode.name == "img" && $.inArray(formType, bbcode.not_supported) < 0){
                            smileys_supported = true
                            break;
                        }
                    }
                    if(smileys_supported){
                        //add the emoticons in the emoticons list
                        $(this).find(".emoji-content, .third_part_button").each(function(index, value) {
                            var $this = $(this);
                            for (var title in settingsManager.smileys){
                                var emoticon = document.createElement("a");
                                emoticon.href = "javascript:;";
                                emoticon.setAttribute("style", 'text-decoration:none');
                                emoticon.dataset.role = "plugin_emoticone_add";
                                emoticon.innerHTML = '<img style="max-height:20px" title="' + title + '" src="' + settingsManager.smileys[title] + '" alt="' + title + '"/>';
                                $this.append(emoticon)
                            }
                        });
                    }

                    var textarea = $(this).find("textarea").attr("tabindex", tabIndex++);


                    var submit_btn = $(this).find(".validate_comment, .validate_button_form");
                    submit_btn.attr("tabindex",tabIndex++);
                    //generate the preview button
                    var clone = $(submit_btn)
                        .clone(false)
                        .attr('onclick', null)
                        .clone(false)
                        .data("preview_type", formType)
                        .attr('accesskey', 'p')
                        .attr("tabindex", ""+(parseInt(tabIndex++)))
                        .css("margin-left", "20px")
                        .text(extension._("preview"));

                    clone.on("click", function(){
                        var $putContainer, func;
                        var vars = {}; 
                        var userData = $('#open_member_parameters');
                        var formType = $(this).data("preview_type");


                        vars.navigator = extension.getNavigator();
                        vars.plugin_url = extension.getPluginUrl();
                        switch(formType){
                            case "add_thread":
                            case "new_deal":
                            case "new_comment":
                            case "edit_comment":
                            case "new_MP":
                            case "reply_MP":
                                vars.userlink = $("#member_parameters a:first").attr('href')
                                vars.useravatar = userData.find('img').attr('src')
                                vars.username = $("#member_parameters a:first").text()
                                vars.commentaire = self._nl2br($(this).parents("form").find("textarea").val());
                            break;
                        }
                        switch(formType){
                            case "new_comment":
                                $putContainer = $('#comment_contener');
                                func = "append";
                            break;
                            case "edit_comment":
                                $putContainer = $(this).parents('.padding_comment_contener');
                                func = "before";
                            break;
                            case "new_deal":
                                $putContainer = $("body > div.structure")
                                func = "before";

                                //add vars
                                var $form = $(this).parents("form");
                                vars.expiredate = null;
                                vars.localisation = null;
                                //get deal_type
                                vars.deal_type = parseInt($("#type_deal").val())
                                switch(vars.deal_type){
                                    case 1:
                                        vars.deal_type_name = extension._("Deals"); 
                                    break;
                                    case 2:                                  
                                        vars.deal_type_name = extension._("Vouchers"); 
                                    break;
                                    case 3:
                                        vars.deal_type_name = extension._("Freebies");
                                    break;
                                }
                                //get cat
                                vars.cat = $('[name="category"]').find(":selected").text();
                                vars.sub_cat = $('[name="subcategory"]').find(":selected").text();
                                //get img
                                vars.deal_img = $("#image_deal").attr("src");
                                vars.title = $form.find('[name="title"]').val();
                                vars.storename = $form.find('[name="merchant"]').val();
                                vars.deal_url = $form.find('[name="url"]').val();
                                vars.shipping_cost = $form.find('[name="shipping_cost"]').val();
                                if(vars.deal_type == 3){
                                    vars.price = extension._("Free");
                                }
                                else if(vars.deal_type == 2){
                                    vars.price = $form.find('[name="discount"]').val();
                                    switch($form.find('[name="discount_type"]').val().toLowerCase()){
                                        case "percent":
                                            vars.price += "%";
                                        break;
                                        case "euro":
                                            vars.price += "€";
                                        break;
                                        case "port gratuit":
                                            vars.price = extension._("free delivery");
                                            vars.shipping_cost = "";
                                        break;
                                    }
                                }
                                else{
                                    var price = parseInt($form.find('[name="price"]').val()) || 0;
                                    vars.price = price+"€";
                                }
                                vars.original_cost = $form.find('[name="original_cost"]').val();
                                if(vars.original_cost != "" && price > 0 ){
                                    var original_cost = parseInt(vars.original_cost);
                                    if(original_cost > 0){
                                        vars.percent_reduc = Math.round((100-(price*100/original_cost))*-10)/10;
                                        if(vars.percent_reduc > 0)
                                            vars.percent_reduc = "+"+vars.percent_reduc;
                                    }
                                    vars.original_cost = original_cost+"€";
                                }


                                if(vars.shipping_cost != ""){
                                    vars.shipping_cost = parseInt(vars.shipping_cost)==0?extension._("free"):vars.shipping_cost+"€";
                                }

                                if(vars.deal_type != 1){
                                    //remove original_cost percent and shipping
                                    vars.original_cost = null;
                                    vars.percent_reduc = null;
                                    vars.shipping_cost = null;
                                }
                                vars.instore = $form.find('[name="online_status"]').val()=="instore";
                                if(vars.instore){
                                    vars.localisation = $("#name_select_region").text();
                                }
                                else{
                                    vars.localisation = $form.find('[name="foreign_country"]').val();
                                }
                                vars.voucher_code = $form.find('[name="code"]').val();
                                vars.start_date = $form.find('[name="start_date"]').val();
                                vars.expiry_date = $form.find('[name="expiry_date"]').val();

                                //convert french date to date
                                if(vars.start_date != undefined){
                                    var start_date=vars.start_date.split("/");
                                    start_date=new Date(start_date[1]+"/"+start_date[0]+"/"+start_date[2]);
                                }
                                else
                                    start_date = new Date(0);
                                if(vars.expiry_date != undefined){
                                    //convert french date to date
                                    var expiry_date=vars.expiry_date.split("/");
                                    expiry_date=new Date(expiry_date[1]+"/"+expiry_date[0]+"/"+expiry_date[2]);
                                }
                                else
                                    expiry_date = new Date(0);
                                vars.add_calendar = (start_date > (new Date())) || (expiry_date > (new Date())); 

                                //add the addon element
                                if(!isNaN(start_date.getTime()) && start_date.getTime() == expiry_date.getTime()){
                                    vars.addon_element = extension._("only the");
                                }
                                else if(start_date > new Date()){
                                    vars.addon_element = extension._("start the");
                                }
                                if(vars.addon_element != undefined && vars.addon_element != "")
                                    vars.addon_element +=  " " + ('0' + (start_date.getDate())).slice(-2) + "/" + ('0' + (start_date.getMonth()+1)).slice(-2)

                                self.injectCss("https://static.dealabs.com/css/detail_page.css?20170516", "preview_css", true);
                            break;
                            case "add_thread":
                                $putContainer = $('body > div.structure');
                                func = "before";

                                $form =  $(this).parents("form");
                                //add vars
                                vars.title = $form.find('[name="post_title"]').val();

                                vars.cat = $form.find('[name="forum_id"]').find(":checked").text();
                                vars.sub_cat = $form.find('[name="subforum_id"]').find(":checked").text();

                                self.injectCss("https://static.dealabs.com/css/detail_page.css?20170516", "preview_css", true);
                            break;
                            case "new_MP":
                                $putContainer = $('#all_contener_content_messagerie');
                                func = "before";

                                //add vars
                                vars.title = $(this).parents("form").find('[name="thread_subject"]').val();
                                vars.attachment = basename($(this).parents("form").find('[name="post_attachment"]').val()) || null;
                            break;
                            case "reply_MP":
                                $putContainer = $('#all_contener_messagerie > .content_profil_messagerie:first()');
                                func = "append";
                                vars.attachment = basename($(this).parents("form").find('[name="post_attachment"]').val()) || null;
                            break;
                            default:
                                debugger;
                            break;
                        }

                        self.generateTemplate(formType, function(commentContainer){
                            var cb = function(){
                                //redo check
                                self.changeClassForSmileyAddByPlugin();
                                self.reCheckQuotes();
                                self.checkEmbedInPreview();
                                // extension.sendMessage("recheckTipsy");
                                window.postMessage({"event":"recheckTipsy"}, "*");
                            }

                            var $previewContainer = $('[data-userscript="comment_container"]');
                            var $content;
                            if ($previewContainer.length > 0) {
                                $previewContainer.slideUp({
                                    "duration":500,
                                    "always":function(){
                                        $(this).remove();
                                        $content = $(self.generatePreview(commentContainer, vars, formType));
                                        $content.hide(0);
                                        $putContainer[func]($content);
                                        $content.slideDown(500, cb);
                                    }
                                })    
                            }
                            else {
                                $content = $(self.generatePreview(commentContainer, vars, formType));
                                $content.hide(0)
                                $putContainer[func]($content);
                                $content.slideDown(500, cb);
                            }
                        });
                    });

                    $(submit_btn).after(clone);
                });

                //override spoiler
                $('body').on('click', '[data-userscript="comment_container"] .click_div_spoiler', function(e) {
                    if ($(this).next().is(":hidden")) {
                        $(this).parents(".quote").last().children('.quote_message').css('max-height', 'none')
                    }
                    $(this).next().slideToggle("fast", function() {
                        if ($(this).is(":hidden")) {
                            $(this).parent().children('.click_div_spoiler').html('Ce message a été masqué par son auteur. Cliquez pour l’afficher.')
                        } else {
                            $(this).parent().children('.click_div_spoiler').html('Contenu du message :')
                        }
                    })
                });

                //override long quote
                $('body').on('click', '[data-userscript="comment_container"] div.quote > div.quote_pseudo > p.pseudo_tag > a.open', function(e) {
                    var quote_height_max = parseInt($(".quote_message").css("max-height"), 10);
                    var current_height = $(this).parents(".quote").children('.quote_message').height();
                    if (current_height <= quote_height_max) {
                        $(this).parents(".quote").children('.quote_message').css('max-height', 'none');
                        $(this).text("Masquer la citation")
                    } else {
                        $(this).parents(".quote").children('.quote_message').css('max-height', quote_height_max + 'px');
                        $(this).text("Afficher l'intégralité de la citation")
                    }
                });


                //init embedManager
                self.EmbedLinksManager = new Embed($('a.link_a_reduce'));

                //add hour in body for styling
                var updateHourBody = function(){
                    $("body").addClass("plugin-hour-"+(new Date().getHours()));
                    //relaunch for the next hour
                    setTimeout(this, 3600000 - new Date().getTime() % 3600000);
                }();

                //add menu for sound, and menu for blacklist
                var linkInfos, blacklist, blacklisted, notifications_with_sound
                if(linkInfos = location.pathname.match(/^\/([^\/]+)\/.*\/([0-9]+)$/)){
                    self.getTemplate("UI/yes_no", function(tpl){
                        blacklisted =  (typeof settingsManager.blacklist[linkInfos[1]+'-'+linkInfos[2]] != "undefined");
                        $('#bloc_option .bloc_option_white').prepend(tpl({
                            link_info: linkInfos[1]+'-'+linkInfos[2],
                            role: "blacklist-notification",
                            yes: blacklisted,
                            title: extension._("blacklist notifications"),
                            description: extension._("blacklist notifications from this thread")
                        }))
                    }.bind(this));

                    $(document).on('click', '[data-plugin-role="blacklist-notification"]', function(e){
                        e.preventDefault();
                        e.stopPropagation();
                        blacklist = settingsManager.blacklist
                        if($(this).find('.yes').length == 0){// => is not already blacklisted
                            blacklist[$(this).data('plugin-link-info')] = true;
                        }
                        else{
                            delete blacklist[$(this).data('plugin-link-info')];
                        }

                        settingsManager._updateCb = function(){
                            extension.sendMessage('update_settings', {});
                            settingsManager._updateCb = null;
                        }
                        settingsManager.blacklist = blacklist;
                        
                        self.getTemplate("partials/yes_no", function(tpl){
                            blacklisted = (typeof settingsManager.blacklist[$(this).data('plugin-link-info')] != "undefined");
                            $(this).html(tpl({yes:blacklisted}));
                        }.bind(this));

                        return false;
                    });

                    self.getTemplate("UI/yes_no", function(tpl){
                        notifications_with_sound =  (typeof settingsManager.notifications_with_sound[linkInfos[1]+'-'+linkInfos[2]] != "undefined");
                        $('#bloc_option .bloc_option_white').prepend(tpl({
                            link_info: linkInfos[1]+'-'+linkInfos[2],
                            role: "sounded-notification",
                            yes: notifications_with_sound,
                            title: extension._("play sound"),
                            description: extension._("play a sound when you get a new notification for this thread")
                        }))
                    });
                    // $('#bloc_option .bloc_option_white').prepend('\
                    //     <div class="button_part">\
                    //         <div class="bouton_contener_border" data-plugin-link-info="'+linkInfos[1]+'-'+linkInfos[2]+'" id="plugin-sounded-notification">\
                    //             <div class="yes_part '+(notifications_with_sound?'yes':'')+'"></div>\
                    //             <div class="no_part '+(notifications_with_sound?'':'no')+'"></div>\
                    //         </div>\
                    //     </div>\
                    //     <div class="title_button_part">\
                    //         <p>Jouer un son</p>\
                    //         <p>Jouer un son lors d\'une nouvelle réponse</p>\
                    //     </div>\
                    // ');

                    $(document).on('click', '[data-plugin-role="sounded-notification"]', function(e){
                        e.preventDefault();
                        e.stopPropagation();
                        notifications_with_sound = settingsManager.notifications_with_sound
                        if($(this).find('.yes').length == 0){// => is not already notifications_with_sound
                            notifications_with_sound[$(this).data('plugin-link-info')] = true;
                        }
                        else{
                            delete notifications_with_sound[$(this).data('plugin-link-info')];
                        }

                        settingsManager._updateCb = function(){
                            extension.sendMessage('update_settings', {});
                            settingsManager._updateCb = null;
                        }
                        settingsManager.notifications_with_sound = notifications_with_sound;
                        
                        self.getTemplate("partials/yes_no", function(tpl){
                            notifications_with_sound = (typeof settingsManager.notifications_with_sound[$(this).data('plugin-link-info')] != "undefined");
                            $(this).html(tpl({yes:notifications_with_sound}));
                        }.bind(this));
                        return false;
                    });
                }

                //add listener for critical errors from background or popup
                extension.onMessage("criticalError",function(datas, cb){
                    new Noty({
                        text:datas.message,
                        type:"error",
                        timeout:false
                    }).show();
                } ,true)

                //dropzone for image
                $(document).on('paste drop', 'textarea', function(e){
                    var reUpload = e.ctrlKey;
                    var is_image, items, src;

                    if(e.type == "paste"){
                        items = (e.clipboardData || e.originalEvent.clipboardData).items;
                    }
                    else if(e.type == "drop"){
                        e.stopPropagation();
                        e.preventDefault();
                        
                        items = (e.dataTransfer || e.originalEvent.dataTransfer).items;
                    }
                    else{
                        new Noty({
                            text:extension._("unknown event type : $type$", e.type),
                            type:"error",
                            timeout:false
                        });
                    }

                    for (let item of items) {
                        if (item.type != undefined && item.type.indexOf("image") !== -1) {
                            var blob = item.getAsFile(); 
                            self.uploadImage(this, blob, true);
                        }
                        if (item.kind === "string"){
                            item.getAsString(function(str) {
                                try{
                                    is_image = $(str).is('img');
                                }
                                catch(e){
                                    is_image = false;
                                }

                                if(is_image){
                                    var img = $(str)
                                    var width = img.get(0).naturalWidth;
                                    src = img.attr('src');

                                    if(src != undefined){
                                        if(isDataURL(src)){
                                            fetch(src)
                                            .then(res => res.blob())
                                            .then(blob => self.uploadImage(this, blob, true))
                                        }
                                        else{
                                            self.uploadImage(this, src, reUpload, width);
                                        }
                                    }
                                }
                            }.bind(this));
                        }
                    }
                })

                //add listener for image wait upload
                extension.onMessage("waitImgUpload", function(datas, cb){
                    var ids = datas.ids;
                    var functions = [];
                    Noty.setMaxVisible(10, 'imgWait');
                    for(let id of ids){
                        var c_id = id[1];
                        if(this.imgUploading[c_id] != undefined){
                            var uploadInProgressNotification = new Noty({
                                                                    type: 'warning',
                                                                    text: extension._('an image is uploading you\'r form will be automatically send after')+' <img src="https://static.dealabs.com/images/smiley/emoji_smiling.png" width="auto" height="auto" alt=":)" title=":)" class="bbcode_smiley">',
                                                                    timeout:false,
                                                                    queue:"imgWait"
                                                                }).show();
                            functions.push(function(callback){
                                    this.obj.imgUploading[this.c_id].on("finish", function(){
                                        uploadInProgressNotification.close();
                                        callback(null);
                                    }.bind(this.obj))
                                }.bind({obj:this,c_id:c_id})
                            );
                        }
                        else{
                            new Noty({
                                type: 'error',
                                text: extension._('unknown error'),
                                timeout:false,
                                queue:"imgWait"
                            }).show();
                        }
                    }
                    async.parallel(functions, function(){
                        cb();
                    }.bind(this));
                    return true;
                }.bind(self), true)

                //add listener to link account with imgur
                $(document).on("click", '[data-plugin-role="ask_for_imgur_token"]', function(){
                    imgurManager.askForToken();
                })

                //add listener to refresh informations about imgur
                $(document).on("click", '[data-plugin-role="refresh"]', function(){
                    extension.sendMessage("updateImgurStatus", {}, function(response){
                        if(response == undefined)
                            response = {success:false,error:extension._("unknown error")};

                        if(response.success){
                            new Noty({
                                text:extension._("imgur status up to date")
                            }).show();
                            updateImgurConnectionStatus(response.status);
                        }
                        else{
                            new Noty({
                                type:"error",
                                killer:true,
                                text:response.error
                            }).show();
                        }
                    });
                })

                //add informations about imgur
                function updateImgurConnectionStatus(status){
                    // console.log(settingsManager.show_imgur_connection_under_form);
                    if(!settingsManager.show_imgur_connection_under_form && self._getParameterByName('what', location.href) != "plugin")
                        return;

                    var cb = function(response){
                        self.getTemplate("UI/imgurStatus", function(tpl){

                            //if no image container return or not in settings page(here to delay a little)
                            if($('[plugin-role="image_upload_container"]').length == 0)
                                return;

                            $('[data-plugin-role="imgurStatus"]').remove();
                            $('[plugin-role="image_upload_container"]').prepend(tpl({
                                status: response.status,
                                time : (response.lastTime!=null)?moment.unix(response.lastTime/1000).fromNow():extension._("never")
                            }));
                            //if we found one status
                            
                            //relaunch in 30 seconds
                            setTimeout(updateImgurConnectionStatus, 1000*30);
                        })
                    }

                    if(status == undefined){
                        extension.sendMessage("getImgurStatus", {}, function(response){
                            cb(response);
                        })
                    }
                    else{
                        cb(status);
                    }
                }
                updateImgurConnectionStatus();

                //settings
                if (self._getParameterByName('tab', location.href) == "settings") {
                    self.generateSettingsPage();
                    self.initSettingsPageListeners();
                }

                self.ImgUploadQueue = async.queue(function(task, cb){
                    // console.log("start task "+task.id);
                    var cbFunction = function(...args){
                        task.obj.off("finish", cbFunction);
                        cb(...args);
                    }
                    task.obj.on("finish", cbFunction);
                    task.obj.uploadImg(task.obj.options.img, null);
                },3);

                self.ImgUploadQueue.error = function(error, task){
                    if(this._stopNotified)
                        return
                    else
                        this._stopNotified = true;

                    this.pause();

                    this._stopNotification = new Noty({
                        type:"error",
                        text:extension._("An error appear, so we stopped the queue, resolve the error and resume"),
                        timeout:false,
                        buttons: [
                            Noty.button(extension._("resume"), 'noty-button', function () {
                                this.queue._stopNotification.close();
                                this.queue.resume();
                            }.bind({queue:this}))
                        ]
                    }).show()
                }.bind(self.ImgUploadQueue);
            })
        }
        else if(this.context == "background"){
            this.initBgTemplatePart();
            this.initBGListeners();
        }

        ////////////////
        // RESSOURCES //
        ////////////////
        this.BBcodes = [
            {
              regex : /\[img size="?([0-9]*)px"?\]([^\]]*)\[\/img\]/gi,
              html : '<img alt="" class="BBcode_image" onclick="window.open(this.src);" style="max-width:$1px;" src="$2">',
              name : 'img',
              not_supported : [
                "new_deal"
              ]
            },
            {
              regex : /\[img size="?([0-9]*)"?\]([^\]]*)\[\/img\]/gi,
              html : '<img alt="" class="BBcode_image" onclick="window.open(this.src);" style="max-width:$1px;" src="$2">',
              name : 'img',
              not_supported : [
                "new_deal"
              ]
            },
            {
              regex : /\[img\s*\]([^\]]*)\[\/img\]/gi,
              html : '<img alt="" class="BBcode_image" onclick="window.open(this.src);" style="max-width:300px;" src="$1">',
              name : 'img',
              not_supported : [
                "new_deal"
              ]
            },
            {
              regex : /\[citer pseudo="?([^"^\]]*)"?\]/gi,
              html : '<div class="quote">\
              <div class="quote_pseudo text_color_777777">\
                  <p class="pseudo_tag">\
                      <span class="text_color_333333">$1</span><span> a écrit</span><a href="javascript:;" class="open text_color_777777">Afficher l\'intégralité de la citation</a>\
                  </p>\
              </div>\
              <div class="quote_message text_color_777777">',
              name : 'quote_start',
              not_supported : [
                "new_deal",
                "add_thread",
                "new_MP",
                "reply_MP"
              ]
            },
            {
              regex : /\[citer\s*\]/gi,
              html : '<div class="quote">\
              <div class="quote_pseudo text_color_777777">\
                  <p class="pseudo_tag">\
                      <span class="text_color_333333">Quelqu\'un</span><span> a écrit</span><a href="javascript:;" class="open text_color_777777">Afficher l\'intégralité de la citation</a>\
                  </p>\
              </div>\
              <div class="quote_message text_color_777777">',
              name : 'quote_start',
              not_supported : [
                "new_deal",
                "add_thread",
                "new_MP",
                "reply_MP"
              ]
            },
            {
              regex : /\[\/citer\]/gi,
              html : '</div></div>',
              name : 'quote_end',
              not_supported : [
                "new_deal",
                "add_thread",
                "new_MP",
                "reply_MP"
              ]
            },
            {
              regex : /\[spoiler\s*\]/gi,
              html : '<div class="spoiler">\
                    <a href="javascript:;" class="click_div_spoiler text_color_333333">Ce message a été masqué par son auteur. Cliquez pour l’afficher.</a>\
                    <div class="spoiler_hide text_color_777777" style="display: none;">',
              name : 'spoil_start',
              not_supported : [
                "new_deal",
                "new_MP",
                "reply_MP"
              ]
            },
            {
              regex : /\[\/spoiler\]/gi,
              html : '</div></div>',
              name : 'spoil_end',
              not_supported : [
                "new_deal",
                "new_MP",
                "reply_MP"
              ]
            },
            {
              regex : /\[b\]/gi,
              html : '<b>',
              name : 'b_start'
            },
            {
              regex : /\[\/b\]/gi,
              html : '</b>',
              name : 'b_end'
            },
            {
              regex : /\[i\]/gi,
              html : '<i>',
              name : 'i_start'
            },
            {
              regex : /\[\/i\]/gi,
              html : '</i>',
              name : 'i_end'
            },
            {
              regex : /\[u\]/gi,
              html : '<u>',
              name : 'u_start'
            },
            {
              regex : /\[\/u\]/gi,
              html : '</u>',
              name : 'u_end'
            },
            {
              regex : /\[s\]/gi,
              html : '<del>',
              name : 'del_start'
            },
            {
              regex : /\[\/s\]/gi,
              html : '</del>',
              name : 'del_end'
            },
            {
              regex : /\[up\]/gi,
              html : '<font style="font-size:1.2em;">',
              name : 'up_start',
              not_supported : [
                "new_comment",
                "edit_comment",
                "new_MP",
                "reply_MP"
              ]
            },
            {
              regex : /\[\/up\]/gi,
              html : '</font>',
              name : 'up_end',
              not_supported : [
                "new_comment",
                "edit_comment",
                "new_MP",
                "reply_MP"
              ]
            }
        ];

        this.BBcodesSmiley = [ //pensive is used in http link, need to be first
            {
             "icon" : "emoji_pensive",
             "name" : "pensive",
             "smiley" : ":/" 
            },
            {
             "icon" : "emoji_happy_sweat", //happy sweat need to be before zipper_mouth
             "name" : "happy_sweat", //happy sweat need to be before zipper_mouth
             "smiley" : "(:|"
            },
            {
             "icon" : "emoji_zipper_mouth",
             "name" : "zipper_mouth",
             "smiley" : ":|"
            },
            {
             "icon" : "emoji_smiling",
             "name" : "smiling",
             "smiley" : ":)"
            },
            {
             "icon" : "emoji_wink",
             "name" : "wink",
             "smiley" : ";)"
            },
            {
             "icon" : "emoji_sad",
             "name" : "sad",
             "smiley" : ":("
            },
            {
             "icon" : "emoi_happy",
             "name" : "happy",
             "smiley" : ":D"
            },
            {
             "icon" : "emoji_astonished",
             "name" : "astonished",
             "smiley" : ":o"
            },
            {
             "icon" : "emoji_grinning",
             "name" : "grinning",
             "smiley" : "^^"
            },
            {
             "icon" : "emoji_sunglasses",
             "name" : "sunglasses",
             "smiley" : "B)"
            },
            {
             "icon" : "emoji_sad_sweat",
             "name" : "sad_sweat",
             "smiley" : "-_-'"
            },
            {
             "icon" : "emoji_confounded",
             "name" : "confounded",
             "smiley" : "xS"
            },
            {
             "icon" : "emoji_crazy",
             "name" : "crazy",
             "smiley" : ":P"
            },
            {
             "icon" : "emoji_disgusted",
             "name" : "disgusted",
             "smiley" : ":S"
            },
            {
             "icon" : "emoji_laughing_tears",
             "name" : "laughing_tears",
             "smiley" : "xD"
            },
            {
             "icon" : "emoji_loudly_crying",
             "name" : "loudly_crying",
             "smiley" : ":'("
            },
            {
             "icon" : "emoji_devil",
             "name" : "devil",
             "smiley" : "':)"
            },
            {
             "icon" : "emoji_heart_eyes",
             "name" : "heart_eyes",
             "smiley" : ":3"
            },
            {
             "icon" : "emoji_nerd",
             "name" : "nerd",
             "smiley" : "|D"
            },
            {
             "icon" : "emoji_redface",
             "name" : "redface",
             "smiley" : "|o"
            },
            {
             "icon" : "emoji_smart",
             "name" : "smart",
             "smiley" : ":{"
            },
            {
             "icon" : "emoji_fierced",
             "name" : "fierced",
             "smiley" : "(fierce)"
            },
            {
             "icon" : "emoji_creep",
             "name" : "creep",
             "smiley" : "(creep)"
            },
            {
             "icon" : "emoji_ninja",
             "name" : "ninja",
             "smiley" : "(ninja)"
            },
            {
             "icon" : "emoji_popcorn",
             "name" : "popcorn",
             "smiley" : "(popcorn)"
            },
            {
             "icon" : "emoji_thumbs_up",
             "name" : "thumbs_up",
             "smiley" : "(like)"
            },
            {
             "icon" : "emoji_angel",
             "name" : "angel",
             "smiley" : "(angel)"
            },
            {
             "icon" : "emoji_raised_hand",
             "name" : "raised_hand",
             "smiley" : "(highfive)"
            },
            {
             "icon" : "emoji_shocked",
             "name" : "shocked",
             "smiley" : "(shock)"
            }
        ];
    }
    
}


class ImgUploading extends EventEmitter{
    // afterFinish(cb){
    //     if(this.isFinished())
    //         cb();
    //     else
    //         this.on("finish", cb);
    // }

    isFinished(){
        return this._isFinish;
    }

    addPlaceHolder(){
        dealabs.pushTextInSelection('[img_wait_upload:'+this.id+']', this.textarea);
    }

    replacePlaceHolderByBBcode(url, imgWidth, formType){
        imgWidth = imgWidth || null;
        formType = formType || "";
        if(imgWidth == null){
            if(this.$htmlPlaceholder != null && this.$htmlPlaceholder.length > 0){
                imgWidth = this.$htmlPlaceholder.find("img").get(0).naturalWidth
            }
            else{
                imgWidth = 300;
            }
        }

        if(url != null && dealabs.bbcodeSupported("img", formType))
            var replacement = '[img size='+imgWidth+'px]'+url+'[/img]';
        else if(url != null){
            var replacement = url;
            new Noty({
                text: extension._("this form doesn't support img tag, so we just add a link")
            }).show();
        }
        else
            var replacement = '';

        var oldValue = $(this.textarea).val();
        var newValue = oldValue.replace(new RegExp('\\[img_wait_upload:'+this.id+'\\]'), replacement);
        $(this.textarea).val(newValue);
    }

    addHtmlPlaceHolder($container, imageUrl, cb){
        dealabs.getTemplate("UI/imageUploading", function(tpl){
            this.$htmlPlaceholder = $(tpl({
                id : this.id,
                imageSrc : imageUrl
            }));

            //add events
            this.$htmlPlaceholder.on("progress", function(evt, datas){
                var percentComplete = datas.percentComplete;
                $(this).find(".float_loader")
                    .css("opacity", percentComplete/100);

                $(this).find(".hover_text")
                    .text(percentComplete+"%");
            })

            this.$htmlPlaceholder.on("img_upload_error", function(){
                $(this).addClass("error");
                $(this).find(".float_loader")
                    .css("opacity", 1);

                $(this).find(".hover_text").text(extension._("error"));
            })
            
            $container.append(this.$htmlPlaceholder);
            cb();
        }.bind(this))
    }

    uploadImg(img, imgName){
        imgurManager.sendImage(
            img,
            function(...args){
                this.emit("finish",...args);
            }.bind(this),
            imgName,
            function(...args){
                this.emit("progress",...args);
            }.bind(this)
        );
    }

    destroy(){
        this.replacePlaceHolderByBBcode(null);
        if(this.$htmlPlaceholder != null){
            this.$htmlPlaceholder.remove();
        }   
    }

    finish(error, link, width){
        if(null == error){
            this.replacePlaceHolderByBBcode(link, width, this.formType);
            this.destroy();
        }
        else{
            this.$htmlPlaceholder.trigger("img_upload_error", {err:error});
            this.errorNotification = new Noty({
                                        text:error,
                                        type:"error",
                                        timeout:false,
                                        queue:"imgUploading",
                                        buttons: [
                                            Noty.button(extension._("abort"), 'noty-button', function () {
                                                // console.log('button 2 clicked');
                                                this.destroy();
                                                this.errorNotification.close();
                                            }.bind(this)),
                                            Noty.button(extension._("retry"), 'noty-button', function () {
                                                this.$htmlPlaceholder.removeClass("error");
                                                this.$htmlPlaceholder.trigger("progress", {percentComplete:0});
                                                dealabs.ImgUploadQueue.push({id: this.id, obj:this});
                                                this.errorNotification.close();                                                
                                            }.bind(this))
                                          ]
                                    }).show();
        }
    }

    progress(evt){
      if (evt.lengthComputable) {
        var percentComplete = evt.loaded / evt.total;
        this.$htmlPlaceholder.trigger("progress", {
            percentComplete:Math.round(percentComplete * 100)
        });
      }
    }

    constructor(pOptions){

        //init eventEmitter
        super();

        //register the finish event
        this.registerUniqEvent("finish");

        this.$htmlPlaceholder = null;
        this._isFinish = false;

        var defaultOption = {
            img : null,
            onProgress: null,
            onFinish:null,
            textarea:null,
            upload:null,
            $container:null,
            width:null,
            id:0
        }
 
        var pOptions = $.extend(defaultOption, pOptions);

        if(pOptions.onProgress != null){
            this.on("progress", pOptions.onProgress);
            delete pOptions.onProgress;
        }
        
        if(pOptions.onFinish != null){
            this.on("finish", pOptions.onFinish);
            delete pOptions.onFinish;
        }

        this.id = pOptions.id
        this.textarea = pOptions.textarea

        //get the formType
        this.formType = $(this.textarea).parents("form").data("plugin-formType");

        this.options = pOptions;

        this.addPlaceHolder();

        var img = this.options.img;
        var imageUrl;
        //check if it's an https? url
        if(typeof img == "string" && img.match(/(https?:\/\/[^\]\s]+)(?: ([^\]]*))?/)){
          imageUrl = img;
        }
        else{
          var urlCreator = window.URL || window.webkitURL;
          imageUrl = urlCreator.createObjectURL(img);
        }

        this.on("finish", this.finish.bind(this));
        if(this.options.upload){
            //register progress event to update html place holder
            this.on("progress", this.progress.bind(this));

            this.addHtmlPlaceHolder(this.options.$container, imageUrl, function(){
                // this.uploadImg(img, null);
                dealabs.ImgUploadQueue.push({id: this.id, obj:this});
            }.bind(this));

        }
        else{
            this.emit("finish", null, imageUrl, this.options.width);
            // this.replacePlaceHolderByUrl(imageUrl);
        }
    }
}