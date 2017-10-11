{{!-- Handlebarsjs template 
 vars :
    - extension_version
    - refresh_list
    - notifications_manage
        - desktop
        - deals
        - alertes
        - MPs
        - forum
    - show_imgur_connection_under_form
    - smileys
    - blacklisted_thread
    - sounded_thread
--}}
<div id="tab-plugin" class="tabbedInterface-content hide">

    <section class="userProfile-tabContent" id="pluginTab">
        <h1 class="userProfile-title">
            {{_ "extension_settings"}} (<span
                style="cursor:pointer;-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;"
                data-plugin-role="version">{{extension_version}}</span>)
        </h1>
        <!--<div class="profil_param_notification">-->
            <!--<div class="left_profil_param_champs" style="width:50%;">-->
                <!--<p>{{_ "Theme"}}&thinsp;:</p>-->
            <!--</div>-->
            <!--<div class="content_profil_param_champs">-->
                <!--<div class="input_left flag">-->
                    <!--<select name="plugin_theme" data-plugin-option="theme" id="plugin_theme">-->
                        <!--<option value="">{{_ "loading"}}...</option>-->
                    <!--</select>-->
                <!--</div>-->
            <!--</div>-->
        <!--</div>-->
        <h2>{{_ "Theme"}}</h2>
        <div class="iGrid iGrid--gutter-xs space--mt-3">
            <div class="iGrid-item width--all-12 width--fromW2-6 space--mb-2 space--fromW2-mb-0">
                <span class="select width--all-12">
                    <select class="select-ctrl input" title="{{_ "Theme"}}" required="" name="plugin_theme" data-plugin-option="theme" id="plugin_theme">
                        <option value="daily-newsletter">
							{{_ "loading"}}...
                        </option>
                    </select>
                    <span class="select-fake tGrid tGrid--auto width--all-12 hide--js-off">
                        <span class="select-txt tGrid-cell bRad--r-r input width--all-12" aria-hidden="true">
                            <span data-plugin="actual_theme" class="js-select-val box--all-b height--ctrl overflow--wrap-break overflow--hidden">
                                {{_ "loading"}}...
                            </span>
                        </span>
                        <span class="select-arrow tGrid-cell bRad--l-r btn">
                            <span class="select-ico ico ico--type-dropdown-white ico--reduce size--all-xl">

                            </span>
                        </span>
                    </span>
                </span>
            </div>
        </div>
        <h2>{{_ "smileys"}}</h2>
        <div class="iGrid iGrid--gutter-xs space--mt-3">
            <div class="iGrid-item width--all-12 width--fromW2-6 space--mb-2 space--fromW2-mb-0">
                <span class="select width--all-12">
                    <select class="select-ctrl input" title="{{_ "Theme"}}" required="" name="emoticone_theme" data-plugin-option="emoticone_theme" id="emoticone_theme">
                        <option value="daily-newsletter">
							{{_ "loading"}}...
                        </option>
                    </select>
                    <span class="select-fake tGrid tGrid--auto width--all-12 hide--js-off">
                        <span class="select-txt tGrid-cell bRad--r-r input width--all-12" aria-hidden="true">
                            <span data-plugin="actual_emoticone_theme" class="js-select-val box--all-b height--ctrl overflow--wrap-break overflow--hidden">
                                {{_ "loading"}}...
                            </span>
                        </span>
                        <span class="select-arrow tGrid-cell bRad--l-r btn">
                            <span class="select-ico ico ico--type-dropdown-white ico--reduce size--all-xl">

                            </span>
                        </span>
                    </span>
                </span>
            </div>
        </div>
    </section>

    {{!--<div class="title_tab_contener">
        <p>{{_ "extension_settings"}} (<span style="cursor:pointer;-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;" data-plugin-role="version">{{extension_version}}</span>)</p>
        <p>{{_ "update the extension settings ."}}</p>
    </div>
    <div class="content_tab_contener">
        <div class="subtitle_tab_contener">
            <p>{{_ "background refresh"}}</p>
        </div>
        <div class="profil_param_notification border_grey_bottom">
            <div class="left_profil_param_champs" style="width:50%;">
                <p>{{_ "refresh time"}}&thinsp;:</p>
            </div>
            <div class="content_profil_param_champs">
                <div class="input_left flag">
                    <select name="plugin_time_between_refresh" data-plugin-option="time_between_refresh" id="plugin_time_between_refresh">
                        {{#each refresh_list}}
                        <option value="{{math this "*" 1000}}" {{#if (eq this ../time_between_refresh) }}selected{{/if}}>{{this}}</option>
                        {{/each}}
                    </select>
                </div>
                <span>{{_ "time in seconds"}}&thinsp;</span>
            </div>
        </div>
        <div class="subtitle_tab_contener">
            <p>{{_ "notifications"}}</p>
        </div>
        {{#with notifications_manage}}
        <div class="profil_param_notification">
            <div class="left_profil_param_champs" style="width:50%;">
                <p>{{_ "notifications on desktop"}}&thinsp;:</p>
            </div>
            <div class="content_profil_param_champs">
                <div class="input_left flag">
                    <label for="plugin_desktop_notifications">
                        <input data-plugin-option="desktop" data-plugin-option-cat="notifications_manage" type="checkbox" {{#if desktop}}checked{{/if}} value="1" id="plugin_desktop_notifications" name="plugin_desktop_notifications">
                        {{_ "yes"}}
                    </label>
                </div>
            </div>
        </div>
        <div class="profil_param_notification">
            <div class="left_profil_param_champs" style="width:50%;">
                <p>{{_ "deals notifications"}}&thinsp;:</p>
            </div>
            <div class="content_profil_param_champs">
                <div class="input_left flag">
                    <label for="plugin_deals_notifications">
                        <input data-plugin-option="deals" data-plugin-option-cat="notifications_manage" type="checkbox" {{#if deals}}checked{{/if}} value="1" id="plugin_deals_notifications" name="plugin_deals_notifications">
                        {{_ "yes"}}
                    </label>
                </div>
            </div>
        </div>
        <div class="profil_param_notification">
            <div class="left_profil_param_champs" style="width:50%;">
                <p>{{_ "alert notifications"}}&thinsp;:</p>
            </div>
            <div class="content_profil_param_champs">
                <div class="input_left flag">
                    <label for="plugin_alertes_notifications">
                        <input data-plugin-option="alertes" data-plugin-option-cat="notifications_manage" type="checkbox" {{#if alertes}}checked{{/if}} value="1" id="plugin_alertes_notifications" name="plugin_alertes_notifications">
                        {{_ "yes"}}
                    </label>
                </div>
            </div>
        </div>
        <div class="profil_param_notification">
            <div class="left_profil_param_champs" style="width:50%;">
                <p>{{_ "pm notifications"}}&thinsp;:</p>
            </div>
            <div class="content_profil_param_champs">
                <div class="input_left flag">
                    <label for="plugin_mp_notifications">
                        <input data-plugin-option="MPs" data-plugin-option-cat="notifications_manage" type="checkbox" {{#if MPs}}checked{{/if}} value="1" id="plugin_mp_notifications" name="plugin_mp_notifications">
                        {{_ "yes"}}
                    </label>
                </div>
            </div>
        </div>
        <div class="profil_param_notification border_grey_bottom">
            <div class="left_profil_param_champs" style="width:50%;">
                <p>{{_ "forum notifications"}}&thinsp;:</p>
            </div>
            <div class="content_profil_param_champs">
                <div class="input_left flag">
                    <input data-plugin-option="forum" data-plugin-option-cat="notifications_manage" type="checkbox" {{#if forum}}checked{{/if}} value="1" id="plugin_forum_notifications" name="plugin_forum_notifications">
                    <label for="plugin_forum_notifications">{{_ "yes"}}</label>
                </div>
            </div>
        </div>
        {{/with}}
        <div class="subtitle_tab_contener">
            <p>{{_ "UI modifications"}}</p>
        </div>
        <div class="profil_param_notification">
            <div class="left_profil_param_champs" style="width:50%;">
                <p>{{_ "Theme"}}&thinsp;:</p>
            </div>
            <div class="content_profil_param_champs">
                <div class="input_left flag">
                    <select name="plugin_theme" data-plugin-option="theme" id="plugin_theme">
                        <option value="">{{_ "loading"}}...</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="profil_param_notification border_grey_bottom">
            <div class="left_profil_param_champs" style="width:50%;">
                <p>{{_ "smileys"}}&thinsp;:</p>
            </div>
            <div class="content_profil_param_champs">
                <div class="input_left flag">
                    <select name="emoticone_theme" data-plugin-option="emoticone_theme" id="emoticone_theme">
                        <option value="">{{_ "loading"}}...</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="subtitle_tab_contener">
            <p>{{_ "Images"}}</p>
        </div>
        <div class="profil_param_notification">
            <div class="left_profil_param_champs" style="width:50%;">
                <p>{{_ "imgur connection"}}&thinsp;:</p>
            </div>
            <div class="content_profil_param_champs">
                <div plugin-role="image_upload_container"></div>
            </div>
        </div>
        <div class="profil_param_notification border_grey_bottom">
            <div class="left_profil_param_champs" style="width:50%;">
                <p>{{_ "show imgur connection under form ?"}}&thinsp;:</p>
            </div>
            <div class="content_profil_param_champs">
                <div class="input_left flag">
                    <label for="show_imgur_connection_under_form">
                        <input data-plugin-option="show_imgur_connection_under_form" type="checkbox" {{#if show_imgur_connection_under_form}}checked{{/if}} value="1" id="show_imgur_connection_under_form" name="show_imgur_connection_under_form">
                        {{_ "yes"}}
                    </label>
                </div>
            </div>
        </div>
        <div class="subtitle_tab_contener">
            <p>{{_ "custom smileys"}}</p>
        </div>
        <div class="profil_param_notification border_grey_bottom">
            <div class="left_profil_param_champs" id="plugin_smileys_list" style="width: 100%;overflow:auto;">
                <div style="margin: 20px;background: #f5f5f5;padding: 10px;">
                    <ul style="list-style: square;">
                        <li>{{_ "for security reason, please use https images"}}</li>
                        <li>{{_ "please doesn't use special character in smileys name"}}</li>
                    </ul>
                </div>
                <table style="width: 100%;">
                    <thead>
                        <tr>
                            <th></th>
                            <th><span>{{_ "Url"}}</span></th>
                            <th><span>{{_ "Name"}}</span></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {{#each smileys as |smiley_url smiley_name|}}
                        {{> customSmileyTemplate smiley_url=smiley_url smiley_name=smiley_name}}
                        {{/each}}
                        <tr>
                            <td style="cursor:pointer;text-align: center;" colspan="4">
                                <a data-plugin-role="add_new_smiley" href="javascript:;" class="validate_button_form background_color_button_green enter_validate" style="float:none; display:inline-block; margin-right:0px;">
                                    {{_ "add a new smiley"}}
                                </a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="content_profil_param_champs">
            </div>
        </div>
        <div class="subtitle_tab_contener">
            <p>{{_ "notification blacklist"}}</p>
        </div>
        <div class="profil_param_notification border_grey_bottom">
            <div class="left_profil_param_champs" style="width:30%;">
                <p>{{_ "List of blacklisted threads"}}&thinsp;:</p>
            </div>
            <div class="content_profil_param_champs">
                <p id="blacklisted-threads">
                    <ul>
                    {{#each blacklisted_thread as |url name|}}
                        <li><a href="{{url}}">{{name}}</a></li>
                    {{else}}
                        <li>{{_ "no thread blacklisted"}}</li>
                    {{/each}}
                    </ul>
                </p>
            </div>
        </div>
        <div class="subtitle_tab_contener">
            <p>{{_ "notification with sound"}}</p>
        </div>
        <div class="profil_param_notification border_grey_bottom">
            <div class="left_profil_param_champs" style="width:30%;">
                <p>{{_ "List of threads with sounds"}}&thinsp;:</p>
            </div>
            <div class="content_profil_param_champs">
                <p id="sounded-threads">
                    <ul>
                    {{#each sounded_thread as |url name|}}
                        <li><a href="{{url}}">{{name}}</a></li>
                    {{else}}
                        <li>{{_ "no thread with sound"}}</li>
                    {{/each}}
                    </ul>
                </p>
            </div>
        </div>
        <div class="profil_param_validation" style="padding-top:10px;">
            <a href="javascript:;" data-plugin-role="update_settings" class="validate_button_form background_color_button_blue" style="float:none; display:inline-block; margin-right:0px;">{{_ "update settings"}}</a>
        </div>
        <div class="subtitle_tab_contener plugin-debug">
            <p>
                {{_ "Developer part"}}
                <span title="{{_ "leave the developer world"}}" data-plugin-role="leave_developer_world" style="float: right;cursor: pointer;">✘</span>
            </p>
        </div>
        <div class="profil_param_notification border_grey_bottom plugin-debug">
            <div class="" style="padding: 10px 0;">
                <p>
                    {{_ "list of errors"}}&thinsp;:
                    <img title="{{_ "clean the list"}}" data-plugin-role="clean_error_list" src="https://static.dealabs.com/images/profil/icon_profile_messages_delete.png" style="cursor: pointer;float: right;">
                </p>
            </div>
            <div>
                <textarea name="" id="debug-logs" style="width:98%">{{_ "loading"}}...</textarea>
            </div>
        </div>
    </div>--}}
</div>