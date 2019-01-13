//const nodes = [
//  {
//    links: [ 1 ], // node 0 is linked to node 1
//    visited: false
//  }, {
//    links: [ 0, 2 ], // node 1 is linked to node 0 and 2
//    visited: false
//  },
//  ...
// ];

const getDuplicateKeys = (keys) => {
  console.log('getDuplicateKeys: keys:', keys);
  const set = new Set();
  const dups = [];
  keys.forEach(key => {
    if (set.has(key))
      dups.push(key)
    else
      set.add(key);
  });
  console.log('getDuplicateKeys: dups:', dups);
  return dups;
};

const hasBadValueTypes = (nodes) => {
  const badValueTypeNames = Object.entries(nodes)
    .filter(
      ([_name, value]) => (typeof value !== 'number' && !Array.isArray(value))
    )
    .map(
      ([name, _value]) => name
    );
  if (badValueTypeNames.length)
    return {
      'ERROR': {
        message: 'nodes with bad value types',
        data: badValueTypeNames
      }
    };
  return {};
};

const hasBadArgRefs = (nodes) => {
  const argNames = Object.keys(nodes)
    .filter(name => name !== 'RETURN');
  const argRefs = Object.values(nodes)
    .filter((value) => Array.isArray(value))
    .reduce(
      (refs, value) => {
        const newRefs = [];
        const [fn, ...argRefs] = value;
        argRefs.forEach(ref => newRefs.push(ref));
        return [...refs, ...newRefs];
      },
      []
    );
  const badArgRefs = argRefs.filter(ref => !argNames.includes(ref));
  if (badArgRefs.length)
    return {'ERROR': {message: 'bad graph node refs', data: badArgRefs}};
  return {};
};

const keyExists = (key, obj) => key in obj;

const makeFwdNode = (name) => ({name, successors: []});

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
  //console.log(`findCycle: with ${nodeName} after `, history);
  if (history.includes(nodeName)) {
    //console.log(`findCycle: found cycle:`, history);
    return [true, [...history, nodeName]];
  }
  const node = graph[nodeName];
  if (node.successors.length == 0)
    return [false, []];
  const result = node.successors.reduce(
    (error, successorName) => {
      let [found, path] = findCycle(graph, successorName, [...history, nodeName]);
      if (found) {
        //console.log(`findCycle: found cycle in successor ${successorName}:`, path);
        return [found, path];
      }
      return error;
    },
    []
  );
  return result;
};

const detectCycles = (nodes) => {
  const graph = Object.entries(nodes).reduce(invertLinks, {});
  //console.log('detectCycles: graph:', graph);
  const [found, path] = findCycle(graph, 'ENTRY', []);
  if (found) {
    //console.log('detectCycles: found cycle:', path);
    return {'ERROR': {message: 'fn graph contains a cycle', data: path}};
  }
  return {};
};

const validate = (nodes) => {
  //console.log('validate: nodes:', nodes);
  let result;

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
