#!/usr/bin/env node
'use strict';
// Creates a local DEV draft with real links. It never publishes or sends anything.
const fs=require('node:fs'),path=require('node:path');
const [repo,demo]=process.argv.slice(2);
if(!repo||!demo){console.error('Usage: node tools/prepare-submission.cjs https://github.com/OWNER/NEW_REPO https://PUBLIC_DEMO_URL');process.exit(1);}
const r=new URL(repo),d=new URL(demo);
if(r.protocol!=='https:'||r.hostname!=='github.com'||!/^\/[\w.-]+\/[\w.-]+\/?$/.test(r.pathname)||r.search||r.hash||r.username||r.password)throw Error('Use the new public GitHub repository URL');
if(d.protocol!=='https:'||['localhost','127.0.0.1'].includes(d.hostname)||d.username||d.password)throw Error('Use a public HTTPS demo/video URL');
if(r.pathname.toLowerCase()==='/mobileaidev/ai-app-bridge')throw Error('The existing Bridge repo is not this new entry');
const file=path.resolve(__dirname,'../submission/DEV-post.md');
let text=fs.readFileSync(file,'utf8')
 .replace('**PUBLIC_DEMO_URL_REQUIRED — replace before publishing.**',`[Watch the demonstration](${d.href})`)
 .replace('**PUBLIC_REPOSITORY_URL_REQUIRED — replace with the newly created SlothQA repository.**',`[Source code](${r.href})`);
const out=path.join(path.dirname(file),'DEV-ready-draft.md');fs.writeFileSync(out,text);
fs.writeFileSync(path.join(path.dirname(file),'DEV-prefill-url.txt'),'https://dev.to/new?prefill='+encodeURIComponent(text)+'\n');
console.log('Local draft prepared. Check that both links are public and readable, then publish once through the official template entry. No remote submission was made.');
