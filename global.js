time_between_refresh_list = [15,30,60,120,240];

theme_list = {
  'DeaLabs' : 'default',
  'DarkLabs' : 'darkLabs'
}

theme_url = 'https://cdn.rawgit.com/thib3113/dealabs-extension/master/themes/';

//start with default settings
defaultSettings = {
    time_between_refresh : 60000,
    notifications_manage : {
      desktop : true,
      forum : true,
      MPs : true,
      deals : true,
      alertes : true
    },
    theme : "default",
    smileys : {
        "siffle" : "http://www.turbopix.fr/i/RZAK5VBi4M.gif",
        "fouet"  : "http://www.turbopix.fr/i/BpU1pU7Onm.gif",
        "troll"  : "http://www.turbopix.fr/i/7FU50TeJ5C.png",
        "jaime"  : "http://www.turbopix.fr/i/hb4xtAwWjK.png"
    }
}

//start by defaultSettings
var plugin_settings = defaultSettings;
function syncSettings(){
    chrome.storage.sync.get('settings', function(value){
        // console.log("sync");
        // console.log(value);
        // debugger;
        //update settings
        before_settings = value.settings || {};
        newSettings = plugin_deepmerge(defaultSettings, before_settings);
        chrome.storage.sync.set({'settings':newSettings});
        plugin_settings = newSettings;
    });
}
syncSettings();

var notificationsLinks = {};
function notify(title, text, icon, url){
    var notif = chrome.notifications.create(null, {title:title, 'message':text, 'type':'basic', 'iconUrl':icon, 'isClickable':true}, function(id){
        notificationsLinks[id] = this.link;
    }.bind({link:url}));
}


Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function plugin_deepmerge(target, src) {
    var array = Array.isArray(src);
    var dst = array && [] || {};

    if (array) {
        target = target || [];
        dst = dst.concat(target);
        src.forEach(function(e, i) {
            if (typeof dst[i] === 'undefined') {
                dst[i] = e;
            } else if (typeof e === 'object') {
                dst[i] = plugin_deepmerge(target[i], e);
            } else {
                if (target.indexOf(e) === -1) {
                    dst.push(e);
                }
            }
        });
    } else {
        if (target && typeof target === 'object') {
            Object.keys(target).forEach(function (key) {
                dst[key] = target[key];
            })
        }
        Object.keys(src).forEach(function (key) {
            if (typeof src[key] !== 'object' || !src[key]) {
                dst[key] = src[key];
            }
            else {
                if (!target[key]) {
                    dst[key] = src[key];
                } else {
                    dst[key] = plugin_deepmerge(target[key], src[key]);
                }
            }
        });
    }
    return dst;
}

function plugin_escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function plugin_match_all(re, str){
  var retour = [];
  while ((m = re.exec(str)) !== null) {
    if (m.index === re.lastIndex) {
        re.lastIndex++;
    }
    retour.push(m);
  }

  return retour;
}

function plugin_nl2br(str) {  
  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ '<br>' +'$2');
}

function plugin_getUrls(content){
  var re = /((?:http|ftp|https):\/\/[\w-]+(?:\.[\w-]+)+(?:[\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?)/g; 
  return content.match(re) || [];
}

plugin_BBcodes = [
  {
    regex : /\[img size="?([0-9]*)px"?\]([^\]]*)\[\/img\]/gi,
    html : '<img alt="" class="BBcode_image" onclick="window.open(this.src);" style="max-width:$1px;" src="$2">',
    name : 'img'
  },
  {
    regex : /\[img size="?([0-9]*)"?\]([^\]]*)\[\/img\]/gi,
    html : '<img alt="" class="BBcode_image" onclick="window.open(this.src);" style="max-width:$1px;" src="$2">',
    name : 'img'
  },
  {
    regex : /\[img\s*\]([^\]]*)\[\/img\]/gi,
    html : '<img alt="" class="BBcode_image" onclick="window.open(this.src);" style="max-width:300px;" src="$1">',
    name : 'img'
  },
  {
    regex : /\[citer pseudo="?([^"]*)"?\]/gi, 
    html : '<div class="quote">\
    <div class="quote_pseudo text_color_777777">\
        <p class="pseudo_tag">\
            <span class="text_color_333333">$1</span><span> a écrit</span><a href="javascript:;" class="open text_color_777777">Afficher l\'intégralité de la citation</a>\
        </p>\
    </div>\
    <div class="quote_message text_color_777777">',
    name : 'quote_start'
  },
  {
    regex : /\[citer\s*\]/gi, 
    html : '<div class="quote">\
    <div class="quote_pseudo text_color_777777">\
        <p class="pseudo_tag">\
            <span class="text_color_333333">Quelqu\'un</span><span> a écrit</span><a href="javascript:;" class="open text_color_777777">Afficher l\'intégralité de la citation</a>\
        </p>\
    </div>\
    <div class="quote_message text_color_777777">',
    name : 'quote_start'
  },
  {
    regex : /\[\/citer\]/gi, 
    html : '</div></div>',
    name : 'quote_end'
  },
  {
    regex : /\[spoiler\s*\]/gi, 
    html : '<div class="spoiler">\
          <a href="javascript:;" class="click_div_spoiler text_color_333333">Ce message a été masqué par son auteur. Cliquez pour l’afficher.</a>\
          <div class="spoiler_hide text_color_777777" style="display: none;">',
    name : 'spoil_start'
  },
  {
    regex : /\[\/spoiler\]/gi, 
    html : '</div></div>',
    name : 'spoil_end'
  },
  {
    regex : /\[b\]/gi, 
    html : '<b>',
    name : 'b_end'
  },
  {
    regex : /\[\/b\]/gi, 
    html : '</b>',
    name : 'b_end'
  },
  {
    regex : /\[i\]/gi, 
    html : '<i>',
    name : 'i_end'
  },
  {
    regex : /\[\/i\]/gi, 
    html : '</i>',
    name : 'i_end'
  },
  {
    regex : /\[u\]/gi, 
    html : '<u>',
    name : 'u_end'
  },
  {
    regex : /\[\/u\]/gi, 
    html : '</u>',
    name : 'u_end'
  },
  {
    regex : /\[s\]/gi, 
    html : '<del>',
    name : 'del_end'
  },
  {
    regex : /\[\/s\]/gi, 
    html : '</del>',
    name : 'del_end'
  },
  {
    regex : /\[up\]/gi, 
    html : '<font style="font-size:1.2em;">',
    name : 'up_end'
  },
  {
    regex : /\[\/up\]/gi, 
    html : '</font>',
    name : 'up_end'
  }
];

plugin_BBcodesSmiley = [
  { 
    name:"img-souris",
    smiley:":)"
  },
  { 
    name:"img-clindoeil",
    smiley:";)"
  },
  { 
    name:"img-triste",
    smiley:":("
  },
  { 
    name:"img-rire",
    smiley:":D"
  },
  { 
    name:"img-surpris",
    smiley:":o"
  },
  { 
    name:"img-cool",
    smiley:"^^"
  },
  { 
    name:"img-lunette",
    smiley:"B)"
  },
  { 
    name:"img-stress",
    smiley:"-_-'"
  },
  { 
    name:"img-sour",
    smiley:"xS"
  },
  { 
    name:"img-silly",
    smiley:":P"
  },
  { 
    name:"img-sick",
    smiley:":S"
  },
  { 
    name:"big_grin_squint",
    smiley:"xD"
  },
  { 
    name:"crying",
    smiley:":'("
  },
  { 
    name:"evil",
    smiley:"':)"
  },
  { 
    name:"inlove",
    smiley:":3"
  },
  { 
    name:"nerdy",
    smiley:"|D"
  },
  { 
    name:"zipped",
    smiley:":|"
  },
  { 
    name:"redface",
    smiley:"|o"
  }
]