const {fngraphSync} = require('../src/index');

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

describe('fngraphSync function tests', () => {
  test("fngraphSync simple", () => {
    const f = fngraphSync(graph);
    const res = f(4, 2, 10);
    expect(res).toEqual(86);
  });
  test("fngraphSync throws error on bad node values", () => {
    const f = fngraphSync(graphWithBadTypes);
    expect(f).toHaveProperty('ERROR');
  });
  test("fngraphSync throws error on bad arg refs", () => {
    const f = fngraphSync(graphWithBadRefs);
    expect(f).toHaveProperty('ERROR');
  });
  test("fngraphSync throws error on cyclic graph", () => {
    const f = fngraphSync(cyclicGraph);
    expect(f).toHaveProperty('ERROR');
  });
});