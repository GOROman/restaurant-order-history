export const KEY = 'restaurant-order-history.v1';
export function normalize(rows) {
  if (!Array.isArray(rows) || !rows.length || rows.length > 1000) throw new Error('履歴は1〜1000件の配列で入力してください。');
  return rows.map((row, i) => {
    if (!row || typeof row !== 'object') throw new Error(`${i + 1}行目の形式が不正です。`);
    const name = typeof row.name === 'string' ? row.name.trim() : '';
    const quantity = Number(row.quantity), unitPrice = Number(row.unitPrice);
    const orderedAt = row.orderedAt == null ? '' : String(row.orderedAt).trim();
    if (!name || name.length > 120 || /https?:\/\/|token|session|卓番号/i.test(name)) throw new Error(`${i + 1}行目：商品名を確認してください。URLやセッション情報は保存できません。`);
    if (row.quantity === '' || row.quantity == null || row.unitPrice === '' || row.unitPrice == null || !Number.isSafeInteger(quantity) || quantity < 1 || quantity > 9999 || !Number.isSafeInteger(unitPrice) || unitPrice < 0 || unitPrice > 10000000) throw new Error(`${i + 1}行目：数量と単価は範囲内の整数で入力してください。`);
    if (orderedAt && (!/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})?$/.test(orderedAt) || Number.isNaN(Date.parse(orderedAt)))) throw new Error(`${i + 1}行目：日時は YYYY-MM-DD HH:mm 形式で入力してください。`);
    return { name, quantity, unitPrice, orderedAt };
  });
}
export function parseHistory(text) {
  const value = text.trim();
  if (!value) throw new Error('履歴を入力してください。');
  if (value.length > 500000) throw new Error('入力が大きすぎます。分けて入力してください。');
  if (/^[\[{]/.test(value)) {
    let parsed;
    try { parsed = JSON.parse(value); } catch { throw new Error('JSONの形式を確認してください。'); }
    return normalize(Array.isArray(parsed) ? parsed : parsed.items);
  }
  const lines = value.split(/\r?\n/).filter(line => line.trim());
  if (/^商品名[,\t]/.test(lines[0])) lines.shift();
  return normalize(lines.map((line, i) => {
    const fields = line.split(line.includes('\t') ? '\t' : ',');
    if (fields.length < 3 || fields.length > 4) throw new Error(`${i + 1}行目：商品名,数量,単価,日時 の順で入力してください。`);
    return { name: fields[0], quantity: fields[1].trim(), unitPrice: fields[2].trim(), orderedAt: fields[3]?.trim() || '' };
  }));
}
export const total = rows => rows.reduce((sum, row) => sum + row.quantity * row.unitPrice, 0);
