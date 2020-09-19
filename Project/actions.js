var map = [];
var selected = {};
var last_selected = 0;

var total = 0;
var modal_dom;

var navbar;
var page_mode = 0;
var page_subtype = 0;

$(document).ready(function() { 
	var modal = document.createElement('div');
	modal.innerHTML=`
	<div class="modal fade" id="exampleModalLong" tabindex="-1" role="dialog" aria-labelledby="modalTitle" aria-hidden="false">
	<div class="modal-dialog" role="document">
	<div class="modal-content">
	  <div class="modal-header">
		<h5 class="modal-title" id="modalTitle">Links List</h5>
			

			<button type="button" id="download_selected_btn" style="display:none" class="btn btn-primary right">Download Selected</button>
			<button type="button" id="generate_list_btn" class="btn btn-primary right">Generate List</button>
		
			<button type="button" id="download_descrizioni" class="btn btn-secondary right mr-2">Download Descrizioni</button>

		<br><br><br>
		<div class="">
			<b>Tipologia: </b>
			<select id="video_type">
				<option value="flash">Default</option>
				<option value="video">Video</option>
				<option value="iphone">Iphone</option>
				<option value="audio">Audio</option>
			</select>
		</div>
	  </div>
	  <div class="modal-body"> 
	  <form>
		<table id="table_link" class="table table-hover" onselectstart="return false">
		<thead class="thead-dark">
		<tr>
		<td class=""><a href="#" id='select_all'>Select All</a></td>
		<td class=""><a href="#" id='deselect_all'>Deselect All</a></td>
		<td></td>
		</tr>
		<tr><th class="center">Selected</th><th>Lesson</th><th class="center">Download</th></tr></thead>
		<tbody id="table_link_tbody">
		
		</tbody>
		<tfoot>
		
		</tfoot>
		</table> 
		</form>
		<br><br>
		<button id="copyall" class="btn btns btn-primary" data-clipboard-target="#foo">Copy to clipboard</button>
		
		<textarea  class="right" id="foo"> </textarea>
	  </div>
	  <div class="modal-footer">

		<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
	  </div>
	</div>
	</div>
	</div>
	`;
	
	
	
	var body = document.getElementsByTagName("body")[0];
	body.insertBefore(modal, body.firstChild);
	
	
	navbar = document.getElementById("navbar_left_menu");
	
	if(typeof navbar === 'undefined' || navbar == null){
		page_mode = 1;
		navbar = document.getElementById("lessonList");
		$('head').append('<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">');

		//navbar.className = "lessonListclass";
		//navbar.style = "background: none; width: auto;";
	}
	
	if(window.location.href.includes("sviluppo.virtual_classroom.vis")){

		//console.log("videotype",$("#video_type"));
		$("#video_type")[0].innerHTML='<option value="flash">Default</option>';
		page_subtype=1;
		
	}

	var macro = document.createElement('div');
	
	new ClipboardJS('.btns');

	macro.innerHTML = `
	<button id='getalllinks_btn' class="btn btn-primary" data-toggle="modal" data-target="#exampleModalLong">Generate Links</button>
	`;
	
	navbar.insertBefore(macro, navbar.firstChild);
	
	populateDownloadButton();
	
	$("#copyall").click(function(){ 
		reloadInputClipboard();
		copyToClipboard("foo");
	});
	
	
	$("#select_all").click(function(){ 
		selectAll();
		reloadTable();
	});

	$("#generate_list_btn").click(function(){ 
		$('#generate_list_btn').hide();
		$('#download_selected_btn').show();

		puy_startReconizer();
	});
	
	
	$("#deselect_all").click(function(){ 
		deselectAll();
		reloadTable();
	});
	
	$("#download_selected_btn").click(function(){ 
		downloadAllSelected();
	});

	$("#download_descrizioni").click(function(){ 
		downloadString(generateFileDescrizioni(), "txt", "Descrizioni");
	});
	
	$("#getalllinks_btn").click(function(e){
		
		/*chrome.runtime.sendMessage({
			msg: "PLS_DOWNLOAD", 
			data: {
				subject: "URL",
				content: "https://video.polito.it/dl/95946FB72DFB468500E464113AE2028E/5B9AEB79/2018/2018_THATIX1_0221289/Elettronica_applicata_INF_lez_01/Elettronica_applicata_INF_lez_01.mp4"
			}
		});*/
	
		/*var url = 'https://video.polito.it/dl/95946FB72DFB468500E464113AE2028E/5B9AEB79/2018/2018_THATIX1_0221289/Elettronica_applicata_INF_lez_01/Elettronica_applicata_INF_lez_01.mp4';
		e.preventDefault();
		window.location.href=url;*/

		//$("#getalllinks_btn").prop('disabled', true);
		//enableLinkList();
		//$("#link_list").click();
		
		//console.log("clicked");
		//puy_startReconizer();
    }
	);
	
	
	
});

function enableLinkList()
{
	$("#link_list").prop('disabled', false);
}

function populateDownloadButton()
{
	//var navbar = document.getElementById("navbar_left_menu");
	var els = getLessonListDOM();
	
	
	
	if(els){
	for(var i = 0; i<els.length; i++)
	{
		var btn = document.createElement("button");
		btn.className="btn btn-primary fa fa-download dwlbtn";
		btn.id="directdwn_"+i;
		//els[i].firstChild.nextSibling.insertAfter(btn);
		
		els[i].insertBefore(btn, els[i].firstChild.nextSibling.nextSibling);
		
		var a = els[i].getElementsByTagName("a")[0];
		
		//RIMUOVO <BR> NELLE PAGE_MODE 1 (vecchia pagina lezioni poli)
		if(page_mode == 1)
		{
			a.parentNode.removeChild(a.nextSibling);
		}
	
		var dombtn = document.getElementById("directdwn_"+i);
		dombtn.ass = a;
		dombtn.addEventListener("click", function(evt) {
				var url = evt.target.ass.getAttribute("href");
				var inn = evt.target.id.substr(10);
				//Per rendere il reload table effettivo
				
				
				if(total <= inn) total = (inn+1);
				
				startDownload(inn, url, 1);
				enableLinkList();
				
		}, false);
		
	}
	}
}

function downloadAllSelected()
{
	for(var i=0; i<total; i++)
	{
		if(typeof selected[i] === 'undefined'){}
		else{
			if(selected[i] == 1)
				download(i);
		}
	}
}

function download(index)
{
	var urll = map[index].url;
	
	var mode = map[index].mode;

	var filename =  "Lezione "+(parseInt(index)+1);

	if(mode=="audio"){
		filename+=".mp3";
	}
	else{
		filename+=".mp4";
	}
	



	/*if(ffname=="DEFAULT"){

	}
	 else if(ffname=="LESSON INDEX"){
		filename = "Lezione "+(parseInt(index)+1);

		filename+=".mp4";
	} */

	chrome.runtime.sendMessage({
	msg: "PLS_DOWNLOAD", 
	data: {
		subject: "URL",
		content: urll,
		filename: filename,
	}
	});
}

function selectAll()
{
	for(var i=0; i<total; i++)
	{
		if(typeof selected[i] === 'undefined'){}
		else{
			selected[i] = 1;
		}
	}
}

function deselectAll()
{
	for(var i=0; i<total; i++)
	{
		if(typeof selected[i] === 'undefined'){}
		else{
			selected[i] = 0;
		}
	}
}

function reloadInputClipboard()
{
	var itxt = document.getElementById("foo");
	itxt.value = "";
	for(var i=0; i<total; i++)
	{
		if(typeof selected[i] === 'undefined')
		{
			
		}
		else
		{
			if(selected[i] == 1)
			{
				itxt.value += map[i].url+"\r\n";
			}
		}
	}
}

function copyToClipboard(copyButtonId){
	var clipboard = new ClipboardJS("#"+copyButtonId);
	clipboard.on('success', function(e) {
		console.info('Action:', e.action);
		console.info('Text:', e.text);
		console.info('Trigger:', e.trigger);
	});
}

/*function copyAllToClipboard()
{
	var inp = document.getElementById("inp_hid");
	if(inp)
	{
		copyToClipboard(inp.value);
	}
}

function copyToClipboard(str)
{
  var el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};*/

function reloadTable()
{
	var table_tbody = document.getElementById("table_link_tbody");
	//var inp_hid = document.createElement('input');
	//inp_hid.id = "foo";
	//inp_hid.type = "text";
	//inp_hid.style="width:1px;";
	//inp_hid.value="";
	
	table_tbody.innerHTML = "";
	for(var i =0; i<total; i++)
	{
		if(map[i])
		{
			var row = createRow(i,map[i].url);
			row.className = "align-middle";
			if(selected[i] == 1)
			{
				row.className+=" row-selected";
			}
			table_tbody.appendChild(row);
			var e = i;
			
			row.addEventListener("click", function(evt) {
			
			var index = evt.target.parentNode.id.substr(4);
				if(evt.shiftKey)
				{
					var ls = parseInt(last_selected);
					if(index > ls){						
						for(var s = ls+1; s<=index; s++)
						{
							toggleSelected(s);
						}
					}
					else{
						for(var s = ls-1; s>=index; s--)
						{
							toggleSelected(s);
						}
					}
					
					document.getSelection().removeAllRanges();
				}
				else{
					toggleSelected(index);
				}
				//alert(index);
				
				reloadTable();
				return 1;
			}, false);
			
			document.getElementById("check_"+i).addEventListener("change", function(evt) {
				return false;
			}, false);
			
			document.getElementById("download_"+i).addEventListener("click", function(evt) {
				var index = evt.target.id.substr(9);
				download(index);
			
			}, false);
	
			//inp_hid.value += map[i]+"\r\n";
		}
	}
	
	
	//table_tbody.appendChild(inp_hid);
}

function toggleSelected(index)
{
	last_selected = index;
	if(!selected[index])
	{
		selected[index] = 1;
		//console.log("metto a 1: "+index);
	}
	else
	{
		selected[index] = 0;
		//console.log("metto a 0");
	}
}

function createRow(index,url)
{
	var row = document.createElement('tr');
	row.id="row_"+index;
	var sel = "";
	if (typeof selected[index] === 'undefined'){
		selected[index] = 0;
		//console.log("setto init");
	}
	else
	{
		if(selected[index] == 1)
		{
			sel = "checked='checked'";
			//console.log("selected");
		}
		else{
			
		}
	}
	
	row.innerHTML=`
		<td class="center"><input type="checkbox" id="check_`+index+`" `+sel+`></input></td>
		<td><a target="_blank" href='`+url+`'>Lezione `+(index+1)+`</a></td>
		<td class="center"><a id='download_`+index+`' href="#">Download</a></td>
		
	`;
	
	  
	//<td class="center"><a href="#" onclick="$.fileDownload('`+url+`')" >Download</a></td>
	
	//<td><a href="`+url+`" download="file.mp4">Download</a></td>
	//<td><a href="`+url+`" rel="nofollow" download="file.mp4">Download</a></td>
	
	/*var td_url = document.createElement('td');
	td_url.innerHTML=url;
	var td_actions = document.createElement('td');
	
	row.appendChild(td_url);
	row.appendChild(td_actions);*/
	return row;
}

function getChilds(parent, tagName) {
    var childs = parent.childNodes,
        arr = [],
        currChild;
    for (var i = 0, len = childs.length; i < len; i++) {
        currChild = childs[i];
        if (currChild.nodeType == 1 && currChild.tagName.toLowerCase() == tagName && currChild.id == "") {
            arr.push(currChild);
        }
    }
    return arr;
}
function getLessonListDOM()
{
	var els;
	if(page_mode == 0)
	{
		els = navbar.getElementsByClassName("h5");
	}
	else
	{
		//els = $("#"+navbar.getElementsByTagName("ul")[0].id).children();
		//els = .children;
		var arr = navbar.getElementsByClassName("lezioni");
		if(arr.length == 2)
		{
			page_subtype = 1;
		}
		
		//console.log(arr);
		els = getChilds(arr[arr.length-1],"li");
		//console.log(els);
	}
	
	//console.log("domlez",els);
	return els;
}

function generateFileDescrizioni(){

	var descrizioni = getDescrizioni();

	var text = "";
	var index = 1;
	for(var el of descrizioni)
	{
		text += "Lezione "+index+": \r\n";
		//console.log("el",el);
		
		for(var descel of el){
			text += "- " + descel+"\r\n";
		}
		

		index++;
	}

	return text;

}

function getDescrizioni(){

	var descrizioni = [];

	var els;
	if(page_mode == 0)
	{
		els = navbar.getElementsByClassName("argomentiEspansi");
		//console.log(els);
		for(var el of els){
			var finel = [];
			var lista = el.getElementsByTagName("a");

			for(var eacha of lista){
				finel.push(eacha.textContent);
			}

			descrizioni.push(finel);
		}
	}
	else
	{
		els = navbar.getElementsByClassName("lezioni")[0].getElementsByTagName("li");

		var index = -1;
		var finel = [];

		for(var el of els) {
			//console.log(el);
			if(typeof el.id === 'undefined' || el.id == ""){
				if(index != -1) {
					descrizioni[index] = finel;
				}

				index++;
				finel = [];
			}
			else{
				var aelement = el.getElementsByTagName("a")[0];
				var desc = aelement.textContent;
				finel.push(desc);
			}
		}

		descrizioni[index] = finel;
	}
	
	//console.log("descrizioni", descrizioni);
	return descrizioni;
}

function puy_startReconizer()
{
	//var navbar = document.getElementById("navbar_left_menu");

	var mode = $( "#video_type option:selected").val();
	//console.log("mode selected: ",mode );
	var els = getLessonListDOM();
	total = els.length;
	if(els){
	for(var i = 0; i<els.length; i++)
	{
		
	   //if( i > 20) break;
	   
	   var a = els[i].getElementsByTagName("a");
	   if(a)
	   {
			var lin = a[0].getAttribute("href");
			//console.log(lin);
			var mol = i*200;
			//console.log(mol);
			setTimeout(startDownload, mol, i, lin, 0, mode);
	   }
	}
	}
}
function startDownload(index, lin, direct=0,mode="flash")
{
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() 
	{ 
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
			callback(index, xmlHttp.responseText, direct,mode);
	}
	var preurl = "https://didattica.polito.it/portal/pls/portal/";
	
	if(page_mode == 0){	}
	else if(page_mode == 1)
	{
		if(page_subtype == 0) 
			preurl = "https://elearning.polito.it/gadgets/video/";
		else if(page_subtype == 1) 
			preurl = "https://elearning.polito.it/main/videolezioni/";
	}
	
	xmlHttp.open("GET", preurl+lin, true); // true for asynchronous 
	xmlHttp.send(null);
}

function callback(index, response, direct=0, mode="flash")
{
	var fin="";
	if(mode == "flash"){
		fin = getUrlOfFlash(response);
	}
	else {
		fin = getUrlOfGeneric(response,mode);
	}

	
	map[index] = {};
	map[index].url = fin;
	map[index].filename = "DEFAULT";
	map[index].mode = mode;
	
	/*if(page_mode == 0 && page_subtype == 1){
		map[index].filename = "LESSON INDEX";
		map[index].mode = "flash";
	}*/

	reloadTable();
	//console.log(fin);
	if(direct == 1)
		download(index);
	

	return;
}

function getUrlOfGeneric(response,search)
{
	var parser = new DOMParser();
	var doc = parser.parseFromString(response, "text/html");
	
	var a = doc.querySelectorAll('a[id^="video"]');
	//console.log("selectors",a);

	for (var val of a) {
		
		//console.log(val);
		//console.log(val.textContent.toLowerCase());

		if((val.textContent).toLowerCase().indexOf(search) !== -1){
			//console.log("trovata",val);
			return val.href;
		}
	}

}

function getUrlOfFlash(response)
{
	var parser = new DOMParser();
	var doc = parser.parseFromString(response, "text/html");
	
	var a = doc.getElementsByTagName("script");
	for(var i = 0; i<a.length; i++)
	{
		if(!a[i]) continue;
		var str = a[i].textContent;
		if(str.indexOf("flowplayer.commercial-latest.swf") != -1)
		{
			//console.log(str);
			var ind1 = str.indexOf(",{'url':'");
			if(ind1 != -1)
			{
				var ind2 = str.indexOf("}", ind1+9);
				if(ind2 != -1){
					var fin = str.substring((ind1+9),(ind2-1));
					//console.log("1: "+ind1+" 2: "+ind2+ " 3:"+(ind2-ind1));
					//console.log(fin);
					return fin;
				}
			}
		}
		
	}
}

function downloadString(text, fileType, fileName) {
	var blob = new Blob([text], { type: fileType });
  
	var a = document.createElement('a');
	a.download = fileName;
	a.href = URL.createObjectURL(blob);
	a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
	a.style.display = "none";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	setTimeout(function() { URL.revokeObjectURL(a.href); }, 1500);
  }
  