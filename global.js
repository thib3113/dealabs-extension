time_between_refresh_list = [15,30,60,120,240];

theme_list = {
  'DeaLabs' : 'default',
  'DarkLabs' : 'darkLabs',
  'JVLabs.com' : 'JVLabs'
}

theme_url = 'https://cdn.rawgit.com/thib3113/dealabs-extension/master/themes/';
dev_theme_url = 'https://rawgit.com/thib3113/dealabs-extension/master/themes/';

//for dev time
// theme_url = dev_theme_url;

dealabs_protocol = "http://";


if(typeof chrome != "undefined"){
  extension = new ChromeExtension();
}

settingsManager = new SettingsManager();

function soundAlert(){
  audio = new Audio('sounds/alert.mp3');
  audio.play();
  audio = null;
}

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
        // console.log('noty : '+error);
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

    imgHtml = $image_progress.find('img').get(0).outerHTML;

    $image_progress.remove();

    if(error == null){
      if(response.error){
        // alert('Une erreur est apparue lors de l\'envoi de l\'image : '+response.error);
        failcb(this.textarea, this.id, response.error, imgHtml);
      }
      oldValue = $(textarea).val();
      newValue = oldValue.replace(new RegExp('\\[img_wait_upload:'+this.id+'\\]'), '[img size=300px]'+response.url.direct+'[/img]');
      $(textarea).val(newValue);
    }
    else{
      // console.log('noty : '+error+' '+imgHtml);
      // noty({
      //   layout: 'bottom',
      //   type: 'error',
      //   text: error+' '+imgHtml,
      //   timeout: 20000
      // });
      // alert('Une erreur est apparue lors de l\'envoi de l\'image : '+error);
      failcb(this.textarea, this.id, error, imgHtml);
    }
  }.bind({textarea:textarea, id:addImageInFormCounter,$image_progress:$image_progress});
  
  $(textarea).after($image_progress);
  cbProgress = function(evt) {
    if (evt.lengthComputable) {
      var percentComplete = evt.loaded / evt.total;
      $image_progress.find('.float_loader').height((100-Math.round(percentComplete * 100))+"px");
    }
  }.bind({$image_progress:$image_progress})

  if(pUpload){
    sendToTurboPix(img, cbFunction, null, cbProgress)
  }
  else{
    cbFunction(null, {
      error : false,
      url:{
        direct : img
      }
    })
  }
}

function sendToTurboPix(img, cb, imgName, cbProgress){
  isBlob = img instanceof Blob;

  if(isBlob){
    switch(img.type){ 
      case "image/gif": 
          image_extension = ".gif"; 
          break; 
      case "image/jpeg": 
          image_extension = ".jpeg"; 
          break; 
      case "image/png": 
          image_extension = ".png"; 
          break; 
      case "image/bmp": 
          image_extension = ".bmp"; 
          break; 
      case "image/svg+xml": 
          cb('type d\'image refusé');
          return;
          break; 
      default :
        cb('unknow type');
        return;
      break;
    }
    imgName = imgName || "dealabs-paste-image"+image_extension;
  
    var data = new FormData();
    data.append("k", "FORMODULE");
    data.append("ku", settingsManager.turbopixAPIKey);
    data.append("f", img, imgName);
  }
  else{
    data = {
      k : "FORMODULE",
      ku : settingsManager.turbopixAPIKey,
      f : img
    }
  }

  if(location.protocol == "https:")
    cb('cette fonctionnalitée ne fonctionne pas en https !');
      
  $.ajax({
      url : 'http://www.turbopix.fr/api',
      data: data,
      method: 'POST',
      processData: !isBlob,  // tell jQuery not to process the data
      contentType: !isBlob,   // tell jQuery not to set contentType
      dataType: 'JSON',
      cb : cb,
      success:function(response){
        this.cb(null, response)
      },
      xhr: function() {
        var myXhr = $.ajaxSettings.xhr();
        if(myXhr.upload){
          myXhr.upload.addEventListener('progress', cbProgress, false);
        }
        return myXhr;
      },
      error:function(qXHR, textStatus, errorThrown ){
        try{
          response = JSON.parse(qXHR.responseText);
          if(response.error != ""){
            this.cb(response.error);
          }
        }
        catch(e){
          switch(qXHR.status){
            case 413:
              this.cb('l\'image est trop grosse pour le serveur');
            break;
            case 200:
              if(textStatus == "parsererror"){
                if(qXHR.responseText.match(/Allowed memory size of/)){
                  cb('erreur du serveur, merci de reessayer');
                }
              }
            break;
            default:
              this.cb(textStatus+' '+errorThrown);
            break;
          }
        }
      }
  });
}

function send_desktop_notification(title, text, icon, url, slug){
  extension.sendNotification({
    type : 'basic',
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
          setTimeout(update, 500);
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