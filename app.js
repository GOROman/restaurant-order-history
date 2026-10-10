import { KEY, normalize, parseHistory, total } from './history.js';
const $ = id => document.getElementById(id);
const yen = n => new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(n);
let records = [], pending = [], isDemo = false;
const message = text => { $('message').textContent = text; };
function cards(rows, target) {
  target.replaceChildren();
  rows.forEach(row => {
    const card = document.createElement('article'); card.className = 'item';
    const left = document.createElement('div'), title = document.createElement('h3'), detail = document.createElement('small'), date = document.createElement('small'), amount = document.createElement('div');
    title.textContent = row.name; detail.textContent = `${row.quantity}点 × ${yen(row.unitPrice)}`;
    date.textContent = row.orderedAt ? new Date(row.orderedAt).toLocaleString('ja-JP', {year:'numeric', month:'long',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '日時未入力';
    amount.className = 'amount'; amount.textContent = yen(row.quantity * row.unitPrice);
    left.append(title, detail, date); card.append(left, amount); target.append(card);
  });
}
function render() {
  $('total').textContent = yen(total(records)); $('count').textContent = records.reduce((sum, r) => sum + r.quantity, 0);
  cards(records, $('list'));
  if (!records.length) { const empty = document.createElement('div'); empty.className = 'empty'; const title = document.createElement('strong'); title.textContent = 'まだ履歴がありません'; const text = document.createElement('p'); text.textContent = '手元の明細を入力して、最初の記録を残しましょう。'; empty.append(title, text); $('list').append(empty); }
  $('clear').disabled = !records.length;
}
try { const stored = localStorage.getItem(KEY); if (stored) records = normalize(JSON.parse(stored)); } catch { message('保存データを読み込めませんでした。ブラウザーの保存設定やデータをご確認ください。'); }
render();
$('toggle').onclick = () => { $('editor').hidden = !$('editor').hidden; $('toggle').setAttribute('aria-expanded', String(!$('editor').hidden)); if (!$('editor').hidden) $('input').focus(); };
function resetPreview() { pending = []; isDemo = false; $('save').hidden = true; $('preview-list').replaceChildren(); }
$('input').oninput = () => { resetPreview(); message(''); };
$('preview').onclick = () => {
  resetPreview();
  try { pending = parseHistory($('input').value); cards(pending, $('preview-list')); $('save').hidden = false; message(`${pending.length}件・合計 ${yen(total(pending))}。確認後に保存してください。既存の記録へ追加します。`); } catch (error) { message(error.message); }
};
$('demo').onclick = () => {
  resetPreview(); isDemo = true;
  const badge = document.createElement('p'); badge.className = 'badge'; badge.textContent = 'デモ：架空の内容です。実際の注文履歴ではありません。保存されません。'; $('preview-list').append(badge);
  const demoList = document.createElement('div'); $('preview-list').append(demoList);
  cards([{name:'サンプルの一皿',quantity:2,unitPrice:500,orderedAt:'2026-01-01T12:00'}], demoList); message('デモは表示のみです。');
};
$('save').onclick = () => {
  if (!pending.length || isDemo) return;
  try { const next = normalize([...records, ...pending]); localStorage.setItem(KEY, JSON.stringify(next)); records = next; resetPreview(); $('input').value = ''; render(); message('このブラウザーに保存しました。'); } catch(error) { message(`保存できませんでした。${error.message}`); }
};
$('clear').onclick = () => {
  if (!confirm('このブラウザーに保存した履歴をすべて削除しますか？')) return;
  try { localStorage.removeItem(KEY); records = []; render(); message('保存した履歴を削除しました。'); } catch { message('削除できませんでした。ブラウザーの設定をご確認ください。'); }
};
