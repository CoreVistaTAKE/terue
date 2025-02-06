document.addEventListener("DOMContentLoaded", function(){
  const titleSelect   = document.getElementById("title-select");
  const autoDetails   = document.getElementById("auto-details");
  const typeHidden    = document.getElementById("type-hidden");
  const detailHidden  = document.getElementById("detail-hidden");

  titleSelect.addEventListener("change", function(){
    const selectedTitle = this.value;
    if (!selectedTitle) {
      autoDetails.innerHTML = "※種類を選択すると内容がここに表示されます";
      typeHidden.value = "";
      detailHidden.value = "";
      return;
    }

    const info = detailsData[selectedTitle];
    if (!info) {
      autoDetails.innerHTML = "該当データがありません";
      return;
    }

    const tType = info.type || "";
    const freq  = info.frequency || "";
    let ded   = info.deductionRisk ? "対象" : "なし";
    const participants = info.participants || [];
    const sections = info.sections || {};

    let html = `<h2>${selectedTitle} [${tType}]</h2>
                <p>開催の回数(頻度): ${freq}</p>
                <p>未実施減算: ${ded}</p>
                <p>参加者: ${participants.join(" / ")}</p>
                <hr>`;
    for (let s in sections) {
      html += `<h3>${s}</h3><p>${sections[s]}</p>`;
    }

    autoDetails.innerHTML = html;
    typeHidden.value   = tType;
    detailHidden.value = html; 
  });
});
