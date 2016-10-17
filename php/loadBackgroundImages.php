<?php Header("content-type: application/x-javascript");
/*
PHP script: loadBackgroundImages.php
Copyright 2016 Drew Reese

*/


const BACKGROUND_DIR = "./img/backgrounds";

function returnImages($directory = BACKGROUND_DIR) {
    $pattern="(\.jpg$)|(\.png$)|(\.jpeg$)|(\.gif$)"; //valid image extensions
    $files = array();
    $curimage=0;
    if($handle = opendir($directory)) {
        while(false !== ($file = readdir($handle))){
            if(eregi($pattern, $file)){ //if this file is a valid image
                //Output it as a JavaScript array element
                echo 'background['.$curimage.']="'.$file .'";';
                $curimage++;
            }
        }
 
        closedir($handle);
    }
    return($files);
}

echo 'var background = new Array();';
returnImages();
?>