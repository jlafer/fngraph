# fngraph

fngraph is a utility for composing function graphs

## Installation

```npm install --save fngraph```

## Usage

Please see ./test.js for an example of using the `fngraph` function.

Document
- partial application
- use of R.get() to pass result properties along
- use of R.? to re-order args to enable partial application

## ToDo

- test cases
  - partial application of node function
  - 
- allow passing of result properties (make user call R.get)
- allow constant arguments (e.g. 'utf8' in fs.read)
- validation
  - argument count matches function arity
  - data types in graph
  - required keys
  - references to nonexistant nodes

