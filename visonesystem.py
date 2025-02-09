import os
import json
import sqlite3
from flask import Flask, render_template, request, redirect, url_for, send_from_directory
from datetime import datetime

def get_db_connection():
    base_dir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(base_dir, 'training.db')
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def load_master_json_into_db(conn):
    """
    training_details.json を読み込み、training_masterに差分アップサート。
    statusは既存を上書きしない (ON CONFLICTで training_master.status を保持)
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

        # 初回は status='未完了' としてINSERT
        # ON CONFLICT時は既存のstatusを維持
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
            VALUES (
                :title,
                :t_type,
                :freq,
                :ded_risk,
                :parts,
                :sections,
                :mtemp,
                :dtemp,
                :mguide,
                '',
                '未完了'
            )
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

def init_dbs():
    conn = get_db_connection()
    cur = conn.cursor()

    # events テーブル
    cur.execute("""
        CREATE TABLE IF NOT EXISTS events (
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

    # training_master テーブル
    cur.execute("""
        CREATE TABLE IF NOT EXISTS training_master (
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
            -- status 追加予定
        );
    """)

    # status カラムが無ければ追加
    cur.execute("PRAGMA table_info(training_master)")
    existing_cols = [row[1] for row in cur.fetchall()]
    if "status" not in existing_cols:
        cur.execute("ALTER TABLE training_master ADD COLUMN status TEXT DEFAULT '未完了';")

    conn.commit()
    cur.close()
    conn.close()

app = Flask(__name__)

@app.route("/")
def index():
    """
    トップページ: events一覧, training_master一覧を読み込んで渡す
    """
    conn = get_db_connection()
    load_master_json_into_db(conn)
    cur = conn.cursor()

    # events
    cur.execute("SELECT id, title, date, status, content, event_type, detail, completed_at FROM events")
    rows = cur.fetchall()
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
    cur.execute("""
        SELECT title, type, frequency, deduction_risk, participants, sections,
               manual_template, doc_template, manual_guide, planned_date, status
        FROM training_master
    """)
    rows_master = cur.fetchall()

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

        participants_list = parts_str.split(",") if parts_str else []
        try:
            sections_dict = json.loads(sections_json) if sections_json else {}
        except:
            sections_dict = {}

        # manual_guide
        try:
            mguide_data = json.loads(mguide_str)
        except:
            mguide_data = mguide_str

        training_details[title] = {
            "type": t_type,
            "frequency": freq,
            "deductionRisk": ded_risk,
            "participants": participants_list,
            "sections": sections_dict,
            "ManualTemplate": mtemp,
            "DocTemplate": dtemp,
            "manualGuide": mguide_data,
            "plannedDate": planned,
            "status": t_status
        }

    cur.close()
    conn.close()

    return render_template("index.html",
                           events=event_list,
                           training_details=training_details)

@app.route("/complete_event", methods=["POST"])
def complete_event():
    """
    イベントを完了状態にし、もし training イベントなら training_master も status='完了' に更新
    """
    event_id = request.form.get("id", type=int)
    if not event_id:
        return "error - no id", 400

    conn = get_db_connection()
    cur = conn.cursor()

    # 対象イベントを取得
    cur.execute("SELECT id, title, date, status, content, event_type, detail, completed_at FROM events WHERE id=?", (event_id,))
    row = cur.fetchone()
    if not row:
        cur.close()
        conn.close()
        return "error - no event", 404

    # events テーブルを更新
    completed_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cur.execute("UPDATE events SET status='完了', completed_at=? WHERE id=?", (completed_time, event_id))

    # training イベントの場合 → training_master.status も完了
    event_type = row[5]
    event_title = row[1]
    if event_type == "training":
        cur.execute("UPDATE training_master SET status='完了' WHERE title=?", (event_title,))

    conn.commit()
    cur.close()
    conn.close()
    return "success"

@app.route("/update_event", methods=["POST"])
def update_event():
    """
    イベントの日付更新
    """
    event_id = request.form.get("id", type=int)
    new_date = request.form.get("new_date")
    if not event_id or not new_date:
        return "error - invalid params", 400
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("UPDATE events SET date=?, status='予定' WHERE id=?", (new_date, event_id))
    conn.commit()
    cur.close()
    conn.close()
    return "success"

@app.route("/delete_event", methods=["POST"])
def delete_event():
    event_id = request.form.get("id", type=int)
    if not event_id:
        return "error - no id", 400
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM events WHERE id=?", (event_id,))
    conn.commit()
    cur.close()
    conn.close()
    return "success"

@app.route("/update_planned_date", methods=["POST"])
def update_planned_date():
    """
    training_master の planned_date を更新し、events へも反映 (event_type='training')
    """
    item_title = request.form.get("title")
    planned_date = request.form.get("planned_date", "")
    conn = get_db_connection()
    cur = conn.cursor()

    # 1) training_master更新
    cur.execute("UPDATE training_master SET planned_date=? WHERE title=?", (planned_date, item_title))

    # 2) events(upsert)
    if planned_date:
        # 既存のtrainingイベントがあるか
        cur.execute("SELECT id FROM events WHERE title=? AND event_type='training'", (item_title,))
        row = cur.fetchone()
        if row:
            cur.execute("UPDATE events SET date=?, status='予定' WHERE id=?", (planned_date, row[0]))
        else:
            cur.execute("""
                INSERT INTO events(title, date, status, content, event_type, detail)
                VALUES(?,?,?,?,?,?)
            """, (item_title, planned_date, '予定', 'Training/研修', 'training', ''))

    conn.commit()
    cur.close()
    conn.close()
    return planned_date

@app.route("/upload_record", methods=["POST"])
def upload_record():
    file = request.files.get("record-file")
    if file:
        upload_dir = os.path.join(os.path.abspath(os.path.dirname(__file__)), "uploads")
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, file.filename)
        file.save(file_path)
    return redirect(url_for("index"))

@app.route("/download_sample/<filename>")
def download_sample(filename):
    base_dir = os.path.abspath(os.path.dirname(__file__))
    sample_dir = os.path.join(base_dir, "static", "sample")
    return send_from_directory(sample_dir, filename, as_attachment=True)

if __name__ == "__main__":
    init_dbs()
    app.run(debug=True)
