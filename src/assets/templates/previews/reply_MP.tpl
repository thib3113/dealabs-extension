{{!-- Handlebarsjs template --}}
<div id="_userscript_preview_container" data-userscript="comment_container" class="content_message background_color_white">
    <div class="profil_message">
        <div class="image_profil">
            <img src="{{useravatar}}">
        </div>
        <div class="right_titre_message">
        </div>
        <div class="info_message">
            <p class="username text_color_333333">{{username}}</p>
            <p class="date text_color_777777" style="float:left;">{{_ "preview_name"}}</p>
        </div>
    </div>
    <p class="text_color_777777 message_content_text" style="padding:15px 0px;">
        {{{commentaire}}}
    </p>
    {{#if attachment}}
    <div class="piece_jointe_div">
        <div class="type_part">{{_ "attachment"}}</div>
        <div class="name_part">{{attachment}}</div>
        <div class="download_part"></div>
    </div>
    {{/if}}
</div>
                