import React, { useState, useEffect } from 'react';

export default function MpDashboard() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mocked sample pipeline payload to test the Python ML connection
  const mockRawGrievances = [
    { id: 1, text: "water pipeline broken in village near lake", category: "Water Supply", location: "Village Alpha", urgency: 80 },
    { id: 2, text: "leaking water line near natural lake", category: "Water Supply", location: "Village Alpha", urgency: 75 },
    { id: 3, text: "potholes on the primary main road stretch", category: "Roads & Transport", location: "Sector 2", urgency: 45 }
  ];

useEffect(() => {
    fetch('https://janpulse-backend.onrender.com/api/cluster', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grievances: mockRawGrievances })
    })
      .then(res => res.json())
      .then(data => {
        // CHANGED: Safety check to prevent React from crashing
        if (Array.isArray(data)) {
          setClusters(data);
        } else {
          console.error("Backend sent an error:", data);
          setClusters([]); 
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch failed:", err);
        setClusters([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">JanPulse AI Admin Platform</h1>
        <p className="text-gray-600">Parliamentary Constituency Analysis & Resolution Workspace</p>
      </header>

      {loading ? (
        <p className="text-gray-500 font-medium">Computing AI Clusters via Python Engine...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Primary Target Issue</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Domain</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reports Grouped</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Max Urgency Score</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-sm text-gray-700">
              {clusters.map((cluster) => (
                <tr key={cluster.cluster_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{cluster.text}</td>
                  <td className="px-6 py-4">{cluster.category}</td>
                  <td className="px-6 py-4">{cluster.location}</td>
                  <td className="px-6 py-4 text-center font-semibold text-blue-600">{cluster.complaint_count}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${cluster.urgency >= 75 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {cluster.urgency}/100
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}