/**
 * Bundles TrackedGraph class as a JavaScript string for sandbox execution.
 * This serialized version includes all methods needed for graph operations and visualization.
 */

export function bundleTrackedGraph(): string {
  return `
    class TrackedGraph {
      constructor(directed = false, onOperation = null) {
        this.adjacencyList = new Map();
        this.directed = directed;
        this.onOperation = onOperation;
      }

      emitStep(type, args, result, metadata = {}) {
        if (this.onOperation) {
          this.onOperation({
            type,
            target: 'graph',
            args,
            result,
            timestamp: Date.now(),
            metadata
          });
        }
      }

      addVertex(vertex) {
        if (!this.adjacencyList.has(vertex)) {
          this.adjacencyList.set(vertex, []);
          this.emitStep('addVertex', [vertex], this.toArray(), { vertex });
        }
        return this;
      }

      addEdge(from, to, weight = undefined, directed = this.directed) {
        if (!this.adjacencyList.has(from)) {
          this.addVertex(from);
        }
        if (!this.adjacencyList.has(to)) {
          this.addVertex(to);
        }

        const fromEdges = this.adjacencyList.get(from);
        if (!fromEdges.some(edge => edge.to === to)) {
          fromEdges.push({ from, to, weight, directed });
        }

        if (!directed) {
          const toEdges = this.adjacencyList.get(to);
          if (!toEdges.some(edge => edge.to === from)) {
            toEdges.push({ from: to, to: from, weight, directed: false });
          }
        }

        this.emitStep('addEdge', [from, to, weight], this.toArray(), { from, to, weight, directed });
        return this;
      }

      removeVertex(vertex) {
        if (!this.adjacencyList.has(vertex)) {
          return this;
        }

        for (const [v, edges] of this.adjacencyList) {
          this.adjacencyList.set(v, edges.filter(edge => edge.to !== vertex));
        }

        this.adjacencyList.delete(vertex);
        this.emitStep('removeVertex', [vertex], this.toArray(), { vertex });
        return this;
      }

      removeEdge(from, to) {
        if (this.adjacencyList.has(from)) {
          const edges = this.adjacencyList.get(from);
          this.adjacencyList.set(from, edges.filter(edge => edge.to !== to));
        }

        if (!this.directed && this.adjacencyList.has(to)) {
          const edges = this.adjacencyList.get(to);
          this.adjacencyList.set(to, edges.filter(edge => edge.to !== from));
        }

        this.emitStep('removeEdge', [from, to], this.toArray(), { from, to });
        return this;
      }

      bfs(start) {
        if (!this.adjacencyList.has(start)) {
          return [];
        }

        const visited = new Set();
        const queue = [start];
        const result = [];

        while (queue.length > 0) {
          const current = queue.shift();
          if (visited.has(current)) continue;

          visited.add(current);
          result.push(current);

          this.emitStep('bfs', [start], result, { current, visited: new Set(visited), queue: [...queue] });

          const neighbors = this.adjacencyList.get(current) || [];
          for (const edge of neighbors) {
            if (!visited.has(edge.to)) {
              queue.push(edge.to);
            }
          }
        }

        return result;
      }

      dfs(start) {
        if (!this.adjacencyList.has(start)) {
          return [];
        }

        const visited = new Set();
        const result = [];

        const dfsHelper = (vertex) => {
          visited.add(vertex);
          result.push(vertex);

          this.emitStep('dfs', [start], result, { current: vertex, visited: new Set(visited) });

          const neighbors = this.adjacencyList.get(vertex) || [];
          for (const edge of neighbors) {
            if (!visited.has(edge.to)) {
              dfsHelper(edge.to);
            }
          }
        };

        dfsHelper(start);
        return result;
      }

      hasCycle() {
        if (this.directed) {
          const visited = new Set();
          const recStack = new Set();

          const hasCycleHelper = (vertex) => {
            visited.add(vertex);
            recStack.add(vertex);

            const neighbors = this.adjacencyList.get(vertex) || [];
            for (const edge of neighbors) {
              if (!visited.has(edge.to)) {
                if (hasCycleHelper(edge.to)) {
                  return true;
                }
              } else if (recStack.has(edge.to)) {
                return true;
              }
            }

            recStack.delete(vertex);
            return false;
          };

          for (const vertex of this.adjacencyList.keys()) {
            if (!visited.has(vertex)) {
              if (hasCycleHelper(vertex)) {
                this.emitStep('hasCycle', [], true, { hasCycle: true });
                return true;
              }
            }
          }

          this.emitStep('hasCycle', [], false, { hasCycle: false });
          return false;
        } else {
          const visited = new Set();

          const hasCycleHelper = (vertex, parent) => {
            visited.add(vertex);

            const neighbors = this.adjacencyList.get(vertex) || [];
            for (const edge of neighbors) {
              if (!visited.has(edge.to)) {
                if (hasCycleHelper(edge.to, vertex)) {
                  return true;
                }
              } else if (edge.to !== parent) {
                return true;
              }
            }

            return false;
          };

          for (const vertex of this.adjacencyList.keys()) {
            if (!visited.has(vertex)) {
              if (hasCycleHelper(vertex, null)) {
                this.emitStep('hasCycle', [], true, { hasCycle: true });
                return true;
              }
            }
          }

          this.emitStep('hasCycle', [], false, { hasCycle: false });
          return false;
        }
      }

      shortestPath(start, end) {
        if (!this.adjacencyList.has(start) || !this.adjacencyList.has(end)) {
          this.emitStep('shortestPath', [start, end], [], {});
          return [];
        }

        const visited = new Set();
        const queue = [[start]];

        while (queue.length > 0) {
          const path = queue.shift();
          const current = path[path.length - 1];

          if (current === end) {
            this.emitStep('shortestPath', [start, end], path, { path });
            return path;
          }

          if (visited.has(current)) continue;
          visited.add(current);

          const neighbors = this.adjacencyList.get(current) || [];
          for (const edge of neighbors) {
            if (!visited.has(edge.to)) {
              queue.push([...path, edge.to]);
            }
          }
        }

        this.emitStep('shortestPath', [start, end], [], {});
        return [];
      }

      getVertices() {
        return Array.from(this.adjacencyList.keys());
      }

      getEdges() {
        const edges = [];
        for (const [vertex, neighbors] of this.adjacencyList) {
          for (const edge of neighbors) {
            if (this.directed || vertex <= edge.to) {
              edges.push(edge);
            }
          }
        }
        return edges;
      }

      getNeighbors(vertex) {
        const edges = this.adjacencyList.get(vertex) || [];
        return edges.map(edge => edge.to);
      }

      isDirected() {
        return this.directed;
      }

      getSize() {
        return this.adjacencyList.size;
      }

      isEmpty() {
        return this.adjacencyList.size === 0;
      }

      clear() {
        this.adjacencyList.clear();
        this.emitStep('clear', [], [], { cleared: true });
        return this;
      }

      toArray() {
        const nodes = [];
        for (const [id, neighbors] of this.adjacencyList) {
          nodes.push({
            id,
            label: String(id),
            edges: neighbors
          });
        }
        return nodes;
      }

      getData() {
        return new Map(this.adjacencyList);
      }

      static from(vertices, edges, directed = false, onOperation = null) {
        const graph = new TrackedGraph(directed, onOperation);
        for (const vertex of vertices) {
          graph.addVertex(vertex);
        }
        for (const edge of edges) {
          graph.addEdge(edge.from, edge.to, edge.weight, edge.directed !== undefined ? edge.directed : directed);
        }
        return graph;
      }
    }

    function createTrackedGraph(vertices = [], edges = [], directed = false, onOperation = null) {
      return TrackedGraph.from(vertices, edges, directed, onOperation);
    }
  `;
}
