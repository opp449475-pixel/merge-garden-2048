/* UI controller; rules live in engine.js, default image mapping in images.js. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id), E=GameEngine, KEY='soft-merge-v1', IMAGE_KEY='soft-merge-images-v1';
 let state={board:Array(16).fill(0),score:0,won:false}, best=0, previous=null, custom={}, busy=false, queue=[], showNumbers=true, confirmAction=null, toastTimer;
 const clone=s=>JSON.parse(JSON.stringify(s));
 function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4500);}
 function valid(s){return s&&Array.isArray(s.board)&&s.board.length===16&&s.board.every(v=>v===0||(Number.isSafeInteger(v)&&v>=2&&Math.log2(v)%1===0))&&Number.isFinite(s.score)&&s.score>=0&&typeof s.won==='boolean';}
 function save(){try{localStorage.setItem(KEY,JSON.stringify({state,best,previous,showNumbers}));$('save-status').textContent='进度自动保存在本机';}catch(e){$('save-status').textContent='保存失败，请勿关闭页面';toast('浏览器存储不可用或已满，进度仅保留到本次关闭。');}}
 function saveImages(){try{localStorage.setItem(IMAGE_KEY,JSON.stringify(custom));$('image-status').textContent='已保存到当前浏览器，刷新后仍可使用。';}catch(e){$('image-status').textContent='图片保存失败：浏览器存储不可用或已满。当前仍可使用，但刷新后可能丢失。';toast('图片未能持久保存，请释放浏览器空间后重试。');}}
 function src(v){return custom[v]||LEVELS.find(l=>l.value===v)?.src||LEVELS[10].src;}
 function newGame(){state={board:Array(16).fill(0),score:0,won:false};E.spawn(state.board);E.spawn(state.board);previous=null;queue=[];save();render();$('board').focus();}
 function render(merged=[],spawn=-1){
   $('tiles').replaceChildren();state.board.forEach((v,i)=>{if(!v)return;const tile=document.createElement('div');tile.className='tile'+(merged.includes(i)?' merge':'')+(i===spawn?' spawn':'');tile.dataset.index=i;tile.style.setProperty('--x',i%4);tile.style.setProperty('--y',Math.floor(i/4));tile.setAttribute('aria-label',`第${Math.floor(i/4)+1}行第${i%4+1}列：${v}`);const inner=document.createElement('div');inner.className='tile-inner';const img=document.createElement('img');img.src=src(v);img.alt='';img.draggable=false;const number=document.createElement('span');number.className='number';number.textContent=v;inner.append(img,number);tile.append(inner);$('tiles').append(tile);});
   $('board').classList.toggle('hide-numbers',!showNumbers);$('numbers').checked=showNumbers;$('score').textContent=state.score;$('best').textContent=best;$('undo').disabled=!previous||busy;$('end-undo').disabled=!previous||busy;
   const max=Math.max(...state.board);$('progress').textContent=max>=2048?`已达成 2048 · 当前最高 ${max}`:`目标 2048 · 当前最高 ${max}`;
   const won=max>=2048&&!state.won, ended=E.over(state.board);$('overlay').hidden=!(won||ended);$('continue').hidden=!won;$('again').hidden=won;$('end-undo').hidden=won;
   if(won||ended){queue=[];$('overlay-title').textContent=won?'合成 2048，太棒啦！':'这次相遇，到这里啦';$('overlay-message').textContent=won?'你的图鉴点亮了！继续向更高分出发吧。':`本局获得 ${state.score} 分，再来收集一次可爱吧。`;$('overlay-icon').textContent=won?'✧':'✿';}
 }
 async function move(dir){
   if($('settings-dialog').open||$('confirm-dialog').open||!$('overlay').hidden)return;
   if(busy){if(queue.length<2)queue.push(dir);return;}
   const result=E.move(state.board,dir);if(!result.changed)return;
   busy=true;previous=clone(state);state={board:result.board,score:state.score+result.gain,won:state.won};best=Math.max(best,state.score);const spawned=E.spawn(state.board);save();$('undo').disabled=true;
   result.tracks.forEach(t=>{const tile=$('tiles').querySelector(`[data-index="${t.from}"]`);tile.style.setProperty('--x',t.to%4);tile.style.setProperty('--y',Math.floor(t.to/4));});
   await new Promise(r=>setTimeout(r,145));render(result.merged,spawned);
   await new Promise(r=>setTimeout(r,180));busy=false;render();$('live').textContent=`当前分数 ${state.score}，最高方块 ${Math.max(...state.board)}`;if(queue.length)move(queue.shift());
 }
 function undo(){if(busy||!previous)return;state=clone(previous);previous=null;queue=[];save();render();toast('已撤销上一步');}
 function ask(title,text,action){queue=[];$('confirm-title').textContent=title;$('confirm-text').textContent=text;confirmAction=action;$('confirm-dialog').showModal();}
 function requestNew(){if(busy)return;ask('开始新游戏？','当前棋盘将被重置，最高分和自定义图片会保留。',newGame);}
 function refreshImages(){['sample1','sample2','sample3'].forEach((id,i)=>{$(id).src=src(i===2?4:2);$(id).alt=i===2?'等级 4':'等级 2';});$('gallery').replaceChildren();LEVELS.forEach(l=>{const item=document.createElement('div');item.className='collect-item';const img=document.createElement('img');img.src=src(l.value);img.alt=`等级 ${l.value}`;const label=document.createElement('span');label.textContent=l.value;item.append(img,label);$('gallery').append(item);});render();}
 function settings(){queue=[];$('image-grid').replaceChildren();LEVELS.forEach(l=>{const label=document.createElement('label');label.className='image-setting';const img=document.createElement('img');img.src=src(l.value);img.alt=`等级 ${l.value} 预览`;const text=document.createElement('span');text.textContent=l.value;const hint=document.createElement('small');hint.textContent='点击替换';const input=document.createElement('input');input.type='file';input.accept='image/*';input.setAttribute('aria-label',`替换 ${l.value} 图片`);input.addEventListener('change',async()=>{const file=input.files[0];if(!file)return;input.disabled=true;try{const data=await crop(file);custom[l.value]=data;img.src=data;saveImages();refreshImages();}catch(e){$('image-status').textContent=e.message;}finally{input.disabled=false;input.value='';}});label.append(img,text,hint,input);$('image-grid').append(label);});$('settings-dialog').showModal();}
 function crop(file){return new Promise((resolve,reject)=>{if(!file.type.startsWith('image/'))return reject(new Error('请选择有效的图片文件。'));if(file.size>20*1024*1024)return reject(new Error('图片超过 20 MB，请选择较小的图片。'));const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{try{const c=document.createElement('canvas');c.width=c.height=320;const size=Math.min(img.naturalWidth,img.naturalHeight);c.getContext('2d').drawImage(img,(img.naturalWidth-size)/2,(img.naturalHeight-size)/2,size,size,0,0,320,320);resolve(c.toDataURL('image/webp',.85));}catch(e){reject(new Error('图片处理失败，请尝试 JPG 或 PNG。'));}finally{URL.revokeObjectURL(url);}};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('无法读取图片，请尝试 JPG、PNG 或 WebP。'));};img.src=url;});}
 document.addEventListener('error',e=>{if(e.target.tagName==='IMG'&&!e.target.dataset.fallback){e.target.dataset.fallback='true';e.target.src=LEVELS[0].fallback;}},true);
 document.querySelector('.cells').innerHTML='<div class="cell"></div>'.repeat(16);
 try{const raw=localStorage.getItem(KEY);if(raw){const saved=JSON.parse(raw);if(valid(saved.state)){state=saved.state;previous=valid(saved.previous)?saved.previous:null;best=Number.isFinite(saved.best)?Math.max(saved.best,state.score):state.score;showNumbers=saved.showNumbers!==false;}else toast('旧进度无法读取，已准备新棋盘。');}const images=JSON.parse(localStorage.getItem(IMAGE_KEY)||'{}');for(const l of LEVELS)if(typeof images?.[l.value]==='string'&&images[l.value].startsWith('data:image/'))custom[l.value]=images[l.value];}catch(e){toast('无法读取本地存储，将使用默认设置。');}
 if(!state.board.some(Boolean))newGame();refreshImages();
 $('new').onclick=requestNew;$('again').onclick=requestNew;$('undo').onclick=undo;$('end-undo').onclick=undo;
 $('continue').onclick=()=>{state.won=true;save();render();$('board').focus();};$('numbers').onchange=e=>{showNumbers=e.target.checked;save();render();};
 $('settings').onclick=settings;$('customize').onclick=settings;['done','close-settings'].forEach(id=>$(id).onclick=()=>$('settings-dialog').close());
 $('reset-images').onclick=()=>ask('恢复默认图片？','所有本地替换图片将被移除，恢复随游戏附带的图片。',()=>{custom={};saveImages();refreshImages();$('settings-dialog').close();settings();});
 $('cancel').onclick=()=>$('confirm-dialog').close();$('confirm').onclick=()=>{$('confirm-dialog').close();confirmAction?.();};
 document.addEventListener('keydown',e=>{const dirs={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};if(!dirs[e.key]||$('settings-dialog').open||$('confirm-dialog').open||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;e.preventDefault();move(dirs[e.key]);});
 let pointer=null;const board=$('board');board.addEventListener('pointerdown',e=>{if(e.target.closest('button')||!e.isPrimary)return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY};board.setPointerCapture(e.pointerId);});board.addEventListener('pointerup',e=>{if(!pointer||pointer.id!==e.pointerId)return;const dir=E.swipe(e.clientX-pointer.x,e.clientY-pointer.y);pointer=null;if(dir)move(dir);});board.addEventListener('pointercancel',()=>pointer=null);
})();
