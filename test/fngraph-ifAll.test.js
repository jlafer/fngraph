const {fngraph, ifAll} = require('../src/index');

const sum = (x, y) => x + y;
const product = (x, y) => x * y;
const div = (x, y) => x / y;

const graph = {
  'a': 0,
  'b': 1,
  'c': 2,
  'f1': [ifAll(sum, 1), 'a', 'b'],
  'f2': [ifAll(product, 10), 'a', 'b'],
  'f3': [ifAll(div, 3), 'f2', 'c'],
  'RETURN': [sum, 'f1', 'f3']
};

describe('fngraph-ifAll hof tests', () => {
  test('fngraph-ifAll with good args', () => {
    const f = fngraph(graph);
    return f([4, 2, 2]).then(res => {
      expect(res).toEqual(10);
    });
  });
  test('fngraph-ifAll with one null arg', () => {
    const f = fngraph(graph);
    return f([4, 2, null]).then(res => {
      expect(res).toEqual(9);
    });
  });
  test('fngraph-ifAll with all null args', () => {
    const f = fngraph(graph);
    return f([null, null, 5]).then(res => {
      expect(res).toEqual(3);
    });
  });
});
