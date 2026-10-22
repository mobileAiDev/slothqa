#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const {createAgent, validConfig} = require('../src/policy.cjs');
const {createSimulator} = require('../src/simulator.cjs');
const {writeReport} = require('../src/report.cjs');

function args(argv) {
  const o = {command: argv[0] || 'help'};
  for (let i=1;i<argv.length;i+=2) {
    if (!argv[i].startsWith('--') || argv[i+1] === undefined) throw Error('flags require values');
    o[argv[i].slice(2)] = argv[i+1];
  }
  return o;
}
function bridge(executable, command, values) {
  const a = [command, '--extract', 'null'];
  for (const [k,v] of Object.entries(values)) a.push('--'+k.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()), typeof v === 'object' ? JSON.stringify(v) : String(v));
  const r = spawnSync(executable, a, {encoding: 'utf8', timeout: 360000, maxBuffer: 8*1024*1024, shell: false});
  if (r.error) throw r.error;
  let data; try { data = JSON.parse(r.stdout); } catch { throw Error('Bridge returned non-JSON; inspect your local CLI installation'); }
  return {exitCode: r.status, reply: data};
}
async function main(o) {
  if (o.command === 'help') {console.log('SlothQA: simulate | android | report | doctor\nFlags: --mission PATH --out DIR --endpoint URL --model NAME\nAndroid: --serial SERIAL --package PACKAGE --bridge PATH\nSimulator: --scenario normal|changed|broken-save\nReport: --trace PATH --out FILE');return;}
  if (o.command === 'doctor') {
    const r = spawnSync(o.bridge || 'ai-app-bridge', ['--version'], {encoding:'utf8',timeout:10000,shell:false});
    console.log(JSON.stringify({node:process.version,bridge:r.error?'unavailable':r.stdout.trim(),nativeSdkRequired:true,deviceConnection:'not checked'},null,2));return;
  }
  if (o.command === 'report') {console.log(writeReport(o.trace, o.out || 'report.html'));return;}
  if (!['simulate','android'].includes(o.command)) throw Error('unknown command');
  const c = JSON.parse(fs.readFileSync(o.mission || path.join(__dirname,'../missions/create-task.json'),'utf8'));
  if (o.endpoint) c.endpoint=o.endpoint;
  if (o.model) c.model=o.model;
  validConfig(c);
  const dir = path.resolve(o.out || path.join('runs',new Date().toISOString().replace(/[:.]/g,'-')));
  fs.mkdirSync(dir,{recursive:true,mode:0o700});
  c.traceFile=path.join(dir,'trace.jsonl');
  if(fs.existsSync(c.traceFile)) throw Error('Output already contains a trace; use a new directory');
  const scenario=o.scenario||'normal';
  fs.writeFileSync(c.traceFile,JSON.stringify({type:'run',time:new Date().toISOString(),mode:o.command==='simulate'?'simulator':'android',scenario,goal:c.goal,model:c.model})+'\n',{mode:0o600});
  if(o.command==='simulate') {
    const app=createSimulator(scenario), agent=createAgent(c);let lastAction=null;
    if(o['bridge-package']) {
      const {runBridgeSimulator}=require('../src/bridge-simulator.cjs');
      const r=await runBridgeSimulator(o['bridge-package'],app,agent,c);
      fs.writeFileSync(path.join(dir,'bridge-result.json'),JSON.stringify(r,null,2));
    } else for(let revision=1;revision<=c.maxSteps+2;revision++) {
      const d=await agent.decide({revision,summary:app.snapshot(revision),evidenceId:'sim:'+revision,lastAction});
      if(d.agentDecision!=='act') break;
      lastAction=app.apply(d.action);
    }
  } else {
    if(!o.serial || !o.package) throw Error('Android requires explicit --serial and --package');
    if(!c.allowedSelectors?.length) throw Error('Android requires allowedSelectors scoped to this test app');
    const configFile=path.join(dir,'mission.json'); fs.writeFileSync(configFile,JSON.stringify(c,null,2),{mode:0o600});
    const moduleFile=path.join(dir,'agent.cjs');
    fs.writeFileSync(moduleFile,`const {createAgent}=require(${JSON.stringify(path.resolve(__dirname,'../src/policy.cjs'))});\nconst agent=createAgent(require(${JSON.stringify(configFile)}));\nexports.decide=input=>agent.decide(input);\n`,{mode:0o600});
    const target={platform:'android',serial:o.serial,packageName:o.package};
    const started=bridge(o.bridge||'ai-app-bridge','intent',{operation:'start',mode:'autonomous',agentModule:moduleFile,goal:c.goal,target,provider:'native',background:false,budget:{maxSteps:c.maxSteps+1,maxAgentCalls:c.maxSteps+2,maxDurationMs:300000,allowlist:['tap','inputText']}});
    fs.writeFileSync(path.join(dir,'bridge-result.json'),JSON.stringify(started,null,2),{mode:0o600});
    console.log('Bridge receipt saved. Do not restart an unfinished run; resume/cancel its operationId.');
  }
  const report=writeReport(c.traceFile,path.join(dir,'report.html'));
  console.log(JSON.stringify(report,null,2));
  if(report.verdict!=='complete') process.exitCode=2;
}
if(require.main===module) main(args(process.argv.slice(2))).catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={args,bridge};
