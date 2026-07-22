import { test, expect } from '@playwright/test';

const SCOPE_PATH='/kyokai-yawa/';
const VISITED_STORY='stories/mkb-001-taikin-kiroku-2514.html';
const UNVISITED_STORY='stories/krs-012-suijinsai-no-kessekisha.html';

async function ensureServiceWorker(page){
  await page.goto(`?pwa-audit=${Date.now()}`,{waitUntil:'load'});
  await expect.poll(()=>page.evaluate(()=>'serviceWorker' in navigator),{timeout:10_000}).toBe(true);
  const scope=await page.evaluate(async()=>(await navigator.serviceWorker.ready).scope);
  if(!await page.evaluate(()=>Boolean(navigator.serviceWorker.controller))){
    await page.reload({waitUntil:'load'});
  }
  await expect.poll(()=>page.evaluate(()=>Boolean(navigator.serviceWorker.controller)),{timeout:15_000}).toBe(true);
  expect(new URL(scope).pathname).toBe(SCOPE_PATH);
}

async function cacheHas(page,path){
  return page.evaluate(async path=>Boolean(await caches.match(new URL(path,location.origin).href)),path);
}

async function cachedText(page,path){
  return page.evaluate(async path=>{
    const response=await caches.match(new URL(path,location.origin).href);
    return response?response.text():null;
  },path);
}

async function withOffline(context,callback){
  await context.setOffline(true);
  try{return await callback();}
  finally{await context.setOffline(false);}
}

test('Service Workerが登録され、PWA共通資産を事前保存する',async({page})=>{
  await ensureServiceWorker(page);
  const cacheState=await page.evaluate(async()=>({
    keys:await caches.keys(),
    offline:Boolean(await caches.match('/kyokai-yawa/offline.html')),
    readingLog:Boolean(await caches.match('/kyokai-yawa/reading-log.html')),
    works:Boolean(await caches.match('/kyokai-yawa/data/works.js')),
    contrast:Boolean(await caches.match('/kyokai-yawa/data/accessibility-contrast.css')),
  }));
  expect(cacheState.keys.some(key=>/^kyokai-yawa-v\d+-static$/.test(key))).toBe(true);
  expect(cacheState.offline).toBe(true);
  expect(cacheState.readingLog).toBe(true);
  expect(cacheState.works).toBe(true);
  expect(cacheState.contrast).toBe(true);
});

test('manifestとアプリアイコンが公開されている',async({page})=>{
  await page.goto('',{waitUntil:'domcontentloaded'});
  const manifestUrl=new URL('manifest.webmanifest',page.url()).href;
  const iconUrl=new URL('assets/app-icon-192.png',page.url()).href;
  const manifestResponse=await page.request.get(manifestUrl);
  expect(manifestResponse.ok()).toBe(true);
  const manifest=await manifestResponse.json();
  expect(manifest.name).toContain('境界夜話');
  expect(manifest.start_url).toBe('/kyokai-yawa/');
  expect(manifest.display).toMatch(/standalone|minimal-ui/);
  expect(Array.isArray(manifest.icons)&&manifest.icons.length>=2).toBe(true);
  const iconResponse=await page.request.get(iconUrl);
  expect(iconResponse.ok()).toBe(true);
  expect(iconResponse.headers()['content-type']||'').toContain('image/png');
});

test('一度開いた作品を通信遮断後も本文付きで再読できる',async({page,context},testInfo)=>{
  await ensureServiceWorker(page);
  await page.goto(VISITED_STORY,{waitUntil:'load'});
  await expect(page.locator('article#story')).toBeVisible();
  await expect(page.locator('article#story p').first()).toBeVisible();
  const storyPath=locationPath(page.url());
  await expect.poll(()=>cacheHas(page,storyPath),{timeout:10_000}).toBe(true);
  if(testInfo.project.name==='webkit-mobile'){
    const html=await cachedText(page,storyPath);
    expect(html).toContain('<article id="story"');
    expect(html).toContain('退勤記録 25:14');
    return;
  }
  await withOffline(context,async()=>{
    await page.reload({waitUntil:'domcontentloaded'});
    await expect(page.locator('article#story')).toBeVisible();
    await expect(page.locator('article#story p')).not.toHaveCount(0);
    await expect(page.locator('h1')).not.toHaveText('通信できません');
  });
});

test('未保存の作品は通信遮断時にオフライン案内を表示する',async({page,context},testInfo)=>{
  await ensureServiceWorker(page);
  const probe=`${UNVISITED_STORY}?offline-probe=${Date.now()}`;
  const probePath=locationPath(new URL(probe,page.url()).href);
  expect(await cacheHas(page,probePath)).toBe(false);
  if(testInfo.project.name==='webkit-mobile'){
    const fallback=await cachedText(page,'/kyokai-yawa/offline.html');
    expect(fallback).toContain('<h1>通信できません</h1>');
    expect(fallback).toContain('以前に開いた作品');
    return;
  }
  await withOffline(context,async()=>{
    await page.goto(probe,{waitUntil:'domcontentloaded'});
    await expect(page.locator('h1')).toHaveText('通信できません');
    await expect(page.locator('main')).toContainText('以前に開いた作品');
    await expect(page.locator('a[href="/kyokai-yawa/"]')).toBeVisible();
  });
});

test('読書記録ページを未訪問でもオフラインで開ける',async({page,context},testInfo)=>{
  await ensureServiceWorker(page);
  expect(await cacheHas(page,'/kyokai-yawa/reading-log.html')).toBe(true);
  if(testInfo.project.name==='webkit-mobile'){
    const state=await page.evaluate(async()=>{
      const paths=['/kyokai-yawa/reading-log.html','/kyokai-yawa/data/works.js','/kyokai-yawa/data/reading-status.js','/kyokai-yawa/data/saved-stories.js','/kyokai-yawa/data/reading-log.js','/kyokai-yawa/data/reading-backup.js'];
      const found={};
      for(const path of paths){
        const response=await caches.match(path);
        found[path]=Boolean(response);
      }
      const html=await (await caches.match('/kyokai-yawa/reading-log.html')).text();
      return {found,html};
    });
    expect(Object.values(state.found).every(Boolean)).toBe(true);
    expect(state.html).toContain('id="reading-log-title">読書記録');
    expect(state.html).toContain('data-backup-export');
    return;
  }
  await withOffline(context,async()=>{
    await page.goto('reading-log.html',{waitUntil:'domcontentloaded'});
    await expect(page.locator('#reading-log-title')).toHaveText('読書記録');
    await expect(page.locator('[data-reading-log-grid] .log-card')).toHaveCount(48);
    await expect(page.locator('[data-backup-export]')).toBeVisible();
  });
});

function locationPath(url){
  const parsed=new URL(url);
  return `${parsed.pathname}${parsed.search}`;
}
