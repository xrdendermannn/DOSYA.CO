var show_fname_chars=72;
var upload_type='file';
var form_action;
var x;

function $$(elem){return document.getElementById(elem);}

function openStatusWindow(f1,UID,fnames)
{
 if($$('utmodes')) $$('utmodes').style.display='none';
 site_url = document.location+'';
 site_url = site_url.replace(/http:\/\//i,'');

 var url = f1.srv_tmp_url.value+'/status.html?'+UID+'='+encodeURIComponent(fnames)+'='+site_url;
 var d1 = $$('div_'+f1.name);
 xy = findPos( d1 );
 $$('progress_div').style.left = xy[0]+'px';
 $$('progress_div').style.top = xy[1]+'px';
 $$('progress_frame').style.width = (d1.offsetWidth-3) + 'px';
 $$('progress_frame').style.height = d1.offsetHeight + 'px';
 
 d1.style.visibility='hidden';

 self.transfer2.location = url;
}

function StartUpload(f1)
{
    form_action = getFormAction(f1);
    f1.target='xupload';
    var NF=0;
    var farr=new Array();
    for (var i=0;i<=f1.length;i++)
    {
      current = f1[i];
      if(f1.upload_type.value=='file' && current && current.type && current.type=='file')
      {
         if(!checkExt(current))return false;
         if(!checkSize(current))return false;
         name = current.value.match(/[^\\\/]+$/);
         if(current.files && current.files.length) {
             for(var d = 0; d < current.files.length; d++) {
                 farr.push(current.files.item(d).name);
                 NF++;
             }
         } else if(name && name!='null') {
             farr.push(name);
             NF++;
         }
      }
      else if(f1.upload_type.value=='url' && current && current.name.match(/^url_\d+$/i) && current.value!='')
      {
         name = current.value.match(/[^\\\/]+$/);
         name=name+'';
         if(name && name!='null' && name.indexOf('?')==-1)farr.push(name);
         if(!current.value.match(/tp:\/\//i) || current.value.length<11){alert('Invalid URL:'+current.value);return false;};
         NF++;
      }
    }
    if(f1.upload_type.value=='url')upload_type='url';
    if(f1.url_mass)
    {
        var arr = f1.url_mass.value.split(/\n/);
        for(i=0;i<arr.length;i++)
        {
            arr[i] = arr[i].replace(/\/$/,'');
            name = arr[i].match(/[^\\\/]+$/);
            name=name+'';
            if(name && name!='null'){farr.push(name);NF++;}
        }
    }
    if(NF<=0){alert('Select at least one file to upload!');return false;};
    if(f1.tos && !f1.tos.checked){alert('You should read and agree to the Terms of Service');return false;};
    //if($$('submit_btn')){$$('submit_btn').disabled=true;$$('submit_btn').value='Uploading...';}

    var UID='';
    for(var i=0;i<12;i++)UID+=''+Math.floor(Math.random() * 10);

    openStatusWindow( f1, UID, farr.join(', ') );
    //window.scrollTo(0,0);
    form_action = form_action.split('?')[0]+'?upload_id='+UID+'&js_on=1'+'&utype='+utype+'&upload_type='+upload_type; //cleaning old query to avoid ReUpload bugs
    setFormAction(f1,form_action);
    f1.action=form_action;
}

function StartUploadBox(f1)
{
    form_action = getFormAction(f1);
    f1.target='xupload';
    var UID='';
    for(var i=0;i<12;i++)UID+=''+Math.floor(Math.random() * 10);

    openStatusWindow( f1, UID, '' );
    form_action = form_action.split('?')[0]+'?upload_id='+UID+'&js_on=1'+'&utype='+utype+'&upload_type='+upload_type+'&box=1';
    setFormAction(f1,form_action);
    f1.action=form_action;
    f1.submit();
}

function checkExt(obj)
{
    value = obj.value;
    if(value=="")return true;
    var re1 = new RegExp("^.+\.("+ext_allowed+")$","i");
    var re2 = new RegExp("^.+\.("+ext_not_allowed+")$","i");
    if( (ext_allowed && !re1.test(value)) || (ext_not_allowed && re2.test(value)) )
    {
        str='';
        if(ext_allowed)str+="\nOnly these extensions are allowed: "+ext_allowed.replace(/\|/g,',');
	if(ext_not_allowed)str+="\nThese extensions are not allowed:"+ext_not_allowed.replace(/\|/g,',');
        alert("Extension not allowed for file: \"" + value + '"'+str);
        return false;
    }

    return true;
}

function checkSize(obj)
{
    if(obj.value=='')return true;
    if(!max_upload_filesize || max_upload_filesize==0)return true;
    if(obj.files)
    {
      size = obj.files[0].fileSize;
      if(isNaN(size)||size==null)size = obj.files[0].size;
      if(size>0 && size>max_upload_filesize*1024*1024)
      {
          alert("File size limit is "+max_upload_filesize+" Mbytes");
          return false;
      }
    }
    return true;
}

function getFileSize(obj)
{
    if(obj.value=='')return '';
    if(obj.files)
    {
      size = obj.files[0].fileSize;
      if(isNaN(size)||size==null)size = obj.files[0].size;
      return size;
    }
    return '';
}

// function addUploadSlot()
// {
//   cx++;
//   slots++;
//   if(slots==max_upload_files){$$('x_add_slot').style.visibility='hidden';}
//
//   var new_slot = document.createElement( 'input' );
//   new_slot.type = 'file';
//   new_slot.name = 'file_'+cx;
//   $$('slots').appendChild(new_slot);
//   $$('slots').appendChild( document.createElement('br') );
// }

function fixLength(str)
{
 var arr = str.split(/\\/);
 str = arr[arr.length-1];
 if(str.length<show_fname_chars)return str;
 return '...'+str.substring(str.length-show_fname_chars-1,str.length);
}

function MultiSelector( list_target, max_files )
{
    this.list_target = $$(list_target);
	this.count = 0;
	this.id = 0;
	if( max_files ){
		this.max = max_files;
	} else {
		this.max = -1;
	};
	//$$('x_max_files').innerHTML = max_files;
    //$$('x_max_size').innerHTML = max_size+" Mb";
    this.newElement = function( element ) {
        var new_element = document.createElement( 'input' );
        new_element.type = 'file';
        new_element.size = element.size;
        new_element.multiple = "multiple";
        return(new_element);
    };
	this.addElement = function( element )
    {
		if( element.type == 'file' )
        {
           element.name = 'file_' + this.id++;
           //element.attr("multi_selector",this);
           element.multi_selector=this;
           element.mutiple = "multiple";
           element.style.zIndex = 10000;
           
           element.onchange = function()
           {
               if(element.value.length<=1)return;
               if(!checkExt(element))return;
               if(!checkSize(element))return;
               element.fsize = getFileSize(element);
               //if(max_files<=1)return;
               if (navigator.appVersion.indexOf("Mac")>0 && navigator.appVersion.indexOf("MSIE")>0)return;
               // Creating a new file input to replace this
               var new_element = this.multi_selector.newElement(element);

               var new_container;
               if(this.id == 'my_file_element' || this.id == 'drag-n-drop')
	               new_container = $$('files_container') || this.parentNode;
               else
	               new_container = this.parentNode;
	       new_container.appendChild( new_element, new_container.children[0] );

               this.multi_selector.addElement( new_element );

               if(this.id == 'drag-n-drop') {
                   new_element = this.multi_selector.newElement(element);
	               new_container = this.parentNode;
	               new_container.appendChild( new_element, new_container.children[0] );
                   this.multi_selector.addElement( new_element );
               }

               // HTML5 multi-upload
               this.multi_selector.addListRow( this );

               // Hide this: we can't use display:none because Safari doesn't like it
               this.style.position = 'absolute';
               this.style.left = '-9999px';
               this.style.display='none';
           };

           this.current_element = element;
		} 
        else {alert( 'Error: not a file input element' );};
	};

	this.addListRow = function( file_input )
    {
        var files;
        if(file_input.files)
            files = file_input.files; // HTML5
        else
            files = [ { name: file_input.value, size: file_input.fsize } ]; // Legacy

		var new_row = document.createElement( 'div' );
        new_row.className = 'xrow';

        var adel = document.createElement( 'a' );
        adel.href='#';
        adel.title='Delete';
        var img = document.createElement( 'img' );
        img.src='images/del.gif';
        adel.appendChild( img );
        new_row.appendChild( adel );

		new_row.file_input = file_input;

		adel.onclick= function()
        {
            this.parentNode.file_input.parentNode.removeChild(this.parentNode.file_input)
			this.parentNode.parentNode.removeChild( this.parentNode );
			this.parentNode.file_input.multi_selector.count--;
			//this.parentNode.file_input.multi_selector.current_file_input.disabled = false;
            this.parentNode.file_input.multi_selector.current_element.style.display='block';
            if($$('files_container')) {
                // Enabling input element
                file_input.visibility='hidden';
                $$('files_container').style.visibility='visible';
            }
			return false;
		};
		

        for(var i = 0; i < files.length; i++) {
            element = files[i];
            currenttext=document.createTextNode(" "+fixLength(element.name));
            var span1 = document.createElement( 'font' );
            span1.className = 'xfname';
            span1.appendChild( currenttext );

            currenttext2=document.createTextNode(" ("+convertSize(element.size)+")");
            var span2 = document.createElement( 'font' );
            span2.className = 'xfsize';
            span2.appendChild( currenttext2 );

            new_row.appendChild( span1 );
            new_row.appendChild( span2 );
            var br = document.createElement( 'br' );
            br.setAttribute('clear', 'all');
            new_row.appendChild( br );


            if(descr_mode && descr_mode!='0')
            {
                var new_row_descr = document.createElement( 'div' );
                new_row_descr.innerHTML = "<span class='xdescr'>"+lang_description+"</span><input type='text' name='"+file_input.name+"_descr' class='fdescr' maxlength=48>";
                if(public_on){ new_row_descr.innerHTML+="&nbsp;<input type='checkbox' name='"+file_input.name+"_public' value='1' id='pub_"+file_input.name+"' checked><label for='pub_"+file_input.name+"' class='xdescr'>"+lang_published+"</span>"; }
                if(adult_on && file_input.value.match(/\.(jpg|jpeg|gif|png|bmp)$/)) { new_row_descr.innerHTML+="&nbsp;<input type='checkbox' name='"+file_input.name+"_adult' value='1' id='pub_"+file_input.name+"'><label for='pub_"+file_input.name+"' class='xdescr'>Adult</span>"; }
                new_row.appendChild( new_row_descr );
            }
            this.list_target.appendChild( new_row );
            $(new_row).trigger('create'); // make jQ mobile happy
            this.count++;
        }
        if( this.max != -1 && this.count >= this.max )
        {
                // Disabling input element
                file_input.visibility='hidden';
                if($$('files_container')) {
                        $$('files_container').style.visibility='hidden';
                }
        };
        $$('upload_init').style.display = 'none';
        $$('upload_controls').style.display = '';
	};
};

function getFormAction(f)
{
    if(!f)return;
    for(i=0;i<=f.attributes.length;i++)
    {
        if(f.attributes[i] && f.attributes[i].name.toLowerCase()=='action')return f.attributes[i].value;
    }
    return '';
}

function setFormAction(f,val)
{
    for(i=0;i<=f.attributes.length;i++)
    {
        if(f.attributes[i] && f.attributes[i].name.toLowerCase()=='action')f.attributes[i].value=val;
    }
}

function InitUploadSelector(id1,id2,max)
{
    if($$(id1))
    {
        var multi_selector = new MultiSelector( id1, max );
        multi_selector.addElement( $$( id2 ) );
    }
}

function findPos(obj)
{
    var curleft = curtop = 0;
    if (obj.offsetParent)
    {
        do {curleft += obj.offsetLeft;curtop += obj.offsetTop;} while (obj = obj.offsetParent);
    }
    return [curleft,curtop];
}

function changeUploadType(utype)
{
    $$('div_file').style.position='absolute';
    if($$('div_url'))$$('div_url').style.position='absolute';
    if($$('div_rs'))$$('div_rs').style.position='absolute';
    if($$('div_tt'))$$('div_tt').style.position='absolute';
    if($$('div_ff'))$$('div_ff').style.position='absolute';
    if($$('div_ftp'))$$('div_ftp').style.position='absolute';
    if($$('div_copy'))$$('div_copy').style.position='absolute';
    $$('div_'+utype).style.position='static';
    $('#utmodes > input.active').removeClass('active');
    $('#r_'+utype).addClass('active');
}

function jah(url,id)
{
    if(id && $$(id))
    {
        $$(id).innerHTML='working...';
    }
    var req;
    if(window.XMLHttpRequest)
    {
        req = new XMLHttpRequest();
    }
    else if (window.ActiveXObject)
    {
        try {req = new ActiveXObject("Msxml2.XMLHTTP");} catch(e)
        {
        	try {req = new ActiveXObject("Microsoft.XMLHTTP");} catch(e) {return 0;}
        }
    }
    else {return 0;}

	req.open("GET", url+'&rnd='+Math.random(), 1);
	req.onreadystatechange = function()
    {
		if(req.readyState == 4)
        {
			if (req.status == 200)
            {
                if(id && $$(id))
                {
                    $$(id).innerHTML=req.responseText;
                }
                else
                {
                    eval(req.responseText);
                };
			}
		}
	};
	req.send("");
    return false;
};

function submitCommentsForm(f1)
{
    if(f1.cmt_name && f1.cmt_name.value==''){alert('Name required');return false;}
    if(f1.cmt_text.value.length<4){alert("Too short comment");return false;}
    var url=f1.action+'?op=comment_add';
    for(i=0;i<f1.elements.length;i++)
    {
        url=url+'&'+f1.elements[i].name+'='+f1.elements[i].value;
    }
    url = encodeURI(url);
    //url = url.replace(/\n/g,'_n_');
    jah(url);
    return false;
}

function scaleImg(i)
{
  if(i.width>800)
  {
    w=i.width;
    h=i.height;
    wn = 800;
    hn = parseInt(i.height*800/i.width);
    i.width  = wn;
    i.height = hn;
    i.onclick = function(){ if(this.width==wn){this.width=w;this.height=h;}else{this.width=wn;this.height=hn;} }
    return;
  }
}

function OpenWin(link,w,h)
{
  if(!w)w=720;
  if(!h)h=700;
  var popupWin = window.open(link,null, 'width='+w+',height='+h+',status=no,scrollbars=yes,resizable=yes,left=450,top=250');
  popupWin.focus();
  return false;
}

function player_start()
{
    $$('player_ads').style.display = 'none';
	$$('player_img').style.display = 'none';
	$$('player_code').style.visibility = 'visible';
    if($$('np_vid')) $$('np_vid').Play();
    return false;
}

function copy(obj)
{
  obj.focus();
  obj.select();
}

function convertSize(size)
{
    if (size > 1024*1024*1024) {
            size = Math.round(size/(1024*1024*1024)*10)/10 + " Gb";
    } else if (size > 1024*1024) {
            size = Math.round(size/(1024*1024)*10)/10+'';
            if(!size.match(/\./))size+='.0';
            size+=' Mb';
    } else if(size > 1024) {
            size = Math.round(size/1024*10)/10 + " Kb";
    } else {
            size = size + " Bytes";
    }
    return size;
}
