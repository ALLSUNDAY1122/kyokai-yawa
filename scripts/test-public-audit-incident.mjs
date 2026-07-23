import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  INCIDENT_LABEL,
  INCIDENT_MARKER,
  INCIDENT_TITLE,
  managePublicAuditIncident,
} from './public-audit-incident.mjs';

const makeContext=()=>({
  serverUrl:'https://github.com',
  runId:123456,
  sha:'0123456789abcdef',
  repo:{owner:'ALLSUNDAY1122',repo:'kyokai-yawa'},
});

const makeMock=({labelExists=false,issues=[]}={})=>{
  const state={labelExists,issues:structuredClone(issues),comments:[],createdLabels:[],updates:[]};
  const github={rest:{issues:{
    async getLabel(){if(!state.labelExists){const error=new Error('Not Found');error.status=404;throw error;}return {data:{name:INCIDENT_LABEL}};},
    async createLabel(args){state.labelExists=true;state.createdLabels.push(args);return {data:args};},
    async listForRepo(){return {data:state.issues.filter(issue=>issue.state==='open')};},
    async create(args){const issue={number:state.issues.length+1,state:'open',...args};state.issues.push(issue);return {data:issue};},
    async createComment(args){state.comments.push(args);return {data:args};},
    async update(args){state.updates.push(args);const issue=state.issues.find(item=>item.number===args.issue_number);if(issue)Object.assign(issue,args);return {data:issue};},
  }}};
  return {github,state};
};

const context=makeContext();

{
  const {github,state}=makeMock();
  const result=await managePublicAuditIncident({github,context,failed:true,readingOutcome:'failure',healthOutcome:'success'});
  assert.equal(result.action,'created');
  assert.equal(state.createdLabels.length,1);
  assert.equal(state.issues.length,1);
  assert.equal(state.issues[0].title,INCIDENT_TITLE);
  assert.ok(state.issues[0].body.includes(INCIDENT_MARKER));
  assert.ok(state.issues[0].body.includes('読書機能監査: failure'));
}

{
  const openIssue={number:7,state:'open',title:INCIDENT_TITLE,body:`${INCIDENT_MARKER}\n既存障害`};
  const {github,state}=makeMock({labelExists:true,issues:[openIssue]});
  const result=await managePublicAuditIncident({github,context,failed:true,readingOutcome:'failure',healthOutcome:'failure'});
  assert.equal(result.action,'commented');
  assert.equal(state.issues.length,1);
  assert.equal(state.comments.length,1);
  assert.equal(state.comments[0].issue_number,7);
}

{
  const openIssue={number:8,state:'open',title:INCIDENT_TITLE,body:`${INCIDENT_MARKER}\n未復旧`};
  const {github,state}=makeMock({labelExists:true,issues:[openIssue]});
  const result=await managePublicAuditIncident({github,context,failed:false,readingOutcome:'success',healthOutcome:'success'});
  assert.equal(result.action,'closed');
  assert.equal(state.comments.length,1);
  assert.equal(state.updates.length,1);
  assert.equal(state.updates[0].state,'closed');
  assert.equal(state.updates[0].state_reason,'completed');
}

{
  const {github,state}=makeMock({labelExists:true});
  const result=await managePublicAuditIncident({github,context,failed:false,readingOutcome:'success',healthOutcome:'success'});
  assert.equal(result.action,'none');
  assert.equal(state.comments.length,0);
  assert.equal(state.updates.length,0);
}

const report=[
  '# 境界夜話 公開監査障害Issue通知 監査',
  '',
  '- 監査失敗時: 固定タイトルのIssueを新規作成',
  '- 連続失敗時: 既存の未解決Issueへ追記',
  '- 復旧時: 成功実行URLを追記して自動クローズ',
  '- 重複防止: タイトル・専用ラベル・本文マーカーで識別',
  '- ラベル未作成時: 自動作成',
  '- 実行結果: 4/4ケース成功',
  '- エラー: 0',
  '- 警告: 0',
  '',
  '## ケース',
  '',
  '- 初回失敗でIssue作成',
  '- 連続失敗で既存Issueへコメント',
  '- 成功時に未解決Issueをクローズ',
  '- 障害がない成功時は変更なし',
  '',
].join('\n');
fs.mkdirSync(path.join(process.cwd(),'reports'),{recursive:true});
fs.writeFileSync(path.join(process.cwd(),'reports','public-audit-incident-audit.md'),report);
console.log(report);
