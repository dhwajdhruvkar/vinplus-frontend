import { displayTime, moneyExact, moneySigned } from '../utils/format.js'
import { demoManagerDraft, displayJV, voucherEntries, voucherThread } from '../utils/policy.js'
import VoucherTable from './VoucherTable.jsx'

const unique = (values) => [...new Set(values.map((v) => String(v ?? '').trim()).filter(Boolean))]

function Detail({ name, value }) {
  return <div><small>{name}</small><b>{value}</b></div>
}

function ReferenceInvestigation({ row: r, entries, focusDept, collapseKey }) {
  const jv = displayJV(r)
  const debits = entries.reduce((n, x) => n + Math.max(0, x.amount), 0)
  const credits = entries.reduce((n, x) => n + Math.max(0, -x.amount), 0)
  const net = debits - credits
  const accounts = unique(entries.map((x) => x.account))
  const departments = unique(entries.map((x) => x.dept))
  const journals = unique(entries.map((x) => x.journal))
  const descriptions = unique(entries.map((x) => x.description))
  const description = descriptions.length === 1 ? descriptions[0] : descriptions.slice(0, 2).join(' · ')
  const dept = departments.includes(focusDept) ? focusDept : departments.includes(r.dept) ? r.dept : departments[0]

  return (
    <section className="referenceInvestigation jvSimpleLayout">
      <article className="refEntryCard jvSingleSummary">
        <div className="refEntryHead jvSummaryHead">
          <div className="refEntryNo"><span>{`REFERENCE NO. · ${r.ref}`}</span><b>{`Journal Voucher: ${jv}`}</b></div>
          <div className={'refAmountTag ' + (net < 0 ? 'isCredit' : net > 0 ? 'isDebit' : 'isZero')}>
            <small>Remaining net posting movement</small><strong>{moneySigned(net)}</strong>
          </div>
        </div>
        <div className="refEntryNarrative"><small>Description / GL evidence</small><div>{description || 'No GL description provided'}</div></div>
        <div className="refEntryMeta jvSummaryMeta">
          <Detail name="JV Number(s) (postingtime)" value={r.jvNumbers.join(', ')} />
          <Detail name="Reference / RO" value={r.ref} />
          <Detail name="Source journal" value={journals.length === 1 ? journals[0] : 'Multiple journals'} />
          <Detail name="Charged department" value={departments.length === 1 ? departments[0] : 'Multiple departments'} />
          <Detail name="GL account" value={accounts.length === 1 ? accounts[0] : `Multiple GL accounts (${accounts.length})`} />
          <Detail name="Accounting date" value="Varies / demo date" />
          <Detail name="GL entries for selected reference" value={String(entries.length)} />
          <Detail name="JV numbers for this reference" value={String(r.jvNumbers.length)} />
        </div>
        <div className="jvSummaryTotals">
          <span><small>Reference debits</small><b>{moneyExact(debits)}</b></span>
          <span><small>Reference credits</small><b>{moneyExact(credits)}</b></span>
          <span><small>Complete JV net</small><b>{moneySigned(net)}</b></span>
        </div>
        <p className="jvSummaryNote">Fictional demo GL entries only. All reference, voucher, account and posting amounts are simulated for demonstration.</p>
      </article>
      <VoucherTable reference={r} rows={entries.filter((x) => x.dept === dept)} />
      <details key={collapseKey} className="jvFullReference">
        <summary>
          <span className="jvExpandTitle">{`Expand all ${entries.length} transactions for this reference`}</span>
          <span className="jvCollapseTitle">{`Collapse all ${entries.length} transactions for this reference`}</span>
          <span className="jvToggleArrow" aria-hidden="true">⌄</span>
        </summary>
        <VoucherTable reference={r} rows={entries} />
      </details>
    </section>
  )
}

export default function ReviewDrawer({ row: r, review, threads, focusDept, draftNote, onDraftChange, onDecision, onSave, onClose }) {
  const entries = voucherEntries(r)
  const thread = voucherThread(r, threads, review)
  const replies = Array.isArray(thread.replies) ? thread.replies : []

  return (
    <>
      <div className="drawerHeader refDrawerHeader">
        <div className="refHeaderTitle">
          <div className="drawerEyebrow">POLICY WORK · COMPLETE REFERENCE DETAIL</div>
          <h2>{`Reference ${r.ref}`}</h2>
          <div className="refDrawerStatus">{`${entries.length} GL ${entries.length === 1 ? 'entry' : 'entries'} · JV ${displayJV(r)}`}</div>
        </div>
        <div className="refHeaderActions">
          <div className="refHeaderDecision">
            <label htmlFor="reviewDecision">Review decision</label>
            <select id="reviewDecision" className="select actionSelect" aria-label="Review decision" value={review[r.id]?.decision || ''} onChange={(e) => onDecision(e.target.value)}>
              <option value="">Pending / Commented</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Needs Action">Needs Action</option>
            </select>
          </div>
          <button type="button" className="btn" onClick={onClose}>✕ Close</button>
        </div>
      </div>
      <div className="drawerBody referenceOnly">
        <ReferenceInvestigation row={r} entries={entries} focusDept={focusDept} collapseKey={`${review[r.id]?.decision}|${thread.updatedAt}`} />
        <section className="drawerSection reviewSection jvManagerReview">
          <h3>Manager Review & Conversation</h3>
          <p className="jvCommentRule">Only one comment will be allowed. You can edit and save the same comment as many times as you need to. Reply stays linked to that comment.</p>
          <label className="formLabel" htmlFor="managerNote">Manager comment</label>
          <textarea className="textarea noteTextarea" id="managerNote" rows={4} placeholder="Enter one comment for this journal voucher…" value={draftNote ?? (thread.comment || demoManagerDraft(r))} onChange={(e) => onDraftChange(e.target.value)} />
          <div className="drawerActions"><button type="button" className="btn primary" onClick={onSave}>Send</button></div>
          {thread.comment && (
            <div className="jvCommentSaved">
              <strong>Current comment</strong><p>{thread.comment}</p>
              <small>{thread.updatedAt ? 'Last edited ' + displayTime(thread.updatedAt) : 'Saved in this browser'}</small>
            </div>
          )}
          <div className="jvReplies">
            <strong>Replies to this comment</strong>
            {replies.length ? replies.map((m) => (
              <div key={m.id} className={'jvReply ' + (m.demoGenerated ? 'jvDemoReply' : '')}>
                <div>{m.text || ''}</div>
                <small>{`${m.name || 'Service Advisor'} · ${displayTime(m.time)}`}</small>
                {m.demoGenerated && <small className="demoDisclaimer">Automatically generated for demonstration — not a real advisor response or confirmed resolution.</small>}
              </div>
            )) : <p className="sub">No advisor reply recorded. Reply delivery between users requires a connected dealership messaging service.</p>}
          </div>
        </section>
      </div>
    </>
  )
}
