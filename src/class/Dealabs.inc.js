class Dealabs{
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

        vars.commentaire = this.parseEmoticons(vars.commentaire)

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

    parseEmoticons(text){
        if(text == undefined || text.length == 0)
            return text

        var current_smileys = settingsManager.smileys
        for (var nom in current_smileys) {
            text = text.replace(new RegExp(':' + this.escapeRegExp(nom) + ':', 'g'), '[img size=300px]' + current_smileys[nom] + '#plugin_smiley[/img]');
        };

        return text;
    }

    initBGListeners(){
        extension.onMessage("content-parse_emoticons", function(datas, cb){
            var text = datas.text;
            text = this.parseEmoticons(text);
            cb({
                success:true,
                text:text
            })
        }.bind(this));
    }

    pushTextInSelection(text, input){
        var scrollTop = input.scrollTop;
        var scrollLeft = input.scrollLeft;

        input.focus();
        //add smiley at cursor position
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
            EmbedLinksManager.addLink(this);
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

    generateTemplate(formType){
        var htmlTemplate;

        if(this.compiledTemplates == undefined)
            this.compiledTemplates = {};

        switch(formType){
            case "new_comment":
            case "edit_comment" :
                htmlTemplate = '\
                    <div class="padding_comment_contener" id="_userscript_preview_container" data-userscript="comment_container">\
                            <div class="padding">\
                                <div class="profil_part">\
                                    <div class="avatar_contener">\
                                        <a class="avatar" href="{{userlink}}">\
                                            <img src="{{useravatar}}">\
                                        </a>\
                                        <div class="rewards">\
                                            <a class="reward_tipsy" original-title="'+extension._("use the $navigator$ extension", extension.getNavigator())+'" href="javascript:;" rel="nofollow"><img src="https://thib3113.github.io/dealabs-extension/img/rewards_dealabs_extension.png"></a>\
                                        </div>\
                                    </div>\
                                </div>\
                                <div class="comment_text_part">\
                                    <div class="header_comment">\
                                        <a href="{{userlink}}" class="pseudo text_color_blue">{{username}}</a>\
                                        <p><span>'+extension._("preview_name")+'</span></p>\
                                    </div>\
                                    <div>\
                                        <div class="commentaire_div">\
                                          {{{commentaire}}}\
                                        </div>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>\
                    </div>\
                ';
            break;
            case "add_thread" :
                htmlTemplate = '\
                    <article class="structure" id="deal_details">\
                        <div class="deal_content" id="_userscript_preview_container" data-userscript="comment_container">\
                            <div class="detail_part">\
                                <div class="profil_part">\
                                    <a class="pseudo" href="{{userlink}}" rel="nofollow">{{username}}</a>\
                                    <div class="avatar_contener">\
                                        <a class="avatar" href="{{userlink}}" rel="nofollow">\
                                            <img src="{{useravatar}}">\
                                        </a>\
                                    </div>\
                                    <div class="rewards">\
                                        <a class="reward_tipsy" original-title="'+extension._("use the $navigator$ extension", extension.getNavigator())+'" href="javascript:;" rel="nofollow"><img src="https://thib3113.github.io/dealabs-extension/img/rewards_dealabs_extension.png"></a>\
                                    </div>\
                                </div>\
                            </div>\
                            <div class="deal_detail_deal_part">\
                                <div class="deal_title_part">\
                                    <div class="title_part">\
                                        <h1 class="title">{{title}}</h1>\
                                        <p class="date_deal" original-title="'+extension._("preview_name")+'">\
                                            <img title="'+extension._("preview_name")+'" style="width: 13px; height: 13px;" src="https://static.dealabs.com/images/deals/icon_deal_published.png">'+extension._("preview_name")+'\
                                        </p>\
                                    </div>\
                                </div>\
                                <div class="deal_content_part">\
                                    <div class="content_part" style="padding:0px;">\
                                        <p class="description">\
                                            {{{commentaire}}}\
                                        </p>\
                                    </div>\
                                </div>\
                            </div>\
                        </div>\
                    </article>\
                ';
            break;
            case "reply_MP":
                htmlTemplate = '\
                    <div id="_userscript_preview_container" data-userscript="comment_container" class="content_message background_color_white">\
                        <div class="profil_message">\
                            <div class="image_profil">\
                                <img src="{{useravatar}}">\
                            </div>\
                            <div class="right_titre_message">\
                            </div>\
                            <div class="info_message">\
                                <p class="username text_color_333333">{{username}}</p>\
                                <p class="date text_color_777777" style="float:left;">'+extension._("preview_name")+'</p>\
                            </div>\
                        </div>\
                        <p class="text_color_777777 message_content_text" style="padding:15px 0px;">\
                            {{{commentaire}}}\
                        </p>\
                        {{#if attachment}}\
                        <div class="piece_jointe_div">\
                            <div class="type_part">'+extension._("attachment")+'</div>\
                            <div class="name_part">{{attachment}}</div>\
                            <div class="download_part"></div>\
                        </div>\
                        {{/if}}\
                    </div>\
                ';
            break;
            case "new_MP":
                htmlTemplate = '\
                    <div data-userscript="comment_container">\
                        <div class="content_message background_color_white" style="border:none;">\
                            <div class="content_profil_messagerie" style="border-top:1px solid #d9d9d9; padding-bottom:0px;">\
                                <p id="subject_thread" class="text_color_333333" style="padding-bottom:15px; border-bottom:1px solid #d9d9d9;">\
                                    {{title}}\
                                </p>\
                            </div>\
                        </div>\
                        <div class="content_profil_messagerie" style="padding-top:0px;">\
                            <div class="content_message background_color_white">\
                                <div class="profil_message">\
                                    <div class="image_profil">\
                                        <img src="{{useravatar}}">\
                                    </div>\
                                    \
                                    <div class="right_titre_message">\
                                    </div>\
                                    \
                                    <div class="info_message">\
                                        <p class="username text_color_333333">{{username}}</p>\
                                        <p class="date text_color_777777" style="float:left;">'+extension._("preview_name")+'</p>\
                                    </div>\
                                </div>\
                                <p class="text_color_777777 message_content_text" style="padding:0px 0px 15px 0px; float:left; width:100%;">\
                                    {{{commentaire}}}\
                                </p>\
                                {{#if attachment}}\
                                <div class="piece_jointe_div">\
                                    <div class="type_part">'+extension._("attachment")+'</div>\
                                    <div class="name_part">{{attachment}}</div>\
                                    <div class="download_part"></div>\
                                </div>\
                                {{/if}}\
                            </div>\
                        </div>\
                    </div>\
                '
            break;
            case "new_deal":
                htmlTemplate = '\
                    <div data-userscript="comment_container">\
                        <div class="mouai">\
                            <div id="menu_white_background_replace_float"></div>\
                            <div id="menu_white_background">\
                                <div class="structure white">\
                                    <nav>\
                            <div id="contener_type">\
                                <a href="javascript:;" class="home"><img src="https://static.dealabs.com/images/header/ic_header_breadcrumb_home.png"></a>\
                                <p class="separate_chemin_deal">&gt;</p>\
                                <a class="button_chemin_deal" href="javascript:;">{{deal_type_name}}</a>\
                                <p class="separate_chemin_deal">&gt;</p>\
                                <a class="button_chemin_deal" href="javascript:;">{{cat}}</a>\
                                <p class="separate_chemin_deal">&gt;</p>\
                                <a class="button_chemin_deal" href="javascript:;">{{sub_cat}}</a>\
                            </div>\
                        </nav>\
                                </div>\
                            </div>\
                        </div>\
                        <article class="structure " id="deal_details">\
                            <!-- Première partie -> Deal et posteur -->\
                            <div class="deal_content">\
                                <div class="detail_part">\
                                    <div class="profil_part">\
                                        <a class="pseudo" href="{{userlink}}" rel="nofollow">{{username}}</a>\
                                        <div class="avatar_contener">\
                                            <a class="avatar" href="{{userlink}}" rel="nofollow">\
                                                <img src="{{useravatar}}">\
                                            </a>\
                                        </div>\
                                        <div class="rewards">\
                                            <a class="reward_tipsy" original-title="'+extension._("use the $navigator$ extension", extension.getNavigator())+'" href="javascript:;" rel="nofollow"><img src="https://thib3113.github.io/dealabs-extension/img/rewards_dealabs_extension.png"></a>\
                                        </div>\
                                    </div>\
                                    <div class="option_part">\
                                        <a href="javascript:;" class="button save" ></a>\
                                        <a class="button report"></a>\
                                        <a href="javascript:;" class="button expire"></a>\
                                        {{#if add_calendar}}\
                                        <a class="button add_calendar" href="javascript:;" rel="nofollow"></a>\
                                        {{/if}}\
                                        <div class="social">\
                                            <div class="social_part">\
                                                <a href="javascript:;" title="Partager via Facebook" rel="nofollow" class="icone facebook">\
                                                    <div class="border"></div>\
                                                </a>\
                                            </div>\
                                            <div class="social_part">\
                                                <a href="javascript:;" title="Partager via Twitter" rel="nofollow" class="icone twitter">\
                                                    <div class="border"></div>\
                                                </a>\
                                            </div>\
                                            <div class="social_part">\
                                                <a title="Partager via Google+" href="javascript:;" rel="nofollow" class="icone google">\
                                                    <div class="border"></div>\
                                                </a>\
                                            </div>\
                                            <div class="social_part">\
                                                <a href="javascript:;" title="Partager via courriel" class="icone mail"></a>\
                                            </div>\
                                        </div>\
                                    </div>\
                                </div>\
                                <div class="deal_detail_deal_part">\
                                    <div class="deal_title_part">\
                                        <div class="link_to_deal_part">\
                                            <a target="_blank" href="{{deal_url}}" class="link_to_deal {{#if instore}}instore{{/if}}" style="text-transform: uppercase;" rel="nofollow">\
                                                {{#if instore}}'+extension._("in store")+'{{else}}'+extension._("see the deal")+'{{/if}}\
                                            </a>\
                                        </div>\
                                        <div class="title_part">\
                                            <h1 class="title">{{title}} {{#xif "deal_type != 3"}}à {{price}}{{/xif}} {{#if instore}}'+extension._("in store")+'{{/if}} @ {{storename}}</h1>\
                                            <p class="date_deal" original-title="'+extension._("preview_name")+'">\
                                                <img title="'+extension._("preview_name")+' " style="width: 13px; height: 13px;" src="https://static.dealabs.com/images/deals/icon_deal_published.png">\
                                                '+extension._("preview_name")+'\
                                            </p>\
                                        </div>\
                                    </div>\
                                    <div class="deal_content_part">\
                                        <div class="image_part">\
                                            <div class="image_part_contener">\
                                                <a id="image_link_to_deal" class="link_to_deal" target="_blank" href="{{deal_url}}" rel="nofollow">\
                                                    <div id="over" style="position:absolute; width:100%; height:100%">\
                                                        <img style="max-width:160px;max-height:160px;" alt="{{title}} {{#xif "deal_type != 3"}}à {{price}}{{/xif}} {{#if instore}}'+extension._("in store")+'{{/if}} @ {{storename}}" src="{{deal_img}}">\
                                                    </div>\
                                                </a>\
                                                <!-- elements on image -->\
                                                {{#if addon_element}}\
                                                <div class="addon-element date">\
                                                    <p>{{addon_element}}</p>\
                                                </div>\
                                                {{/if}}\
                                                <!-- elements on image -->\
                                                <!-- price-element -->\
                                                <div class="price-element">\
                                                    {{#if shipping_cost}}\
                                                    <div class="shipping">\
                                                        <div class="left_border"></div>\
                                                        <img src="https://static.dealabs.com/images/deals/icon_deal_shipping.png">\
                                                        <p>{{shipping_cost}}</p>\
                                                    </div>\
                                                    {{/if}}\
                                                    <p class="price {{#if shipping_cost}}{{else}}alone{{/if}}">\
                                                        <span class="deal_price">{{price}}</span>\
                                                        {{#if original_cost}}\
                                                        <span class="original_price"><s>{{original_cost}}</s> ({{percent_reduc}}%)</span>\
                                                        {{/if}}\
                                                    </p>\
                                                </div>\
                                                <!-- price-element -->\
                                            </div>\
                                        </div>\
                                        <div class="vote_part">\
                                            <div class="vote_div_deal_index">\
                                                <div class="tube_flat_contener">\
                                                    <div style="" class="contener_progress_bar">\
                                                        <div class="color_fill" style="height:0%; "></div>\
                                                        <div class="bottom_crop_round"><div class="round"></div></div>\
                                                        <div class="top_crop_round"><div class="round"></div></div>\
                                                    </div>\
                                                </div>\
                                                <div class="vote_contener">\
                                                    <a href="javascript:;" class="vote_button up blocked"></a>\
                                                    <div class="temperature_div ">\
                                                        <p>new</p>\
                                                    </div>\
                                                    <a href="javascript:;" class="vote_button down blocked"></a>\
                                                </div>\
                                            </div>\
                                        </div>\
                                        <div class="content_part">\
                                            {{#xif "expiry_date || localisation" }}\
                                            <div class="info_sup_div">\
                                                {{#if expiry_date}}\
                                                <p class="info_sup" style="margin-right:35px;"><img style="margin-top:1px;" src="https://static.dealabs.com/images/deals/icon_deal_expiredate.png"><b>'+extension._("Expire the")+' {{expiry_date}}</b></p>\
                                                {{/if}}\
                                                {{#if localisation}}\
                                                <p class="info_sup"><img src="https://static.dealabs.com/images/deals/icon_deal_localization.png"><b>Localisation : {{localisation}}</b></p>\
                                                {{/if}}\
                                            </div>\
                                            {{/xif}}\
                                            {{#if voucher_code}}\
                                            <div class="voucher_code" style="margin-bottom:20px;">\
                                                <div class="div_right">\
                                                    <p>'+extension._("voucher").toUpperCase()+'</p>\
                                                </div>\
                                                <div class="field">\
                                                    <input type="text" name="email" value="{{voucher_code}}" readonly="">\
                                                </div>\
                                            </div>\
                                            {{/if}}\
                                            <p class="description">\
                                                {{{commentaire}}}\
                                            </p>\
                                        </div>\
                                    </div>\
                                    <div class="deal_footer_part">\
                                        <div id="apps_display" style="background-image:url(\'https://thib3113.github.io/dealabs-extension/img/icon.svg\');background-size: 14px;background-color: #f5f5f5;padding: 10px;">\
                                            <a target="blank" class="apps" href="'+extension.getPluginUrl()+'">'+extension._("preview with dealabs extension")+'</a>\
                                        </div>\
                                        <div id="merchant_display">\
                                        </div>\
                                    </div>\
                                </div>\
                            </div>\
                        </article>\
                    </div>\
                ';
            break;
            default:
                htmlTemplate = '';
            break;
        }

        if(this.compiledTemplates[formType] == undefined)
            this.compiledTemplates[formType] = Handlebars.compile(htmlTemplate);

        return this.compiledTemplates[formType];
    }

    initSettingsPageListener(){

    }

    generateSettingsPage(){
        Handlebars.registerPartial("customSmileyTemplate", '\
                                    <tr>\
                                        <td>{{#if smiley_url}}<img style="max-height:40px;" src="{{smiley_url}}" alt=":{{smiley_name}}:" />{{/if}}</td>\
                                        <td style="padding-right: 20px;">\
                                            <input style="box-sizing: border-box;" type="text" data-plugin-role="smiley_url" value="{{smiley_url}}" />\
                                        </td>\
                                        <td style="padding-right: 20px;">\
                                            <input style="box-sizing: border-box;" type="text" data-plugin-role="smiley_name" value="{{smiley_name}}" />\
                                        </td>\
                                        <td onclick="$(this).parent(\'tr\').remove();" style="cursor:pointer;" >\
                                            <img src="https://static.dealabs.com/images/profil/icon_profile_messages_delete.png">\
                                        </td>\
                                    </tr>\
                                ');
        var customSmileyTemplate = Handlebars.compile('{{> customSmileyTemplate smiley_url=smiley_url smiley_name=smiley_name}}');

        var htmlTemplates = {
            menu : '\
                    <a id="plugin_tab" class="menu_div_param" href="javascript:;" onclick="tab_change_profile(0, this);">\
                        <div class="div_tab_selector">\
                            <p>'+extension._("extension")+'</p>\
                            <p>'+extension._("extension settings")+'</p>\
                        </div>\
                    </a>\
            ',
            body : '\
                <div id="plugin_tab_content" class="content_profil_param" style="display: none;">\
                    <div class="title_tab_contener">\
                        <p>'+extension._("extension_settings")+' ({{extension_version}})</p>\
                        <p>'+extension._("update the extension settings .")+'</p>\
                    </div>\
                    <div class="content_tab_contener">\
                        <div class="subtitle_tab_contener">\
                            <p>'+extension._("background refresh")+'</p>\
                        </div>\
                        <div class="profil_param_notification border_grey_bottom">\
                            <div class="left_profil_param_champs" style="width:50%;">\
                                <p>'+extension._("refresh time")+'&thinsp;:</p>\
                            </div>\
                            <div class="content_profil_param_champs">\
                                <div class="input_left flag">\
                                    <select name="plugin_time_between_refresh" id="plugin_time_between_refresh">\
                                        {{#each refresh_list}}\
                                        <option value="{{math this "*" 1000}}" {{#if (eq this ../time_between_refresh) }}selected{{/if}}>{{this}}</option>\
                                        {{/each}}\
                                    </select>\
                                </div>\
                                <span>'+extension._("time in seconds")+'&thinsp;</span>\
                            </div>\
                        </div>\
                        <div class="subtitle_tab_contener">\
                            <p>'+extension._("notifications")+'</p>\
                        </div>\
                        {{#with notifications_manage}}\
                        <div class="profil_param_notification">\
                            <div class="left_profil_param_champs" style="width:50%;">\
                                <p>'+extension._("notifications on desktop")+'&thinsp;:</p>\
                            </div>\
                            <div class="content_profil_param_champs">\
                                <div class="input_left flag">\
                                    <label for="plugin_desktop_notifications">\
                                        <input type="checkbox" {{#if desktop}}checked{{/if}} value="1" id="plugin_desktop_notifications" name="plugin_desktop_notifications">\
                                    '+extension._("yes")+'\
                                    </label>\
                                </div>\
                            </div>\
                        </div>\
                        <div class="profil_param_notification">\
                            <div class="left_profil_param_champs" style="width:50%;">\
                                <p>'+extension._("deals notifications")+'&thinsp;:</p>\
                            </div>\
                            <div class="content_profil_param_champs">\
                                <div class="input_left flag">\
                                    <label for="plugin_deals_notifications">\
                                        <input type="checkbox" {{#if deals}}checked{{/if}} value="1" id="plugin_deals_notifications" name="plugin_deals_notifications">\
                                    '+extension._("yes")+'\
                                    </label>\
                                </div>\
                            </div>\
                        </div>\
                        <div class="profil_param_notification">\
                            <div class="left_profil_param_champs" style="width:50%;">\
                                <p>'+extension._("alert notifications")+'&thinsp;:</p>\
                            </div>\
                            <div class="content_profil_param_champs">\
                                <div class="input_left flag">\
                                    <label for="plugin_alertes_notifications">\
                                        <input type="checkbox" {{#if alertes}}checked{{/if}} value="1" id="plugin_alertes_notifications" name="plugin_alertes_notifications">\
                                    '+extension._("yes")+'\
                                    </label>\
                                </div>\
                            </div>\
                        </div>\
                        <div class="profil_param_notification">\
                            <div class="left_profil_param_champs" style="width:50%;">\
                                <p>'+extension._("pm notifications")+'&thinsp;:</p>\
                            </div>\
                            <div class="content_profil_param_champs">\
                                <div class="input_left flag">\
                                    <label for="plugin_mp_notifications">\
                                        <input type="checkbox" {{#if MPs}}checked{{/if}} value="1" id="plugin_mp_notifications" name="plugin_mp_notifications">\
                                    '+extension._("yes")+'\
                                    </label>\
                                </div>\
                            </div>\
                        </div>\
                        <div class="profil_param_notification border_grey_bottom">\
                            <div class="left_profil_param_champs" style="width:50%;">\
                                <p>'+extension._("forum notifications")+'&thinsp;:</p>\
                            </div>\
                            <div class="content_profil_param_champs">\
                                <div class="input_left flag">\
                                    <input type="checkbox" {{#if forum}}checked{{/if}} value="1" id="plugin_forum_notifications" name="plugin_forum_notifications">\
                                    <label for="plugin_forum_notifications">'+extension._("yes")+'</label>\
                                </div>\
                            </div>\
                        </div>\
                        {{/with}}\
                        <div class="subtitle_tab_contener">\
                            <p>'+extension._("UI modifications")+'</p>\
                        </div>\
                        <div class="profil_param_notification">\
                            <div class="left_profil_param_champs" style="width:50%;">\
                                <p>'+extension._("Theme")+'&thinsp;:</p>\
                            </div>\
                            <div class="content_profil_param_champs">\
                                <div class="input_left flag">\
                                    <select name="plugin_theme" id="plugin_theme">\
                                        <option value="">'+extension._("loading")+'...</option>\
                                    </select>\
                                </div>\
                            </div>\
                        </div>\<div class="profil_param_notification border_grey_bottom">\
                            <div class="left_profil_param_champs" style="width:50%;">\
                                <p>'+extension._("smileys")+'&thinsp;:</p>\
                            </div>\
                            <div class="content_profil_param_champs">\
                                <div class="input_left flag">\
                                    <select name="emoticone_theme" id="emoticone_theme">\
                                        <option value="">'+extension._("loading")+'...</option>\
                                    </select>\
                                </div>\
                            </div>\
                        </div>\
                        <div class="subtitle_tab_contener">\
                            <p>'+extension._("Images")+'</p>\
                        </div>\
                        <div class="profil_param_notification border_grey_bottom">\
                            <div class="left_profil_param_champs" style="width:50%;">\
                                <p>'+extension._("imgur connection")+'&thinsp;:</p>\
                            </div>\
                            <div class="content_profil_param_champs">\
                                <p id="imgur-connexion">\
                                    '+extension._("try connection to imgur")+' ...\
                                </p>\
                            </div>\
                        </div>\
                        <div class="subtitle_tab_contener">\
                            <p>'+extension._("custom smileys")+'</p>\
                        </div>\
                        <div class="profil_param_notification border_grey_bottom">\
                            <div class="left_profil_param_champs" id="plugin_smileys_list" style="width: 100%;overflow:auto;">\
                            <div style="margin: 20px;background: #f5f5f5;padding: 10px;">\
                                <ul style="list-style: square;">\
                                    <li>'+extension._("for security reason, please use https images")+'</li>\
                                    <li>'+extension._("please doesn't use special character in smileys name")+'</li>\
                                </ul>\
                            </div>\
                            <table style="width: 100%;">\
                                <thead>\
                                    <tr>\
                                        <th></th>\
                                        <th>'+extension._("Url")+'</th>\
                                        <th>'+extension._("Name")+'</th>\
                                        <th></th>\
                                    </tr>\
                                </thead>\
                                <tbody>\
                                {{#each smileys as |smiley_url smiley_name|}}\
                                    {{> customSmileyTemplate smiley_url=smiley_url smiley_name=smiley_name}}\
                                {{/each}}\
                                <tr>\
                                    <td style="cursor:pointer;text-align: center;" colspan="4">\
                                        <a data-plugin-role="add_new_smiley" href="javascript:;" class="validate_button_form background_color_button_green enter_validate" style="float:none; display:inline-block; margin-right:0px;">\
                                            '+extension._("add a new smiley")+'\
                                        </a>\
                                    </td>\
                                </tr>\
                                </tbody>\
                            </table>\
                            </div>\
                            <div class="content_profil_param_champs">\
                            </div>\
                        </div>\
                        <div class="profil_param_validation" style="padding-top:10px;">\
                            <a href="javascript:;" data-plugin-role="update_settings" class="validate_button_form background_color_button_blue" style="float:none; display:inline-block; margin-right:0px;">'+extension._("update settings")+'</a>\
                        </div>\
                        <div onClick="$(this).next(\'div\').toggle()" class="subtitle_tab_contener plugin-debug">\
                            <p>Debug</p>\
                        </div>\
                        <div class="profil_param_notification border_grey_bottom plugin-debug" style="display:none;">\
                            <div class="left_profil_param_champs" style="width:50%;">\
                                <p>Liste des erreurs apparues&thinsp;:</p>\
                            </div>\
                            <div>\
                                <textarea name="" id="debug-logs" style="width:98%">'+extension._("loading")+'...</textarea>\
                            </div>\
                        </div>\
                    </div>\
                </div>\
            ',
            list: '\
                <option value="{{value}}" {{#if selected}}selected {{/if}}>{{name}}</option>\
            '
        }

        $('#left_profil_param').append(Handlebars.compile(htmlTemplates.menu)());

        $('#right_profil_param .padding_right_profil_param').append(Handlebars.compile(htmlTemplates.body)({
            extension_version : extension.getManifest().version,
            smileys : settingsManager.smileys,
            refresh_list : time_between_refresh_list,
            time_between_refresh : settingsManager.time_between_refresh/1000,
            notifications_manage : settingsManager.notifications_manage
        }));

        $(document).on('click', '[data-plugin-role="add_new_smiley"]', function() {
            var tpl = customSmileyTemplate({});
            $(this).parents('tr').before(tpl);
        })

        //generate async parameters
        //check imgur API
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
        });
    
        if(settingsManager.imadevelopper){
            extension.getLogs(function(result){
                if(result == undefined || result.logs == undefined || result.logs.length==0){
                    $(".plugin-debug").hide();
                    return;
                }

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

        var tryToBecomeDevelopper = 0;
        $(document).on("click", '[data-plugin-role="version"]', function(){
            if(settingsManager.imadevelopper){
                noty({
                    layout: 'bottomRight',
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
                    layout: 'bottomRight',
                    type: 'success',
                    text: 'Yeahhh, vous êtes désormais considéré comme un développeur !',
                    dismissQueue: true,
                    timeout: 2000,
                    maxVisible: 1
                });
                settingsManager.imadevelopper = true;
            }
        });

        var asyncLists = Handlebars.compile(htmlTemplates.list);
        //load emoticone themes
        $('#emoticone_theme').on('change', function(){
            update_emoticone_theme($(this).find(":selected").data("emoticone_theme"));
        })
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
            $option.data("emoticone_theme", theme_list[name]);
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
                $option.data("emoticone_theme", theme_list[name]);
                $('#emoticone_theme').append($option);
            }
          }
        });

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
            $option = $(asyncLists({
                value :  theme_list[name].safeName,
                selected :  (settingsManager.emoticone_theme.safeName == theme_list[name].safeName),
                name :  theme_list[name].name,
            }));
            $option.data("theme", theme_list[name]);
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
                    selected :  (settingsManager.emoticone_theme.safeName == theme_list[name].safeName),
                    name :  theme_list[name].name,
                }));
                $option.data("theme", theme_list[name]);
                $('#plugin_theme').append($option);
            }
          }
        });

        //update settings
        $(document).on('click', '[data-plugin-role="update_settings"]', function() {
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
                layout: 'bottomRight',
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
                    var supported = false;

                    for(var name in options.forms_matches){
                        if (this.name.match(new RegExp(options.forms_matches[name],"g")))
                            supported = true
                    }

                    if(!supported)
                        return;


                    //continue with supported forms
                    formError = function(error, event){
                        // event.stopPropagation();
                        $('.spinner_validate').hide(0);
                        noty({
                            layout: 'bottomRight',
                            type: 'error',
                            text: error,
                            timeout: 2000,
                        });
                    }
                    
                    //remove validate listener
                    submit_btn = $(this).find(".validate_comment, .validate_button_form");
                    if(submit_btn.length==0)
                        console.error("submit button not found, design change ?");

                    submit_btn.get(0)._onclick = submit_btn.get(0).onclick;
                    submit_btn.attr("onclick", null); 
                    submit_btn.off();

                    submit_btn.on("click", function(){
                        // this.disabled = true;
                        $(this).find(".spinner_validate").show(0);

                        event.stopPropagation();
                        $form = $(this).parents("form");
                        $textarea = $form.find('[name="post_content"]');

                        //check if an image wait to finish upload
                        if($textarea.val().match(/\[img_wait_upload:[0-9]+\]/g)){
                            formError(lang.waitImgUpload);
                            return false;
                        }

                        chrome.runtime.sendMessage(extensionId,{
                                "event":"content-parse_emoticons", 
                                "datas" : {
                                    "text":$textarea.val()
                                }
                            },
                            function(response){
                                if(response == undefined){
                                    response = {
                                        success : false,
                                        error : "error with extension"
                                    }
                                }

                                if(response.success){
                                    $textarea.val(response.text);
                                    post_id = $form.find('[name="post_id"]');
                                    $(this).find(".spinner_validate").hide(0);
                                    //execute normal process
                                    // this._onclick();
                                    debugger;
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
                        preview : extension._("preview"),
                        waitImgUpload : extension._("an image is uploading, please wait a little")
                    }
                }


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

                $("form").each(function(){
                    //check if this form is supported
                    var formType = null;

                    for(var name in options.forms_matches){
                        if (this.name.match(new RegExp(options.forms_matches[name],"g")))
                            formType = name;
                    }

                    if(null == formType)
                        return;


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

                    var submit_btn = $(this).find(".validate_comment, .validate_button_form");
                    //generate the preview button
                    var clone = $(submit_btn)
                        .clone(false)
                        .attr('onclick', null)
                        .clone(false)
                        .data("preview_type", formType)
                        .attr('accesskey', 'p')
                        .attr("tabindex", ""+(parseInt(submit_btn.attr("tabindex"))+1))
                        .css("margin-left", "20px")
                        .text(extension._("preview"));

                    clone.on("click", function(){
                        var $putContainer, func;
                        var vars = {}; 
                        var userData = $('#open_member_parameters');
                        var formType = $(this).data("preview_type");

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
                                $putContainer = $('body .structure:eq(1)');
                                func = "prepend";

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

                                //need to add some css
                                var link = document.createElement( "link" );
                                link.href = "https://static.dealabs.com/css/detail_page.css?20170516";
                                link.type = "text/css";
                                link.rel = "stylesheet";
                                link.dataset.pluginRole = 'preview_css';
                                link.media = "screen,print";
                                document.getElementsByTagName("head")[0].appendChild( link );
                            break;
                            case "add_thread":
                                $putContainer = $('body .structure:eq(1)');
                                func = "prepend";

                                //add vars
                                vars.title = $(this).parents("form").find('[name="post_title"]').val();

                                //need to add some css
                                var link = document.createElement( "link" );
                                link.href = "https://static.dealabs.com/css/detail_page.css?20170516";
                                link.type = "text/css";
                                link.rel = "stylesheet";
                                link.dataset.pluginRole = 'preview_css';
                                link.media = "screen,print";
                                document.getElementsByTagName("head")[0].appendChild( link );
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

                        var commentContainer = self.generateTemplate(formType);

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


                //add hour in body for styling
                var updateHourBody = function(){
                    $("body").addClass("plugin-hour-"+(new Date().getHours()));
                    //relaunch for the next hour
                    setTimeout(this, 3600000 - new Date().getTime() % 3600000);
                }();

                //add menu for sound, and menu for blacklist
                var linkInfos, blacklist, blacklisted, notifications_with_sound
                if(linkInfos = location.pathname.match(/^\/([^\/]+)\/.*\/([0-9]+)$/)){
                    blacklisted =  (typeof settingsManager.blacklist[linkInfos[1]+'-'+linkInfos[2]] != "undefined");
                    $('#bloc_option .bloc_option_white').prepend('\
                        <div class="button_part">\
                            <div class="bouton_contener_border" data-plugin-link-info="'+linkInfos[1]+'-'+linkInfos[2]+'" id="plugin-blacklist-notification">\
                                <div class="yes_part '+(blacklisted?'yes':'')+'"></div>\
                                <div class="no_part '+(blacklisted?'':'no')+'"></div>\
                            </div>\
                        </div>\
                        \
                        <div class="title_button_part">\
                            <p>Bloquer les notifications</p>\
                            <p>Cacher les notifications des nouvelles réponses</p>\
                        </div>\
                    ');

                    $(document).on('click', '#plugin-blacklist-notification', function(e){
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
                        
                        blacklisted = (typeof settingsManager.blacklist[$(this).data('plugin-link-info')] != "undefined");
                        $(this).html('<div class="yes_part '+(blacklisted?'yes':'')+'"></div>\
                                <div class="no_part '+(blacklisted?'':'no')+'"></div>');

                        return false;
                    });

                    notifications_with_sound =  (typeof settingsManager.notifications_with_sound[linkInfos[1]+'-'+linkInfos[2]] != "undefined");
                    $('#bloc_option .bloc_option_white').prepend('\
                        <div class="button_part">\
                            <div class="bouton_contener_border" data-plugin-link-info="'+linkInfos[1]+'-'+linkInfos[2]+'" id="plugin-sounded-notification">\
                                <div class="yes_part '+(notifications_with_sound?'yes':'')+'"></div>\
                                <div class="no_part '+(notifications_with_sound?'':'no')+'"></div>\
                            </div>\
                        </div>\
                        <div class="title_button_part">\
                            <p>Jouer un son</p>\
                            <p>Jouer un son lors d\'une nouvelle réponse</p>\
                        </div>\
                    ');

                    $(document).on('click', '#plugin-sounded-notification', function(e){
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
                        
                        notifications_with_sound = (typeof settingsManager.notifications_with_sound[$(this).data('plugin-link-info')] != "undefined");
                        $(this).html('<div class="yes_part '+(notifications_with_sound?'yes':'')+'"></div>\
                                <div class="no_part '+(notifications_with_sound?'':'no')+'"></div>');

                        return false;
                    });
                }

                //settings
                if (self._getParameterByName('tab', location.href) == "settings") {
                    self.generateSettingsPage();
                }
                //     
                //     //load version
                //     $('[data-plugin-role="version"]').text(extension.getManifest().version);

                //     //load time_between_refresh
                //     $('#plugin_time_between_refresh').html("");
                //     for (var i = 0; i < time_between_refresh_list.length; i++) {
                //         $('#plugin_time_between_refresh').append('<option value="' + time_between_refresh_list[i] * 1000 + '"' + (settingsManager.time_between_refresh == time_between_refresh_list[i] * 1000 ? ' selected' : '') + '>' + time_between_refresh_list[i] + '</option>');
                //     }

                    // //check imgur API
                    // imgurManager.checkConnexion(function(response){
                    //     if(response!=false){
                    //         $("#imgur-connexion").html(extension._("you are connected with account $account$", response.url));
                    //     }
                    //     else{
                    //         $("#imgur-connexion").html(extension._("you are not connected :")+"<em data-plugin-role=\"ask_for_imgur_token\" style=\"cursor:pointer\">"+extension._("click here")+"</em>");
                    //         $(document).on("click", '[data-plugin-role="ask_for_imgur_token"]', function(){
                    //             imgurManager.askForToken();
                    //         })
                    //     }
                    // });

                    // if(settingsManager.imadevelopper){
                    //     extension.getLogs(function(result){
                    //         if(result == undefined || result.logs == undefined || result.logs.length==0){
                    //             $(".plugin-debug").hide();
                    //             return;
                    //         }

                    //         logs = result.logs;
                    //         text = "";
                    //         for (var i = logs.length - 1; i >= 0; i--) {
                    //             text += logs[i].stack
                    //             if(i-1>=0)
                    //                 text+= "=================";
                    //         }
                    //         this.textarea.innerText = text;
                    //     }.bind({textarea:document.querySelector("#debug-logs")}))
                    // }
                    // else{
                    //     debugElements = document.querySelectorAll(".plugin-debug");
                    //     for (var i = 0; i < debugElements.length; i++) {
                    //         debugElements[i].remove();
                    //     }
                    // }

                    // tryToBecomeDevelopper = 0;
                    // $(document).on("click", '[data-plugin-role="version"]', function(){
                    //     if(settingsManager.imadevelopper){
                    //         noty({
                    //             layout: 'topRight',
                    //             type: 'warning',
                    //             text: 'Vous êtes déjà un développeur ;) !',
                    //             dismissQueue: true,
                    //             timeout: 2000,
                    //             maxVisible: 1
                    //         });
                    //         return;   
                    //     }

                    //     if(++tryToBecomeDevelopper >= 7){
                    //         noty({
                    //             layout: 'topRight',
                    //             type: 'success',
                    //             text: 'Yeahhh, vous êtes désormais considéré comme un développeur !',
                    //             dismissQueue: true,
                    //             timeout: 2000,
                    //             maxVisible: 1
                    //         });
                    //         settingsManager.imadevelopper = true;
                    //     }
                    // })

                    // //load emoticone themes
                    // $('#emoticone_theme').on('change', function(){
                    //     update_emoticone_theme($(this).find(":selected").data("emoticone_theme"));
                    // })
                    // $('#emoticone_theme').html("");
                    // theme_list = [
                    //   {
                    //     "safeName" : "default",
                    //     "name": "Par défaut"
                    //   },
                    // ];

                    // try{
                    //     if(settingsManager.emoticone_theme.safeName != "default")
                    //         theme_list.append(settingsManager.emoticone_theme);
                    // }
                    // catch(e){
                    // }
                    
                    // for(name in theme_list){
                    //     $option = $('<option value="' + theme_list[name].safeName + '"' + (settingsManager.emoticone_theme.safeName == theme_list[name].safeName ? ' selected' : '') + '>' + theme_list[name].name + '</option>');
                    //     $option.data("emoticone_theme", theme_list[name]);
                    //     $('#emoticone_theme').append($option);
                    // }

                    // $.ajax({
                    //   url: emoticone_theme_list_url,
                    //   dataType: "json",
                    //   success: function(theme_list){
                    //     $('#emoticone_theme').html("");
                    //     for(name in theme_list){
                    //         $option = $('<option value="' + theme_list[name].safeName + '"' + (settingsManager.emoticone_theme.safeName == theme_list[name].safeName ? ' selected' : '') + '>' + theme_list[name].name + '</option>');
                    //         $option.data("emoticone_theme", theme_list[name]);
                    //         $('#emoticone_theme').append($option);
                    //     }
                    //   }
                    // });

                    // $('#plugin_theme').on('change', function(){
                    //     update_theme($(this).find(":selected").data("theme"));
                    // })
                    // $('#plugin_theme').html("");
                    // theme_list = [
                    //   {
                    //     "safeName" : "default",
                    //     "name": "Par défaut"
                    //   },
                    // ];

                    // try{
                    //     if(settingsManager.theme.safeName != "default")
                    //         theme_list.append(settingsManager.theme);
                    // }
                    // catch(e){
                    // }
                    
                    // for(name in theme_list){
                    //     $option = $('<option value="' + theme_list[name].safeName + '"' + (settingsManager.theme.safeName == theme_list[name].safeName ? ' selected' : '') + '>' + theme_list[name].name + '</option>');
                    //     $option.data("theme", theme_list[name]);
                    //     $('#plugin_theme').append($option);
                    // }

                    // $.ajax({
                    //   url: theme_list_url,
                    //   dataType: "json",
                    //   success: function(theme_list){
                    //     $('#plugin_theme').html("");
                    //     for(name in theme_list){
                    //         $option = $('<option value="' + theme_list[name].safeName + '"' + (settingsManager.theme.safeName == theme_list[name].safeName ? ' selected' : '') + '>' + theme_list[name].name + '</option>');
                    //         $option.data("theme", theme_list[name]);
                    //         $('#plugin_theme').append($option);
                    //     }
                    //   }
                    // });

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

                    // $body.on('click', '[data-plugin-role="add_new_smiley"]', function() {
                    //     $this = $(this);
                    //     tpl = smileyTPL.replace(/{{img}}/g, "").replace(/{{smiley_url}}/g, "").replace(/{{smiley_name}}/g, "");
                    //     $this.parents('tr').before(tpl);
                    // })

                    // //update settings
                    // $body.on('click', '[data-plugin-role="update_settings"]', function() {
                    //     var save_smileys = {};
                    //     $('#plugin_smileys_list tbody tr').each(function() {
                    //         smiley_url = $(this).find('[data-plugin-role="smiley_url"]').val();
                    //         if($(this).find('[data-plugin-role="smiley_url"]').val() != undefined){
                    //             smiley_name = $(this).find('[data-plugin-role="smiley_name"]').val().replace(/[^\w]/gi, "_").replace(/_+/gi, "_");
                    //             if (smiley_url != "" && typeof smiley_url != "undefined" && smiley_name != "" && typeof smiley_name != "undefined")
                    //                 save_smileys[smiley_name] = smiley_url;
                    //         }
                    //     });

                    //     newSettings = {
                    //         time_between_refresh: parseInt($('#plugin_time_between_refresh').val()),
                    //         theme: $('#plugin_theme').find(":selected").data("theme"),
                    //         emoticone_theme: $('#emoticone_theme').find(":selected").data("emoticone_theme"),
                    //         notifications_manage: {
                    //             desktop : $('#plugin_desktop_notifications').is(':checked'),
                    //             forum : $('#plugin_forum_notifications').is(':checked'),
                    //             MPs : $('#plugin_mp_notifications').is(':checked'),
                    //             deals : $('#plugin_deals_notifications').is(':checked'),
                    //             alertes : $('#plugin_alertes_notifications').is(':checked')
                    //         },
                    //         smileys: save_smileys
                    //     }

                    //     noty({
                    //         layout: 'topRight',
                    //         type: 'success',
                    //         text: 'Vos paramètres ont bien été enregistrés.',
                    //         dismissQueue: true,
                    //         timeout: 2000,
                    //         maxVisible: 1
                    //     });


                    //     settingsManager._updateCb = function(){
                    //         extension.sendMessage('update_settings', {});
                    //         settingsManager._updateCb = null;
                    //     }
                    //     settingsManager.settings = newSettings;
                    // });

                //     // #plugin_tab_content .content_tab_contener
                //     if (plugin_getParameterByName('what', location.href) == "plugin") {
                //         setTimeout(function(){$('#plugin_tab').get(0).click();}, 20);
                //     }
            })
        }
        else if(this.context == "background"){
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
              regex : /\[citer pseudo="?([^"]*)"?\]/gi,
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