const API_BASE_URL = 'http://localhost:3000';

const inputData = document.getElementById('inputData');
const submitBtn = document.getElementById('submitBtn');
const errorBox = document.getElementById('errorBox');
const resultDiv = document.getElementById('result');

function renderHierarchyCard(item, index) {
  return `
    <div class="card">
      <h3>Hierarchy ${index + 1}</h3>
      <p><strong>Root:</strong> ${item.root}</p>
      ${item.has_cycle ? '<p><strong>Cycle:</strong> Yes</p>' : `<p><strong>Depth:</strong> ${item.depth}</p>`}
      <pre>${JSON.stringify(item.tree, null, 2)}</pre>
    </div>
  `;
}

submitBtn.addEventListener('click', async () => {
  errorBox.classList.add('hidden');
  resultDiv.innerHTML = '';

  const data = inputData.value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  try {
    const response = await fetch(`${API_BASE_URL}/bfhl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'API request failed');
    }

    resultDiv.innerHTML = `
      <div class="card">
        <h2>Summary</h2>
        <p><strong>Total Trees:</strong> ${result.summary.total_trees}</p>
        <p><strong>Total Cycles:</strong> ${result.summary.total_cycles}</p>
        <p><strong>Largest Tree Root:</strong> ${result.summary.largest_tree_root}</p>
      </div>

      <div class="card">
        <h2>Invalid Entries</h2>
        <pre>${JSON.stringify(result.invalid_entries, null, 2)}</pre>
      </div>

      <div class="card">
        <h2>Duplicate Edges</h2>
        <pre>${JSON.stringify(result.duplicate_edges, null, 2)}</pre>
      </div>

      ${result.hierarchies.map(renderHierarchyCard).join('')}
    `;
  } catch (error) {
    errorBox.textContent = error.message;
    errorBox.classList.remove('hidden');
  }
});