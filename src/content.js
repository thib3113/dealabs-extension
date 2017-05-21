if(["rss", "xml", "css", "js", "pdf"].indexOf(location.pathname.split('.').pop()) > 0)
    throw new Error("Extension don't support this file format");

try{
    // function plugin_getParameterByName(name, url){
    //     if (!url) url = window.location.href;
    //     name = name.replace(/[\[\]]/g, "\\$&");
    //     var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i"),
    //         results = regex.exec(url);
    //     if (!results) return null;
    //     if (!results[2]) return '';
    //     return decodeURIComponent(results[2].replace(/\+/g, " "));
    // }

    function inject(func) {
        var script = document.createElement('script');
        script.appendChild(document.createTextNode(func));
        (document.body || document.head || document.documentElement).appendChild(script);
    }
 
    $(function() {
        $('body').on('paste drop', 'textarea', function(e){
            reUpload = e.ctrlKey;

            if(e.type == "paste"){
                var items = (e.clipboardData || e.originalEvent.clipboardData).items;
            }
            else if(e.type == "drop"){
                e.stopPropagation();
                e.preventDefault();
                
                var items = (e.dataTransfer || e.originalEvent.dataTransfer).items;
            }
            else{
                alert("error");
            }
            for (index in items) {
                var item = items[index];
                if (item.type != undefined && item.type.indexOf("image") !== -1) {
                    blob = item.getAsFile(); 
                    addImageInForm(this, blob, $(this).prop('selectionStart'), true);
                }
                if (item.kind === "string"){
                    item.getAsString(function(str) {
                        try{
                            is_image = $(str).is('img');
                        }
                        catch(e){
                            is_image = false;
                        }

                        if(is_image){
                            src = $(str).attr('src');
                            if(src != undefined){
                                if(isDataURL(src)){
                                    fetch(src)
                                    .then(res => res.blob())
                                    .then(blob => addImageInForm(this, blob, $(this).prop('selectionStart'), true))
                                }
                                else{
                                    addImageInForm(this, src, $(this).prop('selectionStart'), reUpload);
                                }
                            }
                        }
                    }.bind(this));
                }
            }
        });
    })
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