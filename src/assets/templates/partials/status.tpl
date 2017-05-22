{{!-- Handlebarsjs template 
vars : 
 - time
 - status
--}}
  {{_ "imgur connection status"}} ({{time}}) 
    <div data-plugin-role="imgurLightStatus" style="height: 7px;background: {{#if status}}green{{else}}red{{/if}};width: 7px;border:1px solid grey;border-radius: 20px;display:inline-block;line-height: 0.5em;">&nbsp;</div>