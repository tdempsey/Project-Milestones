const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),YAML=require('yaml');
class El {
 constructor(){this.children=[];this.attrs={};this.style={};this.dataset={};}
 empty(){this.children=[];}
 createEl(tag,o={}){const e=new El();Object.assign(e,o);e.tag=tag;this.children.push(e);return e;}
 createSpan(o){return this.createEl('span',o);}
 addEventListener(){} setAttr(k,v){this.attrs[k]=v;} setText(v){this.text=v;} addClass(){}
}
const fields=[];
class Setting {
 constructor(){fields.push(this);} setName(v){this.name=v;return this;}setDesc(){return this;}
 addText(f){this.input={inputEl:new El(),setPlaceholder(){},onChange(f){this.change=f;}};f(this.input);return this;}
 addDropdown(f){f({addOption(){},setValue(){},onChange(){}});return this;}
 addButton(f){f({setButtonText(){return this;},setCta(){return this;},onClick(){return this;}});return this;}
}
const obsidian={Setting,Modal:class{constructor(app){this.app=app;this.contentEl=new El();}close(){this.closed=true;}},Plugin:class{},PluginSettingTab:class{},ItemView:class{},Notice:class{}};
const context=vm.createContext({require:()=>obsidian,module:{exports:{}},console,Map,Set,Date,Intl,queueMicrotask,window:{setTimeout(){}}});
vm.runInContext(fs.readFileSync('dist/project-milestone-gpt-tracker/main.js','utf8')+'\nglobalThis.api={CreateItemModal,loadData,DashboardView,DEFAULT_SETTINGS};',context);
const {CreateItemModal,loadData,DashboardView,DEFAULT_SETTINGS}=context.api;
(async()=>{
 for(const raw of ['#summary','  #research/report  ','https://example.com/result','', '   ', 'value: "quoted"\n#tag']){
  fields.length=0;const stored=new Map(),opened=[];let created=0;
  const app={vault:{adapter:{exists:async p=>stored.has(p)||p==='GPT Tasks'},create:async(path,text)=>{const f={path,basename:'Task',parent:{path:'GPT Tasks'}};stored.set(path,{f,text});return f;},getMarkdownFiles:()=>[...stored.values()].map(x=>x.f)},metadataCache:{getFileCache:f=>({frontmatter:YAML.parse(stored.get(f.path).text.split('---')[1])})},workspace:{getLeaf:()=>({openFile:async f=>opened.push(f)})}};
  const settings={...DEFAULT_SETTINGS};const before=JSON.stringify(settings);
  const modal=new CreateItemModal(app,'gpt-task',settings,[],()=>created++);
  modal.onOpen(); const output=fields.find(f=>f.name==='Output tag');assert.ok(output);
  fields.find(f=>f.name==='Title').input.change('Task');
  output.input.change(raw);await modal.submit();
  assert.equal(created,1);assert.equal(opened.length,1);assert.ok(modal.closed);assert.equal(JSON.stringify(settings),before);
  const text=[...stored.values()][0].text,fm=YAML.parse(text.split('---')[1]);
  if(raw.trim())assert.equal(fm.output,raw.trim());else assert.ok(!Object.hasOwn(fm,'output'));
  // Reopen from persisted note frontmatter using the actual loader.
  const data=loadData(app,settings,new Map());assert.equal(data.gptTasks.length,1);assert.equal(data.gptTasks[0].output,raw.trim());
  const body=new El(),view=Object.create(DashboardView.prototype);view.plugin={settings};view.sectionHead=()=>{};view.countText=()=>'';view.el=(p,t,c,text)=>p.createEl(t,{cls:c,text});view.table=()=>body;view.projectIconMap=()=>new Map();view.dueCell=tr=>tr.createEl('td');view.editableChip=()=>{};
  view.renderGptTasks(new El(),data,data.gptTasks,1);
  const cell=body.children[0].children[3];assert.equal(cell.dataset.pmgSortValue,raw.trim());
  if(raw.startsWith('https:'))assert.equal(cell.children[0].href,raw);else assert.equal(cell.text,raw.trim()||'—');
 }
 fields.length=0;new CreateItemModal({},'milestone',DEFAULT_SETTINGS,[],()=>{}).onOpen();assert.ok(!fields.some(f=>f.name==='Output tag'));
 console.log('PASS: GPT task form, with/without output tag, YAML escaping, whitespace, URL display, persistence/reopening through loader, optional field scope, unchanged settings.');
})().catch(e=>{console.error(e);process.exitCode=1;});
