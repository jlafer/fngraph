var R = require('ramda');

const {validate} = require('./validation');

const formatTime = (date) => `${date.toTimeString()}.${date.getMilliseconds()}`;

const makeNode = R.curry((argArr, [k, v]) => {
  if (typeof v === 'number')
    return {key: k, ready: true, promise: Promise.resolve(argArr[v])};
  else {
    const [fn, ...nodeArgNames] = v;
    return {key: k, ready: false, function: fn, args: nodeArgNames};
  }
});

const someNodeisNotReady = nodes => nodes.some(node => !node.ready);

const getNodeByName = R.curry((nodes, arg) =>
  nodes.find(node => node.key === arg)
);

const getPrereqNodes = (nodes, node) => node.args.map(getNodeByName(nodes));

const allPrereqsReady = (nodes, node) =>
  getPrereqNodes(nodes, node).every(node => node.ready);

const getRunnableNode = (nodes) =>
  nodes.find(node => !node.ready && allPrereqsReady(nodes, node));

const executeNodeFn = (nodes, node) => {
  const prereqs = getPrereqNodes(nodes, node).map(node => node.promise);
  return Promise.all(prereqs)
  .then(prereqs => {
    //console.log(`prereqs met: now executing ${node.key} at ${formatTime(new Date())}`);
    return prereqs;
  })
  .then(argArr => {
    //console.log(`calling ${node.key} with arg list from this array:`, argArr);
    return node.function(...argArr);
  })
  .then((res) => {
    //console.log(`${node.key} returning ${res} at ${formatTime(new Date())}`);
    return res;
  });
};
  
const fngraph = (graph) => {
  const validation = validate(graph);
  if ('ERROR' in validation) {
    console.error('fngraph: invalid input graph:', validation.ERROR);
    return validation;
  }
  return function(...args) {
    const nodes = Object.entries(graph).map(makeNode(args));
    //console.log('nodes: ', nodes);
    while (someNodeisNotReady(nodes)) {
      let node = getRunnableNode(nodes);
      node.promise = executeNodeFn(nodes, node);
      node.ready = true;
      //console.log('nodes: ', nodes);
    }
    return getNodeByName(nodes, 'RETURN').promise;
  }
};

const ifAll = (fn, altRes) => (...args) =>
  (args.some(item => item == undefined)) ? altRes : fn(...args);

const ifAny = (fn, altRes) => (...args) =>
  (args.every(item => item == undefined)) ? altRes : fn(...args);

module.exports = {
  fngraph,
  ifAll,
  ifAny
}
