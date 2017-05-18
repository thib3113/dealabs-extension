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
        var re = /((?:http|ftp|https):\/\/[\w-]+(?:\.[\w-]+)+(?:[\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?)/g;
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
            default:
                htmlTemplate = '';
            break;
        }

        if(this.compiledTemplates[formType] == undefined)
            this.compiledTemplates[formType] = Handlebars.compile(htmlTemplate);

        return this.compiledTemplates[formType];
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
                extensionId = options.extensionId;

                lang = options.lang;

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
                        "add_thread" : "add_thread_form"
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
                            case "add_thread":
                                $putContainer = $('body .structure:eq(1)');
                                func = "before";

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
                        }

                        var $previewContainer = $('[data-userscript="comment_container"]');
                        if ($previewContainer.length > 0) {
                            $previewContainer.slideUp(500, function() {
                                $previewContainer.hide(0);
                                $(this).remove()
                                $putContainer[func](self.generatePreview(commentContainer, vars, formType));
                                $previewContainer.slideDown(500, cb);
                            });
                        }
                        else {
                            $previewContainer.hide(0);
                            $putContainer[func](self.generatePreview(commentContainer, vars, formType));
                            $previewContainer.slideDown(500);
                            cb();
                        }

                    });

                    $(submit_btn).after(clone);
                });
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
              name : 'quote_start',
              not_supported : [
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
                "new_MP",
                "reply_MP"
              ]
            },
            {
              regex : /\[\/spoiler\]/gi,
              html : '</div></div>',
              name : 'spoil_end',
              not_supported : [
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
        ]
    }
    
}