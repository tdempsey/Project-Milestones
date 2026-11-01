const {DOMParser,DOMImplementation,XMLSerializer}=require('@xmldom/xmldom');
class SafeTestParser {
 parseFromString(source,type) {
  const doc=new DOMParser().parseFromString(source,type);
  const walk=e=>{Object.defineProperty(e,'children',{get(){return Array.from(this.childNodes).filter(n=>n.nodeType===1)}});for(const c of e.children)walk(c)};
  walk(doc.documentElement);return doc;
 }
}
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
const obsidian={setIcon:()=>{},Notice:class{},Setting,Plugin:class{},ItemView:class{},Modal:class{},PluginSettingTab:class{constructor(){this.containerEl=new El();}}};
const context=vm.createContext({require:()=>obsidian,module:{exports:{}},console,queueMicrotask,Map,Set,Date,Intl,DOMParser:SafeTestParser});
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

vm.runInContext('globalThis.icons={loadIconizeIcons,normalizeIconizeValue,renderIconGraphic,IconPickerModal,pmgPackIcons};',context);
const api=context.icons;
obsidian.setIcon=()=>{};
(async()=>{
 const packs=JSON.parse(fs.readFileSync('tests/fixtures/icon-packs.json','utf8'));
 assert.deepEqual(packs.map(p=>p.icons.length),[484,163,495]);
 packs.push({name:'lucide-icons',prefix:'Li',icons:[{name:'ListTodo',prefix:'Li',svgElement:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M0 0h10"/></svg>'}]});
 const app={plugins:{getPlugin:()=>({api:{getAllIconPacks:()=>packs}})},vault:{configDir:'.obsidian',adapter:{exists:async()=>true,read:async()=>JSON.stringify({settings:{iconPacksPath:'.obsidian/icons'},'To Do.md':'LiListTodo'})}}};
 let data=await api.loadIconizeIcons(app);
 assert.equal(data.allIcons.length,1143); assert.equal(data.byPath.get('To Do.md'),'LiListTodo');
 assert.equal(api.normalizeIconizeValue('FabGithub'),'FabGithub');
 assert.equal(api.normalizeIconizeValue('🚀'),'🚀');
 const doc=new DOMImplementation().createDocument(null,'root');
 for(const id of data.allIcons) {
  const node=doc.createElement('span'); node.setText=()=>assert.fail('pack icon became plain text');
  api.renderIconGraphic(node,id); assert.equal(node.firstChild.localName,'svg',id);
 }
 const evil={name:'Evil',prefix:'Test',svgElement:'<svg onload="alert(1)"><script>alert(1)</script><foreignObject/><path d="M0 0h1" fill="url(https://x)" onclick="x()"/><image href="https://x"/></svg>'};
 api.pmgPackIcons.set('TestEvil',evil); const n=doc.createElement('span'); api.renderIconGraphic(n,'TestEvil');
 const markup=new XMLSerializer().serializeToString(n); assert.doesNotMatch(markup,/onload|onclick|script|foreignObject|image|url\(/);
 packs.push({name:'new-pack',prefix:'Np',icons:[{name:'New',prefix:'Np',svgElement:'<svg><path d="M0 0"/></svg>'}]});
 data=await api.loadIconizeIcons(app);assert.ok(data.allIcons.includes('NpNew'));
 // Exercise actual picker search, including pack names, and selecting canonical IDs.
 const picker=Object.create(api.IconPickerModal.prototype); picker.extraIcons=data.allIcons;picker.current='';picker.query='font-awesome-brands';
 for(const key of ['lucideGrid','extraSection','extraGrid','emojiSection','emojiGrid','customBtn'])picker[key]=new El();
 picker.input={value:''};
 // Give test-created preview nodes a real owner document and append destination.
 const oldCreate=El.prototype.createEl;
 El.prototype.createEl=function(tag,o){const el=oldCreate.call(this,tag,o);el.ownerDocument=doc;if(tag==='input')el.value='';return el;};
 picker.renderGrids(); assert.equal(picker.extraGrid.children.length,484);
 picker.query='fabgithub';picker.renderGrids();assert.ok(picker.extraGrid.children.length>0);
 let picked;picker.onPick=v=>picked=v;picker.close=()=>{};
 picker.extraGrid.children[0].events.click(); assert.match(picked,/^FabGithub/);
 picker.query='ra';picker.renderGrids(); assert.ok(picker.extraGrid.children.some(b=>b.title.startsWith('Ra')));
 vm.runInContext('globalThis.window={setTimeout:()=>{}};',context);
 const opening=Object.create(api.IconPickerModal.prototype);
 Object.assign(opening,{app,contentEl:new El(),extraIcons:[],extraLabel:'From Iconize',current:'',query:''});
 opening.onOpen();await new Promise(setImmediate);
 assert.ok(opening.extraIcons.includes('NpNew'),'picker opening refreshes catalogue');
 opening.onClose();
 obsidian.Notice=class{};
 const fm={icon:'rocket',other:'preserved'};
 view.app={fileManager:{processFrontMatter:async(file,fn)=>fn(fm)}};
 view.render=async()=>{};
 await view.setProjectIcon({file:{path:'test.md'},title:'test'},'FabGithub');
 assert.equal(fm.icon,'FabGithub');assert.equal(fm.other,'preserved');
 console.log('PASS: synthetic pack-shaped fixtures Fab484/Far163/Ra495, native Li preview, namespaced assignments, all SVG previews, sanitized malicious SVG, fresh pack discovery, full searchable results and canonical selection.');
})().catch(e=>{console.error(e);process.exitCode=1;});
