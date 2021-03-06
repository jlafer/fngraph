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

const boxSurfaceArea = (x, y, z) => (2 * x * y) + (2 * y * z) + (2 * x * z);
const boxVolume = (x, y, z) => x * y * z;
const ratio = (x, y) => x / y;

const saVolGraph = {
  'length': 0,
  'width': 1,
  'depth': 2,
  'surface': [boxSurfaceArea, 'length', 'width', 'depth'],
  'volume': [boxVolume, 'length', 'width', 'depth'],
  'RETURN': [ratio, 'surface', 'volume']
};

const graphNotObject = [
  {'a': 0},
  {'b': 1},
  {'RETURN': [sum, 'a', 'b']}
];

const graphNoReturn = {
  'a': 0,
  'b': 1,
  'c': 2,
  'f1': [sum, 'a', 'b'],
  'f2': [product, 'b', 'c'],
  'f3': [product, 'f2', 'f1']
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
  test("fngraphSync calculates sa-vol", () => {
    const f = fngraphSync(saVolGraph);
    const res = f(2, 3, 4).toFixed(2);
    expect(res).toEqual('2.17');
  });
  test("fngraphSync throws error on graph not object", () => {
    const f = fngraphSync(graphNotObject);
    expect(f).toHaveProperty('ERROR');
  });
  test("fngraphSync throws error on graph missing RETURN", () => {
    const f = fngraphSync(graphNoReturn);
    expect(f).toHaveProperty('ERROR');
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