# fngraph

Traditional function composition techniques rely heavily on unary functions to link the result of one function to the (single) parameter of the next. However, we often encounter functions that, to maintain purity, require multiple parameters. Yes,
we can sometimes use partial application but this becomes clumsy when the arguments to those n-ary functions are calculated by other functions we want to include in our composition or when the result of one function is needed as an argument to multiple downstream functions. The simple pipeline composition is difficult to apply in these scenarios.

In fact, many computations can't be built using a simple pipeline. They look more like a network of pipes with tees, parallel paths and junctions where multiple pipes feed a downstream function. Such calculations can be modeled as a directed acyclic graph (DAG) and we call this a *function graph*. In functional programing terms, we wish to treat it as its own abstraction, in much the way we do with `compose` and `pipe`.

## Description

`fngraph` (pronounced eff-n-graph...see what I did there? ;-) is simply a function that isolates and implements the function graph abstraction.

```
const graph = { // graph definition };
const f = fngraph(graph);
f(fnArgs).then(fnToConsumeResults);
```

`fngraph` is a higher-order function (HOF) for composing synchronous and asynchronous functions into a function graph for execution at a later time. That execution returns a promise.

If you are composing with only synchronous functions, you can use `fngraphSync`, whose composed function returns its result immediately.

With fngraph, you compose a complex function from a number of simpler functions. The graph definition is both highly declarative -- it's just a Javascript object -- and succint, making it easy to define, visualize, understand, review for correctness and validate programmatically.

The fngraph utility has the following features:
- Component functions in the graph need not be unary. This allows many more pure functions to be used in your functional programming.
- As with any function composition, it eliminates the need for declaring and using variables to link functions together.
- Function graphs can be composed dynamically from code.
- Functions in the graph can be any combination of synchronous or asynchronous (if they return a Promise).
- At creation time, the function graph is validated using a number of checks for syntactical and structural correctness. For example, it is checked for cyclicality.
- When composing with asynchronous functions (that return a promise), parallel path execution is maximized automatically.
- fngraph comes with a few helper HOFs for wrapping functions used in the composition. This is useful for things like error handling and dealing with bad inputs. For example, `ifAll(function, altResult)` will execute the wrapped function if all input arguments are defined and non-null; otherwise it will return an alternate result specified by the user. This provides capabilities similar to those of `Maybe` and `Either` functors. The user can also write custom wrappers if needed.

## Installation

    npm install --save fngraph

## Usage

Here's a trivial example using synchronous functions that take two parameters.

```
const {fngraphSync} = require('fngraph');

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

const f = fngraphSync(graph);
console.log( f(4, 2, 10) );  // 86
```

Here's an example using a function that returns a Promise.

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
return f('./test/buttons.txt', /button/g, 'SuperButton')
.then(res => {
  // operate on res...
});
```

Note that the result needs to be captured with `.then`, since `f` returns a promise.

Note also how we partially applied the file encoding (utf8) to the curried `getData()` function above. With relatively static arguments, this is a great convenience from traditional function composition that is preserved by fngraph.

## Function Graph Definition
A function graph is defined with a simple object that has the shape below. Order of keys, of course, is not important but can be clarifying for humans.
```
{
  key1: <paramPos> | <fnNode>,
  key2: <paramPos> | <fnNode>,
  o
  o
  o
  RETURN: <fnNode>
}
```
Each key names an input parameter to the composed function or a node in the function graph.

For input parameters, the `paramPos` is an integer that specifies the zero-based index of the parameter.

For nodes, the `fnNode` is a heterogeneous array containing the function to be executed, at position 0, followed by zero or more argument keys. A key references another (predecessor) function node or an input parameter.

One function node property must be named `RETURN` and represents the exit function of the graph that produces the result.

## Function Graph Validation
When `fngraph` or `fngraphSync` is called to compose the graph function, it first validates the graph definition for correct syntax, no "dangling" references, acyclicality, etc. If an error is detected, it returns an error object rather than a function. The error object contains an "ERROR" property. Here's a sample error object:
```
{
  ERROR: {
    message: 'fn graph contains a cycle',
    data: [ 'ENTRY', 'b', 'f2', 'f3', 'f2' ] 
  }
}
```

## ToDo

- Documentation
  - more realistic examples
  - use of R.get() to pass result properties downstream
  - use of R.partial(), R.flip(), etc.
  - use of helper HOFs
- Test Cases
  - use of HOF with asynchronous function
- Validations
  - argument count matches function arity

