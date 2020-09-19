//console.log = function() {};


chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        if( details.url == "https://didattica.polito.it/pls/portal30/sviluppo.filemgr.main_js" ){
			return  {redirectUrl: chrome.extension.getURL("./tR38Tkk1z3.js") };
		}
		else if(details.url == "https://didattica.polito.it/pls/portal30/sviluppo.filemgr.filenavigator_js")
		{
			return {redirectUrl: chrome.extension.getURL("./sviluppo.filemgr.filenavigator.js") };
		}
		else if(details.url == "https://didattica.polito.it/pls/portal30/sviluppo.filemgr.config_js")
		{
			console.log("yeah",details);
			return {redirectUrl: chrome.extension.getURL("./sviluppo.filemgr.config.js") };
		}
		else if(details.url == "https://didattica.polito.it/pls/portal30/sviluppo.filemgr.main_table_html")
		{
			console.log("req",details);

			return {redirectUrl: chrome.extension.getURL("./sviluppo.filemgr.main_table.html") };
		}    
		
    },
    {urls: ["*://*.polito.it/*.*"]},
    ["blocking"]
);

function manageGenericMessage(request, sender, sendResponse){
	console.log("generic message",request);

	if (request.msg === "download_single_file") {
		var url = request.data;
		var name = request.name;
		chrome.downloads.download({
		  url: url,
		  filename: name
		});
	}
	else if (request.msg === "getBinaryContent") {
		var url = request.url;
		
		var blob = null;
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url);
		xhr.responseType = "blob";//force the HTTP response, response-type header to be blob
		xhr.onload = function()
		{
			blob = xhr.response;
			console.log(blob);
			
			var reader = new FileReader();
			reader.readAsDataURL(blob);
			reader.onload =  function(e){
					console.log('DataURL:', e.target.result);
			};
			
			var bloburl =  (window.URL ? URL : webkitURL).createObjectURL(blob);
			console.log(bloburl);
			
			var response = {err: false, data:bloburl};
			console.log(response);
			sendResponse(response);
		}
		xhr.send();
		
		/*JSZipUtils.getBinaryContent(url, function (err, data) {
			console.log("rispondo: ");
			console.log(data);
			
			var binaryData = [];
			binaryData.push(data);

			var blob = new Blob(binaryData);
			console.log(blob);
			var bloburl =  (window.URL ? URL : webkitURL).createObjectURL(blob);
			
			
			
			
			var response = {err: err, data:datares};
			console.log(response);
			sendResponse(response);
		});*/
		return true;
	}
	else if (request.msg === "PLS_DOWNLOAD") {
		
		chrome.downloads.download({
		  url: request.data.content,
		  filename: request.data.filename,
		});
	}
	else if (request.msg === "zipAndDownloadAll") {
		var tree = request.tree;
		
		var el = findFirstFile(tree);
		console.log(el);
		
		if(el == null)
		{
			updateDownloadStatus(0);
			return;
		}
			
		
		manageSession(
			{code: el.code},
			
			function(statusok){
				if(statusok == "ok")
				{
					zipAndDownloadAll(tree);
				}
				else
				{
					updateDownloadStatus(0);
					return;
				}
			}
		);

	}
	
}


function manageGenericConnection(port){
	console.log("ongenConnection",port);
	if(port.name == "lalaland")
	{
	  theport = port;
	  port.onDisconnect.addListener(	
		  function(event) {
			  theport=null;
	  });
	}
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
		return manageGenericMessage(request, sender, sendResponse);
    }
);

chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
		return manageGenericMessage(request, sender, sendResponse);
    }
);

chrome.runtime.onConnectExternal.addListener(function(port) {
	return manageGenericConnection(port);
});

chrome.runtime.onConnect.addListener(function(port) {
	return manageGenericConnection(port);
});


function manageSession(testEl, callback)
{
	var size = testEl.size;
	var url = "https://didattica.polito.it/pls/portal30/sviluppo.filemgr.handler?action=download&code="+testEl.code;
	
	var client = new XMLHttpRequest();
	client.overrideMimeType('application/xml');
	client.open("GET", url, true);
	

	client.send();
	
	var mode = 0; //1 try to session

	client.onreadystatechange = function() {
		if(this.readyState == this.HEADERS_RECEIVED ) {
		
			var resurl = client.responseURL;
			/*
			https://file.didattica.polito.it/download/MATDID/32837182
			https://idp.polito.it/idp/profile/SAML2/Redirect/SSO
			https://idp.polito.it/idp/x509mixed-login
			*/
			if(resurl.includes("://file.didattica.polito.it")) //Sessione didattica Ok, Sessione File Ok
			{
				client.abort();
				callback("ok");
				return;
			}
			else if(resurl.includes("://idp.polito.it/idp/profile")) //Sessione didattica Ok (?), Sessione File no
			{
				//continuo a leggere tutto
				mode = 1;
			}
			else 
			{
				client.abort();
				
				chrome.tabs.create({ url: url });
				console.log("AAA!3");
				callback("ko");
				return;
			}
			
			
			console.log("res url:",client.responseURL);
		}
		
		if (mode == 1 && client.readyState === client.DONE && client.status === 200) {
			
			//console.log(client.response);
			console.log(client.responseXML);
			
			var xxml = client.responseXML;
			if(client.responseXML != null)
			{
				var lform = xxml.getElementsByTagName("form")[0]; //action page method post/get
				if(lform)
				{
					var hiddens = lform.getElementsByTagName("input");
					var req = "";
					console.log(hiddens);
					
					var i = 0;
					
					var datapost = new FormData();
					
					
					for (let entry of hiddens) {
						
						if(entry.type == "hidden")
						{
							if(i != 0)
								req+="&";
							
							req += entry.name+"="+encodeURIComponent(entry.value);
							
							datapost.append(entry.name, entry.value);
							i++;
						}
						
					}
					
					console.log("request:");
					console.log(req);
					
					var http = new XMLHttpRequest();
					var sessurl = lform.action;
					
					var params = req;
					http.open('POST', sessurl, true);

					//Send the proper header information along with the request
					http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
					
					http.onreadystatechange = function() {
						if(http.readyState == http.HEADERS_RECEIVED) 
						{
							if(http.status === 200)
							{
								console.log("OLEEE");
								callback("ok");
							}
							else
							{
								console.log("AAA!1");
								callback("ko");
								chrome.tabs.create({ url: url });
							}
							
							http.abort();
							return;
						}
					}
					http.send(req);
				}
			}
			else{
				console.log("AAA!2");
				chrome.tabs.create({ url: url });
				callback("ko");
			}
		}
		
	  }
}

function findFirstFile(list)
{	
	for (var i = 0, len = list.length; i < len; i++) {
		var el = list[i];
		
		if(el.type != "dir")
		{
			return el;
		}
		else
		{
			var ret = findFirstFile(el.list);
			
			if(ret !== null)
				return ret;
		}
	}
	
	return null;
}

var theport = null;
var thetotal = 0;
var theended = 0;

function updateDownloadStatus(ds)
{
	var msg = {type: "downloadstatus", val: ds};
	theport.postMessage(msg);
}

function updateProgressBar(current_progress, string, type = 0)
{
	var msg = {type: "updateProgressBar", cs: current_progress, string: string, tt: type};
	theport.postMessage(msg);
}

		function zipAndDownloadAll(tree)
		{
			console.log(tree);
		
			var zip = new JSZip();
			thetotal = 0;
			theended = 0;
			
			thetotal = countFileList(tree).count;
			console.log("total: "+thetotal);
			
			var callb = function(){
				console.log("SIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII");
				//$scope.download_status = 3;
				updateDownloadStatus(3);
				
				zip.generateAsync({type:'blob',compression: "STORE"}, function updateCallback(metadata) {
					console.log("progression: " + metadata.percent.toFixed(2) + " %");
					//if(metadata.currentFile) {
					//	console.log("current file = " + metadata.currentFile);
					//}
					
					updateProgressBar(metadata.percent.toFixed(2),"Zipping files... "+metadata.percent.toFixed(2)+"%",3);
				})				
				.then(function(content) {
					console.log("zip creato");
					
					var url = URL.createObjectURL(content);
					
					//$scope.download_status = 4;
					updateDownloadStatus(4);
					updateProgressBar(100,"Done",1);
					
					var date = new Date();
					
					var name = "PUtility "+date.getMonth()+" "+date.getDate()+" "+date.getHours()+":"+date.getMinutes()+".zip";
					name = "ZippedContent.zip";
					console.log(name);
					chrome.downloads.download({
					  url: url,
					  filename: name
					});
					
				});
			}
			
			tree.forEach(function(el){
				recursive_download(zip,el,callb);
			});
			
			console.log(zip);
		}
		
	function countFileList(list)
	{
		
		var count = 0;
		var size = 0;
		list.forEach(function(el){
			if(el.type != "dir")
			{
				//console.log("count++ "+el.name);
				count++;
				size += el.size;
			}
			else
			{
				var re = countFileList(el.list);
				count += re.count;
				size += re.size;
			}
		});
		
		return {"count": count,"size": size};
	}

	

	function recursive_download(dirzip, elem, callback)
	{
		//console.log("entro");
		console.log(elem);
		if(elem.type != 'dir')
		{
			//console.log(elem.name);
			
			var url = "https://didattica.polito.it/pls/portal30/sviluppo.filemgr.handler?action=download&code="+elem.code;
			//var url = "https://file.didattica.polito.it/download/MATDID/"+elem.code;
			
			console.log(url);
			
			JSZipUtils.getBinaryContent(url, function (err, data) {
				
				var name = elem.name;
				
				if (typeof elem.nomefile !== 'undefined')
					name = elem.nomefile;
				
				dirzip.file(name, data, {binary:true});
				theended++;
				
				console.log("Download finished ("+theended+"/"+thetotal+"): "+elem.name);
				var perc = (theended/thetotal)*100;
				
				
				
				if(thetotal == theended)
				{
					callback();
					//updateProgressBar(101,"Wait for Zipping...");
				}
				else
				{
					updateProgressBar(perc,"Downloading: "+(parseInt(theended)+1)+" of "+thetotal,0);
				}
				
			});
			
			//dirzip.file(elem.name,"");
			return;
		}
		
		//console.log("dir: "+elem.name);
		var thiszipdir = dirzip.folder(elem.name);
		
		elem.list.forEach(function(el){
			recursive_download(thiszipdir,el,callback);
		});
	}