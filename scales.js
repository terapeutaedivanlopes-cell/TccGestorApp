const SCALE_DEFS = {
  BAI: {
    id: 'BAI',
    label: 'BAI (Inventário de Ansiedade de Beck)',
    items: [
      'Dormência e formigamento', 'Sensações de calor', 'Tremores nas pernas', 'Incapaz de relaxar', 'Medo de que algo ruim aconteça',
      'Atordoado ou tonto', 'Batimentos acelerados do coração', 'Sem equilíbrio', 'Apavorado', 'Nervoso',
      'Sensação de sufocamento', 'Tremores nas mãos', 'Trêmulo', 'Medo de perder o controle', 'Dificuldade de respirar',
      'Medo de morrer', 'Assustado', 'Desconforto abdominal', 'Sensação de desmaio', 'Rosto ruborizado', 'Suor'
    ].map((t, i) => ({ id: i + 1, label: t, min: 0, max: 3 })),
    compute: values => {
      const total = values.reduce((a, b) => a + (Number(b) || 0), 0)
      let nivel = 'Mínimo'
      if (total >= 0 && total <= 7) nivel = 'Mínimo'
      else if (total <= 15) nivel = 'Leve'
      else if (total <= 25) nivel = 'Moderado'
      else nivel = 'Grave'
      return { total, nivel }
    }
  },
  BDI: {
    id: 'BDI',
    label: 'BDI (Inventário de Depressão de Beck)',
    items: [
      'Tristeza', 'Pessimismo', 'Fracasso passado', 'Perda de prazer', 'Culpa', 'Punição', 'Autodesagrado', 'Autoacusações', 'Ideias de suicídio', 'Choro',
      'Irritabilidade', 'Retraimento social', 'Indecisão', 'Alterações de sono', 'Fadiga', 'Apetite', 'Perda de peso', 'Preocupação somática', 'Dificuldade de concentração', 'Cansaço', 'Perda de interesse sexual'
    ].map((t, i) => ({ id: i + 1, label: t, min: 0, max: 3 })),
    compute: values => {
      const total = values.reduce((a, b) => a + (Number(b) || 0), 0)
      let nivel = 'Mínimo'
      if (total <= 13) nivel = 'Mínimo'
      else if (total <= 19) nivel = 'Leve'
      else if (total <= 28) nivel = 'Moderado'
      else nivel = 'Grave'
      return { total, nivel }
    }
  },
  PSS10: {
    id: 'PSS10',
    label: 'PSS-10 (Escala de Estresse Percebido)',
    items: [
      'Perturbações inesperadas', 'Controle das coisas importantes', 'Sentiu-se nervoso e estressado', 'Confiante em lidar com problemas', 'As coisas correram a favor',
      'Não conseguiu lidar com tudo', 'Controle sobre irritações', 'Sentiu que estava no controle', 'Irritado por coisas fora de controle', 'Dificuldades se acumularam'
    ].map((t, i) => ({ id: i + 1, label: t, min: 0, max: 4 })),
    reverse: [4, 5, 7, 8],
    compute: values => {
      const rev = [4, 5, 7, 8]
      const scored = values.map((v, idx) => rev.includes(idx + 1) ? (4 - (Number(v) || 0)) : (Number(v) || 0))
      const total = scored.reduce((a, b) => a + b, 0)
      let nivel = 'Baixo'
      if (total <= 13) nivel = 'Baixo'
      else if (total <= 26) nivel = 'Moderado'
      else nivel = 'Alto'
      return { total, nivel }
    }
  },
  PSS14: {
    id: 'PSS14',
    label: 'PSS-14 (Escala de Estresse Percebido)',
    items: [
      'Perturbações inesperadas', 'Controle das coisas importantes', 'Sentiu-se nervoso e estressado', 'Confiante em lidar com problemas', 'As coisas correram a favor',
      'Não conseguiu lidar com tudo', 'Controle sobre irritações', 'Sentiu que estava no controle', 'Irritado por coisas fora de controle', 'Dificuldades se acumularam',
      'Sentiu que tudo estava caminhando bem', 'Sentiu-se no controle do tempo', 'Coisas estavam sob controle', 'Conseguiu lidar com suas preocupações'
    ].map((t, i) => ({ id: i + 1, label: t, min: 0, max: 4 })),
    reverse: [4, 5, 6, 7, 9, 10, 13],
    compute: values => {
      const rev = [4, 5, 6, 7, 9, 10, 13]
      const scored = values.map((v, idx) => rev.includes(idx + 1) ? (4 - (Number(v) || 0)) : (Number(v) || 0))
      const total = scored.reduce((a, b) => a + b, 0)
      let nivel = 'Baixo'
      if (total <= 18) nivel = 'Baixo'
      else if (total <= 35) nivel = 'Moderado'
      else nivel = 'Alto'
      return { total, nivel }
    }
  },
  ROSENBERG: {
    id: 'ROSENBERG',
    label: 'EAR (Escala de Autoestima de Rosenberg)',
    items: [
      'Sou uma pessoa de valor', 'Tenho qualidades boas', 'Sou capaz como os outros', 'Tenho atitude positiva comigo', 'Sinto-me um fracasso',
      'Sou inútil', 'Estou satisfeito comigo', 'Gostaria de me respeitar mais', 'Às vezes acho que não presto', 'Tenho uma visão positiva de mim'
    ].map((t, i) => ({ id: i + 1, label: t, min: 0, max: 3 })),
    reverse: [2, 5, 6, 8, 9],
    compute: values => {
      const rev = [2, 5, 6, 8, 9]
      const scored = values.map((v, idx) => rev.includes(idx + 1) ? (3 - (Number(v) || 0)) : (Number(v) || 0))
      const total = scored.reduce((a, b) => a + b, 0)
      let nivel = 'Baixa'
      if (total <= 15) nivel = 'Baixa'
      else if (total <= 25) nivel = 'Moderada'
      else nivel = 'Alta'
      return { total, nivel }
    }
  }
  ,YSQ: {
    id: 'YSQ',
    label: 'YSQ (Questionário de Esquemas de Young)',
    items: [
      'Abandono/Instabilidade',
      'Desconfiança/Abuso',
      'Privação emocional',
      'Defectividade/Vergonha',
      'Fracasso',
      'Dependência/Incompetência',
      'Subjugação',
      'Padrões inflexíveis/Exigência implacável',
      'Auto-sacrifício',
      'Busca de aprovação/Reconhecimento'
    ].map((t, i) => ({ id: i + 1, label: t, min: 0, max: 5 })),
    compute: values => {
      const total = values.reduce((a, b) => a + (Number(b) || 0), 0)
      let nivel = 'Baixo'
      if (total <= 15) nivel = 'Baixo'
      else if (total <= 30) nivel = 'Moderado'
      else nivel = 'Alto'
      return { total, nivel }
    }
  }
  ,QEP: {
    id: 'QEP',
    label: 'QEP (Questionário de Estilos Parentais)',
    items: [
      'Carinho e afeto',
      'Comunicação',
      'Monitoria positiva',
      'Disciplina consistente',
      'Negligência',
      'Punição inconsistente',
      'Coerção verbal',
      'Coerção física'
    ].map((t, i) => ({ id: i + 1, label: t, min: 0, max: 4 })),
    compute: values => {
      const total = values.reduce((a, b) => a + (Number(b) || 0), 0)
      let nivel = 'Baixo'
      if (total <= 12) nivel = 'Baixo'
      else if (total <= 24) nivel = 'Moderado'
      else nivel = 'Alto'
      return { total, nivel }
    }
  }
  ,RIED: {
    id: 'RIED',
    label: 'RIED (Inventário de Estilos de Relacionamento)',
    items: [
      'Ansiedade de apego',
      'Evitação de proximidade',
      'Dependência',
      'Ciúme',
      'Assertividade',
      'Comunicação',
      'Resolução de conflitos',
      'Empatia'
    ].map((t, i) => ({ id: i + 1, label: t, min: 0, max: 4 })),
    compute: values => {
      const total = values.reduce((a, b) => a + (Number(b) || 0), 0)
      let nivel = 'Baixo'
      if (total <= 10) nivel = 'Baixo'
      else if (total <= 20) nivel = 'Moderado'
      else nivel = 'Alto'
      return { total, nivel }
    }
  }
}

function buildScaleForm(def) {
  const container = document.createElement('div')
  container.className = 'panel'
  const title = document.createElement('h3')
  title.textContent = def.label
  container.appendChild(title)
  const grid = document.createElement('div')
  grid.className = 'grid cols-3'
  const controls = []
  const legend = document.createElement('div')
  legend.className = 'panel'
  const legendText = () => {
    if (def.id === 'PSS10' || def.id === 'PSS14') return '0 Nunca • 1 Quase nunca • 2 Às vezes • 3 Quase sempre • 4 Sempre'
    if (def.id === 'ROSENBERG') return '0 Discordo totalmente • 1 Discordo • 2 Concordo • 3 Concordo totalmente'
    if (def.id === 'YSQ') return '0 Nunca • 1 Quase nunca • 2 Algumas vezes • 3 Muitas vezes • 4 Quase sempre • 5 Sempre'
    if (def.id === 'QEP' || def.id === 'RIED') return '0 Nunca • 1 Quase nunca • 2 Às vezes • 3 Quase sempre • 4 Sempre'
    return '0 Nenhum • 1 Leve • 2 Moderado • 3 Severo'
  }
  legend.textContent = legendText()
  const getOptionLabels = (defId, itemIndex) => {
    if (defId === 'PSS10' || defId === 'PSS14') return ['Nunca','Quase nunca','Às vezes','Quase sempre','Sempre']
    if (defId === 'ROSENBERG') return ['Discordo totalmente','Discordo','Concordo','Concordo totalmente']
    if (defId === 'BAI') return ['Nada','Levemente','Moderadamente','Severamente']
    if (defId === 'BDI') {
      const o = [
        ['Não me sinto triste','Eu me sinto triste','Estou triste o tempo todo','Estou tão triste que não suporto'],
        ['Não estou desencorajado quanto ao futuro','Acho que as coisas podem piorar','Não espero que as coisas melhorem','Acho o futuro sem esperança'],
        ['Não me sinto fracassado','Fracassei mais do que a maioria','Vejo muitos fracassos pessoais','Sinto-me completo fracasso'],
        ['Não perdi o prazer','Tenho menos prazer do que antes','Perdi muito do meu prazer','Não sinto nenhum prazer'],
        ['Não me sinto culpado','Frequentemente me sinto culpado','Me sinto culpado a maior parte do tempo','Me sinto extremamente culpado'],
        ['Não sinto que estou sendo punido','Sinto que posso ser punido','Espero ser punido','Sinto que estou sendo punido'],
        ['Estou satisfeito comigo','Desagrado de mim mesmo','Sinto-me desapontado comigo','Sinto ódio de mim mesmo'],
        ['Não me culpo por nada','Me culpo por muito','Me culpo por quase tudo','Me culpo por tudo'],
        ['Não tenho pensamentos suicidas','Tenho pensamentos mas não os executaria','Gostaria de me suicidar','Me mataria se tivesse chance'],
        ['Não choro mais do que o normal','Choro mais que antes','Choro o tempo todo','Não consigo chorar apesar de querer'],
        ['Não estou mais irritado do que o habitual','Fico facilmente irritado','Estou irritado o tempo todo','Não me irrito mais'],
        ['Não perdi interesse por pessoas','Menos interesse por pessoas','Perdi muito interesse','Perdi todo interesse por pessoas'],
        ['Tomo decisões tão bem quanto antes','Adio decisões mais do que antes','Tenho dificuldade de decidir','Não consigo decidir'],
        ['Durmo tão bem quanto antes','Sono pior que antes','Acordo mais cedo e não volto a dormir','Durmo muito menos ou demais'],
        ['Não me sinto mais cansado que o normal','Fico cansado mais facilmente','Estou cansado a maior parte do tempo','Estou exausto'],
        ['Meu apetite não diminuiu','Apetite um pouco menor','Apetite muito menor','Não tenho apetite'],
        ['Não perdi peso significativamente','Perdi um pouco de peso','Perdi bastante peso','Perdi muito peso'],
        ['Não me preocupo com minha saúde','Preocupo-me com dores pequenas','Preocupo-me muito com saúde','Só penso em problemas físicos'],
        ['Posso me concentrar como antes','Tenho dificuldade moderada de concentrar','Tenho grande dificuldade','Não consigo me concentrar'],
        ['Não estou mais cansado que antes','Fico cansado mais facilmente','Sinto-me muito cansado','Estou extremamente cansado'],
        ['O interesse sexual não diminuiu','Interesse sexual menor','Perdi muito interesse sexual','Perdi completamente o interesse']
      ]
      return o[itemIndex - 1]
    }
    if (defId === 'YSQ') return ['Nunca','Quase nunca','Algumas vezes','Muitas vezes','Quase sempre','Sempre']
    if (defId === 'QEP' || defId === 'RIED') return ['Nunca','Quase nunca','Às vezes','Quase sempre','Sempre']
    return []
  }
  def.items.forEach(item => {
    const wrap = document.createElement('div')
    wrap.className = 'scale-item'
    const lab = document.createElement('div')
    lab.textContent = item.label
    const sel = document.createElement('select')
    const labels = getOptionLabels(def.id, item.id)
    const hint = document.createElement('div')
    hint.className = 'hint'
    if (labels.length) {
      hint.textContent = `${labels[0]} → ${labels[labels.length - 1]}`
    } else {
      hint.textContent = `${item.min} até ${item.max}`
    }
    if (labels.length) {
      labels.forEach((txt, idx) => { const opt=document.createElement('option'); opt.value=String(idx); opt.textContent=txt; sel.appendChild(opt) })
    } else {
      for (let v = item.min; v <= item.max; v++) { const opt=document.createElement('option'); opt.value=String(v); opt.textContent=String(v); sel.appendChild(opt) }
    }
    sel.addEventListener('change', () => {
      const values = controls.map(c => Number(c.value) || 0)
      const res = def.compute(values)
      scoreEl.textContent = `Score: ${res.total} • Nível: ${res.nivel}`
    })
    controls.push(sel)
    wrap.appendChild(lab)
    wrap.appendChild(hint)
    wrap.appendChild(sel)
    grid.appendChild(wrap)
  })
  const scoreEl = document.createElement('div')
  scoreEl.className = 'score'
  scoreEl.textContent = 'Score: 0 • Nível:'
  container.appendChild(grid)
  container.appendChild(legend)
  container.appendChild(scoreEl)
  return { container, controls, scoreEl }
}

function computeAllScales(payload) {
  const out = {}
  Object.values(SCALE_DEFS).forEach(def => {
    const values = payload[def.id] || []
    const res = def.compute(values)
    out[def.id] = { values, total: res.total, nivel: res.nivel }
  })
  return out
}

window.SCALE_DEFS = SCALE_DEFS
window.buildScaleForm = buildScaleForm
window.computeAllScales = computeAllScales
