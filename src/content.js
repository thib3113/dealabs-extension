if(["rss", "xml", "css", "js", "pdf"].indexOf(location.pathname.split('.').pop()) > 0)
    throw new Error("Extension don't support this file format");

try{
    
    Object.size = function(obj) {
        var size = 0,
            key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };

    function plugin_getParameterByName(name, url){
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }

    function inject(func) {
        var script = document.createElement('script');
        script.appendChild(document.createTextNode(func));
        (document.body || document.head || document.documentElement).appendChild(script);
    }

    //override
    function validate_thread() {
        error = false;
        error_text = "Des champs obligatoires n’ont pas été remplis, ou l’ont été incorrectement.";
        $("#add_thread_form .flag.obligatoire").each(function() {
            verif_champs_obligatoire(this)
        });
        if ($('#add_thread_form #categories').length && $('#add_thread_form #sous_categories').length) {
            $('#add_thread_form #categories').removeClass("error");
            if (!$('#add_thread_form #forum_id_select').val() || $('#add_thread_form #forum_id_select').val() == "0") {
                error = true;
                $('#add_thread_form #categories').addClass("error")
            }
            $('#add_thread_form #sous_categories').removeClass("error");
            if ((!$('#add_thread_form #subforum_id_select').attr('disabled') && (!$('#add_thread_form #subforum_id_select').val() || $('#add_thread_form #subforum_id_select').val() == "0")) ) {
                error = true;
                $('#add_thread_form #sous_categories').addClass("error")
            }
        }
        if (!error) {
            $("#add_thread_form #message_erreur_header").slideUp("fast");
            $("#add_thread_form .spinner_validate").show();
            $("#add_thread_form .enter_validate").attr('onclick', "");
            $(document.add_thread_form).trigger('submit');
        } else {
            $("#add_thread_form #message_erreur_header").slideDown("fast");
            $("#add_thread_form #message_erreur_header p").text(error_text)
        }
    }
    function validate_deal() {
        error = false;
        error_text = "Des champs obligatoires n’ont pas été remplis, ou l’ont été incorrectement.";
        $("#add_deal_form .flag.obligatoire").each(function() {
            if ($('#add_deal_form #type_deal').val() == 1) {
                if ($(this).hasClass("bon_plan") && $(this).hasClass('obligatoire')) {
                    verif_champs_obligatoire(this)
                }
            } else if ($('#add_deal_form #type_deal').val() == 2) {
                if ($(this).hasClass("bon_de_reduction") && $(this).hasClass('obligatoire')) {
                    verif_champs_obligatoire(this)
                }
            } else if ($('#add_deal_form #type_deal').val() == 3) {
                if ($(this).hasClass("gratuit") && $(this).hasClass('obligatoire')) {
                    verif_champs_obligatoire(this)
                }
            }
        });
        $('#add_deal_form #categories').removeClass("error");
        if (!$('#add_deal_form #master1_id').val() || $('#add_deal_form #master1_id').val() == "0") {
            error = true;
            $('#add_deal_form #categories').addClass("error")
        }
        $('#add_deal_form #sous_categories').removeClass("error");
        if ((!$('#add_deal_form #master2_id').attr('disabled') && (!$('#add_deal_form #master2_id').val() || $('#add_deal_form #master2_id').val() == "0")) && if_subcategory_verif == 0) {
            error = true;
            $('#add_deal_form #sous_categories').addClass("error")
        }
        check_region_checked($("#add_deal_form #online_status").val());
        validate_date("date_debut");
        validate_date("date_fin");
        if (is_valide_date["date_debut"] && is_valide_date["date_fin"]) {
            coherent_date("date_debut", "date_fin")
        } else {
            error = true
        }
        if (!error) {
            $("#add_deal_form #message_erreur_header").slideUp("fast");
            $("#add_deal_form .spinner_validate").show();
            $("#add_deal_form .enter_validate").attr('onclick', "");
            $(document.add_deal_form).trigger('submit');
        } else {
            $("#add_deal_form #message_erreur_header").slideDown("fast");
            $("#add_deal_form #message_erreur_header p").text(error_text)
        }
    }

    // function plugin_generatePreview(commentContainer, commentaire) {
    //     userData = jQuery('#open_member_parameters');

    //     replacements = {};

    //     if (typeof commentaire == "undefined")
    //         return;

    //     current_smileys = settingsManager.smileys
    //     for (var nom in current_smileys) {
    //         commentaire = commentaire.replace(new RegExp(':' + plugin_escapeRegExp(nom) + ':', 'g'), '[img size="300px"]' + current_smileys[nom] + '[/img]');
    //     }

    //     for (var i = 0; i < plugin_BBcodes.length; i++) {
    //         if (typeof replacements[plugin_BBcodes[i].name] == "undefined")
    //             replacements[plugin_BBcodes[i].name] = [];

    //         bbcodes_found = plugin_match_all(plugin_BBcodes[i].regex, commentaire);
    //         for (var j = bbcodes_found.length - 1; j >= 0; j--) {
    //             cur_bbcodes_found = bbcodes_found[j][0];

    //             subst = plugin_BBcodes[i].name + '_' + replacements[plugin_BBcodes[i].name].length

    //             commentaire = commentaire.replace(new RegExp(plugin_escapeRegExp(cur_bbcodes_found)), '[' + subst + ']');
    //             replacements[plugin_BBcodes[i].name].push({
    //                 subst: subst,
    //                 after: cur_bbcodes_found.replace(plugin_BBcodes[i].regex, plugin_BBcodes[i].html)
    //             });
    //         }
    //     }

    //     //match url, and replace by bbcode, for escape smiley
    //     if (typeof replacements["link"] == "undefined")
    //         replacements["link"] = [];
    //     urls = plugin_getUrls(commentaire);
    //     for (var i = urls.length - 1; i >= 0; i--) {
    //         subst = 'link_' + replacements["link"].length
    //         commentaire = commentaire.replace(new RegExp(plugin_escapeRegExp(urls[i])), '[' + subst + ']');
    //         //url length
    //         if (urls[i].length <= 25)
    //             after = '<a href="' + urls[i] + '">' + urls[i] + '</a>';
    //         else
    //             after = '<a class="link_a_reduce" href="' + urls[i] + '">' + urls[i].substr(0, 15) + '<i></i><span>' + urls[i].substr(15, urls[i].length - 10 - 15) + '</span>' + urls[i].substr(urls[i].length - 10, urls[i].length) + '</a>';

    //         replacements.link.push({
    //             subst: subst,
    //             after: after
    //         });
    //     }

    //     //transform smileys to a bbcode
    //     for (var i = 0; i < plugin_BBcodesSmiley.length; i++) {
    //         commentaire = commentaire.replace(new RegExp(plugin_escapeRegExp(plugin_BBcodesSmiley[i].smiley), 'gi'), '[' + plugin_BBcodesSmiley[i].name + ']');
    //     }
    //     //transform smiley bbcode to image
    //     for (var i = 0; i < plugin_BBcodesSmiley.length; i++) {
    //         commentaire = commentaire.replace(new RegExp(plugin_escapeRegExp('[' + plugin_BBcodesSmiley[i].name + ']'), 'gi'), '<img src="https://static.dealabs.com/images/smiley/' + plugin_BBcodesSmiley[i].icon + '.png" width="auto" height="auto" alt="' + plugin_BBcodesSmiley[i].smiley + '" title="' + plugin_BBcodesSmiley[i].smiley + '" class="bbcode_smiley">')
    //     }

    //     for (code in replacements) {
    //         for (var i = 0; i < replacements[code].length; i++) {
    //             cur_code = replacements[code][i];
    //             commentaire = commentaire.replace(new RegExp('\\[' + cur_code.subst + '\\]'), cur_code.after);
    //         }
    //     }

    //     commentContainer = commentContainer.replace(/{{userlink}}/g, jQuery("#member_parameters a:first").attr('href'));
    //     commentContainer = commentContainer.replace(/{{useravatar}}/g, userData.find('img').attr('src'));
    //     commentContainer = commentContainer.replace(/{{username}}/g, jQuery("#member_parameters a:first").find('span').text());
    //     commentContainer = commentContainer.replace(/{{commentaire}}/g, plugin_nl2br(commentaire));
    //     return commentContainer;
    // }


    // function plugin_insertSmiley() {
    //     textarea = jQuery(this).parents('.comment_text_part_textarea').find('textarea');;
    //     if (textarea.length > 0) {
    //         textarea = textarea.get(0);
    //     } else {
    //         return;
    //     }

    //     var scrollTop = textarea.scrollTop;
    //     var scrollLeft = textarea.scrollLeft;

    //     var nom = this.getElementsByTagName('img')[0].getAttribute("title");
    //     textarea.focus();
    //     //textarea.value += '[img size="300px"]'+image+"[/img]";
    //     //add smiley at cursor position
    //     var cursorPos = jQuery(textarea).prop('selectionStart');
    //     var v = jQuery(textarea).val()
    //     v = v.slice(0, textarea.selectionStart) + v.slice(textarea.selectionEnd);
    //     var textBefore = v.substring(0, cursorPos);
    //     var textAfter = v.substring(cursorPos, v.length);
    //     $(textarea).val(textBefore + ':' + nom + ":" + textAfter);

    //     //positionne cursor in textarea
    //     selectionStart = selectionEnd = (textBefore + ':' + nom + ":").length
    //     if (textarea.setSelectionRange) {
    //         textarea.focus();
    //         textarea.setSelectionRange(selectionStart, selectionEnd);
    //     } else if (textarea.createTextRange) {
    //         var range = textarea.createTextRange();
    //         range.collapse(true);
    //         range.moveEnd('character', selectionEnd);
    //         range.moveStart('character', selectionStart);
    //         range.select();
    //     }

    //     // textarea.value += ':'+nom+":";
    //     textarea.scrollTop = scrollTop;
    //     textarea.scrollLeft = scrollLeft;
    // }


    // function plugin_update_emoticone_textarea() {
    //     if (typeof jQuery == "undefined")
    //         return;


    //     jQuery('.emoji-content').each(function(index, value) {
    //         c = this;

    //         for (var title in settingsManager.smileys) {
    //             mm = document.createElement("a");
    //             mm.href = "javascript:;";
    //             mm.setAttribute("style", 'text-decoration:none');
    //             mm.dataset.role = "emoticone_add_userscript";
    //             mm.innerHTML = '<img style="max-height:20px" title="' + title + '" src="' + settingsManager.smileys[title] + '" alt="' + title + '"/>';
    //             mm.addEventListener("click", plugin_insertSmiley, true);
    //             c.appendChild(mm);
    //         }
    //     });
    // }

    function update_theme(theme){
        theme_css = document.querySelectorAll('[data-plugin-role="theme_css"]');
        for (var i = 0; i < theme_css.length; i++) {
            theme_css[i].parentNode.removeChild(theme_css[i]);
        }

        if(theme.safeName != "default"){
            for (var i = 0; i < theme.styles.length; i++) {
                if(theme.styles[i].urlRegex == undefined ||  window.location.pathname.match(theme.styles[i].urlRegex)){
                    if(theme.styles[i].backgroundPlaceHolderColor != undefined){
                        var css = 'body { background-color: '+theme.styles[i].backgroundPlaceHolderColor+'; }',
                            head = document.head || document.getElementsByTagName('head')[0],
                            style = document.createElement('style');

                        style.type = 'text/css';
                        if (style.styleSheet){
                          style.styleSheet.cssText = css;
                        } else {
                          style.appendChild(document.createTextNode(css));
                        }

                        head.appendChild(style);
                    }

                    
                    if(theme.styles[i].url.slice(0,5) == "https")
                        url = theme.styles[i].url;
                    else
                        url = theme_url+theme.styles[i].url+(theme.styles[i].version!=undefined? "?v="+theme.styles[i].version:"");
                   
                    var link = document.createElement( "link" );
                    link.href = url;
                    link.type = "text/css";
                    link.rel = "stylesheet";
                    link.dataset.pluginRole = 'theme_css';
                    link.media = "screen,print";
                    document.getElementsByTagName("head")[0].appendChild( link );
                }
            }
        }
    }
    function update_emoticone_theme(theme){
        theme_css = document.querySelectorAll('[data-plugin-role="emoticone_theme_css"]');
        for (var i = 0; i < theme_css.length; i++) {
            theme_css[i].parentNode.removeChild(theme_css[i]);
        }

        if(theme.safeName != "default"){
            for (var i = 0; i < theme.styles.length; i++) {
                if(theme.styles[i].urlRegex == undefined ||  window.location.pathname.match(theme.styles[i].urlRegex)){
                    if(theme.styles[i].url.slice(0,5) == "https")
                        url = theme.styles[i].url;
                    else
                        url = emoticone_theme_url+theme.styles[i].url;
                   
                    var link = document.createElement( "link" );
                    link.href = url;
                    link.type = "text/css";
                    link.rel = "stylesheet";
                    link.dataset.pluginRole = 'emoticone_theme_css';
                    link.media = "screen,print";
                    document.getElementsByTagName("head")[0].appendChild( link );
                }
            }
        }
    }

    var observer = new MutationObserver(function(mutations) {

      mutations.forEach(function(mutation) {
        if (!mutation.addedNodes) return
        for (var i = 0; i < mutation.addedNodes.length; i++) {
          // do things to your newly added nodes here
          var node = mutation.addedNodes[i];
          if(node.nodeName == "HEAD"){
            extension.getStorage('settings', function(value){
                update_theme(value.settings.theme);
                update_emoticone_theme(value.settings.emoticone_theme);
            }, true);
            observer.disconnect();        
          }
        }
      })
    })

    observer.observe(document, {
        childList: true
      , subtree: true
      , attributes: false
      , characterData: false
    })

    var EmbedLinksManager;
    $(function() {
        // inject(validate_thread);
        // inject(validate_deal);
        // inject(plugin_escapeRegExp);

        // inject(plugin_update_emoticone_textarea);
        // inject(plugin_insertSmiley);

        // plugin_update_emoticone_textarea();
        $body = $('body');

        EmbedLinksManager = new Embed($('a.link_a_reduce'));

        //update the smileys image for themes
        $(".BBcode_image").each(function(){
            if(this.src.match(/#plugin_smiley$/g)){
                $(this).removeClass("BBcode_image").addClass("bbcode_smiley");
            }
        })

        $('body').on('paste drop', 'textarea', function(e){
            reUpload = e.ctrlKey;

            if(e.type == "paste"){
                var items = (e.clipboardData || e.originalEvent.clipboardData).items;
            }
            else if(e.type == "drop"){
                e.stopPropagation();
                e.preventDefault();
                
                var items = (e.dataTransfer || e.originalEvent.dataTransfer).items;
            }
            else{
                alert("error");
            }
            for (index in items) {
                var item = items[index];
                if (item.type != undefined && item.type.indexOf("image") !== -1) {
                    blob = item.getAsFile(); 
                    addImageInForm(this, blob, $(this).prop('selectionStart'), true);
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
                            src = $(str).attr('src');
                            if(src != undefined){
                                if(isDataURL(src)){
                                    fetch(src)
                                    .then(res => res.blob())
                                    .then(blob => addImageInForm(this, blob, $(this).prop('selectionStart'), true))
                                }
                                else{
                                    addImageInForm(this, src, $(this).prop('selectionStart'), reUpload);
                                }
                            }
                        }
                    }.bind(this));
                }
            }
        });

        //settings
        if (plugin_getParameterByName('tab', location.href) == "settings") {
            // #contener_profil_param .content_profil_param .profil_param_notification
            $('#left_profil_param').append('<a id="plugin_tab" class="menu_div_param" href="javascript:;" onclick="tab_change_profile(0, this);"><div class="div_tab_selector"><p>Plugin</p><p>Configuration du plugin.</p></div></a>');
            $('#right_profil_param .padding_right_profil_param').append('<div id="plugin_tab_content" class="content_profil_param" style="display: none;">\
                    <div class="title_tab_contener">\
                        <p>Configuration du plugin (<span style="cursor:pointer;" data-plugin-role="version"></span>)</p>\
                        <p>Modifier les paramètres du plugins.</p>\
                    </div>\
                    <div class="content_tab_contener">\
                        <div class="subtitle_tab_contener">\
                            <p>Mise à jour</p>\
                        </div>\
                        <div class="profil_param_notification border_grey_bottom">\
                            <div class="left_profil_param_champs" style="width:50%;">\
                                <p>Intervalle de mise à jour&thinsp;:</p>\
                            </div>\
                            <div class="content_profil_param_champs">\
                                <div class="input_left flag">\
                                    <select name="plugin_time_between_refresh" id="plugin_time_between_refresh">\
                                        <option value="">Chargement...</option>\
                                    </select>\
                                </div>\
                                <span>Temps en secondes&thinsp;</span>\
                            </div>\
                        </div>\
                        <div class="subtitle_tab_contener">\
                            <p>Notifications</p>\
                        </div>\
                        <div class="profil_param_notification">\
                            <div class="left_profil_param_champs" style="width:50%;">\
                                <p>Notifications sur le bureau&thinsp;:</p>\
                            </div>\
                            <div class="content_profil_param_champs">\
                                <div class="input_left flag">\
                                    <input type="checkbox" value="1" id="plugin_desktop_notifications" name="plugin_desktop_notifications">\
                                    <label for="plugin_desktop_notifications">Oui</label>\
                                </div>\
                            </div>\
                        </div>\
                        <div class="profil_param_notification">\
                            <div class="left_profil_param_champs" style="width:50%;">\
                                <p>Notifications des deals&thinsp;:</p>\
                            </div>\
                            <div class="content_profil_param_champs">\
                                <div class="input_left flag">\
                                    <input type="checkbox" value="1" id="plugin_deals_notifications" name="plugin_deals_notifications">\
                                    <label for="plugin_deals_notifications">Oui</label>\
                                </div>\
                            </div>\
                        </div>\
                        <div class="profil_param_notification">\
                            <div class="left_profil_param_champs" style="width:50%;">\
                                <p>Notifications des alertes&thinsp;:</p>\
                            </div>\
                            <div class="content_profil_param_champs">\
                                <div class="input_left flag">\
                                    <input type="checkbox" value="1" id="plugin_alertes_notifications" name="plugin_alertes_notifications">\
                                    <label for="plugin_alertes_notifications">Oui</label>\
                                </div>\
                            </div>\
                        </div>\
                        <div class="profil_param_notification">\
                            <div class="left_profil_param_champs" style="width:50%;">\
                                <p>Notifications des MPs&thinsp;:</p>\
                            </div>\
                            <div class="content_profil_param_champs">\
                                <div class="input_left flag">\
                                    <input type="checkbox" value="1" id="plugin_mp_notifications" name="plugin_mp_notifications">\
                                    <label for="plugin_mp_notifications">Oui</label>\
                                </div>\
                            </div>\
                        </div>\
                        <div class="profil_param_notification border_grey_bottom">\
                            <div class="left_profil_param_champs" style="width:50%;">\
                                <p>Notifications du forum&thinsp;:</p>\
                            </div>\
                            <div class="content_profil_param_champs">\
                                <div class="input_left flag">\
                                    <input type="checkbox" value="1" id="plugin_forum_notifications" name="plugin_forum_notifications">\
                                    <label for="plugin_forum_notifications">Oui</label>\
                                </div>\
                            </div>\
                        </div>\
                        <div class="subtitle_tab_contener">\
                            <p>Theme</p>\
                        </div>\
                        <div class="profil_param_notification">\
                            <div class="left_profil_param_champs" style="width:50%;">\
                                <p>Theme&thinsp;:</p>\
                            </div>\
                            <div class="content_profil_param_champs">\
                                <div class="input_left flag">\
                                    <select name="plugin_theme" id="plugin_theme">\
                                        <option value="">Chargement...</option>\
                                    </select>\
                                </div>\
                            </div>\
                        </div>\<div class="profil_param_notification border_grey_bottom">\
                            <div class="left_profil_param_champs" style="width:50%;">\
                                <p>Emoticones&thinsp;:</p>\
                            </div>\
                            <div class="content_profil_param_champs">\
                                <div class="input_left flag">\
                                    <select name="emoticone_theme" id="emoticone_theme">\
                                        <option value="">Chargement...</option>\
                                    </select>\
                                </div>\
                            </div>\
                        </div>\
                        <div class="subtitle_tab_contener">\
                            <p>Images</p>\
                        </div>\
                        <div class="profil_param_notification border_grey_bottom">\
                            <div class="left_profil_param_champs" style="width:50%;">\
                                <p>Connexion à imgur&thinsp;:</p>\
                            </div>\
                            <div class="content_profil_param_champs">\
                                <p id="imgur-connexion">\
                                    test de connexion en cours ...\
                                </p>\
                            </div>\
                        </div>\
                        <div class="subtitle_tab_contener">\
                            <p>Smileys</p>\
                        </div>\
                        <div class="profil_param_notification border_grey_bottom">\
                            <div class="left_profil_param_champs" id="plugin_smileys_list" style="width: 100%;overflow:auto;">\
                            <p>Pour des raisons de sécurité, merci de préferrer des images en https</p>\
                            <table style="width: 100%;">\
                                <thead><tr><th></th><th>Url</th><th>Nom</th><th></th></tr></thead>\
                                <tbody></tbody>\
                            </table>\
                            </div>\
                            <div class="content_profil_param_champs">\
                            </div>\
                        </div>\
                        <div class="profil_param_validation" style="padding-top:10px;">\
                            <a href="javascript:;" data-plugin-role="update_settings" class="validate_button_form background_color_button_blue" style="float:none; display:inline-block; margin-right:0px;">Sauvegarder les modifications</a>\
                        </div>\
                        <div onClick="$(this).next(\'div\').toggle()" class="subtitle_tab_contener plugin-debug">\
                            <p>Debug</p>\
                        </div>\
                        <div class="profil_param_notification border_grey_bottom plugin-debug" style="display:none;">\
                            <div class="left_profil_param_champs" style="width:50%;">\
                                <p>Liste des erreurs apparues&thinsp;:</p>\
                            </div>\
                            <div>\
                                <textarea name="" id="debug-logs" style="width:98%">loading...</textarea>\
                            </div>\
                        </div>\
                    </div>\
                </div>');
            //load version
            $('[data-plugin-role="version"]').text(extension.getManifest().version);

            //load time_between_refresh
            $('#plugin_time_between_refresh').html("");
            for (var i = 0; i < time_between_refresh_list.length; i++) {
                $('#plugin_time_between_refresh').append('<option value="' + time_between_refresh_list[i] * 1000 + '"' + (settingsManager.time_between_refresh == time_between_refresh_list[i] * 1000 ? ' selected' : '') + '>' + time_between_refresh_list[i] + '</option>');
            }

            //check imgur API
            // $("#imgur-connexion");
            imgurManager.checkConnexion(function(response){
                if(response!=false){
                    $("#imgur-connexion").html(extension._("you are connected with account $account$", response.url));
                }
                else{
                    $("#imgur-connexion").html(extension._("you are not connected :")+"<em data-plugin-role=\"ask_for_imgur_token\" style=\"cursor:pointer\">"+extension._("click here")+"</em>");
                    $(document).on("click", '[data-plugin-role="ask_for_imgur_token"]', function(){
                        imgurManager.askForToken();
                    })
                }
            })
            // connected = false;
            // // a token is available and not expired ?
            // if(
            //     (settingsManager.imgurAPI.token != undefined && settingsManager.imgurAPI.tokenExpire > Date.now())
                
            // )
            // connected = true;

            if(settingsManager.imadevelopper){
                extension.getLogs(function(result){
                    if(result == undefined || result.logs == undefined || result.logs.length==0){
                        $(".plugin-debug").hide();
                        return;
                    }

                    logs = result.logs;
                    text = "";
                    for (var i = logs.length - 1; i >= 0; i--) {
                        text += logs[i].stack
                        if(i-1>=0)
                            text+= "=================";
                    }
                    this.textarea.innerText = text;
                }.bind({textarea:document.querySelector("#debug-logs")}))
            }
            else{
                debugElements = document.querySelectorAll(".plugin-debug");
                for (var i = 0; i < debugElements.length; i++) {
                    debugElements[i].remove();
                }
            }

            tryToBecomeDevelopper = 0;
            $(document).on("click", '[data-plugin-role="version"]', function(){
                if(settingsManager.imadevelopper){
                    noty({
                        layout: 'topRight',
                        type: 'warning',
                        text: 'Vous êtes déjà un développeur ;) !',
                        dismissQueue: true,
                        timeout: 2000,
                        maxVisible: 1
                    });
                    return;   
                }

                if(++tryToBecomeDevelopper >= 7){
                    noty({
                        layout: 'topRight',
                        type: 'success',
                        text: 'Yeahhh, vous êtes désormais considéré comme un développeur !',
                        dismissQueue: true,
                        timeout: 2000,
                        maxVisible: 1
                    });
                    settingsManager.imadevelopper = true;
                }
            })

            //load emoticone themes
            $('#emoticone_theme').on('change', function(){
                update_emoticone_theme($(this).find(":selected").data("emoticone_theme"));
            })
            $('#emoticone_theme').html("");
            theme_list = [
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
            
            for(name in theme_list){
                $option = $('<option value="' + theme_list[name].safeName + '"' + (settingsManager.emoticone_theme.safeName == theme_list[name].safeName ? ' selected' : '') + '>' + theme_list[name].name + '</option>');
                $option.data("emoticone_theme", theme_list[name]);
                $('#emoticone_theme').append($option);
            }

            $.ajax({
              url: emoticone_theme_list_url,
              dataType: "json",
              success: function(theme_list){
                $('#emoticone_theme').html("");
                for(name in theme_list){
                    $option = $('<option value="' + theme_list[name].safeName + '"' + (settingsManager.emoticone_theme.safeName == theme_list[name].safeName ? ' selected' : '') + '>' + theme_list[name].name + '</option>');
                    $option.data("emoticone_theme", theme_list[name]);
                    $('#emoticone_theme').append($option);
                }
              }
            });

            //load time_between_refresh
            $('#plugin_theme').on('change', function(){
                update_theme($(this).find(":selected").data("theme"));
            })
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
                $option = $('<option value="' + theme_list[name].safeName + '"' + (settingsManager.theme.safeName == theme_list[name].safeName ? ' selected' : '') + '>' + theme_list[name].name + '</option>');
                $option.data("theme", theme_list[name]);
                $('#plugin_theme').append($option);
            }

            $.ajax({
              url: theme_list_url,
              dataType: "json",
              success: function(theme_list){
                $('#plugin_theme').html("");
                for(name in theme_list){
                    $option = $('<option value="' + theme_list[name].safeName + '"' + (settingsManager.theme.safeName == theme_list[name].safeName ? ' selected' : '') + '>' + theme_list[name].name + '</option>');
                    $option.data("theme", theme_list[name]);
                    $('#plugin_theme').append($option);
                }
              }
            });

            $('#plugin_desktop_notifications').attr('checked', settingsManager.notifications_manage.desktop);
            $('#plugin_deals_notifications').attr('checked', settingsManager.notifications_manage.deals);
            $('#plugin_alertes_notifications').attr('checked', settingsManager.notifications_manage.alertes);
            $('#plugin_mp_notifications').attr('checked', settingsManager.notifications_manage.MPs);
            $('#plugin_forum_notifications').attr('checked', settingsManager.notifications_manage.forum);

            // //load turbopix key
            // $('#plugin_turbopix_key').val(settingsManager.turbopixAPIKey);

            //load smileys
            smileyTPL = '<tr><td>{{img}}</td><td style="padding-right: 20px;"><input style="box-sizing: border-box;" type="text" data-plugin-role="smiley_url" value="{{smiley_url}}" /></td><td style="padding-right: 20px;"><input style="box-sizing: border-box;" type="text" data-plugin-role="smiley_name" value="{{smiley_name}}" /></td><td onclick="$(this).parent(\'tr\').remove();" style="cursor:pointer;" ><img src="https://static.dealabs.com/images/profil/icon_profile_messages_delete.png"></td></tr>';
            $('#plugin_smileys_list tbody').html("");
            smileyList = settingsManager.smileys;
            for (smiley in smileyList) {
                tpl = smileyTPL.replace(/{{img}}/g, '<img style="max-height:40px;" src="{{smiley_url}}" alt=":{{smiley_name}}:" />').replace(/{{smiley_url}}/g, smileyList[smiley]).replace(/{{smiley_name}}/g, smiley);
                $('#plugin_smileys_list tbody').append(tpl);
            }
            //add plus button
            $('#plugin_smileys_list tbody').append('<tr><td style="cursor:pointer;text-align: center;" colspan="4"><a data-plugin-role="add_new_smiley" href="javascript:;" class="validate_button_form background_color_button_green enter_validate" style="float:none; display:inline-block; margin-right:0px;">Ajouter un nouveau smiley</a></td></tr>')

            $body.on('click', '[data-plugin-role="add_new_smiley"]', function() {
                $this = $(this);
                tpl = smileyTPL.replace(/{{img}}/g, "").replace(/{{smiley_url}}/g, "").replace(/{{smiley_name}}/g, "");
                $this.parents('tr').before(tpl);
            })

            //update settings
            $body.on('click', '[data-plugin-role="update_settings"]', function() {
                var save_smileys = {};
                $('#plugin_smileys_list tbody tr').each(function() {
                    smiley_url = $(this).find('[data-plugin-role="smiley_url"]').val();
                    if($(this).find('[data-plugin-role="smiley_url"]').val() != undefined){
                        smiley_name = $(this).find('[data-plugin-role="smiley_name"]').val().replace(/[^\w]/gi, "_").replace(/_+/gi, "_");
                        if (smiley_url != "" && typeof smiley_url != "undefined" && smiley_name != "" && typeof smiley_name != "undefined")
                            save_smileys[smiley_name] = smiley_url;
                    }
                });

                newSettings = {
                    time_between_refresh: parseInt($('#plugin_time_between_refresh').val()),
                    theme: $('#plugin_theme').find(":selected").data("theme"),
                    emoticone_theme: $('#emoticone_theme').find(":selected").data("emoticone_theme"),
                    // turbopixAPIKey: $('#plugin_turbopix_key').val(),
                    notifications_manage: {
                        desktop : $('#plugin_desktop_notifications').is(':checked'),
                        forum : $('#plugin_forum_notifications').is(':checked'),
                        MPs : $('#plugin_mp_notifications').is(':checked'),
                        deals : $('#plugin_deals_notifications').is(':checked'),
                        alertes : $('#plugin_alertes_notifications').is(':checked')
                    },
                    smileys: save_smileys
                }

                noty({
                    layout: 'topRight',
                    type: 'success',
                    text: 'Vos paramètres ont bien été enregistrés.',
                    dismissQueue: true,
                    timeout: 2000,
                    maxVisible: 1
                });


                settingsManager._updateCb = function(){
                    extension.sendMessage('update_settings', {});
                    settingsManager._updateCb = null;
                }
                settingsManager.settings = newSettings;
            });

            // #plugin_tab_content .content_tab_contener
            if (plugin_getParameterByName('what', location.href) == "plugin") {
                setTimeout(function(){$('#plugin_tab').get(0).click();}, 20);
            }
        }

        //check imgur login
        // var hashParams = {}, queryString = location.hash.substring(1),
        // regex = /([^&=]+)=([^&]*)/g, m;
        // while (m = regex.exec(queryString)) {
        //   hashParams[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
        // }


        // if(
        //     hashParams["access_token"] != undefined &&
        //     hashParams["expires_in"] != undefined &&
        //     hashParams["token_type"] != undefined &&
        //     hashParams["refresh_token"] != undefined &&
        //     hashParams["account_username"] != undefined &&
        //     hashParams["account_id"] != undefined
        // )
        //     settingsManager.imgurAPI = {
        //         access_token : hashParams["access_token"],
        //         expires_in : Date.now()+hashParams["expires_in"],
        //         token_type : hashParams["token_type"],
        //         refresh_token : hashParams["refresh_token"],
        //         account_username : hashParams["account_username"],
        //         account_id : hashParams["account_id"]
        //     };

        //check imgur connexion
        // connected = false;
        // if((settingsManager.imgurAPI.token != undefined && settingsManager.imgurAPI.tokenExpire > Date.now()))
        //     connected = true;


        //add hour in body for styling
        updateHourBody = function(){
            $("body").addClass("plugin-hour-"+(new Date().getHours()));
            //relaunch for the next hour
            setTimeout(this, 3600000 - new Date().getTime() % 3600000);
        }();

        //override spoiler
        $('body').on('click', '#_userscript_preview_container .click_div_spoiler', function(e) {
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
        $('body').on('click', '#_userscript_preview_container div.quote > div.quote_pseudo > p.pseudo_tag > a.open', function(e) {
            quote_height_max = parseInt($(".quote_message").css("max-height"), 10);
            var current_height = $(this).parents(".quote").children('.quote_message').height();
            if (current_height <= quote_height_max) {
                $(this).parents(".quote").children('.quote_message').css('max-height', 'none');
                $(this).text("Masquer la citation")
            } else {
                $(this).parents(".quote").children('.quote_message').css('max-height', quote_height_max + 'px');
                $(this).text("Afficher l'intégralité de la citation")
            }
        });

        $('.validate_button_form, .validate_comment').each(function(index) {
            if ($(this).parents('#right_profil_param').length > 0 
                || $(this).parents('#post_conteneur').length > 0 
                || $(this).parents('#add_alert').length > 0
                || $(this).parents('#all_notification_alert').length > 0
            )
                return;

            clone = $(this)
                .clone(false)
                .attr('onclick', null)
                .clone(false)
                .attr('accesskey', 'p')
                .attr("tabindex", this.tabindex+1)
                .css("margin-left", "20px")
                .text("Prévisualiser");
            // console.log(clone);
            $(this).after(clone);
            clone.on('click', function(e) {
                if ($(this).parents('#discussed').length > 0) {
                    $putContainer = $('#comment_contener');
                    func = "append";
                    commentContainer = '<div class="padding_comment_contener" id="_userscript_preview_container" data-userscript="comment_contener">\
                        <div class="padding">\
                            <div class="profil_part">\
                                <div class="avatar_contener">\
                                    <a class="avatar" href="{{userlink}}">\
                                        <img src="{{useravatar}}">\
                                    </a>\
                                </div>\
                            </div>\
                            <div class="comment_text_part">\
                                <div class="header_comment">\
                                    <a href="{{userlink}}" class="pseudo text_color_blue">{{username}}</a>\
                                    <p><span>prévisualisation</span></p>\
                                </div>\
                                <div>\
                                    <div class="commentaire_div">\
                                      {{commentaire}}\
                                    </div>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                </div>';
                } else if ($(this).parents('#add_thread_form').length > 0) {
                    $putContainer = $('#left_global .padding_left_global');
                    func = "prepend";
                    commentContainer = '<div id="_userscript_preview_container" data-userscript="comment_contener" style="display:none;" class="padding_comment_contener">\
                  <div class="comment_text_part">\
                    <fieldset style="padding:20px;margin-bottom:20px;"><legend>Prévisualisation</legend>\
                      <div class="commentaire_div">\
                          {{commentaire}}\
                      </div>\
                    </fieldset>\
                  </div>\
                </div>';
                } else if ($(this).parents('#reply_ancre').length) {
                    $putContainer = $('#all_contener_messagerie > .content_profil_messagerie:first()');
                    func = "append";
                    commentContainer = '<div id="_userscript_preview_container" data-userscript="comment_contener" style="display:none;" class="content_message background_color_white">\
                    <div class="profil_message">\
                        <div class="image_profil">\
                            <img src="{{useravatar}}">\
                        </div>\
                        <div class="right_titre_message">\
                                    </div>\
                        <div class="info_message">\
                                            <p class="username text_color_333333">{{username}}</p>\
                                        <p class="date text_color_777777" style="float:left;">prévisualisation</p>\
                                    </div>\
                    </div>\
                    <p class="text_color_777777 message_content_text" style="padding:15px 0px;">\
                        {{commentaire}}\
                    </p>\
                </div>';
                } else {
                    $putContainer = $(this).parents('.padding_comment_contener');
                    func = "before";
                    commentContainer = '<div id="_userscript_preview_container" data-userscript="comment_contener" style="display:none;" class="padding_comment_contener">\
                  <div class="profil_part">\
                        <div class="avatar_contener">\
                            <a class="avatar" href="{{userlink}}">\
                                <img src="{{useravatar}}">\
                            </a>\
                        </div>\
                    </div>\
                    <div class="comment_text_part">\
                        <div class="header_comment">\
                            <a href="{{userlink}}" class="pseudo text_color_blue">{{username}}</a>\
                            <p><span>prévisualisation</span></p>\
                        </div>\
                        <div>\
                            <div class="commentaire_div">\
                                {{commentaire}}\
                            </div>\
                        </div>\
                  </div>\
                </div>';
                }

                cb = function() {
                    //recheck quote
                    $('.commentaire_div > div.quote').each(function() {
                        quote_height_max = parseInt($(".quote_message").css("max-height"), 10);
                        var current_height = $(this).find('.quote_message').height();
                        if (current_height == quote_height_max) {
                            $(this).find('a.open:first').stop().fadeTo('fast', 1);
                            $(this).find('a.open:first').text("Afficher l'intégralité de la citation")
                        } else if (current_height > quote_height_max) {
                            $(this).find('a.open:first').stop().fadeTo('fast', 1);
                            $(this).find('a.open:first').text("Masquer la citation")
                        }
                    });

                    $('#_userscript_preview_container a.link_a_reduce').each(function(){
                        EmbedLinksManager.addLink(this);
                    });
                }

                commentaire = $(this).parents('form').find('textarea').val();
                
                if(commentaire.match(/\[img_wait_upload:[0-9]+\]/)){
                    noty({
                        layout: 'bottom',
                        type: 'error',
                        text: "une image est en cours d'upload, reessayer plus tard",
                        dismissQueue: true,
                        timeout: 2000,
                        maxVisible: 1
                    });
                    return;
                }

                if ($('#_userscript_preview_container').length > 0) {
                    $('#_userscript_preview_container').slideUp(500, function() {
                        $(this).remove()
                        $putContainer[func](plugin_generatePreview(commentContainer, commentaire));
                        $('#_userscript_preview_container').slideDown(500, cb);
                    });
                } else {
                    $putContainer[func](plugin_generatePreview(commentContainer, commentaire));
                    $('#_userscript_preview_container').slideDown(500, cb);
                }

            })
        })
    })


    $(function(){
        var script = document.createElement('script');
        script.src = '//cdnjs.cloudflare.com/ajax/libs/jquery-noty/2.3.8/packaged/jquery.noty.packaged.min.js';
        (document.body || document.head || document.documentElement).appendChild(script);

        // inject("$(document).on('submit', 'form', function(event) {\
        //     text = $(this).find('[name=\"post_content\"]').val();\
        //     if(text != undefined && text.match(/\\[img_wait_upload:[0-9]+\\]/)){\
        //         event.stopPropagation();\
        //         $('.spinner_validate').hide(0);\
        //         $(this).find('.spinner_validate').parent('a').attr('onclick', 'validate_comment();');\
        //         noty({\
        //             layout: 'bottom',\
        //             type: 'error',\
        //             text: 'une image est en cours d\\'upload, reessayer plus tard',\
        //             dismissQueue: true,\
        //             timeout: 2000,\
        //             maxVisible: 1\
        //         });\
        //         return false;\
        //     }\
        //     if (typeof text == 'undefined') return;\
        //     current_smileys = JSON.parse('"+JSON.stringify(settingsManager.smileys)+"');\
        //     for (var nom in current_smileys) {\
        //         text = text.replace(new RegExp(':' + plugin_escapeRegExp(nom) + ':', 'g'), '[img size=300px]' + current_smileys[nom] + '#plugin_smiley[/img]');\
        //     };\
        //     $(this).find('[name=\"post_content\"]').val(text);\
        // })");

        if(linkInfos = location.pathname.match(/^\/([^\/]+)\/.*\/([0-9]+)$/)){
            blacklisted =  (typeof settingsManager.blacklist[linkInfos[1]+'-'+linkInfos[2]] != "undefined");
            $('#bloc_option .bloc_option_white').prepend('<div class="button_part">\
                    <div class="bouton_contener_border" data-plugin-link-info="'+linkInfos[1]+'-'+linkInfos[2]+'" id="plugin-blacklist-notification">\
                        <div class="yes_part '+(blacklisted?'yes':'')+'"></div>\
                        <div class="no_part '+(blacklisted?'':'no')+'"></div>\
                    </div>\
                </div>\
                \
                <div class="title_button_part">\
                    <p>Bloquer les notifications</p>\
                    <p>Cacher les notifications des nouvelles réponses</p>\
                </div>');

            $('#plugin-blacklist-notification').on('click', function(e){
                e.preventDefault();
                e.stopPropagation();
                blacklist = settingsManager.blacklist
                if($(this).find('.yes').length == 0){// => is not already blacklisted
                    blacklist[$(this).data('plugin-link-info')] = true;
                }
                else{
                    delete blacklist[$(this).data('plugin-link-info')];
                }
                // chrome.storage.sync.set({
                //     'settings': settingsManager
                // });

                settingsManager.blacklist = blacklist;
                extension.sendMessage('update_settings', {});
                
                blacklisted = (typeof settingsManager.blacklist[$(this).data('plugin-link-info')] != "undefined");
                $(this).html('<div class="yes_part '+(blacklisted?'yes':'')+'"></div>\
                        <div class="no_part '+(blacklisted?'':'no')+'"></div>');

                return false;
            });
            notifications_with_sound =  (typeof settingsManager.notifications_with_sound[linkInfos[1]+'-'+linkInfos[2]] != "undefined");
            $('#bloc_option .bloc_option_white').prepend('<div class="button_part">\
                    <div class="bouton_contener_border" data-plugin-link-info="'+linkInfos[1]+'-'+linkInfos[2]+'" id="plugin-sounded-notification">\
                        <div class="yes_part '+(notifications_with_sound?'yes':'')+'"></div>\
                        <div class="no_part '+(notifications_with_sound?'':'no')+'"></div>\
                    </div>\
                </div>\
                \
                <div class="title_button_part">\
                    <p>Jouer un son</p>\
                    <p>Jouer un son lors d\'une nouvelle réponse</p>\
                </div>');

            $('#plugin-sounded-notification').on('click', function(e){
                e.preventDefault();
                e.stopPropagation();
                notifications_with_sound = settingsManager.notifications_with_sound
                if($(this).find('.yes').length == 0){// => is not already notifications_with_sound
                    notifications_with_sound[$(this).data('plugin-link-info')] = true;
                }
                else{
                    delete notifications_with_sound[$(this).data('plugin-link-info')];
                }
                // chrome.storage.sync.set({
                //     'settings': settingsManager
                // });

                settingsManager.notifications_with_sound = notifications_with_sound;
                extension.sendMessage('update_settings', {});
                
                notifications_with_sound = (typeof settingsManager.notifications_with_sound[$(this).data('plugin-link-info')] != "undefined");
                $(this).html('<div class="yes_part '+(notifications_with_sound?'yes':'')+'"></div>\
                        <div class="no_part '+(notifications_with_sound?'':'no')+'"></div>');

                return false;
            });
        }
    })
}
catch(e){
    try{
        extension.log(e.message, e.stack);
    }
    catch(err){
        console.error(e);
    }
    finally{
        throw e;
    }
}