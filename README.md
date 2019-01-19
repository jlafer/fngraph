# fngraph

Traditional functional programming techniques rely heavily on unary functions for the ability to link the result of one function to the parameter of the next. However, we often encounter functions that, to maintain purity, require multiple parameters. Yes,
we can sometimes use partial application or curry our functions but this becomes clumsy when the parameters of n-ary functions are calculated and consumed in the middle of our composition.

In fact, many computations can't be arranged in a straight pipeline. They look a lot more like a network of pipes, with tees, parallel paths and junctions where multiple pipes feed a downstream function. We call this a function graph and in functional programing terminology, we wish to treat it as its own abstraction.

## Description

fngraph is simply a function for implementing the function graph abstraction. It is a utility for composing lazy function graphs and then executing them at a later time.

With fngraph, you can compose a function from a number of simpler functions to form a function graph. The graph definition is highly declarative (it's just a Javascript object) and succint making it easy to define, visualize, understand, review for correctness and validate programmatically.

The fngraph utility has the following features:
- As with any function composition, it eliminates the need for declaring and using variables to link functions.
- fngraph is a higher-order function (HOF) and so the functions composed are lazy.
- The function graph can be constructed dynamically from code.
- Functions in the graph can be any combination of synchronous or Promise-returning.
- At creation time, the function graph is validated using a number of checks for syntactical and structural correctness.
- With asynchronous functions (that return a promise), parallel path execution is maximized automatically.
- When executed, it returns a promise.
- It comes with a few helper HOFs for wrapping functions inside the composition. For example, ifAll(function, altResult) will execute the wrapped function if all input parameters are defined and non-null; otherwise it will return an alternate result. This provides similar capabilities as the `Maybe` and `Either` functors. The user can write custom wrapper HOFs if needed.

## Installation

    npm install --save fngraph

## Usage

Here's a trivial example using synchronous functions that take two parameters. Note that the composed function `f` is called with parameters placed in an array.

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

Note that the result needs to be captured in .then, since `f` returns a promise.

Here's an example using functions that return a Promise.

```
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

const f = fngraph(graph);
return f(['./test/buttons.txt', /button/g, 'SuperButton'])
.then(res => {
  // operate on res...
});
```

## ToDo

- Document
  - syntax for graph object (arguments and functions)
  - fngraph is an HOF that validates graph object and returns function or error
  - partial application
  - use of R.get() to pass result properties along
  - use of R.? to re-order args to enable partial application

- test cases
  - graph can specify nodes in any order

- validation
  - argument count matches function arity

