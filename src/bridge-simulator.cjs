'use strict';
const path=require('node:path');
function rawTree(summary){return {truncated:false,root:{className:'android.widget.LinearLayout',visible:true,effectiveVisible:true,enabled:true,children:summary.nodes.map(n=>({...n,className:n.role==='input'?'android.widget.EditText':n.role==='button'?'android.widget.Button':'android.widget.TextView',contentDescription:n.label,bounds:{left:0,top:0,right:200,bottom:50}}))}};}
async function runBridgeSimulator(pkg,sim,agent,config) {
 const version=require(path.resolve(pkg,'package.json')).version;
 if(version!=='0.4.19')throw Error('Internal simulator integration is pinned to Bridge 0.4.19');
 const {handle}=require(path.resolve(pkg,'bin/intent/intent-entry.js'));
 let revision=0;
 return handle({operation:'start',goal:config.goal,target:{platform:'android',serial:'SIMULATOR-NOT-A-DEVICE',packageName:'io.slothqa.demo'},provider:'native',mode:'autonomous',decide:agent.decide,
   adapter:{observe:async()=>({ok:true,provider:'native',rawTreeId:'sim:'+ ++revision,rawTree:rawTree(sim.snapshot(revision))}),action:async({spec})=>sim.apply(spec)},
   budget:{maxSteps:config.maxSteps+1,maxAgentCalls:config.maxSteps+2,maxDurationMs:300000,allowlist:['tap','inputText']}});
}
module.exports={rawTree,runBridgeSimulator};
