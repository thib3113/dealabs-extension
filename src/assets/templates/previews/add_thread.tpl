{{!-- Handlebarsjs template
vars :
    - cat
    - sub_cat
    - userlink
    - username
    - userlink
    - useravatar
    - title
    - commentaire
 --}}
<div data-userscript="comment_container">
    <div class="mouai">
        <div id="menu_white_background_replace_float"></div>
        <div id="menu_white_background">
            <div class="structure white">
                <nav>
                    <div id="contener_type">
                        <a href="javascript:;" class="home"><img src="https://static.dealabs.com/images/header/ic_header_breadcrumb_home.png"></a>
                        <p class="separate_chemin_deal">&gt;</p>
                        <a class="button_chemin_deal" href="javascript:;">{{cat}}</a>
                        <p class="separate_chemin_deal">&gt;</p>
                        <a class="button_chemin_deal" href="javascript:;">{{sub_cat}}</a>
                    </div>
                </nav>
            </div>
        </div>
    </div>
    <article class="structure" id="deal_details">
        <div class="deal_content" id="_userscript_preview_container">
            <div class="detail_part">
                <div class="profil_part">
                    <a class="pseudo" href="{{userlink}}" rel="nofollow">{{username}}</a>
                    <div class="avatar_contener">
                        <a class="avatar" href="{{userlink}}" rel="nofollow">
                            <img src="{{useravatar}}">
                        </a>
                    </div>
                    <div class="rewards">
                        <a class="reward_tipsy" original-title="{{_ "use the $navigator$ extension" navigator}}" href="javascript:;" rel="nofollow">
                            <img src="https://thib3113.github.io/dealabs-extension/img/rewards_dealabs_extension.png">
                        </a>
                    </div>
                </div>
                <div class="option_part">
                    <a class="button report" href="javascript:;"></a>
                    <a href="javascript:;" class="button resoudre"></a>                                   
                    <div class="social">
                        <div class="social_part">
                            <a href="javascript:;" title="Partager via Facebook" rel="nofollow" class="icone facebook">
                                <div class="border"></div>
                            </a>                        
                        </div>

                        <div class="social_part">
                            <a href="javascript:;" title="Partager via Twitter" rel="nofollow" class="icone twitter">
                                <div class="border"></div>
                            </a>
                        </div>

                        <div class="social_part">
                            <a title="Partager via Google+" href="javascript:;" rel="nofollow" class="icone google">
                                <div class="border"></div>
                            </a>
                        </div>

                        <div class="social_part">
                            <a href="javascript:;" title="Partager via courriel" class="icone mail"></a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="deal_detail_deal_part">
                <div class="deal_title_part">
                    <div class="title_part">
                        <h1 class="title">{{title}}</h1>
                        <p class="date_deal" original-title="{{_ "preview_name"}}">
                            <img title="{{_ "preview_name"}}" style="width: 13px; height: 13px;" src="https://static.dealabs.com/images/deals/icon_deal_published.png">{{_ "preview_name"}}
                        </p>
                    </div>
                </div>
                <div class="deal_content_part">
                    <div class="content_part" style="padding:0px;">
                        <p class="description">
                            {{{commentaire}}}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </article>
</div>
