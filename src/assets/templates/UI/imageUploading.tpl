{{!-- Handlebarsjs template 
vars : 
 - id
 - imageSrc
--}}
<div data-plugin-role="img_uploading" id="plugin_upload_image_{{id}}">
    <div class="float_loader">
        <img src="{{imageSrc}}" alt="{{_ "image waiting upload"}}">
    </div>
    <div class="hover_text">
        0%
    </div>
</div>