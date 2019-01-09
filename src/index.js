var R = require('ramda');

const makeNode = R.curry((args, [k, v]) => {
  if (typeof v === 'number')
    return {key: k, ready: true, promise: Promise.resolve(args[v])};
  else {
    const [fn, ...nodeArgs] = v;
    return {key: k, ready: false, function: fn, args: nodeArgs};
  }
});

const someNodeisNotReady = (nodes) =>
  nodes.some(node => ! node.ready);

const getNodeByName = R.curry((nodes, arg) =>
  nodes.find(node => node.key === arg)
);

const getPrereqNodes = (nodes, node) =>
  node.args.map(getNodeByName(nodes));

const allPrereqsReady = (nodes, node) => {
  const prereqNodes = getPrereqNodes(nodes, node);
  return prereqNodes.every(node => node.ready);
};

const getRunnableNode = (nodes) =>
  nodes.find(node => (! node.ready) && allPrereqsReady(nodes, node));

const executeNodeFn = (nodes, node) => {
  const prereqNodes = getPrereqNodes(nodes, node);
  const prereqs = prereqNodes.map(node => node.promise);
  return Promise.all(prereqs).then(args => node.function(...args));
};
  
const fngraph = R.curry((graph, args) => {
  const nodes = Object.entries(graph).map(makeNode(args));
  //console.log('nodes: ', nodes);
  while (someNodeisNotReady(nodes)) {
    let node = getRunnableNode(nodes);
    node.promise = executeNodeFn(nodes, node);
    node.ready = true;
    //console.log('nodes: ', nodes);
  }
  return getNodeByName(nodes, 'RETURN').promise;
});

module.exports = {
  fngraph
}
