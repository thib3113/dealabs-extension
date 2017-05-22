{{!-- Handlebarsjs template 
vars : 
 - yes
 - title
 - description
 - link_info
 - role
--}}
<div class="button_part">
    <div class="bouton_contener_border" data-plugin-link-info="{{link_info}}" data-plugin-role="{{role}}">
        {{> yes_no yes=yes}}
    </div>
</div>

<div class="title_button_part">
    <p>{{title}}</p>
    <p>{{description}}</p>
</div>