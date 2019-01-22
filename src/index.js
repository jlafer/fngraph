var R = require('ramda');
const {validate} = require('./validation');

const makeNode = R.curry((isAsync, argArr, [k, v]) => {
  if (typeof v === 'number') {
    let value = isAsync ? Promise.resolve(argArr[v]) : argArr[v];
    return {key: k, ready: true, value};
  }
  else {
    const [fn, ...nodeArgNames] = v;
    return {key: k, ready: false, function: fn, args: nodeArgNames};
  }
});

const someNodeIsNotReady = nodes => nodes.some(node => !node.ready);

const getNodeByName = R.curry((nodes, arg) =>
  nodes.find(node => node.key === arg)
);

const getPrereqNodes = (nodes, node) => node.args.map(getNodeByName(nodes));

const getPrereqValues = (nodes, node) =>
  getPrereqNodes(nodes, node).map(n => n.value);

const allPrereqsReady = (nodes, node) =>
  getPrereqNodes(nodes, node).every(n => n.ready);

const getRunnableNode = (nodes) =>
  nodes.find(node => !node.ready && allPrereqsReady(nodes, node));

const makeNodePromise = (nodes, node) => {
  const promises = getPrereqValues(nodes, node);
  return Promise.all(promises).then(args => node.function(...args));
};
  
const executeNodeFn = (nodes, node) => {
  const args = getPrereqValues(nodes, node);
  return node.function(...args);
};

const _fngraph = (graph, isAsync) => {
  const validation = validate(graph);
  if ('ERROR' in validation) {
    console.error('fngraph: invalid input graph:', validation.ERROR);
    return validation;
  }

  return function(...args) {
    const nodes = Object.entries(graph).map(makeNode(isAsync, args));
    while (someNodeIsNotReady(nodes)) {
      let node = getRunnableNode(nodes);
      node.value = isAsync
        ? makeNodePromise(nodes, node)
        : executeNodeFn(nodes, node);
      node.ready = true;
    }
    return getNodeByName(nodes, 'RETURN').value;
  }
};

const IS_ASYNC = true;
const IS_SYNC = false;

const fngraph = (graph) =>  _fngraph(graph, IS_ASYNC);

const fngraphSync = (graph) => _fngraph(graph, IS_SYNC);

const ifAll = (fn, altRes) => (...args) =>
  (args.some(item => item == undefined)) ? altRes : fn(...args);

const ifAny = (fn, altRes) => (...args) =>
  (args.every(item => item == undefined)) ? altRes : fn(...args);

module.exports = {
  fngraph,
  fngraphSync,
  ifAll,
  ifAny
}
