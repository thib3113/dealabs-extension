{{!-- Handlebarsjs template 
vars : 
 - time
 - status
--}}
<div title="{{_ "connection checked $time$ ago" time}}" data-plugin-role="imgurStatus"> 
    {{> status status=status time=time}}
</div>