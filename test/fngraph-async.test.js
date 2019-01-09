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

const substitute = (text, regex, to) => text.replace(regex, to);

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

describe('fngraph asynchronous function tests', () => {
  test("fngraph async", () => {
    const f = fngraph(graph);
    return f(['./test/buttons.txt', /button/g, 'SuperButton'])
    .then(res => {
      expect(res).toEqual(expected);
    });
  });
});
