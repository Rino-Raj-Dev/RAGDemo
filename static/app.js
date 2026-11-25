'use strict';
const $ = id => document.getElementById(id);
const state = {
  csrf:'', ready:false, provider: {
    configured:false
  }, persona:'company-a', evaluation:null
};
const titles = {
  search: [
    'Find the evidence.',
    'One question. Three retrieval strategies. See what changes.'
  ],
  answers: [
    'Turn evidence into answers.',
    'Retrieve, inspect, then synthesize. Every claim needs a source.'
  ],
  trust: [
    'Ask the difficult questions.',
    'Freshness, missing facts, conflicting sources and tenant scope.'
  ],
  corpus: [
    'Know your knowledge.',
    'Explore the documents, dates and passages behind every result.'
  ],
  evaluation: [
    'Measure what changed.',
    'A repeatable retrieval suite. Actual results, including the failures.'
  ]
};
function el(tag, cls, text) {
  const n=document.createElement(tag);
  if(cls)n.className=cls;
  if(text!==undefined)n.textContent=text;
  return n;
}

function notice(text, error=false) {
  $('notice').textContent=text;
  $('notice').classList.toggle('error', error);
  $('notice').hidden=!text;
}

async function api(action, data) {
  const opts=data===undefined? {
  }
  : {
    method:'POST', headers: {
      'Content-Type':'application/json'
    }, body:JSON.stringify( {
      ...data, csrf:state.csrf
    })
  };
  const r=await fetch('api.cfm?action='+encodeURIComponent(action), opts);
  let body;
  try {
    body=await r.json();
  }
  catch {
    throw Error('The server returned an unexpected response. Reload after checking the ColdFusion service.');
  }
  if(!r.ok||!body.ok)throw Error(body.error||'Request failed.');
  return body;
}

async function busy(button, task) {
  const old=button.textContent;
  button.disabled=true;
  button.textContent='Working…';
  notice('');
  try {
    await task();
  }
  catch(e) {
    notice(e.message, true);
  }
  finally {
    button.disabled=false;
    button.textContent=old;
  }
}

function requireIndex() {
  if(!state.ready)throw Error('Build the knowledge index first. Local embeddings need no API key.');
}

function updateStatus(s) {
  state.ready=s.ready;
  $('index-state').textContent=s.ready?s.documents+' documents · '+s.chunks+' searchable passages':'Knowledge index not built';
  $('index-detail').textContent=s.ready
    ? s.parseMode+' · index '+s.revision+' · '+s.durationMs+' ms to build'
    : s.corpusFiles+' PDF documents · embedded MiniLM · no database';
  $('index-dot').classList.toggle('ready', s.ready);
  $('ingest').textContent=s.ready?'Rebuild knowledge index ↗':'Build knowledge index ↗';
  $('build-label').textContent='COLDFUSION '+s.build;
}

function updateProvider(p) {
  state.provider=p;
  $('model-state').textContent=p.configured?p.provider+' / '+p.modelName:'Evidence mode';
  $('answer-mode-label').textContent=p.configured?'Answer model configured':'Evidence mode is ready';
  $('answer-mode-copy').textContent=p.configured
    ? 'Generated answers use only the selected context. Check the evidence and citation IDs.'
    : p.provider==='codemax'
      ? 'Add CODEMAX_API_KEY to the private server .env file, then refresh the connection. Search already works locally.'
      : 'Search works without a key. Connect an answer model to synthesize guidance from the selected evidence.';
}

function view(name) {
  document.querySelectorAll('.view').forEach(n=>n.hidden=n.id!=='view-'+name);
  document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active', n.dataset.view===name));
  $('page-title').textContent=titles[name][0];
  $('page-description').textContent=titles[name][1];
  notice('');
}

function openPassage(c) {
  $('passage-title').textContent=c.title;
  $('passage-meta').textContent=c.id+' · '+c.section+' · '+c.metadata.tenant_id
    +' · effective '+c.metadata.effective_date+' · page '+c.page;
  $('passage-text').textContent=c.text;
  $('passage-source').href='source.cfm?id='+encodeURIComponent(c.documentId)+'#page='+c.page;
  $('passage-dialog').showModal();
}

function renderResults(target, rows, strategy) {
  target.replaceChildren();
  if(!rows.length) {
    target.append(el('div', 'empty', 'No eligible passages matched.'));
    return;
  }
  rows.forEach((c, i)=> {
    const card=el('article', 'result-card');
    const meta=el('div', 'result-meta');
    meta.append(el('span', 'rank', String(i+1).padStart(2, '0')));
    const score = strategy === 'keyword'
      ? c.keywordScore+' term hits'
      : strategy === 'semantic'
        ? 'cosine '+c.semanticScore.toFixed(3)
        : 'RRF '+c.score.toFixed(4);
    meta.append(el('span', '', score));
    card.append(
      meta,
      el('h4', '', c.section),
      el('p', '', c.text.length>210?c.text.slice(0, 210)+'…':c.text),
      el('div', 'result-source', c.documentId+' · v'+c.metadata.version+' · '+c.metadata.status)
    );
    const b=el('button', '', 'Inspect passage ↗');
    b.addEventListener('click', ()=>openPassage(c));
    card.append(b);
    target.append(card);
  });
}

async function loadDocuments() {
  const {
    documents
  }
  =await api('documents');
  $('document-grid').replaceChildren();
  $('chunk-document').replaceChildren();
  for(const d of documents) {
    const card=el('article', 'document-card');
    card.append(
      el('span', 'doc-icon', 'PDF / '+d.demo_group.toUpperCase()),
      el('h3', '', d.title),
      el('p', '', d.document_id+' · v'+d.version+' · '+d.effective_date+' → '+(d.effective_end||'until superseded')),
      el('span', 'badge', d.status)
    );
    const p=el('p');
    const a=el('a', '', 'Open original PDF ↗');
    a.href='source.cfm?id='+encodeURIComponent(d.document_id);
    a.target='_blank';
    a.rel='noopener';
    p.append(a);
    card.append(p);
    $('document-grid').append(card);
    $('chunk-document').append(new Option(d.document_id+' / '+d.demo_group, d.document_id));
  }
}

async function loadChunks() {
  if(!state.ready)return;
  const {
    result
  }
  =await api('chunks', {
    id:$('chunk-document').value
  });
  $('fixed-chunks').replaceChildren();
  $('structured-chunks').replaceChildren();
  result.fixed.forEach((text, i)=> {
    const c=el('div', 'chunk');
    c.append(el('strong', '', 'CUT '+(i+1)+' / '+text.length+' characters'), document.createTextNode(text));
    $('fixed-chunks').append(c);
  });
  result.structured.forEach(c=> {
    const n=el('div', 'chunk');
    n.append(el('strong', '', c.id+' / '+c.section), document.createTextNode(c.text));
    $('structured-chunks').append(n);
  });
}

function clearResults() {
  document.querySelectorAll('.results').forEach(n=>n.replaceChildren(el('div', 'empty', 'Run a query for this persona.')));
  $('answer-output').textContent='A useful answer starts with the right evidence.';
  $('answer-kind').textContent='Awaiting question';
  $('answer-metrics').replaceChildren();
  $('context-count').textContent='0 passages';
  $('native-output').textContent='';
  $('eval-summary').replaceChildren();
  $('evaluation-rows').replaceChildren();
  $('baseline-gate').hidden=true;
  $('improved-gate').hidden=true;
  state.evaluation=null;
  $('export').disabled=true;
}

document.querySelectorAll('.nav').forEach(b=>b.addEventListener('click', ()=>view(b.dataset.view)));
$('ingest').addEventListener('click', ()=>busy($('ingest'), async()=> {
  const {
    status
  }
  =await api('ingest', {
  });
  updateStatus(status);
  await loadChunks();
  notice('Indexed '+status.documents+' PDFs as '+status.chunks+' passages using local embeddings. '+status.parseMode+'.');
}));
$('compare').addEventListener('click', ()=>busy($('compare'), async()=> {
  requireIndex();
  const base= {
    question:$('search-question').value, scope:$('search-scope').value, asOf:$('search-date').value, topK:5
  };
  for(const strategy of ['keyword', 'semantic', 'hybrid']) {
    const {
      result
    }
    =await api('query', {
      ...base, strategy
    });
    renderResults($(strategy+'-results'), result.context, strategy);
  }
  notice('All three strategies used the same question, eligible corpus and Top 5 cutoff.');
}));
const prompts = {
  laptop: 'My company laptop broke during an overseas client visit. What should I do?',
  exact: 'INC-84721',
  personal: 'Is my personally owned laptop covered for replacement?'
};
document.querySelectorAll('[data-prompt]').forEach(b=>b.addEventListener('click', ()=> {
  $('search-question').value=prompts[b.dataset.prompt];
}));
$('ask').addEventListener('click', ()=>busy($('ask'), async()=> {
  requireIndex();
  const {
    result:r
  }
  =await api('query', {
    question:$('answer-question').value, strategy:$('answer-strategy').value, generate:state.provider.configured
  });
  $('answer-kind').textContent=r.answerKind==='llm'?'Generated answer':r.answerKind==='application-check'?'Evidence check':'Evidence only';
  $('answer-output').classList.remove('empty');
  $('answer-output').textContent=r.answer
    || 'Evidence retrieved. Connect an answer model to generate guidance, or inspect the passages below.';
  $('answer-metrics').replaceChildren(
    el('span', '', r.durationMs+' ms'),
    el('span', '', r.model||'No model call'),
    el('span', '', r.gate.state),
    el('span', '', r.citationCheck)
  );
  if(Object.keys(r.usage).length)$('answer-metrics').append(el('span', '', 'Provider usage: '+JSON.stringify(r.usage)));
  $('context-count').textContent=r.context.length+' passages';
  renderResults($('answer-evidence'), r.context, r.options.strategy);
}));
$('native').addEventListener('click', ()=>busy($('native'), async()=> {
  requireIndex();
  const {
    result
  }
  =await api('native', {
    question:$('answer-question').value
  });
  $('native-output').textContent=result.answer+'\n\n'+result.durationMs+' ms\n'+result.note;
}));
const scenarios = {
  stale: [
    'FRESHNESS / INSPECT, THEN IMPROVE',
    'How quickly must I report damaged company equipment during overseas travel?',
    false
  ],
  missing: [
    'SUFFICIENCY / NO INVENTED AMOUNTS',
    'What is the approved 2027 laptop reimbursement limit?',
    false
  ],
  conflict: [
    'CONTRADICTION / SHOW BOTH SOURCES',
    'What is the equipment reporting deadline?',
    true
  ],
  tenant: [
    'TENANT SCOPE / SERVER-SIDE SESSION',
    'What does Company B policy B-EQ-2026-009 say about damaged equipment?',
    false
  ]
};
document.querySelectorAll('[data-scenario]').forEach(b=>b.addEventListener('click', ()=> {
  document.querySelectorAll('[data-scenario]').forEach(n=>n.classList.toggle('selected', n===b));
  const s=scenarios[b.dataset.scenario];
  $('scenario-label').textContent=s[0];
  $('trust-question').value=s[1];
  $('trust-conflict').checked=s[2];
}));
function renderGate(target, r) {
  target.hidden=false;
  target.classList.toggle('warn', r.gate.state!=='ready');
  target.textContent=r.gate.message+'\n\nCheck: '+r.gate.method+' · '+r.durationMs+' ms · '+r.context.length+' passages';
}

$('trust-run').addEventListener('click', ()=>busy($('trust-run'), async()=> {
  requireIndex();
  const base= {
    question:$('trust-question').value, asOf:$('trust-date').value, conflict:$('trust-conflict').checked, generate:false, topK:5
  };
  let {
    result
  }
  =await api('query', {
    ...base, scope:'all', strategy:'semantic'
  });
  renderGate($('baseline-gate'), result);
  renderResults($('baseline-results'), result.context, 'semantic');
  ( {
    result
  }
  =await api('query', {
    ...base, scope:'current', strategy:'hybrid'
  }));
  renderGate($('improved-gate'), result);
  renderResults($('improved-results'), result.context, 'hybrid');
}));
$('persona').addEventListener('change', ()=>busy($('ingest'), async()=> {
  await api('persona', {
    persona:$('persona').value
  });
  state.persona=$('persona').value;
  clearResults();
  await loadDocuments();
  await loadChunks();
  notice('Demo session now uses '+state.persona+'. Prior visible evidence has been cleared.');
}));
$('chunk-document').addEventListener('change', ()=>loadChunks().catch(e=>notice(e.message, true)));
$('evaluate').addEventListener('click', ()=>busy($('evaluate'), async()=> {
  requireIndex();
  const {
    result
  }
  =await api('evaluate', {
  });
  state.evaluation=result;
  $('evaluation-rows').replaceChildren();
  for(const row of result.rows) {
    const tr=el('tr');
    const td=el('td', '', row.name);
    td.append(el('small', '', row.asOf+' · '+(row.expectedEvidence||'Application gate / scope check')));
    tr.append(td);
    for(const strategy of ['keyword', 'semantic', 'hybrid']) {
      const r=row.strategies[strategy];
      const cell=el('td');
      cell.append(el('span', r.pass?'pass':'fail', r.pass?'PASS':'FAIL'), el('small', '', r.durationMs+' ms · '+r.gate));
      cell.title=r.evidenceIds.join('\n');
      tr.append(cell);
    }
    $('evaluation-rows').append(tr);
  }
  $('eval-summary').replaceChildren();
  for(const strategy of ['keyword', 'semantic', 'hybrid']) {
    const passed=result.rows.filter(r=>r.strategies[strategy].pass).length;
    const c=el('div', 'score-card');
    c.append(
      el('span', '', strategy.toUpperCase()),
      el('strong', '', passed+' / '+result.rows.length),
      el('span', '', 'cases passed · Top 5')
    );
    $('eval-summary').append(c);
  }
  $('export').disabled=false;
  notice(
    'Suite completed in '+result.durationMs+' ms · corpus '+result.revision
      +'. Hover over a result for retrieved IDs. Export includes all cases and failures.'
  );
}));
$('export').addEventListener('click', ()=> {
  if(!state.evaluation)return;
  const blob=new Blob([JSON.stringify(state.evaluation, null, 2)], {
    type:'application/json'
  });
  const url=URL.createObjectURL(blob);
  const a=el('a');
  a.href=url;
  a.download='cfsummit2026-evaluation.json';
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
});
function openSettings() {
  $('provider').value=state.provider.provider||'none';
  $('model-name').value=state.provider.modelName||'';
  $('api-key').value='';
  $('connection-result').textContent='';
  providerFields();
  $('settings').showModal();
}

function providerFields() {
  const p=$('provider').value;
  $('api-key-label').hidden=!['openai','anthropic'].includes(p);
  $('model-name').disabled=['none','codemax'].includes(p);
  $('gateway-help').hidden=p!=='codemax';
  $('api-key').value='';
  $('connection-result').textContent='';
  if(p==='codemax') $('model-name').value=state.provider.provider==='codemax'?state.provider.modelName:'Read from .env';
}

function connectionPayload() {
  return {provider:$('provider').value,model:$('model-name').value,apiKey:$('api-key').value};
}

$('gateway-refresh').addEventListener('click',()=>busy($('gateway-refresh'),async()=>{
  const {provider}=await api('configure',{provider:'codemax',model:'',apiKey:''});
  updateProvider(provider);
  $('model-name').value=provider.modelName;
  $('connection-result').textContent=provider.configured
    ? 'Private .env loaded. Test connection to verify the gateway.'
    : 'No key loaded yet. Set CODEMAX_API_KEY in the private .env file and refresh again.';
}));

$('connection-test').addEventListener('click',()=>busy($('connection-test'),async()=>{
  $('connection-result').textContent='Testing the selected endpoint…';
  try {
    const {provider}=await api('configure',connectionPayload());
    updateProvider(provider);
    const {result}=await api('testConnection',{});
    $('connection-result').textContent='Connected to '+result.provider+' / '+result.modelName+' · '+result.durationMs+' ms. '+result.message;
  } catch(e) {
    $('connection-result').textContent=e.message;
    throw e;
  } finally {
    $('api-key').value='';
  }
}));

$('provider').addEventListener('change', providerFields);
$('settings-open').addEventListener('click', openSettings);
$('connect-inline').addEventListener('click', openSettings);
$('settings-close').addEventListener('click', ()=> {
  $('api-key').value='';
  $('settings').close();
});
$('settings').addEventListener('close', ()=> {
  $('api-key').value='';
});
$('settings-form').addEventListener('submit', e=> {
  e.preventDefault();
  busy(e.submitter, async()=> {
    const {
      provider
    }
    =await api('configure', {
      provider:$('provider').value, model:$('model-name').value, apiKey:$('api-key').value
    });
    updateProvider(provider);
    $('api-key').value='';
    $('settings').close();
    notice(provider.provider==='codemax' && !provider.configured
      ? 'CodeMax selected. Add CODEMAX_API_KEY to the private .env file, then refresh the connection.'
      : provider.configured
      ? 'Model connection saved for this session. The first answer will verify the provider connection.'
      : 'Evidence-only mode selected. No external model calls will be made.'
    );
  });
});
$('passage-close').addEventListener('click', ()=>$('passage-dialog').close());
(async()=> {
  try {
    const r=await api('status');
    state.csrf=r.csrf;
    state.persona=r.persona;
    $('persona').value=r.persona;
    updateStatus(r.status);
    updateProvider(r.provider);
    await loadDocuments();
    if(state.ready)await loadChunks();
  }
  catch(e) {
    notice(e.message, true);
  }
})();


// Presentation story: scripted exhibits are separate from live retrieval results.
titles.story = ['The RAG Detective.', 'Help Arun solve the case of the broken laptop.'];
const storyActs = [
  {
    name:'Find the policy', slides:'ACT 1 / SLIDES 2–5 + LIVE DEMO 9',
    scene:"Meet Arun, a software engineer abroad for a client meeting tomorrow. It is 10 PM at his hotel. He presses his laptop's power button… nothing happens. His company has a policy. Can he find it?",
    question:'Which document would you investigate first?',
    exhibit:'Search: “Laptop damaged overseas” · Illustrative document choices',
    options:['Laptop Procurement Guide','Equipment Replacement During International Travel','International Travel Reimbursement'], correct:1,
    lesson:'Finding the answer requires more than matching words.',
    explanation:'Choice 2 is the strongest starting point: it matches the situation even though the vocabulary differs. These titles are a teaching example. Next, compare actual keyword, semantic, and hybrid rankings in our existing corpus; semantic search is useful, but does not guarantee the top result.'
  },
  {
    name:'Challenge the answer', slides:'ACT 2 / SLIDES 14–17',
    scene:'Arun finds a company assistant and asks how quickly he must report the damage. It gives a clear answer and cites an IT policy. The answer looks convincing.',
    question:'Would you trust this answer?',
    exhibit:'SCRIPTED ASSISTANT EXHIBIT — NOT A LIVE MODEL RESPONSE\n“You must report damaged equipment within 72 hours.”\nSource: IT Equipment Policy · version and effective date not shown',
    options:['Trust it: there is a citation','Challenge it: check the policy version and date','Reject every AI answer'], correct:1,
    lesson:'A citation can support an outdated answer.',
    explanation:'The demo’s 2022 and 2023 policies say 72 hours. Its applicable 2026 policy says 24 hours. The model can accurately repeat the wrong evidence. Inspect effective dates before generation. In the live comparison, an outdated result is possible, not guaranteed: check the actual ranking rather than assuming a failure.'
  },
  {
    name:'Check permission', slides:'ACT 3 / SLIDE 18',
    scene:'Another employee uses the same platform, but works for Company A. They ask about Company B’s equipment policy. A passage could be a perfect semantic match and still be outside their permissions.',
    question:'What should the system do with unauthorized evidence?',
    exhibit:'Access challenge: Company A employee → Company B equipment policy B-EQ-2026-009\nThis matches the existing demo corpus; no private-contract fixture is implied.',
    options:['Answer because the match is highly relevant','Answer but hide the source','Exclude unauthorized content before generation'], correct:2,
    lesson:'The most relevant document may be outside your permissions.',
    explanation:'Choice 3. Our live demo applies tenant eligibility on the server before scoring and building context. Open the challenge as Company A and inspect the evidence: it must not include Company B’s policy. A safe system may return no relevant evidence or authorized alternatives; it must not disclose another tenant’s content.'
  }
];
const storyFeedback = [
  [
    ['Choice 1: a keyword match, but a different task.', 'The Laptop Procurement Guide sounds relevant because it contains “laptop,” but procurement concerns buying equipment. Arun needs the rules for equipment damaged during international travel. Choice 2 is the strongest starting point.'],
    ['Choice 2: the strongest starting point.', 'Equipment Replacement During International Travel matches Arun’s situation, even though the words differ from his search. Inspect the policy’s scope and effective date before relying on it.'],
    ['Choice 3: useful for expenses, not the first step.', 'International Travel Reimbursement may explain eligible costs, but it may not cover damage reporting or replacement approval. Start with choice 2, then check reimbursement guidance if needed.']
  ],
  [
    ['Choice 1: a citation alone is not enough.', 'The cited policy may be genuine but outdated. The demo’s archived policies say 72 hours; its applicable 2026 policy says 24 hours. Check the version and effective date before trusting the deadline.'],
    ['Choice 2: check which policy applies.', 'This is the strongest response. Verify the cited passage, version, and effective date. The 72-hour rule belongs to archived demo policies; the applicable 2026 rule is 24 hours.'],
    ['Choice 3: verify the evidence rather than rejecting every answer.', 'An AI answer can be useful when its evidence is applicable and sufficient. Here, challenge the policy date and version, as in choice 2, instead of accepting or rejecting the answer solely because AI produced it.']
  ],
  [
    ['Choice 1: relevance does not grant permission.', 'A perfect match from Company B is still unauthorized for this Company A employee. Exclude it before scoring and building the model context, as in choice 3.'],
    ['Choice 2: hiding the source still leaks its content.', 'An answer can disclose private terms even without a citation. Hiding the document name does not enforce access control. Choice 3 excludes unauthorized content before generation.'],
    ['Choice 3: exclude unauthorized content first.', 'This is the correct control. Our server filters tenant eligibility before scoring and constructing context. Company A must not receive Company B passages, regardless of their semantic similarity.']
  ]
];
const storyState = {act:0, votes:[null,null,null], revealed:[false,false,false]};
function renderStory() {
  const i=storyState.act, a=storyActs[i];
  $('story-acts').replaceChildren();
  storyActs.forEach((act,n)=>{
    const b=el('button','scenario'+(n===i?' selected':''));
    b.type='button'; b.setAttribute('aria-pressed',String(n===i));
    b.append(el('span','','ACT '+(n+1)),el('strong','',act.name));
    b.addEventListener('click',()=>{storyState.act=n;renderStory();});
    $('story-acts').append(b);
  });
  $('story-slide').textContent=a.slides;
  $('story-scene').textContent=a.scene;
  $('story-question').textContent=a.question;
  $('story-exhibit').textContent=a.exhibit;
  $('story-options').replaceChildren();
  a.options.forEach((option,n)=>{
    const b=el('button','story-choice'+(storyState.votes[i]===n?' selected':''));
    b.type='button'; b.setAttribute('aria-pressed',String(storyState.votes[i]===n));

    b.append(el('span','',String(n+1)),document.createTextNode(option));
    b.addEventListener('click',()=>{storyState.votes[i]=n;storyState.revealed[i]=true;renderStory();});
    $('story-options').append(b);
  });
  $('story-vote').textContent=storyState.votes[i]===null?'':"Room's choice: "+(storyState.votes[i]+1)+'.';
  $('story-reveal-panel').hidden=!storyState.revealed[i];
  $('story-live').hidden=!storyState.revealed[i];
  $('story-reveal').textContent=storyState.revealed[i]?'Hide the lesson':'Reveal the lesson';
  const feedback=storyState.votes[i]===null?null:storyFeedback[i][storyState.votes[i]];
  $('story-lesson').textContent=feedback?feedback[0]:a.lesson;
  $('story-explanation').textContent=feedback?feedback[1]:a.explanation;
  $('story-progress').textContent='Act '+(i+1)+' of 3 · '+storyState.revealed.filter(Boolean).length+' lessons revealed';
  $('story-prev').disabled=i===0;
  $('story-next').disabled=i===2;
}
$('story-reveal').addEventListener('click',()=>{storyState.revealed[storyState.act]=!storyState.revealed[storyState.act];renderStory();});
$('story-prev').addEventListener('click',()=>{storyState.act=Math.max(0,storyState.act-1);renderStory();});
$('story-next').addEventListener('click',()=>{storyState.act=Math.min(2,storyState.act+1);renderStory();});
$('story-reset').addEventListener('click',()=>{storyState.act=0;storyState.votes.fill(null);storyState.revealed.fill(false);renderStory();});
$('story-live').addEventListener('click',()=>busy($('story-live'),async()=>{
  if(!state.csrf)throw Error('The demo is still connecting. Try again once the index status loads.');
  // Use a confirmed server-side persona before any story-linked query.
  await api('persona',{persona:'company-a'});
  state.persona='company-a'; $('persona').value='company-a';
  clearResults(); await loadDocuments(); await loadChunks();
  if(storyState.act===0){
    $('search-question').value=prompts.laptop;
    $('search-scope').value='current'; $('search-date').value='2026-11-10';
    view('search'); if(state.ready)$('compare').click();
  } else {
    view('trust');
    document.querySelector('[data-scenario="'+(storyState.act===1?'stale':'tenant')+'"]').click();
    $('trust-date').value='2026-11-10';
    if(state.ready)$('trust-run').click();
  }
  if(!state.ready)notice('Story scenario loaded. Build the knowledge index, then run this comparison.');
}));
renderStory();
