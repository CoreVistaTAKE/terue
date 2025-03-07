/********************************************
  Block #1: グローバル変数 & メニュー定義
   - globalEvents, globalTrainingData
   - menuData
********************************************/

/*************************************************
  グローバル変数
*************************************************/
let globalEvents = [];
let globalTrainingData = {};

/*************************************************
  メニュー定義
*************************************************/
/**
 * 大分類:
 *   "support"    => 運営サポート
 *   "daily"      => 日々・都度の入力
 *   "documents"  => 運営書類一覧と保存
 *
 * 画像:
 *   support  => /static/icons/menu1.svg
 *   daily    => /static/icons/menu2.svg
 *   documents=> /static/icons/menu3.svg
 */
const menuData = {
  "support": {
    "title": "運営サポート",  // 実際は画像で表示
    "sub": {
      "staffOps": {
        "title": "スタッフ業務",
        "items": {
          "業務で困った時": ""
        }
      },
      "managerSabi": {
        "title": "管理者・サビ管業務",
        "items": {
          "運営で困った時": ""
        }
      }
    }
  },
  "daily": {
    "title": "日々・都度の入力",
    "sub": {
      "staffOps": {
        "title": "スタッフ業務",
        "sub": {
          "dailyInput": {
            "title": "日誌等毎日入力",
            "items": {
              "業務日誌・サービス提供記録": "既存(ブロック4)",
              "事故・苦情等の報告": "",
              "ヒヤリハットの報告": ""
            }
          }
        }
      },
      "managerOps": {
        "title": "管理者業務",
        "sub": {
          "facility": {
            "title": "施設情報",
            "items": {
              "施設情報": "既存(ブロック4)",
              "利用者情報": "既存(ブロック4)"
            }
          },
          "training": {
            "title": "研修・訓練等",
            "items": {
              "資料の策定と作成": "既存(ブロック4)",
              "実施予定日の設定と記録": "既存(ブロック4)",
              "課題・議題の策定と記録": "既存(ブロック4)"
            }
          }
        }
      }
    }
  },
  "documents": {
    "title": "運営書類一覧と保存",
    "sub": {
      "managerOps": {
        "title": "管理者業務",
        "sub": {
          "serviceRecords": {
            "title": "サービス提供・支援記録",
            "items": {
              "サービス提供記録票": "",
              "サービス担当者会議の記録": ""
            }
          },
          "laborDocs": {
            "title": "人事・労務関連書類",
            "items": {
              "職員（従業者）の勤務状況が確認できる書類": "",
              "勤務予定実績表（勤務形態一覧表）": "",
              "従業者の給与の支払いが確認できる書類": "",
              "平均利用者数調書（平均利用者数計算シート）": "",
              "従業者の健康状態の把握が確認できる書類": "",
              "職員（従業者）の雇用状況等が確認できる書類": "",
              "従業者の資格証": "",
              "従業者の守秘義務が確認できる書類": ""
            }
          },
          "managementDocs": {
            "title": "運営・基本管理書類",
            "items": {
              "運営規程": "",
              "各種対応マニュアル": "",
              "預り金等管理規程": "",
              "事業所のパンフレット": "",
              "指定申請書・変更届出書": "",
              "集団研修の資料": "",
              "協力医療機関との契約書、連携記録書": "",
              "非常災害対策に関する書類": ""
            }
          },
          "contractDocs": {
            "title": "契約・利用者関連・請求書類",
            "items": {
              "重要事項説明書・利用契約書・同意書（３点セット）": "",
              "受給者証の写し": "",
              "契約内容報告書の写し": "",
              "法定代理受領通知": "",
              "請求書・領収証": "",
              "介護給付費等の明細書の写し": "",
              "各種加算の算定根拠資料": ""
            }
          },
          "financeDocs": {
            "title": "財務・保険関連",
            "items": {
              "会計書類（BS、PL）": "",
              "事業者賠償責任の保険証券": ""
            }
          }
        }
      },
      "sabikanOps": {
        "title": "サービス管理責任者業務",
        "sub": {
          "assessment": {
            "title": "アセスメント等",
            "items": {
              "アセスメント・個人支援計画書・モニタリングの記録": ""
            }
          }
        }
      }
    }
  }
};

/********************************************
  Block #2: メニュー構築関連関数
   - buildMenuHTML()
   - buildItemListHTML()
   - determineItemClass()
********************************************/

function buildMenuHTML(menuData) {
  let html = "<ul>";
  for (let catKey in menuData) {
    const cat = menuData[catKey];

    // 大分類の画像 (幅100%)
    let iconPath = "";
    if (catKey === "support") {
      iconPath = "/static/icons/menu1.svg";
    } else if (catKey === "daily") {
      iconPath = "/static/icons/menu2.svg";
    } else if (catKey === "documents") {
      iconPath = "/static/icons/menu3.svg";
    }

    // 大分類タイトルを <img> で置き換え
    // クリック範囲を広げるため width=100%, height:auto
    let catTitleHTML = `<img src="${iconPath}" alt="${cat.title}" style="width:100%; height:auto;">`;

    // 大分類LI (cat-support, cat-daily, cat-documents等)
    html += `
      <li data-cat="${catKey}" class="cat-${catKey}">
        <span class="menu-title">${catTitleHTML}</span>
    `;

    // 直下に items があれば
    if (cat.items) {
      html += `<ul class="sub-menu hidden">`;
      html += buildItemListHTML(cat.items, catKey);
      html += `</ul>`;
    }

    // sub があれば (中分類/小分類)
    if (cat.sub) {
      html += `<ul class="sub-menu hidden">`;
      for (let subKey in cat.sub) {
        const sub = cat.sub[subKey];
        html += `
          <li data-sub="${subKey}">
            <span class="sub-title">${sub.title}</span>
        `;

        // sub の下に sub(sub) がある(小分類)
        if (sub.sub) {
          html += `<ul class="item-menu hidden">`;
          for (let s2Key in sub.sub) {
            const s2 = sub.sub[s2Key];
            html += `
              <li data-sub="${s2Key}">
                <span class="sub-title">${s2.title}</span>
            `;
            if (s2.items) {
              html += `<ul class="item-menu hidden">`;
              for (let itemKey in s2.items) {
                const itemClass = determineItemClass(itemKey, catKey);
                html += `<li data-item="${itemKey}" class="${itemClass}">${itemKey}</li>`;
              }
              html += `</ul>`;
            }
            html += `</li>`;
          }
          html += `</ul>`;
        }
        // sub.items があれば(小分類なしに直接items)
        else if (sub.items) {
          html += `<ul class="item-menu hidden">`;
          for (let itemKey in sub.items) {
            const itemClass = determineItemClass(itemKey, catKey);
            html += `<li data-item="${itemKey}" class="${itemClass}">${itemKey}</li>`;
          }
          html += `</ul>`;
        }

        html += `</li>`;
      }
      html += `</ul>`;
    }

    html += `</li>`; // 大分類
  }
  html += "</ul>";
  return html;
}

function buildItemListHTML(items, topCat) {
  let html = "";
  for (let itemKey in items) {
    const itemClass = determineItemClass(itemKey, topCat);
    html += `<li data-item="${itemKey}" class="${itemClass}">${itemKey}</li>`;
  }
  return html;
}

/** 必要なら(ス)/(管)/(サビ管)等のクラス付与 */
function determineItemClass(itemName, topCat) {
  return "";
}


/********************************************
  Block #3: DOMContentLoaded時のメイン初期処理
   - メニュークリックイベント
   - カレンダー初期表示
   - 前月・翌月ボタン設定
   - 今月の予定一覧表示
   - モーダル外側クリック制御
********************************************/

document.addEventListener("DOMContentLoaded", () => {
  const leftMenuEl = document.getElementById("left-menu");
  leftMenuEl.innerHTML = buildMenuHTML(menuData);

  // イベント & 研修データをHTML内の<script id="event-data">などから取得
  globalEvents = JSON.parse(document.getElementById("event-data").textContent);
  globalTrainingData = JSON.parse(document.getElementById("training-data").textContent);

  // メニューのクリック動作 (画像クリックでも大分類が展開するように)
  leftMenuEl.addEventListener("click", (e) => {
    e.preventDefault();
    let target = e.target;

    // ▼ クリック位置が <img> 等の場合でも大分類 <li> を確実に取得する
    while (target && !(
      target.hasAttribute("data-cat") ||
      target.hasAttribute("data-sub") ||
      target.hasAttribute("data-item")
    )) {
      target = target.parentElement;
    }
    // ターゲットが無ければ中断
    if (!target) return;

    // 大分類を開閉
    if (target.hasAttribute("data-cat")) {
      // 他の大分類を閉じる
      leftMenuEl.querySelectorAll("li[data-cat]").forEach(li => {
        if (li !== target) {
          li.querySelectorAll(".sub-menu").forEach(sub => sub.classList.add("hidden"));
        }
      });
      // 自分のサブメニューをトグル
      target.querySelectorAll(".sub-menu").forEach(sub => sub.classList.toggle("hidden"));
    }

    // 中分類
    if (target.hasAttribute("data-sub")) {
      const childUL = target.querySelector(".item-menu");
      if (childUL) {
        childUL.classList.toggle("hidden");
      }
    }

    // 選択クラスの付け外し
    leftMenuEl.querySelectorAll("li").forEach(li => li.classList.remove("selected"));

    // data-item がクリックされた → handleMenuItemClick
    if (target.hasAttribute("data-item")) {
      target.classList.add("selected");
      const itemKey = target.getAttribute("data-item");
      handleMenuItemClick(itemKey);
    }
    e.stopPropagation();
  });

  // カレンダー初期表示 (例)
  const today = new Date();
  renderGlobalCalendar(today.getFullYear(), today.getMonth(), globalEvents);

  // 前月/翌月
  document.getElementById("prev-month-global").addEventListener("click", () => {
    const titleText = document.getElementById("global-calendar-title").textContent;
    const parts = titleText.split(" - ");
    let year = parseInt(parts[2]);
    let month = JP_MONTHS.indexOf(parts[0]);
    month--;
    if (month < 0) { month = 11; year--; }
    renderGlobalCalendar(year, month, globalEvents);
  });
  document.getElementById("next-month-global").addEventListener("click", () => {
    const titleText = document.getElementById("global-calendar-title").textContent;
    const parts = titleText.split(" - ");
    let year = parseInt(parts[2]);
    let month = JP_MONTHS.indexOf(parts[0]);
    month++;
    if (month > 11) { month = 0; year++; }
    renderGlobalCalendar(year, month, globalEvents);
  });

  // 今月の予定一覧
  renderScheduleList();

  // モーダル外側クリックで閉じる
  document.getElementById("training-detail-modal").addEventListener("click", (evt) => {
    if (evt.target.id === "training-detail-modal") closeTrainingDetail();
  });
  document.getElementById("day-events-modal").addEventListener("click", (evt) => {
    if (evt.target.id === "day-events-modal") closeDayEventsModal();
  });
  document.getElementById("event-detail-modal").addEventListener("click", (evt) => {
    if (evt.target.id === "event-detail-modal") closeEventDetailModal();
  });
  document.getElementById("month-all-events-modal").addEventListener("click", (evt) => {
    if (evt.target.id === "month-all-events-modal") closeMonthAllEventsModal();
  });
});

function handleMenuItemClick(itemKey) {
  // 右側を上部にスクロール
  document.querySelector('.main-content').scrollTop = 0;

  /********************************************
    Block #4:
  ********************************************/
  // 1) スタッフ業務 => 業務日誌・サービス提供記録
  if (itemKey === "業務日誌・サービス提供記録") {
    openDailyReportMenu();
    return;
  }

  // 2) 研修・訓練等 (3項目)
  if (itemKey === "資料の策定と作成" ||
      itemKey === "実施予定日の設定と記録" ||
      itemKey === "課題・議題の策定と記録") {
    renderTrainingMenu(itemKey);
    return;
  }

  // 施設情報
  if (itemKey === "施設情報") {
    openFacilityInfoOverview();
    return;
  }

  // 利用者情報
  if (itemKey === "利用者情報") {
    // まず利用者一覧を表示
    openUserList();
    return;
  }

  // それ以外 -> 単なる説明表示
  const detailHeader = document.getElementById("detail-header");
  const detailContent = document.getElementById("detail-content");
  detailHeader.innerText = itemKey;
  detailContent.innerHTML = `<p>${itemKey}</p>`;
}

/*************************************************
  Block #4a: (管)施設情報
 * 施設情報(読み取り専用)を表示
 * - 登録が無ければ「未登録」と表示
 * - 右上に「登録・修正」ボタンを置き、フォーム画面へ遷移
 */
function openFacilityInfoOverview() {
  const dh = document.getElementById("detail-header");
  const dc = document.getElementById("detail-content");

  dh.innerText = "施設情報";
  dc.innerHTML = "<p>読み込み中...</p>";

  fetch("/facility_info")
    .then(r => r.json())
    .then(d => {
      // HTML組み立て: 
      // 右上「登録・修正(青ボタン)」 → openFacilityInfoForm() でフォームへ
      let html = `
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:15px;">
          <h2 style="margin:0; font-size:1.3rem;">施設情報</h2>
          <button style="background:#007bff; color:#fff; border:none; padding:8px 16px; border-radius:4px; font-weight:bold;"
                  onclick="openFacilityInfoForm()">
            登録・修正
          </button>
        </div>
      `;

      if (!d.id) {
        // 未登録
        html += `
          <p style="color:red;">施設情報は未登録です。<br>
          「登録・修正」ボタンから入力してください。</p>
        `;
      } else {
        // 登録済データを読み取り専用で表示
        html += `
          <div style="border:2px solid #ccc; padding:10px; border-radius:6px;">
            <p><strong>施設種類:</strong> ${d.facility_type || ""}</p>
            <p><strong>施設利用者数:</strong> ${d.capacity || ""}</p>
            <p><strong>施設名:</strong> ${d.facility_name || ""}</p>
            <p><strong>事業所番号:</strong> ${d.facility_number || ""}</p>
            <p><strong>住所:</strong> ${d.address || ""}</p>
            <p><strong>電話番号:</strong> ${d.phone || ""}</p>
            <p><strong>FAX番号:</strong> ${d.fax || ""}</p>
            <p><strong>管理者名:</strong> ${d.manager_name || ""}</p>
            <p><strong>管理者電話:</strong> ${d.manager_phone || ""}</p>
            <p><strong>管理者連絡方法:</strong> ${d.manager_contact || ""}</p>
            <p><strong>サビ管名:</strong> ${d.sabikan_name || ""}</p>
            <p><strong>サビ管電話:</strong> ${d.sabikan_phone || ""}</p>
            <p><strong>サビ管連絡方法:</strong> ${d.sabikan_contact || ""}</p>
          </div>
        `;
      }

      dc.innerHTML = html;
    })
    .catch(err => {
      console.error(err);
      dc.innerHTML = `<p style="color:red;">読み込みエラー: ${err}</p>`;
    });
}

/**
 * 「登録・修正」ボタンを押すと呼ばれる施設情報フォーム
 * - 既存データがあれば初期フォームに反映
 */
function openFacilityInfoForm() {
  const dh = document.getElementById("detail-header");
  const dc = document.getElementById("detail-content");
  dh.innerText = "施設情報の入力（登録・修正）";

  // 入力フォーム
  let html = `
    <h3>施設情報</h3>
    <div style="margin:5px 0;">
      <label class="report-label">施設種類:</label>
      <input type="text" id="fac-type" placeholder="例:共同生活援助">
    </div>
    <div style="margin:5px 0;">
      <label class="report-label">施設利用者数:</label>
      <input type="number" id="fac-capacity" placeholder="例:6">
    </div>
    <div style="margin:5px 0;">
      <label class="report-label">施設名:</label>
      <input type="text" id="fac-name" placeholder="例:グループホームXXXX">
    </div>
    <div style="margin:5px 0;">
      <label class="report-label">事業所番号:</label>
      <input type="text" id="fac-number" placeholder="例:0000000000">
    </div>
    <div style="margin:5px 0;">
      <label class="report-label">住所:</label>
      <input type="text" id="fac-address" placeholder="例:000-0000 XX市XX1丁目1番1号" style="width:70%;">
    </div>
    <div style="margin:5px 0;">
      <label class="report-label">電話番号:</label>
      <input type="text" id="fac-phone" placeholder="00-0000-0000">
    </div>
    <div style="margin:5px 0;">
      <label class="report-label">FAX番号:</label>
      <input type="text" id="fac-fax" placeholder="00-0000-0001">
    </div>
    <div style="margin:5px 0;">
      <label class="report-label">管理者名:</label>
      <input type="text" id="fac-manager" placeholder="例:支援 太郎">
    </div>
    <div style="margin:5px 0;">
      <label class="report-label">管理者電話:</label>
      <input type="text" id="fac-manager-phone" placeholder="000-0000-0000">
    </div>
    <div style="margin:5px 0;">
      <label class="report-label">管理者連絡方法:</label>
      <input type="text" id="fac-manager-contact" placeholder="緊急時はLINE電話、電話等" style="width:70%;">
    </div>
    <div style="margin:5px 0;">
      <label class="report-label">サビ管名:</label>
      <input type="text" id="fac-sabikan" placeholder="例:支援 二郎">
    </div>
    <div style="margin:5px 0;">
      <label class="report-label">サビ管電話:</label>
      <input type="text" id="fac-sabikan-phone" placeholder="000-0000-0000">
    </div>
    <div style="margin:5px 0;">
      <label class="report-label">サビ管連絡方法:</label>
      <input type="text" id="fac-sabikan-contact" placeholder="基本LINE等、緊急時はLINE電話、電話等" style="width:70%;">
    </div>
    <button onclick="saveFacilityInfo()">保存</button>
    <button style="margin-left:15px;" onclick="openFacilityInfoOverview()">戻る</button>
  `;

  dc.innerHTML = html;

  // 既存データがあればフォームに反映
  fetch("/facility_info")
    .then(r => r.json())
    .then(d => {
      if (!d.id) return; // 未登録なら何もしない

      document.getElementById("fac-type").value = d.facility_type || "";
      document.getElementById("fac-capacity").value = d.capacity || "";
      document.getElementById("fac-name").value = d.facility_name || "";
      document.getElementById("fac-number").value = d.facility_number || "";
      document.getElementById("fac-address").value = d.address || "";
      document.getElementById("fac-phone").value = d.phone || "";
      document.getElementById("fac-fax").value = d.fax || "";
      document.getElementById("fac-manager").value = d.manager_name || "";
      document.getElementById("fac-manager-phone").value = d.manager_phone || "";
      document.getElementById("fac-manager-contact").value = d.manager_contact || "";
      document.getElementById("fac-sabikan").value = d.sabikan_name || "";
      document.getElementById("fac-sabikan-phone").value = d.sabikan_phone || "";
      document.getElementById("fac-sabikan-contact").value = d.sabikan_contact || "";
    })
    .catch(err => console.error(err));
}

/**
 * フォームの「保存」ボタン処理
 */
function saveFacilityInfo(){
  const fd = new FormData();
  fd.append("facility_type", document.getElementById("fac-type").value);
  fd.append("capacity",      document.getElementById("fac-capacity").value);
  fd.append("facility_name", document.getElementById("fac-name").value);
  fd.append("facility_number", document.getElementById("fac-number").value);
  fd.append("address", document.getElementById("fac-address").value);
  fd.append("phone",   document.getElementById("fac-phone").value);
  fd.append("fax",     document.getElementById("fac-fax").value);
  fd.append("manager_name",  document.getElementById("fac-manager").value);
  fd.append("manager_phone", document.getElementById("fac-manager-phone").value);
  fd.append("manager_contact", document.getElementById("fac-manager-contact").value);
  fd.append("sabikan_name", document.getElementById("fac-sabikan").value);
  fd.append("sabikan_phone",document.getElementById("fac-sabikan-phone").value);
  fd.append("sabikan_contact",document.getElementById("fac-sabikan-contact").value);

  fetch("/save_facility_info", { method:"POST", body:fd })
    .then(r => r.text())
    .then(msg => {
      alert("施設情報を保存しました。");
      // 保存後、読み取り専用画面に戻す
      openFacilityInfoOverview();
    })
    .catch(err => {
      console.error(err);
      alert("エラー: " + err);
    });
}

/*************************************************
// Block #4b1: openUserList, deleteUserConfirm
*************************************************/

/** 利用者一覧を表示 */
function openUserList() {
  const detailHeader = document.getElementById("detail-header");
  const detailContent = document.getElementById("detail-content");

  if(!detailHeader || !detailContent){
    console.error("detailHeader/detailContent がHTMLに存在しません。");
    return;
  }

  detailHeader.innerText = "利用者登録・一覧";
  detailContent.innerHTML = "<p>読み込み中...</p>";

  fetch("/api/users")
    .then(r => {
      if(!r.ok){
        throw new Error("HTTP Error " + r.status);
      }
      return r.json();
    })
    .then(users => {
      let html = `
        <h2 style="font-size:1.5rem; margin-bottom:15px;">利用者登録・一覧</h2>
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:15px;">
          <h3 style="margin:0; font-weight:bold;">利用者登録</h3>
          <button style="background:#007bff; color:#fff; border:none; padding:8px 16px; border-radius:4px; font-weight:bold;"
                  onclick="openUserInfoForm()">
            利用者新規登録
          </button>
        </div>
        <h3 style="margin-bottom:10px; font-weight:bold;">利用者一覧</h3>
        <div style="border:2px solid #ccc; padding:10px; border-radius:6px;">
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="border-bottom:2px solid #ccc;">
                <th style="width:60px; padding:6px;">ID</th>
                <th style="width:180px; padding:6px;">利用者名</th>
                <th style="width:120px; padding:6px;">状態</th>
                <th style="width:200px; padding:6px;">操作</th>
              </tr>
            </thead>
            <tbody>
      `;

      // ID順でソート
      users.sort((a,b) => a.id - b.id);

      for(const u of users){
        let statusLabel = "入居中";
        if(u.contract_end && u.contract_end.trim() !== ""){
          statusLabel = "退居済";
        }
        html += `
          <tr style="border-bottom:1px solid #eee;">
            <td style="padding:6px;">${u.id}</td>
            <td style="padding:6px;">${u.name||"(未登録)"}</td>
            <td style="padding:6px;">${statusLabel}</td>
            <td style="padding:6px;">
              <button style="background:#007bff; color:#fff; padding:4px 8px; border:none; border-radius:3px;"
                      onclick="openUserEditForm(${u.id})">
                確認・修正
              </button>
              <button style="background:#cc3333; color:#fff; border:none; border-radius:3px; margin-left:6px;"
                      onclick="deleteUserConfirm(${u.id})">
                削除
              </button>
            </td>
          </tr>
        `;
      }

      html += `
            </tbody>
          </table>
        </div>
      `;
      detailContent.innerHTML = html;
    })
    .catch(err => {
      console.error(err);
      detailContent.innerHTML = `<p style="color:red;">読み込みエラー:${err}</p>`;
    });
}

/** 削除ボタン -> ユーザ削除 */
function deleteUserConfirm(uid){
  const ok = confirm("本当に削除してよろしいですか？");
  if(!ok) return;

  const fd = new FormData();
  fd.append("user_id", uid);

  fetch("/delete_user", {method:"POST", body:fd})
    .then(r=>r.text())
    .then(msg=>{
      if(msg==="ok"){
        alert("削除しました。");
        openUserList();
      } else {
        alert("削除失敗: " + msg);
      }
    })
    .catch(err=>{
      alert("エラー:" + err);
    });
}

/** フィールドセット折り畳み */
function toggleFieldset(id){
  const fs = document.getElementById(id);
  if(!fs) return;
  if(fs.classList.contains("open")){
    fs.classList.remove("open");
    fs.classList.add("closed");
    const icon = fs.querySelector(".fold-icon");
    if(icon) icon.textContent = "▶";
  } else {
    fs.classList.remove("closed");
    fs.classList.add("open");
    const icon = fs.querySelector(".fold-icon");
    if(icon) icon.textContent = "▼";
  }
}


/*************************************************
// Block #4b2: openUserInfoForm (和暦対応/枠1〜11)
*************************************************/

/** 利用者情報フォーム*/
function openUserInfoForm(){
  const dh = document.getElementById("detail-header");
  const dc = document.getElementById("detail-content");

  if(!dh || !dc){
    console.error("detail-header/detail-content が存在しません。");
    return;
  }

  dh.innerText = "利用者情報の入力";

  // ▼ ここで画面を一括描画
  dc.innerHTML = `
    <h3>利用者情報</h3>
    <input type="hidden" id="u-id" value="">


    <!-- ★枠1: 基本情報 -->
    <fieldset id="fs1" class="collapsible open">
      <legend onclick="toggleFieldset('fs1')">
        【枠1】基本情報 <span class="fold-icon">▼</span>
      </legend>
      <div class="fieldset-content">
        <div class="form-row">
          <label>氏名:</label>
          <input type="text" id="u-name" size="30" placeholder="例:日本 太郎">
        </div>
        <div class="form-row">
          <label>フリガナ:</label>
          <input type="text" id="u-furigana" size="30" placeholder="例:ニホン タロウ">
        </div>
        <div class="form-row">
          <label>性別:</label>
          <label><input type="radio" name="u-gender" value="男性" checked>男性</label>
          <label><input type="radio" name="u-gender" value="女性">女性</label>
        </div>
        <div class="form-row">
          <label>生年月日:</label>
          <!-- 和暦(昭和/平成/令和) + 半角数字(年/月/日) -->
          <select id="u-birthday-era">
            <option value="昭和">昭和</option>
            <option value="平成">平成</option>
            <option value="令和" selected>令和</option>
          </select>
          <input type="text" id="u-birthday-year" size="3" placeholder="4"
                 oninput="this.value=this.value.replace(/[^0-9]/g,'');">
          <label>年</label>
          <input type="text" id="u-birthday-month" size="2" placeholder="5"
                 oninput="this.value=this.value.replace(/[^0-9]/g,'');">
          <label>月</label>
          <input type="text" id="u-birthday-day" size="2" placeholder="3"
                 oninput="this.value=this.value.replace(/[^0-9]/g,'');">
          <label>日</label>
        </div>
        <div class="form-row">
          <label>年齢:</label>
          <input type="number" id="u-age" style="width:60px;">
        </div>
        <div class="form-row">
          <label>住所:</label>
          <input type="text" id="u-address" style="width:80%;">
        </div>
        <div class="form-row">
          <label>電話:</label>
          <input type="text" id="u-phone" size="14">
        </div>
        <div class="form-row">
          <label>メール:</label>
          <input type="text" id="u-email" size="30">
        </div>
      </div>
    </fieldset>


    <!-- ★枠2:個別支援計画 -->
    <fieldset id="fs2" class="collapsible closed">
      <legend onclick="toggleFieldset('fs2')">
        【枠2】個別支援計画 <span class="fold-icon">▶</span>
      </legend>
      <div class="fieldset-content">
        <div class="form-row">
          <label>長期目標:</label><br>
          <textarea id="u-longgoal" rows="2" style="width:90%;"></textarea>
        </div>
        <hr>
        <label><input type="checkbox" id="u-shortGoal1-check" onchange="toggleShortGoal('1')">短期目標①</label>
        <div id="u-shortGoal1-block" style="display:none; margin-left:20px;">
          <input type="text" id="u-shortGoal1" style="width:90%;"><br>
          <label>具体的支援①:</label><br>
          <textarea id="u-shortSupport1" rows="2" style="width:90%;"></textarea>
        </div>
        <hr>
        <label><input type="checkbox" id="u-shortGoal2-check" onchange="toggleShortGoal('2')">短期目標②</label>
        <div id="u-shortGoal2-block" style="display:none; margin-left:20px;">
          <input type="text" id="u-shortGoal2" style="width:90%;"><br>
          <label>具体的支援②:</label><br>
          <textarea id="u-shortSupport2" rows="2" style="width:90%;"></textarea>
        </div>
        <hr>
        <label><input type="checkbox" id="u-shortGoal3-check" onchange="toggleShortGoal('3')">短期目標③</label>
        <div id="u-shortGoal3-block" style="display:none; margin-left:20px;">
          <input type="text" id="u-shortGoal3" style="width:90%;"><br>
          <label>具体的支援③:</label><br>
          <textarea id="u-shortSupport3" rows="2" style="width:90%;"></textarea>
        </div>
        <hr>
        <label><input type="checkbox" id="u-shortGoal4-check" onchange="toggleShortGoal('4')">短期目標④</label>
        <div id="u-shortGoal4-block" style="display:none; margin-left:20px;">
          <input type="text" id="u-shortGoal4" style="width:90%;"><br>
          <label>具体的支援④:</label><br>
          <textarea id="u-shortSupport4" rows="2" style="width:90%;"></textarea>
        </div>
        <hr>
        <label><input type="checkbox" id="u-shortGoal5-check" onchange="toggleShortGoal('5')">短期目標⑤</label>
        <div id="u-shortGoal5-block" style="display:none; margin-left:20px;">
          <input type="text" id="u-shortGoal5" style="width:90%;"><br>
          <label>具体的支援⑤:</label><br>
          <textarea id="u-shortSupport5" rows="2" style="width:90%;"></textarea>
        </div>
      </div>
    </fieldset>


    <!-- ★枠3:収入・緊急連絡先 -->
    <fieldset id="fs3" class="collapsible closed">
      <legend onclick="toggleFieldset('fs3')">
        【枠3】収入・緊急連絡先 <span class="fold-icon">▶</span>
      </legend>
      <div class="fieldset-content">
        <div style="margin:4px 0;">
          <label>収入種別:</label>
          <label><input type="radio" name="u-income" value="生活保護" checked>生活保護</label>
          <label><input type="radio" name="u-income" value="低所得">非課税世帯</label>
          <label><input type="radio" name="u-income" value="一般1">一般1</label>
          <label><input type="radio" name="u-income" value="一般2">一般2</label>
        </div>
        <div style="margin:4px 0;">
          <label>金銭管理:</label>
          <input type="text" id="u-money-manager" style="width:250px;">
        </div>
        <hr>
        <div style="margin:4px 0;">
          <label>緊急連絡先1:</label><br>
          <input type="text" id="u-emerg1-relation" style="width:300px;" placeholder="(関係)">
          <input type="text" id="u-emerg1-name" style="width:150px;" placeholder="(氏名)">
          <input type="text" id="u-emerg1-phone" style="width:150px;" placeholder="(電話)">
        </div>
        <div style="margin:4px 0;">
          <label>緊急連絡先2:</label><br>
          <input type="text" id="u-emerg2-relation" style="width:300px;" placeholder="(関係)">
          <input type="text" id="u-emerg2-name" style="width:150px;" placeholder="(氏名)">
          <input type="text" id="u-emerg2-phone" style="width:150px;" placeholder="(電話)">
        </div>
        <div style="margin:4px 0;">
          <label>緊急連絡先3:</label><br>
          <input type="text" id="u-emerg3-relation" style="width:300px;" placeholder="(関係)">
          <input type="text" id="u-emerg3-name" style="width:150px;" placeholder="(氏名)">
          <input type="text" id="u-emerg3-phone" style="width:150px;" placeholder="(電話)">
        </div>
      </div>
    </fieldset>


    <!-- ★枠4: 支援施設契約情報 -->
    <fieldset id="fs4" class="collapsible closed">
      <legend onclick="toggleFieldset('fs4')">
        【枠4】支援施設契約情報 <span class="fold-icon">▶</span>
      </legend>
      <div class="fieldset-content">
        <div class="form-row">
          <label>施設名:</label>
          <input type="text" id="u-fac-name" size="30">
        </div>
        <div class="form-row">
          <label>サービス名:</label>
          <input type="text" id="u-service-name" size="30">
        </div>
        <div class="form-row">
          <label>事業所番号:</label>
          <input type="text" id="u-fac-number" size="10">
        </div>
        <div class="form-row">
          <label>住所:</label>
          <input type="text" id="u-fac-addr" style="width:80%;">
        </div>
        <div class="form-row">
          <label>電話番号:</label>
          <input type="text" id="u-fac-phone" size="14">
        </div>
        <div class="form-row">
          <label>FAX:</label>
          <input type="text" id="u-fac-fax" size="14">
        </div>
        <hr>
        <div style="margin:4px 0;">
          <label>契約開始日:</label>
          <!-- 和暦 + 半角数字 -->
          <select id="u-contract-start-era">
            <option value="昭和">昭和</option>
            <option value="平成">平成</option>
            <option value="令和" selected>令和</option>
          </select>
          <input type="text" id="u-contract-start-year" size="3" placeholder="4"
                 oninput="this.value=this.value.replace(/[^0-9]/g,'');">
          <label>年</label>
          <input type="text" id="u-contract-start-month" size="2" placeholder="5"
                 oninput="this.value=this.value.replace(/[^0-9]/g,'');">
          <label>月</label>
          <input type="text" id="u-contract-start-day" size="2" placeholder="3"
                 oninput="this.value=this.value.replace(/[^0-9]/g,'');">
          <label>日</label>
        </div>
        <div style="margin:4px 0;">
          <label><input type="checkbox" id="u-contract-end-check" onchange="toggleContractEnd()">契約終了日</label>
          <div id="contract-end-block" style="display:none; margin-left:20px; margin-top:4px;">
            <!-- 和暦 + 半角数字 -->
            <select id="u-contract-end-era">
              <option value="昭和">昭和</option>
              <option value="平成">平成</option>
              <option value="令和" selected>令和</option>
            </select>
            <input type="text" id="u-contract-end-year" size="3" placeholder="8"
                   oninput="this.value=this.value.replace(/[^0-9]/g,'');">
            <label>年</label>
            <input type="text" id="u-contract-end-month" size="2" placeholder="12"
                   oninput="this.value=this.value.replace(/[^0-9]/g,'');">
            <label>月</label>
            <input type="text" id="u-contract-end-day" size="2" placeholder="31"
                   oninput="this.value=this.value.replace(/[^0-9]/g,'');">
            <label>日</label>
          </div>
        </div>
        <br>
        <div style="margin:4px 0;">
          <label>担当スタッフと役割:</label>
          <input type="text" id="u-staff-roles" style="width:80%;">
        </div>
      </div>
    </fieldset>


    <!-- ★枠5 (受給者情報) -->
    <fieldset id="fs5" class="collapsible closed">
      <legend onclick="toggleFieldset('fs5')">
        【枠5】受給者情報 <span class="fold-icon">▶</span>
      </legend>
      <div class="fieldset-content">
        <div class="form-row">
          <label>受給者番号:</label>
          <input type="text" id="u-recipient" size="10">
        </div>
        <div class="form-row">
          <label>支援区分:</label>
          <input type="text" id="u-shien-kubun" size="5">
        </div>
        <div class="form-row">
          <label>区分有効(開始):</label>
          <!-- 和暦 + 半角数字 -->
          <select id="u-shien-start-era">
            <option value="昭和">昭和</option>
            <option value="平成">平成</option>
            <option value="令和" selected>令和</option>
          </select>
          <input type="text" id="u-shien-start-year" size="3" placeholder="4"
                 oninput="this.value=this.value.replace(/[^0-9]/g,'');">
          <label>年</label>
          <input type="text" id="u-shien-start-month" size="2" placeholder="5"
                 oninput="this.value=this.value.replace(/[^0-9]/g,'');">
          <label>月</label>
          <input type="text" id="u-shien-start-day" size="2" placeholder="3"
                 oninput="this.value=this.value.replace(/[^0-9]/g,'');">
          <label>日</label>
        </div>
        <div class="form-row" style="margin-top:6px;">
          <label>区分有効(終了):</label>
          <!-- 和暦 + 半角数字 -->
          <select id="u-shien-end-era">
            <option value="昭和">昭和</option>
            <option value="平成">平成</option>
            <option value="令和" selected>令和</option>
          </select>
          <input type="text" id="u-shien-end-year" size="3" placeholder="8"
                 oninput="this.value=this.value.replace(/[^0-9]/g,'');">
          <label>年</label>
          <input type="text" id="u-shien-end-month" size="2" placeholder="12"
                 oninput="this.value=this.value.replace(/[^0-9]/g,'');">
          <label>月</label>
          <input type="text" id="u-shien-end-day" size="2" placeholder="31"
                 oninput="this.value=this.value.replace(/[^0-9]/g,'');">
          <label>日</label>
        </div>
      </div>
    </fieldset>


    <!-- ★枠6 (病院・訪問情報) -->
    <fieldset id="fs6" class="collapsible closed">
      <legend onclick="toggleFieldset('fs6')">
        【枠6】病院・訪問情報 <span class="fold-icon">▶</span>
      </legend>
      <div class="fieldset-content">
        <div class="form-row">
          <label>障害等級/手帳:</label>
          <input type="text" id="u-handbook" style="width:80%;">
        </div>
        <hr>
        <div>
          <label><input type="checkbox" id="u-hospital1-check" onchange="toggleHospital('1')">病院1</label>
        </div>
        <div id="hospital1-block" style="display:none; margin-left:20px;">
          <input type="text" id="u-hospital1" size="30">
          <br>
          <label>服薬情報1:</label><br>
          <textarea id="u-medicine1" rows="2" style="width:80%;"></textarea>
        </div>
        <hr>
        <div>
          <label><input type="checkbox" id="u-hospital2-check" onchange="toggleHospital('2')">病院2</label>
        </div>
        <div id="hospital2-block" style="display:none; margin-left:20px;">
          <input type="text" id="u-hospital2" size="30">
          <br>
          <label>服薬情報2:</label><br>
          <textarea id="u-medicine2" rows="2" style="width:80%;"></textarea>
        </div>
        <hr>
        <div>
          <label><input type="checkbox" id="u-hospital3-check" onchange="toggleHospital('3')">病院3</label>
        </div>
        <div id="hospital3-block" style="display:none; margin-left:20px;">
          <input type="text" id="u-hospital3" size="30">
          <br>
          <label>服薬情報3:</label><br>
          <textarea id="u-medicine3" rows="2" style="width:80%;"></textarea>
        </div>
        <hr>
        <div class="form-row">
          <label>既往症:</label>
          <input type="text" id="u-previous-illness" style="width:70%;">
        </div>
        <hr>
        <div class="form-row">
          <label>訪問看護:</label>
          <input type="text" id="u-visiting-nurse" size="30">
        </div>
        <div style="margin:4px 0;">
          <label>曜日時間:</label>
          <input type="text" id="u-visiting-nurse-schedule" size="30">
        </div>
        <hr>
        <div class="form-row">
          <label>訪問歯科:</label>
          <input type="text" id="u-visiting-dentist" size="30">
        </div>
        <div style="margin:4px 0;">
          <label>曜日時間:</label>
          <input type="text" id="u-visiting-dentist-schedule" size="30">
        </div>
        <hr>
        <div style="margin:4px 0;">
          <label>体調不良時の特別処理:</label><br>
          <textarea id="u-special-care" rows="2" style="width:80%;"></textarea>
        </div>
      </div>
    </fieldset>

    <!-- ★枠7 -->
    <fieldset id="fs7" class="collapsible closed">
      <legend onclick="toggleFieldset('fs7')">
        【枠7】相談支援員・通所情報 <span class="fold-icon">▶</span>
      </legend>
      <div class="fieldset-content">
        <div>
          <label>相談支援員:</label>
          <input type="text" id="u-counselor" size="30">
        </div>
        <hr>
        ${createCommuteBlock(1)}
        ${createCommuteBlock(2)}
        ${createCommuteBlock(3)}
        ${createCommuteBlock(4)}
        ${createCommuteBlock(5)}
      </div>
    </fieldset>

    <!-- ★枠8 -->
    <fieldset id="fs8" class="collapsible closed">
      <legend onclick="toggleFieldset('fs8')">
        【枠8】ADL・IADL <span class="fold-icon">▶</span>
      </legend>
      <div class="fieldset-content">
        <div>
          <label>ADL(日常生活動作):</label><br>
          <textarea id="u-adl" rows="2" style="width:90%;"></textarea>
        </div>
        <br>
        <div>
          <label>IADL(手段的日常生活動作):</label><br>
          <textarea id="u-iadl" rows="2" style="width:90%;"></textarea>
        </div>
      </div>
    </fieldset>

    <!-- ★枠9 -->
    <fieldset id="fs9" class="collapsible closed">
      <legend onclick="toggleFieldset('fs9')">
        【枠9】食事 <span class="fold-icon">▶</span>
      </legend>
      <div class="fieldset-content">
        <div>
          <label>食事制限:</label>
          <input type="text" id="u-diet" size="30">
        </div>
        <div style="margin:4px 0;">
          <label>アレルギー:</label>
          <input type="text" id="u-allergies" size="30">
        </div>
        <div style="margin:4px 0;">
          <label>嫌いなもの:</label>
          <input type="text" id="u-dislikes" size="30">
        </div>
      </div>
    </fieldset>

    <!-- ★枠10 -->
    <fieldset id="fs10" class="collapsible closed">
      <legend onclick="toggleFieldset('fs10')">
        【枠10】支援について <span class="fold-icon">▶</span>
      </legend>
      <div class="fieldset-content">
        <div style="margin:4px 0;">
          <label>支援上の注意点①:</label><br>
          <textarea id="u-sup1" rows="2" style="width:90%;"></textarea>
        </div>
        <div style="margin:4px 0;">
          <label>支援上の注意点②:</label><br>
          <textarea id="u-sup2" rows="2" style="width:90%;"></textarea>
        </div>
        <div style="margin:4px 0;">
          <label>支援上の注意点③:</label><br>
          <textarea id="u-sup3" rows="2" style="width:90%;"></textarea>
        </div>
        <div style="margin:4px 0;">
          <label>リスク管理:</label><br>
          <textarea id="u-risk" rows="2" style="width:90%;"></textarea>
        </div>
        <div style="margin:4px 0;">
          <label>パニック時のトリガー①:</label><br>
          <textarea id="u-trigger1" rows="2" style="width:90%;"></textarea>
        </div>
        <div style="margin:4px 0;">
          <label>パニック時のトリガー②:</label><br>
          <textarea id="u-trigger2" rows="2" style="width:90%;"></textarea>
        </div>
        <div style="margin:4px 0;">
          <label>感覚過敏・苦手環境など:</label><br>
          <textarea id="u-sense" rows="2" style="width:90%;"></textarea>
        </div>
      </div>
    </fieldset>

    <!-- ★枠11 -->
    <fieldset id="fs11" class="collapsible closed">
      <legend onclick="toggleFieldset('fs11')">
        【枠11】その他 <span class="fold-icon">▶</span>
      </legend>
      <div class="fieldset-content">
        <div style="margin:4px 0;">
          <label>移動手段:</label>
          <input type="text" id="u-mobility" size="30">
        </div>
        <br>
        <div style="margin:4px 0;">
          <label>これまでの生活歴:</label><br>
          <textarea id="u-history" rows="4" style="width:90%;"></textarea>
        </div>
        <br>
        <div style="margin:4px 0;">
          <label>コミュニケーション手段:</label><br>
          <textarea id="u-comm" rows="2" style="width:90%;"></textarea>
        </div>
        <br>
        <div style="margin:4px 0;">
          <label>趣味・コミュニティ活動:</label>
          <input type="text" id="u-hobby" size="30">
        </div>
        <br>
        <div style="margin:4px 0;">
          <label>好きな事:</label>
          <input type="text" id="u-favorite" size="30">
        </div>
        <br>
        <div style="margin:4px 0;">
          <label>得意なこと:</label>
          <input type="text" id="u-goodat" size="30">
        </div>
        <br>
        <div style="margin:4px 0;">
          <label>苦手なこと:</label><br>
          <textarea id="u-notgood" rows="2" style="width:90%;"></textarea>
        </div>
        <br>
        <div style="margin:4px 0;">
          <label>将来の希望:</label><br>
          <textarea id="u-hope" rows="2" style="width:90%;"></textarea>
        </div>
        <br>
        <div style="margin:4px 0;">
          <label>その他特記事項:</label><br>
          <textarea id="u-other" rows="2" style="width:90%;"></textarea>
        </div>
      </div>
    </fieldset>

    <!-- 保存ボタン -->
    <button style="background:#007bff; color:#fff; padding:8px 16px; border:none; border-radius:4px; font-weight:bold;"
            onclick="saveUserInfo()">
      保存
    </button>
  `;

  // ▼ 通所枠(1〜5) にイベントリスナ付与
  for(let i=1;i<=5;i++){
    const cbox=document.getElementById(`commute${i}-enable`);
    if(cbox){
      cbox.addEventListener("change",()=>{
        const blk=document.getElementById(`commute${i}-block`);
        if(blk) blk.style.display=cbox.checked ? "block":"none";
      });
    }
  }

  // ▼ 枠4自動入力
  fetchFacilityInfo();
}


/** 通所ブロック(1枠) */
function createCommuteBlock(idx){
  return `
    <div style="border:1px solid #ccc; padding:5px; margin:6px 0;">
      <label><input type="checkbox" id="commute${idx}-enable">通所枠${idx}</label>
      <div id="commute${idx}-block" style="display:none; margin-top:5px;">
        <div>
          <label>通所・担当者${idx}:</label>
          <input type="text" id="commute${idx}-place" style="width:50%;">
        </div>
        <div style="margin:4px 0;">
          <label>曜日${idx}:</label>
          <label><input type="checkbox" name="commute${idx}_days" value="月曜">月</label>
          <label><input type="checkbox" name="commute${idx}_days" value="火曜">火</label>
          <label><input type="checkbox" name="commute${idx}_days" value="水曜">水</label>
          <label><input type="checkbox" name="commute${idx}_days" value="木曜">木</label>
          <label><input type="checkbox" name="commute${idx}_days" value="金曜">金</label>
          <label><input type="checkbox" name="commute${idx}_days" value="土曜">土</label>
          <label><input type="checkbox" name="commute${idx}_days" value="日曜">日</label>
          <label><input type="checkbox" name="commute${idx}_days" value="祝日">祝</label>
        </div>
        <div style="margin:4px 0;">
          <label>送迎時間${idx}:</label>
          <input type="text" id="commute${idx}-transit" size="10">
        </div>
        <div style="margin:4px 0;">
          <label>連絡先${idx}:</label>
          <input type="text" id="commute${idx}-phone" size="14">
        </div>
      </div>
    </div>
  `;
}

/** 枠4を自動入力 */
function fetchFacilityInfo(){
  // ここでHTML要素が確実にある前提( openUserInfoForm()後 )
  const facNameEl = document.getElementById("u-fac-name");
  if(!facNameEl){
    console.warn("u-fac-name が存在しません。枠4HTMLが未描画?");
    return;
  }

  fetch("/facility_info")
    .then(r => r.json())
    .then(d => {
      if(!d.id) return;  // 未登録なら何もしない
      // 枠4の各入力欄に反映
      facNameEl.value = d.facility_name   || "";
      const serviceEl = document.getElementById("u-service-name");
      if(serviceEl) serviceEl.value = d.facility_type || "共同生活援助";
      const facNumEl = document.getElementById("u-fac-number");
      if(facNumEl) facNumEl.value = d.facility_number || "";
      const addrEl = document.getElementById("u-fac-addr");
      if(addrEl) addrEl.value = d.address || "";
      const phoneEl = document.getElementById("u-fac-phone");
      if(phoneEl) phoneEl.value = d.phone || "";
      const faxEl = document.getElementById("u-fac-fax");
      if(faxEl) faxEl.value = d.fax || "";
    })
    .catch(err => {
      console.error("fetchFacilityInfoエラー:", err);
    });
}

function toggleShortGoal(num){
  const cbox=document.getElementById(`u-shortGoal${num}-check`);
  const blk=document.getElementById(`u-shortGoal${num}-block`);
  if(!cbox||!blk)return;
  blk.style.display=cbox.checked?"block":"none";
}
function toggleHospital(num){
  const c=document.getElementById(`u-hospital${num}-check`);
  const b=document.getElementById(`hospital${num}-block`);
  if(!c||!b)return;
  b.style.display=c.checked?"block":"none";
}
function toggleContractEnd(){
  const c=document.getElementById("u-contract-end-check");
  const block=document.getElementById("contract-end-block");
  if(!c||!block)return;
  block.style.display=c.checked?"block":"none";
}


/*************************************************
// Block #4b3〜4b4: saveUserInfo() & openUserEditForm
*************************************************/

/** 保存ボタン */
function saveUserInfo(){
  // ★ ID="u-id" が存在しなければエラーを出して中断
  const hiddenEl = document.getElementById("u-id");
  if(!hiddenEl){
    alert("フォームが表示されていません。(u-id要素なし)");
    return;
  }

  const fd=new FormData();
  fd.append("user_id", hiddenEl.value.trim());

  // --- 性別
  let gender="男性";
  const gNodes=document.getElementsByName("u-gender");
  if(gNodes && gNodes.length>0){
    for(const g of gNodes){
      if(g.checked){ gender=g.value; break; }
    }
  }
  fd.append("gender",gender);

  // --- 枠1: 生年月日(和暦+数字)
  const eraBirthEl   = document.getElementById("u-birthday-era");
  const yearBirthEl  = document.getElementById("u-birthday-year");
  const monthBirthEl = document.getElementById("u-birthday-month");
  const dayBirthEl   = document.getElementById("u-birthday-day");

  // 念のため null チェック
  if(!eraBirthEl || !yearBirthEl || !monthBirthEl || !dayBirthEl){
    alert("生年月日の入力要素が見つかりません。");
    return;
  }
  const eraBirth = eraBirthEl.value;
  const yearBirth= yearBirthEl.value;
  const monthBirth=monthBirthEl.value;
  const dayBirth = dayBirthEl.value;
  const birthdayStr = `${eraBirth}${yearBirth}年${monthBirth}月${dayBirth}日`;

  // 枠1: 他
  fd.append("name", document.getElementById("u-name")?.value || "");
  fd.append("furigana", document.getElementById("u-furigana")?.value || "");
  fd.append("birthday", birthdayStr);
  fd.append("age", document.getElementById("u-age")?.value || "");
  fd.append("user_address", document.getElementById("u-address")?.value || "");
  fd.append("user_phone", document.getElementById("u-phone")?.value || "");
  fd.append("user_email", document.getElementById("u-email")?.value || "");

  // --- 枠2
  fd.append("long_goal", document.getElementById("u-longgoal")?.value || "");
  for(let i=1;i<=5;i++){
    const cbox=document.getElementById(`u-shortGoal${i}-check`);
    if(cbox && cbox.checked){
      fd.append(`short_goal${i}`, document.getElementById(`u-shortGoal${i}`)?.value || "");
      fd.append(`short_support${i}`, document.getElementById(`u-shortSupport${i}`)?.value || "");
    } else {
      fd.append(`short_goal${i}`, "");
      fd.append(`short_support${i}`, "");
    }
  }

  // --- 枠3
  let incomeVal="生活保護";
  const incNodes=document.getElementsByName("u-income");
  if(incNodes && incNodes.length>0){
    for(const inc of incNodes){
      if(inc.checked){ incomeVal=inc.value; break; }
    }
  }
  fd.append("income_type", incomeVal);
  fd.append("money_manager", document.getElementById("u-money-manager")?.value || "");

  // 緊急連絡先
  let e1Rel=document.getElementById("u-emerg1-relation")?.value||"";
  let e1Nam=document.getElementById("u-emerg1-name")?.value||"";
  let e1Ph=document.getElementById("u-emerg1-phone")?.value||"";
  fd.append("emergency1", `関係:${e1Rel} / 氏名:${e1Nam} / 電話:${e1Ph}`);

  let e2Rel=document.getElementById("u-emerg2-relation")?.value||"";
  let e2Nam=document.getElementById("u-emerg2-name")?.value||"";
  let e2Ph=document.getElementById("u-emerg2-phone")?.value||"";
  fd.append("emergency2", `関係:${e2Rel} / 氏名:${e2Nam} / 電話:${e2Ph}`);

  let e3Rel=document.getElementById("u-emerg3-relation")?.value||"";
  let e3Nam=document.getElementById("u-emerg3-name")?.value||"";
  let e3Ph=document.getElementById("u-emerg3-phone")?.value||"";
  fd.append("emergency3", `関係:${e3Rel} / 氏名:${e3Nam} / 電話:${e3Ph}`);

  // --- 枠4: 契約開始/終了
  const cStartEraEl   = document.getElementById("u-contract-start-era");
  const cStartYearEl  = document.getElementById("u-contract-start-year");
  const cStartMonthEl = document.getElementById("u-contract-start-month");
  const cStartDayEl   = document.getElementById("u-contract-start-day");
  let contractStartStr="";
  if(cStartEraEl && cStartYearEl && cStartMonthEl && cStartDayEl){
    contractStartStr=`${cStartEraEl.value}${cStartYearEl.value}年${cStartMonthEl.value}月${cStartDayEl.value}日`;
  }

  let contractEndStr="";
  const cendCheck=document.getElementById("u-contract-end-check");
  if(cendCheck && cendCheck.checked){
    const cEndEraEl   = document.getElementById("u-contract-end-era");
    const cEndYearEl  = document.getElementById("u-contract-end-year");
    const cEndMonthEl = document.getElementById("u-contract-end-month");
    const cEndDayEl   = document.getElementById("u-contract-end-day");
    if(cEndEraEl && cEndYearEl && cEndMonthEl && cEndDayEl){
      contractEndStr=`${cEndEraEl.value}${cEndYearEl.value}年${cEndMonthEl.value}月${cEndDayEl.value}日`;
    }
  }

  fd.append("facility_name", document.getElementById("u-fac-name")?.value || "");
  fd.append("service_name", document.getElementById("u-service-name")?.value || "");
  fd.append("facility_number", document.getElementById("u-fac-number")?.value || "");
  fd.append("contract_start", contractStartStr);
  fd.append("contract_end", contractEndStr);
  fd.append("facility_address", document.getElementById("u-fac-addr")?.value || "");
  fd.append("facility_phone", document.getElementById("u-fac-phone")?.value || "");
  fd.append("facility_fax", document.getElementById("u-fac-fax")?.value || "");
  fd.append("staff_roles", document.getElementById("u-staff-roles")?.value || "");

  // --- 枠5: 受給者情報
  const sStartEraEl   = document.getElementById("u-shien-start-era");
  const sStartYearEl  = document.getElementById("u-shien-start-year");
  const sStartMonthEl = document.getElementById("u-shien-start-month");
  const sStartDayEl   = document.getElementById("u-shien-start-day");
  let shienStartStr="";
  if(sStartEraEl && sStartYearEl && sStartMonthEl && sStartDayEl){
    shienStartStr=`${sStartEraEl.value}${sStartYearEl.value}年${sStartMonthEl.value}月${sStartDayEl.value}日`;
  }

  const sEndEraEl   = document.getElementById("u-shien-end-era");
  const sEndYearEl  = document.getElementById("u-shien-end-year");
  const sEndMonthEl = document.getElementById("u-shien-end-month");
  const sEndDayEl   = document.getElementById("u-shien-end-day");
  let shienEndStr="";
  if(sEndEraEl && sEndYearEl && sEndMonthEl && sEndDayEl){
    shienEndStr=`${sEndEraEl.value}${sEndYearEl.value}年${sEndMonthEl.value}月${sEndDayEl.value}日`;
  }

  fd.append("recipient_number", document.getElementById("u-recipient")?.value || "");
  fd.append("shien_kubun", document.getElementById("u-shien-kubun")?.value || "");
  fd.append("shien_kubun_start", shienStartStr);
  fd.append("shien_kubun_end", shienEndStr);

  // --- 枠6
  fd.append("handicapped_handbook", document.getElementById("u-handbook")?.value || "");
  for(let i=1;i<=3;i++){
    const hosCbox=document.getElementById(`u-hospital${i}-check`);
    if(hosCbox && hosCbox.checked){
      fd.append(`hospital${i}`, document.getElementById(`u-hospital${i}`)?.value || "");
      fd.append(`medicine${i}`, document.getElementById(`u-medicine${i}`)?.value || "");
    } else {
      fd.append(`hospital${i}`, "");
      fd.append(`medicine${i}`, "");
    }
  }
  fd.append("previous_illness", document.getElementById("u-previous-illness")?.value || "");
  fd.append("visiting_nurse", document.getElementById("u-visiting-nurse")?.value || "");
  fd.append("visiting_nurse_schedule", document.getElementById("u-visiting-nurse-schedule")?.value || "");
  fd.append("visiting_dentist", document.getElementById("u-visiting-dentist")?.value || "");
  fd.append("visiting_dentist_schedule", document.getElementById("u-visiting-dentist-schedule")?.value || "");
  fd.append("special_care", document.getElementById("u-special-care")?.value || "");

  // --- 枠7(通所)
  fd.append("counselor", document.getElementById("u-counselor")?.value || "");
  for(let i=1;i<=5;i++){
    const enableCbox=document.getElementById(`commute${i}-enable`);
    if(enableCbox && enableCbox.checked){
      fd.append(`commute${i}_enable`, "on");
      fd.append(`commute${i}_place`, document.getElementById(`commute${i}-place`)?.value || "");
      const dayCbs=document.querySelectorAll(`input[name="commute${i}_days"]:checked`);
      for(const db of dayCbs){
        fd.append(`commute${i}_days`, db.value);
      }
      fd.append(`commute${i}_transit`, document.getElementById(`commute${i}-transit`)?.value || "");
      fd.append(`commute${i}_phone`, document.getElementById(`commute${i}-phone`)?.value || "");
    } else {
      fd.append(`commute${i}_enable`, "off");
    }
  }

  // --- 枠8
  fd.append("adl", document.getElementById("u-adl")?.value || "");
  fd.append("iadl", document.getElementById("u-iadl")?.value || "");

  // --- 枠9
  fd.append("diet_restriction", document.getElementById("u-diet")?.value || "");
  fd.append("allergies", document.getElementById("u-allergies")?.value || "");
  fd.append("dislikes", document.getElementById("u-dislikes")?.value || "");

  // --- 枠10
  fd.append("support_notice1", document.getElementById("u-sup1")?.value || "");
  fd.append("support_notice2", document.getElementById("u-sup2")?.value || "");
  fd.append("support_notice3", document.getElementById("u-sup3")?.value || "");
  fd.append("risk_management", document.getElementById("u-risk")?.value || "");
  fd.append("panic_trigger1", document.getElementById("u-trigger1")?.value || "");
  fd.append("panic_trigger2", document.getElementById("u-trigger2")?.value || "");
  fd.append("sense_overload", document.getElementById("u-sense")?.value || "");

  // --- 枠11
  fd.append("mobility", document.getElementById("u-mobility")?.value || "");
  fd.append("life_history", document.getElementById("u-history")?.value || "");
  fd.append("communication", document.getElementById("u-comm")?.value || "");
  fd.append("hobby_community", document.getElementById("u-hobby")?.value || "");
  fd.append("favorite", document.getElementById("u-favorite")?.value || "");
  fd.append("good_at", document.getElementById("u-goodat")?.value || "");
  fd.append("not_good_at", document.getElementById("u-notgood")?.value || "");
  fd.append("future_hope", document.getElementById("u-hope")?.value || "");
  fd.append("other_notes", document.getElementById("u-other")?.value || "");

  fetch("/save_user_info", {method:"POST", body: fd})
    .then(r=>r.text())
    .then(msg=>{
      alert("利用者情報を保存しました:"+msg);
      openUserList();
    })
    .catch(err=>{
      console.error(err);
      alert("エラー:"+err);
    });
}


/** openUserEditForm: フォーム描画後にfetchでDBを取得し、既存内容を反映 */
function openUserEditForm(userId){
  const dh=document.getElementById("detail-header");
  const dc=document.getElementById("detail-content");

  if(!dh || !dc){
    console.error("detail-header/detail-content が存在しません。");
    return;
  }

  // 1) フォームを表示
  openUserInfoForm();

  dh.innerText = "利用者情報 修正 (ID:"+userId+")";

  // setTimeoutで少し遅らせて fetch
  setTimeout(()=>{
    fetch("/api/user/"+userId)
      .then(r=> {
        if(!r.ok){
          throw new Error("HTTP Error " + r.status);
        }
        return r.json();
      })
      .then(user=>{
        if(!user || user.error){
          dc.innerHTML=`<p style="color:red;">ユーザが見つかりません</p>`;
          return;
        }
        // ★ hidden
        const idEl = document.getElementById("u-id");
        if(!idEl){
          console.warn("u-id がありません。");
          return;
        }
        idEl.value = userId;

        // ---------- 枠1 ----------
        const nameEl = document.getElementById("u-name");
        if(nameEl) nameEl.value = user.name||"";

        const furiEl = document.getElementById("u-furigana");
        if(furiEl) furiEl.value = user.furigana||"";

        if(user.gender === "女性"){
          const femaleRadio = document.querySelector('input[name="u-gender"][value="女性"]');
          if(femaleRadio) femaleRadio.checked=true;
        } else {
          const maleRadio = document.querySelector('input[name="u-gender"][value="男性"]');
          if(maleRadio) maleRadio.checked=true;
        }

        // 生年月日: 例「令和4年5月3日」 → era/ year / month / day
        const reBirth=/^(昭和|平成|令和)(\d+)年(\d+)月(\d+)日$/;
        const birthVal=user.birthday||"令和4年5月3日";
        const bMatch=birthVal.match(reBirth);
        if(bMatch){
          const eraEl   = document.getElementById("u-birthday-era");
          const yEl     = document.getElementById("u-birthday-year");
          const mEl     = document.getElementById("u-birthday-month");
          const dEl     = document.getElementById("u-birthday-day");
          if(eraEl) eraEl.value = bMatch[1];
          if(yEl)   yEl.value   = bMatch[2];
          if(mEl)   mEl.value   = bMatch[3];
          if(dEl)   dEl.value   = bMatch[4];
        }

        const ageEl = document.getElementById("u-age");
        if(ageEl) ageEl.value = user.age||"";

        const addrEl = document.getElementById("u-address");
        if(addrEl) addrEl.value = user.user_address||"";

        const phoneEl= document.getElementById("u-phone");
        if(phoneEl) phoneEl.value = user.user_phone||"";

        const emailEl= document.getElementById("u-email");
        if(emailEl) emailEl.value = user.user_email||"";

        // ---------- 枠2 ----------
        const lgEl = document.getElementById("u-longgoal");
        if(lgEl) lgEl.value = user.long_goal||"";

        for(let i=1;i<=5;i++){
          const cbox = document.getElementById(`u-shortGoal${i}-check`);
          const gval = user[`short_goal${i}`]||"";
          const sval = user[`short_support${i}`]||"";
          if(gval.trim() || sval.trim()){
            if(cbox) cbox.checked=true;
            toggleShortGoal(i);
            const gEl = document.getElementById(`u-shortGoal${i}`);
            if(gEl) gEl.value = gval;
            const sEl = document.getElementById(`u-shortSupport${i}`);
            if(sEl) sEl.value = sval;
          } else {
            if(cbox) cbox.checked=false;
            toggleShortGoal(i);
          }
        }

        // ---------- 枠3 ----------
        if(user.income_type){
          const incNodes=document.getElementsByName("u-income");
          for(const inc of incNodes){
            if(inc.value===user.income_type){
              inc.checked=true;
              break;
            }
          }
        }
        const mmEl = document.getElementById("u-money-manager");
        if(mmEl) mmEl.value = user.money_manager||"";

        // 緊急連絡先
        const reEmerg=/関係:(.*?)\s*\/\s*氏名:(.*?)\s*\/\s*電話:(.*)/;
        function parseEmergency(eStr, relId, nmId, phId){
          const match = eStr.match(reEmerg);
          if(match){
            const rEl=document.getElementById(relId);
            if(rEl) rEl.value=match[1].trim();
            const nEl=document.getElementById(nmId);
            if(nEl) nEl.value=match[2].trim();
            const pEl=document.getElementById(phId);
            if(pEl) pEl.value=match[3].trim();
          }
        }
        parseEmergency(user.emergency1||"", "u-emerg1-relation","u-emerg1-name","u-emerg1-phone");
        parseEmergency(user.emergency2||"", "u-emerg2-relation","u-emerg2-name","u-emerg2-phone");
        parseEmergency(user.emergency3||"", "u-emerg3-relation","u-emerg3-name","u-emerg3-phone");

        // ---------- 枠4 ----------
        const reCstart=/^(昭和|平成|令和)(\d+)年(\d+)月(\d+)日$/;
        let cStart=user.contract_start||"令和1年1月1日";
        let mcS=cStart.match(reCstart);
        if(mcS){
          const eraCE = document.getElementById("u-contract-start-era");
          const yCE   = document.getElementById("u-contract-start-year");
          const mCE   = document.getElementById("u-contract-start-month");
          const dCE   = document.getElementById("u-contract-start-day");
          if(eraCE) eraCE.value=mcS[1];
          if(yCE)   yCE.value=mcS[2];
          if(mCE)   mCE.value=mcS[3];
          if(dCE)   dCE.value=mcS[4];
        }

        const ceCbox=document.getElementById("u-contract-end-check");
        if(user.contract_end && user.contract_end.trim()!==""){
          if(ceCbox){
            ceCbox.checked=true;
            toggleContractEnd();
          }
          let cEndVal=user.contract_end;
          let mcE=cEndVal.match(reCstart);
          if(mcE){
            const eraCE2= document.getElementById("u-contract-end-era");
            const yCE2  = document.getElementById("u-contract-end-year");
            const mCE2  = document.getElementById("u-contract-end-month");
            const dCE2  = document.getElementById("u-contract-end-day");
            if(eraCE2) eraCE2.value=mcE[1];
            if(yCE2)   yCE2.value=mcE[2];
            if(mCE2)   mCE2.value=mcE[3];
            if(dCE2)   dCE2.value=mcE[4];
          }
        } else {
          if(ceCbox){
            ceCbox.checked=false;
            toggleContractEnd();
          }
        }
        const facNameEl= document.getElementById("u-fac-name");
        if(facNameEl) facNameEl.value = user.facility_name||"";
        const svcEl= document.getElementById("u-service-name");
        if(svcEl) svcEl.value = user.service_name||"";
        const facNumEl= document.getElementById("u-fac-number");
        if(facNumEl) facNumEl.value = user.facility_number||"";
        const facAddrEl= document.getElementById("u-fac-addr");
        if(facAddrEl) facAddrEl.value = user.facility_address||"";
        const facPhEl= document.getElementById("u-fac-phone");
        if(facPhEl) facPhEl.value = user.facility_phone||"";
        const facFxEl= document.getElementById("u-fac-fax");
        if(facFxEl) facFxEl.value = user.facility_fax||"";
        const stfRoleEl= document.getElementById("u-staff-roles");
        if(stfRoleEl) stfRoleEl.value = user.staff_roles||"";

        // ---------- 枠5 ----------
        const reShien=/^(昭和|平成|令和)(\d+)年(\d+)月(\d+)日$/;
        const recEl= document.getElementById("u-recipient");
        if(recEl) recEl.value= user.recipient_number||"";
        const skEl= document.getElementById("u-shien_kubun");
        if(skEl) skEl.value= user.shien_kubun||"";

        let sS=user.shien_kubun_start||"令和2年1月1日";
        let msS=sS.match(reShien);
        if(msS){
          const eraSS= document.getElementById("u-shien-start-era");
          const ySS  = document.getElementById("u-shien-start-year");
          const mSS  = document.getElementById("u-shien-start-month");
          const dSS  = document.getElementById("u-shien-start-day");
          if(eraSS) eraSS.value=msS[1];
          if(ySS)   ySS.value=msS[2];
          if(mSS)   mSS.value=msS[3];
          if(dSS)   dSS.value=msS[4];
        }
        let sE=user.shien_kubun_end||"令和3年12月31日";
        let msE=sE.match(reShien);
        if(msE){
          const eraSE= document.getElementById("u-shien-end-era");
          const ySE  = document.getElementById("u-shien-end-year");
          const mSE  = document.getElementById("u-shien-end-month");
          const dSE  = document.getElementById("u-shien-end-day");
          if(eraSE) eraSE.value=msE[1];
          if(ySE)   ySE.value=msE[2];
          if(mSE)   mSE.value=msE[3];
          if(dSE)   dSE.value=msE[4];
        }

        // ---------- 枠6 ----------
        const hbEl= document.getElementById("u-handbook");
        if(hbEl) hbEl.value= user.handicapped_handbook||"";
        for(let i=1;i<=3;i++){
          const hVal=user[`hospital${i}`]||"";
          const mVal=user[`medicine${i}`]||"";
          const cbox2=document.getElementById(`u-hospital${i}-check`);
          if(hVal.trim()||mVal.trim()){
            if(cbox2) cbox2.checked=true;
            toggleHospital(i);
            const hInput=document.getElementById(`u-hospital${i}`);
            if(hInput) hInput.value=hVal;
            const medInput=document.getElementById(`u-medicine${i}`);
            if(medInput) medInput.value=mVal;
          } else {
            if(cbox2) cbox2.checked=false;
            toggleHospital(i);
          }
        }
        const prevIllEl=document.getElementById("u-previous-illness");
        if(prevIllEl) prevIllEl.value=user.previous_illness||"";
        const vsnEl=document.getElementById("u-visiting-nurse");
        if(vsnEl) vsnEl.value=user.visiting_nurse||"";
        const vsnsEl=document.getElementById("u-visiting-nurse-schedule");
        if(vsnsEl) vsnsEl.value=user.visiting_nurse_schedule||"";
        const vdtEl=document.getElementById("u-visiting-dentist");
        if(vdtEl) vdtEl.value=user.visiting_dentist||"";
        const vdtsEl=document.getElementById("u-visiting-dentist-schedule");
        if(vdtsEl) vdtsEl.value=user.visiting_dentist_schedule||"";
        const scEl=document.getElementById("u-special-care");
        if(scEl) scEl.value=user.special_care||"";

        // ---------- 枠7 (commute_json) ----------
        let cjson=user.commute_json||"[]";
        let commuteArr=[];
        try{commuteArr=JSON.parse(cjson);}catch(e){}
        for(let i=1;i<=5;i++){
          const enableBox=document.getElementById(`commute${i}-enable`);
          const block=document.getElementById(`commute${i}-block`);
          if(commuteArr[i-1]){
            if(enableBox) enableBox.checked=true;
            if(block) block.style.display="block";
            const placeEl=document.getElementById(`commute${i}-place`);
            if(placeEl) placeEl.value= commuteArr[i-1].place||"";
            const transitEl=document.getElementById(`commute${i}-transit`);
            if(transitEl) transitEl.value= commuteArr[i-1].transit||"";
            const phoneEl=document.getElementById(`commute${i}-phone`);
            if(phoneEl) phoneEl.value= commuteArr[i-1].phone||"";
            let dayStr=commuteArr[i-1].days||"";
            let dayArr=dayStr.split(",");
            dayArr.forEach(dval=>{
              let cb=document.querySelector(`input[name="commute${i}_days"][value="${dval}"]`);
              if(cb) cb.checked=true;
            });
          } else {
            if(enableBox) enableBox.checked=false;
            if(block) block.style.display="none";
          }
        }
        const cslEl=document.getElementById("u-counselor");
        if(cslEl) cslEl.value=user.counselor||"";

        // ---------- 枠8 ----------
        const adlEl=document.getElementById("u-adl");
        if(adlEl) adlEl.value=user.adl||"";
        const iadlEl=document.getElementById("u-iadl");
        if(iadlEl) iadlEl.value=user.iadl||"";

        // ---------- 枠9 ----------
        const dietEl=document.getElementById("u-diet");
        if(dietEl) dietEl.value=user.diet_restriction||"";
        const algEl=document.getElementById("u-allergies");
        if(algEl) algEl.value=user.allergies||"";
        const disEl=document.getElementById("u-dislikes");
        if(disEl) disEl.value=user.dislikes||"";

        // ---------- 枠10 ----------
        const sup1El=document.getElementById("u-sup1");
        if(sup1El) sup1El.value=user.support_notice1||"";
        const sup2El=document.getElementById("u-sup2");
        if(sup2El) sup2El.value=user.support_notice2||"";
        const sup3El=document.getElementById("u-sup3");
        if(sup3El) sup3El.value=user.support_notice3||"";
        const riskEl=document.getElementById("u-risk");
        if(riskEl) riskEl.value=user.risk_management||"";
        const trig1El=document.getElementById("u-trigger1");
        if(trig1El) trig1El.value=user.panic_trigger1||"";
        const trig2El=document.getElementById("u-trigger2");
        if(trig2El) trig2El.value=user.panic_trigger2||"";
        const senseEl=document.getElementById("u-sense");
        if(senseEl) senseEl.value=user.sense_overload||"";

        // ---------- 枠11 ----------
        const mobEl=document.getElementById("u-mobility");
        if(mobEl) mobEl.value=user.mobility||"";
        const histEl=document.getElementById("u-history");
        if(histEl) histEl.value=user.life_history||"";
        const commEl=document.getElementById("u-comm");
        if(commEl) commEl.value=user.communication||"";
        const hobbyEl=document.getElementById("u-hobby");
        if(hobbyEl) hobbyEl.value=user.hobby_community||"";
        const favEl=document.getElementById("u-favorite");
        if(favEl) favEl.value=user.favorite||"";
        const goodEl=document.getElementById("u-goodat");
        if(goodEl) goodEl.value=user.good_at||"";
        const notgEl=document.getElementById("u-notgood");
        if(notgEl) notgEl.value=user.not_good_at||"";
        const hopeEl=document.getElementById("u-hope");
        if(hopeEl) hopeEl.value=user.future_hope||"";
        const otherEl=document.getElementById("u-other");
        if(otherEl) otherEl.value=user.other_notes||"";
      })
      .catch(err=>{
        console.error(err);
        dc.innerHTML=`<p style="color:red;">読み込みエラー:${err}</p>`;
      });
  },200);
}


/********************************************
  Block #5: 研修・訓練など表示切り替え
   - renderTrainingMenu(itemKey)
   - showTrainingModal(...)
   - renderDocMakingPart(...)
   - renderPlanSetPart(...)
********************************************/

/**
 * 「資料の策定と作成」:
 *   - マニュアルガイド & サンプルファイルDLのみ
 * 「実施予定日の設定と記録」:
 *   - 実施予定日設定、ファイルアップロード、記録表DL、記録入力フォーム
 * 「課題・議題の策定と記録」:
 *   - 見直し・委員会・会議ファイル管理
 */
function renderTrainingMenu(itemKey) {
  const detailHeader = document.getElementById("detail-header");
  const detailContent = document.getElementById("detail-content");
  detailHeader.innerText = itemKey;

  let filtered = {};
  let isCommittee = (itemKey === "課題・議題の策定と記録");
  let isPlanSet = (itemKey === "実施予定日の設定と記録");
  let isDocMaking = (itemKey === "資料の策定と作成");

  // 見直し・委員会・会議 or 研修・訓練
  if (isCommittee) {
    for (let t in globalTrainingData) {
      const typ = globalTrainingData[t].type;
      if (typ === "計画の見直し" || typ === "委員会" || typ === "会議") {
        filtered[t] = globalTrainingData[t];
      }
    }
  } else {
    for (let t in globalTrainingData) {
      const typ = globalTrainingData[t].type;
      if (typ === "研修" || typ === "訓練") {
        filtered[t] = globalTrainingData[t];
      }
    }
  }

  // ソート
  let titles = Object.keys(filtered);
  if (isCommittee) {
    const committeeOrder = [
      "地域連携推進_会議",
      "虐待防止_委員会",
      "身体拘束適正化_委員会",
      "感染症に係る業務継続計画(BCP)_見直し",
      "災害に係る業務継続計画(BCP)_見直し",
      "ハラスメント(セクハラ)対策_委員会",
      "ハラスメント(パワハラ)対策_委員会"
    ];
    titles.sort((a,b)=>{
      const idxA = committeeOrder.indexOf(a);
      const idxB = committeeOrder.indexOf(b);
      const realA = idxA===-1?9999:idxA;
      const realB = idxB===-1?9999:idxB;
      return realA - realB;
    });
  } else {
    // 研修・訓練
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
    titles.sort((a,b)=>{
      const idxA = trainingOrder.indexOf(a);
      const idxB = trainingOrder.indexOf(b);
      const realA = idxA===-1?9999:idxA;
      const realB = idxB===-1?9999:idxB;
      return realA - realB;
    });
  }

  // 一覧を生成
  let html = `<div id="training-list-container">`;
  titles.forEach(title => {
    let dt = filtered[title];
    let label = title;
    if (dt.deductionRisk === "該当") {
      label += `<span class="red-text">←減算対象</span>`;
    }
    let statusHTML = "";
    if (dt.status === "完了") {
      statusHTML = `<span class="status complete">【完了】</span>`;
    } else {
      if (dt.plannedDate) {
        statusHTML = `<span class="status incomplete">未完了(${dt.plannedDate}実施予定)</span>`;
      } else {
        statusHTML = `<span class="status incomplete">未完了(予定なし)</span>`;
      }
    }

    html += `
      <div class="training-item-box" 
           data-title="${title}" 
           data-mode="${itemKey}">
        <div class="training-item-header">
          <div class="training-item-title">${label}</div>
          <div class="training-item-status">${statusHTML}</div>
        </div>
      </div>
    `;
  });
  html += `</div>`;

  detailContent.innerHTML = html;

  // クリック → モーダル表示
  document.querySelectorAll(".training-item-box").forEach(box => {
    box.addEventListener("click", () => {
      const tTitle = box.getAttribute("data-title");
      const mode = box.getAttribute("data-mode"); // "資料の策定と作成", etc
      showTrainingModal(tTitle, globalTrainingData[tTitle] || {}, mode);
    });
  });
}

/*************************************************
  モーダルの表示切り替え
*************************************************/
function showTrainingModal(title, data, mode) {
  let modalHTML = `<h2>${title}</h2>`;
  modalHTML += `<p><strong>種類:</strong> ${data.type||""}</p>`;
  modalHTML += `<p><strong>頻度:</strong> ${data.frequency||""}</p>`;
  modalHTML += `<p><strong>参加者:</strong> ${(data.participants||[]).join("、")}</p>`;

  // 概要
  modalHTML += `<h3>詳細内容</h3>`;
  if (data.sections) {
    modalHTML += `<ul>`;
    for (let k in data.sections) {
      modalHTML += `<li><strong>${k}:</strong> ${data.sections[k]}</li>`;
    }
    modalHTML += `</ul>`;
  }

  if (mode === "資料の策定と作成") {
    // ガイド + サンプルファイルDLのみ
    modalHTML += renderDocMakingPart(data);

  } else if (mode === "実施予定日の設定と記録") {
    // ガイド + 実施予定日 + 記録表ダウンロード + アップロード + 入力フォーム
    modalHTML += renderDocMakingPart(data); // 先にガイド
    modalHTML += renderPlanSetPart(title, data);

  } else {
    // 課題・議題の策定と記録 (見直し・委員会・会議)
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
  const modalEl = document.getElementById("training-detail-modal");
  document.getElementById("training-detail-content").innerHTML = modalHTML;
  modalEl.style.display = "block";
  
  // 実施予定日の保存 (mode==="実施予定日の設定と記録" の場合)
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

/** 資料作成ガイド + サンプルファイルDL */
function renderDocMakingPart(data) {
  let html = `<h3>資料作成ガイド</h3>`;
  if (typeof data.manualGuide === "object" && data.manualGuide?.tableOfContents) {
    html += `<div style="margin:10px 0; padding:8px; background:#f7f7ff;">
               <h4>マニュアル作成の目次</h4>`;
    data.manualGuide.tableOfContents.forEach((toc, idx) => {
      html += `
        <div style="border:1px solid #ccc; margin:5px 0; padding:5px;">
          <strong>${idx+1}. ${toc.題名||""}</strong><br>
          <em>要約:</em> ${toc.要約||""}<br>
          <pre style="white-space:pre-wrap; font-size:90%;">${toc.詳細や注釈||""}</pre>
        </div>
      `;
    });
    html += `</div>`;
  } else if (typeof data.manualGuide === "string") {
    html += `<p>${data.manualGuide}</p>`;
  } else {
    html += `<p>資料作成ガイドはありません。</p>`;
  }
  // サンプルファイル
  const docLink = data.ManualTemplate
    ? `/download_sample/${data.ManualTemplate}`
    : "/download_sample/sample.docx";
  html += `
    <h4>サンプルファイル(Word)</h4>
    <p>※このマニュアルは施設に合わせて修正してください。</p>
    <a href="${docLink}" download>ダウンロード</a>
  `;
  return html;
}

/** 実施予定日の設定 + 記録ファイルアップロード + 記録入力フォーム */
function renderPlanSetPart(title, data) {
  let html = `
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
    ? `/download_sample/${data.DocTemplate}`
    : "/download_sample/sample_record.docx";
  html += `
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
  return html;
}
/********************************************
  Block #7: 業務日誌メニュー (スタッフ業務)
  ここでは何をしているのか:
  - 左メニューや各種機能のJSをまとめたファイル
  - 業務日誌メニュー(openDailyReportMenu)
  - 業務日誌作成(複数画面: 入力→確認→保存)
  - サービス提供記録(同様に入力→確認→保存)
  - PDFモーダルを使ってプレビュー/印刷
********************************************/

function openDailyReportMenu() {
  const detailHeader = document.getElementById("detail-header");
  const detailContent = document.getElementById("detail-content");

  detailHeader.innerText = "業務日誌・サービス提供記録";

  let html = `
    <div style="border:2px solid #0080c0; padding:10px; margin-bottom:10px; border-radius:4px;">
      <h3>業務日誌・サービス提供記録の入力</h3>
      <p>業務日誌とサービス提供記録を入力することができます</p>
      <button onclick="openDailyReport()">入力</button>
    </div>

    <div style="border:2px solid #0080c0; padding:10px; margin-bottom:10px; border-radius:4px;">
      <h3>業務日誌の確認/印刷</h3>
      <p>指定した日付の業務日誌の確認と印刷をすることができます</p>
      <button onclick="openDailyReportDisplay()">業務日誌を表示</button>
    </div>

    <div style="border:2px solid #0080c0; padding:10px; border-radius:4px;">
      <h3>サービス提供記録の確認/印刷</h3>
      <p>指定した日付の利用者ごとのサービス提供記録の確認と印刷をすることができます</p>
      <button onclick="openServiceRecordDisplay()">サービス提供記録を表示</button>
    </div>
  `;

  detailContent.innerHTML = html;
}

/********************************************
  共通: スクロール関連/表示切替用の小ヘルパー
********************************************/
// 業務日誌の「基本情報入力」へ戻る (スクロール上部)
function goBackToDailyReportBasic() {
  window.scrollTo(0, 0);
  openDailyReport();
}

// 業務日誌一覧(検索結果)に戻る (スクロール上部 & 再検索)
function returnToDailyReportList() {
  window.scrollTo(0, 0);
  openDailyReportDisplay();
}

// サービス提供記録一覧(検索結果)に戻る (スクロール上部 & 再検索)
function returnToServiceRecordList() {
  window.scrollTo(0, 0);
  openServiceRecordDisplay();
}

// 「帰宅時の様子」のラベルに変換
function getHomeStateLabel(value) {
  switch (value) {
    case "1":
      return "特に気になることはありません。";
    case "2":
      return "少し疲れた様子";
    case "3":
      return "体調不良の訴え";
    case "4":
      return "不穏な雰囲気";
    default:
      return value || "";
  }
}

// 「起床時の様子」のラベルに変換
function getWakeStateLabel(value) {
  switch (value) {
    case "1":
      return "ご自身で起床";
    case "2":
      return "声掛けで起床";
    case "3":
      return "体調不良の訴え";
    case "4":
      return "不穏な雰囲気";
    case "5":
      return "その他";
    default:
      return value || "";
  }
}

/********************************************
  Block #8a: 業務日誌作成 (基本情報入力 ~ 詳細 ~ 確認)
********************************************/

// 入力途中の業務日誌データを一時保管する
let tempDailyReportData = {};

/**
 * 業務日誌の基本情報入力画面
 */
function openDailyReport() {
  // 画面切り替え時に上部へスクロール
  window.scrollTo(0, 0);

  const dh = document.getElementById("detail-header");
  const dc = document.getElementById("detail-content");
  dh.innerText = "基本情報入力";

  // 今日の日付(yyyy-mm-dd)を生成
  const today = new Date();
  const y = today.getFullYear();
  const m = ("0" + (today.getMonth() + 1)).slice(-2);
  const d = ("0" + today.getDate()).slice(-2);
  const defaultDate = `${y}-${m}-${d}`;

  let html = `
    <div class="report-title">業務日誌・サービス提供記録 基本情報入力</div>

    <div class="report-subtitle">基本情報</div>
    <div style="margin-bottom:10px;">
      <div style="margin:4px 0;">
        <label class="report-label">記録日:</label>
        <input type="date" id="daily-date" value="${defaultDate}" />
        <label style="margin-left:20px;">日中あり
          <input type="checkbox" id="daytimeCheck">
        </label>
        <label style="margin-left:10px;">追加スタッフあり
          <input type="checkbox" id="extraStaff">
        </label>
      </div>

      <!-- (日中)スタッフ -->
      <div id="dayStaffBlock" style="display:none;">
        <div style="margin:4px 0;">
          <label class="report-label">(日中)スタッフ名:</label>
          <input type="text" id="daily-staff-day" value="" size="20" placeholder="日中スタッフ名">
        </div>
        <div style="margin:4px 0;">
          <label class="report-label">勤務時間:</label>
          <input type="text" id="daily-staff-day-time" value="9:00-18:00" size="10">
        </div>
      </div>

      <!-- 夜間スタッフ -->
      <div style="margin:4px 0;">
        <label class="report-label">(夜間)スタッフ名:</label>
        <input type="text" id="daily-staff-night" value="" size="20" placeholder="夜間スタッフ名">
      </div>
      <div style="margin:4px 0;">
        <label class="report-label">勤務時間:</label>
        <input type="text" id="daily-staff-night-time" value="16:00-10:00" size="10">
      </div>

      <!-- (追加スタッフ) -->
      <div id="extraStaffBlock" style="display:none; margin-top:8px;">
        <div style="margin:4px 0;">
          <label class="report-label">(追加)スタッフ名:</label>
          <input type="text" id="daily-staff-extra" value="" size="20" placeholder="追加スタッフ名">
        </div>
        <div style="margin:4px 0;">
          <label class="report-label">勤務時間:</label>
          <input type="text" id="daily-staff-extra-time" value="" size="10">
        </div>
      </div>
    </div>

    <!-- (日中)昼食欄 -->
    <div id="lunch-section" style="display:none; border:1px solid #ccc; padding:10px; margin-bottom:10px;">
      <div class="report-subtitle">(日中)昼食の献立
        <span style="font-size:0.8rem;">※昼食メニューを入力してください。</span>
      </div>
      <div style="margin:4px 0;">
        <input type="text" id="lunch-menu" size="42" placeholder="(例) カレーライス・サラダなど">
      </div>
    </div>

    <div class="report-subtitle">夕食の献立
      <span style="font-size:0.8rem;">※自由に入力できます</span>
    </div>
    <div style="margin:4px 0;">
      <input type="text" id="dinner-menu" size="42" value="ご飯・みそ汁" placeholder="(例) ご飯・みそ汁・焼き魚">
    </div>

    <div class="report-subtitle">夜間巡視</div>
    <div style="margin:4px 0;">
      <label class="report-label">巡視1:</label>
      <input type="text" id="check23" size="30" value="23時巡視　呼吸安定・良眠">
    </div>
    <div style="margin:4px 0;">
      <label class="report-label">巡視2:</label>
      <input type="text" id="check1" size="30" value="1時巡視　呼吸安定・良眠">
    </div>
    <div style="margin:4px 0;">
      <label class="report-label">巡視3:</label>
      <input type="text" id="check3" size="30" value="4時巡視　呼吸安定・良眠">
    </div>

    <div class="report-subtitle">朝食の献立
      <span style="font-size:0.8rem;">※自由に入力できます</span>
    </div>
    <div style="margin:4px 0;">
      <input type="text" id="breakfast-menu" size="42" value="パン・スープ" placeholder="(例) パン・スープ・サラダ">
    </div>

    <!-- ボタン -->
    <div style="margin-top:10px; display:flex; flex-direction:column; gap:10px;">
      <button onclick="openDailyReportCreate()">業務日誌作成</button>

      <!-- ▼利用者一覧を取得してボタン表示する箇所-->
      <div id="user-buttons" style="margin-top:5px;">
        <!-- ここで利用者一覧を動的に生成する -->
      </div>
    </div>
  `;

  dc.innerHTML = html;

  // イベントリスナ
  const daytimeChk = document.getElementById("daytimeCheck");
  const extraStaffChk = document.getElementById("extraStaff");

  if (daytimeChk) {
    daytimeChk.addEventListener("change", () => {
      toggleDayPortion(daytimeChk.checked);
    });
  }
  if (extraStaffChk) {
    extraStaffChk.addEventListener("change", () => {
      toggleExtraStaff(extraStaffChk.checked);
    });
  }

  // もし既に tempDailyReportData に基本情報があれば、再描画時にフォームに反映する
  if (tempDailyReportData.dateValue) {
    document.getElementById("daily-date").value = tempDailyReportData.dateValue;
    document.getElementById("daily-staff-night").value = tempDailyReportData.staffNight || "";
    document.getElementById("daily-staff-night-time").value = tempDailyReportData.staffNightTime || "";
    if (tempDailyReportData.isDaytime) {
      document.getElementById("daytimeCheck").checked = true;
      toggleDayPortion(true);
      document.getElementById("daily-staff-day").value = tempDailyReportData.staffDay || "";
      document.getElementById("daily-staff-day-time").value = tempDailyReportData.staffDayTime || "";
    }
    if (tempDailyReportData.hasExtraStaff) {
      document.getElementById("extraStaff").checked = true;
      toggleExtraStaff(true);
      document.getElementById("daily-staff-extra").value = tempDailyReportData.staffExtra || "";
      document.getElementById("daily-staff-extra-time").value = tempDailyReportData.staffExtraTime || "";
    }
    // 昼食,夕食,朝食,巡視
    document.getElementById("lunch-menu").value = tempDailyReportData.lunch || "";
    document.getElementById("dinner-menu").value = tempDailyReportData.dinner || "";
    document.getElementById("breakfast-menu").value = tempDailyReportData.breakfast || "";
    document.getElementById("check23").value = tempDailyReportData.check23 || "23時巡視　呼吸安定・良眠";
    document.getElementById("check1").value  = tempDailyReportData.check1 || "1時巡視　呼吸安定・良眠";
    document.getElementById("check3").value  = tempDailyReportData.check3 || "4時巡視　呼吸安定・良眠";
  }

  // ▼ 利用者一覧を取得して動的にボタンを生成する例
  fetch('/api/active_users')
    .then(res => res.json())
    .then(users => {
      users.sort((a, b) => a.id - b.id);
      const userButtonsDiv = document.getElementById('user-buttons');
      let btnHtml = '';
      users.forEach(u => {
        btnHtml += `
          <button onclick="openServiceRecordUser('${u.id}', '${u.name}')">
            ${u.name}さんのサービス提供記録へ
          </button>
        `;
      });
      userButtonsDiv.innerHTML = btnHtml;
    })
    .catch(err => {
      console.log("利用者一覧取得エラー:", err);
    });
}

/** 日中有無トグル */
function toggleDayPortion(isDaytime) {
  const dayStaffBlock = document.getElementById("dayStaffBlock");
  const lunchSection = document.getElementById("lunch-section");
  if (dayStaffBlock) dayStaffBlock.style.display = isDaytime ? "block" : "none";
  if (lunchSection) lunchSection.style.display = isDaytime ? "block" : "none";
}

/** 追加スタッフ有無トグル */
function toggleExtraStaff(hasExtra) {
  const extraStaffBlock = document.getElementById("extraStaffBlock");
  if (extraStaffBlock) extraStaffBlock.style.display = hasExtra ? "block" : "none";
}


/**
 * 業務日誌 詳細入力画面
 */
function openDailyReportCreate() {
  // 画面切り替え時に上部へスクロール
  window.scrollTo(0, 0);

  const dh = document.getElementById("detail-header");
  const dc = document.getElementById("detail-content");

  // まず、基本画面の入力を tempDailyReportData に保存
  const dateEl  = document.getElementById("daily-date");
  if (dateEl) {
    tempDailyReportData.dateValue = dateEl.value || tempDailyReportData.dateValue || "";
  }

  const dayChk  = document.getElementById("daytimeCheck");
  const extraChk= document.getElementById("extraStaff");
  const isDay = !!dayChk?.checked;
  const isExtra = !!extraChk?.checked;

  const staffNightEl  = document.getElementById("daily-staff-night");
  const staffNightTimeEl = document.getElementById("daily-staff-night-time");
  if (staffNightEl) {
    tempDailyReportData.staffNight = staffNightEl.value || tempDailyReportData.staffNight || "";
  }
  if (staffNightTimeEl) {
    tempDailyReportData.staffNightTime = staffNightTimeEl.value || tempDailyReportData.staffNightTime || "";
  }

  if (isDay) {
    const sday  = document.getElementById("daily-staff-day");
    const sdayt = document.getElementById("daily-staff-day-time");
    tempDailyReportData.staffDay = sday?.value || tempDailyReportData.staffDay || "";
    tempDailyReportData.staffDayTime = sdayt?.value || tempDailyReportData.staffDayTime || "";
  }

  if (isExtra) {
    const sextra  = document.getElementById("daily-staff-extra");
    const sextrat = document.getElementById("daily-staff-extra-time");
    tempDailyReportData.staffExtra = sextra?.value || tempDailyReportData.staffExtra || "";
    tempDailyReportData.staffExtraTime = sextrat?.value || tempDailyReportData.staffExtraTime || "";
  }

  const lunchEl   = document.getElementById("lunch-menu");
  const dinnerEl  = document.getElementById("dinner-menu");
  const breakEl   = document.getElementById("breakfast-menu");
  if (lunchEl) {
    tempDailyReportData.lunch = lunchEl.value || tempDailyReportData.lunch || "";
  }
  if (dinnerEl) {
    tempDailyReportData.dinner = dinnerEl.value || tempDailyReportData.dinner || "";
  }
  if (breakEl) {
    tempDailyReportData.breakfast = breakEl.value || tempDailyReportData.breakfast || "";
  }

  const c23El = document.getElementById("check23");
  const c1El  = document.getElementById("check1");
  const c3El  = document.getElementById("check3");
  if (c23El) {
    tempDailyReportData.check23 = c23El.value || tempDailyReportData.check23 || "";
  }
  if (c1El) {
    tempDailyReportData.check1 = c1El.value || tempDailyReportData.check1 || "";
  }
  if (c3El) {
    tempDailyReportData.check3 = c3El.value || tempDailyReportData.check3 || "";
  }

  tempDailyReportData.isDaytime = isDay;
  tempDailyReportData.hasExtraStaff = isExtra;

  // (枠1) 日時・スタッフ名
  let frame1 = `
    <div style="border:2px solid #444; padding:10px; margin-bottom:10px; border-radius:6px;">
      <h3 style="font-size:1.1rem; margin-bottom:6px;">枠1: 日時・スタッフ名</h3>
      <p style="margin:4px 0; font-size:1rem;">
        <strong>記録日:</strong> ${tempDailyReportData.dateValue || "(未入力)"}
      </p>
      ${
        tempDailyReportData.isDaytime
          ? `<p style="margin:4px 0; font-size:1rem;"><strong>日中スタッフ:</strong> ${tempDailyReportData.staffDay} (${tempDailyReportData.staffDayTime})</p>`
          : ""
      }
      <p style="margin:4px 0; font-size:1rem;">
        <strong>夜勤スタッフ:</strong> ${tempDailyReportData.staffNight}${
          tempDailyReportData.staffNightTime ?  ` (${tempDailyReportData.staffNightTime})` : ""
        }
      </p>
      ${
        tempDailyReportData.hasExtraStaff
          ? `<p style="margin:4px 0; font-size:1rem;"><strong>追加スタッフ:</strong> ${tempDailyReportData.staffExtra} (${tempDailyReportData.staffExtraTime})</p>`
          : ""
      }
    </div>
  `;

  // (枠2) 食事の献立
  let lunchBlock = tempDailyReportData.isDaytime ? `
    <div style="margin:4px 0;">
      <strong>昼食の献立:</strong>
      <input type="text" id="lunchMealInput" size="60" value="${tempDailyReportData.lunch || ""}" />
    </div>
  ` : "";

  let frame2 = `
    <div style="border:2px solid #444; padding:10px; margin-bottom:10px; border-radius:6px;">
      <h3 style="font-size:1.1rem; margin-bottom:6px;">枠2: 食事の献立</h3>
      ${ lunchBlock }
      <div style="margin:4px 0;">
        <strong>夕食の献立:</strong>
        <input type="text" id="dinnerMealInput" size="60" value="${tempDailyReportData.dinner || ""}" />
      </div>
      <div style="margin:4px 0;">
        <strong>朝食の献立:</strong>
        <input type="text" id="breakfastMealInput" size="60" value="${tempDailyReportData.breakfast || ""}" />
      </div>
    </div>
  `;

  // (枠3) 当日業務の報告
  const bcVal = tempDailyReportData.businessContent || "";
  const riVal = tempDailyReportData.relayInfo || "";
  let frame3 = `
    <div style="border:2px solid #444; padding:10px; margin-bottom:10px; border-radius:6px;">
      <h3 style="font-size:1.1rem; margin-bottom:6px;">枠3: 当日業務の報告</h3>
      <div style="margin:4px 0;">
        <label>業務内容:</label><br>
        <textarea id="businessContent" rows="3" style="width:100%;">${bcVal}</textarea>
      </div>
      <div style="margin:4px 0;">
        <label>連絡・引継ぎ事項:</label><br>
        <textarea id="relayInfo" rows="3" style="width:100%;">${riVal}</textarea>
      </div>
    </div>
  `;

  // ボタン
  let buttonSection = `
    <div style="margin-top:10px;">
      <button id="toConfirmBtn"
              style="background:#007bff; color:#fff; border:none; padding:6px 12px; border-radius:4px;"
              onclick="storeDetailValuesAndGoConfirm()">
        確認画面へ
      </button>
      <button id="backBasicBtn"
              style="margin-left:15px; background:none; color:#333; border:1px solid #ccc; padding:6px 12px; border-radius:4px;"
              onclick="openDailyReport()">
        基本情報入力へ戻る
      </button>
    </div>
  `;

  const html = `
    <h2>業務日誌 詳細入力</h2>
    ${frame1}
    ${frame2}
    ${frame3}
    ${buttonSection}
  `;

  dc.innerHTML = html;
}

/**
 * 「確認画面へ」ボタンで呼ばれる関数
 */
function storeDetailValuesAndGoConfirm() {
  // (枠2) 昼食,夕食,朝食
  const lunchInput      = document.getElementById("lunchMealInput");
  const dinnerInput     = document.getElementById("dinnerMealInput");
  const breakfastInput  = document.getElementById("breakfastMealInput");

  if (lunchInput) {
    tempDailyReportData.lunch = lunchInput.value;
  }
  if (dinnerInput) {
    tempDailyReportData.dinner = dinnerInput.value;
  }
  if (breakfastInput) {
    tempDailyReportData.breakfast = breakfastInput.value;
  }

  // (枠3)
  const bc = document.getElementById("businessContent");
  const ri = document.getElementById("relayInfo");
  tempDailyReportData.businessContent = bc?.value || "";
  tempDailyReportData.relayInfo      = ri?.value || "";

  openDailyReportConfirm();
}

/**
 * 業務日誌 確認画面
 */
function openDailyReportConfirm() {
  // 画面切り替え時に上部へスクロール
  window.scrollTo(0, 0);

  const dh = document.getElementById("detail-header");
  const dc = document.getElementById("detail-content");
  dh.innerText = "業務日誌 確認画面";

  const dateValue       = tempDailyReportData.dateValue      || "(未入力)";
  const staffDay        = tempDailyReportData.staffDay       || "";
  const staffDayTime    = tempDailyReportData.staffDayTime   || "";
  const staffNight      = tempDailyReportData.staffNight     || "";
  const staffNightTime  = tempDailyReportData.staffNightTime || "";
  const staffExtra      = tempDailyReportData.staffExtra     || "";
  const staffExtraTime  = tempDailyReportData.staffExtraTime || "";
  const isDaytime       = tempDailyReportData.isDaytime;
  const hasExtraStaff   = tempDailyReportData.hasExtraStaff;

  const lunchVal        = tempDailyReportData.lunch     || "";
  const dinnerVal       = tempDailyReportData.dinner    || "";
  const breakfastVal    = tempDailyReportData.breakfast || "";
  const bcVal           = tempDailyReportData.businessContent || "";
  const riVal           = tempDailyReportData.relayInfo       || "";

  let frame1 = `
    <div style="border:2px solid #444; padding:10px; margin-bottom:10px; border-radius:6px;">
      <h3 style="font-size:1.1rem; margin-bottom:6px;">枠1: 日時・スタッフ名</h3>
      <p style="font-size:1rem;"><strong>記録日:</strong> ${dateValue}</p>
      ${
        isDaytime
          ? `<p style="font-size:1rem;"><strong>日中スタッフ:</strong> ${staffDay} (${staffDayTime})</p>`
          : ""
      }
      <p style="font-size:1rem;"><strong>夜勤スタッフ:</strong> ${staffNight}${staffNightTime? ` (${staffNightTime})`:""}</p>
      ${
        hasExtraStaff
          ? `<p style="font-size:1rem;"><strong>追加スタッフ:</strong> ${staffExtra} (${staffExtraTime})</p>`
          : ""
      }
    </div>
  `;

  let lunchLine = isDaytime ? `<p style="font-size:1rem;"><strong>昼食:</strong> ${lunchVal}</p>` : "";
  let frame2 = `
    <div style="border:2px solid #444; padding:10px; margin-bottom:10px; border-radius:6px;">
      <h3 style="font-size:1.1rem; margin-bottom:6px;">枠2: 食事の献立</h3>
      ${lunchLine}
      <p style="font-size:1rem;"><strong>夕食:</strong> ${dinnerVal}</p>
      <p style="font-size:1rem;"><strong>朝食:</strong> ${breakfastVal}</p>
    </div>
  `;

  let frame3 = `
    <div style="border:2px solid #444; padding:10px; margin-bottom:10px; border-radius:6px;">
      <h3 style="font-size:1.1rem; margin-bottom:6px;">枠3: 当日業務の報告</h3>
      <p style="font-size:1rem;"><strong>業務内容:</strong><br>
        <span>${bcVal}</span>
      </p>
      <hr style="margin:8px 0;">
      <p style="font-size:1rem;"><strong>連絡・引継ぎ事項:</strong><br>
        <span>${riVal}</span>
      </p>
      <hr style="margin:8px 0;">
      <p style="font-size:1rem;">
        <strong>管理者確認:</strong> (初回保存時は必ず未完了)
      </p>
    </div>
  `;

  let buttonSection = `
    <div style="margin-top:10px;">
      <button style="background:#007bff; color:#fff; border:none; padding:6px 12px; border-radius:4px;"
              onclick="saveDailyReportToDB()">
        保存
      </button>
      <button style="margin-left:15px; background:#ffcc00; color:#333; border:none; padding:6px 12px; border-radius:4px;"
              onclick="openDailyReportCreate()">
        修正
      </button>
      <button style="margin-left:15px; background:none; color:#333; border:1px solid #ccc; padding:6px 12px; border-radius:4px;"
              onclick="openDailyReport()">
        基本情報入力へ
      </button>
    </div>
  `;

  const html = `
    <h2>業務日誌 確認</h2>
    ${frame1}
    ${frame2}
    ${frame3}
    ${buttonSection}
  `;

  dc.innerHTML = html;

  tempDailyReportData.managerCheck = "off";
}

/**
 * DB保存 → 保存後は "基本情報入力" 画面へ戻る
 */
function saveDailyReportToDB() {
  const fd = new FormData();
  fd.append("report_date", tempDailyReportData.dateValue || "");
  fd.append("user_name", "共通日報");

  // スタッフ
  fd.append("staff_day", tempDailyReportData.isDaytime ? (tempDailyReportData.staffDay||"") : "");
  fd.append("staff_night", tempDailyReportData.staffNight||"");
  fd.append("staff_extra", tempDailyReportData.hasExtraStaff ? (tempDailyReportData.staffExtra||"") : "");

  // メニュー
  fd.append("lunch_menu", tempDailyReportData.lunch || "");
  fd.append("dinner_menu", tempDailyReportData.dinner || "");
  fd.append("breakfast_menu", tempDailyReportData.breakfast || "");

  // 夜間巡視
  fd.append("check_23", tempDailyReportData.check23 || "");
  fd.append("check_1", tempDailyReportData.check1  || "");
  fd.append("check_3", tempDailyReportData.check3  || "");

  // content_json に 業務内容,連絡事項,managerCheck=off
  const contentObj = {
    businessContent: tempDailyReportData.businessContent || "",
    relayInfo: tempDailyReportData.relayInfo || "",
    managerCheck: "off"
  };
  fd.append("content_json", JSON.stringify(contentObj));

  fetch("/save_daily_report", { method:"POST", body: fd })
    .then(r => r.text())
    .then(newId => {
      let showMonthDay = tempDailyReportData.dateValue || "";
      if (showMonthDay.match(/^(\d{4})-(\d{2})-(\d{2})$/)) {
        const [_, yy, mm, dd] = showMonthDay.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        showMonthDay = `${parseInt(mm,10)}月${parseInt(dd,10)}日`;
      }
      alert(`${showMonthDay}の業務日誌を保存しました (ID:${newId}).`);
      // 保存後 → 基本情報入力へ
      openDailyReport();
    })
    .catch(err => {
      console.error(err);
      alert("エラー: " + err);
    });
}
/********************************************
  Block #8b: 業務日誌表示 (一覧検索 / 管理者確認など)
********************************************/

// 検索期間を保持して再表示に使う
let gDailyReportStartDate = "";
let gDailyReportEndDate   = "";

/**
 * 業務日誌表示画面 (一覧検索)
 */
function openDailyReportDisplay() {
  // 画面切り替え時に上部へスクロール
  window.scrollTo(0, 0);

  const detailHeader = document.getElementById("detail-header");
  const detailContent = document.getElementById("detail-content");

  detailHeader.innerText = "業務日誌 表示";

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = ("0" + (today.getMonth() + 1)).slice(-2);
  const dd = ("0" + today.getDate()).slice(-2);
  const defaultToday = `${yyyy}-${mm}-${dd}`;

  // gDailyReportStartDate が保存されていればそれを表示
  const startVal = gDailyReportStartDate || defaultToday;
  const endVal   = gDailyReportEndDate   || defaultToday;

  const html = `
    <div style="border:2px solid #00a0c0; padding:10px; margin-bottom:10px; border-radius:4px;">
      <h3>日付・期間を指定</h3>
      <p>同じ日付を両方に入力すると1日のみ表示。</p>
      <div style="margin:5px 0;">
        開始日 <input type="date" id="report-start" value="${startVal}">
        終了日 <input type="date" id="report-end" value="${endVal}">
        <button onclick="fetchDailyReportsByRange()">表示</button>
      </div>
    </div>

    <div id="daily-report-result" style="border:2px solid #ccc; padding:10px; border-radius:4px;">
      <!-- 一覧表示部分 -->
    </div>

    <!-- PDFモーダル -->
    <div id="pdf-modal" class="modal" style="display:none;">
      <div class="modal-content">
        <span class="modal-close" onclick="closePdfModal()">×</span>
        <div style="margin-bottom:10px;">
          <button onclick="printPdf()">印刷</button>
        </div>
        <iframe id="pdf-iframe" style="width:100%; height:600px;"></iframe>
      </div>
    </div>
  `;

  detailContent.innerHTML = html;

  // モーダル背景クリックで閉じる
  const pdfModalBg = document.getElementById("pdf-modal");
  if (pdfModalBg) {
    pdfModalBg.addEventListener("click", (evt) => {
      if (evt.target.id === "pdf-modal") {
        closePdfModal();
      }
    });
  }

  // もし既に検索期間があれば自動で検索
  if (gDailyReportStartDate && gDailyReportEndDate) {
    fetchDailyReportsByRange();
  }
}

function fetchDailyReportsByRange() {
  const startDate = document.getElementById("report-start").value;
  const endDate = document.getElementById("report-end").value;

  if (!startDate || !endDate) {
    alert("開始日と終了日を入力してください。");
    return;
  }
  // グローバルに保存
  gDailyReportStartDate = startDate;
  gDailyReportEndDate   = endDate;

  const url = `/daily_reports?start_date=${startDate}&end_date=${endDate}`;
  fetch(url)
    .then(r => r.json())
    .then(data => {
      if (!data.reports) {
        alert("業務日誌データがありません。");
        return;
      }
      renderDailyReportList(data.reports);
    })
    .catch(err => {
      alert("エラー:" + err);
    });
}

function renderDailyReportList(reportList) {
  const container = document.getElementById("daily-report-result");
  if (!reportList || reportList.length === 0) {
    container.innerHTML = "<p>該当する日報はありません。</p>";
    return;
  }

  const dailyMap = {};
  reportList.forEach(item => {
    if (!dailyMap[item.report_date]) {
      dailyMap[item.report_date] = [];
    }
    dailyMap[item.report_date].push(item);
  });

  const sortedDates = Object.keys(dailyMap).sort();
  let html = "";

  sortedDates.forEach(dateStr => {
    let mmddLabel = dateStr;
    if (dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/)) {
      const [_, y, m, d] = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      mmddLabel = `${parseInt(m,10)}月${parseInt(d,10)}日`;
    }

    const items = dailyMap[dateStr];

    items.forEach(rep => {
      const managerLabel = (rep.status === "済")
        ? `<span style="color:green; font-weight:bold;">完了</span>`
        : `<span style="color:red; font-weight:bold;">未完了</span>`;

      let pdfDisabled = "";
      let pdfBtnStyle = "background: #00aa00; color:#fff;";
      if (rep.status !== "済") {
        pdfDisabled = "disabled";
        pdfBtnStyle = "background:#b3dab3; color:#fff;";
      }

      html += `
        <div style="margin:6px 0; display:flex; align-items:center; justify-content:space-between; padding:4px; border-bottom:1px solid #ccc;">
          <div>
            <span style="font-weight:bold; margin-right:8px;">${mmddLabel} 業務日報</span>
            【管理者確認(${managerLabel})】
          </div>

          <div style="display:flex; gap:4px;">
            <button style="background:#007bff; color:#fff; border:none; padding:4px 8px; border-radius:4px;"
                    onclick="openDailyReportManagerConfirm(${rep.id})">
              管理者確認
            </button>
            <button style="background:#cc3333; color:#fff; border:none; padding:4px 8px; border-radius:4px;"
                    onclick="deleteDailyReportConfirm(${rep.id}, '${dateStr}')">
              削除
            </button>
            <button style="${pdfBtnStyle} border:none; padding:4px 8px; border-radius:4px;"
                    onclick="openDailyReportPdfModal(${rep.id})"
                    ${pdfDisabled}>
              PDF印刷
            </button>
          </div>
        </div>
      `;
    });
  });

  if (!html) {
    html = "<p>該当する日報はありません。</p>";
  }
  container.innerHTML = html;
}

/**
 * 業務日誌 管理者確認画面
 * (従来の confirmDailyReport を一部改変し、ボタン構成を変えます)
 */
function openDailyReportManagerConfirm(reportId) {
  // 画面切り替え時に上部へスクロール
  window.scrollTo(0, 0);

  fetch("/show_daily_report/" + reportId)
    .then(r => r.json())
    .then(data => {
      if (!data || data.error) {
        alert("該当の日報がありません。");
        return;
      }
      let cObj = {};
      try {
        cObj = JSON.parse(data.content_json || "{}");
      } catch(e) {}

      const managerCheckVal = cObj.managerCheck || "off";

      let dateStr = data.report_date || "";
      let mmddLabel = dateStr;
      if (dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/)) {
        const [_, y, m, d] = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        mmddLabel = `${parseInt(m,10)}月${parseInt(d,10)}日`;
      }

      const detailHeader = document.getElementById("detail-header");
      const detailContent = document.getElementById("detail-content");
      detailHeader.innerText = "業務日誌 管理者確認画面";

      // managerCheckの表示
      let mgrStateLabel = (managerCheckVal === "on")
        ? `<span style="color:green; font-weight:bold;">完了</span>`
        : `<span style="color:red; font-weight:bold;">未完了</span>`;
      let mgrChecked = (managerCheckVal === "on") ? "checked" : "";

      // 内容表示
      let bcVal = cObj.businessContent || "";
      let riVal = cObj.relayInfo || "";

      let html = `
        <h2>業務日誌 管理者確認 (ID:${data.id})</h2>
        <div style="border:2px solid #444; border-radius:6px; padding:10px; margin-bottom:10px;">
          <h3 style="font-size:1.1rem; margin-bottom:6px;">日時・スタッフ名</h3>
          <p><strong>記録日:</strong> ${mmddLabel}</p>
          ${
            data.staff_day
              ? `<p><strong>日中スタッフ:</strong> ${data.staff_day}</p>`
              : ""
          }
          <p><strong>夜勤スタッフ:</strong> ${data.staff_night || ""}</p>
          ${
            data.staff_extra
              ? `<p><strong>追加スタッフ:</strong> ${data.staff_extra}</p>`
              : ""
          }
        </div>
        <div style="border:2px solid #444; border-radius:6px; padding:10px; margin-bottom:10px;">
          <h3>食事の献立</h3>
          ${
            data.staff_day && data.lunch_menu
              ? `<p><strong>昼食:</strong> ${data.lunch_menu}</p>`
              : ""
          }
          <p><strong>夕食:</strong> ${data.dinner_menu || ""}</p>
          <p><strong>朝食:</strong> ${data.breakfast_menu || ""}</p>
        </div>
        <div style="border:2px solid #444; border-radius:6px; padding:10px; margin-bottom:10px;">
          <h3>業務内容・連絡事項</h3>
          <p><strong>業務内容:</strong><br>${bcVal}</p>
          <hr/>
          <p><strong>連絡・引継ぎ事項:</strong><br>${riVal}</p>
        </div>

        <div style="border:2px solid #444; border-radius:6px; padding:10px;">
          <h3>管理者確認</h3>
          <label>
            <input type="checkbox" id="managerCheck" ${mgrChecked}>
            管理者確認
          </label>
          <p style="margin-top:6px;"><strong>現在の状態:</strong> ${mgrStateLabel}</p>
          <div style="margin-top:10px;">
            <button onclick="saveManagerCheck(${data.id})"
                    style="background:#007bff; color:#fff; border:none; padding:6px 12px; border-radius:4px;"
            >
              管理者確認を更新
            </button>
          </div>
        </div>

        <div style="margin-top:10px;">
          <button
            style="background:#ffcc00; color:#333; border:none; padding:6px 12px; border-radius:4px; margin-right:15px;"
            onclick="openDailyReportManagerEdit(${data.id})">
            修正
          </button>
          <button
            style="background:none; color:#333; border:1px solid #ccc; padding:6px 12px; border-radius:4px;"
            onclick="returnToDailyReportList()">
            一覧に戻る
          </button>
        </div>
      `;

      detailContent.innerHTML = html;
    })
    .catch(err => {
      alert("エラー: " + err);
    });
}

function saveManagerCheck(reportId) {
  const checked = document.getElementById("managerCheck").checked;

  fetch("/show_daily_report/" + reportId)
    .then(r => r.json())
    .then(data => {
      if (!data || data.error) {
        alert("日報が見つかりません。");
        return;
      }
      let cObj = {};
      try {
        cObj = JSON.parse(data.content_json || "{}");
      } catch(e) {}

      cObj.managerCheck = checked ? "on" : "off";

      const fd = new FormData();
      fd.append("report_date", data.report_date || "");
      fd.append("user_name", data.user_name || "");
      fd.append("staff_day", data.staff_day || "");
      fd.append("staff_night", data.staff_night || "");
      fd.append("staff_extra", data.staff_extra || "");
      fd.append("lunch_menu", data.lunch_menu || "");
      fd.append("dinner_menu", data.dinner_menu || "");
      fd.append("breakfast_menu", data.breakfast_menu || "");
      fd.append("check_23", data.check_23 || "");
      fd.append("check_1", data.check_1 || "");
      fd.append("check_3", data.check_3 || "");
      fd.append("content_json", JSON.stringify(cObj));

      fetch("/save_daily_report", { method: "POST", body: fd })
        .then(r => r.text())
        .then(res => {
          alert("管理者確認を更新しました。");
          openDailyReportManagerConfirm(reportId);
        })
        .catch(err => {
          alert("保存中にエラー:" + err);
        });
    })
    .catch(err => {
      alert("エラー:" + err);
    });
}

/**
 * 業務日誌 管理者修正画面
 * → 従来の editDailyReport に似た処理 + ボタン違い
 */
function openDailyReportManagerEdit(reportId) {
  // 画面切り替え時に上部へスクロール
  window.scrollTo(0, 0);

  fetch("/show_daily_report/" + reportId)
    .then(r => r.json())
    .then(data => {
      if (!data || data.error) {
        alert("日報が見つかりません");
        return;
      }
      let cObj = {};
      try {
        cObj = JSON.parse(data.content_json || "{}");
      } catch(e){}

      // tempDailyReportData に再格納
      tempDailyReportData.dateValue     = data.report_date  || "";
      tempDailyReportData.staffDay      = data.staff_day    || "";
      tempDailyReportData.staffNight    = data.staff_night  || "";
      tempDailyReportData.staffExtra    = data.staff_extra  || "";
      tempDailyReportData.lunch         = data.lunch_menu   || "";
      tempDailyReportData.dinner        = data.dinner_menu  || "";
      tempDailyReportData.breakfast     = data.breakfast_menu||"";
      tempDailyReportData.check23       = data.check_23     || "";
      tempDailyReportData.check1        = data.check_1      || "";
      tempDailyReportData.check3        = data.check_3      || "";

      tempDailyReportData.managerCheck   = cObj.managerCheck || "off";
      tempDailyReportData.businessContent= cObj.businessContent||"";
      tempDailyReportData.relayInfo      = cObj.relayInfo||"";

      // もし content_json 内に勤務時間があれば
      tempDailyReportData.staffDayTime   = cObj.day_time   || "";
      tempDailyReportData.staffNightTime = cObj.night_time || "";
      tempDailyReportData.staffExtraTime = cObj.extra_time || "";

      tempDailyReportData.isDaytime      = !!data.staff_day;
      tempDailyReportData.hasExtraStaff  = !!data.staff_extra;

      // 管理者修正画面 (業務日誌詳細入力画面のデザイン + 管理者向けボタン)
      openDailyReportManagerEditForm(reportId);
    })
    .catch(err => {
      alert("エラー:"+err);
    });
}

/**
 * 業務日誌 管理者修正画面フォーム (実際の描画)
 */
function openDailyReportManagerEditForm(reportId) {
  const dh = document.getElementById("detail-header");
  const dc = document.getElementById("detail-content");
  dh.innerText = "業務日誌 管理者修正画面";

  // (実質、業務日誌詳細入力画面 + 最終ボタンは「管理者確認」)
  // ここでは既に tempDailyReportData に修正対象のデータが詰まっている前提

  // (枠1)
  let frame1 = `
    <div style="border:2px solid #444; padding:10px; margin-bottom:10px; border-radius:6px;">
      <h3 style="font-size:1.1rem; margin-bottom:6px;">枠1: 日時・スタッフ名</h3>
      <p><strong>記録日:</strong> ${tempDailyReportData.dateValue}</p>
      ${
        tempDailyReportData.isDaytime
          ? `<p><strong>日中スタッフ:</strong> ${tempDailyReportData.staffDay} (${tempDailyReportData.staffDayTime||""})</p>`
          : ""
      }
      <p><strong>夜勤スタッフ:</strong> ${tempDailyReportData.staffNight} (${tempDailyReportData.staffNightTime||""})</p>
      ${
        tempDailyReportData.hasExtraStaff
          ? `<p><strong>追加スタッフ:</strong> ${tempDailyReportData.staffExtra} (${tempDailyReportData.staffExtraTime||""})</p>`
          : ""
      }
    </div>
  `;

  // (枠2)
  let lunchBlock = tempDailyReportData.isDaytime ? `
    <div style="margin:4px 0;">
      <strong>昼食の献立:</strong>
      <input type="text" id="lunchMealInputMgr" size="60" value="${tempDailyReportData.lunch || ""}" />
    </div>
  ` : "";

  let frame2 = `
    <div style="border:2px solid #444; padding:10px; margin-bottom:10px; border-radius:6px;">
      <h3>枠2: 食事の献立</h3>
      ${lunchBlock}
      <div style="margin:4px 0;">
        <strong>夕食の献立:</strong>
        <input type="text" id="dinnerMealInputMgr" size="60" value="${tempDailyReportData.dinner || ""}" />
      </div>
      <div style="margin:4px 0;">
        <strong>朝食の献立:</strong>
        <input type="text" id="breakfastMealInputMgr" size="60" value="${tempDailyReportData.breakfast || ""}" />
      </div>
    </div>
  `;

  // (枠3)
  let frame3 = `
    <div style="border:2px solid #444; padding:10px; margin-bottom:10px; border-radius:6px;">
      <h3>枠3: 当日業務の報告</h3>
      <div style="margin:4px 0;">
        <label>業務内容:</label><br>
        <textarea id="businessContentMgr" rows="3" style="width:100%;">${tempDailyReportData.businessContent||""}</textarea>
      </div>
      <div style="margin:4px 0;">
        <label>連絡・引継ぎ事項:</label><br>
        <textarea id="relayInfoMgr" rows="3" style="width:100%;">${tempDailyReportData.relayInfo||""}</textarea>
      </div>
    </div>
  `;

  // ボタン: 「管理者確認」→ openDailyReportManagerConfirm(reportId)
  let buttonSection = `
    <div style="margin-top:10px;">
      <button
        style="background:#007bff; color:#fff; border:none; padding:6px 12px; border-radius:4px;"
        onclick="saveDailyReportManagerEdit(${reportId})"
      >
        管理者確認
      </button>
      <button
        style="margin-left:15px; background:none; color:#333; border:1px solid #ccc; padding:6px 12px; border-radius:4px;"
        onclick="returnToDailyReportList()"
      >
        一覧に戻る
      </button>
    </div>
  `;

  const html = `
    <h2>業務日誌 管理者修正</h2>
    ${frame1}
    ${frame2}
    ${frame3}
    ${buttonSection}
  `;
  dc.innerHTML = html;
}

function saveDailyReportManagerEdit(reportId) {
  // 変更を tempDailyReportData に再格納
  const lunchEl   = document.getElementById("lunchMealInputMgr");
  const dinnerEl  = document.getElementById("dinnerMealInputMgr");
  const breakEl   = document.getElementById("breakfastMealInputMgr");
  const bc        = document.getElementById("businessContentMgr");
  const ri        = document.getElementById("relayInfoMgr");

  if(lunchEl) tempDailyReportData.lunch = lunchEl.value;
  if(dinnerEl) tempDailyReportData.dinner = dinnerEl.value;
  if(breakEl) tempDailyReportData.breakfast = breakEl.value;
  if(bc) tempDailyReportData.businessContent = bc.value;
  if(ri) tempDailyReportData.relayInfo = ri.value;

  // DB更新
  const fd = new FormData();
  fd.append("report_date", tempDailyReportData.dateValue || "");
  fd.append("user_name", "共通日報");

  fd.append("staff_day", tempDailyReportData.isDaytime ? (tempDailyReportData.staffDay||"") : "");
  fd.append("staff_night", tempDailyReportData.staffNight||"");
  fd.append("staff_extra", tempDailyReportData.hasExtraStaff ? (tempDailyReportData.staffExtra||"") : "");

  fd.append("lunch_menu", tempDailyReportData.lunch || "");
  fd.append("dinner_menu", tempDailyReportData.dinner || "");
  fd.append("breakfast_menu", tempDailyReportData.breakfast || "");

  fd.append("check_23", tempDailyReportData.check23 || "");
  fd.append("check_1", tempDailyReportData.check1 || "");
  fd.append("check_3", tempDailyReportData.check3 || "");

  const contentObj = {
    businessContent: tempDailyReportData.businessContent || "",
    relayInfo: tempDailyReportData.relayInfo || "",
    managerCheck: tempDailyReportData.managerCheck || "off"
  };
  fd.append("content_json", JSON.stringify(contentObj));

  fetch("/save_daily_report", { method:"POST", body:fd })
    .then(r=>r.text())
    .then(msg=>{
      alert("修正内容を保存しました。");
      // → 管理者確認画面へ
      openDailyReportManagerConfirm(reportId);
    })
    .catch(err=> alert("エラー:"+err));
}

/**
 * 削除確認
 */
function deleteDailyReportConfirm(reportId, dateStr) {
  let mmdd = dateStr;
  if (dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/)) {
    const [_, y, m, d] = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    mmdd = `${parseInt(m,10)}月${parseInt(d,10)}日`;
  }
  const ok = confirm(`${mmdd}の業務日誌を削除してもよろしいですか？\n(元に戻すことはできません)`);
  if (!ok) return;

  const fd = new FormData();
  fd.append("report_id", reportId);
  fetch("/delete_daily_report", { method:"POST", body:fd })
    .then(r=>r.text())
    .then(msg=>{
      if(msg==="ok"){
        alert(`${mmdd}の業務日誌を削除しました。`);
        // 再検索
        openDailyReportDisplay();
      } else {
        alert("削除に失敗: " + msg);
      }
    })
    .catch(err=>{
      alert("エラー:"+err);
    });
}

/**
 * PDFモーダルを開く
 */
function openDailyReportPdfModal(reportId) {
  const pdfModal = document.getElementById("pdf-modal");
  const iframe = document.getElementById("pdf-iframe");
  iframe.src = `/daily_report_pdf/${reportId}`;
  pdfModal.style.display = "block";
}

function closePdfModal() {
  const pdfModal = document.getElementById("pdf-modal");
  const iframe = document.getElementById("pdf-iframe");
  pdfModal.style.display = "none";
  iframe.src = "";
}

function printPdf() {
  const iframe = document.getElementById("pdf-iframe");
  iframe.contentWindow.print();
}


/********************************************
  Block #9a: サービス提供記録 (入力 ~ 確認)
********************************************/

let tempServiceRecordData = {};

/**
 * 利用者IDと名前を受け取って、サービス提供記録の入力フォームを表示
 */
function openServiceRecordUser(userId, userName) {
  // 画面切り替え時に上部へスクロール
  window.scrollTo(0, 0);

  const detailHeader = document.getElementById("detail-header");
  const detailContent = document.getElementById("detail-content");

  // 業務日誌入力フォームから共通情報を取得
  const dateValue       = document.getElementById("daily-date")?.value || "";
  const isDaytime       = !!document.getElementById("daytimeCheck")?.checked;
  const hasExtraStaff   = !!document.getElementById("extraStaff")?.checked;
  const staffDay        = document.getElementById("daily-staff-day")?.value || "";
  const staffDayTime    = document.getElementById("daily-staff-day-time")?.value || "";
  const staffNight      = document.getElementById("daily-staff-night")?.value || "";
  const staffNightTime  = document.getElementById("daily-staff-night-time")?.value || "";
  const staffExtra      = document.getElementById("daily-staff-extra")?.value || "";
  const staffExtraTime  = document.getElementById("daily-staff-extra-time")?.value || "";
  const lunchMenu       = document.getElementById("lunch-menu")?.value || "";
  const dinnerMenu      = document.getElementById("dinner-menu")?.value || "";
  const check23         = document.getElementById("check23")?.value || "";
  const check1          = document.getElementById("check1")?.value || "";
  const check3          = document.getElementById("check3")?.value || "";
  const breakfastMenu   = document.getElementById("breakfast-menu")?.value || "";

  detailHeader.innerText = `${userName}さんのサービス提供記録`;

  const dayDisabledAttr   = isDaytime ? "checked disabled" : "disabled";
  const extraDisabledAttr = hasExtraStaff ? "checked disabled" : "disabled";

  let html = `
    <div class="report-title">${userName}さんのサービス提供記録</div>
    <div class="report-subtitle">共通情報</div>
    <div style="margin-bottom:10px;">
      <div style="margin:4px 0;">
        <label class="report-label">記録日:</label>
        <span>${dateValue || "(未入力)"}</span>
      </div>
      <div style="margin:4px 0;">
        <label style="margin-right:20px;">日中あり
          <input type="checkbox" id="daytimeUser" ${dayDisabledAttr}>
        </label>
        <label>追加スタッフあり
          <input type="checkbox" id="extraStaffUser" ${extraDisabledAttr}>
        </label>
      </div>
      <!-- (日中スタッフ) -->
      <div id="dayUserStaff" style="display:none;">
        <div style="margin:4px 0;">
          <label class="report-label">(日中)スタッフ名:</label>
          <span>${staffDay || "---"}</span>
        </div>
        <div style="margin:4px 0;">
          <label class="report-label">勤務時間:</label>
          <span>${staffDayTime}</span>
        </div>
      </div>
      <!-- (夜間スタッフ) -->
      <div style="margin:4px 0;">
        <label class="report-label">(夜間)スタッフ名:</label>
        <span>${staffNight || "---"}</span>
      </div>
      <div style="margin:4px 0;">
        <label class="report-label">勤務時間:</label>
        <span>${staffNightTime}</span>
      </div>
      <!-- (追加スタッフ) -->
      <div id="extraStaffUserBlock" style="display:none; margin-top:8px;">
        <div style="margin:4px 0;">
          <label class="report-label">(追加)スタッフ名:</label>
          <span>${staffExtra || "---"}</span>
        </div>
        <div style="margin:4px 0;">
          <label class="report-label">勤務時間:</label>
          <span>${staffExtraTime || "---"}</span>
        </div>
      </div>
    </div>
    ${
      isDaytime
      ? `
      <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
        <div class="report-subtitle">昼食</div>
        <div style="margin:4px 0;">
          <label class="report-label">昼食の献立:</label>
          <span>${lunchMenu}</span>
        </div>
        <div style="margin:4px 0;">
          <label class="report-label">食事状況:</label>
          <select id="dayMealScore" class="select-small">
            ${
              [...Array(10).keys()].map(i => {
                let val = i+1;
                let sel = (val===10) ? "selected" : "";
                return `<option value="${val}" ${sel}>${val}</option>`;
              }).join("")
            }
          </select>/10
        </div>
        <div id="dayMealLeftBlock" style="display:none; margin:4px 0;">
          <label class="report-label">残した食事:</label>
          <input type="text" id="dayMealLeft" size="30">
        </div>
        <div style="margin:4px 0;">
          <label class="report-label">昼食後服薬</label>
          <input type="checkbox" id="dayAfterMeds">
        </div>
        <div class="report-subtitle">日中の様子</div>
        <textarea id="dayStatus" rows="2" style="width:100%;" placeholder="日中の様子等..."></textarea>
      </div>
      `
      : ``
    }
    <div class="report-subtitle">日中活動～帰宅</div>
    <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
      <div style="margin:4px 0;">
        <label class="report-label">日中活動:</label>
        <input type="text" id="daytimeActivity" value="生活介護に通所" style="width:200px;">
      </div>
      <div style="margin:4px 0;">
        <label class="report-label">帰宅時間:</label>
        <input type="time" id="homeTime" value="16:00">
      </div>
      <div style="margin:4px 0;">
        <label class="report-label">帰宅時の様子:</label>
        <select id="homeState" class="select-medium">
          <option value="">選択なし</option>
          <option value="1">1.特に気になることはありません。</option>
          <option value="2">2.少し疲れた様子</option>
          <option value="3">3.体調不良の訴え</option>
          <option value="4">4.不穏な雰囲気</option>
        </select>
      </div>
      <div id="homeStateDetailBlock" style="display:none;">
        <label class="report-label">詳細入力:</label>
        <input type="text" id="homeStateDetail" size="30">
      </div>
    </div>
    <div class="report-subtitle">夕食</div>
    <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
      <div style="margin:4px 0;">
        <label class="report-label">夕食前バイタル①:</label>
        体温<input type="text" id="dinnerTemp" size="5">℃ SpO2<input type="text" id="dinnerSpo2" size="5">
      </div>
      <div style="margin:4px 0;">
        <label class="report-label">夕食前バイタル②:</label>
        血圧<input type="text" id="dinnerBP1" size="3">/<input type="text" id="dinnerBP2" size="3">
        脈拍<input type="text" id="dinnerPulse" size="3">
      </div>
      <div style="margin:4px 0;">
        <label class="report-label">献立:</label>
        <span>${dinnerMenu || "(未設定)"}</span>
      </div>
      <div style="margin:4px 0;">
        <label class="report-label">食事状況:</label>
        <select id="dinnerMealScore" class="select-small">
          ${
            [...Array(10).keys()].map(i => {
              let val = i+1;
              let sel = (val===10) ? "selected" : "";
              return `<option value="${val}" ${sel}>${val}</option>`;
            }).join("")
          }
        </select>/10
      </div>
      <div id="dinnerMealLeftBlock" style="display:none; margin:4px 0;">
        <label class="report-label">残した食事:</label>
        <input type="text" id="dinnerMealLeft" size="30">
      </div>
      <div style="margin:4px 0;">
        <label class="report-label">夕食後服薬</label>
        <input type="checkbox" id="nightAfterMeds">
      </div>
    </div>
    <div class="report-subtitle">就寝</div>
    <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
      <p style="margin:4px 0;">
        <label class="report-label">就寝前服薬</label>
        <input type="checkbox" id="sleepMeds">
      </p>
      <p style="margin:4px 0;">
        <label class="report-label">就寝時間:</label>
        <input type="time" id="sleepTime" value="21:00">
      </p>
    </div>
    <div class="report-subtitle">夜間巡視</div>
    <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
      <div style="margin:4px 0;">
        <label class="report-label">巡視1:</label>
        <input type="text" id="check23User" size="30" value="${check23}">
      </div>
      <div style="margin:4px 0;">
        <label class="report-label">巡視2:</label>
        <input type="text" id="check1User" size="30" value="${check1}">
      </div>
      <div style="margin:4px 0;">
        <label class="report-label">巡視3:</label>
        <input type="text" id="check3User" size="30" value="${check3}">
      </div>
    </div>
    <div class="report-subtitle">起床</div>
    <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
      <p style="margin:4px 0;">
        <label class="report-label">起床時間:</label>
        <input type="time" id="wakeTime" value="07:00">
      </p>
      <p style="margin:4px 0;">
        <label class="report-label">起床時の様子:</label>
        <select id="wakeState" class="select-medium">
          <option value="">選択なし</option>
          <option value="1">1.ご自身で起床</option>
          <option value="2">2.声掛けで起床</option>
          <option value="3">3.体調不良の訴え</option>
          <option value="4">4.不穏な雰囲気</option>
          <option value="5">5.その他</option>
        </select>
      </p>
      <div id="wakeDetailBlock" style="display:none;">
        <label class="report-label">詳細入力:</label>
        <input type="text" id="wakeDetail" size="30">
      </div>
    </div>
    <div class="report-subtitle">朝食</div>
    <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
      <div style="margin:4px 0;">
        <label class="report-label">朝食前バイタル①:</label>
        体温<input type="text" id="breakfastTemp" size="5">℃ SpO2<input type="text" id="breakfastSpo2" size="5">
      </div>
      <div style="margin:4px 0;">
        <label class="report-label">朝食前バイタル②:</label>
        血圧<input type="text" id="breakfastBP1" size="3">/<input type="text" id="breakfastBP2" size="3">
        脈拍<input type="text" id="breakfastPulse" size="3">
      </div>
      <div style="margin:4px 0;">
        <label class="report-label">献立:</label>
        <span>${breakfastMenu || "(未設定)"}</span>
      </div>
      <div style="margin:4px 0;">
        <label class="report-label">食事状況:</label>
        <select id="breakfastMealScore" class="select-small">
          ${
            [...Array(10).keys()].map(i => {
              let val = i+1;
              let sel = (val===10) ? "selected" : "";
              return `<option value="${val}" ${sel}>${val}</option>`;
            }).join("")
          }
        </select>/10
      </div>
      <div id="breakfastMealLeftBlock" style="display:none;">
        <label class="report-label">残した食事:</label>
        <input type="text" id="breakfastMealLeft" size="30">
      </div>
      <div style="margin:4px 0;">
        <label class="report-label">朝食後服薬</label>
        <input type="checkbox" id="morningAfterMeds">
      </div>
    </div>

    <div class="report-subtitle">利用者の様子</div>
    <textarea id="userCondition" rows="3" style="width:100%;" placeholder="利用者の状態や気になった点などを記載"></textarea>

    <div class="report-subtitle" style="margin-top: 10px;">その他介助項目</div>
    <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
      <div style="margin:4px 0;">
        <label>
          <input type="checkbox" id="foodAssistCheck">
          食事介助
        </label>
        <span id="foodAssistDetailBlock" style="display:none; margin-left:10px;">
          <label>詳細:</label>
          <input type="text" id="foodAssistDetail" size="30">
        </span>
      </div>
      <div style="margin:4px 0;">
        <label>
          <input type="checkbox" id="bathAssistCheck">
          入浴介助
        </label>
        <span id="bathAssistDetailBlock" style="display:none; margin-left:10px;">
          <label>詳細:</label>
          <input type="text" id="bathAssistDetail" size="30">
        </span>
      </div>
      <div style="margin:4px 0;">
        <label>
          <input type="checkbox" id="excretionAssistCheck">
          排泄介助
        </label>
        <span id="excretionAssistDetailBlock" style="display:none; margin-left:10px;">
          <label>詳細:</label>
          <input type="text" id="excretionAssistDetail" size="30">
        </span>
      </div>
      <div style="margin:4px 0;">
        <label>
          <input type="checkbox" id="changeAssistCheck">
          着替えの介助
        </label>
        <span id="changeAssistDetailBlock" style="display:none; margin-left:10px;">
          <label>詳細:</label>
          <input type="text" id="changeAssistDetail" size="30">
        </span>
      </div>
      <div style="margin:4px 0;">
        <label>
          <input type="checkbox" id="lifeSupportCheck">
          生活支援
        </label>
        <span id="lifeSupportDetailBlock" style="display:none; margin-left:10px;">
          <label>詳細:</label>
          <input type="text" id="lifeSupportDetail" size="30">
        </span>
      </div>
      <div style="margin:4px 0;">
        <label>
          <input type="checkbox" id="mentalCareCheck">
          メンタルケア
        </label>
        <span id="mentalCareDetailBlock" style="display:none; margin-left:10px;">
          <label>詳細:</label>
          <input type="text" id="mentalCareDetail" size="30">
        </span>
      </div>
    </div>

    <div class="report-subtitle">個別支援</div>
    <div id="carePlanBlock" style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
      <!-- 長期目標 / 短期目標があればここに表示 -->
    </div>

    <div style="margin-top:10px;">
      <button
        style="background:#007bff; color:#fff; border:none; padding:6px 12px; border-radius:4px;"
        onclick="openServiceRecordConfirm('${userName}')"
      >
        確認画面へ
      </button>
      <button
        style="margin-left:15px; background:none; color:#333; border:1px solid #ccc; padding:6px 12px; border-radius:4px;"
        onclick="goBackToDailyReportBasic()"
      >
        基本情報入力へ
      </button>
    </div>
  `;

  detailContent.innerHTML = html;

  // (日中) / (追加)スタッフ表示
  if(isDaytime) {
    const dayUserStaff = document.getElementById("dayUserStaff");
    if(dayUserStaff) dayUserStaff.style.display = "block";
  }
  if(hasExtraStaff) {
    const extraStaffBlock = document.getElementById("extraStaffUserBlock");
    if(extraStaffBlock) extraStaffBlock.style.display = "block";
  }

  // 状態切替
  const homeStateEl = document.getElementById("homeState");
  const homeStateDetailBlock = document.getElementById("homeStateDetailBlock");
  if(homeStateEl) {
    homeStateEl.addEventListener("change", ()=>{
      if(["3","4"].includes(homeStateEl.value)){
        homeStateDetailBlock.style.display = "block";
      } else {
        homeStateDetailBlock.style.display = "none";
      }
    });
  }
  const wakeStateEl = document.getElementById("wakeState");
  const wakeDetailBlock = document.getElementById("wakeDetailBlock");
  if(wakeStateEl) {
    wakeStateEl.addEventListener("change", ()=>{
      if(["3","4","5"].includes(wakeStateEl.value)){
        wakeDetailBlock.style.display = "block";
      } else {
        wakeDetailBlock.style.display = "none";
      }
    });
  }

  // 各食事の残量
  const dayMealScore = document.getElementById("dayMealScore");
  const dayMealLeftBlock = document.getElementById("dayMealLeftBlock");
  if(dayMealScore && dayMealLeftBlock){
    dayMealScore.addEventListener("change", ()=>{
      if(+dayMealScore.value<10){
        dayMealLeftBlock.style.display = "block";
      } else {
        dayMealLeftBlock.style.display = "none";
      }
    });
    dayMealLeftBlock.style.display = "none";
  }

  const dinnerMealScore = document.getElementById("dinnerMealScore");
  const dinnerMealLeftBlock = document.getElementById("dinnerMealLeftBlock");
  if(dinnerMealScore && dinnerMealLeftBlock){
    dinnerMealScore.addEventListener("change", ()=>{
      if(+dinnerMealScore.value<10){
        dinnerMealLeftBlock.style.display = "block";
      } else {
        dinnerMealLeftBlock.style.display = "none";
      }
    });
    dinnerMealLeftBlock.style.display = "none";
  }

  const breakfastMealScore = document.getElementById("breakfastMealScore");
  const breakfastMealLeftBlock = document.getElementById("breakfastMealLeftBlock");
  if(breakfastMealScore && breakfastMealLeftBlock){
    breakfastMealScore.addEventListener("change", ()=>{
      if(+breakfastMealScore.value<10){
        breakfastMealLeftBlock.style.display = "block";
      } else {
        breakfastMealLeftBlock.style.display = "none";
      }
    });
    breakfastMealLeftBlock.style.display = "none";
  }

  // 介助チェック → 詳細入力欄
  const assistPairs = [
    {checkId:"foodAssistCheck", blockId:"foodAssistDetailBlock"},
    {checkId:"bathAssistCheck", blockId:"bathAssistDetailBlock"},
    {checkId:"excretionAssistCheck", blockId:"excretionAssistDetailBlock"},
    {checkId:"changeAssistCheck", blockId:"changeAssistDetailBlock"},
    {checkId:"lifeSupportCheck", blockId:"lifeSupportDetailBlock"},
    {checkId:"mentalCareCheck", blockId:"mentalCareDetailBlock"},
  ];
  assistPairs.forEach(pair=>{
    const chk = document.getElementById(pair.checkId);
    const blk = document.getElementById(pair.blockId);
    if(chk && blk){
      chk.addEventListener("change", ()=>{
        blk.style.display = chk.checked ? "inline-block" : "none";
      });
    }
  });

  // 保管
  tempServiceRecordData = {
    userName,
    userId,
    dateValue,
    isDaytime, hasExtraStaff,
    staffDay, staffDayTime,
    staffNight, staffNightTime,
    staffExtra, staffExtraTime,
    lunchMenu, dinnerMenu,
    check23, check1, check3,
    breakfastMenu
  };

  // 個別支援計画を取得→表示
  loadUserCarePlan(userId);
}

/**
 * 個別支援計画を取得し、carePlanBlock に 長期目標/短期目標を表示
 */
function loadUserCarePlan(userId) {
  fetch("/api/user_careplan?userId=" + userId)
    .then(r=>r.json())
    .then(plan=>{
      const block = document.getElementById("carePlanBlock");
      if(!block)return;
      let html = "";

      if(plan.longTermGoal){
        html += `
          <h4>長期目標に対する支援</h4>
          <p><strong>長期目標:</strong> ${plan.longTermGoal}</p>
          <textarea id="longTermGoalSupport" rows="2" style="width:100%;" placeholder="支援内容を記載"></textarea>
          <hr>
        `;
      }
      if(Array.isArray(plan.shortTermGoals)){
        plan.shortTermGoals.forEach(stg=>{
          html += `
            <h4>${stg.goalLabel}</h4>
            <p><strong>${stg.goalLabel}:</strong> ${stg.goal}</p>
            <p><strong>${stg.supportLabel}:</strong> ${stg.support}</p>
            <textarea id="shortTermComment${stg.index}" rows="2" style="width:100%;" placeholder="コメントを記載"></textarea>
            <hr>
          `;
        });
      }
      if(!html){
        html=`<p>個別支援計画が未登録です。</p>`;
      }
      block.innerHTML = html;
    })
    .catch(err=>{
      console.error("CarePlan取得エラー", err);
    });
}

/**
 * サービス提供記録 確認画面
 */
function openServiceRecordConfirm(userName) {
  // 上部へスクロール
  window.scrollTo(0, 0);

  const dh = document.getElementById("detail-header");
  const dc = document.getElementById("detail-content");

  // 入力画面の各項目を取得
  const daytimeActivity       = document.getElementById("daytimeActivity")?.value || "";
  const homeTime             = document.getElementById("homeTime")?.value || "";
  const homeState            = document.getElementById("homeState")?.value || "";
  const homeStateDetail      = document.getElementById("homeStateDetail")?.value || "";
  const dayMealScore         = document.getElementById("dayMealScore")?.value || "";
  const dayMealLeft          = document.getElementById("dayMealLeft")?.value || "";
  const dayAfterMeds         = document.getElementById("dayAfterMeds")?.checked ? "on" : "off";
  const dayStatus            = document.getElementById("dayStatus")?.value || "";
  const dinnerTemp           = document.getElementById("dinnerTemp")?.value || "";
  const dinnerSpo2           = document.getElementById("dinnerSpo2")?.value || "";
  const dinnerBP1            = document.getElementById("dinnerBP1")?.value || "";
  const dinnerBP2            = document.getElementById("dinnerBP2")?.value || "";
  const dinnerPulse          = document.getElementById("dinnerPulse")?.value || "";
  const dinnerMealScore      = document.getElementById("dinnerMealScore")?.value || "";
  const dinnerMealLeft       = document.getElementById("dinnerMealLeft")?.value || "";
  const nightAfterMeds       = document.getElementById("nightAfterMeds")?.checked ? "on" : "off";
  const sleepMeds            = document.getElementById("sleepMeds")?.checked ? "on" : "off";
  const sleepTime            = document.getElementById("sleepTime")?.value || "";
  const check23User          = document.getElementById("check23User")?.value || "";
  const check1User           = document.getElementById("check1User")?.value || "";
  const check3User           = document.getElementById("check3User")?.value || "";
  const wakeTime             = document.getElementById("wakeTime")?.value || "";
  const wakeState            = document.getElementById("wakeState")?.value || "";
  const wakeDetail           = document.getElementById("wakeDetail")?.value || "";
  const breakfastTemp        = document.getElementById("breakfastTemp")?.value || "";
  const breakfastSpo2        = document.getElementById("breakfastSpo2")?.value || "";
  const breakfastBP1         = document.getElementById("breakfastBP1")?.value || "";
  const breakfastBP2         = document.getElementById("breakfastBP2")?.value || "";
  const breakfastPulse       = document.getElementById("breakfastPulse")?.value || "";
  const breakfastMealScore   = document.getElementById("breakfastMealScore")?.value || "";
  const breakfastMealLeft    = document.getElementById("breakfastMealLeft")?.value || "";
  const morningAfterMeds     = document.getElementById("morningAfterMeds")?.checked ? "on" : "off";
  const userCondition        = document.getElementById("userCondition")?.value || "";

  // 介助
  const foodAssistChecked      = document.getElementById("foodAssistCheck")?.checked ? "on" : "off";
  const foodAssistDetail       = document.getElementById("foodAssistDetail")?.value || "";
  const bathAssistChecked      = document.getElementById("bathAssistCheck")?.checked ? "on" : "off";
  const bathAssistDetail       = document.getElementById("bathAssistDetail")?.value || "";
  const excretionAssistChecked = document.getElementById("excretionAssistCheck")?.checked ? "on" : "off";
  const excretionAssistDetail  = document.getElementById("excretionAssistDetail")?.value || "";
  const changeAssistChecked    = document.getElementById("changeAssistCheck")?.checked ? "on" : "off";
  const changeAssistDetail     = document.getElementById("changeAssistDetail")?.value || "";
  const lifeSupportChecked     = document.getElementById("lifeSupportCheck")?.checked ? "on" : "off";
  const lifeSupportDetail      = document.getElementById("lifeSupportDetail")?.value || "";
  const mentalCareChecked      = document.getElementById("mentalCareCheck")?.checked ? "on" : "off";
  const mentalCareDetail       = document.getElementById("mentalCareDetail")?.value || "";

  // 個別支援(長期目標コメント、短期目標コメント)
  const longTermGoalSupport = document.getElementById("longTermGoalSupport")?.value || "";
  const shortTermComments = {};
  for(let i=1; i<=5; i++){
    const el = document.getElementById(`shortTermComment${i}`);
    if(el) {
      shortTermComments[i] = el.value;
    }
  }

  // managerCheck=off(未完了)
  tempServiceRecordData = {
    ...tempServiceRecordData,
    daytimeActivity,
    homeTime, homeState, homeStateDetail,
    dayMealScore, dayMealLeft, dayAfterMeds, dayStatus,
    dinnerTemp, dinnerSpo2, dinnerBP1, dinnerBP2, dinnerPulse,
    dinnerMealScore, dinnerMealLeft, nightAfterMeds,
    sleepMeds, sleepTime,
    check23User, check1User, check3User,
    wakeTime, wakeState, wakeDetail,
    breakfastTemp, breakfastSpo2, breakfastBP1, breakfastBP2, breakfastPulse,
    breakfastMealScore, breakfastMealLeft, morningAfterMeds,
    userCondition,
    foodAssistChecked, foodAssistDetail,
    bathAssistChecked, bathAssistDetail,
    excretionAssistChecked, excretionAssistDetail,
    changeAssistChecked, changeAssistDetail,
    lifeSupportChecked, lifeSupportDetail,
    mentalCareChecked, mentalCareDetail,
    longTermGoalSupport,
    shortTermComments,
    managerCheck:"off"
  };

  dh.innerText = `${userName}さんのサービス提供記録 確認画面`;

  // 帰宅時の様子
  const homeStateLabel = getHomeStateLabel(tempServiceRecordData.homeState);
  // 起床時の様子
  const wakeStateLabel = getWakeStateLabel(tempServiceRecordData.wakeState);

  // 介助項目はonのものだけ表示
  function showAssist(label, checked, detail) {
    if(checked==="on") {
      return `<p><strong>${label}:</strong> ${checked} ${detail}</p>`;
    } else {
      return "";
    }
  }

  // 個別支援
  let stgHtml = "";
  if(tempServiceRecordData.longTermGoalSupport){
    stgHtml += `<p><strong>長期目標に対する支援:</strong><br>${tempServiceRecordData.longTermGoalSupport}</p><hr/>`;
  }
  const cKeys = Object.keys(tempServiceRecordData.shortTermComments||{});
  if(cKeys.length>0){
    cKeys.sort((a,b)=>(+a)-(+b));
    cKeys.forEach(idx=>{
      const commentVal = tempServiceRecordData.shortTermComments[idx];
      if(commentVal){
        stgHtml += `<p><strong>短期目標${idx}に対するコメント:</strong><br>${commentVal}</p><hr/>`;
      }
    });
  }

  let html = `
    <h2>${userName}さんのサービス提供記録 確認</h2>
    <div style="border:1px solid #ccc; padding:10px;">
      <p><strong>記録日:</strong> ${tempServiceRecordData.dateValue}</p>
      ${
        tempServiceRecordData.isDaytime
          ? `<p><strong>(日中)スタッフ:</strong> ${tempServiceRecordData.staffDay} (${tempServiceRecordData.staffDayTime})</p>`
          : ""
      }
      <p><strong>(夜間)スタッフ:</strong> ${tempServiceRecordData.staffNight} (${tempServiceRecordData.staffNightTime})</p>
      ${
        tempServiceRecordData.hasExtraStaff
          ? `<p><strong>(追加)スタッフ:</strong> ${tempServiceRecordData.staffExtra} (${tempServiceRecordData.staffExtraTime})</p>`
          : ""
      }
      <hr/>
      ${
        tempServiceRecordData.isDaytime
          ? `<p><strong>昼食:</strong> 残量:${tempServiceRecordData.dayMealScore}/10 ${tempServiceRecordData.dayMealLeft? "残:"+tempServiceRecordData.dayMealLeft:""}</p>
             <p><strong>日中の様子:</strong> ${tempServiceRecordData.dayStatus}</p>`
          : ""
      }
      <p><strong>日中活動:</strong> ${tempServiceRecordData.daytimeActivity}</p>
      <p><strong>帰宅時間:</strong> ${tempServiceRecordData.homeTime}</p>
      <p><strong>帰宅時の様子:</strong> ${homeStateLabel} ${tempServiceRecordData.homeStateDetail}</p>
      <hr/>
      <p><strong>夕食バイタル:</strong> 体温:${tempServiceRecordData.dinnerTemp}℃ / SpO2:${tempServiceRecordData.dinnerSpo2}</p>
      <p>血圧:${tempServiceRecordData.dinnerBP1}/${tempServiceRecordData.dinnerBP2}, 脈拍:${tempServiceRecordData.dinnerPulse}</p>
      <p><strong>夕食:</strong> 残量:${tempServiceRecordData.dinnerMealScore}/10 ${tempServiceRecordData.dinnerMealLeft? "残:"+tempServiceRecordData.dinnerMealLeft:""}</p>
      <hr/>
      <p><strong>就寝前服薬:</strong> ${tempServiceRecordData.sleepMeds}</p>
      <p><strong>就寝時間:</strong> ${tempServiceRecordData.sleepTime}</p>
      <hr/>
      <p><strong>巡視1:</strong> ${tempServiceRecordData.check23User}</p>
      <p><strong>巡視2:</strong> ${tempServiceRecordData.check1User}</p>
      <p><strong>巡視3:</strong> ${tempServiceRecordData.check3User}</p>
      <hr/>
      <p><strong>起床時間:</strong> ${tempServiceRecordData.wakeTime}</p>
      <p><strong>起床時の様子:</strong> ${wakeStateLabel} ${tempServiceRecordData.wakeDetail}</p>
      <hr/>
      <p><strong>朝食:</strong> 残量:${tempServiceRecordData.breakfastMealScore}/10 ${tempServiceRecordData.breakfastMealLeft? "残:"+tempServiceRecordData.breakfastMealLeft:""}</p>
      <p><strong>利用者の様子:</strong> ${tempServiceRecordData.userCondition}</p>
      <hr/>
      <p><strong>介助項目:</strong></p>
      ${showAssist("食事介助", tempServiceRecordData.foodAssistChecked, tempServiceRecordData.foodAssistDetail)}
      ${showAssist("入浴介助", tempServiceRecordData.bathAssistChecked, tempServiceRecordData.bathAssistDetail)}
      ${showAssist("排泄介助", tempServiceRecordData.excretionAssistChecked, tempServiceRecordData.excretionAssistDetail)}
      ${showAssist("着替え介助", tempServiceRecordData.changeAssistChecked, tempServiceRecordData.changeAssistDetail)}
      ${showAssist("生活支援", tempServiceRecordData.lifeSupportChecked, tempServiceRecordData.lifeSupportDetail)}
      ${showAssist("メンタルケア", tempServiceRecordData.mentalCareChecked, tempServiceRecordData.mentalCareDetail)}
      <hr/>
      ${stgHtml}
    </div>
    <div style="margin-top:10px;">
      <button
        style="background:#007bff; color:#fff; border:none; padding:6px 12px; border-radius:4px;"
        onclick="saveServiceRecordToDB()"
      >
        保存
      </button>
      <button
        style="margin-left:15px; background:#ffcc00; color:#333; border:none; padding:6px 12px; border-radius:4px;"
        onclick="openServiceRecordUser('${tempServiceRecordData.userId}', '${userName}')"
      >
        修正
      </button>
      <button
        style="margin-left:15px; background:none; color:#333; border:1px solid #ccc; padding:6px 12px; border-radius:4px;"
        onclick="goBackToDailyReportBasic()"
      >
        基本情報入力へ
      </button>
    </div>
  `;

  dc.innerHTML = html;
}

/** DBへ保存 (managerCheck="off") → 保存後は「基本情報入力へ」 */
function saveServiceRecordToDB() {
  const recordData = {...tempServiceRecordData};

  const fd = new FormData();
  fd.append("service_record_json", JSON.stringify(recordData));

  fetch("/save_service_record", { method:"POST", body: fd })
    .then(r=>r.text())
    .then(newId=>{
      alert("サービス提供記録を保存しました (ID:"+newId+")");
      goBackToDailyReportBasic();
    })
    .catch(err=>{
      alert("保存エラー:"+err);
    });
}

/********************************************
  Block #9b: サービス提供記録表示 (一覧検索/管理者確認など)
********************************************/

/**
 * グローバル変数:
 * ※ Block #9a ですでに「let tempServiceRecordData = {};」を定義している想定。
 *   ここでは再宣言しない。Block #9a と同じ変数を使う。
 */

// ヘルパー(帰宅時の様子ラベル)
function getHomeStateLabel(value) {
  switch (value) {
    case "1": return "特に気になることはありません。";
    case "2": return "少し疲れた様子";
    case "3": return "体調不良の訴え";
    case "4": return "不穏な雰囲気";
    default:  return value || "";
  }
}

// ヘルパー(起床時の様子ラベル)
function getWakeStateLabel(value) {
  switch (value) {
    case "1": return "ご自身で起床";
    case "2": return "声掛けで起床";
    case "3": return "体調不良の訴え";
    case "4": return "不穏な雰囲気";
    case "5": return "その他";
    default:  return value || "";
  }
}

/**
 * 一覧画面
 */
function openServiceRecordDisplay() {
  // 上部へスクロール
  window.scrollTo(0, 0);

  const dh = document.getElementById("detail-header");
  const dc = document.getElementById("detail-content");

  dh.innerText = "サービス提供記録の確認/印刷";

  const td = new Date();
  const yyyy = td.getFullYear();
  const mm = ("0" + (td.getMonth() + 1)).slice(-2);
  const dd = ("0" + td.getDate()).slice(-2);
  const defaultToday = `${yyyy}-${mm}-${dd}`;

  let html = `
    <div style="border:2px solid #00a0c0; padding:10px; margin-bottom:10px; border-radius:4px;">
      <h3>日付・期間を指定</h3>
      <p>同じ日付を両方に入力すると1日のみ表示。</p>
      <div style="margin:5px 0;">
        開始日 <input type="date" id="svc-start" value="${defaultToday}">
        終了日 <input type="date" id="svc-end" value="${defaultToday}">
        <button onclick="fetchServiceRecordsByRange()">表示</button>
      </div>
    </div>
    <div id="service-record-result" style="border:2px solid #ccc; padding:10px; border-radius:4px;">
      <!-- 検索結果表示 -->
    </div>

    <!-- PDFモーダル(サービス提供記録) -->
    <div id="svc-pdf-modal" class="modal" style="display:none;">
      <div class="modal-content">
        <span class="modal-close" onclick="closeSvcPdfModal()">×</span>
        <div style="margin-bottom:10px;">
          <button onclick="printSvcPdf()">印刷</button>
        </div>
        <iframe id="svc-pdf-iframe" style="width:100%; height:600px;"></iframe>
      </div>
    </div>
  `;
  dc.innerHTML = html;

  // 背景クリックでモーダルを閉じる
  const svcPdfModal = document.getElementById("svc-pdf-modal");
  if (svcPdfModal) {
    svcPdfModal.addEventListener("click", (evt) => {
      if (evt.target.id === "svc-pdf-modal") {
        closeSvcPdfModal();
      }
    });
  }
}

/**
 * 日付範囲で検索
 */
function fetchServiceRecordsByRange() {
  const start = document.getElementById("svc-start").value;
  const end = document.getElementById("svc-end").value;
  if (!start || !end) {
    alert("開始日と終了日を入力してください。");
    return;
  }
  const url = `/api/service_records?start_date=${start}&end_date=${end}`;
  fetch(url)
    .then(r => r.json())
    .then(data => {
      if (!data.records) {
        alert("サービス提供記録がありません。");
        return;
      }
      renderServiceRecordList(data.records);
    })
    .catch(err => {
      alert("エラー:" + err);
    });
}

/**
 * 検索結果一覧を表示
 */
function renderServiceRecordList(recordList) {
  const container = document.getElementById("service-record-result");
  if (!recordList || recordList.length === 0) {
    container.innerHTML = "<p>該当データなし</p>";
    return;
  }

  let html = "";
  recordList.forEach(rec => {
    html += `
      <div style="margin:6px 0; padding:4px; border-bottom:1px solid #ccc;" id="svc-item-${rec.id}">
        <span id="svc-dateUser-${rec.id}" style="font-weight:bold;">
          ${rec.report_date} / (利用者名取得中)
        </span>
        <span id="svc-mgrcheck-${rec.id}" style="margin-left:8px; font-weight:bold; color:#999;">
          (管理者確認:取得中)
        </span>
        <div style="float:right; display:flex; gap:4px;">
          <button style="background:#007bff; color:#fff; border:none; padding:4px 8px; border-radius:4px;"
            onclick="openServiceRecordManagerConfirm(${rec.id})"
          >
            管理者確認
          </button>
          <button style="background:#cc3333; color:#fff; border:none; padding:4px 8px; border-radius:4px;"
            onclick="deleteServiceRecordConfirm(${rec.id}, '${rec.report_date}')"
          >
            削除
          </button>
          <button id="svc-pdfbtn-${rec.id}"
            style="background:#b3dab3; color:#fff; border:none; padding:4px 8px; border-radius:4px;"
            disabled
            onclick="openServiceRecordPdfModal(${rec.id})"
          >
            PDF印刷
          </button>
        </div>
        <div style="clear:both;"></div>
      </div>
    `;
  });
  container.innerHTML = html;

  // 管理者確認ステータス & ユーザ名を個別に取得
  recordList.forEach(rec => {
    fetch(`/api/service_record/${rec.id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) {
          document.getElementById(`svc-dateUser-${rec.id}`).innerText =
            `${rec.report_date} / (エラー)`;
          document.getElementById(`svc-mgrcheck-${rec.id}`).innerText = "(取得エラー)";
          return;
        }
        let cObj = {};
        try {
          cObj = JSON.parse(d.content_json || "{}");
        } catch (e) { }

        const mgrVal = cObj.managerCheck || "off";
        const mgrSpan = document.getElementById(`svc-mgrcheck-${rec.id}`);
        const pdfBtn  = document.getElementById(`svc-pdfbtn-${rec.id}`);

        if (mgrVal === "on") {
          mgrSpan.innerHTML = "【管理者確認(<span style='color:green;'>完了</span>)】";
          pdfBtn.disabled = false;
          pdfBtn.style.background = "#00aa00";
        } else {
          mgrSpan.innerHTML = "【管理者確認(<span style='color:red;'>未完了</span>)】";
          pdfBtn.disabled = true;
          pdfBtn.style.background = "#b3dab3";
        }

        // user_id -> userName
        const userId = d.user_id;
        fetch(`/api/user/${userId}`)
          .then(r2 => r2.json())
          .then(u => {
            if (u.error) {
              document.getElementById(`svc-dateUser-${rec.id}`).innerText =
                `${rec.report_date} / ユーザID:${userId}(取得エラー)`;
              return;
            }
            const userName = u.name || `ID:${userId}`;
            document.getElementById(`svc-dateUser-${rec.id}`).innerText =
              `${d.report_date} / ${userName}`;
          })
          .catch(err2 => {
            document.getElementById(`svc-dateUser-${rec.id}`).innerText =
              `${rec.report_date} / ユーザID:${userId}(err)`;
          });
      })
      .catch(err => {
        document.getElementById(`svc-dateUser-${rec.id}`).innerText =
          `${rec.report_date} / (取得エラー)`;
        document.getElementById(`svc-mgrcheck-${rec.id}`).innerText = "(error)";
      });
  });
}

/**
 * 管理者確認画面 (枠1～枠7相当を表示)
 */
function openServiceRecordManagerConfirm(recId) {
  // 上部へスクロール
  window.scrollTo(0, 0);

  fetch(`/api/service_record/${recId}`)
    .then(r => r.json())
    .then(d => {
      if (d.error) {
        alert("該当データがありません。");
        return;
      }
      let cObj = {};
      try {
        cObj = JSON.parse(d.content_json||"{}");
      } catch(e) {
        cObj = {};
      }

      const dh = document.getElementById("detail-header");
      const dc = document.getElementById("detail-content");
      dh.innerText = "サービス提供記録 管理者確認画面";

      // userName取得
      fetch(`/api/user/${d.user_id}`)
        .then(r2 => r2.json())
        .then(uobj => {
          const userName = uobj.name || ("利用者ID:"+d.user_id);

          // managerCheck
          const mgrVal = cObj.managerCheck || "off";
          let mgrLabel = (mgrVal==="on")
            ? `<span style="color:red;font-weight:bold;">確認済</span>`
            : `<span style="color:black;">未完了</span>`;
          let mgrChecked = (mgrVal==="on")?"checked":"";

          // 日付 → M月D日
          let dateLabel = d.report_date || "";
          const mm = dateLabel.match(/^(\d{4})-(\d{2})-(\d{2})$/);
          if(mm){
            const m = parseInt(mm[2],10);
            const dd= parseInt(mm[3],10);
            dateLabel = `${m}月${dd}日`;
          }

          // 帰宅/起床
          const homeLbl = getHomeStateLabel(cObj.homeState||"");
          const wakeLbl = getWakeStateLabel(cObj.wakeState||"");

          // 日中/追加スタッフ
          const isDaytime = !!d.staff_day;
          const hasExtra  = !!d.staff_extra;

          // 介助
          function showAssist(label, chkVal, dtlVal) {
            if(chkVal==="on"){
              return `<p>・${label}: ${dtlVal||""}</p>`;
            }
            return "";
          }

          // 短期目標
          let stgHtml = "";
          if(cObj.shortTermComments){
            Object.keys(cObj.shortTermComments).forEach(k=>{
              const v = cObj.shortTermComments[k];
              if(v){
                stgHtml += `短期目標${k}に対するコメント: ${v}<br>`;
              }
            });
          }

          // スタッフ表示
          let staffPart = "";
          if(isDaytime){
            staffPart += `<p>日中スタッフ: ${d.staff_day} (勤務:${cObj.day_time||""})</p>`;
          }
          staffPart += `<p>夜間スタッフ: ${d.staff_night||""} (勤務:${cObj.night_time||""})</p>`;
          if(hasExtra){
            staffPart += `<p>追加スタッフ: ${d.staff_extra||""} (勤務:${cObj.extra_time||""})</p>`;
          }

          // 昼食（isDaytime時のみ）
          let lunchPart = "";
          if(isDaytime){
            const sc = cObj.dayMealScore||"";
            if(sc){
              lunchPart += `<p><strong>昼食:</strong> 残量:${sc}/10`;
              if(cObj.dayMealLeft) lunchPart += ` 残:${cObj.dayMealLeft}`;
              lunchPart += `</p>`;
            }
            if(cObj.dayStatus){
              lunchPart += `<p>日中の様子: ${cObj.dayStatus}</p>`;
            }
          }

          // 夕食後服薬
          let dinnerMeds = "";
          if(cObj.nightAfterMeds==="on"){
            dinnerMeds = `<p><strong>夕食後服薬:</strong> <strong>服薬確認</strong></p>`;
          }
          // 就寝前服薬
          let sleepMeds = "";
          if(cObj.sleepMeds==="on"){
            sleepMeds = `<p><strong>就寝前服薬:</strong> <strong>服薬確認</strong></p>`;
          }
          // 朝食後服薬
          let morningMeds = "";
          if(cObj.morningAfterMeds==="on"){
            morningMeds = `<p><strong>朝食後服薬:</strong> <strong>服薬確認</strong></p>`;
          }

          // 介助リスト
          let assistHtml = "";
          assistHtml += showAssist("食事介助", cObj.foodAssistChecked, cObj.foodAssistDetail);
          assistHtml += showAssist("入浴介助", cObj.bathAssistChecked, cObj.bathAssistDetail);
          assistHtml += showAssist("排泄介助", cObj.excretionAssistChecked, cObj.excretionAssistDetail);
          assistHtml += showAssist("着替えの介助", cObj.changeAssistChecked, cObj.changeAssistDetail);
          assistHtml += showAssist("生活支援", cObj.lifeSupportChecked, cObj.lifeSupportDetail);
          assistHtml += showAssist("メンタルケア", cObj.mentalCareChecked, cObj.mentalCareDetail);

          // 管理者確認チェックボックス
          let managerCheckHtml = `
            <label>
              <input type="checkbox" id="svcMgrCheck" ${mgrChecked}>
              管理者確認
            </label>
            <p>現在の状態: ${mgrLabel}</p>
            <div style="margin-top:10px;">
              <button
                style="background:#007bff; color:#fff; border:none; padding:6px 12px; border-radius:4px;"
                onclick="saveServiceRecordManagerCheck(${d.id})"
              >
                管理者確認を更新
              </button>
            </div>
          `;

          // HTML組み立て
          let html = `
            <h2>サービス提供記録 管理者確認 (ID:${d.id})</h2>
            <div style="border:1px solid #ccc; padding:10px;">
              <p>利用者: ${userName}</p>
              <p>記録日: <strong>${dateLabel}</strong></p>
              <p><strong>支援スタッフ</strong><br>
                ${staffPart}
              </p>
              <hr/>
              <p><strong>献立</strong><br>
                ${
                  isDaytime
                    ? `昼食の献立: ${d.lunch_menu||""}<br>`
                    : ""
                }
                夕食の献立: ${d.dinner_menu||""}<br>
                朝食の献立: ${d.breakfast_menu||""}
              </p>
              <hr/>
              <p><strong>詳細支援報告</strong></p>
              ${lunchPart}
              <p>日中活動: ${cObj.daytimeActivity||""}</p>
              <p>帰宅時間: ${cObj.homeTime||""} / 様子: ${homeLbl} ${cObj.homeStateDetail||""}</p>
              <hr/>
              <p>夕食バイタル: 体温:${cObj.dinnerTemp||""}℃ / SpO2:${cObj.dinnerSpo2||""},
                 血圧:${cObj.dinnerBP1||""}/${cObj.dinnerBP2||""}, 脈:${cObj.dinnerPulse||""}</p>
              <p>夕食: 残量:${cObj.dinnerMealScore||""}/10 ${
                cObj.dinnerMealLeft
                  ? "残:"+cObj.dinnerMealLeft
                  : ""
              }</p>
              ${dinnerMeds}
              <hr/>
              <p><strong>就寝・巡視</strong></p>
              ${sleepMeds}
              <p>就寝時間: ${cObj.sleepTime||""}</p>
              <p>夜間巡視:</p>
              <p>&emsp;${cObj.check23User||""}</p>
              <p>&emsp;${cObj.check1User||""}</p>
              <p>&emsp;${cObj.check3User||""}</p>
              <hr/>
              <p><strong>起床、朝食</strong></p>
              <p>起床時間: ${cObj.wakeTime||""}</p>
              <p>起床時の様子: ${wakeLbl} ${cObj.wakeDetail||""}</p>
              <p>朝食バイタル: 体温:${cObj.breakfastTemp||""}℃ /
                SpO2:${cObj.breakfastSpo2||""},
                血圧:${cObj.breakfastBP1||""}/${cObj.breakfastBP2||""},
                脈:${cObj.breakfastPulse||""}
              </p>
              <p>朝食: 残量:${cObj.breakfastMealScore||""}/10 ${
                cObj.breakfastMealLeft
                  ? "残:"+cObj.breakfastMealLeft
                  : ""
              }</p>
              ${morningMeds}
              <hr/>
              <p><strong>利用者の支援詳細</strong></p>
              <p>利用者の様子: ${cObj.userCondition||""}</p>
              ${
                assistHtml
                  ? `<p><strong>介助項目</strong></p>${assistHtml}`
                  : ""
              }
              <hr/>
              <p><strong>個別支援</strong></p>
              <p>長期目標に対する支援: ${cObj.longTermGoalSupport||""}</p>
              ${stgHtml?`<p>${stgHtml}</p>`:""}
              <hr/>
              <p><strong>管理者確認</strong></p>
              ${managerCheckHtml}
            </div>

            <div style="margin-top:10px;">
              <button
                style="background:#ffcc00; color:#333; border:none; padding:6px 12px; border-radius:4px;"
                onclick="openServiceRecordManagerEdit(${d.id})"
              >
                修正
              </button>
              <button
                style="margin-left:15px; background:none; color:#333; border:1px solid #ccc; padding:6px 12px; border-radius:4px;"
                onclick="returnToServiceRecordList()"
              >
                一覧に戻る
              </button>
            </div>
          `;
          dc.innerHTML = html;
        })
        .catch(e2 => {
          alert("ユーザ名取得失敗:" + e2);
        });
    })
    .catch(err => {
      alert("エラー:" + err);
    });
}

/**
 * 管理者確認の更新
 */
function saveServiceRecordManagerCheck(recId) {
  const checked = document.getElementById("svcMgrCheck").checked;
  fetch(`/api/service_record/${recId}`)
    .then(r => r.json())
    .then(d => {
      if (d.error) {
        alert("該当記録なし");
        return;
      }
      let cObj = {};
      try { cObj = JSON.parse(d.content_json||"{}"); }catch(e){}
      cObj.managerCheck = (checked ? "on":"off");

      // DB保存
      const finalObj = {
        ...cObj,
        userId: d.user_id,
        dateValue: d.report_date,
        staffDay: d.staff_day||"",
        staffNight: d.staff_night||"",
        staffExtra: d.staff_extra||"",
        lunchMenu: d.lunch_menu||"",
        dinnerMenu: d.dinner_menu||"",
        breakfastMenu: d.breakfast_menu||""
      };
      const fd = new FormData();
      fd.append("service_record_json", JSON.stringify(finalObj));
      fetch("/save_service_record", {method:"POST", body:fd})
        .then(r2=>r2.text())
        .then(res=>{
          alert("管理者確認を更新しました。");
          openServiceRecordManagerConfirm(recId);
        })
        .catch(err2=> alert("保存エラー:" + err2));
    })
    .catch(e => {
      alert("エラー:" + e);
    });
}

/**
 * 管理者修正画面
 *  - ベースはサービス提供記録作成画面と同じだが、下段のボタンが違う
 *  - 内容は必ず入力済(= tempServiceRecordDataからすべての項目を反映)
 */
function openServiceRecordManagerEdit(recId) {
  // 上部へスクロール
  window.scrollTo(0, 0);

  // DBから再取得し、tempServiceRecordDataに詰め直す
  fetch(`/api/service_record/${recId}`)
    .then(r=>r.json())
    .then(d=>{
      if(d.error){
        alert("エラー:記録なし");
        return;
      }
      let cObj = {};
      try{ cObj = JSON.parse(d.content_json||"{}"); }catch(e){ cObj={}; }

      // user名取得
      fetch(`/api/user/${d.user_id}`)
        .then(r2=>r2.json())
        .then(u=>{
          const userName = u.name || ("利用者ID:"+d.user_id);

          // tempServiceRecordDataに全項目を格納
          // (Block #9aの "openServiceRecordUser" でやっているのと同様)
          tempServiceRecordData = {
            userId: d.user_id||"",
            userName,
            dateValue: d.report_date||"",
            isDaytime: !!d.staff_day,
            hasExtraStaff: !!d.staff_extra,

            staffDay: d.staff_day||"",
            staffNight: d.staff_night||"",
            staffExtra: d.staff_extra||"",
            staffDayTime: cObj.day_time||"",
            staffNightTime: cObj.night_time||"",
            staffExtraTime: cObj.extra_time||"",

            lunchMenu: d.lunch_menu||"",
            dinnerMenu: d.dinner_menu||"",
            breakfastMenu: d.breakfast_menu||"",

            check23: cObj.check23||"",
            check1: cObj.check1||"",
            check3: cObj.check3||"",

            daytimeActivity: cObj.daytimeActivity||"",
            homeTime: cObj.homeTime||"",
            homeState: cObj.homeState||"",
            homeStateDetail: cObj.homeStateDetail||"",

            dayMealScore: cObj.dayMealScore||"",
            dayMealLeft: cObj.dayMealLeft||"",
            dayAfterMeds: cObj.dayAfterMeds||"off",
            dayStatus: cObj.dayStatus||"",

            dinnerTemp: cObj.dinnerTemp||"",
            dinnerSpo2: cObj.dinnerSpo2||"",
            dinnerBP1: cObj.dinnerBP1||"",
            dinnerBP2: cObj.dinnerBP2||"",
            dinnerPulse: cObj.dinnerPulse||"",
            dinnerMealScore: cObj.dinnerMealScore||"",
            dinnerMealLeft: cObj.dinnerMealLeft||"",
            nightAfterMeds: cObj.nightAfterMeds||"off",

            sleepMeds: cObj.sleepMeds||"off",
            sleepTime: cObj.sleepTime||"",

            check23User: cObj.check23User||"",
            check1User: cObj.check1User||"",
            check3User: cObj.check3User||"",

            wakeTime: cObj.wakeTime||"",
            wakeState: cObj.wakeState||"",
            wakeDetail: cObj.wakeDetail||"",

            breakfastTemp: cObj.breakfastTemp||"",
            breakfastSpo2: cObj.breakfastSpo2||"",
            breakfastBP1: cObj.breakfastBP1||"",
            breakfastBP2: cObj.breakfastBP2||"",
            breakfastPulse: cObj.breakfastPulse||"",
            breakfastMealScore: cObj.breakfastMealScore||"",
            breakfastMealLeft: cObj.breakfastMealLeft||"",
            morningAfterMeds: cObj.morningAfterMeds||"off",
            userCondition: cObj.userCondition||"",

            foodAssistChecked: cObj.foodAssistChecked||"off",
            foodAssistDetail: cObj.foodAssistDetail||"",
            bathAssistChecked: cObj.bathAssistChecked||"off",
            bathAssistDetail: cObj.bathAssistDetail||"",
            excretionAssistChecked: cObj.excretionAssistChecked||"off",
            excretionAssistDetail: cObj.excretionAssistDetail||"",
            changeAssistChecked: cObj.changeAssistChecked||"off",
            changeAssistDetail: cObj.changeAssistDetail||"",
            lifeSupportChecked: cObj.lifeSupportChecked||"off",
            lifeSupportDetail: cObj.lifeSupportDetail||"",
            mentalCareChecked: cObj.mentalCareChecked||"off",
            mentalCareDetail: cObj.mentalCareDetail||"",

            longTermGoalSupport: cObj.longTermGoalSupport||"",
            shortTermComments: cObj.shortTermComments||{},
            managerCheck: cObj.managerCheck||"off"
          };

          // 次の画面を描画
          openServiceRecordManagerEditForm(recId, userName);
        })
        .catch(e2=>{
          alert("ユーザ名取得エラー:"+ e2);
        });
    })
    .catch(err=>{
      alert("エラー:"+ err);
    });
}

/**
 * 管理者修正画面フォーム
 * - ベースはサービス提供記録作成画面と同じ
 * - 下段のボタンが違う:
 *   「管理者確認(青)」-> openServiceRecordManagerConfirm(recId)
 *   「一覧に戻る(配色なし)」-> returnToServiceRecordList()
 * - 必ず入力済み内容をフォームに反映
 */
function openServiceRecordManagerEditForm(recId, userName) {
  // 上部へスクロール
  window.scrollTo(0, 0);

  const dh = document.getElementById("detail-header");
  const dc = document.getElementById("detail-content");
  dh.innerText = "サービス提供記録 管理者修正画面";

  const d = tempServiceRecordData; // ショートハンド

  // same approach as openServiceRecordUser, but pre-filled
  let dayDisabledAttr   = d.isDaytime ? "checked" : "";
  let extraDisabledAttr = d.hasExtraStaff ? "checked" : "";

  // メニューなど
  const staffDayPart = d.isDaytime
    ? `<div style="margin:4px 0;">
         <strong>(日中)スタッフ名:</strong> ${d.staffDay||""}
       </div>
       <div style="margin:4px 0;">
         <strong>勤務時間:</strong> ${d.staffDayTime||""}
       </div>`
    : "";

  const staffExtraPart = d.hasExtraStaff
    ? `<div style="margin:4px 0;">
         <strong>(追加)スタッフ名:</strong> ${d.staffExtra||""}
       </div>
       <div style="margin:4px 0;">
         <strong>勤務時間:</strong> ${d.staffExtraTime||""}
       </div>`
    : "";

  // ラジオやチェックボックス,セレクトなどは動的にselected/checkedを付ける
  // ここでは簡易にHTMLを組み立て

  function buildScoreOptions(val) {
    let out = "";
    for(let i=1; i<=10; i++){
      const sel = (String(i)===String(val)) ? "selected":"";
      out += `<option value="${i}" ${sel}>${i}</option>`;
    }
    return out;
  }
  function checkAttr(isOn){ return (isOn==="on") ? "checked":""; }

  let lunchBlock = "";
  if(d.isDaytime){
    lunchBlock = `
    <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
      <h4>昼食</h4>
      <p><strong>昼食の献立:</strong></p>
      <input type="text" id="mgr-lunchMenu" size="40" value="${d.lunchMenu||""}"><br>
      <p>
        <label>食事状況:</label>
        <select id="mgr-dayMealScore">${buildScoreOptions(d.dayMealScore||"")}</select>/10
      </p>
      <p>
        <label>残した食事:</label>
        <input type="text" id="mgr-dayMealLeft" size="30" value="${d.dayMealLeft||""}">
      </p>
      <p>
        <label>昼食後服薬</label>
        <input type="checkbox" id="mgr-dayAfterMeds" ${checkAttr(d.dayAfterMeds)}>
      </p>
      <p>
        <label>日中の様子:</label><br>
        <textarea id="mgr-dayStatus" rows="2" style="width:100%;">${d.dayStatus||""}</textarea>
      </p>
    </div>`;
  }

  let dinnerBlock = `
    <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
      <h4>夕食</h4>
      <p><strong>夕食の献立:</strong></p>
      <input type="text" id="mgr-dinnerMenu" size="40" value="${d.dinnerMenu||""}"><br>
      <p>
        <label>体温:</label>
        <input type="text" id="mgr-dinnerTemp" size="5" value="${d.dinnerTemp||""}">℃
        <label>SpO2:</label>
        <input type="text" id="mgr-dinnerSpo2" size="5" value="${d.dinnerSpo2||""}">
      </p>
      <p>
        血圧 <input type="text" id="mgr-dinnerBP1" size="3" value="${d.dinnerBP1||""}">
        / <input type="text" id="mgr-dinnerBP2" size="3" value="${d.dinnerBP2||""}">
        <label>脈:</label>
        <input type="text" id="mgr-dinnerPulse" size="3" value="${d.dinnerPulse||""}">
      </p>
      <p>
        <label>食事状況:</label>
        <select id="mgr-dinnerMealScore">${buildScoreOptions(d.dinnerMealScore||"")}</select>/10
      </p>
      <p>
        <label>残した食事:</label>
        <input type="text" id="mgr-dinnerMealLeft" size="30" value="${d.dinnerMealLeft||""}">
      </p>
      <p>
        <label>夕食後服薬</label>
        <input type="checkbox" id="mgr-nightAfterMeds" ${checkAttr(d.nightAfterMeds)}>
      </p>
    </div>
  `;

  // 以下、就寝、夜間巡視、起床、朝食 なども
  // ここでは省略しないで全て書く(要望による)
  let html = `
  <h2>サービス提供記録 管理者修正画面 (ID:${recId})</h2>
  <div style="border:1px solid #ccc; padding:10px;">
    <p><strong>利用者:</strong> ${userName}</p>
    <p><strong>記録日:</strong> ${d.dateValue||""}</p>

    <p>
      <label>日中あり:</label>
      <input type="checkbox" id="mgr-daytimeCheck" ${dayDisabledAttr} disabled>
      <label style="margin-left:10px;">追加スタッフあり:</label>
      <input type="checkbox" id="mgr-extraStaffCheck" ${extraDisabledAttr} disabled>
    </p>

    ${staffDayPart}
    <div style="margin:4px 0;">
      <strong>(夜間)スタッフ名:</strong> ${d.staffNight||""} (勤務:${d.staffNightTime||""})
    </div>
    ${staffExtraPart}
  </div>

  ${lunchBlock}

  <div class="report-subtitle" style="margin-top:10px;">日中活動～帰宅</div>
  <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
    <p>
      <label>日中活動:</label>
      <input type="text" id="mgr-daytimeActivity" value="${d.daytimeActivity||""}" style="width:200px;">
    </p>
    <p>
      <label>帰宅時間:</label>
      <input type="time" id="mgr-homeTime" value="${d.homeTime||""}">
    </p>
    <p>
      <label>帰宅時の様子:</label>
      <select id="mgr-homeState">
        <option value="">選択なし</option>
        <option value="1" ${d.homeState==="1"?"selected":""}>1.特に気になることはありません。</option>
        <option value="2" ${d.homeState==="2"?"selected":""}>2.少し疲れた様子</option>
        <option value="3" ${d.homeState==="3"?"selected":""}>3.体調不良の訴え</option>
        <option value="4" ${d.homeState==="4"?"selected":""}>4.不穏な雰囲気</option>
      </select>
    </p>
    <p>
      <label>詳細入力:</label>
      <input type="text" id="mgr-homeStateDetail" size="30" value="${d.homeStateDetail||""}">
    </p>
  </div>

  ${dinnerBlock}

  <div class="report-subtitle">就寝</div>
  <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
    <p>
      <label>就寝前服薬</label>
      <input type="checkbox" id="mgr-sleepMeds" ${checkAttr(d.sleepMeds)}>
    </p>
    <p>
      <label>就寝時間:</label>
      <input type="time" id="mgr-sleepTime" value="${d.sleepTime||""}">
    </p>
  </div>

  <div class="report-subtitle">夜間巡視</div>
  <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
    <p>
      <label>巡視1:</label>
      <input type="text" id="mgr-check23User" size="30" value="${d.check23User||""}">
    </p>
    <p>
      <label>巡視2:</label>
      <input type="text" id="mgr-check1User" size="30" value="${d.check1User||""}">
    </p>
    <p>
      <label>巡視3:</label>
      <input type="text" id="mgr-check3User" size="30" value="${d.check3User||""}">
    </p>
  </div>

  <div class="report-subtitle">起床</div>
  <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
    <p>
      <label>起床時間:</label>
      <input type="time" id="mgr-wakeTime" value="${d.wakeTime||""}">
    </p>
    <p>
      <label>起床時の様子:</label>
      <select id="mgr-wakeState">
        <option value="">選択なし</option>
        <option value="1" ${d.wakeState==="1"?"selected":""}>1.ご自身で起床</option>
        <option value="2" ${d.wakeState==="2"?"selected":""}>2.声掛けで起床</option>
        <option value="3" ${d.wakeState==="3"?"selected":""}>3.体調不良の訴え</option>
        <option value="4" ${d.wakeState==="4"?"selected":""}>4.不穏な雰囲気</option>
        <option value="5" ${d.wakeState==="5"?"selected":""}>5.その他</option>
      </select>
    </p>
    <p>
      <label>詳細入力:</label>
      <input type="text" id="mgr-wakeDetail" size="30" value="${d.wakeDetail||""}">
    </p>
  </div>

  <div class="report-subtitle">朝食</div>
  <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
    <p>
      <label>体温:</label>
      <input type="text" id="mgr-breakfastTemp" size="5" value="${d.breakfastTemp||""}">℃
      <label>SpO2:</label>
      <input type="text" id="mgr-breakfastSpo2" size="5" value="${d.breakfastSpo2||""}">
    </p>
    <p>
      <label>血圧:</label>
      <input type="text" id="mgr-breakfastBP1" size="3" value="${d.breakfastBP1||""}">
      /
      <input type="text" id="mgr-breakfastBP2" size="3" value="${d.breakfastBP2||""}">
      <label>脈:</label>
      <input type="text" id="mgr-breakfastPulse" size="3" value="${d.breakfastPulse||""}">
    </p>
    <p><strong>献立:</strong></p>
    <input type="text" id="mgr-breakfastMenu" size="40" value="${d.breakfastMenu||""}"><br>
    <p>
      <label>食事状況:</label>
      <select id="mgr-breakfastMealScore">${buildScoreOptions(d.breakfastMealScore||"")}</select>/10
    </p>
    <p>
      <label>残した食事:</label>
      <input type="text" id="mgr-breakfastMealLeft" size="30" value="${d.breakfastMealLeft||""}">
    </p>
    <p>
      <label>朝食後服薬</label>
      <input type="checkbox" id="mgr-morningAfterMeds" ${checkAttr(d.morningAfterMeds)}>
    </p>
  </div>

  <div class="report-subtitle">利用者の様子</div>
  <textarea id="mgr-userCondition" rows="3" style="width:100%;">${d.userCondition||""}</textarea>

  <div class="report-subtitle" style="margin-top:10px;">その他介助項目</div>
  <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
    <p>
      <label><input type="checkbox" id="mgr-foodAssistCheck" ${checkAttr(d.foodAssistChecked)}>食事介助</label>
      <span style="margin-left:10px;">
        <label>詳細:</label>
        <input type="text" id="mgr-foodAssistDetail" size="30" value="${d.foodAssistDetail||""}">
      </span>
    </p>
    <p>
      <label><input type="checkbox" id="mgr-bathAssistCheck" ${checkAttr(d.bathAssistChecked)}>入浴介助</label>
      <span style="margin-left:10px;">
        <label>詳細:</label>
        <input type="text" id="mgr-bathAssistDetail" size="30" value="${d.bathAssistDetail||""}">
      </span>
    </p>
    <p>
      <label><input type="checkbox" id="mgr-excretionAssistCheck" ${checkAttr(d.excretionAssistChecked)}>排泄介助</label>
      <span style="margin-left:10px;">
        <label>詳細:</label>
        <input type="text" id="mgr-excretionAssistDetail" size="30" value="${d.excretionAssistDetail||""}">
      </span>
    </p>
    <p>
      <label><input type="checkbox" id="mgr-changeAssistCheck" ${checkAttr(d.changeAssistChecked)}>着替えの介助</label>
      <span style="margin-left:10px;">
        <label>詳細:</label>
        <input type="text" id="mgr-changeAssistDetail" size="30" value="${d.changeAssistDetail||""}">
      </span>
    </p>
    <p>
      <label><input type="checkbox" id="mgr-lifeSupportCheck" ${checkAttr(d.lifeSupportChecked)}>生活支援</label>
      <span style="margin-left:10px;">
        <label>詳細:</label>
        <input type="text" id="mgr-lifeSupportDetail" size="30" value="${d.lifeSupportDetail||""}">
      </span>
    </p>
    <p>
      <label><input type="checkbox" id="mgr-mentalCareCheck" ${checkAttr(d.mentalCareChecked)}>メンタルケア</label>
      <span style="margin-left:10px;">
        <label>詳細:</label>
        <input type="text" id="mgr-mentalCareDetail" size="30" value="${d.mentalCareDetail||""}">
      </span>
    </p>
  </div>

  <div class="report-subtitle">個別支援</div>
  <div style="border:1px solid #ccc; padding:10px; margin-bottom:10px;">
    <p><strong>長期目標に対する支援:</strong></p>
    <textarea id="mgr-longTermGoalSupport" rows="2" style="width:100%;">${d.longTermGoalSupport||""}</textarea>
    <hr/>
    <p>短期目標コメント(最大5):</p>
  `;

  // 短期目標
  if(d.shortTermComments){
    const keys = Object.keys(d.shortTermComments).sort((a,b)=>(+a)-(+b));
    keys.forEach(k=>{
      html += `
        <p>短期目標${k}:</p>
        <textarea id="mgr-shortTermComment${k}" rows="2" style="width:100%;">${d.shortTermComments[k]||""}</textarea>
        <hr/>
      `;
    });
  } else {
    html += `<p>短期目標なし</p>`;
  }

  // ボタン
  html += `
  </div>

  <div style="margin-top:10px;">
    <button
      style="background:#007bff; color:#fff; border:none; padding:6px 12px; border-radius:4px;"
      onclick="saveServiceRecordManagerEdit(${recId})"
    >
      管理者確認
    </button>
    <button
      style="margin-left:15px; background:none; color:#333; border:1px solid #ccc; padding:6px 12px; border-radius:4px;"
      onclick="returnToServiceRecordList()"
    >
      一覧に戻る
    </button>
  </div>
  `;

  dc.innerHTML = html;
}

/**
 * 管理者修正内容を保存→管理者確認画面へ
 */
function saveServiceRecordManagerEdit(recId) {
  // 画面切り替え時に上部へスクロール
  window.scrollTo(0,0);

  // フォームから取り直し
  const d = {...tempServiceRecordData};

  // 例: 昼食
  const lunchEl = document.getElementById("mgr-lunchMenu");
  if(lunchEl) d.lunchMenu = lunchEl.value || "";
  const dmsEl  = document.getElementById("mgr-dayMealScore");
  if(dmsEl) d.dayMealScore = dmsEl.value||"";
  const dmlEl  = document.getElementById("mgr-dayMealLeft");
  if(dmlEl) d.dayMealLeft = dmlEl.value||"";
  const dayAEl = document.getElementById("mgr-dayAfterMeds");
  if(dayAEl) d.dayAfterMeds = dayAEl.checked ? "on":"off";
  const dayStEl= document.getElementById("mgr-dayStatus");
  if(dayStEl) d.dayStatus = dayStEl.value||"";

  // 日中活動～帰宅
  const daEl  = document.getElementById("mgr-daytimeActivity");
  if(daEl) d.daytimeActivity = daEl.value||"";
  const htEl  = document.getElementById("mgr-homeTime");
  if(htEl) d.homeTime = htEl.value||"";
  const hsEl  = document.getElementById("mgr-homeState");
  if(hsEl) d.homeState = hsEl.value||"";
  const hsdEl = document.getElementById("mgr-homeStateDetail");
  if(hsdEl) d.homeStateDetail = hsdEl.value||"";

  // 夕食
  const dmEl  = document.getElementById("mgr-dinnerMenu");
  if(dmEl) d.dinnerMenu = dmEl.value||"";
  const dtEl  = document.getElementById("mgr-dinnerTemp");
  if(dtEl) d.dinnerTemp= dtEl.value||"";
  const dsEl  = document.getElementById("mgr-dinnerSpo2");
  if(dsEl) d.dinnerSpo2= dsEl.value||"";
  const dbp1 = document.getElementById("mgr-dinnerBP1");
  if(dbp1) d.dinnerBP1 = dbp1.value||"";
  const dbp2 = document.getElementById("mgr-dinnerBP2");
  if(dbp2) d.dinnerBP2 = dbp2.value||"";
  const dpu  = document.getElementById("mgr-dinnerPulse");
  if(dpu) d.dinnerPulse= dpu.value||"";
  const dms2 = document.getElementById("mgr-dinnerMealScore");
  if(dms2) d.dinnerMealScore = dms2.value||"";
  const dml2 = document.getElementById("mgr-dinnerMealLeft");
  if(dml2) d.dinnerMealLeft= dml2.value||"";
  const nam  = document.getElementById("mgr-nightAfterMeds");
  if(nam) d.nightAfterMeds = nam.checked?"on":"off";

  // 就寝
  const smChk= document.getElementById("mgr-sleepMeds");
  if(smChk) d.sleepMeds = smChk.checked?"on":"off";
  const stEl= document.getElementById("mgr-sleepTime");
  if(stEl) d.sleepTime = stEl.value||"";

  // 夜間巡視
  const c23= document.getElementById("mgr-check23User");
  if(c23) d.check23User= c23.value||"";
  const c1 = document.getElementById("mgr-check1User");
  if(c1) d.check1User = c1.value||"";
  const c3 = document.getElementById("mgr-check3User");
  if(c3) d.check3User = c3.value||"";

  // 起床
  const wTime= document.getElementById("mgr-wakeTime");
  if(wTime) d.wakeTime= wTime.value||"";
  const wState= document.getElementById("mgr-wakeState");
  if(wState) d.wakeState= wState.value||"";
  const wDet= document.getElementById("mgr-wakeDetail");
  if(wDet) d.wakeDetail= wDet.value||"";

  // 朝食
  const bfM= document.getElementById("mgr-breakfastMenu");
  if(bfM) d.breakfastMenu= bfM.value||"";
  const bfT= document.getElementById("mgr-breakfastTemp");
  if(bfT) d.breakfastTemp= bfT.value||"";
  const bfS= document.getElementById("mgr-breakfastSpo2");
  if(bfS) d.breakfastSpo2= bfS.value||"";
  const bfB1= document.getElementById("mgr-breakfastBP1");
  if(bfB1) d.breakfastBP1= bfB1.value||"";
  const bfB2= document.getElementById("mgr-breakfastBP2");
  if(bfB2) d.breakfastBP2= bfB2.value||"";
  const bfPu= document.getElementById("mgr-breakfastPulse");
  if(bfPu) d.breakfastPulse= bfPu.value||"";
  const bfSc= document.getElementById("mgr-breakfastMealScore");
  if(bfSc) d.breakfastMealScore= bfSc.value||"";
  const bfMl= document.getElementById("mgr-breakfastMealLeft");
  if(bfMl) d.breakfastMealLeft= bfMl.value||"";
  const bfAm= document.getElementById("mgr-morningAfterMeds");
  if(bfAm) d.morningAfterMeds= bfAm.checked?"on":"off";

  // 利用者の様子
  const ucEl= document.getElementById("mgr-userCondition");
  if(ucEl) d.userCondition= ucEl.value||"";

  // 介助
  const fac= document.getElementById("mgr-foodAssistCheck");
  if(fac) d.foodAssistChecked= fac.checked?"on":"off";
  const fad= document.getElementById("mgr-foodAssistDetail");
  if(fad) d.foodAssistDetail= fad.value||"";

  const bac= document.getElementById("mgr-bathAssistCheck");
  if(bac) d.bathAssistChecked= bac.checked?"on":"off";
  const bad= document.getElementById("mgr-bathAssistDetail");
  if(bad) d.bathAssistDetail= bad.value||"";

  const exc= document.getElementById("mgr-excretionAssistCheck");
  if(exc) d.excretionAssistChecked= exc.checked?"on":"off";
  const exd= document.getElementById("mgr-excretionAssistDetail");
  if(exd) d.excretionAssistDetail= exd.value||"";

  const chc= document.getElementById("mgr-changeAssistCheck");
  if(chc) d.changeAssistChecked= chc.checked?"on":"off";
  const chd= document.getElementById("mgr-changeAssistDetail");
  if(chd) d.changeAssistDetail= chd.value||"";

  const lsc= document.getElementById("mgr-lifeSupportCheck");
  if(lsc) d.lifeSupportChecked= lsc.checked?"on":"off";
  const lsd= document.getElementById("mgr-lifeSupportDetail");
  if(lsd) d.lifeSupportDetail= lsd.value||"";

  const mec= document.getElementById("mgr-mentalCareCheck");
  if(mec) d.mentalCareChecked= mec.checked?"on":"off";
  const med= document.getElementById("mgr-mentalCareDetail");
  if(med) d.mentalCareDetail= med.value||"";

  // 個別支援
  const ltgEl= document.getElementById("mgr-longTermGoalSupport");
  if(ltgEl) d.longTermGoalSupport= ltgEl.value||"";

  if(!d.shortTermComments) d.shortTermComments = {};
  for(let i=1; i<=5; i++){
    const stEl = document.getElementById(`mgr-shortTermComment${i}`);
    if(stEl) d.shortTermComments[i] = stEl.value||"";
  }

  // 上書き
  tempServiceRecordData = d;

  // DB保存
  const fd = new FormData();
  fd.append("service_record_json", JSON.stringify(d));

  fetch("/save_service_record", {method:"POST", body:fd})
    .then(r=>r.text())
    .then(res=>{
      alert("修正内容を保存しました。");
      // → 管理者確認画面へ
      openServiceRecordManagerConfirm(recId);
    })
    .catch(e=>{
      alert("エラー:"+ e);
    });
}

/**
 * 削除
 */
function deleteServiceRecordConfirm(recId, dateStr) {
  let label = dateStr;
  if(dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/)){
    const [_,y,m,d] = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    label = `${parseInt(m,10)}月${parseInt(d,10)}日`;
  }
  const ok = confirm(`${label}のサービス提供記録を削除しますか？元に戻せません`);
  if(!ok) return;

  const fd = new FormData();
  fd.append("id", recId);
  fetch("/delete_service_record", {method:"POST", body:fd})
    .then(r=>r.text())
    .then(msg=>{
      if(msg==="ok"){
        alert(`${label}のサービス提供記録を削除しました。`);
        fetchServiceRecordsByRange();
      } else {
        alert("削除エラー:"+ msg);
      }
    })
    .catch(e=> alert("エラー:"+ e));
}

/**
 * PDFモーダル
 */
function openServiceRecordPdfModal(recId){
  const modal = document.getElementById("svc-pdf-modal");
  const iframe= document.getElementById("svc-pdf-iframe");
  iframe.src = `/service_record_pdf/${recId}`;
  modal.style.display = "block";
}

function closeSvcPdfModal(){
  const modal = document.getElementById("svc-pdf-modal");
  const iframe= document.getElementById("svc-pdf-iframe");
  iframe.src="";
  modal.style.display="none";
}

function printSvcPdf(){
  const iframe= document.getElementById("svc-pdf-iframe");
  iframe.contentWindow.print();
}

/**
 * 一覧へ戻る
 */
function returnToServiceRecordList(){
  window.scrollTo(0,0);
  openServiceRecordDisplay();
  // 必要に応じて fetchServiceRecordsByRange() など再検索
}

/********************************************
  Block #10: カレンダー関連
   - JP_MONTHS / EN_MONTHS
   - formatDate()
   - renderGlobalCalendar(...)
   - generateCalendar(...)
   - truncateTitle(...)
********************************************/

const JP_MONTHS = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
const EN_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function formatDate(date) {
  const y = date.getFullYear();
  const m = ("0" + (date.getMonth()+1)).slice(-2);
  const d = ("0" + date.getDate()).slice(-2);
  return `${y}-${m}-${d}`;
}

function renderGlobalCalendar(year, month, events) {
  const calEl = document.getElementById("big-calendar");
  const titleEl = document.getElementById("global-calendar-title");
  titleEl.textContent = `${JP_MONTHS[month]} - ${EN_MONTHS[month]} - ${year}`;
  if (calEl) {
    calEl.innerHTML = generateCalendar(year, month, events);
    // 日セルクリック → その日の予定表示
    document.querySelectorAll(".calendar-cell").forEach(cell => {
      cell.addEventListener("click", () => {
        const dateStr = cell.getAttribute("data-date");
        if (!dateStr) return;
        const dayEvents = events.filter(e=> e.dueDate === dateStr);
        if (dayEvents.length===0) return;
        openDayEventsModal(dateStr, dayEvents);
      });
    });
  }
}

function generateCalendar(year, month, events) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month+1, 0);
  const firstWeekDay = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const weekDays = ["日","月","火","水","木","金","土"];

  let html = "<thead><tr>";
  weekDays.forEach(d=> html+=`<th>${d}</th>`);
  html += `</tr></thead><tbody>`;

  let currentDay = 1;
  const weeksCount = Math.ceil((firstWeekDay + totalDays)/7);

  for (let w=0; w<weeksCount; w++){
    html += `<tr>`;
    for (let d=0; d<7; d++){
      const cellIdx = w*7 + d;
      if (cellIdx<firstWeekDay || currentDay>totalDays){
        html+= `<td></td>`;
      } else {
        const dateObj = new Date(year,month,currentDay);
        const dateStr = formatDate(dateObj);
        const dayEvents = events.filter(e=> e.dueDate===dateStr);

        let cellContent = `<div class="calendar-date">${currentDay}</div>`;
        dayEvents.forEach((ev,idx)=>{
          if (idx===3 && dayEvents.length>4){
            const left = dayEvents.length -3;
            cellContent += `<div class="event-item small-calendar-font">その他${left}件</div>`;
            return;
          }
          if (idx<4){
            cellContent += `<div class="event-item small-calendar-font">
                              ${getEventCircle(ev)}${truncateTitle(ev.title)}
                            </div>`;
          }
        });
        html+= `<td class="calendar-cell" data-date="${dateStr}">${cellContent}</td>`;
        currentDay++;
      }
    }
    html+= `</tr>`;
  }

  html+= `</tbody>`;
  return html;
}

function truncateTitle(txt) {
  return (txt.length>6) ? (txt.slice(0,6)+"…") : txt;
}
/********************************************
  Block #11: 1日の予定一覧モーダル
   - openDayEventsModal(dateStr, dayEvents)
   - closeDayEventsModal()
********************************************/

function openDayEventsModal(dateStr, dayEvents) {
  let html = `<h3>${dateStr}の予定</h3>`;
  dayEvents.forEach(ev=>{
    const line = `${getEventCircle(ev)} ${ev.dueDate} - ${ev.title}`;
    html+= `
      <div class="day-event-item">
        ${line}
        <button class="detail-btn" onclick="openEventDetailModal(${ev.event_id})">詳細</button>
      </div>
    `;
  });
  document.getElementById("day-events-content").innerHTML = html;
  document.getElementById("day-events-modal").style.display = "block";
}

function closeDayEventsModal(){
  document.getElementById("day-events-modal").style.display = "none";
}
/********************************************
  Block #12: イベント詳細モーダル
   - openEventDetailModal(eventId)
   - closeEventDetailModal()
   - computeNextDate(baseDateStr, freq)
********************************************/

function openEventDetailModal(eventId){
  const ev = globalEvents.find(x=> x.event_id===eventId);
  if(!ev){
    alert("イベントが見つかりません。");
    return;
  }
  let html = `<h2>イベント詳細</h2>`;
  html += `<p>【ID】${ev.event_id}</p>`;
  html += `<p>【タイトル】${ev.title}</p>`;
  html += `<p>【ステータス】${ev.status}</p>`;
  html += `<p>【予定日】${ev.dueDate}</p>`;

  // 研修イベントの場合、frequency表示
  if((ev.type==="training"||ev.event_type==="training") && globalTrainingData[ev.title]){
    let freq = globalTrainingData[ev.title].frequency||"";
    if(freq) {
      html += `<p>【実施回数】${freq}</p>`;
    }
  }

  // 次回予定日(仮)
  let nextDate = "";
  if((ev.type==="training"||ev.event_type==="training") && globalTrainingData[ev.title]){
    const freq = globalTrainingData[ev.title].frequency||"";
    nextDate = computeNextDate(ev.dueDate, freq);
  }

  html+= `
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

  // チェック → 完了ボタンenable
  const cbs = document.querySelectorAll(".complete-checkbox");
  const completeBtn = document.getElementById("complete-btn");
  cbs.forEach(cb=>{
    cb.addEventListener("change", ()=>{
      const allChecked = [...cbs].every(x=>x.checked);
      completeBtn.disabled = !allChecked;
    });
  });

  // 完了
  completeBtn.addEventListener("click", ()=>{
    fetch("/complete_event", {
      method:"POST",
      body: new URLSearchParams({id: ev.event_id})
    })
    .then(r=>r.text())
    .then(msg=>{
      if(msg==="success"){
        alert("完了にしました。");
        location.reload();
      } else {
        alert("エラー: "+msg);
      }
    })
    .catch(err=>{
      alert("完了処理に失敗: "+err);
    });
  });

  // 予定日変更
  document.getElementById("update-date-btn").addEventListener("click", ()=>{
    const newDate = document.getElementById("new-event-date").value;
    if(!newDate){
      alert("日付が空です。");
      return;
    }
    fetch("/update_event", {
      method:"POST",
      body: new URLSearchParams({id: ev.event_id, new_date: newDate})
    })
    .then(r=>r.text())
    .then(msg=>{
      if(msg==="success"){
        alert("予定日を変更しました。");
        location.reload();
      } else {
        alert("エラー: "+msg);
      }
    })
    .catch(err=>{
      alert("予定日の変更に失敗: "+err);
    });
  });

  // 削除
  document.getElementById("delete-event-btn").addEventListener("click", ()=>{
    if(!confirm("本当に削除しますか？")) return;
    fetch("/delete_event", {
      method:"POST",
      body: new URLSearchParams({id: ev.event_id})
    })
    .then(r=>r.text())
    .then(msg=>{
      if(msg==="success"){
        alert("削除しました。");
        location.reload();
      } else {
        alert("エラー: "+msg);
      }
    })
    .catch(err=>{
      alert("削除に失敗: "+err);
    });
  });
}

function closeEventDetailModal(){
  document.getElementById("event-detail-modal").style.display = "none";
}

function computeNextDate(baseDateStr, freq){
  const base = new Date(baseDateStr+"T00:00:00");
  if(freq.includes("年2回")){
    base.setMonth(base.getMonth()+6);
  } else {
    base.setFullYear(base.getFullYear()+1);
  }
  return formatDate(base);
}
/********************************************
  Block #13: イベント表示色や優先度
   - getEventCircle(ev)
   - getEventPriority(ev)
********************************************/

function getEventCircle(ev){
  if(ev.status==="完了") return `<span class="circle circle-green">●</span>`;
  const due = new Date(ev.dueDate+"T00:00:00");
  const now = new Date();
  const diff = (due-now)/(1000*3600*24);
  if(diff<0) return `<span class="circle blinking-red">●</span>`;
  if(diff<7) return `<span class="circle circle-red">●</span>`;
  return `<span class="circle circle-yellow">●</span>`;
}
function getEventPriority(ev){
  if(ev.status==="完了") return 4;
  const now = new Date();
  const due = new Date(ev.dueDate+"T00:00:00");
  const diff = (due-now)/(1000*3600*24);
  if(diff<0) return 1;
  if(diff<7) return 2;
  return 3;
}
/********************************************
  Block #14: 今月の予定一覧
   - renderScheduleList()
   - openMonthAllEventsModal()
   - closeMonthAllEventsModal()
   - clickScheduleItem(dateStr)
********************************************/

function renderScheduleList(){
  const scheduleListEl = document.getElementById("schedule-list");
  let html = `<h3 id="month-list-title" style="cursor:pointer;">今月の予定一覧</h3>
              <div id="month-list-content"></div>`;
  scheduleListEl.innerHTML = html;

  document.getElementById("month-list-title").addEventListener("click", openMonthAllEventsModal);

  const today = new Date();
  const y = today.getFullYear();
  const m = ("0"+(today.getMonth()+1)).slice(-2);
  const monthStr = `${y}-${m}`;

  let monthEvents = globalEvents.filter(e=> e.dueDate.startsWith(monthStr));
  if(monthEvents.length===0){
    document.getElementById("month-list-content").innerHTML = "<p>今月の予定はありません。</p>";
    return;
  }
  monthEvents.sort((a,b)=>{
    const prioA = getEventPriority(a);
    const prioB = getEventPriority(b);
    if(prioA!==prioB) return prioA-prioB;
    return new Date(a.dueDate)-new Date(b.dueDate);
  });

  const top10 = monthEvents.slice(0,10);
  const leftover = (monthEvents.length>10)?(monthEvents.length-10):0;
  const col1 = top10.slice(0,5);
  const col2 = top10.slice(5);

  let contentHTML = `<div class="month-schedule-container">
                       <ul class="month-schedule-col">`;
  col1.forEach(ev=>{
    const line = `${getEventCircle(ev)} ${ev.dueDate} - ${ev.title}`;
    contentHTML += `
      <li onclick="clickScheduleItem('${ev.dueDate}')"
          title="クリックでこの日の予定一覧が開きます">
        ${line}
      </li>`;
  });
  for(let i=col1.length; i<5; i++){
    contentHTML += `<li class="empty-slot"></li>`;
  }
  contentHTML += `</ul><ul class="month-schedule-col">`;
  col2.forEach((ev,idx)=>{
    if (idx===4 && leftover>0){
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
  if(col2.length<5){
    for(let i=col2.length; i<5; i++){
      if(i===4 && leftover>0){
        contentHTML += `<li>他 ${leftover}件の予定あり</li>`;
      } else {
        contentHTML += `<li class="empty-slot"></li>`;
      }
    }
  }
  contentHTML += `</ul></div>`;

  document.getElementById("month-list-content").innerHTML = contentHTML;
}

function openMonthAllEventsModal(){
  const today = new Date();
  const y = today.getFullYear();
  const m = ("0"+(today.getMonth()+1)).slice(-2);
  const monthStr = `${y}-${m}`;
  let monthEvents = globalEvents.filter(e=> e.dueDate.startsWith(monthStr));
  if(monthEvents.length===0){
    alert("今月の予定はありません。");
    return;
  }
  monthEvents.sort((a,b)=>{
    const prioA = getEventPriority(a);
    const prioB = getEventPriority(b);
    if(prioA!==prioB) return prioA-prioB;
    return new Date(a.dueDate)-new Date(b.dueDate);
  });
  let html = `<h2>${y}年${parseInt(m)}月 全予定一覧</h2>`;
  monthEvents.forEach(ev=>{
    const line = `${getEventCircle(ev)} ${ev.dueDate} - ${ev.title}`;
    html += `
      <div class="day-event-item">
        ${line}
        <button class="detail-btn" onclick="openEventDetailModal(${ev.event_id})">詳細</button>
      </div>
    `;
  });
  document.getElementById("month-all-events-content").innerHTML = html;
  document.getElementById("month-all-events-modal").style.display = "block";
}
function closeMonthAllEventsModal(){
  document.getElementById("month-all-events-modal").style.display = "none";
}
function clickScheduleItem(dateStr){
  let dayEvents = globalEvents.filter(e=> e.dueDate===dateStr);
  if(dayEvents.length===0){
    alert("この日の予定はありません。");
    return;
  }
  openDayEventsModal(dateStr, dayEvents);
}
/********************************************
  Block #15: モーダルを閉じる系
   - closeTrainingDetail()
   - closeEventDetailModal()
   - closeDayEventsModal()
   - closeMonthAllEventsModal()
********************************************/

function closeTrainingDetail(){
  document.getElementById("training-detail-modal").style.display = "none";
}
function closeEventDetailModal(){
  document.getElementById("event-detail-modal").style.display = "none";
}
function closeDayEventsModal(){
  document.getElementById("day-events-modal").style.display = "none";
}
function closeMonthAllEventsModal(){
  document.getElementById("month-all-events-modal").style.display = "none";
}
