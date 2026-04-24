function getConnectedComponents(nodes, adjacency) {
  const visited = new Set();
  const components = [];

  const undirected = new Map();
  for (const node of nodes) {
    undirected.set(node, new Set());
  }

  for (const [parent, children] of adjacency.entries()) {
    for (const child of children) {
      undirected.get(parent).add(child);
      undirected.get(child).add(parent);
    }
  }

  for (const node of nodes) {
    if (visited.has(node)) continue;

    const stack = [node];
    const component = new Set();

    while (stack.length) {
      const current = stack.pop();
      if (visited.has(current)) continue;

      visited.add(current);
      component.add(current);

      for (const neighbor of undirected.get(current) || []) {
        if (!visited.has(neighbor)) stack.push(neighbor);
      }
    }

    components.push(component);
  }

  return components;
}

function hasCycleFromNode(node, adjacency, visiting, visited, componentSet) {
  if (visiting.has(node)) return true;
  if (visited.has(node)) return false;

  visiting.add(node);

  for (const next of adjacency.get(node) || []) {
    if (!componentSet.has(next)) continue;
    if (hasCycleFromNode(next, adjacency, visiting, visited, componentSet)) {
      return true;
    }
  }

  visiting.delete(node);
  visited.add(node);
  return false;
}

function componentHasCycle(componentSet, adjacency) {
  const visited = new Set();
  const visiting = new Set();

  for (const node of componentSet) {
    if (!visited.has(node)) {
      if (hasCycleFromNode(node, adjacency, visiting, visited, componentSet)) {
        return true;
      }
    }
  }

  return false;
}

function buildNestedTree(node, adjacency) {
  const children = adjacency.get(node) || [];
  const subtree = {};

  for (const child of children) {
    subtree[child] = buildNestedTree(child, adjacency);
  }

  return subtree;
}

function calculateDepth(node, adjacency) {
  const children = adjacency.get(node) || [];
  if (!children.length) return 1;

  let maxChildDepth = 0;
  for (const child of children) {
    maxChildDepth = Math.max(maxChildDepth, calculateDepth(child, adjacency));
  }

  return 1 + maxChildDepth;
}

module.exports = {
  getConnectedComponents,
  componentHasCycle,
  buildNestedTree,
  calculateDepth,
};