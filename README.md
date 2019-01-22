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

If you are composing with only synchronous functions, you can use `fngraphSync`, whose composed function returns its result immediately when called.

With fngraph, you compose a complex function from a number of simpler functions. The graph definition is both highly declarative -- it's just a Javascript object -- and succint, making it easy to define, visualize, understand, review for correctness and validate programmatically.

## Installation

    npm install --save fngraph

## Usage

Here's a trivial example using synchronous functions to calculate the surface area-to-volume ratio of a box.

```
const {fngraphSync} = require('fngraph');

const boxSurfaceArea = (x, y, z) => (2 * x * y) + (4 * y * z);
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

const saVolRatio = fngraphSync(saVolGraph);
console.log( saVolRatio(2, 2, 5) );  // 2.4
```

Here's an example using a function that returns a Promise.

```
var R = require('ramda');

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

Note also how we partially applied the file encoding (utf8) to the curried `getData()` function above. With relatively static arguments, this is a great convenience from functional programming that can be used with fngraph.

In this last example, we assemble a function graph that uses multiple objects -- sometimes together -- to generate a marketing email.

```
const graph = {
  'db': 0,
  'acctId': 1,
  'productId': 2,
  'campaign': 3,
  'acct': [getAccount, 'db', 'acctId'],
  'to': [R.prop('emailAddress'), 'acct'],
  'from': [R.prop('fromAddress'), 'campaign'],
  'product': [getProduct, 'db', 'productId'],
  'subject': [makeEmailSubject, 'campaign', 'product'],
  'body': [makeEmailBody, 'campaign', 'product', 'acct'],
  'RETURN': [assembleEmail, 'to', 'from', 'subject', 'body']
};

const makeProductCampaignEmail = fngraph(graph);
return makeProductCampaignEmail(db, 1001, 42, newYearsPromo)
.then(emailObj => {
  // operate on emailObj...
});
```

Note how the email message depends on multiple, unrelated concerns - customer account, product and campaign. The composition of functions that must process multiple, recently calculated data items is where fngraph will be the most useful.

## Features
The fngraph utility has the following features:
- Component functions in the graph need not be unary. This allows many more pure functions to be used in your functional programming.
- Functions in the graph can be any combination of synchronous or asynchronous (if they return a Promise).
- At creation time, the function graph is validated using a number of checks for syntactical and structural correctness. For example, it is checked for cyclicality and bad node references.
- When composing with asynchronous functions (that return a promise), parallel execution is maximized automatically.
- fngraph comes with a few helper HOFs for wrapping functions used in a composition. This is useful for things like error handling and dealing with bad inputs. For example, `ifAll(function, altResult)` will execute the wrapped function if all input arguments are defined and non-null; otherwise it will return an alternate result specified by the user. This provides capabilities similar to those of `Maybe` and `Either` functors. The user can also write custom wrappers if needed.
- Function graphs can be composed dynamically from code.

As with unary function composition, fngraph eliminates the need for declaring and using variables to link functions together. Instead, we use string keys to name function nodes and show dependencies between them. This may seem like we're losing one of the benefits of function composition, namely its brevity.

However, that's an apples-to-oranges comparison; the valid comparison is with functional programming using n-ary functions, for which we must supply arguments in the right order and ensure that functions execute in the correct order and with the right timing (in the case of asynchronous functions). And with graphs of n-ary functions, a case can be made that being explicit about data dependencies is more important than brevity.

Finally, remember that fngraph is not a replacement for unary function compositions, which can be used as node functions within a graph and which can be composed from functions built with fngraph!

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

## Helper Functions
fngraph comes with two (HOF) helper functions: `ifAll` and `ifAny`.

```
ifAll(function, altResult)
```
If a node function is wrapped with `ifAll`, the `function` will only execute if all input parameters have a non-null argument value. Otherwise, `altResult` will be returned as the value for that node.

```
ifAny(function, altResult)
```
If a node function is wrapped with `ifAny`, the `function` will execute if any input parameters have a non-null argument value. Otherwise, `altResult` will be returned as the value for that node.

If you need a custom HOF, just ensure that it returns a function that will either call the wrapped function or will return some result (or a promise) to be passed to dependent functions in the graph.

## Function Graph Validation
When `fngraph` or `fngraphSync` is called to compose a graph function, it first validates the graph definition for correct syntax, no "dangling" references, acyclicality, etc. If an error is detected, it returns an error object rather than a function. The error object contains an "ERROR" property. Here's a sample error object:
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
  - use of R.partial(), R.flip(), etc.
- Test Cases
  - use of HOF with asynchronous function
- Validations
  - argument count matches function arity

