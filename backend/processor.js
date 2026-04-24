function processEdges(edgesArray) {
    const invalidEntries = [];
    const duplicateEdgesSet = new Set();
    const seenEdges = new Set();
    const parents = {};
    const childrenMap = {};
    const nodes = new Set();

    edgesArray.forEach(str => {
        const trimmed = str.trim();
        if (!trimmed) return;

        const validRegex = /^[A-Z]->[A-Z]$/;
        const parts = trimmed.split("->");
        if (!validRegex.test(trimmed) || parts[0] === parts[1]) {
            invalidEntries.push(trimmed);
            return;
        }

        if (seenEdges.has(trimmed)) {
            duplicateEdgesSet.add(trimmed);
            return;
        }
        seenEdges.add(trimmed);

        const [X, Y] = parts;
        if (parents[Y]) {
            // Multi-parent rule
            return;
        }

        parents[Y] = X;
        if (!childrenMap[X]) childrenMap[X] = [];
        if (!childrenMap[Y]) childrenMap[Y] = [];
        childrenMap[X].push(Y);
        nodes.add(X);
        nodes.add(Y);
    });

    const allNodes = Array.from(nodes);
    const adjUndirected = {};
    allNodes.forEach(n => adjUndirected[n] = []);
    Object.keys(childrenMap).forEach(X => {
        childrenMap[X].forEach(Y => {
            adjUndirected[X].push(Y);
            adjUndirected[Y].push(X);
        });
    });

    const visited = new Set();
    const components = [];
    allNodes.forEach(n => {
        if (!visited.has(n)) {
            const compNodes = [];
            const queue = [n];
            visited.add(n);
            while (queue.length > 0) {
                const curr = queue.shift();
                compNodes.push(curr);
                adjUndirected[curr].forEach(neighbor => {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        queue.push(neighbor);
                    }
                });
            }
            components.push(compNodes);
        }
    });

    const hierarchies = [];
    let totalTrees = 0;
    let totalCycles = 0;
    let largestTreeRoot = null;
    let maxDepth = -1;

    function buildTree(root) {
        let maxChildDepth = 0;
        const tree = {};
        if (childrenMap[root]) {
            childrenMap[root].forEach(child => {
                const childRes = buildTree(child);
                tree[child] = childRes.tree;
                if (childRes.depth > maxChildDepth) {
                    maxChildDepth = childRes.depth;
                }
            });
        }
        return { tree, depth: maxChildDepth + 1 };
    }

    components.forEach(comp => {
        const zeroParents = comp.filter(n => !parents[n]);
        if (zeroParents.length > 0) {
            const compRoot = zeroParents[0];
            const { tree, depth } = buildTree(compRoot);
            hierarchies.push({
                root: compRoot,
                tree
            });
            totalTrees++;
            if (depth > maxDepth) {
                maxDepth = depth;
                largestTreeRoot = compRoot;
            } else if (depth === maxDepth) {
                if (!largestTreeRoot || compRoot < largestTreeRoot) {
                    largestTreeRoot = compRoot;
                }
            }
        } else {
            comp.sort();
            const compRoot = comp[0];
            hierarchies.push({
                root: compRoot,
                tree: {},
                has_cycle: true
            });
            totalCycles++;
        }
    });

    return {
        user_id: "girieshkrishna_24042026",
        email_id: "giriesh@example.com",
        college_roll_number: "123456789",
        hierarchies,
        invalid_entries: invalidEntries,
        duplicate_edges: Array.from(duplicateEdgesSet),
        summary: {
            total_trees: totalTrees,
            total_cycles: totalCycles,
            largest_tree_root: largestTreeRoot
        }
    };
}
module.exports = { processEdges };
