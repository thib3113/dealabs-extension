function Embed($urls){
    this.$urls = $urls;
    this.tpl = {
        mojvideo : '<iframe width="100%" height="500" src="{{protocol}}//www.mojvideo.com/embed/v/{{id}}" frameborder="0" allowfullscreen></iframe>',
        dailymotion : '<iframe frameborder="0" width="100%" height="500" src="{{protocol}}//www.dailymotion.com/embed/video/{{id}}?autoplay=1" allowfullscreen></iframe>',
        soundcloud : '<iframe width="100%" height="500" scrolling="no" frameborder="no" src="{{protocol}}//w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/{{id}}&auto_play=true&hide_related=false&show_comments=true&show_user=true&show_reposts=false&visual=true"></iframe>',
        youtube : '<iframe id="ytplayer" height="500" width="100%" type="text/html" src="{{protocol}}//www.youtube.com/embed/{{id}}?autoplay=1&origin={{base_url}}" frameborder="0"/>',
        vimeo : '<iframe src="{{protocol}}//player.vimeo.com/video/{{id}}?autoplay=1" width="100%" height="500" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
    }

    this.logos = {
        mojvideo : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAC61BMVEUAAADf5OH4+fb9//bJz9Hn6enq3dXL0dTb3d3T1tewsLD9/PrLzs6srKzz8fDX2Na5uLfw9fDAxsigpq+GjJt9g5WIjJ6iprLGys/n6un////W3NunrbZscYk8QGRSVnaYnK3W2t7s7evb4OCfpLFLUHB5fZbS1tvk5eP///+utL5MUHGChp7a3eDQysLQ1dlydo+xtMHc3dyxtsDV2NmUmarHytCGip+8v8eIjaG6vcWcoLDAw8i8wMnDxcXa3t+Ch5yssLq8vLv///+/w8m6vL3Dwb7g4eCzt7+2uLq2trXZ29q5vcGFipudoKu0tre2trXh4N7GyMivs7aan6aQlZ+VmaOlqK2ytLa3uLe/vrwlKVMfI04gJE8sMFkbH0sXG0gYHEoZHUoZHUoYHEkWGkgjJ1IXG0gZHUoYHEkWGkcXG0gZHUoZHUoZHUoYHEkcIEwaHksZHUoXG0hHSm57fZc8P2UZHUoXG0gZHUoZHUoXG0krL1k8QWYXG0gZHUoWGkeJi6L6+vvi4uibnLA/QmgYHEkYHEkZHUoWGkhyd5IkKFIYHEoZHUoXG0mhorW+v8l/gZjg4ebl5eqChJwmKVQYHEkWGkhHS28dIU0ZHUoZHUoZHUqqq7yvsL4WGkc3OmGio7T5+fqdnrEcIEwXG0g2OmIdIU0ZHUoZHUoYHEqoqruvsL4ZHElFSG2wscHg4ORucIgZHUkXG0g4PGMmKlQYHEkZHUoXG0ibnbHExM6Sk6jf3+Wvr7xBRGUWGkcZHUoWGkhMUHNESWwWGkgZHUoVGUd+gJn19fbAwMpeYHwdIUsWGkgZHUoZHUoXG0h6fpcdIU0YHEoXG0k7PmRbXXojJk8VGUcZHUoZHUoZHUoXG0g1OWFdYn4YHEoYHEoYHEkVGUcYHEoZHUoZHUoZHUoXG0gkKFOMkKNgZYAgJFAWGkgYHEkYHEkYHEkXG0gXG0gwNFyHi55PVHIxNVwnLFUqLlc7QGRmaoRBpg2LAAAAW3RSTlMAAAAAAAAAAAAAAAAAAAAAAAQ5k8/n6M2NNAMThef//uR9EBOl/vygEQSI/v2DA0Dp6D6dndnc8vjz+dvjoKpG7O9NBZGXBxmztxwal/HzmxwIT7Dr///ttFMJK6ASDQAAAHlJREFUGNOtyzEOAVEARdF/xk9ECDqNDagUOsGE0gJYgQVZgkYxPRXJ2IlEo7QC0fCN3u3ezX1C0PXh/gxqepjighv1PuN3UHI1YJIuJwzNfTkwWqpSxKz9I7J/CLltZW/EqFURkcbMLu21UlPOHqw4E0JnkYrjI7wAyl8R2zj4wpoAAAAASUVORK5CYII=',
        soundcloud : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAcFJREFUeNqUU91KG1EQ/uZ026T5qa0gBjVexUhEKNYLQShIX0JoqxcS8yK96hOUgqEv0Ps+gC/gnRGlUPGnRXrRVk3X7DnHmdlskk0DJQeGmTMz33yzc2bJN/AawB7LY4x32ix14gI/UVmYRL4wHvzmGjg5vgrYnMSjHNBxvZj3/bwBE5RoMQQDTAXq6dgU0KvtU+CkABGl7lrA/7UDQNFetRsoSF1mQ2KTavEHmnMXdQExqwB9dgIuCpHZ+gDKPYW7PETny3sm+6VgqWb6HUQKFqDLFGFqrxCsv4G9PIIpPwdl2Te7DBRLCD9uIzBxN0JqlLkdqdDqJh7uNEHzq/BSzbrUFIPFlwjW3sIV5jRfQkYjPAOzvg0q1bR/nwCtH3oHILP5DplGU+cWdyDeMIJZ2ogBytzVkcc/TyGsM1WOxdw6D/AM/MVXEDMTl1WdfMKIY/c/g27aOgeyu9zJjyfdyeeBygrcaQtUfQF3cgA8m4Yn01sgCkPQWQsPxJ7+zUQNLvAth+Rr/dA2jlqmeBdY5m/jZ6Q7q5k0AjBylZN1ZglYzpGNZvGHUkn/PUUvuefSQR1l+4kvpTF/5++CvRdgAO38yAFPFQvXAAAAAElFTkSuQmCC',
        dailymotion : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAJ1BMVEUAZN33+v7a6fpCjucGbd8ceeKuz/Ts8/yEte8zhuVioeudxPLG3Pfxm23KAAAAYElEQVR42n3OSwoAMQgD0PqL2vb+553PwrYMTMDNIxDbX9RMDxAgj0I4y163oAKVAAILZBK5e4GBfAQWCNMwTRR09/6s7BDabBTkJI4eXKCd35GCW8CMMZHr0Uy7T9snFx2sAnvnbX9dAAAAAElFTkSuQmCC',
        youtube : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAYAAAB24g05AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wgFEBsGdGFydgAAAUpJREFUKM99krFKXFEQhr8598gVXAyYNApioqAQF0KKPMGKLyEWlnkOCxtJGSzEWgVLwTxBLJJHSJNCMNEQiSibe2Z+C7fY624y8DfD/3/DmTn2/fXypCX7CLwDpoEpoAYmgIrHcqAB+sAdcAN8Veh9DtgxaYv/Vx5AO8BzYB7oCv5kl3qmMZGqggiQ/kkV9FJxzZYQw2qaQmdjk7TaxfMERfDUU0IU12zyUMdDtORB/eYtC8cnzOx+IC2v4BgjvlAnuUgl4KnkDsBMb425/QN4uUjjbY+LlD0UI28L4f0+zeUl14dH/NjbI+7usSpBeyVhXxZe/QRetNoePFtf4/bzOeX6F1bXkGzcHn/nEroYAZhxdXqG5QrqejBr7DUucoTOBF1Eal8+jwaHGYYMPuXGYyeZLQErQK3H31cNgGkoGoAbFOAv4ltI2w/zrcgq2WPx2AAAAABJRU5ErkJggg==',
        vimeo : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAn1BMVEWGye+Hye+Iyu+Jyu+Ly++NzO+NzPCPzfCQzfCRzfCTzvCTz/CUz/CW0PGX0PGc0vGc0/Kl1/Op2POr2fOs2vSu2/Sy3PSz3fW03fW43/W54PW64PW+4vbH5vfV7PnW7Pnb7/rc7/rd7/rf8Pri8vvk8/vl8/vo9Pzq9fzr9vzs9vzu9/zx+P3z+f3z+v30+v33+/75/P76/P7+/v7///+Tt8ndAAAAc0lEQVR4AY3BVRbCMABFwReCU6QIFHf35u5/bfRQpJ+ZkR/TtJJyYbeot2DHWqoe4WSUaF3BBVoANCQV7nugbaMlUFOiZC8wkUZwUGoKM2kLfaVCuJkINvqwMcxjHnV9rQBcRz9DwI31lz/zHCir0ivL1wvTcw2/sm8juwAAAABJRU5ErkJggg=='
    }

    this.soundCloudApiKey = '048a40b1f3413b2e8097221375a5aa1b';

    this.getLink = {
        mojvideo:function(url, cb){
            mojvideoID = url.match(/www\.mojvideo\.com\/[^\/]*\/([a-z0-9]+)/);
            if (mojvideoID != null && typeof mojvideoID[1] != "undefined")
                cb(mojvideoID[1], 'mojvideo');
            else
                cb(null, 'mojvideo');
        },
        soundcloud:function(url, cb){
            getId = function(url){
                var regexp = /^https?:\/\/(soundcloud.com|snd.sc)\/(.*)$/;
                return url.match(regexp) && url.match(regexp)[0]
            }
            if((soundcloudLink = getId(url)) != null ){
                $.get(location.protocol+'//api.soundcloud.com/resolve.json?url='+soundcloudLink+'/tracks&client_id='+this.soundCloudApiKey ,
                function (result) {
                    this.cb(result.id, 'soundcloud');
                }.bind({cb:cb}));
            }
            else{
                cb(null, 'soundcloud');
            }
        },
        dailymotion:function(url, cb) {
            var m = url.match(/^.+dailymotion.com\/(video|hub)\/([^_]+)[^#]*(#video=([^_&]+))?/);
            if (m !== null) {
                if(m[4] !== undefined) {
                    cb(m[4], 'dailymotion');
                }
                cb(m[2], 'dailymotion');
            }
            cb(null, 'dailymotion');
        },
        youtube:function(url, cb){
            youtubeID = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i);
            if (youtubeID != null && typeof youtubeID[1] != "undefined")
                cb(youtubeID[1], 'youtube');
            else
                cb(null, 'youtube');
        },
        vimeo:function(url, cb){
            vimeoID = url.match(/vimeo\.com\/([a-z0-9]+)/i);
            if (vimeoID != null && typeof vimeoID[1] != "undefined")
                cb(vimeoID[1], 'vimeo');
            else
                cb(null, 'vimeo');            
        }
    }

    this.hexc = function(colorval) {
        var parts = colorval.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        delete(parts[0]);
        for (var i = 1; i <= 3; ++i) {
            parts[i] = parseInt(parts[i]).toString(16);
            if (parts[i].length == 1) parts[i] = '0' + parts[i];
        }
        color = '#' + parts.join('');

        return color;
    }

    this.init = function(){
        var self = this;
        this.$urls.each(function() {
            
            link = this.title || this.innerText;


            cb = function(id, type){
                if(id == null) return;
                
                $(this).after(' <span data-plugin-embed-open="close" data-plugin-embed="'+type+'" data-plugin-id="' +id+ '"><img style="margin-top:0;" src="' + self.logos[type] + '" alt="open or close '+type+' video"/></span>');
                // debugger;
            }.bind(this)

            self.getLink['youtube'](link, cb);

            self.getLink['soundcloud'](link, cb);

            self.getLink['dailymotion'](link, cb);

            self.getLink['mojvideo'](link, cb);

            self.getLink['vimeo'](link, cb);

        });
        
        $('body').on('click', '[data-plugin-embed-open]', function() {
            if ($(this).data('plugin-embed-open') == "close") {                
                embedIframe = $(self.tpl[$(this).data('plugin-embed')].replace(/{{protocol}}/g, location.protocol).replace(/{{base_url}}/, location.protocol + '//' + location.hostname).replace(/{{id}}/, $(this).data('plugin-id')));
                this.embedIframe = embedIframe;
                $(this).after(embedIframe);
                $(this).data('plugin-embed-open', "open");
            }
            else {
                $(this.embedIframe).remove();
                $(this).data('plugin-embed-open', "close");
            }

            //recheck quote
            $(this).parents('div.quote').each(function() {
                quote_height_max = parseInt($(".quote_message").css("max-height"), 10);
                var current_height = $(this).find('.quote_message').height();
                if (current_height == quote_height_max) {
                    $(this).find('a.open:first').stop().fadeTo('fast', 1);
                    $(this).find('a.open:first').text("Afficher l'intégralité de la citation")
                } else if (current_height > quote_height_max) {
                    $(this).find('a.open:first').stop().fadeTo('fast', 1);
                    $(this).find('a.open:first').text("Masquer la citation")
                }
                else{
                    $(this).find('a.open:first').stop().hide(100);
                    $(this).find('a.open:first').text("")   
                }
            });
        });
    }

    this.init();
}