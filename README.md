# fngraph

fngraph is a utility for composing function graphs

## Installation

    npm install --save fngraph

## Usage

```
const {fngraph} = require('fngraph');

const graph = {
  'a': 0,
  'b': 1,
  'c': 2,
  'f1': [sum, 'a', 'b'],
  'f2': [product, 'a', 'b'],
  'f3': [product, 'f2', 'c'],
  'RETURN': [sum, 'f1', 'f3']
};

const f = fngraph(graph);
f([4, 2, 10]).then(console.log);  // 86
```

## ToDo

- Document
  - works with functions that return promises
  - syntax for graph object (arguments and functions)
  - fngraph is an HOF that validates graph object and returns function or error
  - partial application
  - use of R.get() to pass result properties along
  - use of R.? to re-order args to enable partial application

- test cases
  - graph can specify nodes in any order
  - graph uses functors (Maybe, Either and IO) to handle missing data and errors

- validation
  - argument count matches function arity

