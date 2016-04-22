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

// function validate_edit_comment(comment_id) {
//     error = false;
//     $("#commentaire_div_textarea_" + comment_id + " .flag.obligatoire").each(function() {
//         verif_champs_obligatoire(this)
//     });
//     if (!error) {
//         $("#commentaire_div_textarea_" + comment_id + " .validate_form a").attr('onclick', "");
//         $("#commentaire_div_textarea_" + comment_id + " .spinner_validate").show();
//         $("#formedit_" + comment_id).trigger('submit');
//     } else {
//         alert("Vous devez entrer un commentaire.")
//     }
// }

// function validate_comment() {
//     error = false;
//     error_text = "Des champs obligatoires n’ont pas été remplis, ou l’ont été incorrectement.";
//     $("#discussed .flag.obligatoire").each(function() {
//         verif_champs_obligatoire(this)
//     });
//     if (!error) {
//         $("#discussed .message_erreur_header").hide();
//         $("#discussed .validate_form a").attr('onclick', "");
//         $("#discussed .spinner_validate").show();
//         if (typeof document.forms.comment_form.deal_id != 'undefined') {
//             var v = sessionStorage.getItem('comment_for_deal_' + document.forms.comment_form.deal_id.value);
//             if (v) {
//                 sessionStorage.removeItem('comment_for_deal_' + document.forms.comment_form.deal_id.value)
//             }
//         } else if (typeof document.forms.comment_form.thread_id != 'undefined') {
//             var v = sessionStorage.getItem('comment_for_thread_' + document.forms.comment_form.thread_id.value);
//             if (v) {
//                 sessionStorage.removeItem('comment_for_thread_' + document.forms.comment_form.thread_id.value)
//             }
//         }
//         $(document.comment_form).trigger('submit')
//     } else {
//         $("#discussed .message_erreur_header").slideDown("fast");
//         $("#discussed .message_erreur_header p").text(error_text)
//     }
// }

// function send_reply(number_form) {
//     error = false;
//     var error_text = "Des champs obligatoires n’ont pas été remplis.";
//     $("#reply_MP_form_" + number_form + " .flag.obligatoire").each(function() {
//         verif_champs_obligatoire(this)
//     });
//     if (!error) {
//         $("#reply_message.message_erreur_header").hide();
//         $("#reply_MP_form_" + number_form + " .enter_validate").attr('onclick', "");
//         $("#reply_MP_form_" + number_form + " .spinner_validate").show();
//         $(document.forms["reply_MP_form_" + number_form]).trigger('submit');
//     } else {
//         $("#reply_message.message_erreur_header").slideDown("fast");
//         $("#reply_message.message_erreur_header p").text(error_text)
//     }
// }

// function send_mp() {
//     error = false;
//     var error_text = "Des champs obligatoires n’ont pas été remplis, ou l’ont été incorrectement.";
//     $("#new_MP_form .flag.obligatoire").each(function() {
//         verif_champs_obligatoire(this)
//     });
//     if (!error) {
//         $("#all_contener_content_messagerie .message_erreur_header").hide();
//         $("#new_MP_form .enter_validate").attr('onclick', "");
//         $("#new_MP_form .spinner_validate").show();
//         console.log('trigger submit !');
//         jQuery(document.forms["new_MP_form"]).trigger('submit')
//     } else {
//         $("#all_contener_content_messagerie .message_erreur_header").slideDown("fast");
//         $("#all_contener_content_messagerie .message_erreur_header p").text(error_text)
//     }
// }



embedYTBTpl = '<iframe id="ytplayer" height="500" width="100%" type="text/html"\
  src="{{protocol}}//www.youtube.com/embed/{{id}}?autoplay=1&origin={{base_url}}"\
  frameborder="0"/>';
YTBLogo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAYAAAB24g05AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wgFEBsGdGFydgAAAUpJREFUKM99krFKXFEQhr8598gVXAyYNApioqAQF0KKPMGKLyEWlnkOCxtJGSzEWgVLwTxBLJJHSJNCMNEQiSibe2Z+C7fY624y8DfD/3/DmTn2/fXypCX7CLwDpoEpoAYmgIrHcqAB+sAdcAN8Veh9DtgxaYv/Vx5AO8BzYB7oCv5kl3qmMZGqggiQ/kkV9FJxzZYQw2qaQmdjk7TaxfMERfDUU0IU12zyUMdDtORB/eYtC8cnzOx+IC2v4BgjvlAnuUgl4KnkDsBMb425/QN4uUjjbY+LlD0UI28L4f0+zeUl14dH/NjbI+7usSpBeyVhXxZe/QRetNoePFtf4/bzOeX6F1bXkGzcHn/nEroYAZhxdXqG5QrqejBr7DUucoTOBF1Eal8+jwaHGYYMPuXGYyeZLQErQK3H31cNgGkoGoAbFOAv4ltI2w/zrcgq2WPx2AAAAABJRU5ErkJggg==";

embedSoundCloudTpl = '<iframe width="100%" height="166" scrolling="no" frameborder="no" src="{{protocol}}//w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/{{id}}&color={{color}}"></iframe>';
SoundCloudLogo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAcFJREFUeNqUU91KG1EQ/uZ026T5qa0gBjVexUhEKNYLQShIX0JoqxcS8yK96hOUgqEv0Ps+gC/gnRGlUPGnRXrRVk3X7DnHmdlskk0DJQeGmTMz33yzc2bJN/AawB7LY4x32ix14gI/UVmYRL4wHvzmGjg5vgrYnMSjHNBxvZj3/bwBE5RoMQQDTAXq6dgU0KvtU+CkABGl7lrA/7UDQNFetRsoSF1mQ2KTavEHmnMXdQExqwB9dgIuCpHZ+gDKPYW7PETny3sm+6VgqWb6HUQKFqDLFGFqrxCsv4G9PIIpPwdl2Te7DBRLCD9uIzBxN0JqlLkdqdDqJh7uNEHzq/BSzbrUFIPFlwjW3sIV5jRfQkYjPAOzvg0q1bR/nwCtH3oHILP5DplGU+cWdyDeMIJZ2ogBytzVkcc/TyGsM1WOxdw6D/AM/MVXEDMTl1WdfMKIY/c/g27aOgeyu9zJjyfdyeeBygrcaQtUfQF3cgA8m4Yn01sgCkPQWQsPxJ7+zUQNLvAth+Rr/dA2jlqmeBdY5m/jZ6Q7q5k0AjBylZN1ZglYzpGNZvGHUkn/PUUvuefSQR1l+4kvpTF/5++CvRdgAO38yAFPFQvXAAAAAElFTkSuQmCC"

embedDMTpl = '<iframe frameborder="0" width="100%" height="500" src="{{protocol}}//www.dailymotion.com/embed/video/{{id}}?autoplay=1" allowfullscreen></iframe>';
DMLogo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAJ1BMVEUAZN33+v7a6fpCjucGbd8ceeKuz/Ts8/yEte8zhuVioeudxPLG3Pfxm23KAAAAYElEQVR42n3OSwoAMQgD0PqL2vb+553PwrYMTMDNIxDbX9RMDxAgj0I4y163oAKVAAILZBK5e4GBfAQWCNMwTRR09/6s7BDabBTkJI4eXKCd35GCW8CMMZHr0Uy7T9snFx2sAnvnbX9dAAAAAElFTkSuQmCC";
function getSoundCloudLink(url){
  var regexp = /^https?:\/\/(soundcloud.com|snd.sc)\/(.*)$/;
  return url.match(regexp) && url.match(regexp)[0]
}

function getDailyMotionId(url) {
    var m = url.match(/^.+dailymotion.com\/(video|hub)\/([^_]+)[^#]*(#video=([^_&]+))?/);
    if (m !== null) {
        if(m[4] !== undefined) {
            return m[4];
        }
        return m[2];
    }
    return null;
}

function hexc(colorval) {
    var parts = colorval.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    delete(parts[0]);
    for (var i = 1; i <= 3; ++i) {
        parts[i] = parseInt(parts[i]).toString(16);
        if (parts[i].length == 1) parts[i] = '0' + parts[i];
    }
    color = '#' + parts.join('');

    return color;
}

function plugin_embed() {
    $('a.link_a_reduce').each(function() {
        link = this.title || this.innerText;
        youtubeID = link.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
        if (youtubeID != null && typeof youtubeID[1] != "undefined") {
            $(this).after(' <span data-plugin-embed-open="close" data-plugin-embed="youtube" data-plugin-id="' + youtubeID[1] + '"><img src="' + YTBLogo + '" alt="open or close youtube video"/></span>');
        }

        soundcloudLink = getSoundCloudLink(link);
        if(soundcloudLink != null){
            $.get(location.protocol+'//api.soundcloud.com/resolve.json?url='+soundcloudLink+'/tracks&client_id='+SoundCloudApiKey ,
            function (result) {
                $(this).after(' <span data-plugin-embed-open="close" data-plugin-embed="soundcloud" data-plugin-id="' + result.id + '"><img src="' + SoundCloudLogo + '" alt="open or close soundcloud video"/></span>');
            }.bind(this));
        }

        DMID = getDailyMotionId(link);
        if(DMID != null){
            $(this).after(' <span data-plugin-embed-open="close" data-plugin-embed="dailymotion" data-plugin-id="' + DMID + '"><img src="' + DMLogo + '" alt="open or close dailymotion video"/></span>');
        }
    });

    $('body').on('click', '[data-plugin-embed-open]', function() {
        console.log($(this).data('plugin-embed-open'));
        if ($(this).data('plugin-embed-open') == "close") {
            switch($(this).data('plugin-embed')){
                case 'youtube':
                    embedIframe = $(embedYTBTpl.replace(/{{protocol}}/g, location.protocol).replace(/{{base_url}}/, location.protocol + '//' + location.hostname).replace(/{{id}}/, $(this).data('plugin-id')));
                break;
                case 'soundcloud':
                    $quoteDiv = $('<div class="quote"></div>');
                    $('body').append($quoteDiv);
                    color = hexc($quoteDiv.css('backgroundColor'));
                    $quoteDiv.remove();
                    embedIframe = $(embedSoundCloudTpl.replace(/{{protocol}}/g, location.protocol).replace(/{{color}}/g, color).replace(/{{id}}/g, $(this).data('plugin-id')))
                break;
                case 'dailymotion':
                    embedIframe = $(embedDMTpl.replace(/{{protocol}}/g, location.protocol).replace(/{{id}}/g, $(this).data('plugin-id')))
                break;
            }
            this.embedIframe = embedIframe;
            $(this).after(embedIframe);
            $(this).data('plugin-embed-open', "open");
        } else {
            $(this.embedIframe).remove();
            $(this).data('plugin-embed-open', "close");
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
    inject(validate_thread);
    inject(validate_deal);
    // inject(validate_comment); override repair
    // inject(send_reply);
    // inject(send_mp);
    // inject(validate_edit_comment);
    inject(plugin_escapeRegExp);

    inject(plugin_update_emoticone_textarea);
    inject(plugin_insertSmiley);

    plugin_update_emoticone_textarea();
    $body = $('body');
    plugin_embed();
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

    if(linkInfos = location.pathname.match(/^\/([^\/]+)\/.*\/([0-9]+)$/)){
        blacklisted =  (typeof plugin_settings.blacklist[linkInfos[1]+'-'+linkInfos[2]] != "undefined");
        $('#bloc_option .bloc_option_white').prepend('<div class="button_part">\
                <div class="bouton_contener_border" data-plugin-link-info="'+linkInfos[1]+'-'+linkInfos[2]+'" id="plugin-blacklist-notification">\
                    <div class="yes_part '+(blacklisted?'yes':'')+'"></div>\
                    <div class="no_part '+(blacklisted?'':'no')+'"></div>\
                </div>\
            </div>\
            \
            <div class="title_button_part">\
                <p>bloquer les notifications</p>\
                <p>Cacher les notifications des nouvelles réponses</p>\
            </div>');

        $('#plugin-blacklist-notification').on('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            if($(this).find('.yes').length == 0){// => is not already blacklisted
                plugin_settings.blacklist[$(this).data('plugin-link-info')] = true;
            }
            else{
                delete plugin_settings.blacklist[$(this).data('plugin-link-info')];
            }
            chrome.storage.sync.set({
                'settings': plugin_settings
            });
            port.postMessage({"action" : "update_settings"});
            
            blacklisted = (typeof plugin_settings.blacklist[$(this).data('plugin-link-info')] != "undefined");
            $(this).html('<div class="yes_part '+(blacklisted?'yes':'')+'"></div>\
                    <div class="no_part '+(blacklisted?'':'no')+'"></div>');

            return false;
        });
    }
    // console.log(jQuery._data( $(document)[0], "events" ));
})