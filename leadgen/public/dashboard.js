const state = {
  leads: [],
  selectedId: null,
  token: window.localStorage.getItem("leadgen_token") || "",
};

const elements = {
  leadList: document.getElementById("leadList"),
  leadDetail: document.getElementById("leadDetail"),
  leadCount: document.getElementById("leadCount"),
  pipelineCount: document.getElementById("pipelineCount"),
  optInCount: document.getElementById("optInCount"),
  refresh: document.getElementById("refresh"),
  search: document.getElementById("search"),
  statusFilter: document.getElementById("statusFilter"),
  consentFilter: document.getElementById("consentFilter"),
  csvInput: document.getElementById("csvInput"),
  importCsv: document.getElementById("importCsv"),
  region: document.getElementById("region"),
  keywords: document.getElementById("keywords"),
  runCollector: document.getElementById("runCollector"),
  loginModal: document.getElementById("loginModal"),
  tokenInput: document.getElementById("tokenInput"),
  saveToken: document.getElementById("saveToken"),
  logout: document.getElementById("logout"),
};

function authHeaders() {
  return state.token ? { "x-leadgen-token": state.token } : {};
}

function showLogin() {
  elements.loginModal.classList.add("active");
}

function hideLogin() {
  elements.loginModal.classList.remove("active");
}

async function fetchLeads() {
  const response = await fetch("/api/leads", {
    headers: { ...authHeaders() },
  });
  if (response.status === 401) {
    showLogin();
    return;
  }
  const data = await response.json();
  state.leads = data.leads || [];
  renderLeads();
}

function getFilteredLeads() {
  const search = elements.search.value.toLowerCase();
  const status = elements.statusFilter.value;
  const consent = elements.consentFilter.value;
  return state.leads.filter((lead) => {
    const matchesSearch =
      !search ||
      lead.company.toLowerCase().includes(search) ||
      lead.email.toLowerCase().includes(search) ||
      lead.name.toLowerCase().includes(search);
    const matchesStatus = !status || lead.status === status;
    const matchesConsent = !consent || lead.consent === consent;
    return matchesSearch && matchesStatus && matchesConsent;
  });
}

function renderLeads() {
  const leads = getFilteredLeads();
  elements.leadList.innerHTML = "";
  leads.forEach((lead) => {
    const card = document.createElement("div");
    card.className = `lead-card ${lead.id === state.selectedId ? "active" : ""}`;
    card.innerHTML = `
      <div><strong>${lead.company || lead.name}</strong></div>
      <div class="lead-meta">${lead.email || "No email"} • ${lead.status}</div>
      <div class="lead-meta">${lead.source} • score ${lead.score}</div>
    `;
    card.onclick = () => {
      state.selectedId = lead.id;
      renderLeads();
      renderDetail(lead);
    };
    elements.leadList.appendChild(card);
  });

  const contacted = state.leads.filter((lead) => lead.status === "contacted").length;
  const optIn = state.leads.filter((lead) => lead.consent === "opt-in").length;
  elements.leadCount.textContent = `${state.leads.length} leads`;
  elements.pipelineCount.textContent = `${contacted} contacted`;
  elements.optInCount.textContent = `${optIn} opt-in`;
}

function renderDetail(lead) {
  elements.leadDetail.innerHTML = `
    <div class="stack">
      <div class="grid-2">
        <div>
          <label>Name</label>
          <input id="detailName" value="${lead.name || ""}" />
        </div>
        <div>
          <label>Company</label>
          <input id="detailCompany" value="${lead.company || ""}" />
        </div>
      </div>
      <div class="grid-2">
        <div>
          <label>Email</label>
          <input id="detailEmail" value="${lead.email || ""}" />
        </div>
        <div>
          <label>Phone</label>
          <input id="detailPhone" value="${lead.phone || ""}" />
        </div>
      </div>
      <div class="grid-2">
        <div>
          <label>Status</label>
          <select id="detailStatus">
            ${["new", "researched", "contacted", "replied", "booked", "not_interested"]
              .map(
                (status) =>
                  `<option value="${status}" ${lead.status === status ? "selected" : ""}>${status}</option>`
              )
              .join("")}
          </select>
        </div>
        <div>
          <label>Consent</label>
          <select id="detailConsent">
            ${["opt-in", "unknown", "opt-out"]
              .map(
                (status) =>
                  `<option value="${status}" ${lead.consent === status ? "selected" : ""}>${status}</option>`
              )
              .join("")}
          </select>
        </div>
      </div>
      <div class="grid-2">
        <div>
          <label>Industry</label>
          <input id="detailIndustry" value="${lead.industry || ""}" />
        </div>
        <div>
          <label>Location</label>
          <input id="detailLocation" value="${lead.location || ""}" />
        </div>
      </div>
      <div>
        <label>Notes</label>
        <textarea id="detailNotes">${lead.notes || ""}</textarea>
      </div>
      <button id="saveLead">Save lead</button>
      <hr style="border-color: rgba(255,255,255,0.08);" />
      <div>
        <label>Email Subject</label>
        <input id="emailSubject" value="Quick growth idea for ${lead.company || lead.name}" />
      </div>
      <div>
        <label>Email Body</label>
        <textarea id="emailBody">Hi ${lead.name || "there"},\n\nI noticed ${lead.company || "your business"} could capture more local leads with a few focused changes. I put together a quick outline — happy to send it or hop on a short call.\n\nWould you like the summary?\n\n— Carolina Growth</textarea>
      </div>
      <button id="sendEmail">Send email (opt-in only)</button>
    </div>
  `;

  document.getElementById("saveLead").onclick = () => saveLead(lead.id);
  document.getElementById("sendEmail").onclick = () => sendEmail(lead.id);
}

async function saveLead(id) {
  const payload = {
    status: document.getElementById("detailStatus").value,
    consent: document.getElementById("detailConsent").value,
    industry: document.getElementById("detailIndustry").value,
    location: document.getElementById("detailLocation").value,
    notes: document.getElementById("detailNotes").value,
  };
  await fetch(`/api/leads/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  await fetchLeads();
}

async function sendEmail(id) {
  const payload = {
    subject: document.getElementById("emailSubject").value,
    body: document.getElementById("emailBody").value,
  };
  const response = await fetch(`/api/leads/${id}/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    alert(data.error || "Failed to send email.");
    return;
  }
  alert("Email sent.");
  await fetchLeads();
}

elements.refresh.onclick = fetchLeads;
elements.search.oninput = renderLeads;
elements.statusFilter.onchange = renderLeads;
elements.consentFilter.onchange = renderLeads;

elements.importCsv.onclick = async () => {
  const csv = elements.csvInput.value.trim();
  if (!csv) {
    alert("Paste CSV data first.");
    return;
  }
  const response = await fetch("/api/leads/import", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ csv }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    alert(data.error || "Import failed.");
    return;
  }
  elements.csvInput.value = "";
  await fetchLeads();
};

elements.runCollector.onclick = async () => {
  const region = elements.region.value || "";
  const keywords = elements.keywords.value || "";
  const response = await fetch("/api/collect", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ region, keywords }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    alert(data.error || "Collector failed.");
    return;
  }
  const data = await response.json().catch(() => ({}));
  alert(`Collected ${data.collected || 0} leads.`);
  await fetchLeads();
};

elements.saveToken.onclick = () => {
  const token = elements.tokenInput.value.trim();
  if (!token) {
    return;
  }
  state.token = token;
  window.localStorage.setItem("leadgen_token", token);
  hideLogin();
  fetchLeads();
};

elements.logout.onclick = () => {
  state.token = "";
  window.localStorage.removeItem("leadgen_token");
  showLogin();
};

if (!state.token) {
  showLogin();
} else {
  fetchLeads();
}
