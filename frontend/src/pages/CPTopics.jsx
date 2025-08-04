// src/pages/CPTopics.jsx
import React, { useState } from 'react';
import '../styles/CPTopics.css';

const topics = [
  {
    name: 'Dynamic Programming',
    content: [
      'Top-down & Bottom-up (Memoization vs Tabulation)',
      'Define states, transitions, base cases clearly',
      'Classic problems: 0/1 & Unbounded Knapsack, LIS/LCS, Coin Change, Edit Distance',
      'Optimizations: Bitset DP, Divide & Conquer DP, Knuth Optimization, DP on Trees',
      'Practice sets: Codeforces EDU DP, AtCoder DP contest',
      'Resources: https://cp-algorithms.com/dynamic_programming/'
    ]
  },
  {
    name: 'Graphs',
    content: [
      'Traversals: BFS / DFS (iterative & recursive)',
      'Shortest paths: Dijkstra, Bellman-Ford, SPFA, Floyd–Warshall',
      'MST: Kruskal (with DSU), Prim',
      'Advanced: SCC (Kosaraju/Tarjan), Topological sort, Bridges & Articulation Points',
      'Graph types: DAG, Bipartite, Weighted/Unweighted, Directed/Undirected',
      'Resources: https://cp-algorithms.com/graph/'
    ]
  },
  {
    name: 'Greedy Algorithms',
    content: [
      'Greedy-choice property & proof idea (exchange argument)',
      'Examples: Activity Selection, Fractional Knapsack, Huffman coding',
      'Counterexamples where greedy fails (compare with DP)',
      'Heuristics: sorting + priority queue strategies',
      'Resources: https://cp-algorithms.com/greedy/'
    ]
  },
  {
    name: 'Trees & LCA',
    content: [
      'Tree traversals: pre/in/post-order, Euler tour',
      'LCA: Binary Lifting, RMQ over Euler Tour',
      'Tree DP (subtree sums, rerooting), Centroid Decomposition, HLD',
      'Path queries vs subtree queries techniques',
      'Resources: https://cp-algorithms.com/graph/lca.html'
    ]
  },
  {
    name: 'Segment Tree / Fenwick Tree',
    content: [
      'Fenwick (BIT): prefix sums, point updates / range queries',
      'Segment Tree: range query/update, lazy propagation',
      'Variants: Merge sort tree, Segment Tree Beats, 2D BIT/SegTree basics',
      'When to use which structure and complexity trade-offs',
      'Resources: https://cp-algorithms.com/data_structures/segment_tree.html'
    ]
  },
  {
    name: 'Binary & Ternary Search',
    content: [
      'Binary search on sorted arrays',
      'Binary search on answer (parametric search)',
      'lower_bound / upper_bound usage',
      'Ternary search for unimodal functions (max/min)',
      'Common pitfalls: infinite loops, overflow mid calc',
      'Resources: https://cp-algorithms.com/num_methods/ternary_search.html'
    ]
  },
  {
    name: 'Bit Manipulation / Bitmask DP',
    content: [
      'Bit operations (&, |, ^, ~, <<, >>), popcount',
      'Iterate over submasks / supersets efficiently',
      'Bitmask DP: TSP, SOS DP (Sum over Subsets)',
      'Useful tricks: dp[mask], transitions using set bits',
      'Resources: https://cp-algorithms.com/algebra/all-submasks.html'
    ]
  },
  {
    name: 'Number Theory',
    content: [
      'GCD / LCM, Extended Euclid, Modular inverse',
      'Sieve of Eratosthenes, segmented sieve',
      'Fast exponentiation (binary exponentiation)',
      'Euler’s Totient, CRT, Modular combinatorics (nCr mod p)',
      'Resources: https://cp-algorithms.com/algebra/'
    ]
  },
  {
    name: 'String Algorithms',
    content: [
      'Prefix function (KMP), Z-function',
      'Hashing: polynomial rolling hash, double hash',
      'Suffix Array & LCP (Kasai), Suffix Automaton',
      'Aho–Corasick for multiple pattern matching',
      'Trie / Palindromic Tree (EERTREE)',
      'Resources: https://cp-algorithms.com/string/'
    ]
  },
  {
    name: 'Computational Geometry',
    content: [
      'Vectors, dot/cross product, orientation test (ccw)',
      'Line & segment intersection, point on segment',
      'Convex hull (Graham scan / Andrew monotone chain)',
      'Closest pair of points (divide & conquer)',
      'Polygon area (shoelace), point-in-polygon',
      'Resources: https://cp-algorithms.com/geometry/'
    ]
  },
  {
    name: 'Flow & Matching',
    content: [
      'Max-Flow: Edmonds–Karp, Dinic',
      'Min-Cost Max-Flow basics',
      'Bipartite matching: Hopcroft–Karp',
      'Flow applications: assignment, scheduling, circulation',
      'Resources: https://cp-algorithms.com/graph/edmonds_karp.html'
    ]
  },
  {
    name: 'Advanced Data Structures',
    content: [
      'DSU (Union-Find) + Rollback',
      'PBDS / Ordered set (order_of_key, find_by_order)',
      'Treap / Splay / AVL trees concepts',
      'Mo’s algorithm (array & tree variants)',
      'Persistent data structures basics',
      'Resources: https://cp-algorithms.com/data_structures/disjoint_set_union.html'
    ]
  },
  {
    name: 'Game Theory',
    content: [
      'Impartial vs Partisan games',
      'Grundy numbers / Sprague–Grundy theorem',
      'Nim game, XOR rule, mex function',
      'Games on graphs, DP + Grundy numbers',
      'Resources: https://cp-algorithms.com/game_theory/sprague-grundy-nim.html'
    ]
  },
  {
    name: 'Probability & Expected Value',
    content: [
      'Linearity of expectation (even without independence)',
      'Probability DP patterns',
      'Expected value in random processes',
      'Randomization tricks in algorithms',
      'Resources: https://cp-algorithms.com/dynamic_programming/probability_dp.html'
    ]
  },
  {
    name: 'Misc / Tricks',
    content: [
      'Two-pointer / Sliding window',
      'Prefix sums / Difference arrays',
      'Meet-in-the-middle',
      'Offline queries (sort by blocks / Mo’s), sqrt decomposition',
      'Interactive problems tips & fast I/O',
      'Resources: https://cp-algorithms.com/'
    ]
  }
];

export default function CPTopics() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleTopic = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="cp-topics-page">
      <h1>Competitive Programming Topics</h1>
      <div className="topics-list">
        {topics.map((topic, index) => (
          <div className="topic-card" key={index}>
            <div className="topic-header" onClick={() => toggleTopic(index)}>
              <h2>{topic.name}</h2>
              <span>{openIndex === index ? '-' : '+'}</span>
            </div>
            {openIndex === index && (
              <ul className="topic-content">
                {topic.content.map((item, i) => (
                  <li key={i}>
                    {item.startsWith('Resources:')
                      ? (
                        <>
                          Resources:{' '}
                          <a
                            href={item.replace('Resources: ', '')}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {item.replace('Resources: ', '')}
                          </a>
                        </>
                      )
                      : item.startsWith('http')
                        ? <a href={item} target="_blank" rel="noopener noreferrer">{item}</a>
                        : item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
