var KEY="gestor-notas-v1",S={groups:[],cur:null,max:5,pass:3,per:1,lose:3,np:3,pw:[20,35,45,25]};
try{var r=localStorage.getItem(KEY);if(r)S=Object.assign(S,JSON.parse(r))}catch(e){}
S.groups.forEach(function(g){g.acts.forEach(function(a){if(!a.p)a.p=1})});
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function uid(){return Math.random().toString(36).slice(2,9)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function G(){return S.groups.find(function(g){return g.id===S.cur})}
function pavg(g,s,p){var sw=0,t=0;g.acts.forEach(function(a){if(a.p!==p)return;var v=g.grades[s.id+"|"+a.id];if(v!==undefined&&v!==""&&!isNaN(v)){sw+=a.w;t+=v*a.w}});return sw?t/sw:null}
function pw(p){var v=S.pw[p-1];return v===undefined?100/S.np:v}
function PL(){var a=[];for(var i=1;i<=S.np;i++)a.push(i);return a}
function fmt(v){return v===null||v===undefined?"–":v.toFixed(2)}
function cls(v){return v===null?"":(v>=S.pass?"ok":"bad")}
function year(g,s){
 var ps=PL().map(function(p){return pavg(g,s,p)}),d=ps.filter(function(x){return x!==null}),n=d.length;
 if(!n)return{ps:ps,m:null,st:"Sin notas",c:"",lost:false,open:true};
 var W=0,dw=0,sum=0;ps.forEach(function(x,i){var w=pw(i+1);W+=w;if(x!==null){dw+=w;sum+=x*w}});var m=sum/dw;
 if(n===S.np)return m>=S.pass?{ps:ps,m:m,st:"Aprueba",c:"ok",lost:false,open:false}:{ps:ps,m:m,st:"Reprueba",c:"bad",lost:true,open:false};
 var need=(S.pass*W-sum)/(W-dw);
 if(need<=0)return{ps:ps,m:m,st:"Aprobada (asegurada)",c:"ok",lost:false,open:true};
 if(need>S.max)return{ps:ps,m:m,st:"Perdida: ya no alcanza",c:"bad",lost:true,open:true};
 return{ps:ps,m:m,st:"En curso: necesita "+need.toFixed(2)+" promedio en los "+(S.np-n)+" periodo(s) restantes",c:need>S.max*0.8?"bad":"",lost:false,open:true};
}
function render(){
 var g=G(),h='<select id="gs">'+S.groups.map(function(x){return'<option value="'+x.id+'"'+(x.id===S.cur?" selected":"")+'>'+esc(x.name)+'</option>'}).join("")+'</select>';
 h+='<input id="gn" placeholder="Nuevo grupo o materia (ej. 8°A Matemáticas)"><button onclick="addG()">Crear grupo</button>';
 if(g)h+='<button class="g" onclick="delG()">Eliminar grupo</button>';
 h+='<span class="mut">Escala máx.</span><input type="number" id="mx" value="'+S.max+'" style="width:60px"><span class="mut">Aprueba desde</span><input type="number" step="0.1" id="ps" value="'+S.pass+'" style="width:60px"><span class="mut">Reprueba año con</span><input type="number" id="ls" value="'+S.lose+'" style="width:56px"><span class="mut">materias perdidas</span><span class="mut">Periodos</span><select id="np"><option value="3"'+(S.np===3?" selected":"")+'>3</option><option value="4"'+(S.np===4?" selected":"")+'>4</option></select>'+PL().map(function(p){return'<span class="mut">P'+p+' %</span><input type="number" class="pw" data-p="'+p+'" value="'+pw(p)+'" style="width:56px">'}).join("");
 document.getElementById("top").innerHTML=h;
 document.getElementById("gs").onchange=function(e){S.cur=e.target.value;save();render()};
 document.getElementById("mx").onchange=function(e){S.max=+e.target.value||5;save();render()};
 document.getElementById("ps").onchange=function(e){S.pass=+e.target.value||3;save();render()};
 document.getElementById("ls").onchange=function(e){S.lose=Math.max(1,+e.target.value||3);save();render()};
 document.getElementById("np").onchange=function(e){S.np=+e.target.value;if(S.per>S.np)S.per=1;save();render()};
 document.querySelectorAll("input.pw").forEach(function(i){i.onchange=function(){S.pw[+i.dataset.p-1]=Math.max(0,+i.value||0);save();render()}});
 var tb="";PL().forEach(function(p){tb+='<button class="'+(S.per===p?"on":"")+'" onclick="setP('+p+')">Periodo '+p+'</button>'});
 tb+='<button class="'+(S.per===0?"on":"")+'" onclick="setP(0)">🎓 Año escolar</button>';
 document.getElementById("tabs").innerHTML=tb;
 var st=document.getElementById("stats"),ad=document.getElementById("add"),tl=document.getElementById("tbl"),al=document.getElementById("all");
 if(!g){st.innerHTML='<span class="mut">Crea un grupo para empezar.</span>';ad.innerHTML="";tl.innerHTML="";al.innerHTML="";return}
 ad.innerHTML='<input id="sn" placeholder="Nombre del estudiante"><button onclick="addS()">Agregar estudiante</button>'+(S.per?'<input id="an" placeholder="Actividad del periodo '+S.per+'"><input id="aw" type="number" placeholder="%" style="width:70px"><button onclick="addA()">Agregar actividad</button>':"");
 if(S.per)renderP(g,st,tl);else renderY(g,st,tl);
 renderAll(al);
}
function setP(p){S.per=p;save();render()}
function renderP(g,st,tl){
 var p=S.per,acts=g.acts.filter(function(a){return a.p===p}),tw=acts.reduce(function(a,b){return a+b.w},0);
 var t='<table><thead><tr><th>Estudiante</th>'+acts.map(function(a){return'<th>'+esc(a.name)+'<br><small>'+a.w+'%</small> <button class="x" title="Quitar" onclick="delA(\''+a.id+'\')">✕</button></th>'}).join("")+'<th>Promedio P'+p+'</th><th>Observaciones</th></tr></thead><tbody>';
 g.students.forEach(function(s){
  t+='<tr><td>'+esc(s.name)+' <button class="x" title="Quitar" onclick="delS(\''+s.id+'\')">✕</button></td>';
  acts.forEach(function(a){var v=g.grades[s.id+"|"+a.id];t+='<td><input class="n" type="number" step="0.1" min="0" max="'+S.max+'" value="'+(v===undefined?"":v)+'" data-s="'+s.id+'" data-a="'+a.id+'"></td>'});
  var m=pavg(g,s,p);t+='<td><span class="fin '+cls(m)+'" id="f'+s.id+'">'+fmt(m)+'</span></td><td><input class="o" value="'+esc(s.obs||"")+'" data-o="'+s.id+'" placeholder="Notas del docente"></td></tr>'});
 t+='</tbody></table>';
 if(!g.students.length||!acts.length)t+='<p class="mut">Agrega estudiantes y actividades para registrar notas del periodo '+p+'.</p>';
 if(acts.length&&tw!==100)t+='<p class="warn">Los porcentajes del periodo suman '+tw+'% (idealmente 100%).</p>';
 tl.innerHTML=t;
 tl.querySelectorAll("input[data-a]").forEach(function(i){i.oninput=function(){
  var v=i.value===""?undefined:Math.min(S.max,Math.max(0,parseFloat(i.value))),k=i.dataset.s+"|"+i.dataset.a;
  if(v===undefined||isNaN(v))delete g.grades[k];else g.grades[k]=v;
  var s=g.students.find(function(x){return x.id===i.dataset.s}),m=pavg(g,s,p),el=document.getElementById("f"+s.id);
  el.textContent=fmt(m);el.className="fin "+cls(m);save();statsP(g);renderAll(document.getElementById("all"))}});
 tl.querySelectorAll("input[data-o]").forEach(function(i){i.oninput=function(){g.students.find(function(x){return x.id===i.dataset.o}).obs=i.value;save()}});
 statsP(g);
}
function box(b,l,c){return'<div class="stat"><b'+(c?' style="color:var(--'+c+')"':"")+'>'+b+'</b><span>'+l+'</span></div>'}
function statsP(g){
 var ms=g.students.map(function(s){return pavg(g,s,S.per)}).filter(function(m){return m!==null}),ap=ms.filter(function(m){return m>=S.pass}).length;
 document.getElementById("stats").innerHTML=box(g.students.length,"Estudiantes")+box(fmt(ms.length?ms.reduce(function(a,b){return a+b},0)/ms.length:null),"Promedio del periodo")+box(ap,"Aprobando","ok")+box(ms.length-ap,"En riesgo","bad")+box(ms.length?Math.max.apply(null,ms).toFixed(2):"–","Nota más alta");
}
function renderY(g,st,tl){
 var ys=g.students.map(function(s){return{s:s,y:year(g,s)}}),ap=ys.filter(function(o){return o.y.c==="ok"}).length,lo=ys.filter(function(o){return o.y.lost}).length;
 st.innerHTML=box(g.students.length,"Estudiantes")+box(ap,"Aprueban esta materia","ok")+box(lo,"Pierden esta materia","bad")+box(ys.length-ap-lo,"En curso");
 var t='<h2>Definitiva anual de '+esc(g.name)+'</h2><table><thead><tr><th>Estudiante</th>'+PL().map(function(p){return"<th>P"+p+"</th>"}).join("")+'<th>Definitiva</th><th style="text-align:left">Estado</th></tr></thead><tbody>';
 ys.forEach(function(o){t+='<tr><td>'+esc(o.s.name)+'</td>'+o.y.ps.map(function(x){return'<td><span class="fin '+cls(x)+'">'+fmt(x)+'</span></td>'}).join("")+'<td><span class="fin '+o.y.c+'">'+fmt(o.y.m)+'</span></td><td style="text-align:left;white-space:normal"><span class="'+(o.y.c==="bad"?"warn":"")+'">'+o.y.st+'</span></td></tr>'});
 t+='</tbody></table><p class="mut">Definitiva = promedio ponderado de los periodos ('+PL().map(function(p){return"P"+p+" "+pw(p)+"%"}).join(", ")+'). Un periodo cuenta cuando tiene al menos una nota. La materia se aprueba con '+S.pass.toFixed(1)+' o más.</p>'+(PL().reduce(function(a,p){return a+pw(p)},0)!==100?'<p class="warn">Los pesos de los periodos no suman 100%.</p>':'');
 tl.innerHTML=t;
}
function renderAll(al){
 var map={};
 S.groups.forEach(function(g){g.students.forEach(function(s){var k=s.name.trim().toLowerCase();(map[k]=map[k]||{n:s.name,l:[]}).l.push({g:g.name,y:year(g,s)})})});
 var ks=Object.keys(map);
 if(!ks.length){al.innerHTML="";return}
 var t='<h2>Resumen del año escolar por estudiante (todas las materias)</h2><table><thead><tr><th>Estudiante</th><th>Materias</th><th>Perdidas</th><th style="text-align:left">Resultado del año</th></tr></thead><tbody>';
 ks.forEach(function(k){var o=map[k],lost=o.l.filter(function(x){return x.y.lost}),open=o.l.some(function(x){return x.y.open}),res,c;
  if(lost.length>=S.lose){res="Reprueba el año ("+lost.length+" materias perdidas)";c="bad"}
  else if(open){res=lost.length?"En curso, con "+lost.length+" materia(s) perdida(s)":"En curso: aprobando todo por ahora";c=lost.length?"bad":""}
  else{res=lost.length?"Aprueba el año, con "+lost.length+" por recuperar":"Aprueba el año";c="ok"}
  t+='<tr><td>'+esc(o.n)+'</td><td>'+o.l.length+'</td><td>'+lost.length+(lost.length?' <span class="mut">('+lost.map(function(x){return esc(x.g)}).join(", ")+')</span>':"")+'</td><td style="text-align:left;white-space:normal"><span class="fin '+c+'">'+res+'</span></td></tr>'});
 t+='</tbody></table><p class="mut">Se cruzan las materias por el nombre del estudiante: escríbelo igual en cada grupo. El año se reprueba al perder '+S.lose+' o más materias.</p>';
 al.innerHTML=t;
}
function addG(){var n=document.getElementById("gn").value.trim();if(!n)return;var g={id:uid(),name:n,students:[],acts:[],grades:{}};S.groups.push(g);S.cur=g.id;save();render()}
function delG(){S.groups=S.groups.filter(function(x){return x.id!==S.cur});S.cur=S.groups.length?S.groups[0].id:null;save();render()}
function addS(){var n=document.getElementById("sn").value.trim();if(!n)return;G().students.push({id:uid(),name:n,obs:""});save();render()}
function delS(id){var g=G();g.students=g.students.filter(function(s){return s.id!==id});save();render()}
function addA(){var n=document.getElementById("an").value.trim(),w=parseFloat(document.getElementById("aw").value);if(!n||isNaN(w)||w<=0)return;G().acts.push({id:uid(),name:n,w:w,p:S.per});save();render()}
function delA(id){var g=G();g.acts=g.acts.filter(function(a){return a.id!==id});save();render()}
if(!S.cur&&S.groups.length)S.cur=S.groups[0].id;
render();
