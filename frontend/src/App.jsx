import React, { useState } from 'react';
import './App.css';

function App() {
  const [inputData, setInputData] = useState('A->B\nB->C\nC->D');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSampleData = () => {
    setInputData('A->B\nB->C\nA->D\nC->A\nX->Y\nY->Z\nX->Y\nhello\n1->2');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResponse(null);
    setLoading(true);

    try {
      const edges = inputData
        .split(/[,\n]/) // split by comma or newline
        .map(s => s.trim())
        .filter(s => s !== '');

      const res = await fetch('http://localhost:8080/bfhl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: edges }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const json = await res.json();
      setResponse(json);
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Node Graph Processor REST Client</h1>
        <p>Analyze hierarchical relationships, cycles, and trees.</p>
      </header>

      <div className="main-content">
        <section className="input-section card">
          <h2>Input Edges</h2>
          <p className="subtitle">Enter edges format `A-&gt;B` (one per line or comma-separated).</p>
          <form onSubmit={handleSubmit}>
            <textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="e.g. A->B&#10;B->C"
              rows={8}
            />
            <div className="button-group">
              <button type="button" className="btn-secondary" onClick={loadSampleData}>Load Sample Data</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Processing...' : 'Process'}
              </button>
            </div>
          </form>
          {error && <div className="error-banner">{error}</div>}
        </section>

        {response && (
          <section className="results-section">
            <div className="card summary-card">
              <h2>Analytics Summary</h2>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="label">Total Trees</span>
                  <span className="value text-green">{response.summary?.total_trees}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Total Cycles</span>
                  <span className="value text-warning">{response.summary?.total_cycles}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Largest Root</span>
                  <span className="value">{response.summary?.largest_tree_root || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="layouts-grid">
              <div className="card bg-green-light">
                <h3>Hierarchies & Trees (Valid)</h3>
                {response.hierarchies?.filter(h => !h.has_cycle).length > 0 ? (
                  <pre className="json-viewer">{JSON.stringify(response.hierarchies.filter(h => !h.has_cycle), null, 2)}</pre>
                ) : (
                  <p className="empty-text">No valid trees found.</p>
                )}
              </div>

              <div className="card bg-warning-light">
                <h3>Cycles Detected</h3>
                {response.hierarchies?.filter(h => h.has_cycle).length > 0 ? (
                  <pre className="json-viewer text-warning">{JSON.stringify(response.hierarchies.filter(h => h.has_cycle), null, 2)}</pre>
                ) : (
                  <p className="empty-text">No cycles detected.</p>
                )}
              </div>

              <div className="card bg-red-light">
                <h3>Invalid Entries</h3>
                {response.invalid_entries?.length > 0 ? (
                  <ul className="list invalid-list">
                    {response.invalid_entries.map((entry, idx) => (
                      <li key={idx}><code>{entry}</code></li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-text">No invalid entries.</p>
                )}
              </div>

              <div className="card">
                <h3>Duplicate Edges</h3>
                {response.duplicate_edges?.length > 0 ? (
                  <ul className="list duplicate-list text-warning">
                    {response.duplicate_edges.map((entry, idx) => (
                      <li key={idx}><code>{entry}</code></li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-text">No duplicate edges.</p>
                )}
              </div>
            </div>
            
            <div className="card raw-response">
                <h3>Raw API Response Metadata</h3>
                <div className="meta-details">
                  <p><strong>User ID:</strong> {response.user_id}</p>
                  <p><strong>Email:</strong> {response.email_id}</p>
                  <p><strong>Roll No:</strong> {response.college_roll_number}</p>
                </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default App;
