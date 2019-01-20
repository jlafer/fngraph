const {fngraph} = require('../src/index');

const sum = (x, y) => x + y;
const product = (x, y) => x * y;

const graph = {
  'a': 0,
  'b': 1,
  'c': 2,
  'f1': [sum, 'a', 'b'],
  'f2': [product, 'a', 'b'],
  'f3': [product, 'f2', 'c'],
  'RETURN': [sum, 'f1', 'f3']
};

const graphWithBadTypes = {
  'a': 0,
  'b': 1,
  'c': '2',
  'f1': [sum, 'a', 'b'],
  'f2': [product, 'a', 'b'],
  'f3': {},
  'RETURN': [sum, 'f2', 'f3']
};

const graphWithBadRefs = {
  'a': 0,
  'b': 1,
  'c': 2,
  'f1': [sum, 'a', 'b'],
  'f2': [product, 'a', 'b'],
  'f3': [product, 'f2', 'd'],
  'RETURN': [sum, 'f1', 'f3']
};

const cyclicGraph = {
  'a': 0,
  'b': 1,
  'c': 2,
  'f1': [sum, 'a', 'b'],
  'f2': [sum, 'b', 'f3'],
  'f3': [sum, 'f1', 'f2'],
  'RETURN': [sum, 'c', 'f3']
};

describe('fngraph synchronous function tests', () => {
  test("fngraph simple", () => {
    const f = fngraph(graph);
    return f(4, 2, 10).then(res => {
      expect(res).toEqual(86);
    });
  });
  test("fngraph throws error on bad node values", () => {
    const f = fngraph(graphWithBadTypes);
    expect(f).toHaveProperty('ERROR');
  });
  test("fngraph throws error on bad arg refs", () => {
    const f = fngraph(graphWithBadRefs);
    expect(f).toHaveProperty('ERROR');
  });
  test("fngraph throws error on cyclic graph", () => {
    const f = fngraph(cyclicGraph);
    expect(f).toHaveProperty('ERROR');
  });
});