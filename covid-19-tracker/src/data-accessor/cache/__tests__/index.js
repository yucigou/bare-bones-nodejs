const { getCache, setCache } = require('../');

const test = async () => {
  const obj1 = [1, 2, 3];
  const obj2 = { name: 'Mark', values: [2, 3, 4] };
  await setCache('obj1', obj1);
  await setCache('obj2', obj2);
  const val1 = await getCache('obj1');
  const val2 = await getCache('obj2');
  console.log(val1);
  console.log(val2);
  return;
};

test();
