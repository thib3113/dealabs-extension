class Dealabs{
    generatePreview(commentContainer, commentaire){
        userData = jQuery('#open_member_parameters');

        replacements = {};

        if (typeof commentaire == "undefined")
            return;

        current_smileys = settingsManager.smileys
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

        //transform smileys to a bbcode
        for (var i = 0; i < plugin_BBcodesSmiley.length; i++) {
            commentaire = commentaire.replace(new RegExp(plugin_escapeRegExp(plugin_BBcodesSmiley[i].smiley), 'gi'), '[' + plugin_BBcodesSmiley[i].name + ']');
        }
        //transform smiley bbcode to image
        for (var i = 0; i < plugin_BBcodesSmiley.length; i++) {
            commentaire = commentaire.replace(new RegExp(plugin_escapeRegExp('[' + plugin_BBcodesSmiley[i].name + ']'), 'gi'), '<img src="https://static.dealabs.com/images/smiley/' + plugin_BBcodesSmiley[i].icon + '.png" width="auto" height="auto" alt="' + plugin_BBcodesSmiley[i].smiley + '" title="' + plugin_BBcodesSmiley[i].smiley + '" class="bbcode_smiley">')
        }

        for (code in replacements) {
            for (var i = 0; i < replacements[code].length; i++) {
                cur_code = replacements[code][i];
                commentaire = commentaire.replace(new RegExp('\\[' + cur_code.subst + '\\]'), cur_code.after);
            }
        }

        commentContainer = commentContainer.replace(/{{userlink}}/g, jQuery("#member_parameters a:first").attr('href'));
        commentContainer = commentContainer.replace(/{{useravatar}}/g, userData.find('img').attr('src'));
        commentContainer = commentContainer.replace(/{{username}}/g, jQuery("#member_parameters a:first").find('span').text());
        commentContainer = commentContainer.replace(/{{commentaire}}/g, plugin_nl2br(commentaire));
        return commentContainer;
    }

    submitForm(){
        debugger;
    }

    constructor(){
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
            
            $(function(){
                $("#comment_form").each(function(){
                    //to submit a form : 
                    // - inject script in the page, sending a message to the content.js
                    // - from content.js respond with modified version

                    this.onSubmit =  self.submitForm;
                })
                $(document).on('submit', 'form', function(event) {
                    text = $(this).find('[name="post_content"]').val();
                    if(text != undefined && text.match(/[img_wait_upload:[0-9]+]/)){
                        event.stopPropagation();
                        $('.spinner_validate').hide(0);
                        $(this).find('.spinner_validate').parent('a').attr('onclick', 'validate_comment();');
                        noty({
                            layout: 'bottom',
                            type: 'error',
                            text: 'une image est en cours d\'upload, reessayer plus tard',
                            dismissQueue: true,
                            timeout: 2000,
                            maxVisible: 1
                        });
                        return false;
                    }
                    if (typeof text == 'undefined') return;
                    current_smileys = JSON.parse('"+JSON.stringify(settingsManager.smileys)+"');
                    for (var nom in current_smileys) {
                        text = text.replace(new RegExp(':' + plugin_escapeRegExp(nom) + ':', 'g'), '[img size=300px]' + current_smileys[nom] + '#plugin_smiley[/img]');
                    };
                    $(this).find('[name="post_content"]').val(text);
                })
            })
        }
        ////////////////
        // RESSOURCES //
        ////////////////

        this.BBcodes = [
            {
              regex : /\[img size="?([0-9]*)px"?\]([^\]]*)\[\/img\]/gi,
              html : '<img alt="" class="BBcode_image" onclick="window.open(this.src);" style="max-width:$1px;" src="$2">',
              name : 'img'
            },
            {
              regex : /\[img size="?([0-9]*)"?\]([^\]]*)\[\/img\]/gi,
              html : '<img alt="" class="BBcode_image" onclick="window.open(this.src);" style="max-width:$1px;" src="$2">',
              name : 'img'
            },
            {
              regex : /\[img\s*\]([^\]]*)\[\/img\]/gi,
              html : '<img alt="" class="BBcode_image" onclick="window.open(this.src);" style="max-width:300px;" src="$1">',
              name : 'img'
            },
            {
              regex : /\[citer pseudo="?([^"]*)"?\]/gi,
              html : '<div class="quote">\
              <div class="quote_pseudo text_color_777777">\
                  <p class="pseudo_tag">\
                      <span class="text_color_333333">$1</span><span> a écrit</span><a href="javascript:;" class="open text_color_777777">Afficher l\'intégralité de la citation</a>\
                  </p>\
              </div>\
              <div class="quote_message text_color_777777">',
              name : 'quote_start'
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
              name : 'quote_start'
            },
            {
              regex : /\[\/citer\]/gi,
              html : '</div></div>',
              name : 'quote_end'
            },
            {
              regex : /\[spoiler\s*\]/gi,
              html : '<div class="spoiler">\
                    <a href="javascript:;" class="click_div_spoiler text_color_333333">Ce message a été masqué par son auteur. Cliquez pour l’afficher.</a>\
                    <div class="spoiler_hide text_color_777777" style="display: none;">',
              name : 'spoil_start'
            },
            {
              regex : /\[\/spoiler\]/gi,
              html : '</div></div>',
              name : 'spoil_end'
            },
            {
              regex : /\[b\]/gi,
              html : '<b>',
              name : 'b_end'
            },
            {
              regex : /\[\/b\]/gi,
              html : '</b>',
              name : 'b_end'
            },
            {
              regex : /\[i\]/gi,
              html : '<i>',
              name : 'i_end'
            },
            {
              regex : /\[\/i\]/gi,
              html : '</i>',
              name : 'i_end'
            },
            {
              regex : /\[u\]/gi,
              html : '<u>',
              name : 'u_end'
            },
            {
              regex : /\[\/u\]/gi,
              html : '</u>',
              name : 'u_end'
            },
            {
              regex : /\[s\]/gi,
              html : '<del>',
              name : 'del_end'
            },
            {
              regex : /\[\/s\]/gi,
              html : '</del>',
              name : 'del_end'
            },
            {
              regex : /\[up\]/gi,
              html : '<font style="font-size:1.2em;">',
              name : 'up_end'
            },
            {
              regex : /\[\/up\]/gi,
              html : '</font>',
              name : 'up_end'
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
        ]
    }
    
}