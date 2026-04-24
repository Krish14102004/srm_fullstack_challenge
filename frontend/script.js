const API_BASE_URL = 'http://localhost:3000';

const inputData = document.getElementById('inputData');
const submitBtn = document.getElementById('submitBtn');
const clearBtn = document.getElementById('clearBtn');
const sampleBtn = document.getElementById('sampleBtn');
const errorBox = document.getElementById('errorBox');
const resultDiv = document.getElementById('result');

const sampleInput = `A->B
A->C
B->D
C->E
E->F
X->Y
Y->Z
Z->X
P->Q
Q->R
G->H
G->H
G->I
hello
1->2
A->`;

function parseInput(text) {
  const trimmed = text.trim();

  if (!trimmed) {
    throw new Error('Please enter some input.');
  }

  if (trimmed.startsWith('{')) {
    let parsed;
    try {
      parsed = JSON.parse(trimmed);
    } catch (error) {
      throw new Error('Invalid JSON format.');
    }

    if (!Array.isArray(parsed.data)) {
      throw new Error('JSON input must contain a data array.');
    }

    return parsed.data.map(item => String(item).trim());
  }

  return trimmed
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
}

function renderHierarchyCard(item, index) {
  const badgeClass = item.has_cycle ? 'cycle' : 'tree';
  const badgeText = item.has_cycle ? 'Cycle Detected' : 'Valid Tree';

  return `
    <div class="card">
      <span class="badge ${badgeClass}">${badgeText}</span>
      <h3>Hierarchy ${index + 1}</h3>
      <p><strong>Root:</strong> ${item.root}</p>
      ${item.has_cycle ? '' : `<p><strong>Depth:</strong> ${item.depth}</p>`}
      <h4>Tree</h4>
      <pre>${JSON.stringify(item.tree, null, 2)}</pre>
    </div>
  `;
}

function renderResult(result) {
  resultDiv.innerHTML = `
    <div class="summary-grid">
      <div class="summary-card">
        <div class="label">Total Trees</div>
        <div class="stat">${result.summary.total_trees}</div>
      </div>
      <div class="summary-card">
        <div class="label">Total Cycles</div>
        <div class="stat">${result.summary.total_cycles}</div>
      </div>
      <div class="summary-card">
        <div class="label">Largest Tree Root</div>
        <div class="stat">${result.summary.largest_tree_root || '-'}</div>
      </div>
    </div>

    <div class="meta-grid">
      <div class="card">
        <h3>Invalid Entries</h3>
        <pre>${JSON.stringify(result.invalid_entries, null, 2)}</pre>
      </div>
      <div class="card">
        <h3>Duplicate Edges</h3>
        <pre>${JSON.stringify(result.duplicate_edges, null, 2)}</pre>
      </div>
    </div>

    <div class="card">
      <h3>Identity</h3>
      <p><strong>User ID:</strong> ${result.user_id}</p>
      <p><strong>Email:</strong> ${result.email_id}</p>
      <p><strong>College Roll Number:</strong> ${result.college_roll_number}</p>
    </div>

    <div class="hierarchy-list">
      ${result.hierarchies.map(renderHierarchyCard).join('')}
    </div>
  `;
}

async function submitData() {
  errorBox.classList.add('hidden');
  resultDiv.innerHTML = '<div class="empty-state">Processing...</div>';

  try {
    const data = parseInput(inputData.value);

    const response = await fetch(`${API_BASE_URL}/bfhl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'API request failed.');
    }

    renderResult(result);
  } catch (error) {
    resultDiv.innerHTML = '<div class="empty-state">Submit some input to see the structured API response here.</div>';
    errorBox.textContent = error.message;
    errorBox.classList.remove('hidden');
  }
}

submitBtn.addEventListener('click', submitData);

clearBtn.addEventListener('click', () => {
  inputData.value = '';
  errorBox.classList.add('hidden');
  resultDiv.innerHTML = '<div class="empty-state">Submit some input to see the structured API response here.</div>';
});

sampleBtn.addEventListener('click', () => {
  inputData.value = sampleInput;
  errorBox.classList.add('hidden');
});

inputData.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    submitData();
  }
});