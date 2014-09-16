/*
Form State v 1.2
copyright 2007 Thomas Frank

This program is free software under the terms of the 
GNU General Public License version 2 as published by the Free 
Software Foundation. It is distributed without any warranty.
*/
formState={
	eventsBeforeStore:true,
	onStateChange:false,
	init:function(){
		// add to onload
		if(!formState.onloadAdded){
			formState.onloadAdded=true;
			(function(){var ol=onload;onload=function(){if(ol){ol()};formState.init()}})();
			return
		};
		// modify/create event handlers on all form elements
		var f=document.forms
		for(var i=0;i<f.length;i++){
			if(!f[i].id || (f[i].id && f[i].id.indexOf("_undoable")<0)){continue};
			var byKey=f[i].id.indexOf('_keystroke')>=0;
			f[i].id=f[i].id.replace(/_undoable/,'').replace(/_keystroke/,'');
			var e=f[i].elements;
			for(var j=0;j<e.length;j++){
				(function(){
					var eh='onchange';
					eh=e[j].type=="radio"?'onclick':eh;
					eh=e[j].type=="checkbox"?'onclick':eh;
					eh=e[j].type=="text" && byKey?'onkeyup':eh;
					eh=e[j].type=="textarea" && byKey?'onkeyup':eh;
					var oc=e[j][eh]
					var fo=f[i];
					e[j][eh]=function(){
						if(oc && formState.eventsBeforeStore){oc()};
						formState.store(fo);
						if(oc && !formState.eventsBeforeStore){oc()};
					};
				})();	
			};
			this.store(f[i]);
		}
	},
	store:function(f){
		// store changes in a form
		var a=f.cloneNode(true);
		if (a.elements.length==0){ 
			// in Safari we need to append a (our cloned form) to something
			// and keep it appended before we can read the elements correctly
			// fishy... but let's do a workaround
			this.Safari=true;
			a.style.display="none";	a.id="formStateSafFix";f.parentNode.appendChild(a);
		};
		a.formStatePrev=f.formStatePrev;
		this.readBack(f,a);
		if(!f.formStateMem){f.formStateMem=[];f.formStateCo=0};
		f.formStateCo++;
		while(f.formStateMem.length>f.formStateCo){f.formStateMem.pop()};
		f.formStateMem[f.formStateCo]=a;
		this.checkQueue(f)
	},
	readBack:function(f,a){
		// read back values to form and check if different
		var fe=f.elements, ae=a.elements, d=false;
		for(var i=0;i<fe.length;i++){
			d=d || ae[i].checked!=fe[i].checked;
			ae[i].checked=fe[i].checked;
			// Safari textarea.values can not be read if style.display="none"
			// let's do another workaround and use "valueHolder" instead
			var ap=a.id=="formStateSafFix"?"valueHolder":"value";
			var fp=f.id=="formStateSafFix"?"valueHolder":"value";
			d=d || ae[i][ap]!=fe[i][fp];
			ae[i][ap]=fe[i][fp];
		};
		return d
	},
	checkQueue:function(f){
		// check if we currently can undo/redo anything
		var undoable=f.formStateCo>1;
		var redoable=f.formStateMem.length-f.formStateCo>1;
		if(f.elements.Undo){f.elements.Undo.disabled=!undoable};
		if(f.elements.Redo){f.elements.Redo.disabled=!redoable};
		if(this.onStateChange){this.onStateChange(f,undoable,redoable)}
	},
	undo:function(a,r){
		if(!r){r=-1};
		var tN=a.tagName.toLowerCase()||"";
		if(a.parentNode && tN!="form"){a=a.parentNode;return this.undo(a,r)};
		if(!a.formStateMem){return false};
		var f=a.formStateMem[a.formStateCo+r];
		if(!f){return false};
		a.formStateCo+=r;
		if(!this.readBack(f,a)){return this.undo(a,r)};
		this.checkQueue(a);
		return true
	},
	redo:function(a){return this.undo(a,1)}
};
formState.init();