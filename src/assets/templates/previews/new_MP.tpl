{{!-- Handlebarsjs template --}}
<div data-userscript="comment_container">
    <div class="content_message background_color_white" style="border:none;">
        <div class="content_profil_messagerie" style="border-top:1px solid #d9d9d9; padding-bottom:0px;">
            <p id="subject_thread" class="text_color_333333" style="padding-bottom:15px; border-bottom:1px solid #d9d9d9;">
                {{title}}
            </p>
        </div>
    </div>
    <div class="content_profil_messagerie" style="padding-top:0px;">
        <div class="content_message background_color_white">
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
            <p class="text_color_777777 message_content_text" style="padding:0px 0px 15px 0px; float:left; width:100%;">
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
    </div>
</div>
                