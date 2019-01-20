var fs = require('fs');
var R = require('ramda');

const {fngraph} = require('../src/index');

const getData = R.curry((type, fileName) => {
  return new Promise(function(resolve, reject) {
    fs.readFile(fileName, type, (err, data) => {
        err ? reject(err) : resolve(data);
    });
  });
});

const sum = (x, y) => x + y;
const product = (x, y) => x * y;
const substitute = (text, regex, to) => text.replace(regex, to);
const waitOnValue = R.curry((msec, value) =>
  new Promise(
    (resolve, _reject) => setTimeout(() => resolve(value), msec)
  )
);

const graph = {
  'file': 0,
  'regex': 1,
  'to': 2,
  'read': [getData('utf8'), 'file'],
  'RETURN': [substitute, 'read', 'regex', 'to']
};

const expected = 
`<body>
  <h2>A page of SuperButtons</h2>
  <SuperButton onClick=clickHandler>Click Me</SuperButton>
  <SuperButton onClick=clickHandler>Press Me</SuperButton>
  <SuperButton onClick=clickHandler>Impress Me</SuperButton>
</body>`;

const graphTimed = {
  'a': 0,
  'b': 1,
  'c': 2,
  'wait100': [waitOnValue(100), 'a'], // 3
  'wait200': [waitOnValue(200), 'b'], // 4
  'wait150': [waitOnValue(150), 'c'], // 5
  'sum100': [sum, 'a', 'wait100'], // 3 + 3 = 6
  'prod150': [product, 'wait100', 'wait150'], // 3 * 5 = 15
  'prod200': [product, 'sum100', 'wait200'], // 6 * 4 = 24
  'waitprod150': [waitOnValue(100), 'prod150'], // 15
  'RETURN': [sum, 'waitprod150', 'prod200'] // 15 + 24 = 39
};

describe('fngraph asynchronous function tests', () => {
  test("fngraph async", () => {
    const f = fngraph(graph);
    return f('./test/buttons.txt', /button/g, 'SuperButton')
    .then(res => {
      expect(res).toEqual(expected);
    });
  });
  test("fngraph maximizes parallelism", () => {
    const f = fngraph(graphTimed);
    return f(3, 4, 5)
    .then(res => {
      expect(res).toEqual(39);
    });
  });
});
