'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {createAgent}=require('../src/policy.cjs');
const {createSimulator}=require('../src/simulator.cjs');
const mission=require('../missions/create-task.json');
const pkg=process.env.AAB_PACKAGE_ROOT;
test('real Bridge Intent lifecycle accepts SlothQA decisions (simulated device, mocked model)',{skip:!pkg},async()=>{
 const {handle,resetIntentOperations}=require(path.resolve(pkg,'bin/intent/intent-entry.js'));
 resetIntentOperations();const sim=createSimulator();let rev=0;
 const scripted=[{candidateId:'c0',reason:'new'},{candidateId:'c0v0',reason:'title'},{candidateId:'c1',reason:'save'}];
 const agent=createAgent(mission,{infer:async()=>({parsed:scripted.shift(),latencyMs:0,model:'test-double'})});
 const adapter={observe:async()=>({ok:true,provider:'native',rawTreeId:'sim',rawTree:rawTree(sim.snapshot(++rev))}),action:async({spec})=>sim.apply(spec)};
 const r=await handle({operation:'start',operationId:'slothqa-contract',goal:mission.goal,target:{platform:'android',serial:'SIMULATOR-NOT-A-DEVICE',packageName:'io.slothqa.demo'},provider:'native',adapter,mode:'autonomous',decide:agent.decide,budget:{maxSteps:10,maxAgentCalls:12,maxDurationMs:30000}});
 assert.equal(r.status,'completed',JSON.stringify(r));assert.equal(rev,4);
});
const {rawTree}=require('../src/bridge-simulator.cjs');
