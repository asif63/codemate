// src/pages/CPTopics.jsx
import React, { useState } from 'react';
import '../styles/CPTopics.css';

const topics = [
  {
    name: 'Dynamic Programming',
    content: [
      'Top-down & Bottom-up',
      'Memoization techniques',
      'Classic problems: Knapsack, LIS, Coin Change',
      'Resources: https://cp-algorithms.com/dynamic_programming/'
    ]
  },
  {
    name: 'Graphs',
    content: [
      'BFS / DFS',
      'Dijkstra / Bellman-Ford',
      'Union-Find (DSU)',
      'Resources: https://cp-algorithms.com/graph/'
    ]
  },
  {
    name: 'Greedy Algorithms',
    content: [
      'Activity Selection',
      'Fractional Knapsack',
      'Greedy vs DP discussion',
      'Resources: https://cp-algorithms.com/greedy/'
    ]
  },
  // add more topics as needed
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
                    {item.startsWith('http') ? (
                      <a href={item} target="_blank" rel="noopener noreferrer">{item}</a>
                    ) : (
                      item
                    )}
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
