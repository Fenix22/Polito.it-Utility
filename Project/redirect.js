$(document).ready(function() { 

	//cidReq= 2018_02GRSOV_0219089
	var cidReq=get("cidReq");
	if(typeof cidReq === "undefined")
	{
		console.log("null");
		return;
	}
	var injhtml = document.createElement('div');
	injhtml.innerHTML=` 
	<form id="formVideoDokeos" action="https://didattica.polito.it/portal/pls/portal/sviluppo.materiale.goto_dokeos_video" method="post">
	<input id="idUser" type="hidden" value="" name="utente">
	<input id="idInc" type="hidden" value="" name="inc">
	<input id="idData" type="hidden" value="" name="data">
	<input id="idToken" type="hidden" value="" name="token">
	</form>`
	;

	var code = cidReq.substr(cidReq.lastIndexOf("_")+1);
	var body = document.getElementsByTagName("body")[0];
	body.insertBefore(injhtml, body.firstChild);
	
	console.log(code);
	redirect(code);
	
});

function get(name){
   if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
      return decodeURIComponent(name[1]);
}

function redirect(INC) {
$(document).ready(function() {
  $.getJSON("https://didattica.polito.it/portal/pls/portal/sviluppo.materiale.json_dokeos_par?inc=" + INC, function(data) 
  {
	$("#idUser").val( data.utente );
	$("#idInc").val( data.inc );
	$("#idData").val( data.data );
	$("#idToken").val( data.token );
	$("#formVideoDokeos").submit();
  });
});
}