// src/pages/TopicDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../styles/TopicDetail.css';

// Keep slugs in sync with routes (/topics/:slug)
const topics = [
  {
    slug: 'dp',
    name: 'Dynamic Programming',
    points: [
      'Top-down & Bottom-up (Memoization vs Tabulation)',
      'Define states, transitions, base cases clearly',
      'Classic problems: 0/1 & Unbounded Knapsack, LIS/LCS, Coin Change, Edit Distance',
      'Optimizations: Bitset DP, Divide & Conquer DP, Knuth Optimization, DP on Trees',
      'Practice sets: Codeforces EDU DP, AtCoder DP contest',
      'CP-Algorithms: https://cp-algorithms.com/dynamic_programming/',
      'GFG (overview): https://www.geeksforgeeks.org/dynamic-programming/',
      'AtCoder DP contest: https://atcoder.jp/contests/dp',
      'Errichto DP playlist (YT): https://www.youtube.com/playlist?list=PLl0KD3g-oDOHpWRyg7Q9ld9oCNr8LGQk_',
      'takeUforward DP playlist (YT): https://www.youtube.com/playlist?list=PLgUwDviBIf0rVwua0kKYlsS_S5B8Z0a9M'
    ],
  },
  {
    slug: 'graphs',
    name: 'Graphs',
    points: [
      'Traversals: BFS / DFS (iterative & recursive)',
      'Shortest paths: Dijkstra, Bellman-Ford, SPFA, Floyd–Warshall',
      'MST: Kruskal (DSU), Prim',
      'Advanced: SCC (Kosaraju/Tarjan), Topological Sort, Bridges & Articulation Points',
      'Graph types: DAG, Bipartite, Weighted/Unweighted',
      'CP-Algorithms (graphs): https://cp-algorithms.com/graph/',
      'GFG (graph): https://www.geeksforgeeks.org/graph-data-structure-and-algorithms/',
      'William Fiset Graphs playlist (YT): https://www.youtube.com/playlist?list=PLzMcBGfZo4-msAOkJ8wXSuyAgLv_mSeI7',
      'Tushar Roy Graphs (YT): https://www.youtube.com/playlist?list=PLrmLmBdmIlpu2f2g8ltqaaCZiq6GJvl1j'
    ],
  },
  {
    slug: 'greedy',
    name: 'Greedy Algorithms',
    points: [
      'Greedy-choice property & proof idea (exchange argument)',
      'Activity Selection, Fractional Knapsack, Huffman coding',
      'Counterexamples where greedy fails (compare with DP)',
      'Sorting-based / priority-queue based tricks',
      'CP-Algorithms (greedy): https://cp-algorithms.com/greedy/',
      'GFG (greedy): https://www.geeksforgeeks.org/greedy-algorithms/'
    ],
  },
  {
    slug: 'trees-lca',
    name: 'Trees & LCA',
    points: [
      'Tree traversals, Euler tour',
      'LCA: Binary Lifting, RMQ on Euler tour',
      'Tree DP, Centroid Decomposition, HLD',
      'Subtree vs path queries techniques',
      'CP-Algorithms (LCA): https://cp-algorithms.com/graph/lca.html',
      'GFG (LCA): https://www.geeksforgeeks.org/lowest-common-ancestor-in-a-binary-tree/',
      'USACO Guide (LCA / Trees): https://usaco.guide/plat/lca?lang=cpp'
    ],
  },
  {
    slug: 'segtree',
    name: 'Segment Tree / Fenwick Tree',
    points: [
      'Fenwick (BIT): prefix sums, point updates / range queries',
      'Segment Tree: range query/update, lazy propagation',
      'Merge sort tree, Segment Tree Beats, 2D variants',
      'CP-Algorithms (SegTree): https://cp-algorithms.com/data_structures/segment_tree.html',
      'GFG (SegTree): https://www.geeksforgeeks.org/segment-tree-data-structure/',
      'GFG (Fenwick/BIT): https://www.geeksforgeeks.org/binary-indexed-tree-or-fenwick-tree-2/',
      'Tushar Roy – Segment Tree intro (YT): https://www.youtube.com/watch?v=ZBHKZF5w4YU',
      'William Fiset – Fenwick Tree (YT): https://www.youtube.com/watch?v=CWDQJGaN1gY'
    ],
  },
  {
    slug: 'search',
    name: 'Binary & Ternary Search',
    points: [
      'Binary search on arrays & on answer (parametric search)',
      'lower_bound / upper_bound usage & pitfalls',
      'Ternary search for unimodal functions',
      'CP-Algorithms (binary): https://cp-algorithms.com/num_methods/binary_search.html',
      'CP-Algorithms (ternary): https://cp-algorithms.com/num_methods/ternary_search.html',
      'GFG (binary search): https://www.geeksforgeeks.org/binary-search/'
    ],
  },
  {
    slug: 'bitmask',
    name: 'Bit Manipulation / Bitmask DP',
    points: [
      'Bit ops (&, |, ^, ~, <<, >>), popcount',
      'Iterating submasks / supersets efficiently',
      'Bitmask DP (TSP, SOS DP)',
      'CP-Algorithms (submasks): https://cp-algorithms.com/algebra/all-submasks.html',
      'GFG (bitmasking): https://www.geeksforgeeks.org/bitmasking-and-dynamic-programming/'
    ],
  },
  {
    slug: 'number-theory',
    name: 'Number Theory',
    points: [
      'GCD/LCM, Extended Euclid, Modular inverse',
      'Sieve & segmented sieve',
      'Fast exponentiation, CRT, Euler Totient',
      'nCr mod prime with factorial & inverse precompute',
      'CP-Algorithms (algebra/nt): https://cp-algorithms.com/algebra/',
      'GFG (number theory): https://www.geeksforgeeks.org/number-theory-competitive-programming/'
    ],
  },
  {
    slug: 'strings',
    name: 'String Algorithms',
    points: [
      'Prefix function (KMP), Z-function',
      'Rolling hash / Rabin–Karp',
      'Suffix Array + LCP, Suffix Automaton',
      'Aho–Corasick, Trie, Palindromic Tree',
      'CP-Algorithms (strings): https://cp-algorithms.com/string/',
      'GFG (strings hub): https://www.geeksforgeeks.org/strings-data-structure/'
    ],
  },
  {
    slug: 'geometry',
    name: 'Computational Geometry',
    points: [
      'ccw/orientation test, cross & dot product',
      'Line/segment intersection, point in polygon',
      'Convex hull (Graham / Andrew), closest pair',
      'Polygon area via shoelace formula',
      'CP-Algorithms (geometry): https://cp-algorithms.com/geometry/',
      'GFG (geometry): https://www.geeksforgeeks.org/computational-geometry/'
    ],
  },
  {
    slug: 'flow',
    name: 'Flow & Matching',
    points: [
      'Max-Flow: Edmonds–Karp, Dinic',
      'Min-Cost Max-Flow basics',
      'Hopcroft–Karp for bipartite matching',
      'Typical applications (assignment, scheduling)',
      'CP-Algorithms (Edmonds–Karp): https://cp-algorithms.com/graph/edmonds_karp.html',
      'GFG (max flow): https://www.geeksforgeeks.org/max-flow-problem-introduction/'
    ],
  },
  {
    slug: 'advanced-ds',
    name: 'Advanced Data Structures',
    points: [
      'DSU (with rollback), PBDS / ordered set',
      'Treap/Splay/AVL ideas',
      'Mo’s algorithm (array & tree)',
      'Persistent data structures basics',
      'CP-Algorithms (DSU): https://cp-algorithms.com/data_structures/disjoint_set_union.html',
      'USACO Guide (PBDS): https://usaco.guide/adv/pbds?lang=cpp',
      'GFG (Mo’s algorithm): https://www.geeksforgeeks.org/mos-algorithm-query-square-root-decomposition-set-1-introduction/'
    ],
  },
  {
    slug: 'game-theory',
    name: 'Game Theory',
    points: [
      'Impartial vs Partisan games',
      'Grundy numbers / Sprague–Grundy theorem',
      'Nim game & XOR rule',
      'CP-Algorithms (SG/Nim): https://cp-algorithms.com/game_theory/sprague-grundy-nim.html',
      'GFG (game theory): https://www.geeksforgeeks.org/game-theory/'
    ],
  },
  {
    slug: 'probability',
    name: 'Probability & Expected Value',
    points: [
      'Linearity of expectation',
      'Probability DP patterns',
      'Randomized algorithms tricks',
      'CP-Algorithms (probability DP): https://cp-algorithms.com/dynamic_programming/probability_dp.html',
      'GFG (probability basics): https://www.geeksforgeeks.org/probability-and-statistics/'
    ],
  },
  {
    slug: 'misc',
    name: 'Misc / Tricks',
    points: [
      'Two pointers / Sliding window',
      'Prefix sums / difference array',
      'Meet-in-the-middle',
      'Offline queries, sqrt decomposition, fast I/O',
      'CP-Algorithms (index): https://cp-algorithms.com/',
      'USACO Guide: https://usaco.guide/',
      'NeetCode patterns: https://neetcode.io/practice',
      'William Lin (YT): https://www.youtube.com/c/tmwilliamlin168',
      'Errichto (YT): https://www.youtube.com/c/Errichto',
      'Tushar Roy (YT): https://www.youtube.com/c/TusharRoy44',
      'MyCodeSchool DS playlist (YT): https://www.youtube.com/playlist?list=PL2_aWCzGMAwLL-mEB4ef20f3iqWMGWa25'
    ],
  },
];

export default function TopicDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const topic = topics.find((t) => t.slug === slug);

  // dark mode sync with site
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

  // Label + URL renderer (same idea as CPTopics)
  const renderPoint = (text) => {
    if (text.startsWith('Resources:')) {
      const url = text.replace('Resources: ', '').trim();
      return (
        <>
          Resources:{' '}
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url}
          </a>
        </>
      );
    }
    const i = text.indexOf('http');
    if (i !== -1) {
      const label = text.slice(0, i).trim().replace(/[:\-–]+$/, '');
      const url = text.slice(i).trim();
      return (
        <>
          {label ? <strong>{label}:</strong> : null}{' '}
          <a href={url} target="_blank" rel="noopener noreferrer">
            {url}
          </a>
        </>
      );
    }
    return text;
  };

  if (!topic) {
    return (
      <div className="topic-detail-root">
        <div className="empty-state">
          <h2>Topic not found</h2>
          <Link to="/topics" className="btn-link">
            Back to all topics
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="topic-detail-root">
      <header className="td-navbar">
        <button className="td-back" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <span className="td-title">CodeMate</span>
        <button className="td-toggle" onClick={() => setDarkMode((d) => !d)}>
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      <main className="topic-detail-page">
        <h1>{topic.name}</h1>

        <ul className="point-list">
          {topic.points.map((p, i) => (
            <li key={i}>{renderPoint(p)}</li>
          ))}
        </ul>

        <div className="detail-actions">
          <Link to="/topics" className="btn-link">
            ← Back to all topics
          </Link>
        </div>
      </main>
    </div>
  );
}
