async function exportReportPDF(patient, entry) {
  const { jsPDF } = window.jspdf
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 40
  let y = margin
  const add = (text, size = 12, bold = false) => {
    doc.setFont('Helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(size)
    doc.text(text, margin, y)
    y += size + 8
  }
  add('Relatório TCC Gestor App', 16, true)
  add(`Paciente: ${patient.name}`)
  add(`Atendimento: ${patient.type}`)
  add(`Data: ${new Date(entry.timestamp).toLocaleString()}`)
  add('Resumo de Escalas', 14, true)
  add(`BAI: ${entry.assessment.BAI.total} (${entry.assessment.BAI.nivel})`)
  add(`BDI: ${entry.assessment.BDI.total} (${entry.assessment.BDI.nivel})`)
  const pssTotal = Math.max(entry.assessment.PSS10?.total || 0, entry.assessment.PSS14?.total || 0)
  const pssNivel = (entry.assessment.PSS10?.nivel || entry.assessment.PSS14?.nivel || '')
  add(`PSS: ${pssTotal} (${pssNivel})`)
  add(`Rosenberg: ${entry.assessment.ROSENBERG.total} (${entry.assessment.ROSENBERG.nivel})`)
  add('Análise Preditiva', 14, true)
  add(`Composto: ${entry.predictive.composite}`)
  add(`Ansiedade: ${entry.predictive.anxietyRisk}`)
  add(`Depressão: ${entry.predictive.depressionRisk}`)
  add(`Estresse: ${entry.predictive.stressRisk}`)
  add(`Autoestima: ${entry.predictive.selfEsteemLevel}`)
  add(`Foco TCC: ${entry.predictive.focus}`)
  if (entry.predictive.flags && entry.predictive.flags.length) {
    add('Sinais/Intervenções:')
    entry.predictive.flags.forEach(f => add(`• ${f}`))
  }
  try {
    const schema = window.suggestSchemaFocus({ anxietyRisk: entry.predictive.anxietyRisk, depressionRisk: entry.predictive.depressionRisk, stressRisk: entry.predictive.stressRisk, selfEsteemLevel: entry.predictive.selfEsteemLevel }, patient.chiefComplaint, entry.assessment)
    add('Terapia do Esquema', 14, true)
    add(`Foco: ${schema.focus}`)
    if (schema.flags && schema.flags.length) { schema.flags.forEach(f => add(`• ${f}`)) }
  } catch {}
  try {
    const goals = JSON.parse(localStorage.getItem('goals') || '[]').filter(g => g.patientId === patient.id)
    if (goals.length) {
      add('Metas do plano terapêutico', 14, true)
      goals.forEach(g => add(`• ${g.title} | Indicador: ${g.indicator} | Prazo: ${g.due} | Status: ${g.status}`))
    }
  } catch {}
  try {
    const sessions = JSON.parse(localStorage.getItem('sessions') || '[]').filter(s => s.patientId === patient.id)
    if (sessions.length) {
      add('Sessões e progresso', 14, true)
      const avgByGoal = {}
      sessions.forEach(s => (s.progress||[]).forEach(p => { avgByGoal[p.goalId] = avgByGoal[p.goalId] || []; avgByGoal[p.goalId].push(p.percent) }))
      const goals = JSON.parse(localStorage.getItem('goals') || '[]')
      Object.entries(avgByGoal).forEach(([gid, arr]) => {
        const g = goals.find(x => x.id === gid)
        const avg = Math.round(arr.reduce((a,b)=>a+b,0) / arr.length)
        add(`• ${g?.title || gid}: progresso médio ${avg}%`)
      })
      const totalTasks = sessions.reduce((a,s)=>a + ((s.tasks||[]).length), 0)
      const doneTasks = sessions.reduce((a,s)=>a + ((s.tasks||[]).filter(t=>t.done).length), 0)
      if (totalTasks) add(`Tarefas: ${doneTasks}/${totalTasks} concluídas (${Math.round(doneTasks/totalTasks*100)}%)`)
      const counts = { exposicao:0, ativacao:0, cognitiva:0 }
      sessions.forEach(s => (s.tasks||[]).forEach(t => { if (counts[t.type] !== undefined) counts[t.type]++ }))
      add(`Tipos de tarefas: exposição ${counts.exposicao}, ativação ${counts.ativacao}, cognitivas ${counts.cognitiva}`)
      const approaches = ['TCC padrão','Ansiedade','Depressão','Estresse','Casais']
      const adhByApproach = {}
      sessions.forEach(s => {
        const a = s.approach || 'TCC padrão'
        const totalTasks = (s.tasks || []).length
        const doneTasks = (s.tasks || []).filter(t => t.done).length
        const adh = totalTasks ? Math.round(doneTasks / totalTasks * 100) : 0
        adhByApproach[a] = adhByApproach[a] || []
        adhByApproach[a].push(adh)
      })
      add('Aderência por abordagem', 14, true)
      approaches.forEach(a => { const arr = adhByApproach[a] || []; const avg = arr.length ? Math.round(arr.reduce((x,y)=>x+y,0)/arr.length) : 0; add(`• ${a}: média ${avg}%`) })
    }
  } catch {}
  doc.save(`Relatorio_${patient.name.replace(/\s+/g,'_')}.pdf`)
}
function exportCustomTextPDF(patient, text) {
  const { jsPDF } = window.jspdf
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 40
  let y = margin
  const add = (tx, size = 12, bold = false) => { doc.setFont('Helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.text(tx, margin, y); y += size + 8 }
  add('Relatório personalizado', 16, true)
  add(`Paciente: ${patient?.name || ''}`)
  ;(text || '').split(/\n/).forEach(line => add(line))
  doc.save(`RelatorioPersonalizado_${(patient?.name || '').replace(/\s+/g,'_')}.pdf`)
}
window.exportCustomTextPDF = exportCustomTextPDF
function exportAnalyticsPDF(patient) {
  const sessions = JSON.parse(localStorage.getItem('sessions') || '[]').filter(s => s.patientId === patient.id)
  const { jsPDF } = window.jspdf
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 40
  let y = margin
  const add = (text, size = 12, bold = false) => { doc.setFont('Helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.text(text, margin, y); y += size + 8 }
  const iso = d => { const date = new Date(d); const t = new Date(date.getTime()); const day = (date.getDay() + 6) % 7; t.setDate(date.getDate() + 3 - day); const firstThursday = new Date(t.getFullYear(), 0, 4); const diff = t - firstThursday; const week = 1 + Math.floor(diff / (7 * 24 * 60 * 60 * 1000)); const w = String(week).padStart(2, '0'); return `${t.getFullYear()}-W${w}` }
  add('Relatório Analítico', 16, true)
  add(`Paciente: ${patient.name}`)
  const byWeek = {}
  sessions.forEach(s => { const wk = iso(s.date || s.timestamp); const totalTasks = (s.tasks || []).length; const doneTasks = (s.tasks || []).filter(t => t.done).length; const adh = totalTasks ? Math.round(doneTasks / totalTasks * 100) : 0; (byWeek[wk] = byWeek[wk] || []).push(adh) })
  const weeks = Object.keys(byWeek).sort()
  add('Série temporal de aderência semanal', 14, true)
  weeks.forEach(w => { const arr = byWeek[w]; const avg = Math.round(arr.reduce((a,b)=>a+b,0)/arr.length); add(`${w}: ${avg}%`) })
  const byApproach = {}
  sessions.forEach(s => { const a = s.approach || 'TCC padrão'; (byApproach[a] = byApproach[a] || []).push(s) })
  add('Sessões detalhadas por abordagem', 14, true)
  Object.entries(byApproach).forEach(([approach, list]) => {
    add(`${approach}`, 13, true)
    list.forEach(s => {
      const date = new Date(s.date || s.timestamp).toLocaleDateString()
      const tasks = s.tasks || []
      const done = tasks.filter(t => t.done).length
      const prog = s.progress || []
      const avgProg = prog.length ? Math.round(prog.reduce((a,b)=>a+b.percent,0)/prog.length) : 0
      add(`• ${date} • notas: ${(s.notes||'').slice(0,80)} • tarefas: ${done}/${tasks.length} • progresso metas: ${avgProg}%`)
    })
  })
  doc.save(`RelatorioAnalitico_${patient.name.replace(/\s+/g,'_')}.pdf`)
}
window.exportAnalyticsPDF = exportAnalyticsPDF

function exportPatientsCatalogPDF() {
  const patients = JSON.parse(localStorage.getItem('patients') || '[]')
  const { jsPDF } = window.jspdf
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const margin = 40
  let y = margin
  const add = (text, size = 12, bold = false) => { doc.setFont('Helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); doc.text(text, margin, y); y += size + 8 }
  add('Relatório de Pacientes Cadastrados', 16, true)
  if (!patients.length) { add('Nenhum paciente cadastrado'); doc.save('Relatorio_Pacientes.pdf'); return }
  const rows = patients.slice().sort((a,b) => (a.timestamp||0) - (b.timestamp||0))
  rows.forEach(p => {
    const when = p.registeredAt || (p.timestamp ? new Date(p.timestamp).toLocaleDateString() : 'sem data')
    add(`${p.name} • cadastro: ${when} • tipo: ${p.type || ''}`)
    if (p.partnerName) add(`  parceiro(a): ${p.partnerName}`)
    if (p.contact) add(`  contato: ${String(p.contact).slice(0,80)}`)
    if (p.chiefComplaint) add(`  queixa: ${String(p.chiefComplaint).slice(0,120)}`)
  })
  doc.save('Relatorio_Pacientes.pdf')
}
window.exportPatientsCatalogPDF = exportPatientsCatalogPDF

window.exportReportPDF = exportReportPDF
