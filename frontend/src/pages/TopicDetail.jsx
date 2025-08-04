// src/pages/TopicDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../styles/TopicDetail.css';

// --- SAME DATA you used in CPTopics.jsx (copy-paste & add slug keys) ---
const topics = [
  { slug: 'dp', name: 'Dynamic Programming', points: [
    'Top-down & Bottom-up (Memoization vs Tabulation)',
    'Define states, transitions, base cases clearly',
    'Classic problems: 0/1 & Unbounded Knapsack, LIS/LCS, Coin Change, Edit Distance',
    'Optimizations: Bitset DP, Divide & Conquer DP, Knuth Optimization, DP on Trees',
    'Practice sets: Codeforces EDU DP, AtCoder DP contest',
    'Resources: https://cp-algorithms.com/dynamic_programming/',
  ]},
  { slug: 'graphs', name: 'Graphs', points: [
    'Traversals: BFS / DFS (iterative & recursive)',
    'Shortest paths: Dijkstra, Bellman-Ford, SPFA, Floyd–Warshall',
    'MST: Kruskal (DSU), Prim',
    'Advanced: SCC (Kosaraju/Tarjan), Topological Sort, Bridges & Articulation Points',
    'Graph types: DAG, Bipartite, Weighted/Unweighted',
    'Resources: https://cp-algorithms.com/graph/',
  ]},
  { slug: 'greedy', name: 'Greedy Algorithms', points: [
    'Greedy-choice property & proof idea (exchange argument)',
    'Activity Selection, Fractional Knapsack, Huffman coding',
    'Counterexamples where greedy fails (compare with DP)',
    'Sorting-based / priority-queue based greedy tricks',
    'Resources: https://cp-algorithms.com/greedy/',
  ]},
  { slug: 'trees-lca', name: 'Trees & LCA', points: [
    'Tree traversals, Euler tour',
    'LCA: Binary Lifting, RMQ on Euler tour',
    'Tree DP, Centroid Decomposition, HLD',
    'Subtree vs path queries techniques',
    'Resources: https://cp-algorithms.com/graph/lca.html',
  ]},
  { slug: 'segtree', name: 'Segment Tree / Fenwick Tree', points: [
    'Fenwick (BIT): prefix sums, point updates / range queries',
    'Segment Tree: range query/update, lazy propagation',
    'Merge sort tree, Segment Tree Beats, 2D variants',
    'Resources: https://cp-algorithms.com/data_structures/segment_tree.html',
  ]},
  { slug: 'search', name: 'Binary & Ternary Search', points: [
    'Binary search on arrays & on answer (parametric search)',
    'lower_bound / upper_bound usage & pitfalls',
    'Ternary search for unimodal functions',
    'Resources: https://cp-algorithms.com/num_methods/ternary_search.html',
  ]},
  { slug: 'bitmask', name: 'Bit Manipulation / Bitmask DP', points: [
    'Bit ops (&, |, ^, ~, <<, >>), popcount',
    'Iterating submasks / supersets efficiently',
    'Bitmask DP (TSP, SOS DP)',
    'Resources: https://cp-algorithms.com/algebra/all-submasks.html',
  ]},
  { slug: 'number-theory', name: 'Number Theory', points: [
    'GCD/LCM, Extended Euclid, Modular inverse',
    'Sieve & segmented sieve',
    'Fast exponentiation, CRT, Euler Totient',
    'nCr mod prime with factorial & inverse precompute',
    'Resources: https://cp-algorithms.com/algebra/',
  ]},
  { slug: 'strings', name: 'String Algorithms', points: [
    'Prefix function (KMP), Z-function',
    'Rolling hash / Rabin–Karp',
    'Suffix Array + LCP, Suffix Automaton',
    'Aho–Corasick, Trie, Palindromic Tree',
    'Resources: https://cp-algorithms.com/string/',
  ]},
  { slug: 'geometry', name: 'Computational Geometry', points: [
    'ccw/orientation test, cross & dot product',
    'Line/segment intersection, point in polygon',
    'Convex hull (Graham / Andrew), closest pair',
    'Polygon area via shoelace formula',
    'Resources: https://cp-algorithms.com/geometry/',
  ]},
  { slug: 'flow', name: 'Flow & Matching', points: [
    'Max-Flow: Edmonds–Karp, Dinic',
    'Min-Cost Max-Flow basics',
    'Hopcroft–Karp for bipartite matching',
    'Typical applications (assignment, scheduling)',
    'Resources: https://cp-algorithms.com/graph/edmonds_karp.html',
  ]},
  { slug: 'advanced-ds', name: 'Advanced Data Structures', points: [
    'DSU (with rollback), PBDS / ordered set',
    'Treap/Splay/AVL ideas',
    'Mo’s algorithm (array & tree)',
    'Persistent data structures basics',
    'Resources: https://cp-algorithms.com/data_structures/disjoint_set_union.html',
  ]},
  { slug: 'game-theory', name: 'Game Theory', points: [
    'Impartial vs Partisan games',
    'Grundy numbers / Sprague–Grundy theorem',
    'Nim game & XOR rule',
    'Resources: https://cp-algorithms.com/game_theory/sprague-grundy-nim.html',
  ]},
  { slug: 'probability', name: 'Probability & Expected Value', points: [
    'Linearity of expectation',
    'Probability DP patterns',
    'Randomized algorithms tricks',
    'Resources: https://cp-algorithms.com/dynamic_programming/probability_dp.html',
  ]},
  { slug: 'misc', name: 'Misc / Tricks', points: [
    'Two pointers / Sliding window',
    'Prefix sums / difference array',
    'Meet-in-the-middle',
    'Offline queries, sqrt decomposition, fast I/O',
    'Resources: https://cp-algorithms.com/',
  ]},
];

export default function TopicDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const topic = topics.find(t => t.slug === slug);

  // dark mode sync
  const getInitialMode = () => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return JSON.parse(saved);
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  };
  const [darkMode, setDarkMode] = useState(getInitialMode);
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  if (!topic) {
    return (
      <div className="topic-detail-root">
        <div className="empty-state">
          <h2>Topic not found</h2>
          <Link to="/topics" className="btn-link">Back to all topics</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="topic-detail-root">
      {/* Minimal top bar (reuse your navbar css if you want; this is lighter) */}
      <header className="td-navbar">
        <button className="td-back" onClick={() => navigate(-1)}>← Back</button>
        <span className="td-title">CodeMate</span>
        <button className="td-toggle" onClick={() => setDarkMode(d => !d)}>
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      <main className="topic-detail-page">
        <h1>{topic.name}</h1>

        <ul className="point-list">
          {topic.points.map((p, i) => (
            <li key={i}>
              {p.startsWith('Resources:')
                ? (
                  <>
                    Resources:{' '}
                    <a
                      href={p.replace('Resources: ', '')}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {p.replace('Resources: ', '')}
                    </a>
                  </>
                )
                : p.startsWith('http')
                  ? <a href={p} target="_blank" rel="noopener noreferrer">{p}</a>
                  : p}
            </li>
          ))}
        </ul>

        <div className="detail-actions">
          <Link to="/topics" className="btn-link">← Back to all topics</Link>
        </div>
      </main>
    </div>
  );
}
