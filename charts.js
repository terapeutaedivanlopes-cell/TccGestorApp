function renderHistoryCharts(ctxMap, history) {
  const labels = history.map(h => new Date(h.timestamp).toLocaleString())
  const bai = history.map(h => h.assessment?.BAI?.total || 0)
  const bdi = history.map(h => h.assessment?.BDI?.total || 0)
  const pss = history.map(h => Math.max(h.assessment?.PSS10?.total || 0, h.assessment?.PSS14?.total || 0))
  const ros = history.map(h => h.assessment?.ROSENBERG?.total || 0)
  const ysq = history.map(h => h.assessment?.YSQ?.total || 0)
  const qep = history.map(h => h.assessment?.QEP?.total || 0)
  const ried = history.map(h => h.assessment?.RIED?.total || 0)
  const configLine = (label, data, color) => ({ type: 'line', data: { labels, datasets: [{ label, data, borderColor: color }] } })
  if (ctxMap.bai) new Chart(ctxMap.bai, configLine('BAI', bai, '#22c55e'))
  if (ctxMap.bdi) new Chart(ctxMap.bdi, configLine('BDI', bdi, '#ef4444'))
  if (ctxMap.pss) new Chart(ctxMap.pss, configLine('PSS', pss, '#3b82f6'))
  if (ctxMap.ros) new Chart(ctxMap.ros, configLine('Rosenberg', ros, '#f59e0b'))
  if (ctxMap.ysq) new Chart(ctxMap.ysq, configLine('YSQ', ysq, '#8b5cf6'))
  if (ctxMap.qep) new Chart(ctxMap.qep, configLine('QEP', qep, '#10b981'))
  if (ctxMap.ried) new Chart(ctxMap.ried, configLine('RIED', ried, '#ec4899'))
}

function renderRadar(ctx, latest) {
  const data = [
    latest.BAI?.total || 0,
    latest.BDI?.total || 0,
    Math.max(latest.PSS10?.total || 0, latest.PSS14?.total || 0),
    latest.ROSENBERG?.total || 0,
    latest.YSQ?.total || 0,
    latest.QEP?.total || 0,
    latest.RIED?.total || 0
  ]
  new Chart(ctx, {
    type: 'radar',
    data: { labels: ['BAI', 'BDI', 'PSS', 'Rosenberg', 'YSQ', 'QEP', 'RIED'], datasets: [{ label: 'Comparativo', data, borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.2)' }] },
    options: { scales: { r: { angleLines: { display: false } } } }
  })
}

function renderHistoryChartsMulti(ctxMap, series) {
  const labels = series[0].history.map(h => new Date(h.timestamp).toLocaleString())
  const line = (ctx, label, extractor, colors) => {
    const datasets = series.map((s, i) => ({ label: `${label} • ${s.label}`, data: s.history.map(extractor), borderColor: colors[i % colors.length] }))
    new Chart(ctx, { type: 'line', data: { labels, datasets } })
  }
  const colors = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b']
  if (ctxMap.bai) line(ctxMap.bai, 'BAI', h => h.assessment?.BAI?.total || 0, colors)
  if (ctxMap.bdi) line(ctxMap.bdi, 'BDI', h => h.assessment?.BDI?.total || 0, colors)
  if (ctxMap.pss) line(ctxMap.pss, 'PSS', h => Math.max(h.assessment?.PSS10?.total || 0, h.assessment?.PSS14?.total || 0), colors)
  if (ctxMap.ros) line(ctxMap.ros, 'Rosenberg', h => h.assessment?.ROSENBERG?.total || 0, colors)
  if (ctxMap.ysq) line(ctxMap.ysq, 'YSQ', h => h.assessment?.YSQ?.total || 0, colors)
  if (ctxMap.qep) line(ctxMap.qep, 'QEP', h => h.assessment?.QEP?.total || 0, colors)
  if (ctxMap.ried) line(ctxMap.ried, 'RIED', h => h.assessment?.RIED?.total || 0, colors)
}

window.renderHistoryCharts = renderHistoryCharts
window.renderRadar = renderRadar
window.renderHistoryChartsMulti = renderHistoryChartsMulti
function renderGoalProgress(ctx, sessions, goalId) {
  const filtered = sessions.filter(s => (s.progress || []).some(p => p.goalId === goalId))
  const labels = filtered.map(s => new Date(s.date || s.timestamp).toLocaleDateString())
  const data = filtered.map(s => (s.progress.find(p => p.goalId === goalId) || {}).percent || 0)
  new Chart(ctx, { type: 'line', data: { labels, datasets: [{ label: 'Progresso da meta', data, borderColor: '#22c55e' }] } })
}
window.renderGoalProgress = renderGoalProgress
function renderTaskCompletion(ctx, sessions) {
  const labels = sessions.map(s => new Date(s.date || s.timestamp).toLocaleDateString())
  const data = sessions.map(s => {
    const tasks = s.tasks || []
    if (!tasks.length) return 0
    const done = tasks.filter(t => t.done).length
    return Math.round((done / tasks.length) * 100)
  })
  new Chart(ctx, { type: 'line', data: { labels, datasets: [{ label: 'Conclusão de tarefas (%)', data, borderColor: '#f59e0b' }] } })
}
window.renderTaskCompletion = renderTaskCompletion
function renderWeeklyAdherence(ctx, sessions, filter) {
  const byWeek = {}
  const iso = d => {
    const date = new Date(d)
    const t = new Date(date.getTime())
    const day = (date.getDay() + 6) % 7
    t.setDate(date.getDate() + 3 - day)
    const firstThursday = new Date(t.getFullYear(), 0, 4)
    const diff = t - firstThursday
    const week = 1 + Math.floor(diff / (7 * 24 * 60 * 60 * 1000))
    const w = String(week).padStart(2, '0')
    return `${t.getFullYear()}-W${w}`
  }
  sessions.forEach(s => {
    const wk = iso(s.date || s.timestamp)
    const tasks = (s.tasks || []).filter(t => (!filter?.type || t.type === filter.type))
    const progress = (s.progress || []).filter(p => (!filter?.goalId || p.goalId === filter.goalId))
    const totalTasks = tasks.length
    const doneTasks = tasks.filter(t => t.done).length
    const adherence = totalTasks ? Math.round(doneTasks / totalTasks * 100) : 0
    byWeek[wk] = byWeek[wk] || { sum: 0, count: 0 }
    byWeek[wk].sum += adherence
    byWeek[wk].count += 1
  })
  const labels = Object.keys(byWeek).sort()
  const data = labels.map(k => Math.round(byWeek[k].sum / byWeek[k].count))
  new Chart(ctx, { type: 'line', data: { labels, datasets: [{ label: 'Aderência semanal (%)', data, borderColor: '#3b82f6' }] } })
}
window.renderWeeklyAdherence = renderWeeklyAdherence
function renderWeeklyAdherenceByApproach(ctx, sessions) {
  const approaches = ['TCC padrão','Ansiedade','Depressão','Estresse','Casais']
  const weeks = {}
  const iso = d => {
    const date = new Date(d)
    const t = new Date(date.getTime())
    const day = (date.getDay() + 6) % 7
    t.setDate(date.getDate() + 3 - day)
    const firstThursday = new Date(t.getFullYear(), 0, 4)
    const diff = t - firstThursday
    const week = 1 + Math.floor(diff / (7 * 24 * 60 * 60 * 1000))
    const w = String(week).padStart(2, '0')
    return `${t.getFullYear()}-W${w}`
  }
  sessions.forEach(s => {
    const wk = iso(s.date || s.timestamp)
    weeks[wk] = weeks[wk] || {}
    approaches.forEach(a => { weeks[wk][a] = weeks[wk][a] || { sum:0, count:0 } })
    const totalTasks = (s.tasks || []).length
    const doneTasks = (s.tasks || []).filter(t => t.done).length
    const adh = totalTasks ? Math.round(doneTasks / totalTasks * 100) : 0
    const a = s.approach || 'TCC padrão'
    weeks[wk][a].sum += adh
    weeks[wk][a].count += 1
  })
  const labels = Object.keys(weeks).sort()
  const colors = ['#22c55e','#ef4444','#3b82f6','#f59e0b','#8b5cf6']
  const datasets = approaches.map((a, i) => ({ label: a, data: labels.map(l => { const e = weeks[l][a]; return e && e.count ? Math.round(e.sum/e.count) : 0 }), borderColor: colors[i] }))
  new Chart(ctx, { type: 'line', data: { labels, datasets } })
}
window.renderWeeklyAdherenceByApproach = renderWeeklyAdherenceByApproach
function renderBurnDownWeekly(ctx, sessions, filter) {
  const iso = d => {
    const date = new Date(d)
    const t = new Date(date.getTime())
    const day = (date.getDay() + 6) % 7
    t.setDate(date.getDate() + 3 - day)
    const firstThursday = new Date(t.getFullYear(), 0, 4)
    const diff = t - firstThursday
    const week = 1 + Math.floor(diff / (7 * 24 * 60 * 60 * 1000))
    const w = String(week).padStart(2, '0')
    return `${t.getFullYear()}-W${w}`
  }
  const sorted = sessions.slice().sort((a,b)=>new Date(a.date||a.timestamp)-new Date(b.date||b.timestamp))
  const weeks = {}
  let open = 0
  sorted.forEach(s => {
    const wk = iso(s.date || s.timestamp)
    const tasks = (s.tasks || []).filter(t => (!filter?.type || t.type === filter.type) && (!filter?.category || t.category === filter.category) && (!filter?.priority || t.priority === filter.priority))
    const created = tasks.length
    const closed = tasks.filter(t => t.done).length
    open += created - closed
    weeks[wk] = open
  })
  const labels = Object.keys(weeks).sort()
  const data = labels.map(l => weeks[l])
  new Chart(ctx, { type: 'line', data: { labels, datasets: [{ label: 'Burn-down (tarefas abertas)', data, borderColor: '#ef4444' }] } })
}
window.renderBurnDownWeekly = renderBurnDownWeekly
function renderPredictiveComposite(ctx, entries) {
  const labels = entries.map(e => new Date(e.timestamp).toLocaleDateString())
  const data = entries.map(e => e.predictive?.composite || 0)
  new Chart(ctx, { type: 'line', data: { labels, datasets: [{ label: 'Composto preditivo', data, borderColor: '#22c55e' }] } })
}
window.renderPredictiveComposite = renderPredictiveComposite
