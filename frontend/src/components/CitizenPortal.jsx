import React, { useState } from 'react';

export default function CitizenPortal() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Processing with Gemini Engine...');
    
    try {
      const response = await fetch('http://localhost:5000/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const resData = await response.json();
      if (resData.success) {
        setStatus(`Successfully categorized as: ${resData.data.category} (Urgency: ${resData.data.urgency_score}/100)`);
      } else {
        setStatus('Submission processing error.');
      }
    } catch {
      setStatus('Could not reach backend service. Ensure port 5000 is running.');
    }
  };

  return (
    <div className="max-w-xl mx-auto my-10 p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">JanPulse Citizen Portal</h2>
      <p className="text-sm text-gray-500 mb-6">Submit your local issue in any language. Our AI will group, map, and flag it directly for parliamentary review.</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Describe the Problem</label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="4"
            placeholder="e.g., Ward 7 has regular water drainage leaks blocking the access road to public high school..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors">
          Submit Grievance
        </button>
      </form>
      {status && <div className="mt-4 p-3 bg-gray-50 border-l-4 border-blue-500 text-sm text-gray-700">{status}</div>}
    </div>
  );
}