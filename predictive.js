function analyzePredictive(scales, chiefComplaint, anamnesis, weights = { bai: 1, bdi: 1, pss: 1, ros: 1 }, pssChoice = 'auto') {
  const bai = scales.BAI?.total || 0
  const bdi = scales.BDI?.total || 0
  const p10 = scales.PSS10?.total || 0
  const p14 = scales.PSS14?.total || 0
  const pss = pssChoice === '10' ? p10 : pssChoice === '14' ? p14 : Math.max(p10, p14)
  const ros = scales.ROSENBERG?.total || 0
  const anxietyRisk = bai >= 26 ? 'Alto' : bai >= 16 ? 'Moderado' : 'Baixo'
  const depressionRisk = bdi >= 29 ? 'Alto' : bdi >= 20 ? 'Moderado' : 'Baixo'
  const stressRisk = pss >= 27 ? 'Alto' : pss >= 14 ? 'Moderado' : 'Baixo'
  const selfEsteemLevel = ros >= 26 ? 'Alta' : ros >= 16 ? 'Moderada' : 'Baixa'
  const nbai = normalize(bai, 63)
  const nbdi = normalize(bdi, 63)
  const npss = normalize(pss, pssChoice === '10' ? 40 : pssChoice === '14' ? 56 : Math.max(40, 56))
  const nrosInv = 1 - normalize(ros, 30)
  const sumW = (weights.bai || 0) + (weights.bdi || 0) + (weights.pss || 0) + (weights.ros || 0)
  const composite = Math.round(100 * ((nbai * (weights.bai || 0)) + (nbdi * (weights.bdi || 0)) + (npss * (weights.pss || 0)) + (nrosInv * (weights.ros || 0))) / (sumW || 1))
  const focus = suggestCBTFocus({ anxietyRisk, depressionRisk, stressRisk, selfEsteemLevel }, chiefComplaint)
  const flags = []
  if (anxietyRisk === 'Alto' && stressRisk !== 'Baixo') flags.push('Regulação emocional e reestruturação cognitiva para ansiedade')
  if (depressionRisk === 'Alto') flags.push('Ativação comportamental e monitoramento de pensamentos automáticos depressivos')
  if (selfEsteemLevel === 'Baixa') flags.push('Trabalho de crenças centrais e experimentos comportamentais de competência')
  if (/\brelacion(a|o)/i.test(chiefComplaint || '')) flags.push('Habilidades sociais e comunicação assertiva')
  return { anxietyRisk, depressionRisk, stressRisk, selfEsteemLevel, composite, focus, flags }
}

function normalize(x, max) { return Math.min(1, Math.max(0, x / max)) }

function suggestCBTFocus(risks, complaint) {
  if (risks.depressionRisk === 'Alto' && risks.stressRisk !== 'Baixo') return 'Depressão com estresse: ativação, reestruturação, sono e rotina'
  if (risks.anxietyRisk === 'Alto') return 'Ansiedade: exposição graduada, reestruturação e técnicas de relaxamento'
  if (risks.stressRisk === 'Alto') return 'Estresse: manejo de estressores, mindfulness e solução de problemas'
  if (risks.selfEsteemLevel === 'Baixa') return 'Autoestima: crenças centrais e experimentos de domínio'
  if ((complaint || '').length > 0) return 'Queixa principal como foco com monitoramento de metas e métricas'
  return 'Prevenção de recaída e manutenção de ganhos'
}

function trendFromHistory(entries) {
  if (!entries || entries.length < 2) return 'Insuficiente'
  const last = entries[entries.length - 1]
  const prev = entries[entries.length - 2]
  const d = (last.predictive?.composite || 0) - (prev.predictive?.composite || 0)
  if (d > 3) return 'Piorando'
  if (d < -3) return 'Melhorando'
  return 'Estável'
}

window.analyzePredictive = analyzePredictive
window.trendFromHistory = trendFromHistory
function createAIReportFromPredictive(scales, predictive, patient, anam) {
  const lines = []
  lines.push(`Relatório IA (TCC)`)
  lines.push(`Paciente: ${patient?.name || ''}`)
  lines.push(`Atendimento: ${patient?.type || ''}`)
  lines.push(`Queixa: ${(patient?.chiefComplaint || '').slice(0, 300)}`)
  lines.push('Resumo de escalas:')
  lines.push(`• BAI: ${scales.BAI?.total || 0} (${scales.BAI?.nivel || ''})`)
  lines.push(`• BDI: ${scales.BDI?.total || 0} (${scales.BDI?.nivel || ''})`)
  const pssTotal = Math.max(scales.PSS10?.total || 0, scales.PSS14?.total || 0)
  lines.push(`• PSS: ${pssTotal}`)
  lines.push(`• Rosenberg: ${scales.ROSENBERG?.total || 0} (${scales.ROSENBERG?.nivel || ''})`)
  lines.push('Análise preditiva:')
  lines.push(`• Composto: ${predictive.composite}`)
  lines.push(`• Ansiedade: ${predictive.anxietyRisk}`)
  lines.push(`• Depressão: ${predictive.depressionRisk}`)
  lines.push(`• Estresse: ${predictive.stressRisk}`)
  lines.push(`• Autoestima: ${predictive.selfEsteemLevel}`)
  lines.push(`• Foco TCC: ${predictive.focus}`)
  if (predictive.flags && predictive.flags.length) {
    lines.push('Intervenções sugeridas:')
    predictive.flags.forEach(f => lines.push(`• ${f}`))
  }
  lines.push('Plano sugerido:')
  lines.push('• Metas SMART vinculadas à queixa principal e riscos')
  lines.push('• Tarefas: exposição graduada, ativação comportamental e técnicas cognitivas')
  lines.push('• Monitoramento de sono, rotina e estressores se aplicável')
  lines.push('• Treino de habilidades sociais/autoafirmação quando pertinente')
  if (anam) {
    lines.push('Dados de anamnese relevantes:')
    ;['medical','meds','sleep','nutrition','stressors','tccSituations','tccThoughts','tccEmotions','tccBehaviors','tccPhysical','tccCoreBeliefs','tccAssumptions','tccProtective','tccGoals'].forEach(k => { if (anam[k]) lines.push(`• ${k}: ${String(anam[k]).slice(0, 180)}`) })
  }
  return lines.join('\n')
}
function suggestSchemaFocus(risks, complaint, scales) {
  const flags = []
  let focus = 'Plano por modos e ressignificação de esquemas'
  if (risks.anxietyRisk === 'Alto') flags.push('Vulnerabilidade ao dano e catastrofização: psicoeducação, teste de realidade, exposição segura')
  if (risks.depressionRisk === 'Alto') flags.push('Fracasso/defeito-vergonha: reparenting limitado, experimentos de competência, rescrita de imagens')
  if (risks.stressRisk === 'Alto') flags.push('Padrões inflexíveis/exigência implacável: flexibilização de regras, auto-compaixão, agendamento restaurativo')
  if (risks.selfEsteemLevel === 'Baixa') flags.push('Defeito-vergonha/privação emocional: validação, ressignificação, vínculos seguros em tarefas graduais')
  if (/abandono|rejei[cç][aã]o|trai[cç][aã]o/i.test(complaint || '')) flags.push('Abandono/desconfiança: trabalho de modos criança vulnerável e adulto saudável')
  const bai = scales?.BAI?.total || 0
  const bdi = scales?.BDI?.total || 0
  const pss = Math.max(scales?.PSS10?.total || 0, scales?.PSS14?.total || 0)
  const ros = scales?.ROSENBERG?.total || 0
  if (bai >= 26) flags.push('Modo pai crítico ansioso: identificação e diálogo de modos')
  if (bdi >= 29) flags.push('Modo criança resignada: ativação do adulto saudável, engajamento comportamental')
  if (pss >= 27) flags.push('Modo hipercomprometido: limites, prioridade e descanso programado')
  if (ros <= 15) flags.push('Autoimagem negativa: diário de evidências e práticas de auto-suporte')
  return { focus, flags }
}
window.suggestSchemaFocus = suggestSchemaFocus
function buildReportTemplate(model, patient, entry, anam, goals) {
  if (!entry) return ''
  const base = `Paciente: ${patient?.name || ''}\nAbordagem: ${model}\nFoco: ${entry.predictive?.focus || ''}\nComposto: ${entry.predictive?.composite || 0}`
  if (model === 'Ansiedade') return base + `\nPrioridades: regulação emocional, exposição graduada, reestruturação cognitiva` 
  if (model === 'Depressão') return base + `\nPrioridades: ativação comportamental, rotina de sono, reestruturação cognitiva`
  if (model === 'Estresse') return base + `\nPrioridades: manejo de estressores, mindfulness, solução de problemas`
  if (model === 'Casais') return base + `\nPrioridades: comunicação assertiva, resolução de conflitos, alinhamento de metas`
  return base + `\nResumo: devolutiva padrão com metas e acompanhamento`
}
window.createAIReportFromPredictive = createAIReportFromPredictive
window.buildReportTemplate = buildReportTemplate
