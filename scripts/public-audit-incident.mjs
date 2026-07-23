export const INCIDENT_TITLE='[監査障害] 境界夜話 公開サイト';
export const INCIDENT_LABEL='public-site-incident';
export const INCIDENT_MARKER='<!-- public-site-audit-incident -->';
export const LEGACY_INCIDENT_LABEL='site-monitoring';
export const LEGACY_INCIDENT_MARKER='<!-- kyokai-public-audit-incident -->';
export const LEGACY_INCIDENT_TITLE_PREFIX='[監視] 境界夜話 ';

const runUrl=context=>`${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}`;
const shaText=context=>String(context.sha||'').slice(0,12)||'不明';
const detectedAt=()=>new Date().toISOString();

async function ensureLabel(github,context){
  const {owner,repo}=context.repo;
  try{
    await github.rest.issues.getLabel({owner,repo,name:INCIDENT_LABEL});
  }catch(error){
    if(error?.status!==404)throw error;
    await github.rest.issues.createLabel({
      owner,
      repo,
      name:INCIDENT_LABEL,
      color:'B60205',
      description:'公開サイト自動監査で検出した未復旧障害',
    });
  }
}

const isCurrentIncident=issue=>issue.title===INCIDENT_TITLE&&String(issue.body||'').includes(INCIDENT_MARKER);
const isLegacyIncident=issue=>String(issue.title||'').startsWith(LEGACY_INCIDENT_TITLE_PREFIX)
  &&String(issue.title||'').endsWith(' 失敗')
  &&String(issue.body||'').includes(LEGACY_INCIDENT_MARKER);

async function findOpenIncidents(github,context){
  const {owner,repo}=context.repo;
  const {data}=await github.rest.issues.listForRepo({owner,repo,state:'open',per_page:100});
  const issues=data.filter(issue=>!issue.pull_request&&(isCurrentIncident(issue)||isLegacyIncident(issue)));
  return {
    current:issues.find(isCurrentIncident)||null,
    legacy:issues.filter(isLegacyIncident),
    all:issues,
  };
}

const failureBody=({context,readingOutcome,healthOutcome})=>[
  INCIDENT_MARKER,
  'GitHub Pages公開サイトの自動ブラウザー監査が失敗しました。',
  '',
  `- 検出日時: ${detectedAt()}`,
  `- 読書機能監査: ${readingOutcome}`,
  `- 54ページ品質監査: ${healthOutcome}`,
  `- 対象コミット: \`${shaText(context)}\``,
  `- 実行結果: ${runUrl(context)}`,
  '',
  'GitHub ActionsのartifactにHTMLレポート、trace、screenshot、videoが14日間保存されます。',
].join('\n');

const recoveryBody=context=>[
  '公開サイトの統合再監査が成功したため、自動的に復旧扱いとします。',
  '',
  `- 復旧確認日時: ${detectedAt()}`,
  `- 対象コミット: \`${shaText(context)}\``,
  `- 実行結果: ${runUrl(context)}`,
].join('\n');

async function closeIssue(github,context,issue,body){
  const {owner,repo}=context.repo;
  await github.rest.issues.createComment({owner,repo,issue_number:issue.number,body});
  await github.rest.issues.update({
    owner,
    repo,
    issue_number:issue.number,
    state:'closed',
    state_reason:'completed',
  });
}

async function closeLegacyDuplicates(github,context,legacy,currentNumber){
  for(const issue of legacy){
    await closeIssue(github,context,issue,[
      `統合監視Issue #${currentNumber}へ移行したため、この旧監視Issueをクローズします。`,
      '',
      `- 移行日時: ${detectedAt()}`,
      `- 統合監査: ${runUrl(context)}`,
    ].join('\n'));
  }
}

export async function managePublicAuditIncident({github,context,failed,readingOutcome='unknown',healthOutcome='unknown'}){
  await ensureLabel(github,context);
  const {owner,repo}=context.repo;
  const incidents=await findOpenIncidents(github,context);

  if(failed){
    const body=failureBody({context,readingOutcome,healthOutcome});
    if(incidents.current){
      await github.rest.issues.createComment({owner,repo,issue_number:incidents.current.number,body});
      if(incidents.legacy.length)await closeLegacyDuplicates(github,context,incidents.legacy,incidents.current.number);
      return {
        action:incidents.legacy.length?'commented-and-closed-legacy':'commented',
        issueNumber:incidents.current.number,
        closedLegacy:incidents.legacy.map(issue=>issue.number),
      };
    }

    if(incidents.legacy.length){
      const [primary,...duplicates]=incidents.legacy;
      const migratedBody=[
        INCIDENT_MARKER,
        '旧方式の監視Issueを、読書機能と54ページ品質監査をまとめた統合監視へ移行しました。',
        '',
        '## 旧Issueの記録',
        '',
        String(primary.body||''),
        '',
        '---',
        '',
        body,
      ].join('\n');
      await github.rest.issues.update({
        owner,
        repo,
        issue_number:primary.number,
        title:INCIDENT_TITLE,
        body:migratedBody,
        labels:[INCIDENT_LABEL],
      });
      if(duplicates.length)await closeLegacyDuplicates(github,context,duplicates,primary.number);
      return {action:'migrated',issueNumber:primary.number,closedLegacy:duplicates.map(issue=>issue.number)};
    }

    const {data}=await github.rest.issues.create({
      owner,
      repo,
      title:INCIDENT_TITLE,
      body,
      labels:[INCIDENT_LABEL],
    });
    return {action:'created',issueNumber:data.number,closedLegacy:[]};
  }

  if(!incidents.all.length)return {action:'none',issueNumber:null,issueNumbers:[]};
  for(const issue of incidents.all)await closeIssue(github,context,issue,recoveryBody(context));
  return {
    action:incidents.all.length===1?'closed':'closed-multiple',
    issueNumber:incidents.all[0].number,
    issueNumbers:incidents.all.map(issue=>issue.number),
  };
}
