{{!-- Handlebarsjs template 
vars : 
 - time
 - status
--}}
<div title="{{_ "connection checked $time$ ago" time}}" data-plugin-role="imgurStatus"> 
    {{> status status=status time=time}}
    <div data-plugin-role="refresh" style="cursor:pointer;width:11px;display: inline-block;line-height: 0.5em;">
        <img title="{{_ "refresh"}}" style="width:100%" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTE3LjY1LDYuMzVDMTYuMiw0LjkgMTQuMjEsNCAxMiw0QTgsOCAwIDAsMCA0LDEyQTgsOCAwIDAsMCAxMiwyMEMxNS43MywyMCAxOC44NCwxNy40NSAxOS43MywxNEgxNy42NUMxNi44MywxNi4zMyAxNC42MSwxOCAxMiwxOEE2LDYgMCAwLDEgNiwxMkE2LDYgMCAwLDEgMTIsNkMxMy42Niw2IDE1LjE0LDYuNjkgMTYuMjIsNy43OEwxMywxMUgyMFY0TDE3LjY1LDYuMzVaIiAvPjwvc3ZnPg==" alt="refresh"> 
    </div>
</div>