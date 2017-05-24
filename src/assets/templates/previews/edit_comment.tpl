{{!-- Handlebarsjs template --}}
<div class="padding_comment_contener" id="_userscript_preview_container" data-userscript="comment_container">
    <div class="padding">
        <div class="profil_part">
            <div class="avatar_contener">
                <a class="avatar" href="{{userlink}}">
                    <img src="{{useravatar}}">
                </a>
                <div class="rewards">
                    <a class="reward_tipsy" original-title="{{_ "use the $navigator$ extension" navigator}}" href="javascript:;" rel="nofollow"><img src="https://thib3113.github.io/dealabs-extension/img/rewards_dealabs_extension.png"></a>
                </div>
            </div>
        </div>
        <div class="comment_text_part">
            <div class="header_comment">
                <a href="{{userlink}}" class="pseudo text_color_blue">{{username}}</a>
                <p><span>{{_ "preview_name"}}</span></p>
            </div>
            <div>
                <div class="commentaire_div">
                  {{{commentaire}}}
              </div>
          </div>
      </div>
  </div>
</div>
</div>