const makeError = (message, data) => ({'ERROR': {message, data}});

const hasBadValueTypes = (nodes) => {
  const badValueTypeNames = Object.entries(nodes)
    .filter(
      ([_name, value]) => (typeof value !== 'number' && !Array.isArray(value))
    )
    .map(([name, _value]) => name);
  if (badValueTypeNames.length)
    return makeError('nodes with bad value types', badValueTypeNames);
  return {};
};

const hasBadArgRefs = (nodes) => {
  const argNames = Object.keys(nodes).filter(name => name !== 'RETURN');
  const argRefs = Object.values(nodes)
    .filter(value => Array.isArray(value))
    .reduce(
      (refs, value) => {
        const [_fn, ...argRefs] = value;
        return [...refs, ...argRefs];
      },
      []
    );
  const badArgRefs = argRefs.filter(ref => !argNames.includes(ref));
  if (badArgRefs.length)
    return makeError('bad graph node refs', badArgRefs);
  return {};
};

const keyExists = (key, obj) => key in obj;

const makeFwdNode = (name) => ({name, successors: []});

// convert graph links from predecessors to successors
const invertLinks = (accum, [nodeName, value]) => {
  const res = {...accum}
  if (Array.isArray(value)) {
    const [_fn, ...args] = value;
    if (! keyExists(nodeName, res))
      res[nodeName] = makeFwdNode(nodeName);

    args.forEach(predecessorName => {
      if (! keyExists(predecessorName, res))
        res[predecessorName] = makeFwdNode(predecessorName);
      res[predecessorName].successors.push(nodeName);
    });
  }
  else {
    if (! keyExists('ENTRY', res))
      res['ENTRY'] = makeFwdNode('ENTRY');
    res['ENTRY'].successors.push(nodeName);
  }
  return res
};

const findCycle = (graph, nodeName, history) => {
  if (history.includes(nodeName))
    return [true, [...history, nodeName]];
  const node = graph[nodeName];
  if (node.successors.length == 0)
    return [false, []];
  const result = node.successors.reduce(
    (error, successorName) => {
      let [found, path] = findCycle(graph, successorName, [...history, nodeName]);
      if (found)
        return [found, path];
      return error;
    },
    []
  );
  return result;
};

const detectCycles = (nodes) => {
  const graph = Object.entries(nodes).reduce(invertLinks, {});
  const [found, path] = findCycle(graph, 'ENTRY', []);
  if (found)
    return makeError('fn graph contains a cycle', path);
  return {};
};

const validate = (nodes) => {
  let result;

  if (typeof nodes !== 'object' || Array.isArray(nodes))
    return makeError('graph is not an object', (typeof nodes));
  
  if (!keyExists('RETURN', nodes))
    return makeError('graph is missing RETURN node', '');

  result = hasBadValueTypes(nodes);
  if ('ERROR' in result)
    return result;

  result = hasBadArgRefs(nodes);
  if ('ERROR' in result)
    return result;

  result = detectCycles(nodes);
  if ('ERROR' in result)
    return result;
  
  return {};
};

module.exports = {
  validate
}
