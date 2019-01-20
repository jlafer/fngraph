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

describe('fngraph synchronous function tests', () => {
  test("fngraph calculates with simple synchronous graph", () => {
    const f = fngraph(graph);
    return f(4, 2, 10).then(res => {
      expect(res).toEqual(86);
    });
  });
});