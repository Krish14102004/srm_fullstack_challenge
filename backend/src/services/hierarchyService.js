const { USER_ID, EMAIL_ID, COLLEGE_ROLL_NUMBER } = require('../config/constants');
const { validateEdge } = require('../utils/validators');
const {
  getConnectedComponents,
  componentHasCycle,
  buildNestedTree,
  calculateDepth,
} = require('../utils/graphUtils');

function processHierarchyData(body) {
  if (!body || !Array.isArray(body.data)) {
    throw new Error('Request body must contain a data array');
  }

  const invalidEntries = [];
  const duplicateEdges = [];
  const seenEdges = new Set();
  const duplicateRecorded = new Set();

  const filteredValidEdges = [];
  const childToParent = new Map();

  for (const entry of body.data) {
    const result = validateEdge(entry);

    if (!result.valid) {
      invalidEntries.push(String(entry ?? '').trim());
      continue;
    }

    const { trimmed, parent, child } = result;

    if (seenEdges.has(trimmed)) {
      if (!duplicateRecorded.has(trimmed)) {
        duplicateEdges.push(trimmed);
        duplicateRecorded.add(trimmed);
      }
      continue;
    }

    seenEdges.add(trimmed);

    if (childToParent.has(child)) {
      continue;
    }

    childToParent.set(child, parent);
    filteredValidEdges.push({ parent, child });
  }

  const nodes = new Set();
  const adjacency = new Map();
  const childSet = new Set();

  for (const { parent, child } of filteredValidEdges) {
    nodes.add(parent);
    nodes.add(child);
    childSet.add(child);

    if (!adjacency.has(parent)) adjacency.set(parent, []);
    if (!adjacency.has(child)) adjacency.set(child, []);
    adjacency.get(parent).push(child);
  }

  for (const node of nodes) {
    if (!adjacency.has(node)) adjacency.set(node, []);
  }

  const components = getConnectedComponents(nodes, adjacency);
  const hierarchies = [];

  let totalTrees = 0;
  let totalCycles = 0;
  let largestTreeRoot = '';
  let largestTreeDepth = 0;

  for (const component of components) {
    const componentNodes = [...component].sort();
    const roots = componentNodes.filter((node) => !childSet.has(node));
    const root = roots.length ? roots[0] : componentNodes[0];

    const cyclic = componentHasCycle(component, adjacency);

    if (cyclic) {
      hierarchies.push({
        root,
        tree: {},
        has_cycle: true,
      });
      totalCycles += 1;
      continue;
    }

    const nested = {
      [root]: buildNestedTree(root, adjacency),
    };

    const depth = calculateDepth(root, adjacency);

    hierarchies.push({
      root,
      tree: nested,
      depth,
    });

    totalTrees += 1;

    if (
      depth > largestTreeDepth ||
      (depth === largestTreeDepth && (largestTreeRoot === '' || root < largestTreeRoot))
    ) {
      largestTreeDepth = depth;
      largestTreeRoot = root;
    }
  }

  return {
    user_id: USER_ID,
    email_id: EMAIL_ID,
    college_roll_number: COLLEGE_ROLL_NUMBER,
    hierarchies,
    invalid_entries: invalidEntries,
    duplicate_edges: duplicateEdges,
    summary: {
      total_trees: totalTrees,
      total_cycles: totalCycles,
      largest_tree_root: largestTreeRoot,
    },
  };
}

module.exports = {
  processHierarchyData,
};