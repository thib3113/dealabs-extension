function Imgur(options){
    var self = this;
    this.options = options || {};

    this.ImgurApiKey = "9c5bf06791861cb";

    this.refreshToken = function(){
        
    }

    this.getImageType=function(type){
        switch(type){
          case "image/gif":
              return ".gif";
              break;
          case "image/jpeg":
              return ".jpeg";
              break;
          case "image/png":
              return ".png";
              break;
          case "image/bmp":
              return ".bmp";
              break;
          case "image/svg+xml":
              throw new Error("this kind of images is not supported !");
              break;
          default :
            throw new Error("unknown type : "+type);
          break;
        }
    }

    this.sendImage=function(img, cb, imgName, cbProgress){
      cb = cb || function(){}; 
      cbProgress = cbProgress || function(){}; 
      isBlob = img instanceof Blob;

      if(isBlob){
        try{
            image_extension = this.getImageType(img.type);
        }
        catch(e){
          cb(e.message)
        }
        imgName = imgName || "dealabs-paste-image"+image_extension;

        var data = new FormData();
        data.append("image", img, imgName);
      }
      else{
        cb(extension.i18n.getMessage('Please send a blob !'));
        return;
      }

      errorFunction=function(qXHR, textStatus, errorThrown, sendManually){
        sendManually = sendManually || false;
        try{
          response = JSON.parse(qXHR.responseText);
          if(response.data.error != ""){
            error = response.data.error;
            if(waitingTime = response.data.error.match(/You are uploading too fast\. Please wait ([0-9]+) more minutes\./)){
              waitingTime = waitingTime[1];
              // error = "You are sending images too fast, please wait {waitingTime} minutes".replace(/{waitingTime}/, waitingTime);
              error = extension.i18n.getMessage('You are sending images too fast, please wait $waitingTime$ minutes', waitingTime);
            }
          }
        }
        catch(e){
          switch(qXHR.status){
            case 0:
              if(errorThrown == "")
                error = extension.i18n.getMessage("something is wrong .... maybe a cross domain error, checking console can help you");
              else
                error = extension.i18n.getMessage(errorThrown);
            break;
            case 200:
              debugger;
            break;
            default:
              error = extension.i18n.getMessage(textStatus+' '+errorThrown);
            break;
          }
        }

        this.cb(error);
      }

      $.ajax({
          url : 'https://api.imgur.com/3/image',
          data: data,
          method: 'POST',
          processData: !isBlob,  // tell jQuery not to process the data
          contentType: !isBlob,   // tell jQuery not to set contentType
          dataType: 'JSON',
          cb : cb,
          crossDomain: true,
          beforeSend: function (request){
              request.withCredentials = true;
              request.setRequestHeader("Authorization", 'Client-ID ' + self.ImgurApiKey);
          },
          success:function(response){
            if(response.success){
              //use current http scheme
              response.data.link = response.data.link.replace(/^https?\:/i, "");
              this.cb(null, response.data)
            }
            else{
              //try reading errors
              status = 0;
              errorText = "unknown error";
              if(response != undefined){
                if(response.status != undefined)
                  status = response.status

                if(response.data != undefined){
                  if(response.data.error != undefined)
                    errorText = response.data.error;
                }
              }

              errorFunction({status:status}, "error", errorText, true);
            }
          },
          xhr: function() {
            var myXhr = $.ajaxSettings.xhr();
            if(myXhr.upload){
              myXhr.upload.addEventListener('progress', cbProgress, false);
            }
            return myXhr;
          },
          error:errorFunction
      });
    }
}