/* 图片与等级集中配置。可将 src 改为相对路径；界面上传的图片优先。 */
window.LEVELS = [
  [2,'小兔','#f8e5e5','#e5afb6','rabbit'],[4,'小猫','#fbe4cc','#e9b079','cat'],
  [8,'小熊','#e6e3f2','#b0a2ce','bear'],[16,'小狐','#ffe1cf','#eaa079','fox'],
  [32,'青蛙','#dcebd5','#96bd87','frog'],[64,'小猪','#f7dfe7','#dc98b0','pig'],
  [128,'熊猫','#e1ece8','#87a89e','panda'],[256,'小狗','#f4e8cc','#c9af77','dog'],
  [512,'考拉','#e1e8f3','#9eafc9','koala'],[1024,'小狮','#f7e4af','#dbb45e','lion'],
  [2048,'星星兔','#eee0f5','#bb97cf','rabbit']
].map(([value,name,bg,color,type])=>{
  let ears=type==='rabbit'?`<ellipse cx="68" cy="48" rx="15" ry="36"/><ellipse cx="112" cy="48" rx="15" ry="36"/>`:['cat','fox'].includes(type)?`<path d="M43 86L43 30 82 65M98 65L137 30 137 86"/>`:`<circle cx="48" cy="65" r="23"/><circle cx="132" cy="65" r="23"/>`;
  let detail=type==='pig'?'<ellipse cx="90" cy="115" rx="23" ry="15" fill="#dc98b0"/><circle cx="83" cy="115" r="3"/><circle cx="97" cy="115" r="3"/>':type==='panda'?'<ellipse cx="67" cy="96" rx="15" ry="19" fill="#526b65"/><ellipse cx="113" cy="96" rx="15" ry="19" fill="#526b65"/>':'';
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180"><rect width="180" height="180" rx="24" fill="${bg}"/><circle cx="145" cy="28" r="5" fill="white" opacity=".7"/><path d="M23 135l3 7 7 3-7 3-3 7-3-7-7-3 7-3" fill="white" opacity=".8"/><g fill="${color}">${ears}<ellipse cx="90" cy="103" rx="57" ry="49"/></g><ellipse cx="90" cy="109" rx="47" ry="38" fill="#fff9ee"/>${detail}<g fill="#524940"><circle cx="69" cy="99" r="4"/><circle cx="111" cy="99" r="4"/><path d="M85 112Q90 108 95 112L90 117Z"/></g><path d="M90 117q-8 10-14 1m14-1q8 10 14 1" fill="none" stroke="#524940" stroke-width="2.5" stroke-linecap="round"/><g fill="#eeabb3" opacity=".6"><ellipse cx="57" cy="115" rx="9" ry="5"/><ellipse cx="123" cy="115" rx="9" ry="5"/></g>${value===2048?'<path d="M69 49l-5-20 19 9 8-20 9 20 18-9-5 20" fill="#e8bd58"/>':''}</svg>`;
  return {value,name,src:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)};
});
// 按用户上传顺序映射 11 张照片。保留插画作为文件缺失时的后备图。
window.LEVELS.forEach(level => {
  level.fallback = level.src;
  level.name = `照片 ${Math.log2(level.value)}`;
  level.src = `assets/level-${level.value}.jpg`;
});
