const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),YAML=require('yaml');
class El {
 constructor(o={}){Object.assign(this,{children:[],style:{},attrs:{},events:{}},o);}
 empty(){this.children=[];}setText(text){this.text=text;}setAttr(k,v){this.attrs[k]=v;}addClass(){}
 createEl(tag,o={}){const el=new El({...o,tag});this.children.push(el);return el;}createDiv(o){return this.createEl('div',o);}
 addEventListener(k,f){this.events[k]=f;}
}
const obsidian={parseYaml:YAML.parse,Modal:class{constructor(app){this.app=app;this.contentEl=new El();}close(){this.onClose();}},Plugin:class{},PluginSettingTab:class{},ItemView:class{}};
const context=vm.createContext({require:()=>obsidian,module:{exports:{}},console,Map,Set,Date,Intl,queueMicrotask});
vm.runInContext(fs.readFileSync('dist/project-milestone-gpt-tracker/main.js','utf8')+'\nglobalThis.api={parseAsanaExport,writeApprovedAsana,asanaMilestoneNote,AsanaImportModal,loadData,DEFAULT_SETTINGS};',context);
const {parseAsanaExport:parse,writeApprovedAsana:write,AsanaImportModal,loadData,DEFAULT_SETTINGS}=context.api;
const fixture=[{gid:'12345678901234567890',name:'Task: "quoted" / test',notes:'<script>alert(1)</script>\n```\n![[embed]]\n---',due_on:'2026-10-30',completed:false,assignee:{name:'Alex'},permalink_url:'https://app.asana.com/1/2/task/12345678901234567890',subtasks:[{id:12,name:'Subtask',completed:true,due_at:'2026-11-01T20:00:00Z'}]},{gid:'13',name:'Another',completed:false},{gid:'14',name:'Fail me',completed:false}];
function vault(){
 const notes=new Map(),folders=new Set(['Milestones']),calls=[];let fail=true;
 const file=path=>({path,basename:path.split('/').pop().slice(0,-3),parent:{path:path.split('/').slice(0,-1).join('/')}});
 const app={vault:{adapter:{exists:async p=>notes.has(p)||folders.has(p)},getMarkdownFiles:()=>[...notes.keys()].map(file),read:async f=>notes.get(f.path),createFolder:async p=>{calls.push(['folder',p]);folders.add(p);},create:async(p,text)=>{calls.push(['create',p]);if(fail&&p.includes('Asana 14 '))throw Error('Simulated write failure');if(notes.has(p))throw Error('exists');notes.set(p,text);return file(p);}},metadataCache:{getFileCache:()=>({})},workspace:{getLeavesOfType:()=>[]}};
 return {app,notes,calls,setFail:v=>fail=v};
}
(async()=>{
 for(const wrapped of [fixture,{data:fixture},{tasks:fixture},{data:{tasks:fixture}}])assert.equal(parse(JSON.stringify(wrapped)).length,4);
 for(const bad of ['bad','{}','{"data":{}}','[]','{"data":[]}'])assert.throws(()=>parse(bad));
 const invalid=parse(JSON.stringify([{name:'No ID'},{gid:'1',name:''},{gid:'2',name:'Bad date',due_on:'2026-02-30'},{gid:'3',name:'Bad flag',completed:'false'},{id:9007199254740992,name:'Unsafe ID'},{gid:'5',name:'first'},{gid:'5',name:'duplicate'},{gid:'6',name:'section',resource_type:'section'}]));
 assert.equal(invalid.filter(r=>r.error).length,7);
 const v=vault(),settings={...DEFAULT_SETTINGS};const before=JSON.stringify(settings);
 const rows=parse(JSON.stringify({data:fixture}));assert.equal(v.calls.length,0);assert.equal(rows[1].completed,true);assert.equal(rows[1].due,'2026-11-01');
 rows[0].decision='approved';rows[1].decision='approved';rows[2].decision='denied';rows[3].decision='approved';
 let result=await write(v.app,settings,rows,'Project "A"','in-progress');assert.equal(result.imported,2);assert.equal(result.failed,1);assert.equal(v.notes.size,2);
 const first=[...v.notes.values()][0],fm=YAML.parse(first.split('---')[1]);assert.equal(fm.project,'Project "A"');assert.equal(fm.asana_gid,'12345678901234567890');assert.equal(fm.owner,'Alex');assert.equal(fm.status,'in-progress');assert.equal(fm.title,fixture[0].name);assert.ok(first.includes('````text'));assert.ok(first.includes(fixture[0].notes));
 const fms=[...v.notes.values()].map(s=>YAML.parse(s.split('---')[1]));assert.ok(fms.some(f=>f.status==='done'));
 // Preserve local changes and detect IDs from disk even with a stale metadata cache.
 const path=[...v.notes.keys()][0];v.notes.set(path,first+'LOCAL EDIT\n');v.setFail(false);
 const again=parse(JSON.stringify(fixture));again.forEach(r=>r.decision='approved');result=await write(v.app,settings,again,'Different Project','blocked');assert.equal(result.duplicate,2);assert.equal(result.imported,2);assert.ok(v.notes.get(path).endsWith('LOCAL EDIT\n'));assert.equal(v.notes.size,4);
 const all=parse(JSON.stringify(fixture));all.forEach(r=>r.decision='approved');result=await write(v.app,settings,all,'','upcoming');assert.equal(result.duplicate,4);assert.equal(v.notes.size,4);
 const none=parse(JSON.stringify(fixture));const calls=v.calls.length;await write(v.app,settings,none,'','upcoming');assert.equal(v.calls.length,calls);assert.equal(JSON.stringify(settings),before);
 assert.ok(parse(JSON.stringify([{gid:'9',name:'bad',due_on:'2026-10-30garbage'}]))[0].error);
 assert.throws(()=>parse(' '.repeat(10*1024*1024+1)),/10 MB/);
 assert.throws(()=>parse(JSON.stringify(Array.from({length:10001},(_,i)=>({gid:String(i+1),name:'Task'})))),/10,000/);
 const collision=vault(),collisionRows=parse(JSON.stringify([{gid:'99',name:'Collision'}]));collisionRows[0].decision='approved';
 collision.notes.set('Milestones/Asana 99 - Collision.md','Existing local note without an Asana ID');
 const collisionResult=await write(collision.app,settings,collisionRows,'','upcoming');assert.equal(collisionResult.failed,1);assert.equal([...collision.notes.values()][0],'Existing local note without an Asana ID');
 // Cancel/review/approval cause no writes; only final confirmation writes.
 const ui=vault(),plugin={app:ui.app,settings,iconizeByPath:new Map()};const modal=new AsanaImportModal(plugin);modal.onOpen();assert.ok(modal.confirm.disabled);
 modal.rows=parse(JSON.stringify(fixture));modal.review();assert.equal(ui.calls.length,0);
 const find=(el,text)=>el.children.flatMap(c=>[...(c.text===text?[c]:[]),...find(c,text)]);
 find(modal.contentEl,'Approve all eligible')[0].events.click();assert.ok(modal.rows.every(r=>r.decision==='approved'));assert.equal(ui.calls.length,0);
 find(modal.contentEl,'Deny all')[0].events.click();assert.ok(modal.rows.every(r=>r.decision==='denied'));assert.ok(modal.confirm.disabled);assert.equal(ui.calls.length,0);
 const card=modal.list.children[0];card.children.find(e=>e.tag==='button'&&e.text==='Approve').events.click();assert.equal(modal.rows[0].decision,'approved');assert.equal(ui.calls.length,0);assert.equal(modal.confirm.disabled,false);
 modal.close();assert.equal(ui.calls.length,0);
 const confirmed=new AsanaImportModal(plugin);confirmed.onOpen();confirmed.rows=parse(JSON.stringify(fixture));confirmed.rows[0].decision='approved';confirmed.review();await confirmed.confirmImport();assert.equal(ui.notes.size,1);assert.match(confirmed.message.text,/Imported 1/);await confirmed.confirmImport();assert.equal(ui.notes.size,1);
 // Reload the created notes into the existing milestone schema.
 ui.app.metadataCache.getFileCache=f=>({frontmatter:YAML.parse(ui.notes.get(f.path).split('---')[1])});
 const loaded=loadData(ui.app,settings,new Map());assert.equal(loaded.milestones.length,1);assert.equal(loaded.milestones[0].title,fixture[0].name);assert.equal(loaded.milestones[0].due,'2026-10-30');
 console.log('PASS: Asana task wrappers/subtasks, IDs, dates/status/owner/text, malformed inputs, pending/deny/cancel with zero writes, final confirmation, partial failures, retries/reimports with stale cache, local edits protected, milestone reload, unchanged settings.');
})().catch(e=>{console.error(e);process.exitCode=1;});
