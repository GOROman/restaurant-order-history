export const KEY = 'meal-records.v2';
export function integer(value, min, max, label) {
  if (!/^\d+$/.test(String(value))) throw new Error(`${label}は整数で入力してください。`);
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < min || n > max) throw new Error(`${label}は${min}〜${max}で入力してください。`);
  return n;
}
export function item(value) {
  const name = typeof value?.name === 'string' ? value.name.trim() : '';
  if (!name || name.length > 80) throw new Error('品名は1〜80文字で入力してください。');
  return {name,quantity:integer(value.quantity,1,999,'数量'),price:integer(value.price,0,1000000,'単価')};
}
export function sum(rows) { return rows.reduce((n,r)=>n+r.quantity*r.price,0); }
export function split(total, people) {
  const amount = integer(total,0,99900000000,'合計');
  const count = integer(people,1,100,'人数');
  return {base:Math.floor(amount/count),remainder:amount%count,people:count};
}
