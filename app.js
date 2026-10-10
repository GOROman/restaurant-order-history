import {KEY,item,sum,split,integer} from './bill.js';
const $=id=>document.getElementById(id);
const yen=n=>new Intl.NumberFormat('ja-JP',{style:'currency',currency:'JPY'}).format(n);
let rows=[];
function notice(text){$('status').textContent=text;}
function render(){
  $('records').replaceChildren();
  rows.forEach((r,i)=>{
    const article=document.createElement('article'); article.className='record';
    const detail=document.createElement('div'), title=document.createElement('strong'), small=document.createElement('small'), amount=document.createElement('strong'), remove=document.createElement('button');
    title.textContent=r.name; small.textContent=`${r.quantity}点 × ${yen(r.price)}`; detail.append(title,small);
    amount.textContent=yen(r.quantity*r.price); remove.type='button'; remove.textContent='削除'; remove.setAttribute('aria-label',`${r.name}の記録を削除`);
    remove.onclick=()=>{const next=rows.filter((_,index)=>index!==i);if(persist(next)){rows=next;render();notice('記録を削除しました。');}};
    article.append(detail,amount,remove); $('records').append(article);
  });
  $('empty').hidden=rows.length>0; $('total').textContent=yen(sum(rows)); calculate();
}
function persist(next){try{localStorage.setItem(KEY,JSON.stringify(next));return true;}catch{notice('端末に保存できませんでした。ブラウザーの保存設定をご確認ください。');return false;}}
function calculate(){
  try{
    const result=split(sum(rows),$('people').value);
    $('per-person').textContent=yen(result.base);
    $('split-note').textContent=result.remainder ? `${result.remainder}名が${yen(result.base+1)}、${result.people-result.remainder}名が${yen(result.base)}。余り${result.remainder}円を1円ずつ分けます。` : `${result.people}名で同額。1人 ${yen(result.base)}です。`;
    $('split-error').textContent='';
  }catch(error){$('per-person').textContent='—';$('split-note').textContent='人数を確認してください。';$('split-error').textContent=error.message;}
}
try{const stored=localStorage.getItem(KEY);if(stored){const data=JSON.parse(stored);if(!Array.isArray(data)||data.length>100)throw Error();rows=data.map(item);}}catch{notice('保存した記録を読み込めませんでした。新しい記録を追加できます。');}
$('entry').onsubmit=event=>{
  event.preventDefault();
  try{
    if(rows.length>=100)throw Error('記録は100件までです。不要な記録を削除してください。');
    const value=item({name:$('name').value,quantity:$('quantity').value,price:$('price').value});
    const next=[...rows,value];if(!persist(next))return; rows=next; $('entry').reset(); render();notice('記録をこの端末に保存しました。');$('name').focus();
  }catch(error){notice(error.message);}
};
$('people').oninput=calculate;
render();
