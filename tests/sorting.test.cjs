const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
class El {
  constructor(tag='div', opts={}) { Object.assign(this,{tag,text:opts.text||'',cls:opts.cls||'',children:[],attrs:{},style:{},events:{},dataset:{}}); }
  createEl(tag,opts={}) { const el=new El(tag,opts); this.appendChild(el); return el; }
  createDiv(o) { return this.createEl('div',o); }
  createSpan(o) { return this.createEl('span',o); }
  appendChild(el) { if(el.parent) el.parent.children=el.parent.children.filter(x=>x!==el); el.parent=this; this.children.push(el); }
  get textContent() { return this.text+this.children.map(x=>x.textContent).join(''); }
  setText(t) { this.text=t; }
  setAttr(k,v) { this.attrs[k]=v; }
  addClass(c) { this.cls+=' '+c; }
  addEventListener(k,f) { this.events[k]=f; }
  empty() { this.children=[]; }
  querySelector(s) { return this.querySelectorAll(s)[0]||null; }
  querySelectorAll(s) { return this.children.flatMap(c=>[...(c.cls.split(' ').includes(s.slice(1))?[c]:[]),...c.querySelectorAll(s)]); }
}
const settings=[];
class Setting {
  constructor() { settings.push(this); }
  setName(n) { this.name=n; return this; }
  setDesc() { return this; }
  addText(f) {
    const t={inputEl:{setCustomValidity(v){this.error=v;},setAttribute(){},reportValidity(){}},setValue(v){this.value=v;},onChange(f){this.change=f;}};
    this.text=t; f(t); return this;
  }
  addToggle(f) { const t={setValue(){},onChange(f){this.change=f;}}; this.toggle=t; f(t); return this; }
}
const obsidian={Setting,Plugin:class{},ItemView:class{},Modal:class{},PluginSettingTab:class{constructor(){this.containerEl=new El();}}};
const context=vm.createContext({require:()=>obsidian,module:{exports:{}},console,queueMicrotask,Map,Set,Date,Intl});
vm.runInContext(fs.readFileSync('dist/project-milestone-gpt-tracker/main.js','utf8')+'\nglobalThis.View=DashboardView; globalThis.Plugin=PMGPlugin; globalThis.SettingsTab=PMGSettingTab;',context);
const view=Object.create(context.View.prototype);
view.el=(parent,tag,cls,text)=>parent.createEl(tag,{cls,text});
const tick=()=>new Promise(queueMicrotask);
function fixture(headers,values) {
  const root=new El(); const body=view.table(root,headers);
  values.forEach((values,i)=> { const row=body.createEl('tr'); row.id=i; row.addEventListener('click',()=>i); values.forEach(v=>row.createEl('td',{text:v})); });
  const table=root.children[0];
  return {body,click:i=>table.children[0].children[0].children[i].children[0].events.click({stopPropagation(){}}),th:i=>table.children[0].children[0].children[i],ids:()=>body.children.map(x=>x.id)};
}
(async()=>{
  let f=fixture(['Project','Progress','Due','Milestones','GPTs linked'],[
    ['Project 10','100% (manual)','2026-12-01','10/12','12 linked'],
    ['project 2','9% (from milestones)','2026-02-01','2/3','2 linked'],
    ['—','—','','—','—'],
    ['Project 2','9% (manual)','2026-02-01','2/8','2 linked']]);
  await tick();
  for(const i of [0,1,2,3,4]) {
    f.click(i); assert.deepEqual(f.ids(),[1,3,0,2]); assert.equal(f.th(i).attrs['aria-sort'],'ascending');
    assert.match(f.th(i).children[0].text,/▲/);
    f.click(i); assert.deepEqual(f.ids(),[0,1,3,2]); assert.equal(f.th(i).attrs['aria-sort'],'descending');
    assert.match(f.th(i).children[0].text,/▼/);
  }
  assert.equal(f.body.children[1].events.click(),1,'row handlers survive reordering');
  f=fixture(['Project','Progress','Due','Milestones','GPTs linked'],[['A','2%','2026-01-01','1/1','2 linked'],['B','12%','2026-01-02','1/1','12 linked']]);
  await tick(); assert.deepEqual(f.ids(),[1,0],'saved direction reapplied after filtering/refresh');
  const dates=fixture(['Due'],[['Jan 2, 2027'],['Dec 31, 2026'],['invalid'],['—']]);
  await tick(); dates.click(0); assert.deepEqual(dates.ids(),[1,0,2,3]);
  const empty=fixture(['Owner'],[]); view.emptyRow(empty.body,1,'No results'); await tick(); empty.click(0); assert.equal(empty.body.children.length,1);
  const output=fixture(['Output'],[['Open ↗'],['Open ↗']]);
  output.body.children[0].children[0].dataset.pmgSortValue='https://z.example';
  output.body.children[1].children[0].dataset.pmgSortValue='https://a.example';
  await tick(); output.click(0); assert.deepEqual(output.ids(),[1,0]);
  const plugin={settings:{enableLeaderboard:true}}; view.plugin=plugin;
  const root=new El();
  const data={projects:Array.from({length:7},(_,i)=>({title:`P${i}`,progress:i*10,milestoneDone:i,milestoneTotal:10,status:'active',file:{path:`P${i}.md`}}))};
  const before=JSON.stringify(data); view.renderLeaderboard(root,data); await tick();
  const bodyOf=root=>root.querySelector('.pmg-leaderboard-table-wrap').children[0].children[1];
  assert.equal(JSON.stringify(data),before); assert.equal(bodyOf(root).children.length,5);
  assert.deepEqual(bodyOf(root).children.map(r=>r.children[1].textContent),['P6','P5','P4','P3','P2']);
  const table=bodyOf(root).parent;
  table.children[0].children[0].children[1].children[0].events.click({stopPropagation(){}});
  assert.deepEqual(bodyOf(root).children.map(r=>r.children[1].textContent),['P2','P3','P4','P5','P6']);
  for(const [limit,count] of [[2,2],[20,7],[0,5],[-1,5],[1.5,5],['3',5],[NaN,5]]) {
    plugin.settings.leaderboardLimit=limit;
    const r=new El(); view.renderLeaderboard(r,data); await tick(); assert.equal(bodyOf(r).children.length,count);
  }
  const fewer=new El(); view.renderLeaderboard(fewer,{projects:data.projects.slice(0,2)}); await tick(); assert.equal(bodyOf(fewer).children.length,2);
  const tied=new El(); plugin.settings.leaderboardLimit=3;
  view.renderLeaderboard(tied,{projects:data.projects.slice(0,4).map(p=>({...p,progress:50,milestoneDone:1}))}); await tick();
  assert.deepEqual(bodyOf(tied).children.map(r=>r.children[0].textContent),['1','1','1']);
  assert.match(root.textContent,/Project Momentum/);
  plugin.settings.enableLeaderboard=false; const disabled=new El(); view.renderLeaderboard(disabled,data); assert.equal(disabled.children.length,0);
  const real=new context.Plugin(); real.app={workspace:{getLeavesOfType:()=>[]}};
  real.loadData=async()=>({workspaceName:'Preserved',customKey:'untouched',enableLeaderboard:true});
  await real.loadSettings(); assert.equal(real.settings.leaderboardLimit,5); assert.equal(real.settings.customKey,'untouched');
  let saves=0; real.saveData=async()=>{saves++;};
  new context.SettingsTab(real).display();
  const input=settings.find(s=>s.name==='Project Momentum display limit').text;
  assert.equal(input.value,'5'); assert.equal(input.inputEl.type,'number');
  for(const v of ['', ' ', '0', '-1', '2.5', 'abc', 'Infinity', '9007199254740992']) {
    await input.change(v); assert.equal(real.settings.leaderboardLimit,5); assert.ok(input.inputEl.error);
  }
  assert.equal(saves,0);
  await input.change('3'); assert.equal(real.settings.leaderboardLimit,3); assert.equal(saves,1); assert.equal(input.inputEl.error,'');
  await settings.find(s=>s.name==='Enable Project Momentum').toggle.change(false); assert.equal(real.settings.enableLeaderboard,false);
  await settings.find(s=>s.name==='Enable Project Momentum').toggle.change(true); assert.equal(real.settings.enableLeaderboard,true); assert.equal(real.settings.leaderboardLimit,3);
  real.loadData=async()=>({...real.settings,leaderboardLimit:-2}); await real.loadSettings(); assert.equal(real.settings.leaderboardLimit,5);
  real.loadData=async()=>({...real.settings,leaderboardLimit:8}); await real.loadSettings(); assert.equal(real.settings.leaderboardLimit,8);
  console.log('PASS: default 5/migration, custom limits, fewer rows, invalid saved/UI inputs, ties, toggle, data preservation, and sorting regression (directions, text/numeric/date, empties, refresh, row handlers, URLs).');
})().catch(e=>{console.error(e);process.exitCode=1;});
