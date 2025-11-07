// 今回はクライアントサイドもルーティングもないので何もimportしない

const kv = await Deno.openKv();

await kv.set(['pokemon', 'ブラッキー'], { type: '悪', level: 35 });
await kv.set(['pokemon', 'シャワーズ'], { type: '水', level: 26 });

await kv.set(['pokemon', '悪', 'ブラッキー'], { level: 35 });
await kv.set(['pokemon', '水', 'シャワーズ'], { level: 26 });

await kv.set(['pokemon', 'ブラッキー'], { type: '悪' });
await kv.set(['pokemon', 'ブラッキー'], { nickname: 'クロ' });
const partial = await kv.get(['pokemon', 'ブラッキー']);

const pkmn = await kv.get(['pokemon', 'ブラッキー']);
console.log(pkmn.key, pkmn.value);

const pkmns = await kv.list({ prefix: ['pokemon'] });
for await (const p of pkmns) {
  console.log(p.key, p.value);
}

await kv.delete(['pokemon', 'ブラッキー']);
let deleted = await kv.get(['pokemon', 'ブラッキー']);
console.log(deleted.value); // → null

const atomic = kv.atomic();
atomic.set(['pokemon', 'エーフィ'], { type: 'エスパー', level: 30 });
atomic.set(['pokemon', 'リーフィア'], { type: '草', level: 25 });
const res = await atomic.commit();
console.log('atomic結果:', res.ok ? '成功' : '失敗');

async function getNextId() {
  const key = ['counter', 'pokemon'];
  const res = await kv.atomic().sum(key, 1n).commit();
  if (!res.ok) {
    console.error('IDの生成に失敗しました。');
    return null;
  }
  const counter = await kv.get(key);
  return Number(counter.value);
}
const newId = await getNextId();
console.log('生成されたID:', newId);

await kv.set(['ブラッキー', '所持'], true);
const hasBlacky = await kv.get(['ブラッキー', '所持']);
console.log(hasBlacky); // → true
console.log(typeof hasBlacky); // → boolean

await kv.set(['ブラッキー', 'date'], new Date());
const date = await kv.get(['ブラッキー', 'date']);
console.log('捕まえた日時:', date.value);
console.log(`捕まえたのは${date.value.getMonth() + 1}月${date.value.getDate()}日です`);

const userID = 28;
const userName = '28'; // 名前が数字の人が別のユーザーのIDと偶然被った
await kv.set(['user', userID], { name: 'OJK' });
await kv.set(['user', userName], { type: 'Robot' }); // 下手すると上書きされるが…

const name = await kv.get(['user', 28]);
const type = await kv.get(['user', '28']);
console.log(name.value); // → { name: 'OJK' }
console.log(type.value); // → { type: 'Robot' } ※ちゃんと区別される
