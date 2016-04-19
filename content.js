var port = chrome.extension.connect({name: "send to background"});
Object.size = function(obj) {
    var size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function plugin_getParameterByName(name, url) {
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
function validate_edit_comment(comment_id) {
    error = false;
    $("#commentaire_div_textarea_" + comment_id + " .flag.obligatoire").each(function() {
        verif_champs_obligatoire(this)
    });
    if (!error) {
        $("#commentaire_div_textarea_" + comment_id + " .validate_form a").attr('onclick', "");
        $("#commentaire_div_textarea_" + comment_id + " .spinner_validate").show();
        $("#formedit_" + comment_id).trigger('submit');
    } else {
        alert("Vous devez entrer un commentaire.")
    }
}

function validate_comment() {
    error = false;
    error_text = "Des champs obligatoires n’ont pas été remplis, ou l’ont été incorrectement.";
    $("#discussed .flag.obligatoire").each(function() {
        verif_champs_obligatoire(this)
    });
    if (!error) {
        $("#discussed .message_erreur_header").hide();
        $("#discussed .validate_form a").attr('onclick', "");
        $("#discussed .spinner_validate").show();
        if (typeof document.forms.comment_form.deal_id != 'undefined') {
            var v = sessionStorage.getItem('comment_for_deal_' + document.forms.comment_form.deal_id.value);
            if (v) {
                sessionStorage.removeItem('comment_for_deal_' + document.forms.comment_form.deal_id.value)
            }
        } else if (typeof document.forms.comment_form.thread_id != 'undefined') {
            var v = sessionStorage.getItem('comment_for_thread_' + document.forms.comment_form.thread_id.value);
            if (v) {
                sessionStorage.removeItem('comment_for_thread_' + document.forms.comment_form.thread_id.value)
            }
        }
        $(document.comment_form).trigger('submit')
    } else {
        $("#discussed .message_erreur_header").slideDown("fast");
        $("#discussed .message_erreur_header p").text(error_text)
    }
}

function send_reply(number_form) {
    error = false;
    var error_text = "Des champs obligatoires n’ont pas été remplis.";
    $("#reply_MP_form_" + number_form + " .flag.obligatoire").each(function() {
        verif_champs_obligatoire(this)
    });
    if (!error) {
        $("#reply_message.message_erreur_header").hide();
        $("#reply_MP_form_" + number_form + " .enter_validate").attr('onclick', "");
        $("#reply_MP_form_" + number_form + " .spinner_validate").show();
        $(document.forms["reply_MP_form_" + number_form]).trigger('submit');
    } else {
        $("#reply_message.message_erreur_header").slideDown("fast");
        $("#reply_message.message_erreur_header p").text(error_text)
    }
}



function send_mp() {
    error = false;
    var error_text = "Des champs obligatoires n’ont pas été remplis, ou l’ont été incorrectement.";
    $("#new_MP_form .flag.obligatoire").each(function() {
        verif_champs_obligatoire(this)
    });
    if (!error) {
        $("#all_contener_content_messagerie .message_erreur_header").hide();
        $("#new_MP_form .enter_validate").attr('onclick', "");
        $("#new_MP_form .spinner_validate").show();
        console.log('trigger submit !');
        jQuery(document.forms["new_MP_form"]).trigger('submit')
    } else {
        $("#all_contener_content_messagerie .message_erreur_header").slideDown("fast");
        $("#all_contener_content_messagerie .message_erreur_header p").text(error_text)
    }
}

inject(validate_comment);
inject(send_reply);
inject(send_mp);
inject(validate_edit_comment);
inject(plugin_escapeRegExp);

inject(plugin_update_emoticone_textarea);
inject(plugin_insertSmiley);

iframeTpl = '<div class="quote" style="height: 500px;"><iframe id="ytplayer" height="100%" width="100%" type="text/html"\
  src="{{protocol}}//www.youtube.com/embed/{{id}}?autoplay=1&origin={{base_url}}"\
  frameborder="0"/></div>';

YTBLogo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAYAAAB24g05AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wgFEBsGdGFydgAAAUpJREFUKM99krFKXFEQhr8598gVXAyYNApioqAQF0KKPMGKLyEWlnkOCxtJGSzEWgVLwTxBLJJHSJNCMNEQiSibe2Z+C7fY624y8DfD/3/DmTn2/fXypCX7CLwDpoEpoAYmgIrHcqAB+sAdcAN8Veh9DtgxaYv/Vx5AO8BzYB7oCv5kl3qmMZGqggiQ/kkV9FJxzZYQw2qaQmdjk7TaxfMERfDUU0IU12zyUMdDtORB/eYtC8cnzOx+IC2v4BgjvlAnuUgl4KnkDsBMb425/QN4uUjjbY+LlD0UI28L4f0+zeUl14dH/NjbI+7usSpBeyVhXxZe/QRetNoePFtf4/bzOeX6F1bXkGzcHn/nEroYAZhxdXqG5QrqejBr7DUucoTOBF1Eal8+jwaHGYYMPuXGYyeZLQErQK3H31cNgGkoGoAbFOAv4ltI2w/zrcgq2WPx2AAAAABJRU5ErkJggg==";

function plugin_viewYoutubeInline() {
    $('a.link_a_reduce').each(function() {
        link = this.title || this.innerText;
        youtubeID = link.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
        if (youtubeID != null && typeof youtubeID[1] != "undefined") {
            $(this).after(' <span data-userscript-ytb-iframe="close" data-userscript-ytb-id="' + youtubeID[1] + '"><img src="' + YTBLogo + '" alt="open or close youtube video"/></span>');
        }
        //debugger;
    });

    $('body').on('click', '[data-userscript-ytb-id]', function() {
        console.log($(this).data('userscript-ytb-iframe'));
        if ($(this).data('userscript-ytb-iframe') == "close") {
            iframeYTB = $(iframeTpl.replace(/{{protocol}}/g, location.protocol).replace(/{{base_url}}/, location.protocol + '//' + location.hostname).replace(/{{id}}/, $(this).data('userscript-ytb-id')));
            this.iframeYTB = iframeYTB;
            $(this).after(iframeYTB);
            $(this).data('userscript-ytb-iframe', "open");
        } else {
            $(this.iframeYTB).remove();
            $(this).data('userscript-ytb-iframe', "close");
        }
    });
}


function plugin_generatePreview(commentContainer, commentaire) {
    userData = jQuery('#pseudo_right_header_contener');

    replacements = {};

    if (typeof commentaire == "undefined")
        return;

    current_smileys = plugin_settings.smileys
    for (var nom in current_smileys) {
        commentaire = commentaire.replace(new RegExp(':' + plugin_escapeRegExp(nom) + ':', 'g'), '[img size="300px"]' + current_smileys[nom] + '[/img]');
    }

    for (var i = 0; i < plugin_BBcodes.length; i++) {
        if (typeof replacements[plugin_BBcodes[i].name] == "undefined")
            replacements[plugin_BBcodes[i].name] = [];

        bbcodes_found = plugin_match_all(plugin_BBcodes[i].regex, commentaire);
        for (var j = bbcodes_found.length - 1; j >= 0; j--) {
            cur_bbcodes_found = bbcodes_found[j][0];

            subst = plugin_BBcodes[i].name + '_' + replacements[plugin_BBcodes[i].name].length

            commentaire = commentaire.replace(new RegExp(plugin_escapeRegExp(cur_bbcodes_found)), '[' + subst + ']');
            replacements[plugin_BBcodes[i].name].push({
                subst: subst,
                after: cur_bbcodes_found.replace(plugin_BBcodes[i].regex, plugin_BBcodes[i].html)
            });
        }
    }

    //match url, and replace by bbcode, for escape smiley
    if (typeof replacements["link"] == "undefined")
        replacements["link"] = [];
    urls = plugin_getUrls(commentaire);
    for (var i = urls.length - 1; i >= 0; i--) {
        subst = 'link_' + replacements["link"].length
        commentaire = commentaire.replace(new RegExp(plugin_escapeRegExp(urls[i])), '[' + subst + ']');
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

    //match smiley
    for (var i = 0; i < plugin_BBcodesSmiley.length; i++) {
        commentaire = commentaire.replace(new RegExp(plugin_escapeRegExp(plugin_BBcodesSmiley[i].smiley), 'gi'), '<img src="http://static.dealabs.com/images/smiley/' + plugin_BBcodesSmiley[i].name + '.png" width="16" height="16" alt="' + plugin_BBcodesSmiley[i].smiley + '" title="' + plugin_BBcodesSmiley[i].smiley + '" class="bbcode_smiley">')
    }

    for (code in replacements) {
        for (var i = 0; i < replacements[code].length; i++) {
            cur_code = replacements[code][i];
            commentaire = commentaire.replace(new RegExp('\\[' + cur_code.subst + '\\]'), cur_code.after);
        }
    }

    commentContainer = commentContainer.replace(/{{userlink}}/g, userData.attr('href'));
    commentContainer = commentContainer.replace(/{{useravatar}}/g, userData.find('img').attr('src'));
    commentContainer = commentContainer.replace(/{{username}}/g, userData.find('span').text());
    commentContainer = commentContainer.replace(/{{commentaire}}/g, plugin_nl2br(commentaire));
    return commentContainer;
}


function plugin_insertSmiley() {
    textarea = jQuery(this).parents('.formating_text_contener').parent('div').find('textarea');
    if (textarea.length > 0) {
        textarea = textarea.get(0);
    } else {
        return;
    }

    var scrollTop = textarea.scrollTop;
    var scrollLeft = textarea.scrollLeft;

    var nom = this.getElementsByTagName('img')[0].getAttribute("title");
    textarea.focus();
    //textarea.value += '[img size="300px"]'+image+"[/img]";
    //add smiley at cursor position
    var cursorPos = jQuery(textarea).prop('selectionStart');
    var v = jQuery(textarea).val()
    v = v.slice(0, textarea.selectionStart) + v.slice(textarea.selectionEnd);;
    var textBefore = v.substring(0, cursorPos);
    var textAfter = v.substring(cursorPos, v.length);
    $(textarea).val(textBefore + ':' + nom + ":" + textAfter);

    //positionne cursor in textarea
    selectionStart = selectionEnd = (textBefore + ':' + nom + ":").length
    if (textarea.setSelectionRange) {
        textarea.focus();
        textarea.setSelectionRange(selectionStart, selectionEnd);
    } else if (textarea.createTextRange) {
        var range = textarea.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
    }

    // textarea.value += ':'+nom+":";
    textarea.scrollTop = scrollTop;
    textarea.scrollLeft = scrollLeft;
}


function plugin_update_emoticone_textarea() {
    if (typeof jQuery == "undefined")
        return;


    jQuery('.third_part_button').each(function(index, value) {
        c = this;

        for (var title in plugin_settings.smileys) {
            mm = document.createElement("a");
            mm.href = "javascript:;";
            mm.setAttribute("style", 'text-decoration:none');
            mm.dataset.role = "emoticone_add_userscript";
            mm.innerHTML = '<img style="max-height:20px" title="' + title + '" src="' + plugin_settings.smileys[title] + '" alt="' + title + '"/>';
            mm.addEventListener("click", plugin_insertSmiley, true);
            c.appendChild(mm);
        }
    });
}

function update_theme(theme){
    theme_css = document.querySelectorAll('[data-plugin-role="theme_css"]');
    for (var i = 0; i < theme_css.length; i++) {
        theme_css[i].parentNode.removeChild(theme_css[i]);
    }

    if(theme != "default"){
        // add darklabs theme
        var link = document.createElement( "link" );
        link.href = theme_url+theme+'.css';
        link.type = "text/css";
        link.rel = "stylesheet";
        link.dataset.pluginRole = 'theme_css';
        link.media = "screen,print";
        document.getElementsByTagName("head")[0].appendChild( link );
        if(window.location.pathname.match(/^\/forum/)){
            var link = document.createElement( "link" );
            link.href = theme_url+theme+'-forum.css';
            link.type = "text/css";
            link.dataset.pluginRole = 'theme_css';
            link.rel = "stylesheet";
            link.media = "screen,print";
            document.getElementsByTagName("head")[0].appendChild( link );
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
        chrome.storage.sync.get('settings', function(value){
            update_theme(value.settings.theme);
        });
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

$(function() {
    plugin_update_emoticone_textarea();
    $body = $('body');
    plugin_viewYoutubeInline();
    //settings
    if (plugin_getParameterByName('tab', location.href) == "settings") {
        // #contener_profil_param .content_profil_param .profil_param_notification
        $('#left_profil_param').append('<a id="plugin_tab" class="menu_div_param" href="javascript:;" onclick="tab_change_profile(0, this);"><div class="div_tab_selector"><p>Plugin</p><p>Configuration du plugin.</p></div></a>');
        $('#right_profil_param .padding_right_profil_param').append('<div id="plugin_tab_content" class="content_profil_param" style="display: block;">\
                <div class="title_tab_contener">\
                    <p>Configuration du plugin (<span data-plugin-role="version"></span>)</p>\
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
                    <div class="profil_param_notification border_grey_bottom">\
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
                    </div>\
                    <div class="subtitle_tab_contener">\
                        <p>Smileys</p>\
                    </div>\
                    <div class="profil_param_notification border_grey_bottom">\
                        <div class="left_profil_param_champs" id="plugin_smileys_list" style="width: 100%;overflow:auto;">\
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
                </div>\
            </div>');
        //load version
        $('[data-plugin-role="version"]').text(chrome.runtime.getManifest().version);

        //load time_between_refresh
        $('#plugin_time_between_refresh').html("");
        for (var i = 0; i < time_between_refresh_list.length; i++) {
            $('#plugin_time_between_refresh').append('<option value="' + time_between_refresh_list[i] * 1000 + '"' + (plugin_settings.time_between_refresh == time_between_refresh_list[i] * 1000 ? ' selected' : '') + '>' + time_between_refresh_list[i] + '</option>');
        }

        //load time_between_refresh
        $('#plugin_theme').on('change', function(){
            update_theme($(this).val());
        })
        $('#plugin_theme').html("");
        for(name in theme_list){
            $('#plugin_theme').append('<option value="' + theme_list[name] + '"' + (plugin_settings.theme == theme_list[name] ? ' selected' : '') + '>' + name + '</option>');
        }

        $('#plugin_desktop_notifications').attr('checked', plugin_settings.notifications_manage.desktop);
        $('#plugin_deals_notifications').attr('checked', plugin_settings.notifications_manage.deals);
        $('#plugin_alertes_notifications').attr('checked', plugin_settings.notifications_manage.alertes);
        $('#plugin_mp_notifications').attr('checked', plugin_settings.notifications_manage.MPs);
        $('#plugin_forum_notifications').attr('checked', plugin_settings.notifications_manage.forum);

        //load smileys
        smileyTPL = '<tr><td>{{img}}</td><td style="padding-right: 20px;"><input style="box-sizing: border-box;" type="text" data-plugin-role="smiley_url" value="{{smiley_url}}" /></td><td style="padding-right: 20px;"><input style="box-sizing: border-box;" type="text" data-plugin-role="smiley_name" value="{{smiley_name}}" /></td><td onclick="$(this).parent(\'tr\').remove();" style="cursor:pointer;" ><img src="https://static.dealabs.com/images/profil/icon_profile_messages_delete.png"></td></tr>';
        $('#plugin_smileys_list tbody').html("");
        smileyList = plugin_settings.smileys;
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
                smiley_name = $(this).find('[data-plugin-role="smiley_name"]').val();
                if (smiley_url != "" && typeof smiley_url != "undefined" && smiley_name != "" && typeof smiley_name != "undefined")
                    save_smileys[smiley_name] = smiley_url;
            });

            newSettings = {
                time_between_refresh: parseInt($('#plugin_time_between_refresh').val()),
                theme: $('#plugin_theme').val(),
                notifications_manage: {
                    desktop : $('#plugin_desktop_notifications').is(':checked'),
                    forum : $('#plugin_forum_notifications').is(':checked'),
                    MPs : $('#plugin_mp_notifications').is(':checked'),
                    deals : $('#plugin_deals_notifications').is(':checked'),
                    alertes : $('#plugin_alertes_notifications').is(':checked')
                },
                smileys: save_smileys
            }
            newSettings = plugin_deepmerge(defaultSettings, newSettings);

            cb = function(){$success_message.slideDown(500);}
            if($(this).parents('#right_profil_param').find('.message_success').length > 0){
                $(this).parents('#right_profil_param').find('.message_success').slideUp(500,function(){
                    $(this).find('p').text('Vos paramètres ont bien été enregistrés.');
                    cb();
                })
            }
            else{
                $success_message = $('<div class="message_success" style="display:none"><p>Vos paramètres ont bien été enregistrés.</p></div>');
                $(this).parents('#right_profil_param').prepend($success_message);
                cb();
            }

            chrome.storage.sync.set({
                'settings': newSettings
            });
            plugin_settings = newSettings;
            port.postMessage({"action" : "update_settings"});
        });

        // #plugin_tab_content .content_tab_contener
        if (plugin_getParameterByName('what', location.href) == "plugin") {
            setTimeout(function(){$('#plugin_tab').get(0).click();}, 500);
        }
    }

    // $('.click_div_spoiler').removeClass('click_div_spoiler').addClass('plugin_click_div_spoiler');
    // $('.commentaire_div > div.quote > div.quote_pseudo > p.pseudo_tag > a.open').removeClass('open').addClass('plugin_spoiler_open');

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
    // inject("$('.click_div_spoiler').off('click');$('.commentaire_div > div.quote > div.quote_pseudo > p.pseudo_tag > a.open').off('click');");
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

    $('.validate_button_form').each(function(index) {
        if ($(this).parents('#right_profil_param').length > 0 
            || $(this).parents('#post_conteneur').length > 0 
            || $(this).parents('#add_alert').length > 0
            || $(this).parents('#all_notification_alert').length > 0
        )
            return;

        // debugger;
        clone = $(this).clone(false).attr('onclick', null).clone(false).attr('accesskey', 'p').text("Prévisualiser");
        // console.log(clone);
        $(this).after(clone);
        clone.on('click', function(e) {
            // e.preventDefault();
            // e.stopPropagation();
            // debugger;
            if ($(this).parents('#discussed').length > 0) {
                $putContainer = $('#comment_contener');
                func = "append";
                commentContainer = '<div id="_userscript_preview_container" data-userscript="comment_contener" style="display:none;" class="padding_comment_contener">\
              <div class="profil_image_part">\
                  <a href="{{userlink}}" class="open_profil"><img src="{{useravatar}}"></a>\
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
              <div class="profil_image_part">\
                  <a href="{{userlink}}" class="open_profil"><img src="{{useravatar}}"></a>\
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
            }

            commentaire = $(this).parents('form').find('textarea').val();
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

    // console.log(jQuery._data( $(document)[0], "events" ));
    inject("$(document).on('submit', 'form', function(event) {\
        text = $(this).find('[name=\"post_content\"]').val();\
        if (typeof text == 'undefined') return;\
        current_smileys = JSON.parse('"+JSON.stringify(plugin_settings.smileys)+"');\
        for (var nom in current_smileys) {\
            text = text.replace(new RegExp(':' + plugin_escapeRegExp(nom) + ':', 'g'), '[img size=\"300px\"]' + current_smileys[nom] + '[/img]');\
        };\
        $(this).find('[name=\"post_content\"]').val(text);\
    })");
    // console.log(jQuery._data( $(document)[0], "events" ));
})