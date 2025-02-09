/*************************************************
  グローバル変数
*************************************************/
let globalEvents = [];        // 全イベント（DBのeventsテーブル）
let globalTrainingData = {};  // 研修データ（training_details.json→training_masterの連動）

/*************************************************
  メニュー表示用データ（フル定義）
*************************************************/
const menuData = {
  "0": {
    "title": "施設情報、利用者情報",
    "sub": {
      "随時／都度": {
        "title": "随時／都度",
        "items": {
          "施設情報": "施設の基本情報、ハウスルールなど",
          "利用者情報一覧": "利用者の基本情報・受給者証情報等"
        }
      }
    }
  },
  "1": {
    "title": "サービス提供・支援記録",
    "sub": {
      "日々": {
        "title": "日々",
        "items": {
          "業務日誌": "日報",
          "サービス提供記録": "利用者の日々の支援内容等",
          "サービス提供実績記録票": "都度記録"
        }
      },
      "都度": {
        "title": "都度",
        "items": {
          "アセスメント・個別支援計画書・モニタリングの記録": "利用開始や見直し時"
        }
      },
      "定期": {
        "title": "定期",
        "items": {
          "サービス担当者会議の記録": "定期開催"
        }
      }
    }
  },
  "2": {
    "title": "人事・労務関連書類",
    "sub": {
      "日々": {
        "title": "日々",
        "items": {
          "職員（従業者）の勤務状況が確認できる書類": "タイムカード等"
        }
      },
      "月次": {
        "title": "月次",
        "items": {
          "勤務予定実績表（勤務形態一覧表）": "予定と実績の比較",
          "従業者の給与の支払いが確認できる書類": "賃金台帳など",
          "平均利用者数調書（平均利用者数計算シート）": "利用者数の月次集計"
        }
      },
      "年次": {
        "title": "年次",
        "items": {
          "従業者の健康状態の把握が確認できる書類": "健康診断結果"
        }
      },
      "随時／都度": {
        "title": "随時／都度",
        "items": {
          "職員（従業者）の雇用状況等が確認できる書類": "雇用契約書等",
          "従業者の資格証": "",
          "従業者の守秘義務が確認できる書類": "誓約書等"
        }
      }
    }
  },
  "3": {
    "title": "研修・訓練等",
    "sub": {
      "研修・訓練": {
        "title": "研修・訓練",
        "items": {
          "資料の策定と作成": "旧:研修・訓練用資料の策定と作成",
          "実施予定日の設定と記録": "旧:研修・訓練・見直しに関する記録"
        }
      },
      "見直し、委員会及び会議": {
        "title": "見直し、委員会及び会議",
        "items": {
          "課題・議題の策定と記録": "旧:会議、各委員会活動などの記録"
        }
      }
    }
  },
  "4": {
    "title": "運営・基本管理書類",
    "sub": {
      "随時／都度": {
        "title": "随時／都度",
        "items": {
          "運営規程": "最新の規程",
          "各種対応マニュアル": "苦情、事故、感染症など",
          "預り金等管理規程": "",
          "事業所のパンフレット": "",
          "指定申請書・変更届出書": "",
          "集団研修の資料": "",
          "協力医療機関との契約書、連携記録書": ""
        }
      },
      "年次": {
        "title": "年次",
        "items": {
          "非常災害対策に関する書類": "避難訓練記録等"
        }
      }
    }
  },
  "5": {
    "title": "契約・利用者関連・請求書類",
    "sub": {
      "都度": {
        "title": "都度",
        "items": {
          "重要事項説明書・利用契約書・同意書（３点セット）": "",
          "受給者証の写し": "",
          "契約内容報告書の写し": "",
          "法定代理受領通知": "",
          "請求書・領収証": ""
        }
      },
      "月次": {
        "title": "月次",
        "items": {
          "介護給付費等の明細書の写し": "",
          "各種加算の算定根拠資料": ""
        }
      }
    }
  },
  "6": {
    "title": "財務・保険関連",
    "sub": {
      "月次": {
        "title": "月次",
        "items": {
          "会計書類（BS、PL）": "会計"
        }
      },
      "随時／都度": {
        "title": "随時／都度",
        "items": {
          "事業者賠償責任の保険証券": "更新時等"
        }
      }
    }
  }
};

/*************************************************
  メニューを生成する関数
*************************************************/
function buildMenuHTML(menuData) {
  let html = "<ul>";
  for (let catKey in menuData) {
    const cat = menuData[catKey];
    html += `<li data-cat="${catKey}"><span class="menu-title">${cat.title}</span>`;
    if (cat.sub) {
      html += `<ul class="sub-menu hidden">`;
      for (let subKey in cat.sub) {
        const sub = cat.sub[subKey];
        html += `<li data-sub="${subKey}"><span class="sub-title">${sub.title}</span>`;
        if (sub.items) {
          html += `<ul class="item-menu hidden">`;
          for (let itemKey in sub.items) {
            html += `<li data-item="${itemKey}">${itemKey}</li>`;
          }
          html += `</ul>`;
        }
        html += `</li>`;
      }
      html += `</ul>`;
    }
    html += `</li>`;
  }
  html += "</ul>";
  return html;
}

/*************************************************
  ページ読み込み時の初期処理
*************************************************/
document.addEventListener("DOMContentLoaded", () => {
  // ----- 左メニュー生成 -----
  const leftMenuEl = document.getElementById("left-menu");
  leftMenuEl.innerHTML = buildMenuHTML(menuData);

  // ----- イベントデータ, 研修データを取得 -----
  globalEvents = JSON.parse(document.getElementById("event-data").textContent);
  globalTrainingData = JSON.parse(document.getElementById("training-data").textContent);

  // ----- メニューの折りたたみ操作 -----
  leftMenuEl.addEventListener("click", (e) => {
    e.preventDefault();
    let target = e.target;
    if (target.tagName === "SPAN") {
      target = target.parentElement;
    }
    // 大分類をクリック -> 他の大分類を閉じる
    if (target.hasAttribute("data-cat")) {
      leftMenuEl.querySelectorAll("li[data-cat]").forEach(li => {
        if (li !== target) {
          const sm = li.querySelector(".sub-menu");
          if (sm) sm.classList.add("hidden");
        }
      });
    }
    // サブメニューをトグル
    const childUL = target.querySelector("ul");
    if (childUL) {
      childUL.classList.toggle("hidden");
    }
    // 選択状態クリア
    leftMenuEl.querySelectorAll("li").forEach(li => li.classList.remove("selected"));

    // 最下層項目(data-item)がクリックされた場合
    if (target.hasAttribute("data-item")) {
      target.classList.add("selected");
      const itemKey = target.getAttribute("data-item");
      const catKey = target.closest("li[data-cat]").getAttribute("data-cat");
      // 研修カテゴリ( "3" )の場合は特殊UI
      if (catKey === "3") {
        renderTrainingManageUI(itemKey);
      } else {
        // 通常の表示
        document.getElementById("detail-header").innerText = itemKey;
        document.getElementById("detail-content").innerHTML = `<p>${itemKey}</p>`;
      }
    }
    e.stopPropagation();
  });

  // ----- カレンダー初期表示 -----
  const today = new Date();
  renderGlobalCalendar(today.getFullYear(), today.getMonth(), globalEvents);

  // 前月/翌月ボタン
  document.getElementById("prev-month-global").addEventListener("click", () => {
    const titleText = document.getElementById("global-calendar-title").textContent;
    const parts = titleText.split(" - ");
    let year = parseInt(parts[2]);
    let month = JP_MONTHS.indexOf(parts[0]);
    month--;
    if (month < 0) {
      month = 11; 
      year--;
    }
    renderGlobalCalendar(year, month, globalEvents);
  });
  document.getElementById("next-month-global").addEventListener("click", () => {
    const titleText = document.getElementById("global-calendar-title").textContent;
    const parts = titleText.split(" - ");
    let year = parseInt(parts[2]);
    let month = JP_MONTHS.indexOf(parts[0]);
    month++;
    if (month > 11) {
      month = 0; 
      year++;
    }
    renderGlobalCalendar(year, month, globalEvents);
  });

  // ----- 今月の予定一覧 -----
  renderScheduleList();

  // ----- モーダルの外側クリックで閉じる処理 -----
  document.getElementById("training-detail-modal").addEventListener("click", (evt) => {
    if (evt.target.id === "training-detail-modal") {
      closeTrainingDetail();
    }
  });
  document.getElementById("day-events-modal").addEventListener("click", (evt) => {
    if (evt.target.id === "day-events-modal") {
      closeDayEventsModal();
    }
  });
  document.getElementById("event-detail-modal").addEventListener("click", (evt) => {
    if (evt.target.id === "event-detail-modal") {
      closeEventDetailModal();
    }
  });
  document.getElementById("month-all-events-modal").addEventListener("click", (evt) => {
    if (evt.target.id === "month-all-events-modal") {
      closeMonthAllEventsModal();
    }
  });
});

/*************************************************
  今月の予定一覧
   - 画面には2カラム(最大10件)を表示
   - 「今月の予定一覧」という見出しをクリック -> 全件モーダルで表示
*************************************************/
function renderScheduleList() {
  const scheduleListEl = document.getElementById("schedule-list");

  // タイトル+h3を表示し、クリックで全リストモーダル
  let html = `<h3 id="month-list-title" style="cursor:pointer;">今月の予定一覧</h3>
              <div id="month-list-content"></div>`;
  scheduleListEl.innerHTML = html;

  // 見出しクリック -> 今月全件モーダル
  document.getElementById("month-list-title").addEventListener("click", openMonthAllEventsModal);

  // 今月のイベントを抽出
  const today = new Date();
  const y = today.getFullYear();
  const m = ("0" + (today.getMonth() + 1)).slice(-2);
  const monthStr = `${y}-${m}`;

  let monthEvents = globalEvents.filter(e => e.dueDate.startsWith(monthStr));
  if (monthEvents.length === 0) {
    document.getElementById("month-list-content").innerHTML = "<p>今月の予定はありません。</p>";
    return;
  }

  // ソート(優先度 -> 日付)
  monthEvents.sort((a, b) => {
    const prioA = getEventPriority(a);
    const prioB = getEventPriority(b);
    if (prioA !== prioB) return prioA - prioB;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  // 上位10件
  const top10 = monthEvents.slice(0, 10);
  const leftover = (monthEvents.length > 10) ? (monthEvents.length - 10) : 0;

  const col1 = top10.slice(0, 5);
  const col2 = top10.slice(5);

  let contentHTML = `<div class="month-schedule-container">
                       <ul class="month-schedule-col">`;
  // 左5行
  col1.forEach(ev => {
    const line = `${getEventCircle(ev)} ${ev.dueDate} - ${ev.title}`;
    contentHTML += `
      <li onclick="clickScheduleItem('${ev.dueDate}')"
          title="クリックでこの日の予定一覧が開きます">
        ${line}
      </li>`;
  });
  // 足りない分
  for (let i = col1.length; i < 5; i++) {
    contentHTML += `<li class="empty-slot"></li>`;
  }
  contentHTML += `</ul><ul class="month-schedule-col">`;
  // 右5行
  col2.forEach((ev, idx) => {
    if (idx === 4 && leftover > 0) {
      contentHTML += `<li>他 ${leftover}件の予定あり</li>`;
    } else {
      const line = `${getEventCircle(ev)} ${ev.dueDate} - ${ev.title}`;
      contentHTML += `
        <li onclick="clickScheduleItem('${ev.dueDate}')"
            title="クリックでこの日の予定一覧が開きます">
          ${line}
        </li>`;
    }
  });
  if (col2.length < 5) {
    for (let i = col2.length; i < 5; i++) {
      if (i === 4 && leftover > 0) {
        contentHTML += `<li>他 ${leftover}件の予定あり</li>`;
      } else {
        contentHTML += `<li class="empty-slot"></li>`;
      }
    }
  }
  contentHTML += `</ul></div>`;

  document.getElementById("month-list-content").innerHTML = contentHTML;
}

/*************************************************
  「今月の予定一覧」見出しをクリック -> 今月全予定をモーダルで表示
*************************************************/
function openMonthAllEventsModal() {
  const today = new Date();
  const y = today.getFullYear();
  const m = ("0" + (today.getMonth() + 1)).slice(-2);
  const monthStr = `${y}-${m}`;

  let monthEvents = globalEvents.filter(e => e.dueDate.startsWith(monthStr));
  if (monthEvents.length === 0) {
    alert("今月の予定はありません。");
    return;
  }

  // ソート(優先度 -> 日付)
  monthEvents.sort((a, b) => {
    const prioA = getEventPriority(a);
    const prioB = getEventPriority(b);
    if (prioA !== prioB) return prioA - prioB;
    return new Date(a.dueDate) - new Date(b.dueDate);
  });

  let html = `<h2>${y}年${parseInt(m)}月 全予定一覧</h2>`;
  monthEvents.forEach(ev => {
    const line = `${getEventCircle(ev)} ${ev.dueDate} - ${ev.title}`;
    html += `
      <div class="day-event-item">
        ${line}
        <button class="detail-btn" onclick="openEventDetailModal(${ev.event_id})">詳細</button>
      </div>`;
  });

  document.getElementById("month-all-events-content").innerHTML = html;
  document.getElementById("month-all-events-modal").style.display = "block";
}
function closeMonthAllEventsModal() {
  document.getElementById("month-all-events-modal").style.display = "none";
}

/*************************************************
  カレンダー関連
*************************************************/
const JP_MONTHS = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
const EN_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function formatDate(date) {
  const y = date.getFullYear();
  const m = ("0" + (date.getMonth() + 1)).slice(-2);
  const d = ("0" + date.getDate()).slice(-2);
  return `${y}-${m}-${d}`;
}

/** カレンダー表示 */
function renderGlobalCalendar(year, month, events) {
  const calEl = document.getElementById("big-calendar");
  const titleEl = document.getElementById("global-calendar-title");
  titleEl.textContent = `${JP_MONTHS[month]} - ${EN_MONTHS[month]} - ${year}`;

  if (calEl) {
    calEl.innerHTML = generateCalendar(year, month, events);
    // 日セルクリック -> day-events-modal
    document.querySelectorAll(".calendar-cell").forEach(cell => {
      cell.addEventListener("click", () => {
        const dateStr = cell.getAttribute("data-date");
        if (!dateStr) return;
        const dayEvents = events.filter(e => e.dueDate === dateStr);
        if (dayEvents.length === 0) return;
        openDayEventsModal(dateStr, dayEvents);
      });
    });
  }
}

/** カレンダーhtml生成 */
function generateCalendar(year, month, events) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month+1, 0);
  const firstWeekDay = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const weekDays = ["日","月","火","水","木","金","土"];

  let html = "<thead><tr>";
  weekDays.forEach(d => {
    html += `<th>${d}</th>`;
  });
  html += "</tr></thead><tbody>";

  let currentDay = 1;
  const weeksCount = Math.ceil((firstWeekDay + totalDays) / 7);

  for (let w = 0; w < weeksCount; w++) {
    html += "<tr>";
    for (let d = 0; d < 7; d++) {
      const cellIdx = w*7 + d;
      if (cellIdx < firstWeekDay || currentDay > totalDays) {
        html += "<td></td>";
      } else {
        const dateObj = new Date(year, month, currentDay);
        const dateStr = formatDate(dateObj);
        const dayEvents = events.filter(e => e.dueDate === dateStr);

        let cellContent = `<div class="calendar-date">${currentDay}</div>`;
        // 4行まで表示
        dayEvents.forEach((ev, idx) => {
          if (idx === 3 && dayEvents.length > 4) {
            const left = dayEvents.length - 3;
            cellContent += `<div class="event-item small-calendar-font">その他${left}件</div>`;
            return;
          }
          if (idx < 4) {
            cellContent += `<div class="event-item small-calendar-font">
                              ${getEventCircle(ev)}${truncateTitle(ev.title)}
                            </div>`;
          }
        });

        html += `<td class="calendar-cell" data-date="${dateStr}">${cellContent}</td>`;
        currentDay++;
      }
    }
    html += "</tr>";
  }

  html += "</tbody>";
  return html;
}

/** タイトルを6文字程度で省略 */
function truncateTitle(txt) {
  if (txt.length > 6) {
    return txt.slice(0,6) + "…";
  }
  return txt;
}

/*************************************************
  イベント表示用
  - getEventCircle(ev): 〇色分け
  - getEventPriority(ev): ソート用
*************************************************/
function getEventCircle(ev) {
  if (ev.status === "完了") {
    return `<span class="circle circle-green">●</span>`;
  }
  const due = new Date(ev.dueDate + "T00:00:00");
  const now = new Date();
  const diff = (due - now)/(1000*3600*24);

  if (diff < 0) return `<span class="circle blinking-red">●</span>`;
  if (diff < 7) return `<span class="circle circle-red">●</span>`;
  return `<span class="circle circle-yellow">●</span>`;
}

function getEventPriority(ev) {
  if (ev.status === "完了") return 4; // 完了
  const now = new Date();
  const due = new Date(ev.dueDate + "T00:00:00");
  const diff = (due - now)/(1000*3600*24);
  if (diff < 0) return 1; // 過ぎてる
  if (diff < 7) return 2; // < 1週間
  return 3;               // それ以外
}

/*************************************************
  日別イベント一覧モーダル
*************************************************/
function openDayEventsModal(dateStr, dayEvents) {
  let html = `<h3>${dateStr}の予定</h3>`;
  dayEvents.forEach(ev => {
    const line = `${getEventCircle(ev)} ${ev.dueDate} - ${ev.title}`;
    html += `
      <div class="day-event-item">
        ${line}
        <button class="detail-btn" onclick="openEventDetailModal(${ev.event_id})">詳細</button>
      </div>
    `;
  });
  document.getElementById("day-events-content").innerHTML = html;
  document.getElementById("day-events-modal").style.display = "block";
}
function closeDayEventsModal() {
  document.getElementById("day-events-modal").style.display = "none";
}

/*************************************************
  イベント詳細モーダル
  - training イベントなら frequency(実施回数)を表示
  - 3チェック必須 + 次回の予定日
*************************************************/
function openEventDetailModal(eventId) {
  const ev = globalEvents.find(x => x.event_id === eventId);
  if (!ev) {
    alert("イベントが見つかりません。");
    return;
  }

  let html = `<h2>イベント詳細</h2>`;
  html += `<p>【ID】${ev.event_id}</p>`;
  html += `<p>【タイトル】${ev.title}</p>`;
  html += `<p>【ステータス】${ev.status}</p>`;
  html += `<p>【予定日】${ev.dueDate}</p>`;

  // もし研修( event_type=='training' )で、training_detailsがあれば frequencyを表示
  if ((ev.type === "training" || ev.event_type === "training") && globalTrainingData[ev.title]) {
    let freq = globalTrainingData[ev.title].frequency || "";
    if (freq) {
      html += `<p>【実施回数】${freq}</p>`;
    }
  }

  // 次回の予定日を自動計算
  let nextDate = "";
  if ((ev.type === "training" || ev.event_type === "training") && globalTrainingData[ev.title]) {
    const freq = globalTrainingData[ev.title].frequency || "";
    nextDate = computeNextDate(ev.dueDate, freq);
  }

  html += `
    <div style="border:1px solid #ccc; padding:10px; margin:10px 0;">
      <p>完了するには以下のチェックが必須:</p>
      <label>次回の予定日:
        <input type="date" id="next-schedule-date" value="${nextDate}">
      </label>
      <br><br>
      <label><input type="checkbox" class="complete-checkbox"> 必要な資料の作成</label><br>
      <label><input type="checkbox" class="complete-checkbox"> 参加者全員の報告書</label><br>
      <label><input type="checkbox" class="complete-checkbox"> 次回の予定入力</label><br>
      <button id="complete-btn" class="green-btn" disabled>予定を完了する</button>
    </div>
    <div style="border:1px solid #ccc; padding:10px; margin:10px 0;">
      <p><strong>予定日を変更する:</strong></p>
      <input type="date" id="new-event-date" value="${ev.dueDate}">
      <button id="update-date-btn">変更</button>
    </div>
    <div style="border:1px solid #ccc; padding:10px; margin:10px 0;">
      <button id="delete-event-btn" class="red-btn">予定を削除する</button>
    </div>
  `;

  document.getElementById("event-detail-content").innerHTML = html;
  document.getElementById("event-detail-modal").style.display = "block";

  // 全チェックで完了ボタン活性化
  const cbs = document.querySelectorAll(".complete-checkbox");
  const completeBtn = document.getElementById("complete-btn");
  cbs.forEach(cb => {
    cb.addEventListener("change", () => {
      const allChecked = [...cbs].every(x => x.checked);
      completeBtn.disabled = !allChecked;
    });
  });

  // 予定を完了する
  completeBtn.addEventListener("click", () => {
    fetch("/complete_event", {
      method: "POST",
      body: new URLSearchParams({id: ev.event_id})
    })
    .then(r => r.text())
    .then(msg => {
      if (msg === "success") {
        alert("完了にしました。");
        location.reload(); // ページ再読み込みで連動反映
      } else {
        alert("エラー: " + msg);
      }
    })
    .catch(err => {
      alert("完了処理に失敗: " + err);
    });
  });

  // 予定日変更
  document.getElementById("update-date-btn").addEventListener("click", () => {
    const newDate = document.getElementById("new-event-date").value;
    if (!newDate) {
      alert("日付が空です。");
      return;
    }
    fetch("/update_event", {
      method: "POST",
      body: new URLSearchParams({id: ev.event_id, new_date: newDate})
    })
    .then(r => r.text())
    .then(msg => {
      if (msg === "success") {
        alert("予定日を変更しました。");
        location.reload();
      } else {
        alert("エラー: " + msg);
      }
    })
    .catch(err => {
      alert("予定日の変更に失敗: " + err);
    });
  });

  // 予定を削除する
  document.getElementById("delete-event-btn").addEventListener("click", () => {
    if (!confirm("本当に削除しますか？")) return;
    fetch("/delete_event", {
      method: "POST",
      body: new URLSearchParams({id: ev.event_id})
    })
    .then(r => r.text())
    .then(msg => {
      if (msg === "success") {
        alert("削除しました。");
        location.reload();
      } else {
        alert("エラー: " + msg);
      }
    })
    .catch(err => {
      alert("削除に失敗: " + err);
    });
  });
}

function closeEventDetailModal() {
  document.getElementById("event-detail-modal").style.display = "none";
}

/** frequencyから次回予定日を計算 ("年2回"なら6ヶ月、それ以外は12ヶ月) */
function computeNextDate(baseDateStr, freq) {
  const base = new Date(baseDateStr + "T00:00:00");
  if (freq.includes("年2回")) {
    base.setMonth(base.getMonth() + 6);
  } else {
    base.setFullYear(base.getFullYear() + 1);
  }
  return formatDate(base);
}

/*************************************************
  研修・訓練 管理
*************************************************/
const trainingOrder = [
  "災害に係る業務継続計画(BCP)_研修",
  "災害に係る業務継続計画(BCP)_訓練",
  "感染症に係る業務継続計画(BCP)_研修",
  "感染症に係る業務継続計画(BCP)_訓練",
  "虐待防止_研修",
  "身体拘束適正化_研修",
  "安全計画に関する研修",
  "安全計画に関する訓練",
  "消防訓練_防災訓練"
];
const committeeOrder = [
  "地域連携推進_会議",
  "虐待防止_委員会",
  "身体拘束適正化_委員会",
  "感染症に係る業務継続計画(BCP)_見直し",
  "災害に係る業務継続計画(BCP)_見直し",
  "ハラスメント(セクハラ)対策_委員会",
  "ハラスメント(パワハラ)対策_委員会"
];

/**
 * 研修メニュー選択時のUI構築
 */
function renderTrainingManageUI(itemKey) {
  let filteredItems = {};

  // 研修・訓練
  if (itemKey === "資料の策定と作成" || itemKey === "実施予定日の設定と記録") {
    for (let title in globalTrainingData) {
      const t = globalTrainingData[title].type;
      if (t === "研修" || t === "訓練") {
        filteredItems[title] = globalTrainingData[title];
      }
    }
  }
  // 見直し・委員会・会議
  else if (itemKey === "課題・議題の策定と記録") {
    for (let title in globalTrainingData) {
      const t = globalTrainingData[title].type;
      if (t === "計画の見直し" || t === "委員会" || t === "会議") {
        filteredItems[title] = globalTrainingData[title];
      }
    }
  }

  let titles = Object.keys(filteredItems);

  // ソート(既定の順序)
  if (itemKey === "資料の策定と作成" || itemKey === "実施予定日の設定と記録") {
    titles.sort((a,b) => {
      const idxA = trainingOrder.indexOf(a);
      const idxB = trainingOrder.indexOf(b);
      const realA = (idxA === -1)?9999:idxA;
      const realB = (idxB === -1)?9999:idxB;
      return realA - realB;
    });
  } else if (itemKey === "課題・議題の策定と記録") {
    titles.sort((a,b) => {
      const idxA = committeeOrder.indexOf(a);
      const idxB = committeeOrder.indexOf(b);
      const realA = (idxA === -1)?9999:idxA;
      const realB = (idxB === -1)?9999:idxB;
      return realA - realB;
    });
  }

  // 一覧HTMLを生成
  let html = `<div id="training-list-container">`;
  for (let i = 0; i < titles.length; i++) {
    const title = titles[i];
    const data = filteredItems[title];

    let label = title;
    if (data.deductionRisk === "該当") {
      label += ` <span class="red-text">←減算対象</span>`;
    }
    // status連動
    let statusHTML = "";
    if (data.status === "完了") {
      statusHTML = `<span class="status complete">【完了】</span>`;
    } else {
      if (data.plannedDate) {
        statusHTML = `<span class="status incomplete">未完了(${data.plannedDate}実施予定)</span>`;
      } else {
        statusHTML = `<span class="status incomplete">未完了(予定なし)</span>`;
      }
    }

    html += `
      <div class="training-item-box" data-title="${title}" data-mode="${itemKey}">
        <div class="training-item-header">
          <div class="training-item-title">${label}</div>
          <div class="training-item-status">${statusHTML}</div>
        </div>
      </div>
    `;
  }
  html += `</div>`;

  let headerText = itemKey;
  if (itemKey === "資料の策定と作成") {
    headerText = "資料の策定と作成（研修・訓練）";
  } else if (itemKey === "実施予定日の設定と記録") {
    headerText = "実施予定日の設定と記録（研修・訓練）";
  } else if (itemKey === "課題・議題の策定と記録") {
    headerText = "課題・議題の策定と記録（見直し・委員会・会議）";
  }

  // 表示
  document.getElementById("detail-header").innerText = headerText;
  document.getElementById("detail-content").innerHTML = html;

  // 各アイテムクリック -> モーダル
  document.querySelectorAll(".training-item-box").forEach(box => {
    box.addEventListener("click", () => {
      const title = box.getAttribute("data-title");
      const mode = box.getAttribute("data-mode");
      const info = globalTrainingData[title] || {};
      showTrainingModal(title, info, mode);
    });
  });
}

/**
 * 研修・訓練モーダルを表示
 */
function showTrainingModal(title, data, mode) {
  let modalHTML = `<h2>${title}</h2>`;
  modalHTML += `<p><strong>種類:</strong> ${data.type || ""}</p>`;
  modalHTML += `<p><strong>頻度:</strong> ${data.frequency || ""}</p>`;
  modalHTML += `<p><strong>参加者:</strong> ${data.participants ? data.participants.join("、") : ""}</p>`;

  modalHTML += `<h3>詳細内容</h3>`;
  if (data.sections) {
    modalHTML += "<ul>";
    for (let k in data.sections) {
      modalHTML += `<li><strong>${k}:</strong> ${data.sections[k]}</li>`;
    }
    modalHTML += "</ul>";
  }

  if (mode === "資料の策定と作成") {
    // 資料作成ガイド
    modalHTML += `<h3>資料作成ガイド</h3>`;
    if (data.manualGuide && typeof data.manualGuide === "object") {
      if (data.manualGuide.tableOfContents) {
        modalHTML += `<div style="margin:10px 0; padding:8px; background:#f7f7ff;">
                        <h4>マニュアル作成の目次</h4>`;
        data.manualGuide.tableOfContents.forEach((toc, idx) => {
          modalHTML += `
            <div style="border:1px solid #ccc; margin:5px 0; padding:5px;">
              <strong>${idx+1}. ${toc.題名||""}</strong><br>
              <em>要約:</em> ${toc.要約||""}<br>
              <pre style="white-space:pre-wrap; font-size:90%;">${toc.詳細や注釈||""}</pre>
            </div>
          `;
        });
        modalHTML += `</div>`;
      }
    } else if (typeof data.manualGuide === "string") {
      modalHTML += `<p>${data.manualGuide}</p>`;
    } else {
      modalHTML += `<p>資料作成ガイドはありません。</p>`;
    }
    // ダウンロードテンプレ
    const docLink = data.ManualTemplate
      ? `/static/sample/${data.ManualTemplate}`
      : "/static/sample/sample.docx";
    modalHTML += `
      <h4>サンプルファイル(Word)</h4>
      <p>※このマニュアルは施設に合わせて修正してください。</p>
      <a href="${docLink}" download>ダウンロード</a>
    `;
  }
  else if (mode === "実施予定日の設定と記録") {
    // 予定日の設定フォーム
    modalHTML += `
      <h3>実施予定日の設定</h3>
      <form id="planned-date-form">
        <input type="hidden" name="title" value="${title}">
        <label class="planned-date-label">実施予定日:</label><br>
        <input type="date" name="planned_date" class="planned-date-input" value="${data.plannedDate||""}">
        <button type="submit" style="margin-left:10px;">保存</button>
      </form>
      <hr/>

      <h3>ファイルアップロード</h3>
      <form id="modal-upload-form" action="/upload_record" method="POST" enctype="multipart/form-data">
        <label for="modal-record-file">ファイルを選択:</label>
        <input type="file" name="record-file" id="modal-record-file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx">
        <button type="submit">アップロード</button>
      </form>
      <hr/>
      <button id="view-records-btn">記録ファイル一覧を見る</button>
      <div id="record-files-list" style="margin:10px 0;"></div>

      <h4>記録表テンプレート(Word)</h4>
    `;
    const recordLink = data.DocTemplate
      ? `/static/sample/${data.DocTemplate}`
      : "/static/sample/sample_record.docx";
    modalHTML += `
      <a href="${recordLink}" download>記録表をダウンロード</a>

      <hr/>
      <h3>記録入力フォーム</h3>
      <form id="record-input-form" style="width:100%; max-width:800px;">
        <div style="margin-bottom:10px;">
          <label>研修・訓練などの名称:</label><br>
          <input type="text" name="training_name" value="${title}" readonly style="width:100%;">
        </div>
        <div style="margin-bottom:10px;">
          <label>実施日時:</label><br>
          <input type="date" name="date" style="width:200px;">
        </div>
        <div style="margin-bottom:10px;">
          <label>場所:</label><br>
          <input type="text" name="location" style="width:100%;">
        </div>
        <div style="margin-bottom:10px;">
          <label>講師の氏名:</label><br>
          <input type="text" name="instructor" style="width:100%;">
        </div>
        <div style="margin-bottom:10px;">
          <label>研修・訓練内容:</label><br>
          <input type="text" name="auto_content" style="width:100%;" value="">
        </div>
        <div style="margin-bottom:10px;">
          <label>内容の評価:</label><br>
          <input type="number" name="score" min="0" max="100" style="width:80px;"> 点 / 100点
        </div>
        <div style="margin-bottom:10px;">
          <label>感想:</label><br>
          <textarea name="impressions" rows="2" style="width:100%;"></textarea>
        </div>
        <div style="margin-bottom:10px;">
          <label>所属:</label><br>
          <input type="text" name="affiliation" style="width:100%;">
        </div>
        <div style="margin-bottom:10px;">
          <label>氏名:</label><br>
          <input type="text" name="user_name" style="width:100%;">
        </div>

        <button type="submit">記録を保存</button>
      </form>
    `;
  }
  else if (mode === "課題・議題の策定と記録") {
    modalHTML += `
      <h3>課題・議題の策定</h3>
      <p>見直し・委員会・会議の内容を追加できます。</p>

      <h3>ファイルアップロード</h3>
      <form action="/upload_record" method="POST" enctype="multipart/form-data">
        <label>ファイル選択:
          <input type="file" name="record-file" accept=".pdf,.doc,.docx,.jpg,.png">
        </label>
        <button type="submit">アップロード</button>
      </form>
      <hr/>
      <button id="view-records-btn">記録ファイル一覧を見る</button>
      <div id="record-files-list" style="margin:10px 0;"></div>
    `;
  }

  // モーダル表示
  document.getElementById("training-detail-content").innerHTML = modalHTML;
  document.getElementById("training-detail-modal").style.display = "block";

  // 実施予定日の保存処理
  if (mode === "実施予定日の設定と記録") {
    const plannedDateForm = document.getElementById("planned-date-form");
    if (plannedDateForm) {
      plannedDateForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const fd = new FormData(plannedDateForm);
        const postData = {
          title: fd.get("title"),
          planned_date: fd.get("planned_date")
        };
        fetch("/update_planned_date", {
          method: "POST",
          body: new URLSearchParams(postData)
        })
        .then(r => r.text())
        .then(updated => {
          alert("実施予定日を更新しました: " + updated);
          location.reload();
        })
        .catch(err => {
          console.error(err);
          alert("予定日の更新に失敗しました。");
        });
      });
    }
  }
}

/** 研修モーダル閉じる */
function closeTrainingDetail() {
  document.getElementById("training-detail-modal").style.display = "none";
}
