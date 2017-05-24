{{!-- Handlebarsjs template --}}
<tr>
    <td>{{#if smiley_url}}<img style="max-height:40px;" src="{{smiley_url}}" alt=":{{smiley_name}}:" />{{/if}}</td>
    <td style="padding-right: 20px;">
        <input style="box-sizing: border-box;" type="text" data-plugin-role="smiley_url" value="{{smiley_url}}" />
    </td>
    <td style="padding-right: 20px;">
        <input style="box-sizing: border-box;" type="text" data-plugin-role="smiley_name" value="{{smiley_name}}" />
    </td>
    <td onclick="$(this).parent('tr').remove();" style="cursor:pointer;" >
        <img src="https://static.dealabs.com/images/profil/icon_profile_messages_delete.png">
    </td>
</tr>