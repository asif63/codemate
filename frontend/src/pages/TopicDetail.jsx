import React from 'react';
import { useParams } from 'react-router-dom';

const topicData = {
  dp: {
    name: "Dynamic Programming",
    description: [
      "Top-down & Bottom-up",
      "Memoization techniques",
      "Classic problems: Knapsack, LIS, Coin Change",
      "Resources: https://cp-algorithms.com/dynamic_programming/"
    ]
  },
  graphs: {
    name: "Graphs",
    description: [
      "BFS / DFS",
      "Dijkstra / Bellman-Ford",
      "Union-Find (DSU)",
      "Resources: https://cp-algorithms.com/graph/"
    ]
  },
  greedy: {
    name: "Greedy Algorithms",
    description: [
      "Activity Selection",
      "Fractional Knapsack",
      "Greedy vs DP discussion",
      "Resources: https://cp-algorithms.com/greedy/"
    ]
  }
};

export default function TopicDetail() {
  const { slug } = useParams();
  const topic = topicData[slug];

  if (!topic) return <h2>Topic not found</h2>;

  return (
    <div className="topic-detail">
      <h1>{topic.name}</h1>
      <ul>
        {topic.description.map((item, index) => (
          <li key={index}>
            {item.startsWith('http') ? (
              <a href={item} target="_blank" rel="noreferrer">{item}</a>
            ) : (
              item
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
