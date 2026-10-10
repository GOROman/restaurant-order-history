import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHistory, total, normalize } from '../history.js';
test('text and JSON imports calculate quantity times unit price', () => {
  const rows = parseHistory('商品名,数量,単価,日時\nテスト商品,2,500,2026-01-01 12:00\nテストB,1,300');
  assert.equal(total(rows), 1300);
  assert.deepEqual(parseHistory(JSON.stringify({ items: rows })), rows);
});
test('reject malformed data and sensitive URL fields', () => {
  for (const value of ['', '[', '商品,0,100', '商品,2,-1', '商品,1,1.5', '商品,,100', '商品,1,100,昨日', 'https://example.com/session,1,100']) assert.throws(() => parseHistory(value));
  assert.throws(() => normalize(new Array(1001).fill({name:'A',quantity:1,unitPrice:1})));
});
test('only approved fields are retained; zero prices are supported', () => {
  assert.deepEqual(normalize([{name:' A ',quantity:1,unitPrice:0,secret:'discard'}]), [{name:'A',quantity:1,unitPrice:0,orderedAt:''}]);
});
