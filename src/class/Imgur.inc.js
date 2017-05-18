function Imgur(options){
    var self = this;
    this.options = options || {};

    this.ImgurApiKey = "9c5bf06791861cb";

    this.oauth2Url = "https://api.imgur.com/oauth2/authorize?response_type=token&client_id="+this.ImgurApiKey

    this.askForToken = function(){
      extension.setStorage({
          page_before_imgur_request:document.location.href,
      });
      document.location = this.oauth2Url;
    }

    // this._generateAjax = function(){

    // }

    // this.refreshToken = function(){
        
    // }
    
    this.checkConnexion=function(cb){
      $.ajax({
          url : 'https://api.imgur.com/3/account/me',
          dataType: 'JSON',
          cb : cb,
          crossDomain: true,
          beforeSend: function (request){
              request.withCredentials = true;
              if(self.options.access_token != null && self.options.access_token != undefined && self.options.expires_date> (Date.now()/1000))
                request.setRequestHeader("Authorization", 'Bearer ' + self.options.access_token);
              else
                request.setRequestHeader("Authorization", 'Client-ID ' + self.ImgurApiKey);
          },
          success:function(response){
            if(response.success){
              this.cb(response.data)
            }
            else{
              this.cb(false)
            }
          },
          error:function(){
            this.cb(false);
          }
      });
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
        data.append("name", imgName);
      }
      else{
        //get the name from the link
        img_parts = img.split("/");

        var data = new FormData();
        data.append("image", img);
        data.append("name", img_parts[img_parts.length-1]);
        data.append("type", "url");
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
              if(navigator.onLine != undefined && navigator.onLine === false)
                error = extension.i18n.getMessage("you're offline, please check your internet connection");
              else if(errorThrown == "")
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
          processData: false,  // tell jQuery not to process the data
          contentType: false,   // tell jQuery not to set contentType
          dataType: 'JSON',
          cb : cb,
          crossDomain: true,
          beforeSend: function (request){
              request.withCredentials = true;
              if(self.options.access_token != null && self.options.access_token != undefined && self.options.expires_date> (Date.now()/1000))
                request.setRequestHeader("Authorization", 'Bearer ' + self.options.access_token);
              else
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

    this.init=function(){
      if(location.hostname+location.pathname == "thib3113.github.io/dealabs-extension/redirect.html"){
        if(errorMessage = location.search.match(/error=([^&\s]+)/g)){
          alert(extension._("an error appear when we try to get a token from imgur : XX", errorMessage));
        }
        else{
          params = get_params_from_url(location.hash);

          if(params.access_token != undefined && params.access_token.length>0){
            extension.sendMessage("save_imgur_informations", params);
          }
        }

        extension.getStorage(["page_before_imgur_request"], function(storage){
          // debugger;
          if(storage.page_before_imgur_request != undefined && storage.page_before_imgur_request.length>0)
            link = storage.page_before_imgur_request;
          else
            link = "https://www.dealabs.com";
          setTimeout(function(){
            document.location = this.link;
          }.bind({link:link}),3000);
        });
        return;
      }

      this.options = settingsManager.imgurAPI;

      if(this.options.expires_date != null && this.options.expires_date<(Date.now()/1000)){
        expires_date = new Date(this.options.expires_date*1000);
        extension.sendNotification({
          type : 'basic',
          iconUrl : "https://thib3113.github.io/dealabs-extension/img/warning.png",
          title : extension._("you'r imgur token has expired"),
          message : extension._("you'r imgur token has expired the XX, click here to re - register", expires_date.toLocaleDateString()),
          slug : "imgur_token_expired",
          datas : {
            url:this.oauth2Url
          },
          requireInteraction:true
        });
      }
    }
    this.init();
}