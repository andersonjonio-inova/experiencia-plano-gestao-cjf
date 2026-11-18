(function () {
  "use strict";
  const data = window.PLANO;
  const $ = (id) => document.getElementById(id);
  const node = (tag, cls, text) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  };
  const disclosure = (title, body, cls) => {
    const d = node("details", cls || "disclosure");
    const summary = node("summary", "", title);
    const content = node("div", "disclosure-body");
    if (typeof body === "string") content.append(node("p", "", body));
    else content.append(body);
    d.append(summary, content);
    return d;
  };

  function renderPerspectives() {
    const tabs = $("perspective-tabs"), panel = $("perspective-panel");
    function show(i, focus) {
      const item = data.perspectives[i];
      [...tabs.children].forEach((b, n) => {
        b.setAttribute("aria-selected", n === i ? "true" : "false");
        b.tabIndex = n === i ? 0 : -1;
        if (n === i && focus) b.focus();
      });
      panel.replaceChildren();
      panel.append(node("span", "panel-index", "PERSPECTIVA " + item.number), node("h3", "", item.title), node("p", "", item.description));
      const question = node("p", "prompt"); question.append(node("strong", "", "Pergunta para observar: "), document.createTextNode(item.question));
      const axes = node("ul", "linked-axes"); item.axes.forEach(x => axes.append(node("li", "", x)));
      panel.append(question, node("h4", "", "Eixos associados no plano"), axes);
      panel.setAttribute("aria-labelledby", "perspective-tab-" + item.id);
    }
    data.perspectives.forEach((item, i) => {
      const b = node("button", "perspective-tab"); b.type = "button"; b.id = "perspective-tab-" + item.id;
      b.setAttribute("role", "tab"); b.setAttribute("aria-controls", "perspective-panel"); b.setAttribute("aria-selected", i === 0 ? "true" : "false"); b.tabIndex = i === 0 ? 0 : -1;
      b.append(node("span", "tab-num", item.number), node("span", "", item.title));
      b.addEventListener("click", () => show(i, false));
      b.addEventListener("keydown", e => {
        let n = i; if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % data.perspectives.length;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + data.perspectives.length) % data.perspectives.length;
        else if (e.key === "Home") n = 0; else if (e.key === "End") n = data.perspectives.length - 1; else return;
        e.preventDefault(); show(n, true);
      }); tabs.append(b);
    });
    show(0, false);
  }

  function renderAxes() {
    const tabs = $("axis-tabs"), panel = $("axis-panel");
    function show(i, focus) {
      const axis = data.axes[i];
      [...tabs.children].forEach((b, n) => { b.setAttribute("aria-selected", n === i ? "true" : "false"); b.tabIndex = n === i ? 0 : -1; if (n === i && focus) b.focus(); });
      panel.replaceChildren();
      const top = node("div", "axis-top"); top.append(node("span", "axis-number", "EIXO " + axis.number), node("span", "axis-perspective", axis.perspective));
      panel.append(top, node("h3", "", axis.title), node("p", "axis-purpose", axis.purpose));
      const heading = node("div", "actions-heading"); heading.append(node("h4", "", "Iniciativas do eixo"), node("span", "", axis.actions.length + " itens")); panel.append(heading);
      const list = node("div", "action-accordion");
      axis.actions.forEach(([title, desc], n) => {
        const body = node("p", "", desc);
        if (/[Cc]onferir|repete|confirmar/.test(desc)) body.classList.add("source-alert");
        list.append(disclosure((String(n + 1).padStart(2, "0") + "  " + title), body, "action-disclosure"));
      });
      panel.append(list); panel.setAttribute("aria-labelledby", "axis-tab-" + axis.id);
    }
    data.axes.forEach((axis, i) => {
      const b = node("button", "axis-tab"); b.type = "button"; b.id = "axis-tab-" + axis.id; b.setAttribute("role", "tab"); b.setAttribute("aria-controls", "axis-panel"); b.setAttribute("aria-selected", i === 0 ? "true" : "false"); b.tabIndex = i === 0 ? 0 : -1;
      b.append(node("span", "axis-tab-num", axis.number), node("span", "axis-tab-label", axis.title)); b.setAttribute("aria-label", "Eixo " + axis.number + ": " + axis.title);
      b.addEventListener("click", () => show(i, false));
      b.addEventListener("keydown", e => {
        let n = i; if (e.key === "ArrowDown" || e.key === "ArrowRight") n = (i + 1) % data.axes.length;
        else if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = (i - 1 + data.axes.length) % data.axes.length;
        else if (e.key === "Home") n = 0; else if (e.key === "End") n = data.axes.length - 1; else return;
        e.preventDefault(); show(n, true);
      }); tabs.append(b);
    }); show(0, false);
  }

  function renderSupport() {
    const wrap = $("support-accordion");
    data.support.forEach(item => {
      const content = node("div", "support-detail"); content.append(node("p", "", item.summary));
      if (item.items.length) {
        const ul = node("ul", "support-list"); item.items.forEach(([name, desc]) => { const li = node("li"); li.append(node("strong", "", name + ": "), document.createTextNode(desc)); ul.append(li); }); content.append(ul);
      }
      wrap.append(disclosure(item.number + " · " + item.title, content, "support-disclosure"));
    });
  }

  const journey = [
    {title:"Definir a contribuição pública", kicker:"01 · Comece pelo resultado", text:"Antes de listar ações, explicite que necessidade institucional ou social a iniciativa pretende atender. O Plano de Gestão apresenta valor público e aproximação com a sociedade como referências para as prioridades.", prompt:"Que mudança deverá ser percebida pelo cidadão, pelo jurisdicionado ou pelas unidades da Justiça Federal?"},
    {title:"Localizar a prioridade", kicker:"02 · Relacione perspectiva e eixo", text:"Use o mapa BSC para identificar em qual perspectiva a iniciativa se conecta e qual eixo apresenta a contribuição mais direta. Uma mesma entrega pode depender de mais de um eixo.", prompt:"Qual eixo é o ponto de partida? Que outros eixos podem habilitar ou ampliar a entrega?"},
    {title:"Examinar as ações previstas", kicker:"03 · Passe da intenção às iniciativas", text:"Leia as ações listadas no eixo e procure compreender sua contribuição. Evite tratar o título de uma iniciativa como evidência de resultado já alcançado.", prompt:"Que atividade, produto ou capacidade aparece no plano? O que ainda precisa ser esclarecido para compreender a execução?"},
    {title:"Identificar dependências", kicker:"04 · Considere o pilar de sustentação", text:"Observe a relação com estrutura organizacional, integração CJF–STJ, governança orçamentária, marco normativo, segurança, infraestrutura e simplificação de contratações.", prompt:"Quais áreas, parceiros, recursos, regras ou condições tornam a iniciativa viável?"},
    {title:"Acompanhar e ajustar", kicker:"05 · Procure evidências e pontos de revisão", text:"O plano destaca responsáveis, prazos, indicadores, recursos, riscos e entregas incrementais. Acompanhar esses elementos permite observar avanços e avaliar ajustes de rota.", prompt:"Que evidência mostraria avanço? Que risco ou mudança exigiria rever etapas, prazo ou recursos?"}
  ];
  function renderJourney() {
    const tabs = $("journey-tabs"), panel = $("journey-panel"), progress = $("journey-progress"), count = $("journey-count");
    let active = 0;
    function show(i, focus) {
      active = i; const item = journey[i];
      [...tabs.children].forEach((b,n) => { b.setAttribute("aria-selected", n === i ? "true" : "false"); b.tabIndex = n === i ? 0 : -1; if (n === i && focus) b.focus(); });
      panel.replaceChildren(node("span", "panel-index", item.kicker), node("h3", "", item.title), node("p", "", item.text));
      const p = node("div", "journey-question"); p.append(node("strong", "", "Pergunta para orientar sua análise"), node("p", "", item.prompt)); panel.append(p);
      panel.setAttribute("aria-labelledby", "journey-tab-" + (i + 1)); progress.value = i + 1; count.textContent = "Etapa " + (i + 1) + " de " + journey.length;
      $("journey-prev").disabled = i === 0; $("journey-next").disabled = i === journey.length - 1;
      $("journey-next").textContent = i === journey.length - 1 ? "Percurso concluído" : "Próxima etapa →";
    }
    journey.forEach((item,i) => {
      const b = node("button", "journey-tab"); b.type = "button"; b.id = "journey-tab-" + (i + 1); b.setAttribute("role", "tab"); b.setAttribute("aria-controls", "journey-panel"); b.setAttribute("aria-selected", i === 0 ? "true" : "false"); b.tabIndex = i === 0 ? 0 : -1;
      b.append(node("span", "journey-tab-num", String(i + 1).padStart(2,"0")), node("span", "journey-tab-title", item.title));
      b.addEventListener("click", () => show(i,false));
      b.addEventListener("keydown", e => { let n=i; if(e.key==="ArrowRight"||e.key==="ArrowDown") n=(i+1)%journey.length; else if(e.key==="ArrowLeft"||e.key==="ArrowUp") n=(i-1+journey.length)%journey.length; else if(e.key==="Home") n=0; else if(e.key==="End") n=journey.length-1; else return; e.preventDefault(); show(n,true); }); tabs.append(b);
    });
    $("journey-prev").addEventListener("click", () => { if(active>0) show(active-1,false); });
    $("journey-next").addEventListener("click", () => { if(active<journey.length-1) show(active+1,false); });
    show(0,false);
  }

  const fiveW = [
    ["WHAT · O que?", "Qual é a iniciativa ou entrega em análise? Que objetivo do eixo ela apoia?"],
    ["WHY · Por quê?", "Que necessidade institucional ou valor público justifica a prioridade?"],
    ["WHO · Quem?", "Que unidades, órgãos ou parceiros aparecem como responsáveis ou participantes? Consulte a formulação oficial antes de atribuir responsabilidades."],
    ["WHEN · Quando?", "Que prazo, marco ou sequência consta no plano ou em seu anexo? Não deduza datas ausentes."],
    ["WHERE · Onde?", "Em que âmbito institucional, tribunal, unidade ou contexto a iniciativa deve ocorrer?" ]
  ];
  const flip = [
    ["HOW · Como?", "Que ações, etapas, instrumentos e formas de coordenação podem transformar a prioridade em entrega? Compare sua leitura com as iniciativas e condições descritas no plano."],
    ["HOW MUCH · Com quais recursos?", "Que recursos financeiros, tecnológicos, humanos e de infraestrutura são previstos ou precisam ser identificados? O anexo do plano deve ser consultado para valores e estimativas específicos."]
  ];
  function render5W2H() {
    const list = $("fivew-accordion");
    fiveW.forEach(([title,text],i) => { const body = node("div", "fivew-answer"); body.append(node("p", "", text)); list.append(disclosure(title, body, "fivew-disclosure")); });
    const cards = $("flip-cards");
    flip.forEach(([title,text],i) => {
      const article = node("article", "flip-card");
      const inner = node("div", "flip-inner");
      const front = node("div", "flip-face flip-front");
      const reveal = node("button", "flip-button"); reveal.type = "button"; reveal.setAttribute("aria-expanded", "false"); reveal.setAttribute("aria-controls", "flip-panel-" + i);
      reveal.append(node("span", "flip-question", title), node("span", "flip-instruction", "Toque para virar ↻")); front.append(reveal);
      const back = node("div", "flip-face flip-back"); back.id = "flip-panel-" + i; back.setAttribute("aria-hidden", "true");
      back.append(node("strong", "", "Para analisar"), node("p", "", text));
      const turnBack = node("button", "flip-return", "Voltar ao cartão ↺"); turnBack.type = "button"; turnBack.disabled = true; back.append(turnBack);
      const setFlipped = (open) => { article.classList.toggle("is-flipped", open); reveal.setAttribute("aria-expanded", String(open)); reveal.disabled = open; front.setAttribute("aria-hidden", String(open)); back.setAttribute("aria-hidden", String(!open)); turnBack.disabled = !open; };
      reveal.addEventListener("click", () => { setFlipped(true); turnBack.focus(); }); turnBack.addEventListener("click", () => { setFlipped(false); reveal.focus(); });
      inner.append(front, back); article.append(inner); cards.append(article);
    });
  }

  const skills = [
    ["Governança baseada em evidências", "O plano propõe indicadores, jurimetria, monitoramento de riscos e painéis para subsidiar decisões. Esta lente pergunta como dados confiáveis podem apoiar a coordenação."],
    ["Integração tecnológica", "Ações de transformação digital tratam de dados, sistemas, IA, automação e compartilhamento de soluções. Observe interoperabilidade, segurança e governança."],
    ["Articulação interinstitucional", "O documento prevê coordenação entre CJF, TRFs, STJ e outros atores. A leitura deve observar como responsabilidades e instrumentos de cooperação se conectam."],
    ["Prevenção e desjudicialização", "O Eixo 3 reúne ações voltadas à prevenção de demandas evitáveis, negociação pré-processual e articulação sobre temas de litigiosidade."],
    ["Desenvolvimento de pessoas", "O Eixo 4 aborda capacitação, liderança, saúde organizacional, sucessão, trilhas de aprendizagem e gestão do conhecimento."],
    ["Inovação e pesquisa aplicada", "O Eixo 5 relaciona laboratórios, pesquisa, oficinas de inovação, comunicação em rede e cooperação com instituições de ensino e pesquisa."],
    ["Comunicação e acesso", "O Eixo 6 trata de linguagem clara, comunicação, transparência, ouvidoria, justiça itinerante e aproximação da Justiça Federal com a sociedade."],
    ["Gestão de riscos e adaptação", "O plano menciona gestão de riscos, segurança, continuidade, recursos e acompanhamento. Esta lente ajuda a perguntar como reconhecer obstáculos e ajustar a execução."]
  ];
  function renderSkills() {
    const tabs = $("skill-tabs"), panel = $("skill-panel"), mobile = $("skill-accordion");
    function show(i, focus) {
      const item = skills[i]; [...tabs.children].forEach((b,n) => { b.setAttribute("aria-selected", n===i ? "true":"false"); b.tabIndex=n===i?0:-1; if(n===i&&focus)b.focus(); });
      panel.replaceChildren(node("span", "panel-index", "LENTE " + String(i+1).padStart(2,"0")), node("h3", "", item[0]), node("p", "", item[1]));
      panel.setAttribute("aria-labelledby", "skill-tab-"+i);
    }
    skills.forEach(([title,text],i) => {
      const b=node("button","skill-tab",title); b.type="button"; b.id="skill-tab-"+i; b.setAttribute("role","tab"); b.setAttribute("aria-controls","skill-panel"); b.setAttribute("aria-selected",i===0?"true":"false"); b.tabIndex=i===0?0:-1;
      b.addEventListener("click",()=>show(i,false)); b.addEventListener("keydown",e=>{let n=i;if(e.key==="ArrowRight"||e.key==="ArrowDown")n=(i+1)%skills.length;else if(e.key==="ArrowLeft"||e.key==="ArrowUp")n=(i-1+skills.length)%skills.length;else if(e.key==="Home")n=0;else if(e.key==="End")n=skills.length-1;else return;e.preventDefault();show(n,true);}); tabs.append(b);
      const body=node("div","skill-answer"); body.append(node("p","",text)); mobile.append(disclosure(title,body,"skill-disclosure"));
    }); show(0,false);
  }

  function renderCulture() {
    const target = $("culture-practices");
    data.culture.forEach(([title,text],i) => {
      const card=node("article","culture-practice"); card.append(node("span","culture-number",String(i+1).padStart(2,"0")),node("h3","",title),node("p","",text)); target.append(card);
    });
  }

  function renderScenario() {
    const options=$("scenario-options"), feedback=$("scenario-feedback"), reveal=$("reveal-analysis"), analysis=$("analysis-prompt");
    data.scenario.forEach(item=>{
      const b=node("button","scenario-option",item.label); b.type="button"; b.setAttribute("aria-pressed","false");
      b.addEventListener("click",()=>{
        options.querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
        feedback.hidden=false; feedback.classList.toggle("correct",item.correct); feedback.classList.toggle("review",!item.correct); feedback.textContent=item.feedback;
        reveal.hidden=false; analysis.hidden=true;
      }); options.append(b);
    });
    reveal.addEventListener("click",()=>{analysis.hidden=!analysis.hidden;reveal.textContent=analysis.hidden?"Revelar uma pergunta de aprofundamento ↓":"Ocultar pergunta ↑";});
  }

  function setupNavigation() {
    const menu=$("menu-toggle"), nav=$("main-nav");
    menu.addEventListener("click",()=>{const open=menu.getAttribute("aria-expanded")==="true";menu.setAttribute("aria-expanded",String(!open));nav.classList.toggle("nav-open",!open);});
    nav.addEventListener("click",e=>{if(e.target.closest("a")){menu.setAttribute("aria-expanded","false");nav.classList.remove("nav-open");}});
    const sections=[...document.querySelectorAll(".observe-section")], progress=$("page-progress"), label=$("progress-label"), links=[...nav.querySelectorAll("a")];
    const names={inicio:"Início",mapa:"Mapa BSC",eixos:"Seis eixos",sustentacao:"Sustentação",percurso:"Etapas", "cinco-w":"5W2H",cultura:"Cultura",competencias:"Competências",atividade:"Aplicação",fechamento:"Síntese"};
    const update=()=>{const max=document.documentElement.scrollHeight-innerHeight;const n=max>0?Math.round(scrollY/max*100):100;progress.value=n;progress.setAttribute("aria-valuetext",n+"% percorrido");}; update(); addEventListener("scroll",update,{passive:true});
    if("IntersectionObserver" in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;label.textContent=names[entry.target.id]||"Percurso";links.forEach(a=>{if(a.hash==="#"+entry.target.id)a.setAttribute("aria-current","location");else a.removeAttribute("aria-current");});}),{rootMargin:"-20% 0px -68% 0px"});sections.forEach(s=>observer.observe(s));}
  }
  renderPerspectives(); renderAxes(); renderSupport(); renderJourney(); render5W2H(); renderCulture(); renderSkills(); renderScenario(); setupNavigation();
}());
