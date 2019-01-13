# fngraph

fngraph is a utility for composing function graphs

## Installation

```npm install --save fngraph```

## Usage

```const {fngraph} = require('fngraph');

```

Document
- partial application
- use of R.get() to pass result properties along
- use of R.? to re-order args to enable partial application

## ToDo

- test cases
  - partial application of node function
  - controlled timing of async functions to verify parallelism
  - graph can specify nodes in any order

- validation
  - argument count matches function arity
  - data types in graph
  - required keys
  - references to nonexistant nodes
  - cycles in graph

