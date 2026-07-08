import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';

export default function CitizenPortal() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [contactAgreed, setContactAgreed] = useState(false);
  
  // Clerk hook to get current user data
  const { isSignedIn, user } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch('https://janpulse-backend.onrender.com/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          contactAgreed: contactAgreed,
          phone: contactAgreed && user ? user.primaryEmailAddress?.emailAddress : null // Using email temporarily if phone isn't set
        })
      });
      alert('Grievance submitted successfully!');
      setText('');
      setContactAgreed(false);
    } catch (err) {
      alert('Failed to submit. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Submit a Grievance</h2>
      <p className="text-gray-500 mb-6">Describe the issues in your local area. Our AI will categorize and route them.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          rows="5"
          placeholder="e.g., Ward 7 has massive water drainage leaks and the streetlights are broken..."
          required
        />

        {/* Only show privacy toggle if they are logged in */}
        {isSignedIn && (
          <div className="flex items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
            <input 
              type="checkbox" 
              id="privacy-toggle" 
              checked={contactAgreed}
              onChange={(e) => setContactAgreed(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="privacy-toggle" className="ml-3 text-sm text-blue-900 font-medium">
              I consent to share my contact details with local officials for follow-up updates regarding this issue.
            </label>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:bg-blue-300"
        >
          {loading ? 'Processing via Gemini AI...' : 'Submit to Administration'}
        </button>
      </form>
    </div>
  );
}