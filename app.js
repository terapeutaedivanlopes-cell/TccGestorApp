const store = {
  load(key) { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } },
  save(key, data) { localStorage.setItem(key, JSON.stringify(data)) }
}

function uid() { return Math.random().toString(36).slice(2) }

function render(view) {
  const root = document.getElementById('view-container')
  root.innerHTML = ''
  if (view === 'cadastro') root.appendChild(renderCadastro())
  if (view === 'pacientes') root.appendChild(renderPacientes())
  if (view === 'anamnese') root.appendChild(renderAnamnese())
  if (view === 'escalas') root.appendChild(renderEscalas())
  if (view === 'historico') root.appendChild(renderHistorico())
  if (view === 'relatorio') root.appendChild(renderRelatorios())
  if (view === 'coleta') root.appendChild(renderColeta())
}

function navInit() {
  document.querySelectorAll('.nav button').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.nav button').forEach(x => x.classList.remove('active'))
      b.classList.add('active')
      render(b.dataset.view)
    })
  })
  const qs = new URLSearchParams(window.location.search)
  if (qs.get('collect') === '1') { const nav = document.querySelector('.nav'); if (nav) nav.style.display='none'; render('coleta') }
  else render('cadastro')
}

function renderCadastro() {
  const p = document.createElement('div')
  p.className = 'panel'
  const grid = document.createElement('div')
  grid.className = 'grid cols-2'
  const f = (label, type = 'text') => {
    const w = document.createElement('div'); w.className = 'field'
    const l = document.createElement('label'); l.textContent = label
    const i = document.createElement(type === 'textarea' ? 'textarea' : 'input')
    if (type !== 'textarea') i.type = type
    w.appendChild(l); w.appendChild(i); grid.appendChild(w); return i
  }
  const name = f('Nome')
  const dob = f('Nascimento', 'date')
  const sex = f('Sexo')
  const marital = f('Estado civil')
  const contact = f('Contato')
  const cadDate = f('Data de cadastro','date')
  const typeWrap = document.createElement('div'); typeWrap.className = 'field'
  const typeLabel = document.createElement('label'); typeLabel.textContent = 'Tipo de atendimento'
  const typeSel = document.createElement('select')
  ;['individual','casal'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; typeSel.appendChild(o) })
  typeWrap.appendChild(typeLabel); typeWrap.appendChild(typeSel); const typeHint=document.createElement('div'); typeHint.className='hint'; typeHint.textContent='Individual ou casal'; typeWrap.appendChild(typeHint)
  grid.appendChild(typeWrap)
  const partnerName = f('Nome parceiro(a)','text','Nome do parceiro(a) para casal')
  const partnerWrap = document.createElement('div'); partnerWrap.className = 'field'
  const partnerLabel = document.createElement('label'); partnerLabel.textContent = 'Parceiro (selecionar cadastro)'
  const partnerSel = document.createElement('select')
  const existing = store.load('patients')
  partnerSel.appendChild(Object.assign(document.createElement('option'), { value: '', textContent: 'Nenhum' }))
  existing.forEach(pa=>{ const o=document.createElement('option'); o.value=pa.id; o.textContent=pa.name; partnerSel.appendChild(o) })
  partnerWrap.appendChild(partnerLabel); partnerWrap.appendChild(partnerSel); const partnerHint=document.createElement('div'); partnerHint.className='hint'; partnerHint.textContent='Selecione o cadastro do parceiro(a)'; partnerWrap.appendChild(partnerHint)
  grid.appendChild(partnerWrap)
  typeSel.addEventListener('change', () => { partnerWrap.style.display = typeSel.value === 'casal' ? '' : 'none' })
  partnerWrap.style.display = 'none'
  const complaint = document.createElement('div'); complaint.className = 'field'
  const cl = document.createElement('label'); cl.textContent = 'Queixa principal'
  const ct = document.createElement('textarea')
  complaint.appendChild(cl); complaint.appendChild(ct); const cHint=document.createElement('div'); cHint.className='hint'; cHint.textContent='Motivo de busca por atendimento'; complaint.appendChild(cHint)
  p.appendChild(grid); p.appendChild(complaint)
  const actions = document.createElement('div'); actions.className = 'actions'
  const save = document.createElement('button'); save.className = 'btn success'; save.textContent = 'Salvar cadastro'
  let editingId = ''
  save.addEventListener('click', () => {
    const patients = store.load('patients')
    if (editingId) {
      const idx = patients.findIndex(p => p.id === editingId)
      if (idx > -1) {
        const prev = patients[idx]
        const ts = cadDate.value ? new Date(cadDate.value).getTime() : (prev.timestamp || Date.now())
        const reg = cadDate.value || new Date(ts).toISOString().slice(0,10)
        patients[idx] = { ...prev, name: name.value, dob: dob.value, sex: sex.value, marital_status: marital.value, contact: contact.value, type: typeSel.value, partnerName: partnerName.value, partnerId: partnerSel.value || '', chiefComplaint: ct.value, timestamp: ts, registeredAt: reg }
        store.save('patients', patients)
        alert('Cadastro atualizado')
        editingId = ''
        renderPatientList()
        return
      }
    }
    const id = uid()
    const ts = cadDate.value ? new Date(cadDate.value).getTime() : Date.now()
    const reg = cadDate.value || new Date(ts).toISOString().slice(0,10)
    patients.push({ id, timestamp: ts, registeredAt: reg, name: name.value, dob: dob.value, sex: sex.value, marital_status: marital.value, contact: contact.value, type: typeSel.value, partnerName: partnerName.value, partnerId: partnerSel.value || '', chiefComplaint: ct.value })
    store.save('patients', patients)
    alert('Paciente salvo')
    renderPatientList()
  })
  actions.appendChild(save)
  p.appendChild(actions)
  const listPanel = document.createElement('div'); listPanel.className='panel'
  const lt = document.createElement('div'); lt.textContent='Pacientes cadastrados'
  const lwrap = document.createElement('div'); lwrap.className='list'
  listPanel.appendChild(lt); listPanel.appendChild(lwrap)
  p.appendChild(listPanel)
  function renderPatientList(){
    const items = store.load('patients')
    lwrap.innerHTML = ''
    items.forEach(pa => {
      const li = document.createElement('div'); li.className = 'list-item'
      const left = document.createElement('div')
      const when = pa.registeredAt || (pa.timestamp ? new Date(pa.timestamp).toLocaleDateString() : 'sem data')
      left.textContent = `${pa.name} • cadastrado: ${when}`
      const right = document.createElement('div')
      const edit = document.createElement('button'); edit.className='btn'; edit.textContent='Editar'
      edit.addEventListener('click', () => {
        name.value = pa.name || ''
        dob.value = pa.dob || ''
        sex.value = pa.sex || ''
        marital.value = pa.marital_status || ''
        contact.value = pa.contact || ''
        typeSel.value = pa.type || 'individual'
        partnerWrap.style.display = typeSel.value === 'casal' ? '' : 'none'
        partnerName.value = pa.partnerName || ''
        partnerSel.value = pa.partnerId || ''
        ct.value = pa.chiefComplaint || ''
        cadDate.value = pa.registeredAt || (pa.timestamp ? new Date(pa.timestamp).toISOString().slice(0,10) : '')
        editingId = pa.id
      })
      const del = document.createElement('button'); del.className='btn danger'; del.textContent='Excluir'
      del.addEventListener('click', () => {
        if (confirm('Excluir cadastro do paciente?')) {
          const remaining = store.load('patients').filter(x => x.id !== pa.id)
          store.save('patients', remaining)
          renderPatientList()
        }
      })
      right.appendChild(edit); right.appendChild(del)
      li.appendChild(left); li.appendChild(right)
      lwrap.appendChild(li)
    })
  }
  setTimeout(() => renderPatientList(), 0)
  return p
}

function renderPacientes() {
  const p = document.createElement('div')
  p.className = 'panel'
  const listPanel = document.createElement('div'); listPanel.className='panel'
  const lt = document.createElement('div'); lt.textContent='Pacientes cadastrados'
  const lwrap = document.createElement('div'); lwrap.className='list'
  listPanel.appendChild(lt); listPanel.appendChild(lwrap)
  p.appendChild(listPanel)
  const editPanel = document.createElement('div'); editPanel.className='panel'
  const et = document.createElement('div'); et.textContent='Editar cadastro'
  const grid = document.createElement('div'); grid.className='grid cols-2'
  const f = (label, type = 'text', desc = '') => { const w=document.createElement('div'); w.className='field'; const l=document.createElement('label'); l.textContent=label; const i=document.createElement(type==='textarea'?'textarea':'input'); if(type!=='textarea') i.type=type; w.appendChild(l); w.appendChild(i); if (desc) { const h=document.createElement('div'); h.className='hint'; h.textContent=desc; w.appendChild(h) } grid.appendChild(w); return i }
  const name = f('Nome','text','Nome completo do paciente')
  const dob = f('Nascimento','date','Data de nascimento')
  const sex = f('Sexo','text','Sexo biológico')
  const marital = f('Estado civil','text','Situação civil atual')
  const contact = f('Contato','text','Telefone, email ou outro contato')
  const cadDate = f('Data de cadastro','date','Data de início do tratamento')
  const typeWrap = document.createElement('div'); typeWrap.className = 'field'
  const typeLabel = document.createElement('label'); typeLabel.textContent = 'Tipo de atendimento'
  const typeSel = document.createElement('select'); ['individual','casal'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; typeSel.appendChild(o) })
  typeWrap.appendChild(typeLabel); typeWrap.appendChild(typeSel); const typeHint2=document.createElement('div'); typeHint2.className='hint'; typeHint2.textContent='Individual ou casal'; grid.appendChild(typeWrap); typeWrap.appendChild(typeHint2)
  const partnerName = f('Nome parceiro(a)','text','Nome do parceiro(a) para casal')
  const partnerWrap = document.createElement('div'); partnerWrap.className = 'field'
  const partnerLabel = document.createElement('label'); partnerLabel.textContent = 'Parceiro (selecionar cadastro)'
  const partnerSel = document.createElement('select')
  partnerSel.appendChild(Object.assign(document.createElement('option'), { value: '', textContent: 'Nenhum' }))
  store.load('patients').forEach(pa=>{ const o=document.createElement('option'); o.value=pa.id; o.textContent=pa.name; partnerSel.appendChild(o) })
  partnerWrap.appendChild(partnerLabel); partnerWrap.appendChild(partnerSel); const partnerHint2=document.createElement('div'); partnerHint2.className='hint'; partnerHint2.textContent='Selecione o cadastro do parceiro(a)'; grid.appendChild(partnerWrap); partnerWrap.appendChild(partnerHint2)
  typeSel.addEventListener('change', () => { partnerWrap.style.display = typeSel.value === 'casal' ? '' : 'none' })
  partnerWrap.style.display = 'none'
  const complaint = document.createElement('div'); complaint.className = 'field'
  const cl = document.createElement('label'); cl.textContent = 'Queixa principal'
  const ct = document.createElement('textarea'); complaint.appendChild(cl); complaint.appendChild(ct); const cHint2=document.createElement('div'); cHint2.className='hint'; cHint2.textContent='Motivo de busca por atendimento'; complaint.appendChild(cHint2)
  editPanel.appendChild(et); editPanel.appendChild(grid); editPanel.appendChild(complaint)
  const actions = document.createElement('div'); actions.className='actions'
  const save = document.createElement('button'); save.className='btn success'; save.textContent='Salvar alterações'
  const exportBtn = document.createElement('button'); exportBtn.className='btn'; exportBtn.textContent='Exportar relatório de pacientes'
  let editingId = ''
  save.addEventListener('click', () => {
    if (!editingId) { alert('Selecione um paciente para editar'); return }
    const patients = store.load('patients')
    const idx = patients.findIndex(p => p.id === editingId)
    if (idx > -1) {
      const prev = patients[idx]
      const ts = cadDate.value ? new Date(cadDate.value).getTime() : (prev.timestamp || Date.now())
      const reg = cadDate.value || new Date(ts).toISOString().slice(0,10)
      patients[idx] = { ...prev, name: name.value, dob: dob.value, sex: sex.value, marital_status: marital.value, contact: contact.value, type: typeSel.value, partnerName: partnerName.value, partnerId: partnerSel.value || '', chiefComplaint: ct.value, timestamp: ts, registeredAt: reg }
      store.save('patients', patients)
      alert('Cadastro atualizado')
      editingId = ''
      renderList()
    }
  })
  exportBtn.addEventListener('click', () => { if (window.exportPatientsCatalogPDF) window.exportPatientsCatalogPDF() })
  actions.appendChild(save)
  actions.appendChild(exportBtn)
  editPanel.appendChild(actions)
  p.appendChild(editPanel)
  function renderList(){
    const items = store.load('patients')
    lwrap.innerHTML = ''
    items.forEach(pa => {
      const li = document.createElement('div'); li.className='list-item'
      const left = document.createElement('div'); const when = pa.timestamp ? new Date(pa.timestamp).toLocaleDateString() : 'sem data'; left.textContent = `${pa.name} • cadastrado: ${when}`
      const right = document.createElement('div')
      const selectBtn = document.createElement('button'); selectBtn.className='btn'; selectBtn.textContent='Selecionar'
      selectBtn.addEventListener('click', () => {
        name.value = pa.name || ''
        dob.value = pa.dob || ''
        sex.value = pa.sex || ''
        marital.value = pa.marital_status || ''
        contact.value = pa.contact || ''
        typeSel.value = pa.type || 'individual'
        partnerWrap.style.display = typeSel.value === 'casal' ? '' : 'none'
        partnerName.value = pa.partnerName || ''
        partnerSel.value = pa.partnerId || ''
        ct.value = pa.chiefComplaint || ''
        cadDate.value = pa.registeredAt || (pa.timestamp ? new Date(pa.timestamp).toISOString().slice(0,10) : '')
        editingId = pa.id
      })
      const del = document.createElement('button'); del.className='btn danger'; del.textContent='Excluir'
      del.addEventListener('click', () => { if (confirm('Excluir cadastro do paciente?')) { const remaining = store.load('patients').filter(x=>x.id!==pa.id); store.save('patients', remaining); renderList() } })
      right.appendChild(selectBtn); right.appendChild(del)
      li.appendChild(left); li.appendChild(right)
      lwrap.appendChild(li)
    })
    partnerSel.innerHTML = ''
    partnerSel.appendChild(Object.assign(document.createElement('option'), { value: '', textContent: 'Nenhum' }))
    store.load('patients').forEach(pa=>{ const o=document.createElement('option'); o.value=pa.id; o.textContent=pa.name; partnerSel.appendChild(o) })
  }
  setTimeout(() => renderList(), 0)
  return p
}

function renderAnamnese() {
  const p = document.createElement('div'); p.className = 'panel'
  const patients = store.load('patients')
  const selWrap = document.createElement('div'); selWrap.className = 'field'
  const sl = document.createElement('label'); sl.textContent = 'Paciente'
  const sel = document.createElement('select')
  patients.forEach(pa=>{ const o=document.createElement('option'); o.value=pa.id; o.textContent=pa.name; sel.appendChild(o) })
  selWrap.appendChild(sl); selWrap.appendChild(sel); const sh=document.createElement('div'); sh.className='hint'; sh.textContent='Selecione o paciente alvo'; selWrap.appendChild(sh)
  p.appendChild(selWrap)
  const grid = document.createElement('div'); grid.className = 'grid cols-2'
  const f = (label, type='text', desc='') => { const w=document.createElement('div'); w.className='field'; const l=document.createElement('label'); l.textContent=label; const i=document.createElement(type==='textarea'?'textarea':'input'); if(type!=='textarea') i.type=type; w.appendChild(l); w.appendChild(i); if (desc) { const h=document.createElement('div'); h.className='hint'; h.textContent=desc; w.appendChild(h) } grid.appendChild(w); return i }
  const medical = f('Histórico médico','textarea','Condições médicas relevantes e histórico')
  const meds = f('Medicações','textarea','Fármacos em uso')
  const sleep = f('Sono','text','Qualidade/horas de sono')
  const nutrition = f('Nutrição','text','Padrões alimentares')
  const stressors = f('Estressores','textarea','Fatores de estresse atuais')
  const tccSituations = f('Situações gatilho (TCC)','textarea','Contextos que disparam desconforto')
  const tccThoughts = f('Pensamentos automáticos (TCC)','textarea','Frases/imagens que surgem')
  const tccEmotions = f('Emoções associadas (TCC)','textarea','Sentimentos ligados às situações/pensamentos')
  const tccBehaviors = f('Comportamentos (TCC)','textarea','Respostas comportamentais observadas')
  const tccPhysical = f('Sintomas físicos (TCC)','textarea','Sinais corporais')
  const tccCoreBeliefs = f('Crenças centrais (TCC)','textarea','Crenças profundas sobre si/mundo')
  const tccAssumptions = f('Crenças/intermediárias e suposições (TCC)','textarea','Regras e pressupostos')
  const tccProtective = f('Recursos e fatores de proteção (TCC)','textarea','Rede de apoio e habilidades')
  const tccGoals = f('Metas iniciais (TCC)','textarea','Objetivos terapêuticos')
  const actions = document.createElement('div'); actions.className='actions'
  const save = document.createElement('button'); save.className='btn success'; save.textContent='Salvar anamnese'
  let editingId = ''
  save.addEventListener('click', () => {
    const anam = store.load('anamneses')
    if (editingId) {
      const idx = anam.findIndex(a => a.id === editingId)
      if (idx > -1) {
        anam[idx] = { ...anam[idx], medical: medical.value, meds: meds.value, sleep: sleep.value, nutrition: nutrition.value, stressors: stressors.value, tccSituations: tccSituations.value, tccThoughts: tccThoughts.value, tccEmotions: tccEmotions.value, tccBehaviors: tccBehaviors.value, tccPhysical: tccPhysical.value, tccCoreBeliefs: tccCoreBeliefs.value, tccAssumptions: tccAssumptions.value, tccProtective: tccProtective.value, tccGoals: tccGoals.value }
        store.save('anamneses', anam)
        editingId = ''
        alert('Anamnese atualizada')
        renderList()
        return
      }
    }
    anam.push({ id: uid(), patientId: sel.value, timestamp: Date.now(), medical: medical.value, meds: meds.value, sleep: sleep.value, nutrition: nutrition.value, stressors: stressors.value, tccSituations: tccSituations.value, tccThoughts: tccThoughts.value, tccEmotions: tccEmotions.value, tccBehaviors: tccBehaviors.value, tccPhysical: tccPhysical.value, tccCoreBeliefs: tccCoreBeliefs.value, tccAssumptions: tccAssumptions.value, tccProtective: tccProtective.value, tccGoals: tccGoals.value })
    store.save('anamneses', anam)
    alert('Anamnese salva')
    renderList()
  })
  actions.appendChild(save)
  p.appendChild(grid); p.appendChild(actions)
  const listPanel = document.createElement('div'); listPanel.className='panel'
  const lt = document.createElement('div'); lt.textContent='Anamneses do paciente'
  const lwrap = document.createElement('div'); lwrap.className='list'
  listPanel.appendChild(lt); listPanel.appendChild(lwrap)
  p.appendChild(listPanel)
  function renderList(){
    const items = store.load('anamneses').filter(a=>a.patientId===sel.value)
    lwrap.innerHTML=''
    items.forEach(a => {
      const li=document.createElement('div'); li.className='list-item'
      const left=document.createElement('div'); left.textContent=`${new Date(a.timestamp).toLocaleString()} • sono: ${a.sleep || ''} • nutrição: ${a.nutrition || ''} • TCC: ${[(a.tccSituations||''),(a.tccThoughts||''),(a.tccCoreBeliefs||'')].filter(x=>x).slice(0,1).join(' ')}`
      const right=document.createElement('div')
      const edit=document.createElement('button'); edit.className='btn'; edit.textContent='Editar'
      edit.addEventListener('click', () => { medical.value=a.medical||''; meds.value=a.meds||''; sleep.value=a.sleep||''; nutrition.value=a.nutrition||''; stressors.value=a.stressors||''; tccSituations.value=a.tccSituations||''; tccThoughts.value=a.tccThoughts||''; tccEmotions.value=a.tccEmotions||''; tccBehaviors.value=a.tccBehaviors||''; tccPhysical.value=a.tccPhysical||''; tccCoreBeliefs.value=a.tccCoreBeliefs||''; tccAssumptions.value=a.tccAssumptions||''; tccProtective.value=a.tccProtective||''; tccGoals.value=a.tccGoals||''; editingId=a.id })
      const del=document.createElement('button'); del.className='btn danger'; del.textContent='Excluir'
      del.addEventListener('click', () => { if (confirm('Excluir anamnese?')) { const all=store.load('anamneses').filter(x=>x.id!==a.id); store.save('anamneses', all); renderList() } })
      right.appendChild(edit); right.appendChild(del)
      li.appendChild(left); li.appendChild(right)
      lwrap.appendChild(li)
    })
  }
  sel.addEventListener('change', () => { editingId=''; renderList() })
  setTimeout(() => renderList(), 0)
  return p
}

function renderEscalas() {
  const p = document.createElement('div'); p.className='panel'
  const patients = store.load('patients')
  const selWrap = document.createElement('div'); selWrap.className='field'
  const sl = document.createElement('label'); sl.textContent='Paciente'
  const sel = document.createElement('select')
  patients.forEach(pa=>{ const o=document.createElement('option'); o.value=pa.id; o.textContent=pa.name; sel.appendChild(o) })
  selWrap.appendChild(sl); selWrap.appendChild(sel); const sh2=document.createElement('div'); sh2.className='hint'; sh2.textContent='Selecione o paciente alvo'; selWrap.appendChild(sh2)
  p.appendChild(selWrap)
  const tabs = document.createElement('div'); tabs.className='tabs'
  const tabKeys = ['BAI','BDI','PSS10','PSS14','ROSENBERG','YSQ','QEP','RIED']
  tabKeys.forEach(k=>{ const b=document.createElement('button'); b.textContent=k; b.addEventListener('click',()=>show(k)); tabs.appendChild(b) })
  p.appendChild(tabs)
  const area = document.createElement('div')
  p.appendChild(area)
  const forms = {}
  const settings = document.createElement('div'); settings.className = 'panel'
  const wTitle = document.createElement('div'); wTitle.textContent = 'Pesos do composto (0–3) e escolha PSS'
  const wGrid = document.createElement('div'); wGrid.className = 'grid cols-3'
  const wf = (label) => { const w=document.createElement('div'); w.className='field'; const l=document.createElement('label'); l.textContent=label; const i=document.createElement('input'); i.type='number'; i.min='0'; i.max='3'; i.value='1'; w.appendChild(l); w.appendChild(i); wGrid.appendChild(w); return i }
  const wbai = wf('Peso BAI'); const wbdi = wf('Peso BDI'); const wpss = wf('Peso PSS'); const wros = wf('Peso Rosenberg')
  const pssChoiceWrap = document.createElement('div'); pssChoiceWrap.className='field'
  const pcl = document.createElement('label'); pcl.textContent='PSS para composto'
  const psel = document.createElement('select'); ['auto','10','14'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; psel.appendChild(o) })
  pssChoiceWrap.appendChild(pcl); pssChoiceWrap.appendChild(psel); const ph=document.createElement('div'); ph.className='hint'; ph.textContent='Escolha qual PSS usar no composto'; pssChoiceWrap.appendChild(ph)
  settings.appendChild(wTitle); settings.appendChild(wGrid); settings.appendChild(pssChoiceWrap)
  p.appendChild(settings)
  const noteWrap = document.createElement('div'); noteWrap.className='field'
  const nl = document.createElement('label'); nl.textContent='Observação da avaliação'
  const ntext = document.createElement('textarea'); noteWrap.appendChild(nl); noteWrap.appendChild(ntext)
  p.appendChild(noteWrap)
  const emailPanel = document.createElement('div'); emailPanel.className='panel'
  const elab = document.createElement('div'); elab.textContent='Enviar escala por email (coleta online)'
  const eGrid = document.createElement('div'); eGrid.className='grid cols-3'
  const ef = (label, desc = '') => { const w=document.createElement('div'); w.className='field'; const l=document.createElement('label'); l.textContent=label; const i=document.createElement('input'); i.type='text'; w.appendChild(l); w.appendChild(i); if (desc) { const h=document.createElement('div'); h.className='hint'; h.textContent=desc; w.appendChild(h) } eGrid.appendChild(w); return i }
  const ePatientName = ef('Nome do paciente','Nome que aparecerá no link')
  const eEmail = ef('Email destino','Email para envio automático das respostas')
  const eEmailConfirm = ef('Confirmar email destino','Repita o email para validação')
  const eScaleWrap = document.createElement('div'); eScaleWrap.className='field'; const esl=document.createElement('label'); esl.textContent='Escala'; const eScale=document.createElement('select'); ['BAI','BDI','PSS10','PSS14','ROSENBERG','YSQ','QEP','RIED'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; eScale.appendChild(o) }); eScaleWrap.appendChild(esl); eScaleWrap.appendChild(eScale); eGrid.appendChild(eScaleWrap)
  const eScaleHint=document.createElement('div'); eScaleHint.className='hint'; eScaleHint.textContent='Selecione a escala a coletar'; eScaleWrap.appendChild(eScaleHint)
  const gen = document.createElement('button'); gen.className='btn'; gen.textContent='Gerar link'
  const copy = document.createElement('button'); copy.className='btn'; copy.textContent='Copiar link'
  const outLink = document.createElement('div'); outLink.className='field'
  const ol = document.createElement('label'); ol.textContent='Link para envio'
  const oi = document.createElement('input'); oi.type='text'; outLink.appendChild(ol); outLink.appendChild(oi)
  gen.addEventListener('click', () => {
    if ((eEmail.value||'').trim() !== (eEmailConfirm.value||'').trim()) { alert('Emails não conferem'); return }
    const base = window.location.origin + window.location.pathname
    const url = `${base}?collect=1&scale=${encodeURIComponent(eScale.value)}&patient=${encodeURIComponent(ePatientName.value||'')}&to=${encodeURIComponent(eEmail.value||'')}`
    oi.value = url
  })
  copy.addEventListener('click', () => {
    const v = oi.value || ''
    if (!v) { alert('Nenhum link gerado'); return }
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(v).then(()=>alert('Link copiado')).catch(()=>alert('Falha ao copiar')) } else { oi.select(); try { const ok=document.execCommand('copy'); alert(ok?'Link copiado':'Falha ao copiar') } catch { alert('Falha ao copiar') } }
  })
  emailPanel.appendChild(elab); emailPanel.appendChild(eGrid); emailPanel.appendChild(gen); emailPanel.appendChild(copy); emailPanel.appendChild(outLink)
  p.appendChild(emailPanel)
  function show(k) {
    area.innerHTML=''
    const def = SCALE_DEFS[k]
    const { container, controls, scoreEl } = buildScaleForm(def)
    forms[k] = { controls, scoreEl }
    area.appendChild(container)
  }
  show('BAI')
  const actions = document.createElement('div'); actions.className='actions'
  const save = document.createElement('button'); save.className='btn success'; save.textContent='Salvar avaliação'
  save.addEventListener('click', () => {
    const payload = {}
    tabKeys.forEach(k=>{ const c=forms[k]?.controls||[]; payload[k]=c.map(x=>Number(x.value)||0) })
    const assessment = computeAllScales(payload)
    const anam = store.load('anamneses').filter(a=>a.patientId===sel.value).slice(-1)[0]
    const patient = store.load('patients').find(p=>p.id===sel.value)
    const predictive = analyzePredictive(assessment, patient?.chiefComplaint, anam, { bai: Number(wbai.value)||0, bdi: Number(wbdi.value)||0, pss: Number(wpss.value)||0, ros: Number(wros.value)||0 }, psel.value)
    const entries = store.load('entries')
    entries.push({ id: uid(), patientId: sel.value, timestamp: Date.now(), assessment, predictive, note: ntext.value || '' })
    store.save('entries', entries)
    alert('Avaliação salva')
  })
  const report = document.createElement('button'); report.className='btn primary'; report.textContent='Gerar relatório em PDF'
  report.addEventListener('click', () => {
    const entries = store.load('entries').filter(e=>e.patientId===sel.value)
    if (!entries.length) return alert('Sem avaliações')
    const entry = entries[entries.length-1]
    const patient = store.load('patients').find(p=>p.id===sel.value)
    exportReportPDF(patient, entry)
  })
  const aiBtn = document.createElement('button'); aiBtn.className='btn'; aiBtn.textContent='Relatório IA (TCC)'
  aiBtn.addEventListener('click', () => {
    const entries = store.load('entries').filter(e=>e.patientId===sel.value)
    if (!entries.length) return alert('Sem avaliações')
    const entry = entries[entries.length-1]
    const patient = store.load('patients').find(p=>p.id===sel.value)
    const anam = store.load('anamneses').filter(a=>a.patientId===sel.value).slice(-1)[0]
    const text = createAIReportFromPredictive(entry.assessment, entry.predictive, patient, anam)
    const reports = store.load('reports')
    reports.push({ id: uid(), patientId: sel.value, timestamp: Date.now(), approach: entry.predictive.focus, text })
    store.save('reports', reports)
    alert('Relatório IA salvo em Relatórios')
  })
  actions.appendChild(save); actions.appendChild(report); actions.appendChild(aiBtn)
  p.appendChild(actions)
  return p
}

function renderColeta() {
  const qs = new URLSearchParams(window.location.search)
  const scaleId = qs.get('scale') || 'BAI'
  const to = qs.get('to') || ''
  const patientName = qs.get('patient') || ''
  const p = document.createElement('div'); p.className='panel compact'
  const info = document.createElement('div'); info.className='list'
  const r1 = document.createElement('div'); r1.className='list-item'; r1.textContent = `Paciente: ${patientName}`
  const r2 = document.createElement('div'); r2.className='list-item'; r2.textContent = `Escala: ${scaleId}`
  info.appendChild(r1); info.appendChild(r2); p.appendChild(info)
  const area = document.createElement('div')
  p.appendChild(area)
  const def = window.SCALE_DEFS[scaleId]
  const { container, controls, scoreEl } = window.buildScaleForm(def)
  area.appendChild(container)
  const actions = document.createElement('div'); actions.className='actions'
  const send = document.createElement('button'); send.className='btn success'; send.textContent='Enviar por email'
  const download = document.createElement('button'); download.className='btn'; download.textContent='Baixar arquivo'
  send.addEventListener('click', () => {
    const values = controls.map(x=>Number(x.value)||0)
    const res = def.compute(values)
    const payload = { patient: patientName, scale: scaleId, values, total: res.total, nivel: res.nivel, timestamp: Date.now() }
    const subject = `Respostas ${scaleId} - ${patientName}`
    const body = encodeURIComponent(JSON.stringify(payload, null, 2))
    const mail = to ? `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${body}` : `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`
    window.location.href = mail
  })
  download.addEventListener('click', () => {
    const values = controls.map(x=>Number(x.value)||0)
    const res = def.compute(values)
    const payload = { patient: patientName, scale: scaleId, values, total: res.total, nivel: res.nivel, timestamp: Date.now() }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `respostas_${scaleId}_${(patientName||'').replace(/\s+/g,'_')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  })
  actions.appendChild(send); actions.appendChild(download)
  p.appendChild(actions)
  return p
}

function renderHistorico() {
  const p = document.createElement('div'); p.className='panel compact'
  const patients = store.load('patients')
  const selWrap = document.createElement('div'); selWrap.className='field'
  const sl = document.createElement('label'); sl.textContent='Paciente'
  const sel = document.createElement('select')
  patients.forEach(pa=>{ const o=document.createElement('option'); o.value=pa.id; o.textContent=pa.name; sel.appendChild(o) })
  selWrap.appendChild(sl); selWrap.appendChild(sel); const sh3=document.createElement('div'); sh3.className='hint'; sh3.textContent='Selecione o paciente alvo'; selWrap.appendChild(sh3)
  p.appendChild(selWrap)
  const iaPanel = document.createElement('div'); iaPanel.className='panel'
  const iaTitle = document.createElement('div'); iaTitle.textContent='IA: Evolução e Sugestões'
  const iaBox = document.createElement('div'); iaBox.className='list'
  iaPanel.appendChild(iaTitle); iaPanel.appendChild(iaBox); p.appendChild(iaPanel)
  const charts = document.createElement('div'); charts.className='grid cols-2'
  const b1=document.createElement('div'); b1.className='chart-box compact'; const c1=document.createElement('canvas'); b1.appendChild(c1)
  const b2=document.createElement('div'); b2.className='chart-box compact'; const c2=document.createElement('canvas'); b2.appendChild(c2)
  const b3=document.createElement('div'); b3.className='chart-box compact'; const c3=document.createElement('canvas'); b3.appendChild(c3)
  const b4=document.createElement('div'); b4.className='chart-box compact'; const c4=document.createElement('canvas'); b4.appendChild(c4)
  const b5=document.createElement('div'); b5.className='chart-box compact'; const c5=document.createElement('canvas'); b5.appendChild(c5)
  const b6=document.createElement('div'); b6.className='chart-box compact'; const c6=document.createElement('canvas'); b6.appendChild(c6)
  const b7=document.createElement('div'); b7.className='chart-box compact'; const c7=document.createElement('canvas'); b7.appendChild(c7)
  charts.appendChild(b1); charts.appendChild(b2); charts.appendChild(b3); charts.appendChild(b4); charts.appendChild(b5); charts.appendChild(b6); charts.appendChild(b7)
  p.appendChild(charts)
  const predBox = document.createElement('div'); predBox.className='chart-box compact'; const predCanvas=document.createElement('canvas'); predBox.appendChild(predCanvas); p.appendChild(predBox)
  const radarBox = document.createElement('div'); radarBox.className='chart-box compact'
  const rc = document.createElement('canvas'); radarBox.appendChild(rc); p.appendChild(radarBox)
  const manage = document.createElement('div'); manage.className='panel'
  const mTitle = document.createElement('div'); mTitle.textContent='Gestão do histórico'
  const mList = document.createElement('div'); mList.className='list'
  manage.appendChild(mTitle); manage.appendChild(mList); p.appendChild(manage)
  const refresh = () => {
    const history = store.load('entries').filter(e=>e.patientId===sel.value)
    if (!history.length) return
    const patient = store.load('patients').find(p=>p.id===sel.value)
    const last = history[history.length-1]
    const trend = trendFromHistory(history)
    const schema = suggestSchemaFocus({ anxietyRisk: last.predictive.anxietyRisk, depressionRisk: last.predictive.depressionRisk, stressRisk: last.predictive.stressRisk, selfEsteemLevel: last.predictive.selfEsteemLevel }, patient?.chiefComplaint, last.assessment)
    iaBox.innerHTML=''
    const row1=document.createElement('div'); row1.className='list-item'; row1.textContent=`Composto: ${last.predictive.composite} • Evolução: ${trend}`; iaBox.appendChild(row1)
    const row2=document.createElement('div'); row2.className='list-item'; row2.textContent=`BAI ${last.assessment.BAI.total} • BDI ${last.assessment.BDI.total} • PSS ${Math.max(last.assessment.PSS10?.total||0,last.assessment.PSS14?.total||0)} • Rosenberg ${last.assessment.ROSENBERG.total}`; iaBox.appendChild(row2)
    const row3=document.createElement('div'); row3.className='list-item'; row3.textContent=`TCC: ${last.predictive.focus}`; iaBox.appendChild(row3)
    if (last.predictive.flags?.length) { const f=document.createElement('div'); f.className='list-item'; f.textContent=`Sinais/Intervenções TCC: ${last.predictive.flags.join(' | ')}`; iaBox.appendChild(f) }
    const row4=document.createElement('div'); row4.className='list-item'; row4.textContent=`Terapia do Esquema: ${schema.focus}`; iaBox.appendChild(row4)
    if (schema.flags?.length) { const s=document.createElement('div'); s.className='list-item'; s.textContent=`Sugestões Esquemas: ${schema.flags.join(' | ')}`; iaBox.appendChild(s) }
    renderPredictiveComposite(predCanvas, history)
    if (patient?.partnerId) {
      const ph = store.load('entries').filter(e=>e.patientId===patient.partnerId)
      if (ph.length) {
        renderHistoryChartsMulti({ bai: c1, bdi: c2, pss: c3, ros: c4, ysq: c5, qep: c6, ried: c7 }, [ { label: patient.name, history }, { label: 'Parceiro', history: ph } ])
      } else {
        renderHistoryCharts({ bai: c1, bdi: c2, pss: c3, ros: c4, ysq: c5, qep: c6, ried: c7 }, history)
      }
    } else {
      renderHistoryCharts({ bai: c1, bdi: c2, pss: c3, ros: c4, ysq: c5, qep: c6, ried: c7 }, history)
    }
    renderRadar(rc, history[history.length-1].assessment)
    mList.innerHTML=''
    history.forEach(h => {
      const li=document.createElement('div'); li.className='list-item'
      const left = document.createElement('div'); left.textContent=`${new Date(h.timestamp).toLocaleString()} • composto ${h.predictive?.composite || 0}`
      const right = document.createElement('div')
      const edit = document.createElement('button'); edit.className='btn'; edit.textContent='Editar observação'
      edit.addEventListener('click', () => {
        const note = prompt('Observação', h.note || '')
        if (note !== null) { const entries=store.load('entries'); const idx=entries.findIndex(x=>x.id===h.id); if(idx>-1){ entries[idx].note = note; store.save('entries', entries); refresh() } }
      })
      const del = document.createElement('button'); del.className='btn danger'; del.textContent='Excluir'
      del.addEventListener('click', () => { if (confirm('Excluir avaliação?')) { const entries=store.load('entries').filter(x=>x.id!==h.id); store.save('entries', entries); refresh() } })
      right.appendChild(edit); right.appendChild(del)
      li.appendChild(left); li.appendChild(right)
      mList.appendChild(li)
    })
  }
  sel.addEventListener('change', refresh)
  setTimeout(refresh, 0)
  return p
}

function renderRelatorios() {
  const p = document.createElement('div'); p.className='panel'
  const patients = store.load('patients')
  const selWrap = document.createElement('div'); selWrap.className='field'
  const sl = document.createElement('label'); sl.textContent='Paciente'
  const sel = document.createElement('select')
  patients.forEach(pa=>{ const o=document.createElement('option'); o.value=pa.id; o.textContent=pa.name; sel.appendChild(o) })
  selWrap.appendChild(sl); selWrap.appendChild(sel)
  p.appendChild(selWrap)
  const iaPanel = document.createElement('div'); iaPanel.className='panel'
  const iaTitle = document.createElement('div'); iaTitle.textContent='IA: Predição e sugestões'
  const iaBox = document.createElement('div'); iaBox.className='list'
  iaPanel.appendChild(iaTitle); iaPanel.appendChild(iaBox); p.appendChild(iaPanel)
  const approachWrap = document.createElement('div'); approachWrap.className='field'
  const al = document.createElement('label'); al.textContent='Abordagem de tratamento'
  const asel = document.createElement('select'); ['TCC padrão','Ansiedade','Depressão','Estresse','Casais'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; asel.appendChild(o) })
  approachWrap.appendChild(al); approachWrap.appendChild(asel); p.appendChild(approachWrap)
  const generate = document.createElement('button'); generate.className='btn primary'; generate.textContent='Gerar relatório geral'
  const out = document.createElement('div'); out.className='panel'
  const outFieldWrap = document.createElement('div'); outFieldWrap.className='field'
  const outLabel = document.createElement('label'); outLabel.textContent='Conteúdo do relatório'
  const outText = document.createElement('textarea'); outText.rows = 8
  outFieldWrap.appendChild(outLabel); outFieldWrap.appendChild(outText)
  out.appendChild(outFieldWrap)
  const goalsWrap = document.createElement('div'); goalsWrap.className='panel'
  const gl = document.createElement('div'); gl.textContent='Metas do plano terapêutico'
  const gGrid = document.createElement('div'); gGrid.className='grid cols-2'
  const gf = (label, type='text') => { const w=document.createElement('div'); w.className='field'; const l=document.createElement('label'); l.textContent=label; const i=document.createElement(type==='textarea'?'textarea':'input'); if(type!=='textarea') i.type=type; w.appendChild(l); w.appendChild(i); gGrid.appendChild(w); return i }
  const gTitle = gf('Meta (SMART)','textarea'); const gIndicator = gf('Indicador'); const gDue = gf('Prazo','date')
  const gStatusWrap = document.createElement('div'); gStatusWrap.className='field'; const gsl=document.createElement('label'); gsl.textContent='Status'; const gs=document.createElement('select'); ['em_progresso','concluida','pausada'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; gs.appendChild(o) }); gStatusWrap.appendChild(gsl); gStatusWrap.appendChild(gs); gGrid.appendChild(gStatusWrap)
  const gActions = document.createElement('div'); gActions.className='actions'
  const gSave = document.createElement('button'); gSave.className='btn success'; gSave.textContent='Salvar meta'
  const gList = document.createElement('div'); gList.className='list'
  gSave.addEventListener('click', () => {
    const goals = store.load('goals')
    goals.push({ id: uid(), patientId: sel.value, title: gTitle.value, indicator: gIndicator.value, due: gDue.value, status: gs.value, timestamp: Date.now() })
    store.save('goals', goals)
    renderGoals()
  })
  gActions.appendChild(gSave)
  goalsWrap.appendChild(gl); goalsWrap.appendChild(gGrid); goalsWrap.appendChild(gActions); goalsWrap.appendChild(gList)
  p.appendChild(goalsWrap)
  function refreshIA() {
    const entries = store.load('entries').filter(e=>e.patientId===sel.value)
    iaBox.innerHTML=''
    if (!entries.length) return
    const last = entries[entries.length-1]
    const patient = store.load('patients').find(p=>p.id===sel.value)
    const trend = trendFromHistory(entries)
    const schema = suggestSchemaFocus({ anxietyRisk: last.predictive.anxietyRisk, depressionRisk: last.predictive.depressionRisk, stressRisk: last.predictive.stressRisk, selfEsteemLevel: last.predictive.selfEsteemLevel }, patient?.chiefComplaint, last.assessment)
    const r1=document.createElement('div'); r1.className='list-item'; r1.textContent=`Composto: ${last.predictive.composite} • Evolução: ${trend}`; iaBox.appendChild(r1)
    const r2=document.createElement('div'); r2.className='list-item'; r2.textContent=`TCC: ${last.predictive.focus}`; iaBox.appendChild(r2)
    if (last.predictive.flags?.length) { const r3=document.createElement('div'); r3.className='list-item'; r3.textContent=`Intervenções TCC: ${last.predictive.flags.join(' | ')}`; iaBox.appendChild(r3) }
    const r4=document.createElement('div'); r4.className='list-item'; r4.textContent=`Esquemas: ${schema.focus}`; iaBox.appendChild(r4)
    if (schema.flags?.length) { const r5=document.createElement('div'); r5.className='list-item'; r5.textContent=`Sugestões: ${schema.flags.join(' | ')}`; iaBox.appendChild(r5) }
  }
  function renderGoals(){
    const items = store.load('goals').filter(g=>g.patientId===sel.value)
    gList.innerHTML = ''
    items.forEach(g=>{ 
      const li=document.createElement('div'); li.className='list-item'
      const left=document.createElement('div'); left.textContent=`${g.title} • Indicador: ${g.indicator} • Prazo: ${g.due} • Status: ${g.status}`
      const right=document.createElement('div')
      const edit=document.createElement('button'); edit.className='btn'; edit.textContent='Editar'
      edit.addEventListener('click', () => {
        const title = prompt('Meta (SMART)', g.title || '')
        if (title === null) return
        const indicator = prompt('Indicador', g.indicator || '')
        if (indicator === null) return
        const due = prompt('Prazo (YYYY-MM-DD)', g.due || '')
        if (due === null) return
        const status = prompt('Status (em_progresso/concluida/pausada)', g.status || 'em_progresso')
        if (status === null) return
        const all = store.load('goals')
        const idx = all.findIndex(x => x.id === g.id)
        if (idx > -1) { all[idx] = { ...all[idx], title, indicator, due, status }; store.save('goals', all); renderGoals() }
      })
      const del=document.createElement('button'); del.className='btn danger'; del.textContent='Excluir'
      del.addEventListener('click', () => { if (confirm('Excluir meta?')) { const all=store.load('goals').filter(x=>x.id!==g.id); store.save('goals', all); renderGoals() } })
      right.appendChild(edit); right.appendChild(del)
      li.appendChild(left); li.appendChild(right)
      gList.appendChild(li) 
    })
  }
  generate.addEventListener('click', () => {
    const entries = store.load('entries').filter(e=>e.patientId===sel.value)
    const anam = store.load('anamneses').filter(a=>a.patientId===sel.value)
    if (!entries.length) return alert('Sem avaliações')
    const last = entries[entries.length-1]
    const trend = trendFromHistory(entries)
    const patient = store.load('patients').find(p=>p.id===sel.value)
    const goals = store.load('goals').filter(g=>g.patientId===sel.value)
    const text = `Relatório Geral\nPaciente: ${patient.name}\nAbordagem: ${asel.value}\nTendência: ${trend}\nFoco TCC: ${last.predictive.focus}\nComposto: ${last.predictive.composite}\nBAI: ${last.assessment.BAI.total} (${last.assessment.BAI.nivel})\nBDI: ${last.assessment.BDI.total} (${last.assessment.BDI.nivel})\nPSS: ${Math.max(last.assessment.PSS10?.total||0,last.assessment.PSS14?.total||0)}\nRosenberg: ${last.assessment.ROSENBERG.total} (${last.assessment.ROSENBERG.nivel})\nAnamnese registros: ${anam.length}\nMetas registradas: ${goals.length}`
    outText.value = text
    const reports = store.load('reports')
    reports.push({ id: uid(), patientId: sel.value, timestamp: Date.now(), approach: asel.value, text })
    store.save('reports', reports)
  })
  const exportBtn = document.createElement('button'); exportBtn.className='btn success'; exportBtn.textContent='Exportar PDF'
  exportBtn.addEventListener('click', () => {
    const entries = store.load('entries').filter(e=>e.patientId===sel.value)
    if (!entries.length) return
    const entry = entries[entries.length-1]
    const patient = store.load('patients').find(p=>p.id===sel.value)
    exportReportPDF(patient, entry)
  })
  const actions = document.createElement('div'); actions.className='actions'
  const exportTextBtn = document.createElement('button'); exportTextBtn.className='btn'; exportTextBtn.textContent='Exportar PDF (texto)'
  exportTextBtn.addEventListener('click', () => {
    const patient = store.load('patients').find(p=>p.id===sel.value)
    exportCustomTextPDF(patient, outText.value || '')
  })
  const exportAnalyticsBtn = document.createElement('button'); exportAnalyticsBtn.className='btn'; exportAnalyticsBtn.textContent='Exportar PDF (analítico)'
  exportAnalyticsBtn.addEventListener('click', () => { const patient = store.load('patients').find(p=>p.id===sel.value); exportAnalyticsPDF(patient) })
  const exportBackupBtn = document.createElement('button'); exportBackupBtn.className='btn'; exportBackupBtn.textContent='Exportar backup (JSON)'
  const importBackupBtn = document.createElement('button'); importBackupBtn.className='btn'; importBackupBtn.textContent='Importar backup (JSON)'
  const importFile = document.createElement('input'); importFile.type='file'; importFile.accept='.json'; importFile.style.display='none'
  importFile.addEventListener('change', () => {
    const file = importFile.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result||'{}'))
        const keys = ['patients','anamneses','entries','goals','sessions','reports']
        keys.forEach(k => { if (data[k] !== undefined) localStorage.setItem(k, JSON.stringify(data[k])) })
        alert('Backup importado com sucesso')
      } catch { alert('Falha ao importar backup') }
    }
    reader.readAsText(file)
  })
  importBackupBtn.addEventListener('click', () => importFile.click())
  exportBackupBtn.addEventListener('click', () => {
    const payload = {
      patients: store.load('patients'),
      anamneses: store.load('anamneses'),
      entries: store.load('entries'),
      goals: store.load('goals'),
      sessions: store.load('sessions'),
      reports: store.load('reports')
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    const d = new Date(); const yyyy = d.getFullYear(); const mm = String(d.getMonth()+1).padStart(2,'0'); const dd = String(d.getDate()).padStart(2,'0')
    a.download = `backup_tcc_gestor_${yyyy}${mm}${dd}.json`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
  })
  actions.appendChild(generate); actions.appendChild(exportBtn); actions.appendChild(exportTextBtn)
  actions.appendChild(exportAnalyticsBtn)
  actions.appendChild(exportBackupBtn)
  actions.appendChild(importBackupBtn)
  actions.appendChild(importFile)
  p.appendChild(actions)
  p.appendChild(out)
  const importPanel = document.createElement('div'); importPanel.className='panel'
  const ilab = document.createElement('div'); ilab.textContent='Importar respostas (JSON) para o paciente selecionado'
  const iwrap = document.createElement('div'); iwrap.className='field'
  const il = document.createElement('label'); il.textContent='Conteúdo JSON'
  const it = document.createElement('textarea'); it.rows = 6
  iwrap.appendChild(il); iwrap.appendChild(it)
  const iActions = document.createElement('div'); iActions.className='actions'
  const iUpload = document.createElement('input'); iUpload.type='file'; iUpload.accept='.json'
  const iImport = document.createElement('button'); iImport.className='btn success'; iImport.textContent='Importar respostas'
  iUpload.addEventListener('change', () => { const f=iUpload.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ it.value=String(r.result||'') }; r.readAsText(f) })
  iImport.addEventListener('click', () => {
    try {
      const payload = JSON.parse(it.value || '{}')
      const scaleId = String(payload.scale || '')
      if (!scaleId) return alert('JSON sem campo scale')
      const def = window.SCALE_DEFS[scaleId]
      if (!def) return alert('Escala inválida no JSON')
      const values = Array.isArray(payload.values) ? payload.values.map(v=>Number(v)||0) : []
      const comp = def.compute(values)
      const assessment = {}
      assessment[scaleId] = { values, total: comp.total, nivel: comp.nivel }
      const patient = store.load('patients').find(p=>p.id===sel.value)
      const anam = store.load('anamneses').filter(a=>a.patientId===sel.value).slice(-1)[0]
      const predictive = analyzePredictive(assessment, patient?.chiefComplaint, anam)
      const entries = store.load('entries')
      entries.push({ id: uid(), patientId: sel.value, timestamp: Number(payload.timestamp)||Date.now(), assessment, predictive, note: 'Importado via coleta online' })
      store.save('entries', entries)
      alert('Respostas importadas')
      it.value = ''
    } catch { alert('JSON inválido') }
  })
  iActions.appendChild(iUpload); iActions.appendChild(iImport)
  importPanel.appendChild(ilab); importPanel.appendChild(iwrap); importPanel.appendChild(iActions)
  p.appendChild(importPanel)
  sel.addEventListener('change', () => { renderGoals(); refreshIA() })
  setTimeout(() => { renderGoals(); refreshIA() }, 0)
  const sessionsWrap = document.createElement('div'); sessionsWrap.className='panel'
  const slTitle = document.createElement('div'); slTitle.textContent='Sessões e progresso por meta'
  const sGrid = document.createElement('div'); sGrid.className='grid cols-2'
  const sf = (label, type='text') => { const w=document.createElement('div'); w.className='field'; const l=document.createElement('label'); l.textContent=label; const i=document.createElement(type==='textarea'?'textarea':'input'); if(type!=='textarea') i.type=type; w.appendChild(l); w.appendChild(i); sGrid.appendChild(w); return i }
  const sDate = sf('Data da sessão','date'); const sNotes = sf('Notas da sessão','textarea')
  const sApproachWrap = document.createElement('div'); sApproachWrap.className='field'; const sal=document.createElement('label'); sal.textContent='Abordagem da sessão'; const sApproach=document.createElement('select'); ['TCC padrão','Ansiedade','Depressão','Estresse','Casais'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; sApproach.appendChild(o) }); sApproachWrap.appendChild(sal); sApproachWrap.appendChild(sApproach); sGrid.appendChild(sApproachWrap)
  const sGoalWrap = document.createElement('div'); sGoalWrap.className='field'; const sgl=document.createElement('label'); sgl.textContent='Meta'; const sGoal=document.createElement('select'); sGoalWrap.appendChild(sgl); sGoalWrap.appendChild(sGoal); sGrid.appendChild(sGoalWrap)
  const sProg = sf('Progresso (%)','number'); sProg.min='0'; sProg.max='100'; sProg.value='0'
  const tTitle = sf('Tarefa','text')
  const tTypeWrap = document.createElement('div'); tTypeWrap.className='field'; const ttl=document.createElement('label'); ttl.textContent='Tipo'; const tType=document.createElement('select'); ['exposicao','ativacao','cognitiva'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; tType.appendChild(o) }); tTypeWrap.appendChild(ttl); tTypeWrap.appendChild(tType); sGrid.appendChild(tTypeWrap)
  const tCatWrap = document.createElement('div'); tCatWrap.className='field'; const tcl=document.createElement('label'); tcl.textContent='Categoria'; const tCat=document.createElement('select'); ['psicoeducacao','exposicao','ativacao','cognitiva','habilidades','outros'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; tCat.appendChild(o) }); tCatWrap.appendChild(tcl); tCatWrap.appendChild(tCat); sGrid.appendChild(tCatWrap)
  const tPriWrap = document.createElement('div'); tPriWrap.className='field'; const tpl=document.createElement('label'); tpl.textContent='Prioridade'; const tPri=document.createElement('select'); ['baixa','media','alta'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; tPri.appendChild(o) }); tPriWrap.appendChild(tpl); tPriWrap.appendChild(tPri); sGrid.appendChild(tPriWrap)
  const tDoneWrap = document.createElement('div'); tDoneWrap.className='field'; const tdl=document.createElement('label'); tdl.textContent='Concluída'; const tDone=document.createElement('select'); ['nao','sim'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; tDone.appendChild(o) }); tDoneWrap.appendChild(tdl); tDoneWrap.appendChild(tDone); sGrid.appendChild(tDoneWrap)
  const sActions = document.createElement('div'); sActions.className='actions'
  const sAdd = document.createElement('button'); sAdd.className='btn'; sAdd.textContent='Adicionar progresso'
  const sAddTask = document.createElement('button'); sAddTask.className='btn'; sAddTask.textContent='Adicionar tarefa'
  const sAddItem = document.createElement('button'); sAddItem.className='btn'; sAddItem.textContent='Adicionar item de checklist'
  const sSave = document.createElement('button'); sSave.className='btn success'; sSave.textContent='Salvar sessão'
  const sList = document.createElement('div'); sList.className='list'
  const sChartBox = document.createElement('div'); sChartBox.className='chart-box compact'; const sCanvas=document.createElement('canvas'); sChartBox.appendChild(sCanvas)
  const taskChartBox = document.createElement('div'); taskChartBox.className='chart-box compact'; const taskCanvas=document.createElement('canvas'); taskChartBox.appendChild(taskCanvas)
  const adhBox = document.createElement('div'); adhBox.className='chart-box compact'; const adhCanvas=document.createElement('canvas'); adhBox.appendChild(adhCanvas)
  const adhApproachBox = document.createElement('div'); adhApproachBox.className='chart-box compact'; const adhApproachCanvas=document.createElement('canvas'); adhApproachBox.appendChild(adhApproachCanvas)
  const burnBox = document.createElement('div'); burnBox.className='chart-box compact'; const burnCanvas=document.createElement('canvas'); burnBox.appendChild(burnCanvas)
  sessionsWrap.appendChild(slTitle); sessionsWrap.appendChild(sGrid); sessionsWrap.appendChild(sActions); sessionsWrap.appendChild(sList); sessionsWrap.appendChild(sChartBox); sessionsWrap.appendChild(taskChartBox); sessionsWrap.appendChild(adhBox); sessionsWrap.appendChild(adhApproachBox); sessionsWrap.appendChild(burnBox)
  ;[sChartBox, taskChartBox, adhBox, adhApproachBox, burnBox].forEach(b => b.classList.add('compact'))
  p.appendChild(sessionsWrap)
  const repManage = document.createElement('div'); repManage.className='panel'
  const rmTitle = document.createElement('div'); rmTitle.textContent='Gestor de relatórios'
  const modelWrap = document.createElement('div'); modelWrap.className='field'; const ml=document.createElement('label'); ml.textContent='Modelo'; const modelSel=document.createElement('select'); ['Devolutiva padrão','Ansiedade','Depressão','Estresse','Casais'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; modelSel.appendChild(o) }); modelWrap.appendChild(ml); modelWrap.appendChild(modelSel)
  const modelBtn = document.createElement('button'); modelBtn.className='btn'; modelBtn.textContent='Aplicar modelo'
  const repList = document.createElement('div'); repList.className='list'
  let editingId = ''
  modelBtn.addEventListener('click', () => {
    const entries = store.load('entries').filter(e=>e.patientId===sel.value)
    if (!entries.length) return alert('Sem avaliações')
    const last = entries[entries.length-1]
    const patient = store.load('patients').find(p=>p.id===sel.value)
    const anam = store.load('anamneses').filter(a=>a.patientId===sel.value).slice(-1)[0]
    const tpl = buildReportTemplate(modelSel.value, patient, last, anam, store.load('goals').filter(g=>g.patientId===sel.value))
    outText.value = tpl
  })
  const repActions = document.createElement('div'); repActions.className='actions'
  const saveEdited = document.createElement('button'); saveEdited.className='btn success'; saveEdited.textContent='Salvar texto como relatório'
  saveEdited.addEventListener('click', () => {
    const reports = store.load('reports')
    if (editingId) {
      const idx = reports.findIndex(r => r.id === editingId)
      if (idx > -1) { reports[idx].text = outText.value || ''; store.save('reports', reports); editingId = ''; renderRepList() }
    } else {
      reports.push({ id: uid(), patientId: sel.value, timestamp: Date.now(), approach: modelSel.value, text: outText.value || '' })
      store.save('reports', reports); renderRepList()
    }
  })
  repActions.appendChild(modelBtn); repActions.appendChild(saveEdited)
  repManage.appendChild(rmTitle); repManage.appendChild(modelWrap); repManage.appendChild(repActions); repManage.appendChild(repList)
  p.appendChild(repManage)
  function renderRepList() {
    const reports = store.load('reports').filter(r=>r.patientId===sel.value)
    repList.innerHTML=''
    reports.forEach(r => { const li=document.createElement('div'); li.className='list-item'; const left=document.createElement('div'); left.textContent=`${new Date(r.timestamp).toLocaleString()} • ${r.approach}`; const right=document.createElement('div'); const edit=document.createElement('button'); edit.className='btn'; edit.textContent='Editar'; edit.addEventListener('click', () => { outText.value=r.text || ''; editingId=r.id }); const del=document.createElement('button'); del.className='btn danger'; del.textContent='Excluir'; del.addEventListener('click', () => { if (confirm('Excluir relatório?')) { const all=store.load('reports').filter(x=>x.id!==r.id); store.save('reports', all); renderRepList() } }); right.appendChild(edit); right.appendChild(del); li.appendChild(left); li.appendChild(right); repList.appendChild(li) })
  }
  sel.addEventListener('change', () => renderRepList())
  setTimeout(() => renderRepList(), 0)
  let currentProgress = []
  let currentTasks = []
  let currentChecklist = []
  sAdd.addEventListener('click', () => {
    if (!sGoal.value) return
    currentProgress.push({ goalId: sGoal.value, percent: Number(sProg.value)||0 })
    alert('Progresso adicionado')
  })
  sAddTask.addEventListener('click', () => {
    currentTasks.push({ title: tTitle.value, type: tType.value, category: tCat.value, priority: tPri.value, done: tDone.value === 'sim' })
    alert('Tarefa adicionada')
  })
  const checklistPanel = document.createElement('div'); checklistPanel.className='panel'
  const cTitle = document.createElement('input'); cTitle.type='text'; cTitle.placeholder='Item de checklist'
  const cCat = document.createElement('select'); ['psicoeducacao','exposicao','ativacao','cognitiva','habilidades','outros'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; cCat.appendChild(o) })
  const cPri = document.createElement('select'); ['baixa','media','alta'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; cPri.appendChild(o) })
  const cDoneSel = document.createElement('select'); ['nao','sim'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v; cDoneSel.appendChild(o) })
  const cpGrid = document.createElement('div'); cpGrid.className='grid cols-3'
  const wrapField = (label, node) => { const w=document.createElement('div'); w.className='field'; const l=document.createElement('label'); l.textContent=label; w.appendChild(l); w.appendChild(node); cpGrid.appendChild(w) }
  wrapField('Item', cTitle); wrapField('Categoria', cCat); wrapField('Prioridade', cPri); wrapField('Concluído', cDoneSel)
  const cActions = document.createElement('div'); cActions.className='actions'
  cActions.appendChild(sAddItem)
  checklistPanel.appendChild(cpGrid); checklistPanel.appendChild(cActions)
  sessionsWrap.appendChild(checklistPanel)
  sAddItem.addEventListener('click', () => { currentChecklist.push({ title: cTitle.value, category: cCat.value, priority: cPri.value, done: cDoneSel.value==='sim' }); alert('Item de checklist adicionado') })
  sSave.addEventListener('click', () => {
    const sessions = store.load('sessions')
    sessions.push({ id: uid(), patientId: sel.value, date: sDate.value, approach: sApproach.value, notes: sNotes.value, progress: currentProgress.slice(), tasks: currentTasks.slice(), checklist: currentChecklist.slice(), timestamp: Date.now() })
    store.save('sessions', sessions)
    currentProgress = []
    currentTasks = []
    currentChecklist = []
    renderSessions()
  })
  sActions.appendChild(sAdd); sActions.appendChild(sAddTask); sActions.appendChild(sAddItem); sActions.appendChild(sSave)
  function renderSessions(){
    const sessions = store.load('sessions').filter(s=>s.patientId===sel.value)
    sList.innerHTML=''
    sessions.forEach(s=>{ const doneCount=(s.tasks||[]).filter(t=>t.done).length; const chkDone=(s.checklist||[]).filter(c=>c.done).length; const li=document.createElement('div'); li.className='list-item'; li.textContent=`${new Date(s.date||s.timestamp).toLocaleDateString()} • ${s.approach||'-'} • ${s.notes} • metas: ${s.progress?.length||0} • tarefas: ${(s.tasks||[]).length} • concluídas: ${doneCount} • checklist: ${(s.checklist||[]).length} • ok: ${chkDone}`; sList.appendChild(li) })
    const goals = store.load('goals').filter(g=>g.patientId===sel.value)
    sGoal.innerHTML=''
    sGoal.appendChild(Object.assign(document.createElement('option'), { value:'', textContent:'Selecione meta' }))
    goals.forEach(g=>{ const o=document.createElement('option'); o.value=g.id; o.textContent=g.title; sGoal.appendChild(o) })
    sGoal.addEventListener('change', () => { if (!sGoal.value) return; renderGoalProgress(sCanvas, sessions, sGoal.value) })
    renderTaskCompletion(taskCanvas, sessions)
    const fWrap = document.createElement('div'); fWrap.className='grid cols-2'
    const fGoalWrap = document.createElement('div'); fGoalWrap.className='field'; const fgl=document.createElement('label'); fgl.textContent='Filtrar meta'; const fGoal=document.createElement('select'); fGoal.appendChild(Object.assign(document.createElement('option'), { value:'', textContent:'Todas' })); goals.forEach(g=>{ const o=document.createElement('option'); o.value=g.id; o.textContent=g.title; fGoal.appendChild(o) }); fGoalWrap.appendChild(fgl); fGoalWrap.appendChild(fGoal)
    const fTypeWrap = document.createElement('div'); fTypeWrap.className='field'; const ftl=document.createElement('label'); ftl.textContent='Filtrar tipo'; const fType=document.createElement('select'); ['', 'exposicao','ativacao','cognitiva'].forEach(v=>{ const o=document.createElement('option'); o.value=v; o.textContent=v || 'Todos'; fType.appendChild(o) }); fTypeWrap.appendChild(ftl); fTypeWrap.appendChild(fType)
    sessionsWrap.insertBefore(fWrap, sList)
    fWrap.appendChild(fGoalWrap); fWrap.appendChild(fTypeWrap)
    const rerenderAdh = () => { renderWeeklyAdherence(adhCanvas, sessions, { type: fType.value || '', goalId: fGoal.value || '' }) }
    fGoal.addEventListener('change', rerenderAdh)
    fType.addEventListener('change', rerenderAdh)
    rerenderAdh()
    renderWeeklyAdherenceByApproach(adhApproachCanvas, sessions)
    renderBurnDownWeekly(burnCanvas, sessions, {})
  }
  sel.addEventListener('change', () => renderSessions())
  setTimeout(() => renderSessions(), 0)
  return p
}

window.addEventListener('DOMContentLoaded', navInit)
