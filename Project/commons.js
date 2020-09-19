//DA MODIFICARE SIA IN tR38Tkk1z3.js SIA in test.js

function getExtensionID(){
    if(isChrome()) {
        if(isDebug()){
            return "amflgaccempcbjcgehechogijmmmohoj"; //DEBUG CHROME
        }
        else
            return "hglojnclbngnbmijmgdllkkimnoiohig"; //CHROME
    }
    else
        return "politoutility@totosoft.it"; //FIREFOX
};

function getUrlExtension(){
    if(isChrome()) return getExtensionID();
    else 
        return "9f107032-2261-43a9-99b8-62a815f22162";
}

function isDebug(){
    return true;
}

function isChrome(){
    return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
} 
