########################################
# Block #1: インポートとFlask初期設定
########################################
import os
import json
import sqlite3
import re
from flask import Flask, render_template, request, redirect, url_for, send_from_directory, make_response, jsonify
from datetime import datetime

# PDF生成用(WeasyPrint)
from weasyprint import HTML, CSS

app = Flask(__name__)

########################################
# Block #2: 各DB接続関数
########################################

def get_db_connection():
    """
    training.db への接続 (研修・訓練関連、events, training_master 用)
    """
    base_dir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(base_dir, 'training.db')
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def get_daily_db_connection():
    """
    daily_report.db への接続 (業務日報 / サービス提供記録 用)
    """
    base_dir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(base_dir, 'daily_report.db')
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def get_management_db_connection():
    """
    management.db への接続 (施設情報・利用者情報 用)
    かつ、users テーブルに commute_json カラムが無ければ追加
    """
    base_dir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(base_dir, 'management.db')
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON;")

    # commute_json カラムが無ければ追加（利用者情報の通所枠等を格納する）
    try:
        cur = conn.cursor()
        cur.execute("PRAGMA table_info(users)")
        columns = [row[1] for row in cur.fetchall()]
        if 'commute_json' not in columns:
            cur.execute("ALTER TABLE users ADD COLUMN commute_json TEXT")
            conn.commit()
        cur.close()
    except Exception as e:
        print("Warning: commute_jsonカラムの確認/追加処理でエラーが発生しました:", e)

    return conn

########################################
# Block #3: 日報DB初期化
########################################
def init_daily_db():
    """
    業務日報 / サービス提供記録 テーブル作成 (daily_report.db)
    """
    conn = get_daily_db_connection()
    c = conn.cursor()

    # --- 業務日誌テーブル ---
    c.execute("""
        CREATE TABLE IF NOT EXISTS daily_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            report_date TEXT,
            user_name TEXT,
            staff_day TEXT,
            staff_night TEXT,
            staff_extra TEXT,
            lunch_menu TEXT,
            dinner_menu TEXT,
            breakfast_menu TEXT,
            content_json TEXT,
            status TEXT DEFAULT '未', -- '未' or '済'
            created_at TEXT,
            updated_at TEXT
        );
    """)

    # --- サービス提供記録テーブル ---
    # ▼ status カラムを追加 (初期値 '未')
    c.execute("""
        CREATE TABLE IF NOT EXISTS user_service_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            report_date TEXT NOT NULL,
            user_id INTEGER NOT NULL,
            staff_day TEXT,
            staff_night TEXT,
            staff_extra TEXT,
            lunch_menu TEXT,
            dinner_menu TEXT,
            breakfast_menu TEXT,
            content_json TEXT,
            status TEXT DEFAULT '未', -- '未' or '済'
            created_at TEXT,
            updated_at TEXT
        );
    """)

    # もし既にテーブルがあって、status列が無い場合は追加
    c.execute("PRAGMA table_info(user_service_records)")
    existing_cols = [row[1] for row in c.fetchall()]
    if "status" not in existing_cols:
        c.execute("ALTER TABLE user_service_records ADD COLUMN status TEXT DEFAULT '未'")

    conn.commit()
    c.close()
    conn.close()


########################################
# Block #4: training_details.json の差分アップサート
########################################
def load_master_json_into_db(conn):
    """
    training_details.json を読み込み、
    training_master に差分アップサートする
    """
    json_path = os.path.join(os.path.dirname(__file__), "training_details.json")
    if not os.path.exists(json_path):
        print("WARNING: training_details.json が見つからないためスキップ")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    cur = conn.cursor()
    for title, info in data.items():
        t_type = info.get("type", "")
        freq = info.get("frequency", "")
        ded_risk = info.get("deductionRisk", "")
        participants = info.get("participants", [])
        participants_str = ",".join(participants)

        sections = info.get("sections", {})
        sections_json = json.dumps(sections, ensure_ascii=False)

        manual_template = info.get("ManualTemplate", "")
        doc_template = info.get("DocTemplate", "")

        mg_data = info.get("manualGuide", {})
        if isinstance(mg_data, dict):
            manual_guide_str = json.dumps(mg_data, ensure_ascii=False)
        elif isinstance(mg_data, str):
            manual_guide_str = mg_data
        else:
            manual_guide_str = ""

        # INSERT OR UPDATE
        cur.execute("""
            INSERT INTO training_master (
                title,
                type,
                frequency,
                deduction_risk,
                participants,
                sections,
                manual_template,
                doc_template,
                manual_guide,
                planned_date,
                status
            )
            VALUES (:title, :t_type, :freq, :ded_risk, :parts, :sections,
                    :mtemp, :dtemp, :mguide, '', '未完了')
            ON CONFLICT(title)
            DO UPDATE SET
                type            = excluded.type,
                frequency       = excluded.frequency,
                deduction_risk  = excluded.deduction_risk,
                participants    = excluded.participants,
                sections        = excluded.sections,
                manual_template = excluded.manual_template,
                doc_template    = excluded.doc_template,
                manual_guide    = excluded.manual_guide,
                planned_date    = training_master.planned_date,
                status          = training_master.status
        """, {
            "title": title,
            "t_type": t_type,
            "freq": freq,
            "ded_risk": ded_risk,
            "parts": participants_str,
            "sections": sections_json,
            "mtemp": manual_template,
            "dtemp": doc_template,
            "mguide": manual_guide_str
        })
    conn.commit()
    cur.close()

########################################
# Block #5: 管理DB (management.db) 初期化
########################################
def init_management_db():
    """
    施設情報・利用者情報を保存する management.db を初期化
    """
    conn = get_management_db_connection()
    c = conn.cursor()

    # 施設情報テーブル
    c.execute("""
        CREATE TABLE IF NOT EXISTS facility_info (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            facility_type TEXT,
            capacity INTEGER,
            facility_name TEXT,
            facility_number TEXT,
            address TEXT,
            phone TEXT,
            fax TEXT,
            manager_name TEXT,
            manager_phone TEXT,
            manager_contact TEXT,
            sabikan_name TEXT,
            sabikan_phone TEXT,
            sabikan_contact TEXT
        );
    """)

    # usersテーブル (短期目標は short_goal1~5 / short_support1~5)
    c.execute("""
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            furigana TEXT,
            gender TEXT,
            birthday TEXT,
            age INTEGER,
            user_address TEXT,
            user_phone TEXT,
            user_email TEXT,

            income_type TEXT,
            money_manager TEXT,
            emergency1 TEXT,
            emergency2 TEXT,
            emergency3 TEXT,

            contract_start TEXT,
            contract_end TEXT,
            facility_name TEXT,
            service_name TEXT,
            facility_number TEXT,
            facility_address TEXT,
            facility_phone TEXT,
            facility_fax TEXT,
            staff_roles TEXT,

            recipient_number TEXT,
            shien_kubun TEXT,
            shien_kubun_start TEXT,
            shien_kubun_end TEXT,

            handicapped_handbook TEXT,
            hospital1 TEXT,
            medicine1 TEXT,
            hospital2 TEXT,
            medicine2 TEXT,
            hospital3 TEXT,
            medicine3 TEXT,
            previous_illness TEXT,
            visiting_nurse TEXT,
            visiting_nurse_schedule TEXT,
            visiting_dentist TEXT,
            visiting_dentist_schedule TEXT,
            special_care TEXT,

            counselor TEXT,
            weekday_place TEXT,
            weekday_transit TEXT,
            weekday_phone TEXT,
            sat_place TEXT,
            sat_transit TEXT,
            sat_phone TEXT,
            sun_place TEXT,
            sun_transit TEXT,
            sun_phone TEXT,
            holiday_place TEXT,
            holiday_transit TEXT,
            holiday_phone TEXT,

            adl TEXT,
            iadl TEXT,

            diet_restriction TEXT,
            allergies TEXT,
            dislikes TEXT,

            support_notice1 TEXT,
            support_notice2 TEXT,
            support_notice3 TEXT,
            risk_management TEXT,
            panic_trigger1 TEXT,
            panic_trigger2 TEXT,
            sense_overload TEXT,

            mobility TEXT,
            life_history TEXT,
            communication TEXT,
            hobby_community TEXT,
            favorite TEXT,
            good_at TEXT,
            not_good_at TEXT,
            long_goal TEXT,

            short_goal1 TEXT,
            short_support1 TEXT,
            short_goal2 TEXT,
            short_support2 TEXT,
            short_goal3 TEXT,
            short_support3 TEXT,
            short_goal4 TEXT,
            short_support4 TEXT,
            short_goal5 TEXT,
            short_support5 TEXT,

            future_hope TEXT,
            other_notes TEXT
        );
    """)

    conn.commit()
    c.close()
    conn.close()

########################################
# Block #6: DB初期化(main)
########################################
def init_dbs():
    # 1) training.db (events, training_master)
    conn = get_db_connection()
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS events(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL,
            content TEXT,
            event_type TEXT,
            detail TEXT,
            completed_at TEXT
        );
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS training_master(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT UNIQUE NOT NULL,
            type TEXT,
            frequency TEXT,
            deduction_risk TEXT,
            participants TEXT,
            sections TEXT,
            manual_template TEXT,
            doc_template TEXT,
            manual_guide TEXT,
            planned_date TEXT
        );
    """)
    # status列が無ければ追加
    c.execute("PRAGMA table_info(training_master)")
    existing_cols = [row[1] for row in c.fetchall()]
    if "status" not in existing_cols:
        c.execute("ALTER TABLE training_master ADD COLUMN status TEXT DEFAULT '未完了';")

    conn.commit()
    c.close()
    conn.close()

    # 2) 日報DB (daily_reports, user_service_records)
    init_daily_db()

    # 3) management.db (facility_info, users)
    init_management_db()

########################################
# Block #7: ルート(トップ)
########################################
@app.route("/")
def index():
    # training.db に接続して master をロード
    conn = get_db_connection()
    load_master_json_into_db(conn)
    c = conn.cursor()

    # events
    c.execute("SELECT id, title, date, status, content, event_type, detail, completed_at FROM events")
    rows = c.fetchall()
    event_list = []
    for row in rows:
        event_list.append({
            "event_id": row[0],
            "title": row[1],
            "dueDate": row[2],
            "status": row[3],
            "content": row[4],
            "type": row[5],
            "detail": row[6],
            "completed_at": row[7]
        })

    # training_master
    c.execute("""
        SELECT title, type, frequency, deduction_risk, participants, sections,
               manual_template, doc_template, manual_guide, planned_date, status
        FROM training_master
    """)
    rows_master = c.fetchall()
    training_details = {}
    for row in rows_master:
        title = row[0]
        t_type = row[1]
        freq = row[2]
        ded_risk = row[3]
        parts_str = row[4] or ""
        sections_json = row[5] or ""
        mtemp = row[6] or ""
        dtemp = row[7] or ""
        mguide_str = row[8] or ""
        planned = row[9] or ""
        t_status = row[10] or "未完了"

        plist = parts_str.split(",") if parts_str else []
        try:
            sections_dict = json.loads(sections_json) if sections_json else {}
        except:
            sections_dict = {}
        try:
            mguide_data = json.loads(mguide_str)
        except:
            mguide_data = mguide_str

        training_details[title] = {
            "type": t_type,
            "frequency": freq,
            "deductionRisk": ded_risk,
            "participants": plist,
            "sections": sections_dict,
            "ManualTemplate": mtemp,
            "DocTemplate": dtemp,
            "manualGuide": mguide_data,
            "plannedDate": planned,
            "status": t_status
        }

    c.close()
    conn.close()

    # イベントと研修データをJSON文字列でテンプレに渡す
    return render_template(
        "index.html",
        events=event_list,
        training_details=training_details
    )

########################################
# Block #8: イベント操作 (training.db)
########################################
@app.route("/complete_event", methods=["POST"])
def complete_event():
    event_id = request.form.get("id", type=int)
    if not event_id:
        return "error - no id", 400

    conn = get_db_connection()
    c = conn.cursor()
    c.execute("SELECT id, title, date, status, content, event_type, detail, completed_at FROM events WHERE id=?", (event_id,))
    row = c.fetchone()
    if not row:
        c.close()
        conn.close()
        return "error - no event", 404

    completed_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    c.execute("UPDATE events SET status='完了', completed_at=? WHERE id=?", (completed_time, event_id))

    event_type = row[5]
    event_title = row[1]
    if event_type == "training":
        c.execute("UPDATE training_master SET status='完了' WHERE title=?", (event_title,))

    conn.commit()
    c.close()
    conn.close()
    return "success"

@app.route("/update_event", methods=["POST"])
def update_event():
    event_id = request.form.get("id", type=int)
    new_date = request.form.get("new_date")
    if not event_id or not new_date:
        return "error - invalid params", 400

    conn = get_db_connection()
    c = conn.cursor()
    c.execute("UPDATE events SET date=?, status='予定' WHERE id=?", (new_date, event_id))
    conn.commit()
    c.close()
    conn.close()
    return "success"

@app.route("/delete_event", methods=["POST"])
def delete_event():
    event_id = request.form.get("id", type=int)
    if not event_id:
        return "error - no id", 400

    conn = get_db_connection()
    c = conn.cursor()
    c.execute("DELETE FROM events WHERE id=?", (event_id,))
    conn.commit()
    c.close()
    conn.close()
    return "success"

@app.route("/update_planned_date", methods=["POST"])
def update_planned_date():
    item_title = request.form.get("title")
    planned_date = request.form.get("planned_date","")

    conn = get_db_connection()
    c = conn.cursor()
    c.execute("UPDATE training_master SET planned_date=? WHERE title=?", (planned_date, item_title))

    if planned_date:
        c.execute("SELECT id FROM events WHERE title=? AND event_type='training'", (item_title,))
        row = c.fetchone()
        if row:
            c.execute("UPDATE events SET date=?, status='予定' WHERE id=?", (planned_date, row[0]))
        else:
            c.execute("""
                INSERT INTO events(title,date,status,content,event_type,detail)
                VALUES(?,?,?,?,?,?)
            """,(item_title, planned_date,'予定','Training/研修','training',''))

    conn.commit()
    c.close()
    conn.close()
    return planned_date

########################################
# Block #9: ファイルアップロード (example)
########################################
@app.route("/upload_record", methods=["POST"])
def upload_record():
    file = request.files.get("record-file")
    if file:
        updir = os.path.join(os.path.abspath(os.path.dirname(__file__)), "uploads")
        os.makedirs(updir, exist_ok=True)
        fp = os.path.join(updir, file.filename)
        file.save(fp)
    return redirect(url_for("index"))

@app.route("/download_sample/<filename>")
def download_sample(filename):
    base_dir = os.path.abspath(os.path.dirname(__file__))
    sample_dir = os.path.join(base_dir, "static", "sample")
    return send_from_directory(sample_dir, filename, as_attachment=True)


########################################
# Block #10: 業務日報 API (daily_report.db)
########################################
@app.route("/daily_reports", methods=["GET"])
def daily_reports():
    """
    業務日報の一覧
    """
    start_date = request.args.get("start_date","")
    end_date   = request.args.get("end_date","")

    conn = get_daily_db_connection()
    c = conn.cursor()

    sql = "SELECT id, report_date, user_name, status FROM daily_reports WHERE 1=1"
    params = []
    if start_date:
        sql += " AND report_date >= ?"
        params.append(start_date)
    if end_date:
        sql += " AND report_date <= ?"
        params.append(end_date)
    sql += " ORDER BY report_date ASC, user_name ASC"

    c.execute(sql, params)
    rows = c.fetchall()
    c.close()
    conn.close()

    results = []
    for row in rows:
        results.append({
            "id": row[0],
            "report_date": row[1],
            "user_name": row[2],
            "status": row[3]
        })
    return jsonify({"reports": results})

@app.route("/show_daily_report/<int:report_id>")
def show_daily_report(report_id):
    """
    業務日報1件取得
    """
    conn = get_daily_db_connection()
    c = conn.cursor()
    c.execute("""
        SELECT id, report_date, user_name, staff_day, staff_night, staff_extra,
               lunch_menu, dinner_menu, breakfast_menu, content_json, status
        FROM daily_reports
        WHERE id=?
    """,(report_id,))
    row = c.fetchone()
    c.close()
    conn.close()

    if not row:
        return jsonify({"error":"not found"}),404

    (r_id, r_date, r_user,
     s_day, s_night, s_extra,
     l_menu, d_menu, b_menu,
     c_json, st) = row

    return jsonify({
        "id":r_id,
        "report_date":r_date,
        "user_name":r_user,
        "staff_day":s_day,
        "staff_night":s_night,
        "staff_extra":s_extra,
        "lunch_menu":l_menu,
        "dinner_menu":d_menu,
        "breakfast_menu":b_menu,
        "content_json":c_json,
        "status":st
    })

@app.route("/daily_report_pdf/<int:report_id>")
def daily_report_pdf(report_id):
    """
    業務日誌PDF印刷
    ※ フォントを反映するため、styles.css を読み込む。
    """
    conn = get_daily_db_connection()
    c = conn.cursor()
    c.execute("""
        SELECT report_date, user_name, staff_day, staff_night, staff_extra,
               lunch_menu, dinner_menu, breakfast_menu, content_json, status
        FROM daily_reports
        WHERE id=?
    """,(report_id,))
    row = c.fetchone()
    c.close()
    conn.close()
    if not row:
        return "No report found",404

    (report_date, user_name, staff_day, staff_night, staff_extra,
     lunch_menu, dinner_menu, breakfast_menu, content_json, status) = row

    cdict = {}
    try:
        cdict = json.loads(content_json or "{}")
    except:
        pass

    mmdd_label = report_date
    if re.match(r"^(\d{4})-(\d{2})-(\d{2})$", report_date):
        y, m, d = report_date.split("-")
        mmdd_label = f"{int(m)}月{int(d)}日"

    mgr_text = "未完了"
    mgr_style = "color:gray;"
    if cdict.get("managerCheck") == "on" or status == "済":
        mgr_text = "確認済"
        mgr_style = "color:red; font-weight:bold;"

    # HTMLソースを組み立て
    html_src = f"""
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page {{ size:A4; margin:20mm; }}
        body {{
          font-family: 'NotoSansJP', sans-serif;  /* ←ここを Roboto → NotoSansJP に変更 */
          font-size: 12pt;
        }}
        .frame {{
          border: 1px solid #ccc;
          margin-bottom: 10px;
          padding: 8px;
          border-radius: 6px;
        }}
        .frame h2 {{
          margin-top:0;
          font-size:14pt;
          border-bottom:1px solid #666;
          margin-bottom:4px;
        }}
      </style>
    </head>
    <body>
      <h1 style="text-align:center;">業務日誌</h1>
      <p>日報ID: {report_id}</p>

      <div class="frame">
        <h2>日時・スタッフ名</h2>
        <p><strong>記録日:</strong> {mmdd_label}</p>
    """

    day_time = cdict.get("day_time","")
    if staff_day:
        html_src += f"<p><strong>日中スタッフ名:</strong> {staff_day}"
        if day_time:
            html_src += f" (勤務時間:{day_time})"
        html_src += "</p>"

    night_time = cdict.get("night_time","")
    html_src += f"<p><strong>夜勤スタッフ名:</strong> {staff_night}"
    if night_time:
        html_src += f" (勤務時間:{night_time})"
    html_src += "</p>"

    extra_time = cdict.get("extra_time","")
    if staff_extra:
        html_src += f"<p><strong>追加スタッフ名:</strong> {staff_extra}"
        if extra_time:
            html_src += f" (勤務時間:{extra_time})"
        html_src += "</p>"

    html_src += "</div>"

    html_src += """
      <div class="frame">
        <h2>食事の献立</h2>
    """
    if staff_day and lunch_menu:
        html_src += f"<p><strong>昼食の献立:</strong> {lunch_menu}</p>"
    html_src += f"<p><strong>夕食の献立:</strong> {dinner_menu}</p>"
    html_src += f"<p><strong>朝食の献立:</strong> {breakfast_menu}</p>"
    html_src += "</div>"

    businessContent = cdict.get("businessContent","")
    relayInfo = cdict.get("relayInfo","")
    html_src += """
      <div class="frame">
        <h2>当日業務の報告</h2>
    """
    html_src += f"<p><strong>業務内容:</strong><br>「{businessContent}」</p>"
    html_src += f"<p><strong>連絡・引継ぎ事項:</strong><br>「{relayInfo}」</p>"
    html_src += "</div>"

    html_src += f"""
      <div class="frame">
        <h2>管理者確認</h2>
        <p><strong>管理者確認:</strong> <span style="{mgr_style}">{mgr_text}</span></p>
      </div>
    """

    html_src += """
    </body>
    </html>
    """

    # ▼ styles.css を読み込むための準備
    base_dir = os.path.abspath(os.path.dirname(__file__))
    pdf_css_path = os.path.join(base_dir, "static", "styles.css")

    # PDF生成
    pdf = HTML(string=html_src, base_url=request.url_root).write_pdf(
        stylesheets=[CSS(pdf_css_path)]
    )
    resp = make_response(pdf)
    resp.headers["Content-Type"] = "application/pdf"
    resp.headers["Content-Disposition"] = f'inline; filename="DailyReport_{report_id}.pdf"'
    return resp

@app.route("/save_daily_report", methods=["POST"])
def save_daily_report():
    """
    業務日報の保存
    """
    report_date = request.form.get("report_date", "")
    user_name   = request.form.get("user_name", "")
    staff_day   = request.form.get("staff_day", "")
    staff_night = request.form.get("staff_night", "")
    staff_extra = request.form.get("staff_extra", "")

    lunch_menu     = request.form.get("lunch_menu", "")
    dinner_menu    = request.form.get("dinner_menu", "")
    breakfast_menu = request.form.get("breakfast_menu", "")

    check_23 = request.form.get("check_23","")
    check_1  = request.form.get("check_1","")
    check_3  = request.form.get("check_3","")
    content_json_from_front = request.form.get("content_json","")

    conn = get_daily_db_connection()
    c = conn.cursor()

    c.execute("SELECT id, content_json, status FROM daily_reports WHERE report_date=? AND user_name=?", (report_date, user_name))
    row = c.fetchone()
    if row:
        rid = row[0]
        existing_json_str = row[1] or ""
        current_status    = row[2] or "未"

        try:
            existing_obj = json.loads(existing_json_str)
        except:
            existing_obj = {}

        if content_json_from_front:
            try:
                new_obj = json.loads(content_json_from_front)
            except:
                new_obj = {}
            for k,v in new_obj.items():
                existing_obj[k] = v
        else:
            if check_23 or check_1 or check_3:
                existing_obj["check_23"] = check_23
                existing_obj["check_1"]  = check_1
                existing_obj["check_3"]  = check_3

        manager_val = existing_obj.get("managerCheck","off")
        new_status = "済" if manager_val == "on" else current_status

        merged_json_str = json.dumps(existing_obj, ensure_ascii=False)
        c.execute("""
            UPDATE daily_reports
            SET staff_day=?, staff_night=?, staff_extra=?,
                lunch_menu=?, dinner_menu=?, breakfast_menu=?,
                content_json=?, status=?,
                updated_at=datetime('now')
            WHERE id=?
        """, (
            staff_day, staff_night, staff_extra,
            lunch_menu, dinner_menu, breakfast_menu,
            merged_json_str, new_status, rid
        ))
        new_id = rid
    else:
        new_status = "未"
        fallback_obj = {
            "check_23": check_23,
            "check_1": check_1,
            "check_3": check_3
        }
        if content_json_from_front:
            try:
                front_obj = json.loads(content_json_from_front)
            except:
                front_obj = {}
            for k,v in fallback_obj.items():
                if k not in front_obj:
                    front_obj[k] = v
            if front_obj.get("managerCheck","off") == "on":
                new_status = "済"
            merged_json_str = json.dumps(front_obj, ensure_ascii=False)
        else:
            merged_json_str = json.dumps(fallback_obj, ensure_ascii=False)

        c.execute("""
            INSERT INTO daily_reports(
                report_date, user_name,
                staff_day, staff_night, staff_extra,
                lunch_menu, dinner_menu, breakfast_menu,
                content_json, status,
                created_at, updated_at
            ) VALUES(?,?,?,?,?,?,?,?,?,?, datetime('now'), datetime('now'))
        """, (
            report_date, user_name,
            staff_day, staff_night, staff_extra,
            lunch_menu, dinner_menu, breakfast_menu,
            merged_json_str, new_status
        ))
        new_id = c.lastrowid

    conn.commit()
    c.close()
    conn.close()
    return str(new_id)

@app.route("/delete_daily_report", methods=["POST"])
def delete_daily_report():
    report_id = request.form.get("report_id", type=int)
    if not report_id:
        return "error - no id", 400

    conn = get_daily_db_connection()
    c = conn.cursor()
    c.execute("DELETE FROM daily_reports WHERE id=?", (report_id,))
    conn.commit()
    c.close()
    conn.close()
    return "ok"

########################################
# Block #11: サービス提供記録 API (daily_report.db)
########################################
@app.route("/api/service_records", methods=["GET"])
def get_service_records():
    start_date = request.args.get("start_date","")
    end_date   = request.args.get("end_date","")
    user_id    = request.args.get("user_id","")

    conn = get_daily_db_connection()
    c = conn.cursor()
    sql = "SELECT id, report_date, user_id FROM user_service_records WHERE 1=1"
    params = []
    if start_date:
        sql += " AND report_date >= ?"
        params.append(start_date)
    if end_date:
        sql += " AND report_date <= ?"
        params.append(end_date)
    if user_id:
        sql += " AND user_id=?"
        params.append(user_id)
    sql += " ORDER BY report_date ASC, user_id ASC"

    c.execute(sql, params)
    rows = c.fetchall()
    c.close()
    conn.close()

    recs = []
    for row in rows:
        recs.append({
            "id": row[0],
            "report_date": row[1],
            "user_id": row[2]
        })
    return jsonify({"records": recs})

@app.route("/api/service_record/<int:rec_id>", methods=["GET"])
def get_service_record(rec_id):
    conn = get_daily_db_connection()
    c = conn.cursor()
    c.execute("""
        SELECT id, report_date, user_id,
               staff_day, staff_night, staff_extra,
               lunch_menu, dinner_menu, breakfast_menu,
               content_json, status
         FROM user_service_records
        WHERE id=?
    """,(rec_id,))
    row = c.fetchone()
    c.close()
    conn.close()

    if not row:
        return jsonify({"error":"not found"}),404

    (r_id, r_date, uid,
     s_day, s_night, s_extra,
     l_menu, d_menu, b_menu,
     c_json, st) = row

    return jsonify({
        "id": r_id,
        "report_date": r_date,
        "user_id": uid,
        "staff_day": s_day,
        "staff_night": s_night,
        "staff_extra": s_extra,
        "lunch_menu": l_menu,
        "dinner_menu": d_menu,
        "breakfast_menu": b_menu,
        "content_json": c_json,
        "status": st
    })


@app.route("/save_service_record", methods=["POST"])
def save_service_record():
    """
    サービス提供記録の保存。managerCheck='on'なら status='済'、offなら'未'。
    """
    data = request.form
    record_json = data.get("service_record_json", "")
    try:
        record_obj = json.loads(record_json)
    except:
        record_obj = {}

    report_date = record_obj.get("dateValue","2025-01-01")
    user_id     = record_obj.get("userId","0")
    staff_day   = record_obj.get("staffDay","")
    staff_night = record_obj.get("staffNight","")
    staff_extra = record_obj.get("staffExtra","")
    lunch_menu  = record_obj.get("lunchMenu","")
    dinner_menu = record_obj.get("dinnerMenu","")
    breakfast_menu = record_obj.get("breakfastMenu","")

    # managerCheck の値をチェック
    manager_val = record_obj.get("managerCheck","off")

    conn = get_daily_db_connection()
    c = conn.cursor()
    c.execute("SELECT id, content_json, status FROM user_service_records WHERE report_date=? AND user_id=?", (report_date, user_id))
    row = c.fetchone()
    if row:
        # 既存レコードがある場合 -> UPDATE
        rec_id = row[0]
        existing_json_str = row[1] or ""
        current_status    = row[2] or "未"
        try:
            existing_obj = json.loads(existing_json_str)
        except:
            existing_obj = {}

        # 上書きマージ
        for k,v in record_obj.items():
            existing_obj[k] = v

        new_status = "済" if (manager_val=="on") else current_status

        merged_str = json.dumps(existing_obj, ensure_ascii=False)
        c.execute("""
            UPDATE user_service_records
            SET staff_day=?, staff_night=?, staff_extra=?,
                lunch_menu=?, dinner_menu=?, breakfast_menu=?,
                content_json=?, status=?,
                updated_at=datetime('now')
            WHERE id=?
        """,(
            staff_day, staff_night, staff_extra,
            lunch_menu, dinner_menu, breakfast_menu,
            merged_str, new_status,
            rec_id
        ))
        new_id = rec_id
    else:
        # 新規登録
        new_status = "未"
        if manager_val=="on":
            new_status = "済"

        content_str = json.dumps(record_obj, ensure_ascii=False)

        c.execute("""
            INSERT INTO user_service_records(
                report_date, user_id,
                staff_day, staff_night, staff_extra,
                lunch_menu, dinner_menu, breakfast_menu,
                content_json, status,
                created_at, updated_at
            ) VALUES(?,?,?,?,?,?,?,?,?,?, datetime('now'), datetime('now'))
        """,(
            report_date, user_id,
            staff_day, staff_night, staff_extra,
            lunch_menu, dinner_menu, breakfast_menu,
            content_str, new_status
        ))
        new_id = c.lastrowid

    conn.commit()
    c.close()
    conn.close()
    return str(new_id)


@app.route("/delete_service_record", methods=["POST"])
def delete_service_record():
    rec_id = request.form.get("id", type=int)
    if not rec_id:
        return "error - no id", 400

    conn = get_daily_db_connection()
    c = conn.cursor()
    c.execute("DELETE FROM user_service_records WHERE id=?", (rec_id,))
    conn.commit()
    c.close()
    conn.close()
    return "ok"


@app.route("/service_record_pdf/<int:rec_id>")
def service_record_pdf(rec_id):
    """
    サービス提供記録PDFをA4一枚で印刷する。
    枠1～枠7の仕様に沿ってレイアウトを組み立てる。
    フォントは styles.css で設定。
    """
    conn = get_daily_db_connection()
    c = conn.cursor()
    c.execute("""
       SELECT report_date, user_id, staff_day, staff_night, staff_extra,
              lunch_menu, dinner_menu, breakfast_menu,
              content_json,
              status
         FROM user_service_records
        WHERE id=?
    """,(rec_id,))
    row = c.fetchone()
    c.close()
    conn.close()
    if not row:
        return "No record found",404

    (r_date, u_id, s_day, s_night, s_extra,
     l_menu, d_menu, b_menu,
     c_json,
     st) = row

    import json
    try:
        cdict = json.loads(c_json or "{}")
    except:
        cdict = {}

    mgr_val = cdict.get("managerCheck","off")
    if mgr_val=="on" or st=="済":
        mgr_text  = "確認済"
        mgr_color = "red"
    else:
        mgr_text  = "未完了"
        mgr_color = "black"

    # user_name 取得 (management.db)
    user_name = f"利用者ID:{u_id}"
    try:
        conn_m = get_management_db_connection()
        cm = conn_m.cursor()
        cm.execute("SELECT name FROM users WHERE id=?", (u_id,))
        row_m = cm.fetchone()
        cm.close()
        conn_m.close()
        if row_m:
            user_name = row_m[0] or user_name
    except:
        pass

    def getHomeStateLabel(val):
        if val=="1": return "特に気になることはありません。"
        if val=="2": return "少し疲れた様子"
        if val=="3": return "体調不良の訴え"
        if val=="4": return "不穏な雰囲気"
        return val or ""

    def getWakeStateLabel(val):
        if val=="1": return "ご自身で起床"
        if val=="2": return "声掛けで起床"
        if val=="3": return "体調不良の訴え"
        if val=="4": return "不穏な雰囲気"
        if val=="5": return "その他"
        return val or ""

    is_daytime = True if s_day else False

    dayMealScore     = cdict.get("dayMealScore","")
    dayMealLeft      = cdict.get("dayMealLeft","")
    dayStatus        = cdict.get("dayStatus","")
    daytimeActivity  = cdict.get("daytimeActivity","")
    homeTime         = cdict.get("homeTime","")
    homeState        = cdict.get("homeState","")
    homeStateDetail  = cdict.get("homeStateDetail","")
    dayAfterMeds     = cdict.get("dayAfterMeds","off")

    dinnerTemp       = cdict.get("dinnerTemp","")
    dinnerSpo2       = cdict.get("dinnerSpo2","")
    dinnerBP1        = cdict.get("dinnerBP1","")
    dinnerBP2        = cdict.get("dinnerBP2","")
    dinnerPulse      = cdict.get("dinnerPulse","")
    dinnerMealScore  = cdict.get("dinnerMealScore","")
    dinnerMealLeft   = cdict.get("dinnerMealLeft","")
    nightAfterMeds   = cdict.get("nightAfterMeds","off")

    sleepMeds        = cdict.get("sleepMeds","off")
    sleepTime        = cdict.get("sleepTime","")
    check23User      = cdict.get("check23User","")
    check1User       = cdict.get("check1User","")
    check3User       = cdict.get("check3User","")

    wakeTime         = cdict.get("wakeTime","")
    wakeState        = cdict.get("wakeState","")
    wakeDetail       = cdict.get("wakeDetail","")

    breakfastTemp    = cdict.get("breakfastTemp","")
    breakfastSpo2    = cdict.get("breakfastSpo2","")
    breakfastBP1     = cdict.get("breakfastBP1","")
    breakfastBP2     = cdict.get("breakfastBP2","")
    breakfastPulse   = cdict.get("breakfastPulse","")
    breakfastMealScore = cdict.get("breakfastMealScore","")
    breakfastMealLeft  = cdict.get("breakfastMealLeft","")
    morningAfterMeds   = cdict.get("morningAfterMeds","off")

    userCondition    = cdict.get("userCondition","")

    foodAssistChecked      = cdict.get("foodAssistChecked","off")
    foodAssistDetail       = cdict.get("foodAssistDetail","")
    bathAssistChecked      = cdict.get("bathAssistChecked","off")
    bathAssistDetail       = cdict.get("bathAssistDetail","")
    excretionAssistChecked = cdict.get("excretionAssistChecked","off")
    excretionAssistDetail  = cdict.get("excretionAssistDetail","")
    changeAssistChecked    = cdict.get("changeAssistChecked","off")
    changeAssistDetail     = cdict.get("changeAssistDetail","")
    lifeSupportChecked     = cdict.get("lifeSupportChecked","off")
    lifeSupportDetail      = cdict.get("lifeSupportDetail","")
    mentalCareChecked      = cdict.get("mentalCareChecked","off")
    mentalCareDetail       = cdict.get("mentalCareDetail","")

    longTermGoalSupport = cdict.get("longTermGoalSupport","")
    shortTermComments   = cdict.get("shortTermComments",{})

    homeLabel = getHomeStateLabel(homeState)
    wakeLabel = getWakeStateLabel(wakeState)

    # 短期目標コメント
    stc_html = ""
    if isinstance(shortTermComments, dict):
        sorted_keys = sorted(shortTermComments.keys(), key=lambda x:int(x) if x.isdigit() else 9999)
        for k in sorted_keys:
            v = shortTermComments[k]
            if v:
                stc_html += f"短期目標{k}に対するコメント: {v}<br>"

    # 日付(yyyy-mm-dd → M月D日)
    display_date = r_date
    try:
        y,m,d = r_date.split("-")
        display_date = f"{int(m)}月{int(d)}日"
    except:
        pass

    # 昼食パート
    lunch_part = ""
    if is_daytime:
        lunch_part += f"<p><strong>昼食:</strong> 残量:{dayMealScore}/10"
        if dayMealLeft:
            lunch_part += f" 残:{dayMealLeft}"
        lunch_part += "</p>"
        lunch_part += f"<p><strong>日中の様子:</strong> {dayStatus}</p>"

    # HTML組み立て
    html_src = f"""
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {{ size:A4; margin:10mm; }}
    body {{
      font-family: 'NotoSansJP', sans-serif;  /* ←ここを Roboto → NotoSansJP に変更 */
      font-size: 12pt;
      line-height: 1.4;
    }}
    h2,h3 {{
      margin: 0 0 4px 0;
      padding: 0;
    }}
    hr {{
      margin: 8px 0;
      border: none;
      border-top: 1px solid #ccc;
    }}
  </style>
</head>
<body>
<!-- (枠1) -->
<p>利用者: {user_name}</p>
<p>記録日: <strong>{display_date}</strong></p>
<p><strong>支援スタッフ</strong><br>
   {"日中スタッフ: "+(s_day or "")+" 勤務時間:"+cdict.get("day_time","")+"<br>" if s_day else ""}
   夜間スタッフ: {(s_night or "")} 勤務時間:{cdict.get("night_time","")}<br>
   {f"追加スタッフ: {s_extra or ''} 勤務時間:{cdict.get('extra_time','')}<br>" if s_extra else ""}
</p>
<hr/>

<!-- (枠2) -->
<p><strong>献立</strong><br>
   {f"昼食の献立: {l_menu}<br>" if s_day else ""}
   夕食の献立: {d_menu}<br>
   朝食の献立: {b_menu}
</p>
<hr/>

<!-- (枠3) 詳細支援報告 -->
<p><strong>詳細支援報告</strong><br>
   {(lunch_part + "<hr/>") if is_daytime else ""}
   <p><strong>日中活動:</strong> {daytimeActivity}</p>
   <p><strong>帰宅時間:</strong> {homeTime} / 様子: {homeLabel} {homeStateDetail}</p>
   <hr/>
   <p><strong>夕食バイタル:</strong> 体温:{dinnerTemp}℃ / SpO2:{dinnerSpo2}, 血圧:{dinnerBP1}/{dinnerBP2}, 脈:{dinnerPulse}</p>
   <p><strong>夕食:</strong> 残量:{dinnerMealScore}/10{' 残:'+dinnerMealLeft if dinnerMealLeft else ''}</p>
   {"<p><strong>夕食後服薬:</strong> <strong>服薬確認</strong></p>" if nightAfterMeds=="on" else ""}
</p>
<hr/>

<!-- (枠4) 就寝・巡視 -->
<p><strong>就寝・巡視</strong><br>
   {(f"就寝前服薬: <strong>服薬確認</strong><br>" if sleepMeds=='on' else "")}
   就寝時間: {sleepTime}<br>
   夜間巡視:<br>
   &emsp;{check23User}<br>
   &emsp;{check1User}<br>
   &emsp;{check3User}
</p>
<hr/>

<!-- (枠5) 起床、朝食 -->
<p><strong>起床、朝食</strong><br>
   起床時間: {wakeTime}<br>
   起床時の様子: {wakeLabel} {wakeDetail}<br>
   朝食バイタル: 体温:{breakfastTemp}℃ / SpO2:{breakfastSpo2}, 血圧:{breakfastBP1}/{breakfastBP2}, 脈:{breakfastPulse}<br>
   朝食: 残量:{breakfastMealScore}/10{' 残:'+breakfastMealLeft if breakfastMealLeft else ''}<br>
   {(f"朝食後服薬: <strong>服薬確認</strong><br>" if morningAfterMeds=='on' else "")}
</p>
<hr/>

<!-- (枠6) 利用者の支援詳細 -->
<p><strong>利用者の支援詳細</strong><br>
   利用者の様子: {userCondition}
</p>
"""

    # 介助項目
    assist_html = ""
    if foodAssistChecked=="on":
        assist_html += f"・食事介助: {foodAssistDetail}<br>"
    if bathAssistChecked=="on":
        assist_html += f"・入浴介助: {bathAssistDetail}<br>"
    if excretionAssistChecked=="on":
        assist_html += f"・排泄介助: {excretionAssistDetail}<br>"
    if changeAssistChecked=="on":
        assist_html += f"・着替えの介助: {changeAssistDetail}<br>"
    if lifeSupportChecked=="on":
        assist_html += f"・生活支援: {lifeSupportDetail}<br>"
    if mentalCareChecked=="on":
        assist_html += f"・メンタルケア: {mentalCareDetail}<br>"

    if assist_html:
        html_src += f"<p><strong>介助項目</strong><br>{assist_html}</p>"
    html_src += "<hr/>"

    # 個別支援
    html_src += f"""
<p><strong>個別支援</strong><br>
   長期目標に対する支援: {longTermGoalSupport}<br>
   {stc_html}
</p>
<hr/>

<!-- (枠7) 管理者確認 -->
<p><strong>管理者確認</strong><br>
   <span style="color:{mgr_color};">{mgr_text}</span>
</p>
</body>
</html>
    """

    # PDF生成(指定CSSの読み込み)
    base_dir = os.path.abspath(os.path.dirname(__file__))
    pdf_css_path = os.path.join(base_dir, "static", "styles.css")

    pdf = HTML(string=html_src, base_url=request.url_root).write_pdf(
        stylesheets=[CSS(pdf_css_path)]
    )
    resp = make_response(pdf)
    resp.headers["Content-Type"] = "application/pdf"
    resp.headers["Content-Disposition"] = f'inline; filename="ServiceRecord_{rec_id}.pdf"'
    return resp

########################################
# Block #12: 施設情報API (management.db)
########################################
@app.route("/facility_info", methods=["GET"])
def get_facility_info():
    conn = get_management_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, facility_type, capacity, facility_name, facility_number,
               address, phone, fax,
               manager_name, manager_phone, manager_contact,
               sabikan_name, sabikan_phone, sabikan_contact
        FROM facility_info
        ORDER BY id DESC LIMIT 1
    """)
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return jsonify({"id": None})
    return jsonify({
        "id": row[0],
        "facility_type": row[1],
        "capacity": row[2],
        "facility_name": row[3],
        "facility_number": row[4],
        "address": row[5],
        "phone": row[6],
        "fax": row[7],
        "manager_name": row[8],
        "manager_phone": row[9],
        "manager_contact": row[10],
        "sabikan_name": row[11],
        "sabikan_phone": row[12],
        "sabikan_contact": row[13]
    })

@app.route("/save_facility_info", methods=["POST"])
def save_facility_info():
    data = request.form
    facility_type   = data.get("facility_type","")
    capacity        = data.get("capacity","0")
    facility_name   = data.get("facility_name","")
    facility_num    = data.get("facility_number","")
    address         = data.get("address","")
    phone           = data.get("phone","")
    fax             = data.get("fax","")
    manager_name    = data.get("manager_name","")
    manager_phone   = data.get("manager_phone","")
    manager_contact = data.get("manager_contact","")
    sabikan_name    = data.get("sabikan_name","")
    sabikan_phone   = data.get("sabikan_phone","")
    sabikan_contact = data.get("sabikan_contact","")

    conn = get_management_db_connection()
    cur = conn.cursor()

    # 既存があれば UPDATE, なければ INSERT
    cur.execute("SELECT id FROM facility_info ORDER BY id DESC LIMIT 1")
    row = cur.fetchone()
    if row:
        f_id = row[0]
        cur.execute("""
            UPDATE facility_info
            SET facility_type=?, capacity=?, facility_name=?, facility_number=?,
                address=?, phone=?, fax=?,
                manager_name=?, manager_phone=?, manager_contact=?,
                sabikan_name=?, sabikan_phone=?, sabikan_contact=?
            WHERE id=?
        """, (
            facility_type, capacity, facility_name, facility_num,
            address, phone, fax,
            manager_name, manager_phone, manager_contact,
            sabikan_name, sabikan_phone, sabikan_contact, f_id
        ))
    else:
        cur.execute("""
            INSERT INTO facility_info(
                facility_type, capacity, facility_name, facility_number,
                address, phone, fax,
                manager_name, manager_phone, manager_contact,
                sabikan_name, sabikan_phone, sabikan_contact
            ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)
        """, (
            facility_type, capacity, facility_name, facility_num,
            address, phone, fax,
            manager_name, manager_phone, manager_contact,
            sabikan_name, sabikan_phone, sabikan_contact
        ))

    conn.commit()
    cur.close()
    conn.close()
    return "OK"

########################################
# Block #13: 利用者情報API (management.db)
########################################
import os
import sqlite3
import json
from flask import request, jsonify

def get_management_db_connection():
    """
    management.db への接続用ヘルパー関数
    """
    base_dir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(base_dir, 'management.db')
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON;")
    
    # ---- ここから追加: commute_json カラムがない場合は追加する ----
    cur = conn.cursor()
    cur.execute("PRAGMA table_info(users)")
    columns = [row[1] for row in cur.fetchall()]
    if 'commute_json' not in columns:
        cur.execute("ALTER TABLE users ADD COLUMN commute_json TEXT")
        conn.commit()
    cur.close()
    # ---- ここまで追加 ----
    
    return conn


@app.route("/api/users", methods=["GET"])
def api_get_users():
    """
    利用者一覧を返す (id, name, contract_end) JSON形式
    """
    conn = get_management_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, name, contract_end FROM users ORDER BY id ASC")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    user_list = []
    for row in rows:
        user_list.append({
            "id": row[0],
            "name": row[1] or "",
            "contract_end": row[2] or ""
        })
    return jsonify(user_list)


@app.route("/api/user/<int:user_id>", methods=["GET"])
def api_get_user(user_id):
    """
    ユーザ1件取得 (通所情報: commute_json も含む)
    """
    conn = get_management_db_connection()
    cur = conn.cursor()

    cur.execute("PRAGMA table_info(users)")
    colinfo = cur.fetchall()
    col_names = [c[1] for c in colinfo]  # テーブルの全カラム名

    query_cols = ",".join(col_names)
    sql = f"SELECT {query_cols} FROM users WHERE id=?"
    cur.execute(sql, (user_id,))
    row = cur.fetchone()
    if not row:
        cur.close()
        conn.close()
        return jsonify({"error": "not found"}), 404

    user_dict = {}
    for i, cname in enumerate(col_names):
        user_dict[cname] = row[i] if row[i] is not None else ""

    cur.close()
    conn.close()
    return jsonify(user_dict)


@app.route("/save_user_info", methods=["POST"])
def save_user_info():
    """
    利用者情報の新規登録 or 更新
    通所情報は commute{i}_enable, commute{i}_place, commute{i}_days などを受け取りJSONにまとめる
    """
    data = request.form.to_dict(flat=False)
    # user_id (str)
    user_id = data.get("user_id", [""])[0]

    # ========== 枠1 ==========
    name         = data.get("name", [""])[0]
    furigana     = data.get("furigana", [""])[0]
    gender       = data.get("gender", [""])[0]
    birthday     = data.get("birthday", [""])[0]
    age_str      = data.get("age", ["0"])[0]
    try:
        age = int(age_str)
    except:
        age = 0
    user_address = data.get("user_address", [""])[0]
    user_phone   = data.get("user_phone", [""])[0]
    user_email   = data.get("user_email", [""])[0]

    # ========== 枠2 (個別支援計画) ==========
    long_goal       = data.get("long_goal", [""])[0]
    short_goal1     = data.get("short_goal1",    [""])[0]
    short_support1  = data.get("short_support1", [""])[0]
    short_goal2     = data.get("short_goal2",    [""])[0]
    short_support2  = data.get("short_support2", [""])[0]
    short_goal3     = data.get("short_goal3",    [""])[0]
    short_support3  = data.get("short_support3", [""])[0]
    short_goal4     = data.get("short_goal4",    [""])[0]
    short_support4  = data.get("short_support4", [""])[0]
    short_goal5     = data.get("short_goal5",    [""])[0]
    short_support5  = data.get("short_support5", [""])[0]

    # ========== 枠3 (収入/連絡先) ==========
    income_type   = data.get("income_type", [""])[0]
    money_manager = data.get("money_manager", [""])[0]
    emergency1    = data.get("emergency1", [""])[0]
    emergency2    = data.get("emergency2", [""])[0]
    emergency3    = data.get("emergency3", [""])[0]

    # ========== 枠4 (施設契約) ==========
    facility_name    = data.get("facility_name", [""])[0]
    service_name     = data.get("service_name",  [""])[0]
    facility_number  = data.get("facility_number", [""])[0]
    contract_start   = data.get("contract_start", [""])[0]
    contract_end     = data.get("contract_end",   [""])[0]
    facility_address = data.get("facility_address", [""])[0]
    facility_phone   = data.get("facility_phone",   [""])[0]
    facility_fax     = data.get("facility_fax",     [""])[0]
    staff_roles      = data.get("staff_roles",      [""])[0]

    # ========== 枠5 (受給者情報) ==========
    recipient_number  = data.get("recipient_number", [""])[0]
    shien_kubun       = data.get("shien_kubun",       [""])[0]
    shien_kubun_start = data.get("shien_kubun_start", [""])[0]
    shien_kubun_end   = data.get("shien_kubun_end",   [""])[0]

    # ========== 枠6 (病院/訪問) ==========
    handicapped_handbook = data.get("handicapped_handbook", [""])[0]
    hospital1 = data.get("hospital1", [""])[0]
    medicine1 = data.get("medicine1", [""])[0]
    hospital2 = data.get("hospital2", [""])[0]
    medicine2 = data.get("medicine2", [""])[0]
    hospital3 = data.get("hospital3", [""])[0]
    medicine3 = data.get("medicine3", [""])[0]
    previous_illness          = data.get("previous_illness", [""])[0]
    visiting_nurse            = data.get("visiting_nurse",            [""])[0]
    visiting_nurse_schedule   = data.get("visiting_nurse_schedule",   [""])[0]
    visiting_dentist          = data.get("visiting_dentist",          [""])[0]
    visiting_dentist_schedule = data.get("visiting_dentist_schedule", [""])[0]
    special_care              = data.get("special_care",              [""])[0]

    # ========== 枠7 (相談支援員 + 通所枠) ==========
    counselor = data.get("counselor", [""])[0]

    # commute{i} -> JSON化
    commute_list = []
    for i in range(1, 6):
        enable_key = f"commute{i}_enable"
        if enable_key in data and data[enable_key][0] == "on":
            place   = data.get(f"commute{i}_place",   [""])[0]
            days_ls = data.get(f"commute{i}_days",    [])
            days_str = ",".join(days_ls)
            transit = data.get(f"commute{i}_transit", [""])[0]
            phone   = data.get(f"commute{i}_phone",   [""])[0]
            cobj = {
                "place": place,
                "days": days_str,
                "transit": transit,
                "phone": phone
            }
            commute_list.append(cobj)
        else:
            pass
    commute_json = json.dumps(commute_list, ensure_ascii=False)

    # ========== 枠8,9,10,11 ==========
    adl              = data.get("adl", [""])[0]
    iadl             = data.get("iadl", [""])[0]
    diet_restriction = data.get("diet_restriction", [""])[0]
    allergies        = data.get("allergies",        [""])[0]
    dislikes         = data.get("dislikes",         [""])[0]
    support_notice1  = data.get("support_notice1",  [""])[0]
    support_notice2  = data.get("support_notice2",  [""])[0]
    support_notice3  = data.get("support_notice3",  [""])[0]
    risk_management  = data.get("risk_management",  [""])[0]
    panic_trigger1   = data.get("panic_trigger1",   [""])[0]
    panic_trigger2   = data.get("panic_trigger2",   [""])[0]
    sense_overload   = data.get("sense_overload",   [""])[0]
    mobility         = data.get("mobility",         [""])[0]
    life_history     = data.get("life_history",     [""])[0]
    communication    = data.get("communication",    [""])[0]
    hobby_community  = data.get("hobby_community",  [""])[0]
    favorite         = data.get("favorite",         [""])[0]
    good_at          = data.get("good_at",          [""])[0]
    not_good_at      = data.get("not_good_at",      [""])[0]
    future_hope      = data.get("future_hope",      [""])[0]
    other_notes      = data.get("other_notes",      [""])[0]

    # DB接続
    conn = get_management_db_connection()
    cur = conn.cursor()

    # すでに user_id があれば UPDATE
    if user_id:
        cur.execute("SELECT id FROM users WHERE id=?", (user_id,))
        row = cur.fetchone()
        if row:
            # ---------- UPDATE ----------
            sql_update = """
                UPDATE users
                SET
                  name=?, furigana=?, gender=?, birthday=?, age=?,
                  user_address=?, user_phone=?, user_email=?,

                  long_goal=?,
                  short_goal1=?, short_support1=?,
                  short_goal2=?, short_support2=?,
                  short_goal3=?, short_support3=?,
                  short_goal4=?, short_support4=?,
                  short_goal5=?, short_support5=?,

                  income_type=?, money_manager=?,
                  emergency1=?, emergency2=?, emergency3=?,

                  facility_name=?, service_name=?, facility_number=?,
                  contract_start=?, contract_end=?,
                  facility_address=?, facility_phone=?, facility_fax=?,
                  staff_roles=?,

                  recipient_number=?, shien_kubun=?,
                  shien_kubun_start=?, shien_kubun_end=?,

                  handicapped_handbook=?,
                  hospital1=?, medicine1=?,
                  hospital2=?, medicine2=?,
                  hospital3=?, medicine3=?,
                  previous_illness=?,
                  visiting_nurse=?, visiting_nurse_schedule=?,
                  visiting_dentist=?, visiting_dentist_schedule=?,
                  special_care=?,

                  counselor=?,
                  commute_json=?,

                  adl=?, iadl=?,
                  diet_restriction=?, allergies=?, dislikes=?,

                  support_notice1=?, support_notice2=?, support_notice3=?,
                  risk_management=?, panic_trigger1=?, panic_trigger2=?, sense_overload=?,

                  mobility=?, life_history=?, communication=?, hobby_community=?,
                  favorite=?, good_at=?, not_good_at=?,
                  future_hope=?, other_notes=?
                WHERE id=?
            """
            cur.execute(sql_update, (
                name, furigana, gender, birthday, age,
                user_address, user_phone, user_email,

                long_goal,
                short_goal1, short_support1,
                short_goal2, short_support2,
                short_goal3, short_support3,
                short_goal4, short_support4,
                short_goal5, short_support5,

                income_type, money_manager,
                emergency1, emergency2, emergency3,

                facility_name, service_name, facility_number,
                contract_start, contract_end,
                facility_address, facility_phone, facility_fax,
                staff_roles,

                recipient_number, shien_kubun,
                shien_kubun_start, shien_kubun_end,

                handicapped_handbook,
                hospital1, medicine1,
                hospital2, medicine2,
                hospital3, medicine3,
                previous_illness,
                visiting_nurse, visiting_nurse_schedule,
                visiting_dentist, visiting_dentist_schedule,
                special_care,

                counselor,
                commute_json,

                adl, iadl,
                diet_restriction, allergies, dislikes,

                support_notice1, support_notice2, support_notice3,
                risk_management, panic_trigger1, panic_trigger2, sense_overload,

                mobility, life_history, communication, hobby_community,
                favorite, good_at, not_good_at,
                future_hope, other_notes,

                user_id
            ))
            conn.commit()
            cur.close()
            conn.close()
            return f"OK - user_id={user_id} を更新しました。"

    # ---------- INSERT ----------
    sql_insert = """
        INSERT INTO users(
          name, furigana, gender, birthday, age,
          user_address, user_phone, user_email,

          long_goal,
          short_goal1, short_support1,
          short_goal2, short_support2,
          short_goal3, short_support3,
          short_goal4, short_support4,
          short_goal5, short_support5,

          income_type, money_manager,
          emergency1, emergency2, emergency3,

          facility_name, service_name, facility_number,
          contract_start, contract_end,
          facility_address, facility_phone, facility_fax,
          staff_roles,

          recipient_number, shien_kubun,
          shien_kubun_start, shien_kubun_end,

          handicapped_handbook,
          hospital1, medicine1,
          hospital2, medicine2,
          hospital3, medicine3,
          previous_illness,
          visiting_nurse, visiting_nurse_schedule,
          visiting_dentist, visiting_dentist_schedule,
          special_care,

          counselor,
          commute_json,

          adl, iadl,
          diet_restriction, allergies, dislikes,

          support_notice1, support_notice2, support_notice3,
          risk_management, panic_trigger1, panic_trigger2, sense_overload,

          mobility, life_history, communication, hobby_community,
          favorite, good_at, not_good_at,
          future_hope, other_notes
        ) VALUES(
          ?,?,?,?,?,            -- 5
          ?,?,?,                -- 3 => 8
          ?,                    -- 1 => 9
          ?,?,                  -- 2 => 11
          ?,?,                  -- 2 => 13
          ?,?,                  -- 2 => 15
          ?,?,                  -- 2 => 17
          ?,?,                  -- 2 => 19

          ?,?,                  -- 2 => 21
          ?,?,?,                -- 3 => 24

          ?,?,?,                -- 3 => 27
          ?,?,                  -- 2 => 29
          ?,?,?,                -- 3 => 32
          ?,                    -- 1 => 33

          ?,?,?,?,              -- 4 => 37

          ?,                    -- 1 => 38
          ?,?,                  -- 2 => 40
          ?,?,                  -- 2 => 42
          ?,?,                  -- 2 => 44
          ?,                    -- 1 => 45
          ?,?,                  -- 2 => 47
          ?,?,                  -- 2 => 49
          ?,                    -- 1 => 50

          ?,                    -- 1 => 51
          ?,                    -- 1 => 52

          ?,?,                  -- 2 => 54
          ?,?,?,                -- 3 => 57

          ?,?,?,                -- 3 => 60
          ?,?,?,?,              -- 4 => 64

          ?,?,?,?,              -- 4 => 68
          ?,?,?,                -- 3 => 71
          ?,?                   -- 2 => 73
        )
    """
    cur.execute(sql_insert, (
        # -------- (枠1) -------------
        name, furigana, gender, birthday, age,
        user_address, user_phone, user_email,
        # -------- (枠2) -------------
        long_goal,
        short_goal1, short_support1,
        short_goal2, short_support2,
        short_goal3, short_support3,
        short_goal4, short_support4,
        short_goal5, short_support5,
        # -------- (枠3) -------------
        income_type, money_manager,
        emergency1, emergency2, emergency3,
        # -------- (枠4) -------------
        facility_name, service_name, facility_number,
        contract_start, contract_end,
        facility_address, facility_phone, facility_fax,
        staff_roles,
        # -------- (枠5) -------------
        recipient_number, shien_kubun,
        shien_kubun_start, shien_kubun_end,
        # -------- (枠6) -------------
        handicapped_handbook,
        hospital1, medicine1,
        hospital2, medicine2,
        hospital3, medicine3,
        previous_illness,
        visiting_nurse, visiting_nurse_schedule,
        visiting_dentist, visiting_dentist_schedule,
        special_care,
        # -------- (枠7) -------------
        counselor,
        commute_json,
        # -------- (枠8/9) -----------
        adl, iadl,
        diet_restriction, allergies, dislikes,
        # -------- (枠10) ------------
        support_notice1, support_notice2, support_notice3,
        risk_management, panic_trigger1, panic_trigger2, sense_overload,
        # -------- (枠11) ------------
        mobility, life_history, communication, hobby_community,
        favorite, good_at, not_good_at,
        future_hope, other_notes
    ))
    new_id = cur.lastrowid
    conn.commit()
    cur.close()
    conn.close()
    return f"OK - user_id={new_id} を新規登録しました。"


# =========================
# ▼▼▼ ここから追加 (Block #13: 拡張) ▼▼▼
# =========================

@app.route("/api/active_users", methods=["GET"])
def api_active_users():
    """
    アクティブな利用者の一覧を返す
    例: contract_end が未設定 or 今日以降 の場合を対象とする
    """
    today_str = datetime.now().strftime("%Y-%m-%d")

    conn = get_management_db_connection()
    cur = conn.cursor()
    # 全利用者を取得
    cur.execute("SELECT id, name, contract_end FROM users ORDER BY id ASC")
    rows = cur.fetchall()
    active_list = []
    for (uid, uname, cend) in rows:
        cend = cend or ""  # Noneの場合空文字
        if not cend:
            # 契約終了日が未設定 => アクティブ扱い
            active_list.append({"id": uid, "name": uname})
        else:
            # 形式がYYYY-MM-DDの場合、日付比較
            try:
                cend_dt = datetime.strptime(cend, "%Y-%m-%d")
                today_dt = datetime.strptime(today_str, "%Y-%m-%d")
                if cend_dt >= today_dt:
                    active_list.append({"id": uid, "name": uname})
            except:
                # 変換エラーの場合は除外
                pass

    cur.close()
    conn.close()
    return jsonify(active_list)


@app.route("/api/user_careplan", methods=["GET"])
def api_user_careplan():
    """
    指定された userId の 個別支援計画を返す (長期目標 + 短期目標&支援)
    例: ?userId=3
    戻り:
    {
      "longTermGoal": "...",
      "shortTermGoals": [
         {
           "index": 1, 
           "goalLabel": "短期目標①の内容",
           "goal": "...",
           "supportLabel": "具体的支援①の内容",
           "support": "...",
           "comment": ""
         },
         ...
      ]
    }
    """
    user_id = request.args.get("userId", type=int)
    if not user_id:
        return jsonify({"error": "no userId"}), 400

    conn = get_management_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT long_goal,
               short_goal1, short_support1,
               short_goal2, short_support2,
               short_goal3, short_support3,
               short_goal4, short_support4,
               short_goal5, short_support5
        FROM users
        WHERE id=?
    """, (user_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return jsonify({"error": "User not found"}), 404

    (long_goal,
     sgoal1, ssupport1,
     sgoal2, ssupport2,
     sgoal3, ssupport3,
     sgoal4, ssupport4,
     sgoal5, ssupport5) = row

    # 短期目標(1~5)をループ化
    goals = [(sgoal1, ssupport1),
             (sgoal2, ssupport2),
             (sgoal3, ssupport3),
             (sgoal4, ssupport4),
             (sgoal5, ssupport5)]
    
    shortTermGoals = []
    for i, (g, s) in enumerate(goals, start=1):
        if g or s:
            shortTermGoals.append({
                "index": i,
                "goalLabel": f"短期目標{i}の内容",
                "goal": g or "",
                "supportLabel": f"具体的支援{i}の内容",
                "support": s or "",
                "comment": ""
            })

    result = {
        "longTermGoal": long_goal or "",
        "shortTermGoals": shortTermGoals
    }
    return jsonify(result)

########################################
# Block #14: メイン起動
########################################
if __name__ == "__main__":
    init_dbs()
    app.run(debug=True)
