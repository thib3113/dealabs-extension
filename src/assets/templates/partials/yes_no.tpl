{{!-- Handlebarsjs template
vars : 
 - yes
 --}}
<div class="yes_part {{#if yes}}yes{{/if}}"></div>
<div class="no_part {{#unless yes}}no{{/unless}}"></div>