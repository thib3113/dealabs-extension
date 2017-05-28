{{!-- Handlebarsjs template 
vars : 
 - yes
 - title
 - description
 - link_info
 - role
--}}
{{> yes_no_button yes=yes link_info=link_info role=role}}

<div class="title_button_part">
    <p>{{title}}</p>
    <p>{{description}}</p>
</div>