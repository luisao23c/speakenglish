var fs = require('fs');
var f = 'views/ingles.ejs';
var c = fs.readFileSync(f, 'utf8');

// 1. Add CSS for volume bars
var volCSS = `
/* Volume bars */
.vol-bars{display:none;align-items:flex-end;justify-content:center;gap:2px;height:32px;padding:0 4px}
.vol-bars.on{display:flex}
.vol-bars i{width:4px;border-radius:2px;background:var(--err);transition:height 0.08s ease;min-height:3px}
.vol-ok{display:none;align-items:center;gap:4px;padding:4px 10px;border-radius:12px;background:rgba(0,168,132,.1);font-size:11px;color:var(--green2);font-weight:600}
.vol-ok.show{display:flex}
.vol-ok .dot-v{width:6px;height:6px;border-radius:50%;background:var(--green2);animation:pulse 1s infinite}
`;
c = c.replace('</style>', volCSS + '\n</style>');

// 2. Add volume bars HTML after mic label
c = c.replace(
  '<div class="ml" id="mL">Toca para hablar</div>',
  '<div class="ml" id="mL">Toca para hablar</div>\n        <div class="vol-bars" id="volB"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>\n        <div class="vol-ok" id="volOk"><span class="dot-v"></span> Voz detectada</div>'
);

// 3. Replace the mic section in JS with improved version
// Find the old mic code and replace
var oldMicStart = '// === Microphone ===';
var oldMicEnd = 'micBtn.onclick=function(){listening?stopMic():startMic()};';

var newMicCode = `// === Audio Context for volume detection ===
var audioCtx=null,analyser=null,micStream=null,volAnimId=null,volBars=G("volB"),volOk=G("volOk");
var volData=new Uint8Array(8);

function initAudioVol(){
  try{
    audioCtx=new(window.AudioContext||window.webkitAudioContext)();
    analyser=audioCtx.createAnalyser();
    analyser.fftSize=64;
    volData=new Uint8Array(analyser.frequencyBinCount);
  }catch(e){}
}

function startVolMeter(){
  if(!audioCtx||!analyser||!micStream)return;
  if(audioCtx.state==="suspended")audioCtx.resume();
  var src=audioCtx.createMediaStreamSource(micStream);
  src.connect(analyser);
  volBars.classList.add("on");
  var bars=volBars.querySelectorAll("i");
  function draw(){
    analyser.getByteFrequencyData(volData);
    var avg=0;
    for(var i=0;i<bars.length;i++){
      var v=volData[i]||0;
      var h=Math.max(3,Math.round(v/255*28));
      bars[i].style.height=h+"px";
      avg+=v;
    }
    avg=avg/bars.length;
    // Show "voice detected" when volume is consistent
    if(avg>20){
      volOk.classList.add("show");
      volOk._lastDetect=Date.now();
    }else if(volOk._lastDetect&&Date.now()-volOk._lastDetect>1500){
      volOk.classList.remove("show");
    }
    volAnimId=requestAnimationFrame(draw);
  }
  draw();
}

function stopVolMeter(){
  volBars.classList.remove("on");
  volOk.classList.remove("show");
  if(volAnimId){cancelAnimationFrame(volAnimId);volAnimId=null}
  if(micStream){micStream.getTracks().forEach(function(t){t.stop()});micStream=null}
}

// === Microphone ===
function showPerm(){permB.classList.add("show");setTimeout(function(){permB.classList.remove("show")},5000)}
function startMic(){
  if(freezing)return;
  if(!SR){setSub("Tu navegador no soporta microfono. Usa Chrome o Edge.");return}
  speechSynthesis.cancel();setSpk(false);
  if(rec){try{rec.abort()}catch(e){}rec=null}

  // Get mic stream for volume visualization
  if(!audioCtx)initAudioVol();
  navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){
    micStream=stream;
    startVolMeter();
  }).catch(function(e){
    // Volume meter is optional, mic still works without it
  });

  rec=new SR();rec.lang="en-US";rec.continuous=true;rec.interimResults=true;rec.maxAlternatives=1;
  // Give more time for speech - 8 seconds silence timeout
  if(typeof rec.grammars!=="undefined")rec.grammars;

  rec.onstart=function(){
    listening=true;hText="";
    micBtn.classList.add("rec");mL.classList.add("rec");
    mL.textContent="Escuchando... habla cuando quieras";wvEl.classList.add("on");
    sT.textContent="";setLstn(true);
  };
  rec.onresult=function(e){
    var fin="",inter="";
    for(var i=0;i<e.results.length;i++){
      var t=e.results[i][0].transcript;
      var conf=e.results[i][0].confidence;
      if(e.results[i].isFinal){
        fin+=(fin?" ":"")+t;
      }else{
        inter=t;
      }
    }
    if(fin){
      hText=fin;
      sT.textContent=fin;
      mL.textContent="Te escuche: " + fin.substring(0,40) + (fin.length>40?"...":"");
      mL.classList.add("ok");
    }else if(inter){
      sT.textContent=inter;
      mL.textContent="Escuchando: " + inter.substring(0,40);
    }
  };
  rec.onerror=function(e){
    listening=false;micBtn.classList.remove("rec");mL.classList.remove("rec","ok");
    wvEl.classList.remove("on");setLstn(false);stopVolMeter();
    if(e.error==="not-allowed"){showPerm();mL.textContent="Permiso denegado. Activalo en tu navegador."}
    else if(e.error==="no-speech"){mL.textContent="No detecte voz. Habla mas fuerte o mas cerca del mic."}
    else if(e.error==="network"){mL.textContent="Error de red. Verifica tu conexion."}
    else{mL.textContent="Error: "+(e.error||"?")+". Intenta de nuevo."}
    setTimeout(function(){mL.textContent="Toca para hablar"},4000);
  };
  rec.onend=function(){
    listening=false;micBtn.classList.remove("rec");mL.classList.remove("rec","ok");
    wvEl.classList.remove("on");setLstn(false);stopVolMeter();
    var heard=hText.trim();
    if(heard&&heard.length>2){
      pVoice=true;mL.textContent="Enviando...";mL.classList.add("ok");
      setTimeout(function(){mL.classList.remove("ok")},2000);
      sendMessage();
    }else{
      mL.textContent="No te escuche bien. Intenta de nuevo o escribe abajo.";
      setTimeout(function(){mL.textContent="Toca para hablar"},3000);
    }
  };
  try{rec.start()}catch(e){setSub("No pude iniciar el microfono.");mL.textContent="Error al iniciar mic"}
}
function stopMic(){if(rec){try{rec.stop()}catch(e){}}stopVolMeter()}
micBtn.onclick=function(){listening?stopMic():startMic()};`;

// Replace old mic code
var oldMicBlock = oldMicStart + c.substring(c.indexOf(oldMicStart), c.indexOf(oldMicEnd) + oldMicEnd.length);
c = c.replace(oldMicBlock, newMicCode);

fs.writeFileSync(f, c);
console.log('Mic improvements added. File size: ' + c.length + ' bytes');
