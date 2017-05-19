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

    // //override
    // function validate_thread() {
    //     error = false;
    //     error_text = "Des champs obligatoires n’ont pas été remplis, ou l’ont été incorrectement.";
    //     $("#add_thread_form .flag.obligatoire").each(function() {
    //         verif_champs_obligatoire(this)
    //     });
    //     if ($('#add_thread_form #categories').length && $('#add_thread_form #sous_categories').length) {
    //         $('#add_thread_form #categories').removeClass("error");
    //         if (!$('#add_thread_form #forum_id_select').val() || $('#add_thread_form #forum_id_select').val() == "0") {
    //             error = true;
    //             $('#add_thread_form #categories').addClass("error")
    //         }
    //         $('#add_thread_form #sous_categories').removeClass("error");
    //         if ((!$('#add_thread_form #subforum_id_select').attr('disabled') && (!$('#add_thread_form #subforum_id_select').val() || $('#add_thread_form #subforum_id_select').val() == "0")) ) {
    //             error = true;
    //             $('#add_thread_form #sous_categories').addClass("error")
    //         }
    //     }
    //     if (!error) {
    //         $("#add_thread_form #message_erreur_header").slideUp("fast");
    //         $("#add_thread_form .spinner_validate").show();
    //         $("#add_thread_form .enter_validate").attr('onclick', "");
    //         $(document.add_thread_form).trigger('submit');
    //     } else {
    //         $("#add_thread_form #message_erreur_header").slideDown("fast");
    //         $("#add_thread_form #message_erreur_header p").text(error_text)
    //     }
    // }
    // function validate_deal() {
    //     error = false;
    //     error_text = "Des champs obligatoires n’ont pas été remplis, ou l’ont été incorrectement.";
    //     $("#add_deal_form .flag.obligatoire").each(function() {
    //         if ($('#add_deal_form #type_deal').val() == 1) {
    //             if ($(this).hasClass("bon_plan") && $(this).hasClass('obligatoire')) {
    //                 verif_champs_obligatoire(this)
    //             }
    //         } else if ($('#add_deal_form #type_deal').val() == 2) {
    //             if ($(this).hasClass("bon_de_reduction") && $(this).hasClass('obligatoire')) {
    //                 verif_champs_obligatoire(this)
    //             }
    //         } else if ($('#add_deal_form #type_deal').val() == 3) {
    //             if ($(this).hasClass("gratuit") && $(this).hasClass('obligatoire')) {
    //                 verif_champs_obligatoire(this)
    //             }
    //         }
    //     });
    //     $('#add_deal_form #categories').removeClass("error");
    //     if (!$('#add_deal_form #master1_id').val() || $('#add_deal_form #master1_id').val() == "0") {
    //         error = true;
    //         $('#add_deal_form #categories').addClass("error")
    //     }
    //     $('#add_deal_form #sous_categories').removeClass("error");
    //     if ((!$('#add_deal_form #master2_id').attr('disabled') && (!$('#add_deal_form #master2_id').val() || $('#add_deal_form #master2_id').val() == "0")) && if_subcategory_verif == 0) {
    //         error = true;
    //         $('#add_deal_form #sous_categories').addClass("error")
    //     }
    //     check_region_checked($("#add_deal_form #online_status").val());
    //     validate_date("date_debut");
    //     validate_date("date_fin");
    //     if (is_valide_date["date_debut"] && is_valide_date["date_fin"]) {
    //         coherent_date("date_debut", "date_fin")
    //     } else {
    //         error = true
    //     }
    //     if (!error) {
    //         $("#add_deal_form #message_erreur_header").slideUp("fast");
    //         $("#add_deal_form .spinner_validate").show();
    //         $("#add_deal_form .enter_validate").attr('onclick', "");
    //         $(document.add_deal_form).trigger('submit');
    //     } else {
    //         $("#add_deal_form #message_erreur_header").slideDown("fast");
    //         $("#add_deal_form #message_erreur_header p").text(error_text)
    //     }
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
        // if (plugin_getParameterByName('tab', location.href) == "settings") {
        //     // #contener_profil_param .content_profil_param .profil_param_notification
        //     $('#left_profil_param').append('<a id="plugin_tab" class="menu_div_param" href="javascript:;" onclick="tab_change_profile(0, this);"><div class="div_tab_selector"><p>Plugin</p><p>Configuration du plugin.</p></div></a>');
        //     $('#right_profil_param .padding_right_profil_param').append('<div id="plugin_tab_content" class="content_profil_param" style="display: none;">\
        //             <div class="title_tab_contener">\
        //                 <p>Configuration du plugin (<span style="cursor:pointer;" data-plugin-role="version"></span>)</p>\
        //                 <p>Modifier les paramètres du plugins.</p>\
        //             </div>\
        //             <div class="content_tab_contener">\
        //                 <div class="subtitle_tab_contener">\
        //                     <p>Mise à jour</p>\
        //                 </div>\
        //                 <div class="profil_param_notification border_grey_bottom">\
        //                     <div class="left_profil_param_champs" style="width:50%;">\
        //                         <p>Intervalle de mise à jour&thinsp;:</p>\
        //                     </div>\
        //                     <div class="content_profil_param_champs">\
        //                         <div class="input_left flag">\
        //                             <select name="plugin_time_between_refresh" id="plugin_time_between_refresh">\
        //                                 <option value="">Chargement...</option>\
        //                             </select>\
        //                         </div>\
        //                         <span>Temps en secondes&thinsp;</span>\
        //                     </div>\
        //                 </div>\
        //                 <div class="subtitle_tab_contener">\
        //                     <p>Notifications</p>\
        //                 </div>\
        //                 <div class="profil_param_notification">\
        //                     <div class="left_profil_param_champs" style="width:50%;">\
        //                         <p>Notifications sur le bureau&thinsp;:</p>\
        //                     </div>\
        //                     <div class="content_profil_param_champs">\
        //                         <div class="input_left flag">\
        //                             <input type="checkbox" value="1" id="plugin_desktop_notifications" name="plugin_desktop_notifications">\
        //                             <label for="plugin_desktop_notifications">Oui</label>\
        //                         </div>\
        //                     </div>\
        //                 </div>\
        //                 <div class="profil_param_notification">\
        //                     <div class="left_profil_param_champs" style="width:50%;">\
        //                         <p>Notifications des deals&thinsp;:</p>\
        //                     </div>\
        //                     <div class="content_profil_param_champs">\
        //                         <div class="input_left flag">\
        //                             <input type="checkbox" value="1" id="plugin_deals_notifications" name="plugin_deals_notifications">\
        //                             <label for="plugin_deals_notifications">Oui</label>\
        //                         </div>\
        //                     </div>\
        //                 </div>\
        //                 <div class="profil_param_notification">\
        //                     <div class="left_profil_param_champs" style="width:50%;">\
        //                         <p>Notifications des alertes&thinsp;:</p>\
        //                     </div>\
        //                     <div class="content_profil_param_champs">\
        //                         <div class="input_left flag">\
        //                             <input type="checkbox" value="1" id="plugin_alertes_notifications" name="plugin_alertes_notifications">\
        //                             <label for="plugin_alertes_notifications">Oui</label>\
        //                         </div>\
        //                     </div>\
        //                 </div>\
        //                 <div class="profil_param_notification">\
        //                     <div class="left_profil_param_champs" style="width:50%;">\
        //                         <p>Notifications des MPs&thinsp;:</p>\
        //                     </div>\
        //                     <div class="content_profil_param_champs">\
        //                         <div class="input_left flag">\
        //                             <input type="checkbox" value="1" id="plugin_mp_notifications" name="plugin_mp_notifications">\
        //                             <label for="plugin_mp_notifications">Oui</label>\
        //                         </div>\
        //                     </div>\
        //                 </div>\
        //                 <div class="profil_param_notification border_grey_bottom">\
        //                     <div class="left_profil_param_champs" style="width:50%;">\
        //                         <p>Notifications du forum&thinsp;:</p>\
        //                     </div>\
        //                     <div class="content_profil_param_champs">\
        //                         <div class="input_left flag">\
        //                             <input type="checkbox" value="1" id="plugin_forum_notifications" name="plugin_forum_notifications">\
        //                             <label for="plugin_forum_notifications">Oui</label>\
        //                         </div>\
        //                     </div>\
        //                 </div>\
        //                 <div class="subtitle_tab_contener">\
        //                     <p>Theme</p>\
        //                 </div>\
        //                 <div class="profil_param_notification">\
        //                     <div class="left_profil_param_champs" style="width:50%;">\
        //                         <p>Theme&thinsp;:</p>\
        //                     </div>\
        //                     <div class="content_profil_param_champs">\
        //                         <div class="input_left flag">\
        //                             <select name="plugin_theme" id="plugin_theme">\
        //                                 <option value="">Chargement...</option>\
        //                             </select>\
        //                         </div>\
        //                     </div>\
        //                 </div>\<div class="profil_param_notification border_grey_bottom">\
        //                     <div class="left_profil_param_champs" style="width:50%;">\
        //                         <p>Emoticones&thinsp;:</p>\
        //                     </div>\
        //                     <div class="content_profil_param_champs">\
        //                         <div class="input_left flag">\
        //                             <select name="emoticone_theme" id="emoticone_theme">\
        //                                 <option value="">Chargement...</option>\
        //                             </select>\
        //                         </div>\
        //                     </div>\
        //                 </div>\
        //                 <div class="subtitle_tab_contener">\
        //                     <p>Images</p>\
        //                 </div>\
        //                 <div class="profil_param_notification border_grey_bottom">\
        //                     <div class="left_profil_param_champs" style="width:50%;">\
        //                         <p>Connexion à imgur&thinsp;:</p>\
        //                     </div>\
        //                     <div class="content_profil_param_champs">\
        //                         <p id="imgur-connexion">\
        //                             test de connexion en cours ...\
        //                         </p>\
        //                     </div>\
        //                 </div>\
        //                 <div class="subtitle_tab_contener">\
        //                     <p>Smileys</p>\
        //                 </div>\
        //                 <div class="profil_param_notification border_grey_bottom">\
        //                     <div class="left_profil_param_champs" id="plugin_smileys_list" style="width: 100%;overflow:auto;">\
        //                     <p>Pour des raisons de sécurité, merci de préferrer des images en https</p>\
        //                     <table style="width: 100%;">\
        //                         <thead><tr><th></th><th>Url</th><th>Nom</th><th></th></tr></thead>\
        //                         <tbody></tbody>\
        //                     </table>\
        //                     </div>\
        //                     <div class="content_profil_param_champs">\
        //                     </div>\
        //                 </div>\
        //                 <div class="profil_param_validation" style="padding-top:10px;">\
        //                     <a href="javascript:;" data-plugin-role="update_settings" class="validate_button_form background_color_button_blue" style="float:none; display:inline-block; margin-right:0px;">Sauvegarder les modifications</a>\
        //                 </div>\
        //                 <div onClick="$(this).next(\'div\').toggle()" class="subtitle_tab_contener plugin-debug">\
        //                     <p>Debug</p>\
        //                 </div>\
        //                 <div class="profil_param_notification border_grey_bottom plugin-debug" style="display:none;">\
        //                     <div class="left_profil_param_champs" style="width:50%;">\
        //                         <p>Liste des erreurs apparues&thinsp;:</p>\
        //                     </div>\
        //                     <div>\
        //                         <textarea name="" id="debug-logs" style="width:98%">loading...</textarea>\
        //                     </div>\
        //                 </div>\
        //             </div>\
        //         </div>');
        //     //load version
        //     $('[data-plugin-role="version"]').text(extension.getManifest().version);

        //     //load time_between_refresh
        //     $('#plugin_time_between_refresh').html("");
        //     for (var i = 0; i < time_between_refresh_list.length; i++) {
        //         $('#plugin_time_between_refresh').append('<option value="' + time_between_refresh_list[i] * 1000 + '"' + (settingsManager.time_between_refresh == time_between_refresh_list[i] * 1000 ? ' selected' : '') + '>' + time_between_refresh_list[i] + '</option>');
        //     }

        //     //check imgur API
        //     // $("#imgur-connexion");
        //     imgurManager.checkConnexion(function(response){
        //         if(response!=false){
        //             $("#imgur-connexion").html(extension._("you are connected with account $account$", response.url));
        //         }
        //         else{
        //             $("#imgur-connexion").html(extension._("you are not connected :")+"<em data-plugin-role=\"ask_for_imgur_token\" style=\"cursor:pointer\">"+extension._("click here")+"</em>");
        //             $(document).on("click", '[data-plugin-role="ask_for_imgur_token"]', function(){
        //                 imgurManager.askForToken();
        //             })
        //         }
        //     })
        //     // connected = false;
        //     // // a token is available and not expired ?
        //     // if(
        //     //     (settingsManager.imgurAPI.token != undefined && settingsManager.imgurAPI.tokenExpire > Date.now())
                
        //     // )
        //     // connected = true;

        //     if(settingsManager.imadevelopper){
        //         extension.getLogs(function(result){
        //             if(result == undefined || result.logs == undefined || result.logs.length==0){
        //                 $(".plugin-debug").hide();
        //                 return;
        //             }

        //             logs = result.logs;
        //             text = "";
        //             for (var i = logs.length - 1; i >= 0; i--) {
        //                 text += logs[i].stack
        //                 if(i-1>=0)
        //                     text+= "=================";
        //             }
        //             this.textarea.innerText = text;
        //         }.bind({textarea:document.querySelector("#debug-logs")}))
        //     }
        //     else{
        //         debugElements = document.querySelectorAll(".plugin-debug");
        //         for (var i = 0; i < debugElements.length; i++) {
        //             debugElements[i].remove();
        //         }
        //     }

        //     tryToBecomeDevelopper = 0;
        //     $(document).on("click", '[data-plugin-role="version"]', function(){
        //         if(settingsManager.imadevelopper){
        //             noty({
        //                 layout: 'topRight',
        //                 type: 'warning',
        //                 text: 'Vous êtes déjà un développeur ;) !',
        //                 dismissQueue: true,
        //                 timeout: 2000,
        //                 maxVisible: 1
        //             });
        //             return;   
        //         }

        //         if(++tryToBecomeDevelopper >= 7){
        //             noty({
        //                 layout: 'topRight',
        //                 type: 'success',
        //                 text: 'Yeahhh, vous êtes désormais considéré comme un développeur !',
        //                 dismissQueue: true,
        //                 timeout: 2000,
        //                 maxVisible: 1
        //             });
        //             settingsManager.imadevelopper = true;
        //         }
        //     })

        //     //load emoticone themes
        //     $('#emoticone_theme').on('change', function(){
        //         update_emoticone_theme($(this).find(":selected").data("emoticone_theme"));
        //     })
        //     $('#emoticone_theme').html("");
        //     theme_list = [
        //       {
        //         "safeName" : "default",
        //         "name": "Par défaut"
        //       },
        //     ];

        //     try{
        //         if(settingsManager.emoticone_theme.safeName != "default")
        //             theme_list.append(settingsManager.emoticone_theme);
        //     }
        //     catch(e){
        //     }
            
        //     for(name in theme_list){
        //         $option = $('<option value="' + theme_list[name].safeName + '"' + (settingsManager.emoticone_theme.safeName == theme_list[name].safeName ? ' selected' : '') + '>' + theme_list[name].name + '</option>');
        //         $option.data("emoticone_theme", theme_list[name]);
        //         $('#emoticone_theme').append($option);
        //     }

        //     $.ajax({
        //       url: emoticone_theme_list_url,
        //       dataType: "json",
        //       success: function(theme_list){
        //         $('#emoticone_theme').html("");
        //         for(name in theme_list){
        //             $option = $('<option value="' + theme_list[name].safeName + '"' + (settingsManager.emoticone_theme.safeName == theme_list[name].safeName ? ' selected' : '') + '>' + theme_list[name].name + '</option>');
        //             $option.data("emoticone_theme", theme_list[name]);
        //             $('#emoticone_theme').append($option);
        //         }
        //       }
        //     });

        //     //load time_between_refresh
        //     $('#plugin_theme').on('change', function(){
        //         update_theme($(this).find(":selected").data("theme"));
        //     })
        //     $('#plugin_theme').html("");
        //     theme_list = [
        //       {
        //         "safeName" : "default",
        //         "name": "Par défaut"
        //       },
        //     ];

        //     try{
        //         if(settingsManager.theme.safeName != "default")
        //             theme_list.append(settingsManager.theme);
        //     }
        //     catch(e){
        //     }
            
        //     for(name in theme_list){
        //         $option = $('<option value="' + theme_list[name].safeName + '"' + (settingsManager.theme.safeName == theme_list[name].safeName ? ' selected' : '') + '>' + theme_list[name].name + '</option>');
        //         $option.data("theme", theme_list[name]);
        //         $('#plugin_theme').append($option);
        //     }

        //     $.ajax({
        //       url: theme_list_url,
        //       dataType: "json",
        //       success: function(theme_list){
        //         $('#plugin_theme').html("");
        //         for(name in theme_list){
        //             $option = $('<option value="' + theme_list[name].safeName + '"' + (settingsManager.theme.safeName == theme_list[name].safeName ? ' selected' : '') + '>' + theme_list[name].name + '</option>');
        //             $option.data("theme", theme_list[name]);
        //             $('#plugin_theme').append($option);
        //         }
        //       }
        //     });

        //     $('#plugin_desktop_notifications').attr('checked', settingsManager.notifications_manage.desktop);
        //     $('#plugin_deals_notifications').attr('checked', settingsManager.notifications_manage.deals);
        //     $('#plugin_alertes_notifications').attr('checked', settingsManager.notifications_manage.alertes);
        //     $('#plugin_mp_notifications').attr('checked', settingsManager.notifications_manage.MPs);
        //     $('#plugin_forum_notifications').attr('checked', settingsManager.notifications_manage.forum);

        //     // //load turbopix key
        //     // $('#plugin_turbopix_key').val(settingsManager.turbopixAPIKey);

        //     //load smileys
        //     smileyTPL = '<tr><td>{{img}}</td><td style="padding-right: 20px;"><input style="box-sizing: border-box;" type="text" data-plugin-role="smiley_url" value="{{smiley_url}}" /></td><td style="padding-right: 20px;"><input style="box-sizing: border-box;" type="text" data-plugin-role="smiley_name" value="{{smiley_name}}" /></td><td onclick="$(this).parent(\'tr\').remove();" style="cursor:pointer;" ><img src="https://static.dealabs.com/images/profil/icon_profile_messages_delete.png"></td></tr>';
        //     $('#plugin_smileys_list tbody').html("");
        //     smileyList = settingsManager.smileys;
        //     for (smiley in smileyList) {
        //         tpl = smileyTPL.replace(/{{img}}/g, '<img style="max-height:40px;" src="{{smiley_url}}" alt=":{{smiley_name}}:" />').replace(/{{smiley_url}}/g, smileyList[smiley]).replace(/{{smiley_name}}/g, smiley);
        //         $('#plugin_smileys_list tbody').append(tpl);
        //     }
        //     //add plus button
        //     $('#plugin_smileys_list tbody').append('<tr><td style="cursor:pointer;text-align: center;" colspan="4"><a data-plugin-role="add_new_smiley" href="javascript:;" class="validate_button_form background_color_button_green enter_validate" style="float:none; display:inline-block; margin-right:0px;">Ajouter un nouveau smiley</a></td></tr>')

        //     $body.on('click', '[data-plugin-role="add_new_smiley"]', function() {
        //         $this = $(this);
        //         tpl = smileyTPL.replace(/{{img}}/g, "").replace(/{{smiley_url}}/g, "").replace(/{{smiley_name}}/g, "");
        //         $this.parents('tr').before(tpl);
        //     })

        //     //update settings
        //     $body.on('click', '[data-plugin-role="update_settings"]', function() {
        //         var save_smileys = {};
        //         $('#plugin_smileys_list tbody tr').each(function() {
        //             smiley_url = $(this).find('[data-plugin-role="smiley_url"]').val();
        //             if($(this).find('[data-plugin-role="smiley_url"]').val() != undefined){
        //                 smiley_name = $(this).find('[data-plugin-role="smiley_name"]').val().replace(/[^\w]/gi, "_").replace(/_+/gi, "_");
        //                 if (smiley_url != "" && typeof smiley_url != "undefined" && smiley_name != "" && typeof smiley_name != "undefined")
        //                     save_smileys[smiley_name] = smiley_url;
        //             }
        //         });

        //         newSettings = {
        //             time_between_refresh: parseInt($('#plugin_time_between_refresh').val()),
        //             theme: $('#plugin_theme').find(":selected").data("theme"),
        //             emoticone_theme: $('#emoticone_theme').find(":selected").data("emoticone_theme"),
        //             notifications_manage: {
        //                 desktop : $('#plugin_desktop_notifications').is(':checked'),
        //                 forum : $('#plugin_forum_notifications').is(':checked'),
        //                 MPs : $('#plugin_mp_notifications').is(':checked'),
        //                 deals : $('#plugin_deals_notifications').is(':checked'),
        //                 alertes : $('#plugin_alertes_notifications').is(':checked')
        //             },
        //             smileys: save_smileys
        //         }

        //         noty({
        //             layout: 'topRight',
        //             type: 'success',
        //             text: 'Vos paramètres ont bien été enregistrés.',
        //             dismissQueue: true,
        //             timeout: 2000,
        //             maxVisible: 1
        //         });


        //         settingsManager._updateCb = function(){
        //             extension.sendMessage('update_settings', {});
        //             settingsManager._updateCb = null;
        //         }
        //         settingsManager.settings = newSettings;
        //     });

        //     // #plugin_tab_content .content_tab_contener
        //     if (plugin_getParameterByName('what', location.href) == "plugin") {
        //         setTimeout(function(){$('#plugin_tab').get(0).click();}, 20);
        //     }
        // }
    })


    // $(function(){
    //     var script = document.createElement('script');
    //     script.src = '//cdnjs.cloudflare.com/ajax/libs/jquery-noty/2.3.8/packaged/jquery.noty.packaged.min.js';
    //     (document.body || document.head || document.documentElement).appendChild(script);
    // })
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