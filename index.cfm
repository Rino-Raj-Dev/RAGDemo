<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Evidence / CF Summit 2026</title>
    <link rel="stylesheet" href="static/app.css?v=<cfoutput>#left(hash(fileReadBinary(expandPath('./static/app.css')), 'SHA-256'), 12)#</cfoutput>">
    <script src="static/app.js?v=<cfoutput>#left(hash(fileReadBinary(expandPath('./static/app.js')), 'SHA-256'), 12)#</cfoutput>" defer></script>
  </head>
  <body>
    <aside class="rail">
      <a class="brand" href="index.cfm"><span class="brand-icon">e.</span><span>EVIDENCE<small>CF SUMMIT / 2026</small></span></a>
      <div class="rail-label">THE KNOWLEDGE LAB</div>
      <nav aria-label="Demo sections">
        <button class="nav" data-view="story"><span>?</span> RAG Detective</button>
        <button class="nav active" data-view="search"><span>01</span> Search lab</button>
        <button class="nav" data-view="answers"><span>02</span> Answer lab</button>
        <button class="nav" data-view="trust"><span>03</span> Trust lab</button>
        <button class="nav" data-view="corpus"><span>04</span> Knowledge corpus</button>
        <button class="nav" data-view="evaluation"><span>05</span> Evaluation</button>
      </nav>
      <div class="rail-bottom"><span class="live-dot"></span> LOCAL PRESENTATION LAB
        <p>Synthetic company data.<br>Real embeddings. Visible evidence.</p>
        <button id="settings-open" class="rail-link">Model connection <span>↗</span></button>
      </div>
    </aside>
    <main>
      <header class="topbar"><span>FROM SEARCH <b>TO ANSWERS</b></span>
        <div class="top-controls"><span id="model-state" class="badge">Evidence mode</span>
          <label for="persona">Demo persona</label>
          <select id="persona">
            <option value="company-a">Company A / Employee</option>
            <option value="company-b">Company B / Employee</option>
          </select>
        </div>
      </header>
      <div class="workspace">
        <section class="intro">
          <div>
            <div class="eyebrow">ADOBE COLDFUSION INDIA SUMMIT 2026</div>
            <h1 id="page-title">Find the evidence.</h1>
            <p id="page-description">One question. Three retrieval strategies. See what changes.</p>
          </div>
          <div class="intro-mark">KNOWLEDGE<br><span>YOU CAN TRACE.</span></div>
        </section>
        <section class="index-strip" aria-label="Index status">
          <div>
            <span class="status-dot" id="index-dot"></span>
            <strong id="index-state">Knowledge index not built</strong>
            <span id="index-detail">8 PDF documents · local embeddings · no database</span>
          </div>
          <button id="ingest" class="button dark">Build knowledge index <span>↗</span></button>
        </section>
        <p id="notice" class="notice" role="status" hidden></p>

        <section id="view-story" class="view" hidden>
          <div class="story-toolbar"><div><span class="eyebrow">THE CASE OF THE BROKEN LAPTOP</span><p>One employee. One question. Three challenges.</p></div><button id="story-reset" class="button outline">Reset story</button></div>
          <div id="story-acts" class="story-acts" aria-label="Story acts"></div>
          <article class="panel story-stage">
            <div class="panel-heading"><span id="story-slide" class="eyebrow"></span><span class="badge">Fictional company policies</span></div>
            <p id="story-scene" class="story-scene"></p>
            <h2 id="story-question"></h2>
            <div id="story-exhibit" class="story-exhibit"></div>
            <p class="quiet">Audience: show 1, 2, or 3 fingers. Presenter: select the room's choice, then reveal.</p>
            <div id="story-options" class="story-options" role="group" aria-label="Audience choices"></div>
            <p id="story-vote" role="status" aria-live="polite"></p>
            <div class="story-controls"><button id="story-reveal" class="button teal">Reveal the lesson</button><button id="story-live" class="button outline" hidden>Open live evidence</button></div>
            <div id="story-reveal-panel" class="story-reveal" hidden aria-live="polite"><h3 id="story-lesson"></h3><p id="story-explanation"></p></div>
          </article>
          <div class="story-footer"><button id="story-prev" class="button outline">Previous act</button><span id="story-progress"></span><button id="story-next" class="button dark">Next act</button></div>
        </section>
        <section id="view-search" class="view">
          <div class="panel question-panel">
            <div class="panel-heading">
              <span class="eyebrow">01 / RETRIEVAL COMPARISON</span>
              <span class="quiet">Same corpus. Same question.</span>
            </div>
            <label class="question-label" for="search-question">What do you need to know?</label>
            <textarea id="search-question" rows="2" maxlength="2000">My company laptop broke during an overseas client visit. What should I do?</textarea>
            <div class="prompt-chips">
              <button data-prompt="laptop">Laptop overseas</button>
              <button data-prompt="exact">Exact incident ID</button>
              <button data-prompt="personal">Personal device</button>
            </div>
            <div class="form-footer">
              <label>
                Policy scope
                <select id="search-scope">
                  <option value="current">Applicable on selected date</option>
                  <option value="all">All versions / baseline</option>
                </select>
              </label>
              <label>Policy date<input id="search-date" type="date" value="2026-11-10"></label>
              <button id="compare" class="button teal">Compare retrieval <span>→</span></button>
            </div>
          </div>
          <div class="section-title">
            <h2>Three ways to find an answer</h2>
            <span>Top 5 passages per strategy</span></div>
          <div class="result-grid">
            <article class="retrieval-column">
              <div class="column-heading"><span class="mini-icon">Aa</span>
                <h3>Keyword</h3>
                <span class="tag">LEXICAL</span></div>
              <p class="column-description">Literal terms and exact identifiers.</p>
              <div id="keyword-results" class="results">
                <div class="empty">Run a comparison to see ranked passages.</div>
              </div>
            </article>
            <article class="retrieval-column">
              <div class="column-heading"><span class="mini-icon">∿</span>
                <h3>Semantic</h3>
                <span class="tag">MEANING</span></div>
              <p class="column-description">384-dimensional local embeddings.</p>
              <div id="semantic-results" class="results">
                <div class="empty">Different words can lead to the same policy.</div>
              </div>
            </article>
            <article class="retrieval-column hybrid">
              <div class="column-heading"><span class="mini-icon">⊕</span>
                <h3>Hybrid</h3>
                <span class="tag">COMBINED</span></div>
              <p class="column-description">Reciprocal rank fusion of both lists.</p>
              <div id="hybrid-results" class="results">
                <div class="empty">Lexical precision meets semantic flexibility.</div>
              </div>
            </article>
          </div>
          <p class="footnote">
            Keyword uses literal token matching, not a production full-text engine. Semantic scores are cosine
            similarity, not confidence. Hybrid combines ranks with RRF (k = 60).
          </p>
        </section>
        <section id="view-answers" class="view" hidden>
          <div class="two-columns">
            <div class="panel question-panel">
              <span class="eyebrow">02 / RETRIEVAL-AUGMENTED GENERATION</span>
              <h2>From a passage to guidance.</h2>
              <label class="question-label" for="answer-question">Ask your knowledge assistant</label>
              <textarea id="answer-question" rows="4" maxlength="2000">My company laptop broke during an overseas client visit. What should I do?</textarea>
              <div class="form-footer">
                <label>
                  Retrieval
                  <select id="answer-strategy">
                    <option value="hybrid">Hybrid</option>
                    <option value="semantic">Semantic</option>
                    <option value="keyword">Keyword</option>
                  </select>
                </label>
                <button id="ask" class="button teal">Retrieve &amp; answer →</button>
              </div>
              <div class="help-box"><strong id="answer-mode-label">Evidence mode is ready</strong>
                <p id="answer-mode-copy">
                  Search works without a key. Connect an answer model to synthesize guidance from the selected
                  evidence.
                </p>
                <button id="connect-inline" class="text-button">Configure answer model ↗</button>
              </div>
              <details class="code-panel">
                <summary>Show the ColdFusion building blocks</summary>
                <pre>documents = documentService().load({path: policyPath});
embeddings = EmbeddingModel().embedAll(chunkTexts);
// Apply tenant and policy-date eligibility before scoring.
// Retrieve passages and construct the visible evidence context.
answer = ChatModel(modelConfig).chat(evidencePrompt);</pre>
              </details>
              <details class="code-panel">
                <summary>Run the native simpleRAG proof of concept</summary>
                <p>
                  A separate bounded path using the current persona's current PDFs. Builds its index on each run; the
                  main evidence trace does not describe this separate call.
                </p>
                <pre>rag = simpleRAG(authorizedFiles, model,
    {vectorStore: VectorStore(), maxResults: 4});
rag.ingest();
answer = rag.ask(question);</pre>
                <button id="native" class="button outline">Run native simpleRAG</button>
                <div id="native-output" class="answer-text"></div>
              </details>
            </div>
            <div>
              <div class="panel answer-panel">
                <div class="panel-heading">
                  <span class="eyebrow">THE ANSWER</span>
                  <span id="answer-kind" class="badge">Awaiting question</span>
                </div>
                <div id="answer-output" class="answer-text empty">A useful answer starts with the right evidence.</div>
                <div id="answer-metrics" class="metrics"></div>
              </div>
              <div class="panel evidence-panel">
                <div class="panel-heading">
                  <h3>Selected evidence context</h3>
                  <span id="context-count" class="quiet">0 passages</span></div>
                <div id="answer-evidence" class="results">
                  <div class="empty">Selected context will appear here.</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="view-trust" class="view" hidden>
          <div class="trust-presets">
            <button class="scenario selected" data-scenario="stale">
              <span>01 / FRESHNESS</span>
              <strong>Old policy. Current question.</strong>
              <small>2022 &amp; 2023: 72h · 2026: 24h</small>
            </button>
            <button class="scenario" data-scenario="missing">
              <span>02 / SUFFICIENCY</span>
              <strong>When the answer is absent.</strong>
              <small>No approved numeric 2027 limit</small>
            </button>
            <button class="scenario" data-scenario="conflict">
              <span>03 / CONTRADICTION</span>
              <strong>Two approved sources disagree.</strong>
              <small>24 hours versus 48 hours</small>
            </button>
            <button class="scenario" data-scenario="tenant">
              <span>04 / TENANT SCOPE</span>
              <strong>Right evidence. Right scope.</strong>
              <small>Try two independent browser sessions</small>
            </button>
          </div>
          <div class="panel question-panel">
            <div class="panel-heading">
              <span class="eyebrow" id="scenario-label">FRESHNESS / INSPECT, THEN IMPROVE</span>
              <span class="badge">Application controls</span>
            </div>
            <label class="question-label" for="trust-question">Challenge the evidence path</label>
            <textarea id="trust-question" rows="2" maxlength="2000">How quickly must I report damaged company equipment during overseas travel?</textarea>
            <div class="form-footer">
              <label>Policy date<input type="date" id="trust-date" value="2026-11-10"></label>
              <label class="check-label"><input type="checkbox" id="trust-conflict"> Include conflicting source</label>
              <button id="trust-run" class="button teal">Run the challenge →</button>
            </div>
          </div>
          <div class="two-columns">
            <div class="panel">
              <div class="panel-heading">
                <h3>Baseline</h3>
                <span class="tag">VECTOR / ALL YEARS</span></div>
              <p class="quiet">Same persona, no policy-date filter. A stale result is possible, not guaranteed.</p>
              <div id="baseline-gate" class="gate" hidden></div>
              <div id="baseline-results" class="results">
                <div class="empty">Inspect the baseline ranking.</div>
              </div>
            </div>
            <div class="panel improved">
              <div class="panel-heading">
                <h3>Improved</h3>
                <span class="tag">HYBRID / APPLICABLE DATE</span></div>
              <p class="quiet">Tenant scope first, policy-date eligibility, fused ranking and explicit evidence checks.</p>
              <div id="improved-gate" class="gate" hidden></div>
              <div id="improved-results" class="results">
                <div class="empty">See which evidence changes.</div>
              </div>
            </div>
          </div>
          <div class="help-box">
            <strong>What the tenant demonstration proves</strong>
            <p>
              The server keeps a persona in each session and excludes other tenants before vector scoring and model
              context. The local persona selector simulates identities; it is not authentication. These synthetic PDFs
              also remain in the static assets folder. The scoped source endpoint is checked, but raw asset URLs are
              not a production access boundary.
            </p>
          </div>
        </section>
        <section id="view-corpus" class="view" hidden>
          <div class="section-title">
            <h2>The documents behind the answers</h2>
            <span>Only the selected persona's documents are listed</span></div>
          <div id="document-grid" class="document-grid"></div>
          <div class="panel chunk-panel">
            <div class="panel-heading">
              <div><span class="eyebrow">CHUNK INSPECTOR</span>
                <h2>A rule needs its conditions.</h2>
              </div>
              <select id="chunk-document" aria-label="Select document for chunk inspection"></select></div>
            <div class="two-columns">
              <div>
                <h3>Fixed 240-character cuts</h3>
                <p class="quiet">A deliberately small, zero-overlap comparison.</p>
                <div id="fixed-chunks" class="chunk-list">
                  <div class="empty">Build the index and select a document.</div>
                </div>
              </div>
              <div>
                <h3>Section-aware passages</h3>
                <p class="quiet">Used by the main demo retrieval pipeline.</p>
                <div id="structured-chunks" class="chunk-list">
                  <div class="empty">Conditions stay connected to the rule.</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="view-evaluation" class="view" hidden>
          <div class="panel evaluation-intro">
            <div><span class="eyebrow">05 / MEASURE THE EVIDENCE PATH</span>
              <h2>Same questions. Measured results.</h2>
              <p>Run labeled retrieval cases across keyword, semantic and hybrid strategies. No answer model or API key is needed.</p>
            </div>
            <div class="eval-actions">
              <button id="evaluate" class="button teal">Run evaluation →</button>
              <button id="export" class="button outline" disabled>Export JSON</button>
            </div>
          </div>
          <div id="eval-summary" class="evaluation-summary"></div>
          <div class="panel table-wrap">
            <table>
              <thead>
                <tr>
                  <th>CASE / EXPECTED EVIDENCE</th>
                  <th>KEYWORD</th>
                  <th>SEMANTIC</th>
                  <th>HYBRID</th>
                </tr>
              </thead>
              <tbody id="evaluation-rows">
                <tr>
                  <td colspan="4" class="empty">Run the suite to measure source hits, scope checks, application gates and elapsed time.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="footnote">
            This small synthetic suite measures retrieval and application checks at Top 5. It does not measure LLM
            answer correctness, groundedness, business value, cost, or production security. Failures stay visible.
          </p>
        </section>
        <footer class="workspace-footer">
          <span>BUILT WITH COLDFUSION / DOCUMENTS → EVIDENCE → ANSWERS</span>
          <span id="build-label">2025 · Update 14</span>
        </footer>
      </div>
    </main>
    <dialog id="settings">
      <form id="settings-form">
        <div class="dialog-heading">
          <div><span class="eyebrow">MODEL CONNECTION</span>
            <h2>Add generation when ready.</h2>
          </div>
          <button type="button" id="settings-close" class="icon-button" aria-label="Close">×</button>
        </div>
        <p>Embeddings run locally. An answer model is optional and is configured per browser session.</p>
        <label>
          Provider
          <select id="provider">
            <option value="none">Decide later / evidence only</option>
            <option value="openai">OpenAI API</option>
            <option value="anthropic">Anthropic / Claude API</option>
            <option value="codemax">CodeMax / Claude-compatible gateway (.env)</option>
            <option value="ollama">Local Ollama</option>
          </select>
        </label>
        <label>Model name<input id="model-name" placeholder="Enter a model available to your provider" maxlength="120"></label>
        <label id="api-key-label">
          API key
          <input id="api-key" type="password" autocomplete="off" placeholder="Stored only in this server session">
        </label>
        <div id="gateway-help" class="help-box" hidden>
          <strong>Server-side CodeMax connection</strong>
          <p>Key and model are read from the private .env file at
            C:\ColdFusion2025\cfusion\cfsummit2026-config\.env.
            The key never needs to be entered in this browser.</p>
          <p>Gateway: https://api.codemax.pro · Messages API</p>
          <button id="gateway-refresh" class="text-button" type="button">Refresh from .env ↻</button>
        </div>
        <p class="footnote">
          Keys entered here stay in the server session. CodeMax instead reads the private server .env file.
          Keys are never returned in API responses or included in application logs.
          Closing the dialog clears the browser key input. Ollama connects to 127.0.0.1:11434.
        </p>
        <button class="button teal" type="submit">Save connection →</button>
        <button id="connection-test" class="button outline" type="button">Test connection</button>
        <p id="connection-result" role="status" class="quiet"></p>
      </form>
    </dialog>
    <dialog id="passage-dialog">
      <div class="dialog-heading">
        <h2 id="passage-title">Source passage</h2>
        <button id="passage-close" class="icon-button" aria-label="Close source passage">×</button>
      </div>
      <div id="passage-meta" class="quiet"></div>
      <pre id="passage-text" class="passage-text"></pre>
      <a id="passage-source" class="button outline" target="_blank" rel="noopener">Open original PDF ↗</a></dialog>
  </body>
</html>

