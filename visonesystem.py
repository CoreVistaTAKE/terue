import os
import json
import sqlite3
from flask import Flask, render_template, request, redirect, url_for
from datetime import datetime

def get_db_connection():
    """
    ローカルでも Heroku でも常に SQLite を使う。
    ファイルは本番・開発どちらも 'training.db' を参照。
    """
    base_dir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(base_dir, 'training.db')  # プロジェクト直下を参照
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def load_master_json_into_db(conn):
    """
    training_details.jsonを読み込み、training_masterテーブルへINSERT。
    (titleがUNIQUEなので INSERT OR IGNORE で既にあればスキップ)
    """
    json_path = os.path.join(os.path.dirname(__file__), "training_details.json")
    if not os.path.exists(json_path):
        print("WARNING: training_details.json が見つかりません。スキップします。")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)  # { "タイトル": {...}, ... }

    cur = conn.cursor()

    for title, info in data.items():
        t_type = info.get("type", "")
        freq = info.get("frequency", "")
        ded_risk = info.get("deductionRisk", False)
        participants = info.get("participants", [])
        participants_str = ",".join(participants)

        # sections は JSON 形式で保存
        sections_dict = info.get("sections", {})
        sections_json = json.dumps(sections_dict, ensure_ascii=False)

        cur.execute("""
            INSERT OR IGNORE INTO training_master
                (title, type, frequency, deduction_risk, participants, sections)
            VALUES
                (?, ?, ?, ?, ?, ?)
        """, (title, t_type, freq, ded_risk, participants_str, sections_json))

    conn.commit()
    cur.close()

def init_dbs():
    """
    テーブルが存在しなければ作成。
    その後、 training_details.json からマスタ情報を training_master に格納する。
    """
    conn = get_db_connection()
    cur = conn.cursor()

    # --- facility_info, employee, user のテーブル作成 (SQLite 用) ---
    cur.execute("""
        CREATE TABLE IF NOT EXISTS facility_info(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            address TEXT,
            phone TEXT
        );
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS employee(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            position TEXT,
            qualification TEXT
        );
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS "user"(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            contact TEXT,
            employee_id INTEGER,
            FOREIGN KEY(employee_id) REFERENCES employee(id)
        );
    """)

    # --- events, training_master テーブル作成 (SQLite 用) ---
    cur.execute("""
        CREATE TABLE IF NOT EXISTS events(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL,
            content TEXT,
            event_type TEXT,
            detail TEXT
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS training_master(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT UNIQUE NOT NULL,
            type TEXT,
            frequency TEXT,
            deduction_risk BOOLEAN,
            participants TEXT,
            sections TEXT
        );
    """)

    conn.commit()  # テーブル作成のコミット

    # JSONファイルを読み込み training_master にINSERT
    load_master_json_into_db(conn)

    cur.close()
    conn.close()

app = Flask(__name__)

@app.route("/")
def index():
    """トップページ：左メニュー＋カレンダー＋詳細表示"""
    conn = get_db_connection()
    cur = conn.cursor()
    # idを含めたイベント情報を取得
    cur.execute("SELECT id, title, date, status, content, event_type, detail FROM events")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    event_list = []
    for row in rows:
        event_list.append({
            "event_id": row[0],
            "title": row[1],
            "dueDate": row[2],
            "status": row[3],
            "content": row[4],
            "type": row[5],
            "detail": row[6]
        })
    return render_template("index.html", events=event_list)

@app.route("/schedule")
def schedule():
    """スケジュール登録ページ (研修・訓練・委員会 etc)"""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT title, type, frequency, deduction_risk, participants, sections FROM training_master")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    training_details = {}
    for row in rows:
        title = row[0]
        t_type = row[1]
        freq = row[2]
        ded_risk = row[3]
        participants = row[4].split(",") if row[4] else []
        sections_dict = json.loads(row[5]) if row[5] else {}

        training_details[title] = {
            "type": t_type,
            "frequency": freq,
            "deductionRisk": ded_risk,
            "participants": participants,
            "sections": sections_dict
        }

    return render_template("schedule.html", training_details=training_details)

@app.route("/schedule/save", methods=["POST"])
def save_schedule():
    """スケジュール登録処理"""
    date = request.form.get("date")       # "2025-01-31"など
    title = request.form.get("title")       # JSONマスタのtitle
    content = request.form.get("content")   # ユーザー自由入力
    status = "未完了"

    # hiddenで受け取る
    event_type = request.form.get("event_type")
    detail = request.form.get("detail")

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO events (title, date, status, content, event_type, detail)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (title, date, status, content, event_type, detail))
    conn.commit()
    cur.close()
    conn.close()

    return redirect(url_for("index"))

@app.route("/etc")
def etc():
    return "<h1>その他ページ(仮)</h1>"

@app.route("/manage")
def manage():
    return "<h1>管理ページ(仮)</h1>"

### 以下、新規追加 (B) ###
@app.route("/complete_event", methods=["POST"])
def complete_event():
    """
    イベントを「完了」状態にする。
    フロント側からPOSTで 'id' を受け取る。
    """
    event_id = request.form.get("id", type=int)
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("UPDATE events SET status = '完了' WHERE id = ?", (event_id,))
    conn.commit()
    cur.close()
    conn.close()
    return "success"

@app.route("/update_event", methods=["POST"])
def update_event():
    """
    イベントの日付を変更する。
    フロント側からPOSTで 'id' と 'new_date' を受け取る。
    """
    event_id = request.form.get("id", type=int)
    new_date = request.form.get("new_date")

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("UPDATE events SET date = ? WHERE id = ?", (new_date, event_id))
    conn.commit()
    cur.close()
    conn.close()
    return "success"

@app.route("/delete_event", methods=["POST"])
def delete_event():
    """
    イベントを削除する。
    フロント側からPOSTで 'id' を受け取る。
    """
    event_id = request.form.get("id", type=int)
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM events WHERE id = ?", (event_id,))
    conn.commit()
    cur.close()
    conn.close()
    return "success"
### ここまで (B) ###

if __name__ == "__main__":
    init_dbs()
    app.run(debug=True)
