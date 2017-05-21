{{!-- Handlebarsjs template --}}
<div data-userscript="comment_container">
    <div class="mouai">
        <div id="menu_white_background_replace_float"></div>
        <div id="menu_white_background">
            <div class="structure white">
                <nav>
                    <div id="contener_type">
                        <a href="javascript:;" class="home"><img src="https://static.dealabs.com/images/header/ic_header_breadcrumb_home.png"></a>
                        <p class="separate_chemin_deal">&gt;</p>
                        <a class="button_chemin_deal" href="javascript:;">{{deal_type_name}}</a>
                        <p class="separate_chemin_deal">&gt;</p>
                        <a class="button_chemin_deal" href="javascript:;">{{cat}}</a>
                        <p class="separate_chemin_deal">&gt;</p>
                        <a class="button_chemin_deal" href="javascript:;">{{sub_cat}}</a>
                    </div>
                </nav>
            </div>
        </div>
    </div>
    <article class="structure " id="deal_details">
        <!-- Première partie -> Deal et posteur -->
        <div class="deal_content">
            <div class="detail_part">
                <div class="profil_part">
                    <a class="pseudo" href="{{userlink}}" rel="nofollow">{{username}}</a>
                    <div class="avatar_contener">
                        <a class="avatar" href="{{userlink}}" rel="nofollow">
                            <img src="{{useravatar}}">
                        </a>
                    </div>
                    <div class="rewards">
                        <a class="reward_tipsy" original-title="{{_ "use the $navigator$ extension" navigator}}" href="javascript:;" rel="nofollow"><img src="https://thib3113.github.io/dealabs-extension/img/rewards_dealabs_extension.png"></a>
                    </div>
                </div>
                <div class="option_part">
                    <a href="javascript:;" class="button save" ></a>
                    <a class="button report"></a>
                    <a href="javascript:;" class="button expire"></a>
                    {{#if add_calendar}}
                    <a class="button add_calendar" href="javascript:;" rel="nofollow"></a>
                    {{/if}}
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
                    <div class="link_to_deal_part">
                        <a target="_blank" href="{{deal_url}}" class="link_to_deal {{#if instore}}instore{{/if}}" style="text-transform: uppercase;" rel="nofollow">
                            {{#if instore}}{{_ "in store"}}{{else}}{{_ "see the deal"}}{{/if}}
                        </a>
                    </div>
                    <div class="title_part">
                        <h1 class="title">{{title}} {{#xif "deal_type != 3"}}à {{price}}{{/xif}} {{#if instore}}{{_ "in store"}}{{/if}} @ {{storename}}</h1>
                        <p class="date_deal" original-title="{{_ "preview_name"}}">
                            <img title="{{_ "preview_name"}} " style="width: 13px; height: 13px;" src="https://static.dealabs.com/images/deals/icon_deal_published.png">
                            {{_ "preview_name"}}
                        </p>
                    </div>
                </div>
                <div class="deal_content_part">
                    <div class="image_part">
                        <div class="image_part_contener">
                            <a id="image_link_to_deal" class="link_to_deal" target="_blank" href="{{deal_url}}" rel="nofollow">
                                <div id="over" style="position:absolute; width:100%; height:100%">
                                    <img style="max-width:160px;max-height:160px;" alt="{{title}} {{#xif "deal_type != 3"}}à {{price}}{{/xif}} {{#if instore}}{{_ "in store"}}{{/if}} @ {{storename}}" src="{{deal_img}}">
                                </div>
                            </a>
                            <!-- elements on image -->
                            {{#if addon_element}}
                            <div class="addon-element date">
                                <p>{{addon_element}}</p>
                            </div>
                            {{/if}}
                            <!-- elements on image -->
                            <!-- price-element -->
                            <div class="price-element">
                                {{#if shipping_cost}}
                                <div class="shipping">
                                    <div class="left_border"></div>
                                    <img src="https://static.dealabs.com/images/deals/icon_deal_shipping.png">
                                    <p>{{shipping_cost}}</p>
                                </div>
                                {{/if}}
                                <p class="price {{#if shipping_cost}}{{else}}alone{{/if}}">
                                    <span class="deal_price">{{price}}</span>
                                    {{#if original_cost}}
                                    <span class="original_price"><s>{{original_cost}}</s> ({{percent_reduc}}%)</span>
                                    {{/if}}
                                </p>
                            </div>
                            <!-- price-element -->
                        </div>
                    </div>
                    <div class="vote_part">
                        <div class="vote_div_deal_index">
                            <div class="tube_flat_contener">
                                <div style="" class="contener_progress_bar">
                                    <div class="color_fill" style="height:0%; "></div>
                                    <div class="bottom_crop_round"><div class="round"></div></div>
                                    <div class="top_crop_round"><div class="round"></div></div>
                                </div>
                            </div>
                            <div class="vote_contener">
                                <a href="javascript:;" class="vote_button up blocked"></a>
                                <div class="temperature_div ">
                                    <p>new</p>
                                </div>
                                <a href="javascript:;" class="vote_button down blocked"></a>
                            </div>
                        </div>
                    </div>
                    <div class="content_part">
                        {{#xif "expiry_date || localisation" }}
                        <div class="info_sup_div">
                            {{#if expiry_date}}
                            <p class="info_sup" style="margin-right:35px;"><img style="margin-top:1px;" src="https://static.dealabs.com/images/deals/icon_deal_expiredate.png"><b>{{_ "Expire the"}} {{expiry_date}}</b></p>
                            {{/if}}
                            {{#if localisation}}
                            <p class="info_sup"><img src="https://static.dealabs.com/images/deals/icon_deal_localization.png"><b>Localisation : {{localisation}}</b></p>
                            {{/if}}
                        </div>
                        {{/xif}}
                        {{#if voucher_code}}
                        <div class="voucher_code" style="margin-bottom:20px;">
                            <div class="div_right">
                                <p>{{_ (upper "voucher")}}</p>
                            </div>
                            <div class="field">
                                <input type="text" name="email" value="{{voucher_code}}" readonly="">
                            </div>
                        </div>
                        {{/if}}
                        <p class="description">
                            {{{commentaire}}}
                        </p>
                    </div>
                </div>
                <div class="deal_footer_part">
                    <div id="apps_display" style="background-image:url('https://thib3113.github.io/dealabs-extension/img/icon.svg');background-size: 14px;background-color: #f5f5f5;padding: 10px;">
                        <a target="blank" class="apps" href="{{plugin_url}}">{{_ "preview with dealabs extension"}}</a>
                    </div>
                    <div id="merchant_display">
                    </div>
                </div>
            </div>
        </div>
    </article>
</div>