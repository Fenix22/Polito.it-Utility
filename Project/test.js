
//setTimeout(function(){ console.log("Dispatcho"); document.dispatchEvent(event); }, 3000);
//console.log("arivovovoov");
var editorExtensionId=getExtensionID();


console.log("Collego", editorExtensionId);
var port = chrome.runtime.connect(editorExtensionId, {name:"lalaland"});
port.onMessage.addListener(function(msg) 
{
    //console.log("a message rec", msg);
    //var obj = JSON.parse(JSON.stringify(msg));
    //console.log("obj",obj);
    //var event = new CustomEvent('ProxyChannelSync', {detail: msg}); 

    //document.dispatchEvent(event);
    window.postMessage({messageType:"ProxyChannelSync", msg:msg});
    //console.log("arr");
    
});


console.log("Collego2");
window.addEventListener('message', function (e) { 

    this.console.log("messarr",e);

    if(e.data.messageType == "zipAndDownloadAll")
    {
        var tree = e.data.tree;

        chrome.runtime.sendMessage(
            editorExtensionId,
            {
                msg: "zipAndDownloadAll",
                tree: tree
            }
        ); 
    }
    else if(e.data.messageType == "InfoExchangeReq"){
        //this.console.log("arr1");
        window.postMessage({messageType:"InfoExchange", extID:getExtensionID(), extURL:getUrlExtension()});
        //this.console.log("arr2");
    }

   

}, false);

window.postMessage({messageType:"InfoExchange", extID:getExtensionID(), extURL:getUrlExtension()});

/* document.addEventListener('ProxyChannelZipAllAndDownload', function (e) { 
    console.log("arrivo ProxyChannelZipAllAndDownload",e);

    console.log("detail", e.detail);

    var tree = e.detail;

    chrome.runtime.sendMessage(
        editorExtensionId,
        {
            msg: "zipAndDownloadAll",
            tree: tree
        }
    );

}, false); */

function getExtensionID(){
    return chrome.runtime.id;
};

function getUrlExtension(){
    //console.log("arrrrr");

    if(isChrome()) 
        return getExtensionID();
    
    return browser.extension.getURL("").split("/")[2];
}

function isDebug(){
    return true;
}

function isChrome(){
    return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
} 
