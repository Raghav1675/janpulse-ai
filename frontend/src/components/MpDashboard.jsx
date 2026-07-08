import React, { useState, useEffect } from 'react';

export default function MpDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://janpulse-backend.onrender.com/api/cluster')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setComplaints(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch:", err);
        setLoading(false);
      });
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    // Optimistically update UI
    setComplaints(prev => prev.map(c => c.cluster_id === id ? { ...c, status: newStatus } : c));

    // Send update to database
    try {
      await fetch('https://janpulse-backend.onrender.com/api/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, newStatus })
      });
    } catch (error) {
      console.error("Failed to update status");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Constituency Live Feed</h2>
      
      {loading ? (
        <p className="text-gray-500 text-center py-10">Loading active grievances...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                <th className="p-4 font-semibold">Issue Category</th>
                <th className="p-4 font-semibold">Location</th>
                <th className="p-4 font-semibold">Urgency</th>
                <th className="p-4 font-semibold">Status Control</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr><td colSpan="4" className="text-center p-8 text-gray-500">No data found in database.</td></tr>
              ) : (
                complaints.map((item) => (
                  <tr key={item.cluster_id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="p-4 font-medium text-gray-800">{item.category}</td>
                    <td className="p-4 text-gray-600">{item.location}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        item.urgency > 75 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {item.urgency} / 100
                      </span>
                    </td>
                    <td className="p-4">
                      <select 
                        value={item.status || "Pending"} 
                        onChange={(e) => handleStatusChange(item.cluster_id, e.target.value)}
                        className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2"
                      >
                        <option value="Pending">🔴 Pending</option>
                        <option value="In Progress">🟡 In Progress</option>
                        <option value="Resolved">🟢 Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}