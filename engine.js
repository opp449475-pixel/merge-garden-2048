(function(root){
  'use strict';
  function move(board,dir){
    const next=Array(16).fill(0), tracks=[], merged=[]; let gain=0;
    for(let line=0;line<4;line++){
      const ids=Array.from({length:4},(_,i)=>dir==='left'?line*4+i:dir==='right'?line*4+3-i:dir==='up'?i*4+line:(3-i)*4+line);
      const items=ids.filter(i=>board[i]).map(i=>({value:board[i],from:i})); let out=0;
      for(let i=0;i<items.length;i++){
        const a=items[i], dest=ids[out++];
        if(items[i+1]?.value===a.value){ next[dest]=a.value*2;gain+=next[dest];merged.push(dest);tracks.push({from:items[++i].from,to:dest}); }
        else next[dest]=a.value;
        tracks.push({from:a.from,to:dest});
      }
    }
    return {board:next,gain,tracks,merged,changed:next.some((v,i)=>v!==board[i])};
  }
  function spawn(board,random=Math.random){const empty=board.map((v,i)=>v? -1:i).filter(i=>i>=0);if(!empty.length)return -1;const i=empty[Math.floor(random()*empty.length)];board[i]=random()<.9?2:4;return i;}
  function over(board){return !board.includes(0)&&!['left','up'].some(d=>move(board,d).changed);}
  function swipe(dx,dy){if(Math.max(Math.abs(dx),Math.abs(dy))<24)return null;return Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up';}
  const api={move,spawn,over,swipe}; if(typeof module!=='undefined')module.exports=api;else root.GameEngine=api;
})(globalThis);
