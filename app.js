const playerDefaults = ["プレイヤー1", "プレイヤー2", "プレイヤー3", "プレイヤー4"];
const storageKey = "fiveMinutePartyPlayers";

const gameDefs = [
  { id: "fake-word", icon: "偽", title: "ニセモノワード", genre: "会話", min: 3, max: 4, minutes: "3分", description: "1人だけ違うお題を持つ。全員が一言ずつヒントを出して、最後にニセモノを投票で当てる。" },
  { id: "werewolf", icon: "狼", title: "ワンナイト人狼ミニ", genre: "正体隠匿", min: 3, max: 4, minutes: "5分", description: "人狼を1回の議論と投票で見つける。占い師は議論前に1人だけ役職を確認できる。" },
  { id: "bomb", icon: "爆", title: "爆弾解除チーム", genre: "協力パズル", min: 2, max: 4, minutes: "3分", description: "線と記号から3桁コードを作る。チームで相談して時間内に解除する。" },
  { id: "detective", icon: "推", title: "犯人はこの中にいる", genre: "推理", min: 2, max: 4, minutes: "4分", description: "容疑者表と証言カードから犯人を1人に絞る。相談して指名したら即判定。" },
  { id: "chicken", icon: "100", title: "チキンレース100", genre: "心理戦", min: 2, max: 4, minutes: "3分", description: "3回だけ数字を足す。100に近いほど強いが、100を超えたら脱落。" },
  { id: "drawing", icon: "描", title: "10秒お絵描き当て", genre: "お絵描き", min: 2, max: 4, minutes: "3分", description: "出題者は10秒だけ絵を描ける。他の人が当てたら出題者に1点。" },
  { id: "gesture", icon: "動", title: "ジェスチャー早当て", genre: "アクション", min: 2, max: 4, minutes: "3分", description: "演者は声なしでお題を表現する。60秒で何問当ててもらえるかを競う。" },
  { id: "memory", icon: "記", title: "記憶泥棒", genre: "記憶", min: 2, max: 4, minutes: "3分", description: "一瞬だけ並ぶアイテムを覚える。消えた1つを選んで正解数を伸ばす。" },
  { id: "reverse-quiz", icon: "逆", title: "逆張りクイズ", genre: "クイズ", min: 2, max: 4, minutes: "5分", description: "正解を狙いつつ、同じ答えの人が少ないほどボーナスが入る。" },
  { id: "auction", icon: "競", title: "王様オークション", genre: "駆け引き", min: 2, max: 4, minutes: "5分", description: "限られたコインで得点アイテムを競り落とす。同額の最高入札は全員キャンセル。" },
];

const fakeWordPairs = [
  ["ラーメン", "うどん"],
  ["映画館", "カラオケ"],
  ["キャンプ", "花火大会"],
  ["焼肉", "寿司"],
  ["温泉", "プール"],
  ["コンビニ", "スーパー"],
  ["サッカー", "バスケットボール"],
  ["遊園地", "水族館"],
  ["コーヒー", "紅茶"],
  ["新幹線", "飛行機"],
  ["カレー", "ハンバーグ"],
  ["図書館", "美術館"],
];

const drawingPrompts = [
  "ロケット", "ピザ", "富士山", "傘", "宝箱", "自転車", "掃除機", "王冠", "ギター", "観覧車", "目覚まし時計", "雪だるま",
];

const gesturePrompts = [
  "寿司職人", "忍者", "バスの運転手", "魔法使い", "ロック歌手", "野球の審判", "料理番組", "空港の案内係", "サーフィン", "迷子の観光客",
  "歯医者", "エレベーターが止まった人", "写真家", "重量挙げ", "ニュースキャスター",
];

const memoryItems = [
  { label: "鍵", symbol: "◇" },
  { label: "時計", symbol: "○" },
  { label: "本", symbol: "□" },
  { label: "王冠", symbol: "♔" },
  { label: "封筒", symbol: "▱" },
  { label: "コイン", symbol: "◎" },
  { label: "傘", symbol: "⌂" },
  { label: "星", symbol: "☆" },
  { label: "マイク", symbol: "♪" },
  { label: "カップ", symbol: "∪" },
  { label: "旗", symbol: "⚑" },
  { label: "磁石", symbol: "∩" },
  { label: "電球", symbol: "◌" },
  { label: "宝石", symbol: "◆" },
  { label: "地図", symbol: "▣" },
  { label: "ベル", symbol: "♢" },
];

const quizQuestions = [
  { q: "日本で一番高い山は？", options: ["富士山", "北岳", "槍ヶ岳", "阿蘇山"], answer: 0 },
  { q: "将棋の盤面は何マス？", options: ["64", "81", "90", "100"], answer: 1 },
  { q: "1ダースは何個？", options: ["10", "12", "15", "24"], answer: 1 },
  { q: "水の化学式は？", options: ["CO2", "H2O", "NaCl", "O2"], answer: 1 },
  { q: "オリンピックの輪はいくつ？", options: ["4", "5", "6", "7"], answer: 1 },
  { q: "チェスのクイーンが進める方向は？", options: ["斜めのみ", "縦横斜め", "前のみ", "L字"], answer: 1 },
  { q: "太陽系で一番大きい惑星は？", options: ["地球", "火星", "木星", "金星"], answer: 2 },
];

const auctionItems = [
  { name: "王冠", value: 8 },
  { name: "宝石", value: 7 },
  { name: "城の鍵", value: 6 },
  { name: "金の杯", value: 5 },
  { name: "古い地図", value: 4 },
  { name: "銀の指輪", value: 3 },
  { name: "勝利の旗", value: 5 },
  { name: "秘密の契約書", value: 6 },
];

const app = {
  players: 4,
  names: loadNames(),
  selected: "fake-word",
  states: {},
  timers: [],
};

const gameSections = [
  {
    label: "口火の屋台",
    note: "会話と正体隠しで、まず場をあたためる",
    games: ["fake-word", "werewolf", "detective", "reverse-quiz", "auction"],
  },
  {
    label: "勝負の射的場",
    note: "手先、記憶、度胸で一気に盛り上げる",
    games: ["bomb", "chicken", "drawing", "gesture", "memory"],
  },
];

const gameRoot = document.querySelector("#game-root");
const gameList = document.querySelector("#game-list");
const playerCount = document.querySelector("#player-count");
const playerNames = document.querySelector("#player-names");
const selectedPlayerCount = document.querySelector("#selected-player-count");
const resetGame = document.querySelector("#reset-game");

function loadNames() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (Array.isArray(stored)) {
      return playerDefaults.map((fallback, index) => stored[index] || fallback);
    }
  } catch {
    return [...playerDefaults];
  }
  return [...playerDefaults];
}

function saveNames() {
  localStorage.setItem(storageKey, JSON.stringify(app.names));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function activeNames() {
  return app.names.slice(0, app.players).map((name, index) => {
    const clean = String(name || "").trim();
    return clean || playerDefaults[index];
  });
}

function gameById(id) {
  return gameDefs.find((game) => game.id === id);
}

function shuffle(values) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function sample(values, count) {
  return shuffle(values).slice(0, count);
}

function pick(values) {
  return values[Math.floor(Math.random() * values.length)];
}

function clearTimers() {
  app.timers.forEach((timer) => clearInterval(timer));
  app.timers = [];
}

function formatSeconds(seconds) {
  const safe = Math.max(0, Math.ceil(seconds));
  const min = String(Math.floor(safe / 60));
  const sec = String(safe % 60).padStart(2, "0");
  return `${min}:${sec}`;
}

function attachDeadlineTimer(deadline, selector, onDone) {
  const target = document.querySelector(selector);
  let finished = false;
  const update = () => {
    const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    if (target) target.textContent = formatSeconds(remaining);
    if (remaining <= 0 && !finished) {
      finished = true;
      clearTimers();
      onDone();
    }
  };
  update();
  const timer = setInterval(update, 250);
  app.timers.push(timer);
}

function resetHandlers() {
  gameRoot.onclick = null;
  gameRoot.onsubmit = null;
  gameRoot.oninput = null;
}

function initGame(id) {
  clearTimers();
  app.states[id] = createInitialState(id);
}

function createInitialState(id) {
  if (id === "fake-word") return initFakeWord();
  if (id === "werewolf") return initWerewolf();
  if (id === "bomb") return initBomb();
  if (id === "detective") return initDetective();
  if (id === "chicken") return initChicken();
  if (id === "drawing") return initDrawing();
  if (id === "gesture") return initGesture();
  if (id === "memory") return initMemory();
  if (id === "reverse-quiz") return initReverseQuiz();
  if (id === "auction") return initAuction();
  return {};
}

function stateFor(id = app.selected) {
  if (!app.states[id]) initGame(id);
  return app.states[id];
}

function renderShell() {
  selectedPlayerCount.textContent = `${app.players}人`;
  playerCount.innerHTML = [2, 3, 4].map((count) => `
    <button type="button" class="${app.players === count ? "active" : ""}" data-count="${count}">
      ${count}人
    </button>
  `).join("");

  playerNames.innerHTML = playerDefaults.map((fallback, index) => `
    <label class="name-row" ${index >= app.players ? "hidden" : ""}>
      <span class="name-badge">${index + 1}</span>
      <input type="text" maxlength="12" value="${escapeHtml(app.names[index] || fallback)}" data-name-index="${index}" aria-label="プレイヤー${index + 1}の名前">
    </label>
  `).join("");

  const byId = new Map(gameDefs.map((game) => [game.id, game]));
  gameList.innerHTML = gameSections.map((section) => `
    <div class="section-label">
      <span>${escapeHtml(section.label)}</span>
      <small>${escapeHtml(section.note)}</small>
    </div>
    ${section.games.map((id, index) => {
      const game = byId.get(id);
      const order = String(index + 1).padStart(2, "0");
      return `
        <button class="game-tab ${app.selected === game.id ? "active" : ""}" type="button" data-game="${game.id}" aria-pressed="${app.selected === game.id}">
          <span class="game-tab-icon">${escapeHtml(game.icon)}</span>
          <span>
            <span class="game-tab-kicker">其の${order} / ${escapeHtml(game.genre)} / ${escapeHtml(game.minutes)}</span>
            <span class="game-tab-title">${escapeHtml(game.title)}</span>
            <span class="game-tab-meta">${escapeHtml(game.description)}</span>
          </span>
        </button>
      `;
    }).join("")}
  `).join("");
}

function renderFrame(game, body) {
  gameRoot.innerHTML = `
    <div class="game-screen">
      <header class="game-header">
        <span class="game-seal" aria-hidden="true">${escapeHtml(game.icon)}</span>
        <div>
          <p class="game-kicker">${escapeHtml(game.genre)} / ${game.min}〜${game.max}人 / ${escapeHtml(game.minutes)}</p>
          <h2>${escapeHtml(game.title)}</h2>
          <p class="game-description">${escapeHtml(game.description)}</p>
        </div>
        <div class="meta-pills" aria-label="ゲーム情報">
          <span class="pill">${escapeHtml(game.genre)}</span>
          <span class="pill">${game.min}〜${game.max}人</span>
          <span class="pill">${escapeHtml(game.minutes)}</span>
        </div>
      </header>
      <div class="tabletop">
        <div class="tabletop-band"><span>開演</span></div>
        <div class="tabletop-body">${body}</div>
      </div>
    </div>
  `;
}

function renderNeedPlayers(game) {
  renderFrame(game, `
    <div class="flow">
      <div class="info-box warning">
        <strong>${game.title}は${game.min}人以上で遊べます。</strong>
        <p>左の人数を${game.min}〜${game.max}人にしてください。</p>
      </div>
      <button class="primary" type="button" data-set-min="${game.min}">${game.min}人にする</button>
    </div>
  `);
  gameRoot.onclick = (event) => {
    const button = event.target.closest("[data-set-min]");
    if (!button) return;
    app.players = Number(button.dataset.setMin);
    initGame(app.selected);
    renderShell();
    renderGame();
  };
}

function renderGame() {
  clearTimers();
  resetHandlers();
  const game = gameById(app.selected);
  if (app.players < game.min) {
    renderNeedPlayers(game);
    return;
  }

  if (app.selected === "fake-word") renderFakeWord(game, stateFor());
  if (app.selected === "werewolf") renderWerewolf(game, stateFor());
  if (app.selected === "bomb") renderBomb(game, stateFor());
  if (app.selected === "detective") renderDetective(game, stateFor());
  if (app.selected === "chicken") renderChicken(game, stateFor());
  if (app.selected === "drawing") renderDrawing(game, stateFor());
  if (app.selected === "gesture") renderGesture(game, stateFor());
  if (app.selected === "memory") renderMemory(game, stateFor());
  if (app.selected === "reverse-quiz") renderReverseQuiz(game, stateFor());
  if (app.selected === "auction") renderAuction(game, stateFor());
}

function revealPanel(game, state, title, contentBuilder, nextPhase) {
  const names = activeNames();
  const index = state.revealIndex;
  if (index >= app.players) {
    state.phase = typeof nextPhase === "function" ? nextPhase() : nextPhase;
    renderGame();
    return;
  }

  const name = names[index];
  const secret = state.showSecret ? contentBuilder(index) : `
    <p class="game-description">他の人に見えないようにしてから開いてください。</p>
  `;

  renderFrame(game, `
    <div class="private-panel">
      <div>
        <p class="secret-label">${escapeHtml(title)}</p>
        <h3>${escapeHtml(name)}さん</h3>
      </div>
      <div class="secret-box">${secret}</div>
      <div class="action-row">
        ${state.showSecret
          ? `<button class="primary" type="button" data-reveal-next>${index + 1 === app.players ? "全員確認した" : "閉じて次の人へ"}</button>`
          : `<button class="primary" type="button" data-reveal-show>見る</button>`}
      </div>
    </div>
  `);

  gameRoot.onclick = (event) => {
    if (event.target.closest("[data-reveal-show]")) {
      state.showSecret = true;
      renderGame();
    }
    if (event.target.closest("[data-reveal-next]")) {
      state.showSecret = false;
      state.revealIndex += 1;
      renderGame();
    }
  };
}

function playerScores(scores) {
  return activeNames().map((name, index) => `
    <div class="score-box">
      <strong>${escapeHtml(name)}</strong>
      <span>${scores[index]}点</span>
    </div>
  `).join("");
}

function renderVoteButtons(attr = "data-vote") {
  return activeNames().map((name, index) => `
    <button class="choice-button" type="button" ${attr}="${index}">
      ${escapeHtml(name)}
    </button>
  `).join("");
}

function initFakeWord() {
  const pair = pick(fakeWordPairs);
  const fakeIndex = Math.floor(Math.random() * app.players);
  return {
    phase: "reveal",
    revealIndex: 0,
    showSecret: false,
    pair,
    fakeIndex,
    discussionEndsAt: null,
    voted: null,
  };
}

function renderFakeWord(game, state) {
  if (state.phase === "reveal") {
    revealPanel(game, state, "お題カード", (index) => `
      <span class="secret-label">あなたのお題</span>
      <div class="big-word">${escapeHtml(index === state.fakeIndex ? state.pair[1] : state.pair[0])}</div>
    `, "talk");
    return;
  }

  if (state.phase === "talk") {
    if (!state.discussionEndsAt) state.discussionEndsAt = Date.now() + 180000;
    renderFrame(game, `
      <div class="flow">
        <div class="split">
          <div class="info-box">
            <p class="section-title">議論</p>
            <div class="timer" id="fake-timer">3:00</div>
            <p>順番に一言ずつヒントを出して、ニセモノだと思う人を指名します。</p>
          </div>
          <div>
            <p class="section-title">投票</p>
            <div class="vote-grid">${renderVoteButtons()}</div>
          </div>
        </div>
      </div>
    `);
    attachDeadlineTimer(state.discussionEndsAt, "#fake-timer", () => {});
    gameRoot.onclick = (event) => {
      const vote = event.target.closest("[data-vote]");
      if (!vote) return;
      state.voted = Number(vote.dataset.vote);
      state.phase = "result";
      renderGame();
    };
    return;
  }

  const hit = state.voted === state.fakeIndex;
  renderFrame(game, `
    <div class="flow">
      <div class="result-box ${hit ? "win" : "lose"}">
        <strong>${hit ? "多数派の勝ち" : "ニセモノの勝ち"}</strong>
        <p>ニセモノは ${escapeHtml(activeNames()[state.fakeIndex])}さんでした。</p>
      </div>
      <div class="split">
        <div class="info-box">
          <p class="section-title">多数派のお題</p>
          <div class="big-word">${escapeHtml(state.pair[0])}</div>
        </div>
        <div class="info-box">
          <p class="section-title">ニセモノのお題</p>
          <div class="big-word">${escapeHtml(state.pair[1])}</div>
        </div>
      </div>
      <button class="primary" type="button" data-restart>もう一度</button>
    </div>
  `);
  gameRoot.onclick = (event) => {
    if (event.target.closest("[data-restart]")) {
      initGame(app.selected);
      renderGame();
    }
  };
}

function initWerewolf() {
  const roles = app.players === 3 ? ["人狼", "占い師", "村人"] : ["人狼", "占い師", "村人", "村人"];
  const assigned = shuffle(roles);
  return {
    phase: "reveal",
    revealIndex: 0,
    showSecret: false,
    roles: assigned,
    seerTarget: null,
    discussionEndsAt: null,
    voted: null,
  };
}

function renderWerewolf(game, state) {
  const names = activeNames();
  const wolfIndex = state.roles.indexOf("人狼");
  const seerIndex = state.roles.indexOf("占い師");

  if (state.phase === "reveal") {
    revealPanel(game, state, "役職カード", (index) => `
      <span class="secret-label">あなたの役職</span>
      <div class="big-word">${escapeHtml(state.roles[index])}</div>
    `, "seer");
    return;
  }

  if (state.phase === "seer") {
    const result = state.seerTarget === null ? "" : `
      <div class="result-box win">
        <strong>${escapeHtml(names[state.seerTarget])}さんは ${escapeHtml(state.roles[state.seerTarget])}</strong>
      </div>
      <button class="primary" type="button" data-start-talk>結果を伏せて議論へ</button>
    `;
    renderFrame(game, `
      <div class="private-panel">
        <div>
          <p class="secret-label">占い師フェーズ</p>
          <h3>${escapeHtml(names[seerIndex])}さんだけ見てください</h3>
        </div>
        ${state.seerTarget === null ? `
          <div class="vote-grid">
            ${names.map((name, index) => index === seerIndex ? "" : `
              <button class="choice-button" type="button" data-seer="${index}">${escapeHtml(name)}</button>
            `).join("")}
          </div>
        ` : result}
      </div>
    `);
    gameRoot.onclick = (event) => {
      const target = event.target.closest("[data-seer]");
      if (target) {
        state.seerTarget = Number(target.dataset.seer);
        renderGame();
      }
      if (event.target.closest("[data-start-talk]")) {
        state.phase = "talk";
        renderGame();
      }
    };
    return;
  }

  if (state.phase === "talk") {
    if (!state.discussionEndsAt) state.discussionEndsAt = Date.now() + 180000;
    renderFrame(game, `
      <div class="flow">
        <div class="split">
          <div class="info-box">
            <p class="section-title">議論</p>
            <div class="timer" id="werewolf-timer">3:00</div>
            <p>人狼だと思う人に投票します。人狼は村人になりきってください。</p>
          </div>
          <div>
            <p class="section-title">投票</p>
            <div class="vote-grid">${renderVoteButtons()}</div>
          </div>
        </div>
      </div>
    `);
    attachDeadlineTimer(state.discussionEndsAt, "#werewolf-timer", () => {});
    gameRoot.onclick = (event) => {
      const vote = event.target.closest("[data-vote]");
      if (!vote) return;
      state.voted = Number(vote.dataset.vote);
      state.phase = "result";
      renderGame();
    };
    return;
  }

  const villageWin = state.voted === wolfIndex;
  renderFrame(game, `
    <div class="flow">
      <div class="result-box ${villageWin ? "win" : "lose"}">
        <strong>${villageWin ? "村人チームの勝ち" : "人狼の勝ち"}</strong>
        <p>人狼は ${escapeHtml(names[wolfIndex])}さんでした。</p>
      </div>
      <div class="score-grid">
        ${names.map((name, index) => `
          <div class="score-box">
            <strong>${escapeHtml(name)}</strong>
            <span>${escapeHtml(state.roles[index])}</span>
          </div>
        `).join("")}
      </div>
      <button class="primary" type="button" data-restart>もう一度</button>
    </div>
  `);
  gameRoot.onclick = (event) => {
    if (event.target.closest("[data-restart]")) {
      initGame(app.selected);
      renderGame();
    }
  };
}

function initBomb() {
  const colors = [
    { name: "赤", value: "var(--red)" },
    { name: "青", value: "var(--blue)" },
    { name: "黄", value: "var(--yellow)" },
    { name: "緑", value: "var(--green)" },
    { name: "白", value: "#e9edf2" },
    { name: "黒", value: "var(--black)" },
  ];
  const wires = Array.from({ length: 5 }, () => pick(colors.filter((color) => color.name !== "青")));
  wires[Math.floor(Math.random() * wires.length)] = colors.find((color) => color.name === "青");
  const symbols = sample(["△", "○", "□", "◇", "☆", "＋", "−"], 4);
  const redYellow = wires.filter((wire) => wire.name === "赤" || wire.name === "黄").length;
  const bluePosition = wires.findIndex((wire) => wire.name === "青") + 1;
  const angular = symbols.filter((symbol) => ["△", "□", "◇", "☆", "＋"].includes(symbol)).length;
  return {
    phase: "solve",
    wires,
    symbols,
    code: `${redYellow}${bluePosition}${angular}`,
    strikes: 0,
    endsAt: null,
    typed: "",
  };
}

function renderBomb(game, state) {
  if (state.phase === "result") {
    const success = state.typed === state.code;
    renderFrame(game, `
      <div class="flow">
        <div class="result-box ${success ? "win" : "lose"}">
          <strong>${success ? "解除成功" : "解除失敗"}</strong>
          <p>正解コードは ${escapeHtml(state.code)} でした。</p>
        </div>
        <button class="primary" type="button" data-restart>新しい爆弾</button>
      </div>
    `);
    gameRoot.onclick = (event) => {
      if (event.target.closest("[data-restart]")) {
        initGame(app.selected);
        renderGame();
      }
    };
    return;
  }

  if (!state.endsAt) state.endsAt = Date.now() + 180000;
  renderFrame(game, `
    <div class="flow">
      <div class="split">
        <div class="flow">
          <div class="info-box">
            <p class="section-title">残り時間</p>
            <div class="timer" id="bomb-timer">3:00</div>
            <p>ミスは3回まで。コードは3桁です。</p>
          </div>
          <div>
            <p class="section-title">線</p>
            <div class="wires">
              ${state.wires.map((wire, index) => `
                <div class="wire" style="--wire-color:${wire.value}">
                  <span>${index + 1}</span>
                </div>
              `).join("")}
            </div>
          </div>
          <div>
            <p class="section-title">記号</p>
            <div class="symbols">
              ${state.symbols.map((symbol) => `<div class="symbol">${escapeHtml(symbol)}</div>`).join("")}
            </div>
          </div>
        </div>
        <form class="flow" id="bomb-form">
          <div class="info-box">
            <p class="section-title">解除ルール</p>
            <p>1桁目: 赤または黄の線の本数</p>
            <p>2桁目: 青い線の位置</p>
            <p>3桁目: 角のある記号の数</p>
          </div>
          <input class="code-input" name="code" inputmode="numeric" maxlength="3" autocomplete="off" placeholder="000" value="${escapeHtml(state.typed)}">
          <button class="primary" type="submit">解除する</button>
          <div class="info-box">ミス: ${state.strikes}/3</div>
        </form>
      </div>
    </div>
  `);
  attachDeadlineTimer(state.endsAt, "#bomb-timer", () => {
    state.phase = "result";
    state.typed = "";
    renderGame();
  });
  gameRoot.oninput = (event) => {
    if (event.target.name === "code") {
      state.typed = event.target.value.replace(/\D/g, "").slice(0, 3);
      event.target.value = state.typed;
    }
  };
  gameRoot.onsubmit = (event) => {
    event.preventDefault();
    const input = event.target.elements.code.value;
    state.typed = input;
    if (input === state.code) {
      state.phase = "result";
    } else {
      state.strikes += 1;
      if (state.strikes >= 3) state.phase = "result";
    }
    renderGame();
  };
}

function initDetective() {
  const names = activeNames();
  const colors = sample(["赤", "青", "白", "黒"], app.players);
  const items = sample(["鍵", "時計", "封筒", "コイン"], app.players);
  const places = sample(["キッチン", "書斎", "玄関", "屋上"], app.players);
  const suspects = names.map((name, index) => ({
    name,
    color: colors[index],
    item: items[index],
    place: places[index],
  }));
  const culprit = Math.floor(Math.random() * app.players);
  const clues = shuffle([
    `犯人の持ち物は「${suspects[culprit].item}」`,
    `犯人は事件直前に「${suspects[culprit].place}」にいた`,
    `犯人の目印は「${suspects[culprit].color}」`,
  ]).slice(0, app.players === 2 ? 2 : 3);
  return {
    phase: "solve",
    suspects,
    culprit,
    clues,
    guessed: null,
    endsAt: null,
  };
}

function renderDetective(game, state) {
  if (state.phase === "result") {
    const hit = state.guessed === state.culprit;
    renderFrame(game, `
      <div class="flow">
        <div class="result-box ${hit ? "win" : "lose"}">
          <strong>${hit ? "推理成功" : "推理失敗"}</strong>
          <p>犯人は ${escapeHtml(state.suspects[state.culprit].name)}さんでした。</p>
        </div>
        <button class="primary" type="button" data-restart>新しい事件</button>
      </div>
    `);
    gameRoot.onclick = (event) => {
      if (event.target.closest("[data-restart]")) {
        initGame(app.selected);
        renderGame();
      }
    };
    return;
  }

  if (!state.endsAt) state.endsAt = Date.now() + 240000;
  renderFrame(game, `
    <div class="flow">
      <div class="split">
        <div>
          <p class="section-title">容疑者</p>
          <div class="suspect-grid">
            ${state.suspects.map((suspect, index) => `
              <button class="suspect-box choice-button" type="button" data-guess="${index}">
                <strong>${escapeHtml(suspect.name)}</strong>
                <span>目印: ${escapeHtml(suspect.color)}</span><br>
                <span>持ち物: ${escapeHtml(suspect.item)}</span><br>
                <span>場所: ${escapeHtml(suspect.place)}</span>
              </button>
            `).join("")}
          </div>
        </div>
        <div class="flow">
          <div class="info-box">
            <p class="section-title">残り時間</p>
            <div class="timer" id="detective-timer">4:00</div>
          </div>
          <div>
            <p class="section-title">証言カード</p>
            <ul class="clue-list">
              ${state.clues.map((clue) => `<li class="clue-box">${escapeHtml(clue)}</li>`).join("")}
            </ul>
          </div>
        </div>
      </div>
    </div>
  `);
  attachDeadlineTimer(state.endsAt, "#detective-timer", () => {});
  gameRoot.onclick = (event) => {
    const guess = event.target.closest("[data-guess]");
    if (!guess) return;
    state.guessed = Number(guess.dataset.guess);
    state.phase = "result";
    renderGame();
  };
}

function initChicken() {
  return {
    phase: "input",
    round: 1,
    current: 0,
    totals: Array(app.players).fill(0),
    entries: [],
    history: [],
  };
}

function renderChicken(game, state) {
  const names = activeNames();
  if (state.phase === "result") {
    const valid = state.totals.map((total, index) => ({ total, index })).filter((row) => row.total <= 100);
    const winner = valid.length ? valid.sort((a, b) => b.total - a.total)[0].index : null;
    renderFrame(game, `
      <div class="flow">
        <div class="result-box ${winner === null ? "lose" : "win"}">
          <strong>${winner === null ? "全員バースト" : `${escapeHtml(names[winner])}さんの勝ち`}</strong>
          <p>100を超えずに一番近い人が勝ちです。</p>
        </div>
        <div class="score-grid">
          ${names.map((name, index) => `
            <div class="score-box">
              <strong>${escapeHtml(name)}</strong>
              <span>${state.totals[index]}</span>
            </div>
          `).join("")}
        </div>
        <button class="primary" type="button" data-restart>もう一度</button>
      </div>
    `);
    gameRoot.onclick = (event) => {
      if (event.target.closest("[data-restart]")) {
        initGame(app.selected);
        renderGame();
      }
    };
    return;
  }

  if (state.phase === "reveal") {
    renderFrame(game, `
      <div class="flow">
        <p class="section-title">第${state.round}ラウンド結果</p>
        <table class="history-table">
          <thead><tr><th>プレイヤー</th><th>追加</th><th>合計</th></tr></thead>
          <tbody>
            ${names.map((name, index) => `
              <tr>
                <td>${escapeHtml(name)}</td>
                <td>+${state.entries[index]}</td>
                <td>${state.totals[index]}${state.totals[index] > 100 ? " / 脱落" : ""}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <button class="primary" type="button" data-next-round>${state.round >= 3 ? "最終結果" : "次のラウンド"}</button>
      </div>
    `);
    gameRoot.onclick = (event) => {
      if (!event.target.closest("[data-next-round]")) return;
      if (state.round >= 3) {
        state.phase = "result";
      } else {
        state.round += 1;
        state.current = 0;
        state.entries = [];
        state.phase = "input";
      }
      renderGame();
    };
    return;
  }

  const currentName = names[state.current];
  renderFrame(game, `
    <form class="flow" id="chicken-form">
      <div class="split">
        <div class="private-panel">
          <p class="secret-label">第${state.round}ラウンド</p>
          <h3>${escapeHtml(currentName)}さん</h3>
          <p>1〜40の数字を1つ足します。</p>
          <input class="number-input" name="amount" type="number" min="1" max="40" autocomplete="off" required>
          <button class="primary" type="submit">決定</button>
        </div>
        <div>
          <p class="section-title">現在の合計</p>
          <div class="score-grid">
            ${names.map((name, index) => `
              <div class="score-box">
                <strong>${escapeHtml(name)}</strong>
                <span>${state.totals[index]}</span>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    </form>
  `);
  gameRoot.onsubmit = (event) => {
    event.preventDefault();
    const value = Math.max(1, Math.min(40, Number(event.target.elements.amount.value || 0)));
    state.entries[state.current] = value;
    state.current += 1;
    if (state.current >= app.players) {
      state.entries.forEach((amount, index) => {
        state.totals[index] += amount;
      });
      state.history.push([...state.entries]);
      state.phase = "reveal";
    }
    renderGame();
  };
}

function initDrawing() {
  return {
    phase: "ready",
    drawer: 0,
    scores: Array(app.players).fill(0),
    prompt: null,
    endsAt: null,
    round: 1,
  };
}

function renderDrawing(game, state) {
  const names = activeNames();
  if (state.phase === "ready") {
    renderFrame(game, `
      <div class="flow">
        <div class="split">
          <div class="info-box">
            <p class="section-title">出題者</p>
            <div class="big-word">${escapeHtml(names[state.drawer])}</div>
          </div>
          <div>
            <p class="section-title">得点</p>
            <div class="score-grid">${playerScores(state.scores)}</div>
          </div>
        </div>
        <button class="primary" type="button" data-draw-secret>お題を引く</button>
      </div>
    `);
    gameRoot.onclick = (event) => {
      if (!event.target.closest("[data-draw-secret]")) return;
      state.prompt = pick(drawingPrompts);
      state.phase = "secret";
      renderGame();
    };
    return;
  }

  if (state.phase === "secret") {
    renderFrame(game, `
      <div class="private-panel">
        <p class="secret-label">${escapeHtml(names[state.drawer])}さんだけ見てください</p>
        <div class="big-word">${escapeHtml(state.prompt)}</div>
        <button class="primary" type="button" data-start-drawing>10秒開始</button>
      </div>
    `);
    gameRoot.onclick = (event) => {
      if (!event.target.closest("[data-start-drawing]")) return;
      state.phase = "drawing";
      state.endsAt = Date.now() + 10000;
      renderGame();
    };
    return;
  }

  renderFrame(game, `
    <div class="flow">
      <div class="action-row">
        <div class="timer" id="draw-timer">0:10</div>
        <strong>${escapeHtml(names[state.drawer])}さんが描く番</strong>
      </div>
      <canvas class="draw-surface" id="draw-canvas" width="1000" height="520" aria-label="お絵描きキャンバス"></canvas>
      <div class="action-row hidden" id="draw-judge">
        <button class="primary" type="button" data-draw-correct>当たった</button>
        <button class="secondary" type="button" data-draw-skip>スキップ</button>
      </div>
    </div>
  `);
  setupCanvas(state);
  attachDeadlineTimer(state.endsAt, "#draw-timer", () => {
    state.phase = "judge";
    const judge = document.querySelector("#draw-judge");
    if (judge) judge.classList.remove("hidden");
  });
  gameRoot.onclick = (event) => {
    if (event.target.closest("[data-draw-correct]")) {
      state.scores[state.drawer] += 1;
      nextDrawer(state);
      renderGame();
    }
    if (event.target.closest("[data-draw-skip]")) {
      nextDrawer(state);
      renderGame();
    }
  };
}

function setupCanvas(state) {
  const canvas = document.querySelector("#draw-canvas");
  const context = canvas.getContext("2d");
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = 8;
  context.strokeStyle = "#1e2329";
  let drawing = false;

  const point = (event) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  canvas.addEventListener("pointerdown", (event) => {
    if (state.phase !== "drawing") return;
    drawing = true;
    canvas.setPointerCapture(event.pointerId);
    const p = point(event);
    context.beginPath();
    context.moveTo(p.x, p.y);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!drawing || state.phase !== "drawing") return;
    const p = point(event);
    context.lineTo(p.x, p.y);
    context.stroke();
  });

  const stop = () => {
    drawing = false;
  };
  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointerleave", stop);
}

function nextDrawer(state) {
  state.drawer = (state.drawer + 1) % app.players;
  state.prompt = null;
  state.endsAt = null;
  state.round += 1;
  state.phase = "ready";
}

function initGesture() {
  return {
    phase: "ready",
    actor: 0,
    scores: Array(app.players).fill(0),
    prompt: null,
    endsAt: null,
  };
}

function renderGesture(game, state) {
  const names = activeNames();
  if (state.phase === "ready") {
    renderFrame(game, `
      <div class="flow">
        <div class="split">
          <div class="info-box">
            <p class="section-title">演者</p>
            <div class="big-word">${escapeHtml(names[state.actor])}</div>
          </div>
          <div>
            <p class="section-title">得点</p>
            <div class="score-grid">${playerScores(state.scores)}</div>
          </div>
        </div>
        <button class="primary" type="button" data-start-gesture>60秒開始</button>
      </div>
    `);
    gameRoot.onclick = (event) => {
      if (!event.target.closest("[data-start-gesture]")) return;
      state.prompt = pick(gesturePrompts);
      state.endsAt = Date.now() + 60000;
      state.phase = "acting";
      renderGame();
    };
    return;
  }

  renderFrame(game, `
    <div class="flow">
      <div class="split">
        <div class="private-panel">
          <p class="secret-label">${escapeHtml(names[state.actor])}さんのお題</p>
          <div class="big-word">${escapeHtml(state.prompt)}</div>
          <div class="timer" id="gesture-timer">1:00</div>
        </div>
        <div class="flow">
          <div class="score-grid">${playerScores(state.scores)}</div>
          <div class="action-row">
            <button class="primary" type="button" data-gesture-correct>正解</button>
            <button class="secondary" type="button" data-gesture-pass>パス</button>
            <button class="danger" type="button" data-gesture-end>交代</button>
          </div>
        </div>
      </div>
    </div>
  `);
  attachDeadlineTimer(state.endsAt, "#gesture-timer", () => {
    state.actor = (state.actor + 1) % app.players;
    state.prompt = null;
    state.endsAt = null;
    state.phase = "ready";
    renderGame();
  });
  gameRoot.onclick = (event) => {
    if (event.target.closest("[data-gesture-correct]")) {
      state.scores[state.actor] += 1;
      state.prompt = pick(gesturePrompts);
      renderGame();
    }
    if (event.target.closest("[data-gesture-pass]")) {
      state.prompt = pick(gesturePrompts);
      renderGame();
    }
    if (event.target.closest("[data-gesture-end]")) {
      state.actor = (state.actor + 1) % app.players;
      state.prompt = null;
      state.endsAt = null;
      state.phase = "ready";
      renderGame();
    }
  };
}

function initMemory() {
  return {
    phase: "ready",
    round: 1,
    score: 0,
    grid: [],
    missing: null,
    options: [],
    endsAt: null,
    picked: null,
  };
}

function prepareMemoryRound(state) {
  state.grid = sample(memoryItems, 9);
  state.missing = pick(state.grid);
  const wrong = sample(memoryItems.filter((item) => item.label !== state.missing.label), 3);
  state.options = shuffle([state.missing, ...wrong]);
  state.endsAt = Date.now() + 8000;
  state.picked = null;
  state.phase = "show";
}

function memoryTiles(items) {
  return items.map((item) => `
    <div class="memory-tile">
      <span class="memory-symbol">${escapeHtml(item.symbol)}</span>
      <span>${escapeHtml(item.label)}</span>
    </div>
  `).join("");
}

function renderMemory(game, state) {
  if (state.phase === "ready") {
    renderFrame(game, `
      <div class="flow">
        <div class="info-box">
          <strong>現在 ${state.score}点 / 第${state.round}ラウンド</strong>
        </div>
        <button class="primary" type="button" data-memory-start>開始</button>
      </div>
    `);
    gameRoot.onclick = (event) => {
      if (!event.target.closest("[data-memory-start]")) return;
      prepareMemoryRound(state);
      renderGame();
    };
    return;
  }

  if (state.phase === "show") {
    renderFrame(game, `
      <div class="flow">
        <div class="action-row">
          <div class="timer" id="memory-timer">0:08</div>
          <strong>この中から1つ消えます</strong>
        </div>
        <div class="memory-grid">${memoryTiles(state.grid)}</div>
      </div>
    `);
    attachDeadlineTimer(state.endsAt, "#memory-timer", () => {
      state.phase = "answer";
      renderGame();
    });
    return;
  }

  if (state.phase === "answer") {
    const visible = state.grid.filter((item) => item.label !== state.missing.label);
    renderFrame(game, `
      <div class="flow">
        <p class="section-title">消えたものはどれ？</p>
        <div class="memory-grid">${memoryTiles(visible)}</div>
        <div class="option-grid">
          ${state.options.map((item) => `
            <button class="choice-button" type="button" data-memory-pick="${escapeHtml(item.label)}">${escapeHtml(item.label)}</button>
          `).join("")}
        </div>
      </div>
    `);
    gameRoot.onclick = (event) => {
      const button = event.target.closest("[data-memory-pick]");
      if (!button) return;
      state.picked = button.dataset.memoryPick;
      if (state.picked === state.missing.label) state.score += 1;
      state.phase = "result";
      renderGame();
    };
    return;
  }

  const hit = state.picked === state.missing.label;
  renderFrame(game, `
    <div class="flow">
      <div class="result-box ${hit ? "win" : "lose"}">
        <strong>${hit ? "正解" : "不正解"}</strong>
        <p>消えたものは ${escapeHtml(state.missing.label)} でした。</p>
      </div>
      <button class="primary" type="button" data-memory-next>${state.round >= 5 ? "最初から" : "次の問題"}</button>
    </div>
  `);
  gameRoot.onclick = (event) => {
    if (!event.target.closest("[data-memory-next]")) return;
    if (state.round >= 5) {
      initGame(app.selected);
    } else {
      state.round += 1;
      prepareMemoryRound(state);
    }
    renderGame();
  };
}

function initReverseQuiz() {
  return {
    phase: "input",
    questions: sample(quizQuestions, 3),
    qIndex: 0,
    current: 0,
    scores: Array(app.players).fill(0),
    answers: [],
    resultRows: [],
  };
}

function scoreReverseQuestion(state) {
  const question = state.questions[state.qIndex];
  const counts = question.options.map((_, index) => state.answers.filter((answer) => answer === index).length);
  const rows = activeNames().map((name, index) => {
    const answer = state.answers[index];
    const correct = answer === question.answer;
    let points = 0;
    if (correct) {
      points = 2;
      if (counts[answer] === 1) points += 2;
      else if (counts[answer] === Math.min(...counts.filter(Boolean))) points += 1;
    }
    state.scores[index] += points;
    return { name, answer: question.options[answer], correct, points };
  });
  state.resultRows = rows;
}

function renderReverseQuiz(game, state) {
  const names = activeNames();
  if (state.phase === "final") {
    const topScore = Math.max(...state.scores);
    const winners = names.filter((_, index) => state.scores[index] === topScore);
    renderFrame(game, `
      <div class="flow">
        <div class="result-box win">
          <strong>勝者: ${escapeHtml(winners.join("、"))}</strong>
          <p>少数派で正解した人にボーナスが入りました。</p>
        </div>
        <div class="score-grid">${playerScores(state.scores)}</div>
        <button class="primary" type="button" data-restart>もう一度</button>
      </div>
    `);
    gameRoot.onclick = (event) => {
      if (event.target.closest("[data-restart]")) {
        initGame(app.selected);
        renderGame();
      }
    };
    return;
  }

  const question = state.questions[state.qIndex];
  if (state.phase === "reveal") {
    renderFrame(game, `
      <div class="flow">
        <div class="info-box">
          <strong>正解: ${escapeHtml(question.options[question.answer])}</strong>
        </div>
        <table class="history-table">
          <thead><tr><th>プレイヤー</th><th>回答</th><th>得点</th></tr></thead>
          <tbody>
            ${state.resultRows.map((row) => `
              <tr>
                <td>${escapeHtml(row.name)}</td>
                <td>${escapeHtml(row.answer)}${row.correct ? "" : " / 不正解"}</td>
                <td>+${row.points}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div class="score-grid">${playerScores(state.scores)}</div>
        <button class="primary" type="button" data-quiz-next>${state.qIndex >= state.questions.length - 1 ? "最終結果" : "次の問題"}</button>
      </div>
    `);
    gameRoot.onclick = (event) => {
      if (!event.target.closest("[data-quiz-next]")) return;
      if (state.qIndex >= state.questions.length - 1) {
        state.phase = "final";
      } else {
        state.qIndex += 1;
        state.current = 0;
        state.answers = [];
        state.resultRows = [];
        state.phase = "input";
      }
      renderGame();
    };
    return;
  }

  renderFrame(game, `
    <div class="flow">
      <div class="private-panel">
        <p class="secret-label">第${state.qIndex + 1}問 / ${escapeHtml(names[state.current])}さん</p>
        <h3>${escapeHtml(question.q)}</h3>
        <div class="option-grid">
          ${question.options.map((option, index) => `
            <button class="choice-button" type="button" data-quiz-answer="${index}">${escapeHtml(option)}</button>
          `).join("")}
        </div>
      </div>
    </div>
  `);
  gameRoot.onclick = (event) => {
    const answer = event.target.closest("[data-quiz-answer]");
    if (!answer) return;
    state.answers[state.current] = Number(answer.dataset.quizAnswer);
    state.current += 1;
    if (state.current >= app.players) {
      scoreReverseQuestion(state);
      state.phase = "reveal";
    }
    renderGame();
  };
}

function initAuction() {
  return {
    phase: "input",
    items: sample(auctionItems, 5),
    itemIndex: 0,
    current: 0,
    coins: Array(app.players).fill(20),
    points: Array(app.players).fill(0),
    bids: [],
    lastResult: null,
  };
}

function resolveAuction(state) {
  const bidRows = state.bids.map((bid, index) => ({ bid, index }));
  const uniqueBid = [...new Set(bidRows.map((row) => row.bid))]
    .sort((a, b) => b - a)
    .find((bid) => bidRows.filter((row) => row.bid === bid).length === 1);
  const winner = uniqueBid === undefined ? null : bidRows.find((row) => row.bid === uniqueBid).index;
  const item = state.items[state.itemIndex];
  if (winner !== null && uniqueBid > 0) {
    state.coins[winner] -= uniqueBid;
    state.points[winner] += item.value;
  }
  state.lastResult = { winner, bid: uniqueBid || 0, item };
}

function renderAuction(game, state) {
  const names = activeNames();
  if (state.phase === "final") {
    const top = Math.max(...state.points);
    const winners = names.filter((_, index) => state.points[index] === top);
    renderFrame(game, `
      <div class="flow">
        <div class="result-box win">
          <strong>勝者: ${escapeHtml(winners.join("、"))}</strong>
          <p>得点アイテムの合計が最も高い人の勝ちです。</p>
        </div>
        <div class="score-grid">
          ${names.map((name, index) => `
            <div class="score-box">
              <strong>${escapeHtml(name)}</strong>
              <span>${state.points[index]}点 / ${state.coins[index]}コイン</span>
            </div>
          `).join("")}
        </div>
        <button class="primary" type="button" data-restart>もう一度</button>
      </div>
    `);
    gameRoot.onclick = (event) => {
      if (event.target.closest("[data-restart]")) {
        initGame(app.selected);
        renderGame();
      }
    };
    return;
  }

  const item = state.items[state.itemIndex];
  if (state.phase === "reveal") {
    const result = state.lastResult;
    renderFrame(game, `
      <div class="flow">
        <div class="result-box ${result.winner === null || result.bid === 0 ? "lose" : "win"}">
          <strong>${result.winner === null || result.bid === 0 ? "落札なし" : `${escapeHtml(names[result.winner])}さんが落札`}</strong>
          <p>${escapeHtml(result.item.name)} / ${result.item.value}点 / ${result.bid}コイン</p>
        </div>
        <table class="history-table">
          <thead><tr><th>プレイヤー</th><th>入札</th><th>残コイン</th><th>得点</th></tr></thead>
          <tbody>
            ${names.map((name, index) => `
              <tr>
                <td>${escapeHtml(name)}</td>
                <td>${state.bids[index]}</td>
                <td>${state.coins[index]}</td>
                <td>${state.points[index]}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <button class="primary" type="button" data-auction-next>${state.itemIndex >= state.items.length - 1 ? "最終結果" : "次の品"}</button>
      </div>
    `);
    gameRoot.onclick = (event) => {
      if (!event.target.closest("[data-auction-next]")) return;
      if (state.itemIndex >= state.items.length - 1) {
        state.phase = "final";
      } else {
        state.itemIndex += 1;
        state.current = 0;
        state.bids = [];
        state.lastResult = null;
        state.phase = "input";
      }
      renderGame();
    };
    return;
  }

  const currentName = names[state.current];
  const maxBid = state.coins[state.current];
  renderFrame(game, `
    <form class="flow" id="auction-form">
      <div class="split">
        <div class="private-panel">
          <p class="secret-label">第${state.itemIndex + 1}品 / ${escapeHtml(currentName)}さん</p>
          <div class="item-box">
            <strong>${escapeHtml(item.name)}</strong>
            <span>${item.value}点</span>
          </div>
          <input class="number-input" name="bid" type="number" min="0" max="${maxBid}" autocomplete="off" required>
          <button class="primary" type="submit">入札</button>
        </div>
        <div class="flow">
          <p class="section-title">所持状況</p>
          <div class="score-grid">
            ${names.map((name, index) => `
              <div class="score-box">
                <strong>${escapeHtml(name)}</strong>
                <span>${state.points[index]}点 / ${state.coins[index]}コイン</span>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    </form>
  `);
  gameRoot.onsubmit = (event) => {
    event.preventDefault();
    const raw = Number(event.target.elements.bid.value || 0);
    const bid = Math.max(0, Math.min(maxBid, raw));
    state.bids[state.current] = bid;
    state.current += 1;
    if (state.current >= app.players) {
      resolveAuction(state);
      state.phase = "reveal";
    }
    renderGame();
  };
}

gameList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-game]");
  if (!button) return;
  app.selected = button.dataset.game;
  initGame(app.selected);
  renderShell();
  renderGame();
});

playerCount.addEventListener("click", (event) => {
  const button = event.target.closest("[data-count]");
  if (!button) return;
  app.players = Number(button.dataset.count);
  initGame(app.selected);
  renderShell();
  renderGame();
});

playerNames.addEventListener("input", (event) => {
  const input = event.target.closest("[data-name-index]");
  if (!input) return;
  app.names[Number(input.dataset.nameIndex)] = input.value;
  saveNames();
});

playerNames.addEventListener("change", () => {
  renderGame();
});

resetGame.addEventListener("click", () => {
  initGame(app.selected);
  renderGame();
});

initGame(app.selected);
renderShell();
renderGame();
