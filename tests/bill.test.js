import test from 'node:test';
import assert from 'node:assert/strict';
import {item,sum,split} from '../bill.js';
test('five people split integer yen with remainder, preserving total',()=>{
  for(const total of [0,1,4,5,1003,99900000000]){
    const r=split(total,5);assert.equal(r.base*r.people+r.remainder,total);assert.ok(r.remainder>=0&&r.remainder<5);
  }
  assert.deepEqual(split(1003,5),{base:200,remainder:3,people:5});
});
test('reject negative, decimal, zero people, empty, infinity and excessive values',()=>{
  for(const people of [-1,0,1.5,101,'',Infinity,'1e1'])assert.throws(()=>split(100,people));
  for(const total of [-1,1.5,99900000001,Infinity])assert.throws(()=>split(total,5));
  for(const quantity of [-1,0,1.5,1000,''])assert.throws(()=>item({name:'検証',quantity,price:100}));
  for(const price of [-1,1.5,1000001,''])assert.throws(()=>item({name:'検証',quantity:1,price}));
});
test('quantity and unit price form the total; unapproved fields are omitted',()=>{
  const row=item({name:' 検証 ',quantity:'2',price:'500',extra:'omit'});
  assert.deepEqual(row,{name:'検証',quantity:2,price:500});assert.equal(sum([row]),1000);
  assert.throws(()=>item({name:' ',quantity:1,price:100}));
});

test('confirmed inclusive total splits into five without adding tax',()=>{assert.deepEqual(split(13750,5),{base:2750,remainder:0,people:5});});
