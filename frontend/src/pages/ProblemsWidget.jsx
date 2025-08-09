import React, { useState, useEffect } from 'react';

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [minRating, setMinRating] = useState('');
  const [maxRating, setMaxRating] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProblems = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://codeforces.com/api/problemset.problems');
      const data = await res.json();
      if (data.status === 'OK') {
        setProblems(data.result.problems);
      } else {
        setError('Failed to fetch problems.');
      }
    } catch (err) {
      setError('Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleFilter = () => {
    const min = parseInt(minRating, 10);
    const max = parseInt(maxRating, 10);
    const filtered = problems.filter(
      (prob) =>
        prob.rating &&
        prob.rating >= min &&
        prob.rating <= max &&
        prob.name &&
        prob.contestId &&
        prob.index
    );
    setFilteredProblems(filtered);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-lg mt-8">
      <h2 className="text-2xl font-semibold mb-4">🔍 Filter Codeforces Problems</h2>

      <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
        <input
          type="number"
          placeholder="Min Rating (e.g., 800)"
          className="p-2 border border-gray-300 rounded w-full md:w-1/3"
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Rating (e.g., 1600)"
          className="p-2 border border-gray-300 rounded w-full md:w-1/3"
          value={maxRating}
          onChange={(e) => setMaxRating(e.target.value)}
        />
        <button
          onClick={handleFilter}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading problems...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="mt-4">
        {filteredProblems.length === 0 ? (
          <p className="text-gray-600">No problems found for this rating range.</p>
        ) : (
          <ul className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredProblems.map((prob, index) => (
              <li key={index} className="p-3 border rounded shadow-sm hover:bg-gray-100">
                <a
                  href={`https://codeforces.com/problemset/problem/${prob.contestId}/${prob.index}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  {prob.name}
                </a>
                <p className="text-sm text-gray-600">
                  Rating: {prob.rating} | Index: {prob.index}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Problems;
