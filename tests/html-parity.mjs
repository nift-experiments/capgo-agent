import assert from 'node:assert/strict';
import {semantic} from '../tools/html-parity.mjs';
// Equal preorder tag/text sequences must not hide different DOM nesting.
assert.notEqual(semantic('<div><p>x</p></div><p>y</p>'),semantic('<div><p>x</p><p>y</p></div>'));
// Formatting and attribute order remain harmless serializer differences.
assert.equal(semantic('<div id="x" class="a">hello world</div>'),semantic('<div class="a" id="x"> hello\nworld </div>'));
console.log('DOM parity distinguishes nesting and ignores formatting differences.');
