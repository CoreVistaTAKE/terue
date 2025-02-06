/***********************************************************
 * メニュー生成・動作
 ***********************************************************/
function buildMenuHTML(menuData) {
  let html = '<ul>';
  for (let cat in menuData) {
    let catData = menuData[cat];
    // 大分類：表示はタイトルのみ（"大分類"は不要）
    html += `<li data-cat="${cat}"><span class="menu-title">${catData.title}</span>`;
    if (catData.sub) {
      // 中分類は初期状態で隠す
      html += '<ul class="sub-menu hidden">';
      for (let sub in catData.sub) {
        html += `<li data-sub="${sub}"><span class="sub-title">${sub}</span>`;
        if (catData.sub[sub].items) {
          // 項目一覧も初期状態で隠す
          html += '<ul class="item-menu hidden">';
          for (let item in catData.sub[sub].items) {
            html += `<li data-item="${item}">${item}</li>`;
          }
          html += '</ul>';
        }
        html += '</li>';
      }
      html += '</ul>';
    }
    html += '</li>';
  }
  html += '</ul>';
  return html;
}

document.addEventListener("DOMContentLoaded", function() {
  const leftMenuEl = document.getElementById("left-menu");
  leftMenuEl.innerHTML = buildMenuHTML(menuData);

  // クリックイベントの委任
  leftMenuEl.addEventListener("click", function(e) {
    let target = e.target;
    if (target.tagName === "SPAN") {
      target = target.parentElement;
    }
    // 大分類の場合：閉じる他の大分類の展開
    if (target.hasAttribute("data-cat")) {
      leftMenuEl.querySelectorAll("li[data-cat]").forEach(li => {
        if (li !== target) {
          let subMenu = li.querySelector(".sub-menu");
          if (subMenu) subMenu.classList.add("hidden");
        }
      });
    }
    // トグル表示：子リストがあれば（sub-menuまたはitem-menu）
    let childUL = target.querySelector("ul");
    if (childUL) {
      childUL.classList.toggle("hidden");
    }
    // すべての li の選択状態解除
    leftMenuEl.querySelectorAll("li").forEach(li => li.classList.remove("selected"));
    
    // 最終項目（data-item）がクリックされた場合のみ選択状態にする
    if (target.hasAttribute("data-item")) {
      target.classList.add("selected");
      // 取得：大分類、sub、中分類、項目
      const catKey = target.closest("li[data-cat]").getAttribute("data-cat");
      const subKey = target.closest("li[data-sub]").getAttribute("data-sub");
      const itemKey = target.getAttribute("data-item");
      let detailText = menuData[catKey].sub[subKey].items[itemKey];
      // 選択項目の詳細は detail-section に表示
      document.getElementById("detail-section").innerHTML =
        `<h2>${itemKey}</h2><p>${detailText}</p>`;
    }
    e.stopPropagation();
  });
});

/***********************************************************
 * カレンダー関連
 ***********************************************************/
function parseDate(yyyy_mm_dd) {
  const parts = yyyy_mm_dd.split("-");
  return new Date(parts[0], parts[1] - 1, parts[2]);
}
function formatDate(date) {
  const y = date.getFullYear();
  const m = ("0" + (date.getMonth() + 1)).slice(-2);
  const d = ("0" + date.getDate()).slice(-2);
  return `${y}-${m}-${d}`;
}
function getDayDiff(fromDate, toDate) {
  return Math.floor((toDate - fromDate) / (1000 * 60 * 60 * 24));
}
function getEventCircleClass(ev) {
  if (ev.status === "完了") return "circle-completed";
  const diff = getDayDiff(new Date(), parseDate(ev.dueDate));
  if (diff < 0) return "circle-overdue";
  if (diff <= 7) return "circle-warning";
  return "circle-pending";
}
function generateCalendar(year, month, events) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstWeekDay = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
  let html = "<thead><tr>";
  weekDays.forEach(day => { html += `<th>${day}</th>`; });
  html += "</tr></thead><tbody>";
  let currentDay = 1;
  const weeksCount = Math.ceil((firstWeekDay + totalDays) / 7);
  for (let w = 0; w < weeksCount; w++) {
    html += "<tr>";
    for (let d = 0; d < 7; d++) {
      let cellIndex = w * 7 + d;
      if (cellIndex < firstWeekDay || currentDay > totalDays) {
        html += `<td></td>`;
      } else {
        const dateObj = new Date(year, month, currentDay);
        const dateStr = formatDate(dateObj);
        const dayEvents = events.filter(ev => ev.dueDate === dateStr);
        const onclickAttr = dayEvents.length > 0 ? ` onclick="openDayModal('${dateStr}')" ` : "";
        html += `<td${onclickAttr}>`;
        html += `<div class="calendar-date">${currentDay}</div>`;
        if (dayEvents.length > 0) {
          if (dayEvents.length > 4) {
            for (let i = 0; i < 3; i++) {
              let ev = dayEvents[i];
              let circleClass = getEventCircleClass(ev);
              html += `<div class="event-item"><span class="event-circle ${circleClass}"></span>${ev.title}</div>`;
            }
            let others = dayEvents.length - 3;
            html += `<div class="event-item">他${others}件</div>`;
          } else {
            dayEvents.forEach(ev => {
              let circleClass = getEventCircleClass(ev);
              html += `<div class="event-item"><span class="event-circle ${circleClass}"></span>${ev.title}</div>`;
            });
          }
        }
        html += `</td>`;
        currentDay++;
      }
    }
    html += "</tr>";
  }
  html += "</tbody>";
  return html;
}
function renderCalendar(year, month) {
  const bigCalendarEl = document.getElementById("big-calendar");
  const titleEl = document.getElementById("main-calendar-title");
  const jpNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  const enNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  titleEl.textContent = `${jpNames[month]} - ${enNames[month]} - ${year}`;
  if (bigCalendarEl) {
    bigCalendarEl.innerHTML = generateCalendar(year, month, eventData);
  }
}
function renderMonthlySchedule(year, month) {
  const monthlyEl = document.getElementById("monthly-schedule");
  if (!monthlyEl) return;
  const mm = ("0" + (month + 1)).slice(-2);
  const monthStr = `${year}-${mm}`;
  let monthlyEvents = eventData.filter(ev => ev.dueDate.startsWith(monthStr));
  monthlyEvents.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  let leftCol = monthlyEvents.slice(0, 5);
  let rightCol = monthlyEvents.slice(5, 10);
  if (monthlyEvents.length >= 11) {
    let others = monthlyEvents.length - 9;
    rightCol = monthlyEvents.slice(5, 9);
    rightCol.push({ summary: `他${others}件` });
  }
  let html = '<div class="col" id="left-col">';
  leftCol.forEach(ev => {
    let circle = `<span class="event-circle ${getEventCircleClass(ev)}"></span>`;
    html += `<div class="row" onclick="openMonthlyModal('${ev.dueDate}')">${circle}${ev.dueDate} - ${ev.title}</div>`;
  });
  html += '</div><div class="col" id="right-col">';
  rightCol.forEach(ev => {
    if (ev.summary) {
      html += `<div class="row" onclick="openMonthlyModal()">${ev.summary}</div>`;
    } else {
      let circle = `<span class="event-circle ${getEventCircleClass(ev)}"></span>`;
      html += `<div class="row" onclick="openMonthlyModal('${ev.dueDate}')">${circle}${ev.dueDate} - ${ev.title}</div>`;
    }
  });
  html += '</div>';
  monthlyEl.innerHTML = html;
}

/***********************************************************
 * モーダル関連
 ***********************************************************/
function openDayModal(dateStr) {
  const dayEvents = eventData.filter(ev => ev.dueDate === dateStr);
  let modalList = document.getElementById("day-modal-list");
  let modalTitle = document.getElementById("day-modal-title");
  modalTitle.textContent = `${dateStr} の予定`;
  let html = "";
  if (dayEvents.length === 0) {
    html = "<p>当日の予定はありません。</p>";
  } else {
    dayEvents.forEach(ev => {
      html += `<div class="modal-row">
                 <span class="modal-title">${ev.title}</span>
                 <button class="detail-btn" onclick="event.stopPropagation();openDetailModal('${ev.event_id}')">詳細</button>
               </div>`;
    });
  }
  modalList.innerHTML = html;
  document.getElementById("day-modal").style.display = "block";
}
function closeDayModal() {
  document.getElementById("day-modal").style.display = "none";
}
function openMonthlyModal(dateStr) {
  const modal = document.getElementById("monthly-modal");
  const listEl = document.getElementById("monthly-list");
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const mm = ("0" + (month + 1)).slice(-2);
  const monthStr = `${year}-${mm}`;
  let monthlyEvents = eventData.filter(ev => ev.dueDate.startsWith(monthStr));
  monthlyEvents.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  let html = "";
  monthlyEvents.forEach(ev => {
    html += `<div class="modal-row">
               <span class="modal-title">${ev.dueDate} - ${ev.title}</span>
               <button class="detail-btn" onclick="event.stopPropagation();openDetailModal('${ev.event_id}')">詳細</button>
             </div>`;
  });
  listEl.innerHTML = html;
  modal.style.display = "block";
}
function closeMonthlyModal() {
  document.getElementById("monthly-modal").style.display = "none";
}
function openDetailModal(eventId) {
  alert("イベント詳細へ遷移: " + eventId);
}

/***********************************************************
 * 前月・翌月ボタン処理＆初期描画
 ***********************************************************/
document.addEventListener("DOMContentLoaded", function() {
  const today = new Date();
  let currentYear = today.getFullYear();
  let currentMonth = today.getMonth();
  renderCalendar(currentYear, currentMonth);
  renderMonthlySchedule(currentYear, currentMonth);
  document.getElementById("prev-month").addEventListener("click", function() {
    currentMonth--;
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    renderCalendar(currentYear, currentMonth);
    renderMonthlySchedule(currentYear, currentMonth);
  });
  document.getElementById("next-month").addEventListener("click", function() {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
    renderCalendar(currentYear, currentMonth);
    renderMonthlySchedule(currentYear, currentMonth);
  });
});
