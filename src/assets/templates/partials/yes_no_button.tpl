{{!-- Handlebarsjs template 
vars : 
 - yes
 - link_info
 - role
--}}
<div class="button_part">
    <div class="bouton_contener_border" data-plugin-link-info="{{link_info}}" data-plugin-role="{{role}}">
        <div class="yes_part {{#if yes}}yes{{/if}}"></div>
        <div class="no_part {{#unless yes}}no{{/unless}}"></div>
    </div>
</div>