const {fngraph, ifAny} = require('../src/index');

function sparseAvg(...nums) {
  const [total, values] = nums
    .filter(num => !(num == undefined))
    .reduce(
      ([sum, cnt], num) => {
        return ([sum+num, cnt+1])
      },
      [0, 0]
    );
  return (total/values);
};

const graph = {
  'a': 0,
  'b': 1,
  'c': 2,
  'd': 3,
  'e': 4,
  'RETURN': [ifAny(sparseAvg, 0), 'a', 'b', 'c', 'd', 'e']
};

describe('fngraph-ifAny hof tests', () => {
  test('fngraph-ifAny with good args', () => {
    const f = fngraph(graph);
    return f([1, 2, 3, 4, 5]).then(res => {
      expect(res).toEqual(3);
    });
  });
  test('fngraph-ifAny with one null arg', () => {
    const f = fngraph(graph);
    return f([1, null, 3, null, 5]).then(res => {
      expect(res).toEqual(3);
    });
  });
  test('fngraph-ifAny with all null args', () => {
    const f = fngraph(graph);
    return f([null, null, null, null, null]).then(res => {
      expect(res).toEqual(0);
    });
  });
});
