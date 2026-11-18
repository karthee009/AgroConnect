import { useCallback, useEffect, useMemo, useState } from "react";
import { FaSeedling, FaWallet, FaCalculator, FaFileAlt, FaCloudSun, FaExternalLinkAlt, FaTrash, FaUpload, FaSyncAlt } from "react-icons/fa";
import { getAllFarmers } from "../services/FarmerService";
import { getAllLoans } from "../services/LoanService";
import { addFarmTransaction, checkLoanAffordability, deleteFarmTransaction, downloadLoanDocument, getEligibilityChecklist, getFarmFinance, getLoanDocuments, getLoanHistory, getMarketPrices, getSchemes, uploadLoanDocument } from "../services/AgroToolsService";
import "./FarmTools.css";

const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
const errorMessage = (error) => typeof error?.response?.data === "string" ? error.response.data : error?.response?.status === 401 ? "Session expired or not logged in. Please log in again." : error?.response?.status === 403 ? "You do not have permission to view this information." : "Could not complete this request. Check that the backend is running and try again.";

export default function FarmTools() {
  const [farmers, setFarmers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [farmerId, setFarmerId] = useState("");
  const [loanId, setLoanId] = useState("");
  const [prices, setPrices] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [finance, setFinance] = useState({ transactions: [], totalIncome: 0, totalExpenses: 0, profitOrLoss: 0 });
  const [history, setHistory] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [checklist, setChecklist] = useState([]);
  const [estimate, setEstimate] = useState(null);
  const [transaction, setTransaction] = useState({ type: "INCOME", category: "Crop sale", cropType: "", amount: "", transactionDate: new Date().toISOString().slice(0, 10), notes: "" });
  const [eligibility, setEligibility] = useState({ monthlyIncome: "", monthlyExpenses: "", existingMonthlyDebt: "", requestedAmount: "" });
  const [marketCrop, setMarketCrop] = useState("ALL");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedFarmer = useMemo(() => farmers.find((farmer) => String(farmer.id) === String(farmerId)), [farmers, farmerId]);

  const loadFinance = useCallback(async () => {
    if (!farmerId) return;
    try { const response = await getFarmFinance(farmerId); setFinance(response.data); }
    catch (e) { setError(errorMessage(e)); }
  }, [farmerId]);

  const loadLoanExtras = useCallback(async () => {
    if (!loanId) { setHistory([]); setDocuments([]); return; }
    try {
      const [historyResponse, documentsResponse] = await Promise.all([getLoanHistory(loanId), getLoanDocuments(loanId)]);
      setHistory(Array.isArray(historyResponse.data) ? historyResponse.data : []);
      setDocuments(Array.isArray(documentsResponse.data) ? documentsResponse.data : []);
    } catch (e) { setError(errorMessage(e)); }
  }, [loanId]);

  const loadEverything = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [farmerResponse, loanResponse, priceResponse, schemeResponse, checklistResponse] = await Promise.all([getAllFarmers(), getAllLoans(), getMarketPrices(), getSchemes(), getEligibilityChecklist()]);
      const farmerRows = Array.isArray(farmerResponse.data) ? farmerResponse.data : [];
      const loanRows = Array.isArray(loanResponse.data) ? loanResponse.data : [];
      setFarmers(farmerRows); setLoans(loanRows);
      setPrices(priceResponse.data?.prices || []); setSchemes(schemeResponse.data?.schemes || []); setChecklist(checklistResponse.data?.items || []);
      if (farmerRows.length) setFarmerId((old) => old || String(farmerRows[0].id));
      if (loanRows.length) setLoanId((old) => old || String(loanRows[0].loanId ?? loanRows[0].id));
    } catch (e) { setError(errorMessage(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadEverything(); }, [loadEverything]);
  useEffect(() => { loadFinance(); }, [loadFinance]);
  useEffect(() => { loadLoanExtras(); }, [loadLoanExtras]);

  const submitTransaction = async (event) => {
    event.preventDefault(); if (!farmerId) { setError("Add a farmer profile first to use the finance tracker."); return; }
    setBusy(true); setError(""); setMessage("");
    try { await addFarmTransaction(farmerId, { ...transaction, amount: Number(transaction.amount) }); setMessage("Transaction added successfully."); setTransaction((v) => ({ ...v, amount: "", notes: "" })); await loadFinance(); }
    catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  };

  const removeTransaction = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    try { await deleteFarmTransaction(id); setMessage("Transaction deleted."); await loadFinance(); }
    catch (e) { setError(errorMessage(e)); }
  };

  const submitEligibility = async (event) => {
    event.preventDefault(); if (!farmerId) { setError("Choose a farmer first."); return; }
    setBusy(true); setError(""); setMessage("");
    try { const response = await checkLoanAffordability(farmerId, Object.fromEntries(Object.entries(eligibility).map(([key, value]) => [key, Number(value)]))); setEstimate(response.data); }
    catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  };

  const submitDocument = async (event) => {
    event.preventDefault(); const formElement = event.currentTarget; const file = formElement.elements.document.files[0];
    if (!loanId || !file) { setError("Select a loan and a document first."); return; }
    setBusy(true); setError(""); setMessage("");
    try { await uploadLoanDocument(loanId, file); setMessage("Document uploaded successfully."); formElement.reset(); await loadLoanExtras(); }
    catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  };

  const downloadDocument = async (doc) => {
    try { const response = await downloadLoanDocument(doc.id); const url = URL.createObjectURL(response.data); const link = document.createElement("a"); link.href = url; link.download = doc.originalFilename || "loan-document"; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url); }
    catch (e) { setError(errorMessage(e)); }
  };

  const visiblePrices = prices.filter((row) => marketCrop === "ALL" || row.crop === marketCrop);
  const farmerName = selectedFarmer?.name || selectedFarmer?.farmerName || `Farmer ${farmerId}`;

  return <main className="farm-tools-page">
    <section className="tools-hero">
      <div className="tools-hero-copy"><span className="tools-eyebrow"><FaSeedling /> YOUR FARM, YOUR FINANCES</span><h1>Farm tools that help you <em>grow.</em></h1><p>Track farm income, estimate loan affordability, manage loan documents and explore agriculture schemes in one workspace.</p><div className="tools-hero-meta"><span>🌾 Practical farm management</span><span>🔒 Session-protected tools</span></div></div>
      <div className="tools-hero-art" aria-hidden="true"><div className="sun-disc"/><div className="field field-back"/><div className="field field-front"/><div className="hero-plant">🌱</div><div className="hero-stat"><span>Farm finance</span><strong>All in one place</strong></div></div>
    </section>

    <div className="tools-heading-row"><div><p className="tools-kicker">AGROCONNECT WORKSPACE</p><h2>Farm management centre</h2><p className="tools-muted">Choose a profile to load its private records.</p></div><button className="tools-refresh" onClick={loadEverything} disabled={loading}><FaSyncAlt className={loading ? "spin" : ""}/> Refresh data</button></div>

    {error && <div className="tools-alert error" role="alert">{error}<button onClick={() => setError("")} aria-label="Dismiss error">×</button></div>}
    {message && <div className="tools-alert success" role="status">{message}<button onClick={() => setMessage("")} aria-label="Dismiss message">×</button></div>}

    <section className="profile-selectors"><label><span>Farmer profile</span><select value={farmerId} onChange={(e) => { setFarmerId(e.target.value); setEstimate(null); }}><option value="">Select farmer</option>{farmers.map((f) => <option key={f.id} value={f.id}>{f.name || f.farmerName || `Farmer #${f.id}`}</option>)}</select></label><label><span>Loan record</span><select value={loanId} onChange={(e) => setLoanId(e.target.value)}><option value="">Select loan</option>{loans.map((loan) => <option key={loan.loanId ?? loan.id} value={loan.loanId ?? loan.id}>Loan #{loan.loanId ?? loan.id} · {loan.loanStatus || "Status unavailable"}</option>)}</select></label><div className="selected-profile"><span className="profile-avatar">{farmerName.slice(0, 1).toUpperCase()}</span><div><small>Current farmer</small><strong>{farmerId ? farmerName : "No farmer selected"}</strong></div></div></section>

    {loading ? <div className="tools-loading"><span className="loader-dot"/> Loading your farm workspace…</div> : <>
      <section className="finance-section">
        <div className="section-title"><div className="section-icon green"><FaWallet/></div><div><h3>Farm income & expenses</h3><p>Keep a simple record of crop sales and farm spending.</p></div></div>
        <div className="finance-summary"><article className="summary-card income"><span>Total income</span><strong>{money(finance.totalIncome)}</strong><small>Recorded farm earnings</small></article><article className="summary-card expense"><span>Total expenses</span><strong>{money(finance.totalExpenses)}</strong><small>Recorded farm costs</small></article><article className={`summary-card ${Number(finance.profitOrLoss) >= 0 ? "profit" : "loss"}`}><span>Net profit / loss</span><strong>{money(finance.profitOrLoss)}</strong><small>{Number(finance.profitOrLoss) >= 0 ? "Income minus expenses" : "Expenses exceed income"}</small></article></div>
        <div className="finance-layout"><form className="tools-panel transaction-form" onSubmit={submitTransaction}><div className="panel-heading"><h4>Add transaction</h4><span className="panel-badge">New entry</span></div><div className="form-grid"><label>Transaction type<select value={transaction.type} onChange={(e) => setTransaction({ ...transaction, type: e.target.value, category: e.target.value === "INCOME" ? "Crop sale" : "Seeds and supplies" })}><option value="INCOME">Income</option><option value="EXPENSE">Expense</option></select></label><label>Category<input required value={transaction.category} onChange={(e) => setTransaction({ ...transaction, category: e.target.value })} placeholder="e.g. Fertilizer"/></label><label>Crop (optional)<input value={transaction.cropType} onChange={(e) => setTransaction({ ...transaction, cropType: e.target.value })} placeholder="e.g. Paddy"/></label><label>Amount (₹)<input type="number" min="1" step="0.01" required value={transaction.amount} onChange={(e) => setTransaction({ ...transaction, amount: e.target.value })} placeholder="Enter amount"/></label><label>Date<input type="date" required value={transaction.transactionDate} onChange={(e) => setTransaction({ ...transaction, transactionDate: e.target.value })}/></label><label className="full-field">Notes (optional)<input value={transaction.notes} onChange={(e) => setTransaction({ ...transaction, notes: e.target.value })} placeholder="Short note about this transaction"/></label></div><button className="tools-primary" disabled={busy || !farmerId}>{busy ? "Saving…" : "+ Save transaction"}</button>{!farmerId && <p className="inline-note">Add a farmer profile to start recording transactions.</p>}</form>
          <div className="tools-panel transaction-list"><div className="panel-heading"><h4>Recent transactions</h4><span className="count-pill">{finance.transactions?.length || 0}</span></div>{!finance.transactions?.length ? <div className="empty-state"><span>🧾</span><strong>No transactions yet</strong><p>Add an income or expense entry to see it here.</p></div> : <div className="transaction-rows">{finance.transactions.map((item) => <div className="transaction-row" key={item.id}><span className={`transaction-symbol ${item.type === "INCOME" ? "plus" : "minus"}`}>{item.type === "INCOME" ? "+" : "−"}</span><div className="transaction-info"><strong>{item.category || item.type}</strong><small>{item.cropType ? `${item.cropType} · ` : ""}{item.transactionDate || "Date unavailable"}</small></div><strong className={item.type === "INCOME" ? "amount-positive" : "amount-negative"}>{item.type === "INCOME" ? "+" : "−"}{money(item.amount)}</strong><button className="icon-delete" title="Delete transaction" onClick={() => removeTransaction(item.id)}><FaTrash/></button></div>)}</div>}</div></div>
      </section>

      <section className="tools-two-column">
        <div className="tools-panel eligibility-panel"><div className="section-title compact"><div className="section-icon amber"><FaCalculator/></div><div><h3>Loan affordability estimate</h3><p>A basic estimate based on the figures you enter.</p></div></div><form onSubmit={submitEligibility} className="form-grid"><label>Monthly income (₹)<input type="number" min="0" required value={eligibility.monthlyIncome} onChange={(e) => setEligibility({ ...eligibility, monthlyIncome: e.target.value })} placeholder="30000"/></label><label>Monthly expenses (₹)<input type="number" min="0" required value={eligibility.monthlyExpenses} onChange={(e) => setEligibility({ ...eligibility, monthlyExpenses: e.target.value })} placeholder="12000"/></label><label>Existing monthly debt (₹)<input type="number" min="0" required value={eligibility.existingMonthlyDebt} onChange={(e) => setEligibility({ ...eligibility, existingMonthlyDebt: e.target.value })} placeholder="2000"/></label><label>Requested loan (₹)<input type="number" min="1" required value={eligibility.requestedAmount} onChange={(e) => setEligibility({ ...eligibility, requestedAmount: e.target.value })} placeholder="250000"/></label><div className="full-field"><button className="tools-primary" disabled={busy || !farmerId}>{busy ? "Calculating…" : "Calculate estimate"}</button></div></form>{estimate && <div className={`estimate-result ${estimate.preliminaryEstimate === "WITHIN_ESTIMATE" ? "estimate-ok" : "estimate-warning"}`}><span className="estimate-status">{estimate.preliminaryEstimate === "WITHIN_ESTIMATE" ? "Within estimate" : "Outside estimate"}</span><div className="estimate-metrics"><div><small>Net after expenses & debt</small><strong>{money(estimate.monthlyNetAfterExpensesAndDebt)}</strong></div><div><small>Estimated affordable amount</small><strong>{money(estimate.estimatedAffordableAmount)}</strong></div></div><ul>{(estimate.reasons || []).map((reason) => <li key={reason}>{reason}</li>)}</ul><p>{estimate.disclaimer}</p></div>}<div className="disclaimer-note">This is an educational estimate only, not a bank decision or loan approval.</div></div>

        <div className="tools-panel checklist-panel"><div className="section-title compact"><div className="section-icon blue"><FaFileAlt/></div><div><h3>Loan document checklist</h3><p>Common documents to prepare before applying.</p></div></div><ul className="checklist">{checklist.map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul><p className="disclaimer-note">Requirements vary by lender and scheme. Confirm with the official lender.</p></div>
      </section>

      <section className="tools-panel loan-docs-panel"><div className="section-title"><div className="section-icon purple"><FaFileAlt/></div><div><h3>Loan documents & status history</h3><p>{loanId ? `Managing records for loan #${loanId}` : "Select a loan above to view its records."}</p></div></div><div className="loan-records-grid"><div className="loan-record-block"><div className="panel-heading"><h4>Documents</h4><span className="count-pill">{documents.length}</span></div><form className="upload-form" onSubmit={submitDocument}><label className="upload-drop"><FaUpload/><span>Choose PDF, JPG or PNG</span><small>Maximum file size: 5 MB</small><input name="document" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" required/></label><button className="tools-primary" disabled={busy || !loanId}>{busy ? "Uploading…" : "Upload document"}</button></form>{!documents.length ? <div className="mini-empty">No documents uploaded for this loan yet.</div> : documents.map((doc) => <div className="document-row" key={doc.id}><span className="document-icon">PDF</span><div><strong>{doc.originalFilename || `Document ${doc.id}`}</strong><small>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("en-IN") : "Upload date unavailable"} · {Math.max(1, Math.round((doc.fileSize || 0) / 1024))} KB</small></div><button className="download-link" onClick={() => downloadDocument(doc)}>Download</button></div>)}</div>
          <div className="loan-record-block history-block"><div className="panel-heading"><h4>Status timeline</h4><span className="count-pill">{history.length}</span></div>{!history.length ? <div className="empty-state small-empty"><span>🕘</span><strong>No history available</strong><p>Loan status changes will appear here when recorded.</p></div> : <div className="history-list">{history.map((item) => <div className="history-item" key={item.id}><span className="history-dot"/><div><strong>{item.previousStatus ? `${item.previousStatus} → ` : ""}{item.newStatus || "Status updated"}</strong><small>{item.changedAt ? new Date(item.changedAt).toLocaleString("en-IN") : "Date unavailable"}</small>{item.note && <p>{item.note}</p>}</div></div>)}</div>}</div></div></section>

      <section className="tools-panel market-panel"><div className="section-title"><div className="section-icon green"><FaSeedling/></div><div><h3>Crop market price snapshot</h3><p>Indicative sample values from the backend demo endpoint.</p></div></div><div className="market-toolbar"><label>Filter crop<select value={marketCrop} onChange={(e) => setMarketCrop(e.target.value)}><option value="ALL">All crops</option>{[...new Set(prices.map((row) => row.crop))].map((crop) => <option key={crop} value={crop}>{crop}</option>)}</select></label><span className="demo-warning">⚠ Demo data · Not live market prices</span></div><div className="market-grid">{visiblePrices.map((row) => <article className="market-card" key={`${row.crop}-${row.state}`}><div className="crop-emoji">{row.crop === "Paddy" ? "🌾" : row.crop === "Maize" ? "🌽" : row.crop === "Groundnut" ? "🥜" : "🌱"}</div><div><span>{row.state}</span><h4>{row.crop}</h4><strong>{money(row.indicativePrice)}<small> / quintal</small></strong></div><span className="market-trend">Sample</span></article>)}</div><p className="market-footnote">These values are illustrative demo data, not current mandi prices. Verify prices through official Agmarknet/eNAM or your local market before making selling decisions.</p></section>

      <section className="schemes-section"><div className="section-title"><div className="section-icon amber"><FaCloudSun/></div><div><h3>Government agriculture schemes</h3><p>Starter directory with official portal links. Check current eligibility and deadlines.</p></div></div><div className="scheme-grid">{schemes.map((scheme) => <article className="scheme-card" key={scheme.name}><span className="scheme-tag">AGRI SUPPORT</span><h4>{scheme.name}</h4><p>{scheme.description}</p><a href={scheme.officialUrl} target="_blank" rel="noreferrer">Visit official portal <FaExternalLinkAlt/></a></article>)}</div><p className="disclaimer-note">Scheme information is a starter directory only; rules, deadlines and eligibility can change.</p></section>
    </>}
    <footer className="tools-footer">AgroConnect <span>·</span> Helping farm decisions feel simpler, one record at a time.</footer>
  </main>;
}
