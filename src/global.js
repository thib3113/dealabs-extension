try{
  ///////////////
  // VARIABLES //
  ///////////////
  time_between_refresh_list = [15,30,60,120,240];

  theme_list_url = "https://thib3113.github.io/dealabs-extension/themes_list.json";
  emoticone_theme_list_url = "https://thib3113.github.io/dealabs-extension/emoticon_theme.json";

  theme_url = 'https://thib3113.github.io/dealabs-extension/themes/';

  emoticone_theme_url = 'https://thib3113.github.io/dealabs-extension/emoticons_themes/';

  dealabs_protocol = "https://";

  //////////////////////
  // GLOBAL FUNCTIONS //
  //////////////////////
  function soundAlert(){
    audio = new Audio('sounds/alert.mp3');
    audio.play();
    audio = null;
  }

  function basename (path, suffix) {
    //  discuss at: http://locutus.io/php/basename/
    // original by: Kevin van Zonneveld (http://kvz.io)
    // improved by: Ash Searle (http://hexmen.com/blog/)
    // improved by: Lincoln Ramsay
    // improved by: djmix
    // improved by: Dmitry Gorelenkov
    //   example 1: basename('/www/site/home.htm', '.htm')
    //   returns 1: 'home'
    //   example 2: basename('ecra.php?p=1')
    //   returns 2: 'ecra.php?p=1'
    //   example 3: basename('/some/path/')
    //   returns 3: 'path'
    //   example 4: basename('/some/path_ext.ext/','.ext')
    //   returns 4: 'path_ext'

    var b = path
    var lastChar = b.charAt(b.length - 1)

    if (lastChar === '/' || lastChar === '\\') {
      b = b.slice(0, -1)
    }

    b = b.replace(/^.*[\/\\]/g, '')

    if (typeof suffix === 'string' && b.substr(b.length - suffix.length) === suffix) {
      b = b.substr(0, b.length - suffix.length)
    }

    return b
  }

  get_params_from_url = function(search_string) {
    var parse = function(params, pairs) {
      var pair = pairs[0];
      var parts = pair.split('=');
      var key = decodeURIComponent(parts[0]);
      var value = decodeURIComponent(parts.slice(1).join('='));

      // Handle multiple parameters of the same name
      if (typeof params[key] === "undefined") {
        params[key] = value;
      } else {
        params[key] = [].concat(params[key], value);
      }

      return pairs.length == 1 ? params : parse(params, pairs.slice(1))
    }

    // Get rid of leading ?
    return search_string.length == 0 ? {} : parse({}, search_string.substr(1).split('&'));
  }

  if(navigator.userAgent.match(/Chrome/gi)){ 
    extension = new ChromeExtension(); 
  } 
  else if(navigator.userAgent.match(/Firefox/gi)){ 
    extension = new FirefoxExtension();
  } 
  else 
    throw new Error("unknown navigator "+navigator.userAgent); 

  settingsManager = new SettingsManager();
  var imgurManager;
  settingsManager.syncSettings(function(){
    imgurManager = new Imgur();
  })

  extension.onMessage('update_settings', function(datas){
    settingsManager.syncSettings();
  });

  var profilsCache = {};
  var getProfile = function(profile_id, cb){
    if(profile_id == undefined)
      throw Error("profile_id is empty");

    if(profilsCache[profile_id] != undefined){
      cb(null, profilsCache[profile_id]);
    }
    else{
      $.ajax({
        cb:cb,
        url:dealabs_protocol+"www.dealabs.com/"+profile_id+"/username",
        success:function(response){
          response = response.replace(/src=["|']\/\//g, dealabs_protocol+'');
          $page = $(response);
          user = {
            img : $page.find(".left_image_profil img").get(0).src,
            pseudo : $page.find(".pseudo").text()        
          }

          profilsCache[profile_id] = user;

          this.cb(null,user);
        },
        error:function(){
          this.cb("error", {
            pseudo:"error",
            img: dealabs_protocol+"static.dealabs.com/images/all/no_image_profil.png"
          })
        }
      })
    }
  }

  var extractToken = function(hash) {
    var match = hash.match(/access_token=(\w+)/);
    return !!match && match[1];
  };

  function isDataURL(s) {
      s = s||"";
      return !!s.match(isDataURL.regex);
  }
  isDataURL.regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;

  addImageInFormCounter = 0;
  function addImageInForm(textarea, img, cursorPos, pUpload){
    cursorPos = cursorPos || $(textarea).val().length;

    v = $(textarea).val();
    var textBefore = v.substring(0, cursorPos);
    var textAfter = v.substring(cursorPos, v.length);
    $(textarea).val(textBefore +'[img_wait_upload:'+(++addImageInFormCounter)+']'+ textAfter);

    // $(textarea).val($(textarea).val()+'[img_wait_upload:'+(++addImageInFormCounter)+']');

    //check if it's an https? url
    if(typeof img == "string" && img.match(/(https?:\/\/[^\]\s]+)(?: ([^\]]*))?/)){
      imageUrl = img;
    }
    else{
      var urlCreator = window.URL || window.webkitURL;
      var imageUrl = urlCreator.createObjectURL(img);
    }

    var oImg=document.createElement("img");
    oImg.setAttribute('src', imageUrl);
    oImg.setAttribute('alt', 'image in wait');
    oImg.setAttribute('style', 'height:100px');
    var $image_progress = $('<div style="margin:10px;display:inline-block;position:relative;height:100px;" id="plugin_upload_image_'+addImageInFormCounter+'"><div class="float_loader" style="width:100%;background:white;bottom:0;opacity:0.5;height:100px;position:absolute;"></div></div>');
    $image_progress.append(oImg);
    cbFunction = function(error, response){
      failcb = function(textarea, id, error, img){
        noty({
          layout: 'bottom',
          type: 'error',
          text: '<span style="height:100px;line-height:100px;display:inline-flex;"><span style="margin:5px">'+img+'</span> '+error+'</span>',
          timeout: 20000
        });

        oldValue = $(textarea).val();
        newValue = oldValue.replace(new RegExp('\\[img_wait_upload:'+id+'\\]'), '');
        $(textarea).val(newValue);
      }

      img = $image_progress.find('img').get(0);
      imgHtml = img.outerHTML;
      imgWidth = img.naturalWidth || 300;

      $image_progress.remove();

      if(error == null){
        if(response.error != undefined){
          failcb(this.textarea, this.id, response.error, imgHtml);
        }

        oldValue = $(textarea).val();
        newValue = oldValue.replace(new RegExp('\\[img_wait_upload:'+this.id+'\\]'), '[img size='+imgWidth+'px]'+response.link+'[/img]');
        $(textarea).val(newValue);
      }
      else{
        failcb(this.textarea, this.id, error, imgHtml);
      }
    }.bind({textarea:textarea, id:addImageInFormCounter,$image_progress:$image_progress});

    $(textarea).parents(".comment_text_part_textarea").after($image_progress);
    cbProgress = function(evt) {
      if (evt.lengthComputable) {
        var percentComplete = evt.loaded / evt.total;
        $image_progress.find('.float_loader').height((100-Math.round(percentComplete * 100))+"px");
      }
    }.bind({$image_progress:$image_progress})

    if(pUpload){
      sendToImgur(img, cbFunction, null, cbProgress)
    }
    else{
      cbFunction(null, {
        error : undefined,
        link: img
      })
    }
  }

  function sendToImgur(img, cb, imgName, cbProgress){
    imgurManager.sendImage(img,cb,imgName,cbProgress);
  }

  function send_desktop_notification(title, text, icon, url, slug, items){
    extension.sendNotification({
      type : items==undefined?'basic':"list",
      items : items,
      iconUrl : icon,
      title : title,
      message : text,
      slug : slug,
      datas : {
        url:url
      },
      onClick : function(datas){
        extension.openTab({
          active : true,
          url : datas.url,
          onLoad: function(){
            setTimeout(updateNotifications, 500);
          }
        })
      }
    });
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

  dealabs = new Dealabs();

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

  plugin_BBcodesSmiley = [ //pensive is used in http link, need to be first
    {
     "icon" : "emoji_pensive",
     "name" : "pensive",
     "smiley" : ":/" 
    },
    {
     "icon" : "emoji_happy_sweat", //happy sweat need to be before zipper_mouth
     "name" : "happy_sweat", //happy sweat need to be before zipper_mouth
     "smiley" : "(:|"
    },
    {
     "icon" : "emoji_zipper_mouth",
     "name" : "zipper_mouth",
     "smiley" : ":|"
    },
    {
     "icon" : "emoji_smiling",
     "name" : "smiling",
     "smiley" : ":)"
    },
    {
     "icon" : "emoji_wink",
     "name" : "wink",
     "smiley" : ";)"
    },
    {
     "icon" : "emoji_sad",
     "name" : "sad",
     "smiley" : ":("
    },
    {
     "icon" : "emoi_happy",
     "name" : "happy",
     "smiley" : ":D"
    },
    {
     "icon" : "emoji_astonished",
     "name" : "astonished",
     "smiley" : ":o"
    },
    {
     "icon" : "emoji_grinning",
     "name" : "grinning",
     "smiley" : "^^"
    },
    {
     "icon" : "emoji_sunglasses",
     "name" : "sunglasses",
     "smiley" : "B)"
    },
    {
     "icon" : "emoji_sad_sweat",
     "name" : "sad_sweat",
     "smiley" : "-_-'"
    },
    {
     "icon" : "emoji_confounded",
     "name" : "confounded",
     "smiley" : "xS"
    },
    {
     "icon" : "emoji_crazy",
     "name" : "crazy",
     "smiley" : ":P"
    },
    {
     "icon" : "emoji_disgusted",
     "name" : "disgusted",
     "smiley" : ":S"
    },
    {
     "icon" : "emoji_laughing_tears",
     "name" : "laughing_tears",
     "smiley" : "xD"
    },
    {
     "icon" : "emoji_loudly_crying",
     "name" : "loudly_crying",
     "smiley" : ":'("
    },
    {
     "icon" : "emoji_devil",
     "name" : "devil",
     "smiley" : "':)"
    },
    {
     "icon" : "emoji_heart_eyes",
     "name" : "heart_eyes",
     "smiley" : ":3"
    },
    {
     "icon" : "emoji_nerd",
     "name" : "nerd",
     "smiley" : "|D"
    },
    {
     "icon" : "emoji_redface",
     "name" : "redface",
     "smiley" : "|o"
    },
    {
     "icon" : "emoji_smart",
     "name" : "smart",
     "smiley" : ":{"
    },
    {
     "icon" : "emoji_fierced",
     "name" : "fierced",
     "smiley" : "(fierce)"
    },
    {
     "icon" : "emoji_creep",
     "name" : "creep",
     "smiley" : "(creep)"
    },
    {
     "icon" : "emoji_ninja",
     "name" : "ninja",
     "smiley" : "(ninja)"
    },
    {
     "icon" : "emoji_popcorn",
     "name" : "popcorn",
     "smiley" : "(popcorn)"
    },
    {
     "icon" : "emoji_thumbs_up",
     "name" : "thumbs_up",
     "smiley" : "(like)"
    },
    {
     "icon" : "emoji_angel",
     "name" : "angel",
     "smiley" : "(angel)"
    },
    {
     "icon" : "emoji_raised_hand",
     "name" : "raised_hand",
     "smiley" : "(highfive)"
    },
    {
     "icon" : "emoji_shocked",
     "name" : "shocked",
     "smiley" : "(shock)"
    }
  ]

}
catch(e){
    try{
        extension.log(e.message, e.stack);
    }
    catch(err){
        console.error(e);
    }
    finally{
        throw e;
    }
}