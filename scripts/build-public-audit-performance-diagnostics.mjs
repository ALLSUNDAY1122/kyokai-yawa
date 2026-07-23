import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root=process.cwd();
const performancePath=path.join(root,'reports','public-audit-weekly-performance.json');
const outputPath=path.join(root,'reports','public-audit-performance-diagnostics.json');
const selfTest=process.argv.includes('--self-test');
const maxCommits=20;
const maxFiles=40;

const sources=[
  {key:'reading',label:'読書機能',file:'reports/reading-public-browser-audit.md'},
  {key:'health',label:'アクセシビリティ・実行時品質',file:'reports/site-public-health-audit.md'},
  {key:'offline',label:'オフライン・PWA',file:'reports/offline-public-browser-audit.md'},
];

const runGit=args=>execFileSync('git',args,{cwd:root,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const safeGit=args=>{try{return runGit(args);}catch{return '';}};
const lineValue=(text,label)=>text.match(new RegExp(`^- ${label}:\\s*(.+)$`,'m'))?.[1]?.trim()||'';
const numberValue=(text,label)=>Number.parseInt(lineValue(text,label),10)||0;
const durationValue=text=>Number.parseFloat(lineValue(text,'所要時間').replace('秒',''))||0;
const retryValue=text=>[...text.matchAll(/再試行(\d+)/g)].reduce((total,match)=>total+Number(match[1]||0),0);
const readSnapshot=(sha,file)=>safeGit(['show',`${sha}:${file}`]);
const testedCommit=reportCommit=>safeGit(['rev-parse',`${reportCommit}^`])||reportCommit;
const isMonitoringFile=file=>file.startsWith('reports/')||file.startsWith('.github/workflows/public-audit')||file.startsWith('scripts/build-public-audit')||file.startsWith('scripts/audit-public-audit')||file.startsWith('scripts/notify-public-audit');

const records=[];
for(const source of sources){
  const commits=safeGit(['log','--all','--format=%H','--',source.file]).split(/\r?\n/).filter(Boolean).slice(0,250);
  const seen=new Set();
  for(const reportCommit of commits){
    const text=readSnapshot(reportCommit,source.file);
    if(!text)continue;
    const timestamp=new Date(lineValue(text,'実行日時'));
    if(!Number.isFinite(timestamp.getTime()))continue;
    const dedupe=`${source.key}:${timestamp.toISOString()}`;
    if(seen.has(dedupe))continue;
    seen.add(dedupe);
    records.push({
      source:source.key,
      label:source.label,
      reportCommit,
      testedCommit:testedCommit(reportCommit),
      timestamp,
      status:lineValue(text,'テスト結果')||'unknown',
      failed:numberValue(text,'失敗'),
      duration:durationValue(text),
      retries:retryValue(text),
    });
  }
}
records.sort((a,b)=>a.timestamp-b.timestamp);
const grouped=new Map(sources.map(source=>[source.key,records.filter(record=>record.source===source.key)]));

const gitRange=(baseCommit,headCommit)=>{
  if(!baseCommit||!headCommit)return {commitCount:0,commits:[],commitsTruncated:false,fileCount:0,files:[],filesTruncated:false,siteFileCount:0,monitoringFileCount:0};
  const range=baseCommit===headCommit?headCommit:`${baseCommit}..${headCommit}`;
  const rawCommits=(baseCommit===headCommit?safeGit(['show','-s','--format=%H%x09%aI%x09%an%x09%s',headCommit]):safeGit(['log','--reverse','--format=%H%x09%aI%x09%an%x09%s',range]))
    .split(/\r?\n/).filter(Boolean);
  const commits=rawCommits.map(line=>{
    const [sha,date,author,...subject]=line.split('\t');
    return {sha,date,author,subject:subject.join('\t')};
  });
  const rawFiles=(baseCommit===headCommit?safeGit(['show','--format=','--name-status',headCommit]):safeGit(['diff','--name-status',baseCommit,headCommit]))
    .split(/\r?\n/).filter(Boolean);
  const files=rawFiles.map(line=>{
    const [status,...parts]=line.split('\t');
    const file=parts.at(-1)||'';
    return {status,file,monitoring:isMonitoringFile(file)};
  });
  return {
    commitCount:commits.length,
    commits:commits.slice(-maxCommits),
    commitsTruncated:commits.length>maxCommits,
    fileCount:files.length,
    files:files.slice(0,maxFiles),
    filesTruncated:files.length>maxFiles,
    siteFileCount:files.filter(item=>!item.monitoring).length,
    monitoringFileCount:files.filter(item=>item.monitoring).length,
  };
};

const createWindow=(kind,label,baseline,latest,extra={})=>({
  kind,
  label,
  source:latest?.source||'all',
  baseTimestamp:baseline?.timestamp?.toISOString()||null,
  headTimestamp:latest?.timestamp?.toISOString()||null,
  baseReportCommit:baseline?.reportCommit||null,
  headReportCommit:latest?.reportCommit||null,
  baseCommit:baseline?.testedCommit||null,
  headCommit:latest?.testedCommit||null,
  ...gitRange(baseline?.testedCommit,latest?.testedCommit),
  ...extra,
});

if(!fs.existsSync(performancePath))throw new Error('public-audit-weekly-performance.jsonがありません。先に週次集計を実行してください。');
const performance=JSON.parse(fs.readFileSync(performancePath,'utf8'));
if(performance.schema!=='kyokai-public-audit-performance-v1')throw new Error('性能判定JSONのschemaが不正です。');

const windows=[];
const durationTargets=selfTest?[performance.sources.find(source=>source.key==='reading')].filter(Boolean):performance.sources.filter(source=>source.durationDegraded);
for(const target of durationTargets){
  const items=grouped.get(target.key)||[];
  const latest=items.at(-1);
  if(!latest)continue;
  const threshold=Number(target.medianDuration||0)*Number(performance.thresholds.durationRatio||1.5);
  const baseline=[...items.slice(0,-1)].reverse().find(item=>item.status==='passed'&&item.failed===0&&item.duration>0&&item.duration<threshold)||items.at(-2)||items[0];
  if(!baseline)continue;
  windows.push(createWindow('duration',`${target.label}の所要時間`,baseline,latest,{
    latestDuration:Number(target.latestDuration||latest.duration||0),
    medianDuration:Number(target.medianDuration||0),
    durationRatio:Number(target.durationRatio||0),
  }));
}

if(!selfTest&&performance.totals?.retryDegraded){
  const retryRecords=records.filter(record=>record.retries>0);
  const firstRetry=retryRecords[0];
  const latest=records.at(-1);
  if(firstRetry&&latest){
    const firstIndex=records.indexOf(firstRetry);
    const baseline=[...records.slice(0,firstIndex)].reverse().find(item=>item.status==='passed'&&item.failed===0&&item.retries===0)||records[0];
    windows.push(createWindow('retry','全監査の再試行率',baseline,latest,{
      retryRate:Number(performance.totals.retryRate||0),
      retryRuns:Number(performance.totals.retryRuns||0),
      totalRuns:Number(performance.totals.runs||0),
    }));
  }
}

const diagnostics={
  schema:'kyokai-public-audit-performance-diagnostics-v1',
  generatedAt:new Date().toISOString(),
  performanceGeneratedAt:performance.generatedAt,
  breached:Boolean(performance.breached),
  selfTest,
  limits:{commits:maxCommits,files:maxFiles},
  totals:{
    windows:windows.length,
    commits:windows.reduce((sum,item)=>sum+item.commitCount,0),
    files:windows.reduce((sum,item)=>sum+item.fileCount,0),
    siteFiles:windows.reduce((sum,item)=>sum+item.siteFileCount,0),
    monitoringFiles:windows.reduce((sum,item)=>sum+item.monitoringFileCount,0),
  },
  windows,
};

if(selfTest){
  if(!windows.length)throw new Error('自己試験用の比較区間を生成できませんでした。');
  const sample=windows[0];
  if(!sample.baseCommit||!sample.headCommit)throw new Error('自己試験の比較コミットがありません。');
  if(!Number.isInteger(sample.commitCount)||!Number.isInteger(sample.fileCount))throw new Error('自己試験の差分件数が不正です。');
  console.log(JSON.stringify(diagnostics,null,2));
}else{
  fs.mkdirSync(path.dirname(outputPath),{recursive:true});
  fs.writeFileSync(outputPath,JSON.stringify(diagnostics,null,2)+'\n');
  console.log(JSON.stringify(diagnostics,null,2));
}
