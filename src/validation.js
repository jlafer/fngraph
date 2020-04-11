const makeError = (message, data) => ({'ERROR': {message, data}});

const getBadValueTypes = (nodes) => {
  return Object.entries(nodes)
    .filter(
      ([_name, value]) => (typeof value !== 'number' && !Array.isArray(value))
    )
    .map(([name, _value]) => name);
};

const hasBadValueTypes = (nodes) => {
  const badValueTypeNames = getBadValueTypes(nodes);
  if (badValueTypeNames.length)
    return makeError('nodes with bad value types', badValueTypeNames);
  return {};
};

const getBadArgRefs = (nodes) => {
  const argNames = Object.keys(nodes);
  return Object.values(nodes)
    .filter(value => Array.isArray(value))
    .reduce(
      (refs, value) => {
        const [_fn, ...argRefs] = value;
        return [...refs, ...argRefs];
      },
      []
    )
    .filter(ref => !argNames.includes(ref));
};

const hasBadArgRefs = (nodes) => {
  const badArgRefs = getBadArgRefs(nodes);
  if (badArgRefs.length)
    return makeError('bad graph node refs', badArgRefs);
  return {};
};

const keyExists = (key, obj) => key in obj;

const makeFwdNode = (name) => ({name, successors: []});

const addPropIfMissing = (obj, key, value) =>
  keyExists(key, obj) ? obj : {...obj, [key]: value};

const addArgsAsPredecessorNodes = (obj, nodeName, args) => {
  let res = {...obj};
  args.forEach(predecessorName => {
    res = addPropIfMissing(res, predecessorName, makeFwdNode(predecessorName));
    res[predecessorName].successors.push(nodeName);
  });
  return res;
};

const nodeToFwdLinks = (accum, [nodeName, value]) => {
  if (Array.isArray(value)) {
    const [_fn, ...args] = value;
    return addArgsAsPredecessorNodes(accum, nodeName, args);
  }
  else {
    const successors = [...accum['ENTRY'].successors, nodeName];
    const newEntry = {...accum['ENTRY'], successors};
    return {...accum, 'ENTRY': newEntry};
  }
};

const findCycle = (graph, nodeName, history) => {
  if (nodeName === 'RETURN')
    return [false, []];
  if (history.includes(nodeName))
    return [true, [...history, nodeName]];
  //console.log(`findCycle: looking at ${nodeName}`);
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
  const graph = Object.entries(nodes)
    .reduce(nodeToFwdLinks, {'ENTRY': makeFwdNode('ENTRY')});
  const [found, path] = findCycle(graph, 'ENTRY', []);
  if (found)
    return makeError('fn graph contains a cycle', path);
  return {};
};

export const validate = (nodes) => {
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
