"""
fill_excel.py  --  financial_data.json を読み込み、財務分析Excelを生成する。

使い方:
  python fill_excel.py <company_dir_name>
  例: python fill_excel.py toyota

入力: outputs/<company>/financial_data.json
テンプレ: templates/financial_sheet_template.xlsx
出力: outputs/<company>/<企業名>_財務分析.xlsx
"""

import sys
import json
import shutil
import os
from pathlib import Path

try:
    import openpyxl
    from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
    from openpyxl.utils import get_column_letter
except ImportError:
    print("ERROR: openpyxl が必要です。pip install openpyxl で導入してください。")
    sys.exit(1)

# ─────────────────────────────────────────────
# パス設定
# ─────────────────────────────────────────────
BASE_DIR = Path(__file__).parent.parent  # company-analyzer/
TEMPLATE = BASE_DIR / "templates" / "financial_sheet_template.xlsx"


def load_data(company: str) -> dict:
    json_path = BASE_DIR / "outputs" / company / "financial_data.json"
    if not json_path.exists():
        raise FileNotFoundError(f"financial_data.json が見つかりません: {json_path}")
    with open(json_path, encoding="utf-8") as f:
        return json.load(f)


def fmt(v, digits=1):
    """数値をフォーマット。Noneは '-' に変換。"""
    if v is None:
        return "-"
    if isinstance(v, float):
        return round(v, digits)
    return v


# ─────────────────────────────────────────────
# スタイル定数
# ─────────────────────────────────────────────
HEADER_FILL = PatternFill("solid", fgColor="1F4E79")
HEADER_FONT = Font(bold=True, color="FFFFFF", size=10)
LABEL_FILL  = PatternFill("solid", fgColor="D6E4F7")
LABEL_FONT  = Font(bold=True, size=9)
DATA_FONT   = Font(size=9)
CENTER      = Alignment(horizontal="center", vertical="center")
THIN_SIDE   = Side(style="thin", color="BFBFBF")
THIN_BORDER = Border(left=THIN_SIDE, right=THIN_SIDE, top=THIN_SIDE, bottom=THIN_SIDE)


def style_header(cell, text):
    cell.value = text
    cell.font = HEADER_FONT
    cell.fill = HEADER_FILL
    cell.alignment = CENTER
    cell.border = THIN_BORDER


def style_label(cell, text):
    cell.value = text
    cell.font = LABEL_FONT
    cell.fill = LABEL_FILL
    cell.alignment = Alignment(horizontal="left", vertical="center")
    cell.border = THIN_BORDER


def style_data(cell, value):
    cell.value = fmt(value)
    cell.font = DATA_FONT
    cell.alignment = CENTER
    cell.border = THIN_BORDER


def write_time_series_sheet(ws, title: str, years: list, rows: list):
    """
    汎用タイムシリーズシート書き込み。
    rows: [{"label": "指標名", "unit": "(%)", "values": [v1, v2, ...]}, ...]
    """
    ws.title = title
    ws.column_dimensions["A"].width = 28
    for i, yr in enumerate(years):
        col = get_column_letter(i + 2)
        ws.column_dimensions[col].width = 10
        style_header(ws.cell(1, i + 2), yr)
    style_header(ws.cell(1, 1), "指標")
    for r_idx, row in enumerate(rows, start=2):
        label = row["label"] + (f' {row.get("unit", "")}' if row.get("unit") else "")
        style_label(ws.cell(r_idx, 1), label)
        for c_idx, v in enumerate(row.get("values", [None] * len(years)), start=2):
            style_data(ws.cell(r_idx, c_idx), v)
    ws.freeze_panes = "B2"


# ─────────────────────────────────────────────
# シート別書き込み関数
# ─────────────────────────────────────────────

def write_metrics_sheet(ws, data: dict):
    years = data.get("fiscal_years", [])
    m = data.get("metrics", {})

    rows = [
        {"label": "総資産利益率（ROA）",                  "unit": "(%)",  "values": m.get("roa")},
        {"label": "自己資本利益率（ROE）",                 "unit": "(%)",  "values": m.get("roe")},
        {"label": "売上高営業利益率",                      "unit": "(%)",  "values": m.get("operating_margin")},
        {"label": "自己資本比率",                         "unit": "(%)",  "values": m.get("equity_ratio")},
        {"label": "総資産回転率",                         "unit": "(回)", "values": m.get("asset_turnover")},
        {"label": "インタレスト・カバレッジ・レシオ（ICR）", "unit": "(倍)", "values": m.get("icr")},
        {"label": "株価",                                "unit": "(円)", "values": m.get("stock_price")},
        {"label": "純資産成長率",                         "unit": "(%)",  "values": m.get("bv_growth")},
        {"label": "株価純資産倍率（PBR）",                 "unit": "(倍)", "values": m.get("pbr")},
        {"label": "減損損失",                             "unit": "(億円)","values": m.get("impairment")},
        {"label": "債券格付",                             "unit": "",     "values": m.get("bond_rating")},
        {"label": "研究開発費比率（R&D/売上高）",           "unit": "(%)",  "values": m.get("rd_ratio")},
        {"label": "ROE三分解：売上高純利益率",              "unit": "(%)",  "values": m.get("dupont_margin")},
        {"label": "ROE三分解：財務レバレッジ",              "unit": "(倍)", "values": m.get("dupont_leverage")},
        {"label": "投下資本利益率（ROIC）",                "unit": "(%)",  "values": m.get("roic")},
    ]
    # nullリストを補完
    for row in rows:
        if row["values"] is None:
            row["values"] = [None] * len(years)

    write_time_series_sheet(ws, "財務指標", years, rows)
    ws["A1"].value = "財務指標"

    # WACC注記
    wacc = data.get("metrics", {}).get("wacc")
    if wacc is not None:
        last_row = len(rows) + 3
        ws.cell(last_row, 1).value = f"※ WACC仮置き: {wacc}%"
        ws.cell(last_row, 1).font = Font(italic=True, size=8, color="666666")


def write_pl_sheet(ws, data: dict):
    years = data.get("fiscal_years", [])
    pl = data.get("pl", {})
    rows = [
        {"label": "売上高",      "unit": "(億円)", "values": pl.get("revenue")},
        {"label": "営業利益",    "unit": "(億円)", "values": pl.get("operating_profit")},
        {"label": "当期純利益",  "unit": "(億円)", "values": pl.get("net_income")},
        {"label": "支払利息",    "unit": "(億円)", "values": pl.get("interest_expense")},
    ]
    for row in rows:
        if row["values"] is None:
            row["values"] = [None] * len(years)
    write_time_series_sheet(ws, "損益計算書", years, rows)


def write_bs_sheet(ws, data: dict):
    years = data.get("fiscal_years", [])
    bs = data.get("bs", {})
    rows = [
        {"label": "資産合計",         "unit": "(億円)", "values": bs.get("total_assets")},
        {"label": "純資産合計（株主資本）","unit": "(億円)", "values": bs.get("equity")},
        {"label": "純有利子負債",      "unit": "(億円)", "values": bs.get("net_debt")},
    ]
    for row in rows:
        if row["values"] is None:
            row["values"] = [None] * len(years)
    write_time_series_sheet(ws, "貸借対照表", years, rows)


def write_cf_sheet(ws, data: dict):
    years = data.get("fiscal_years", [])
    cf = data.get("cf", {})
    rows = [
        {"label": "営業活動によるキャッシュ・フロー", "unit": "(億円)", "values": cf.get("operating_cf")},
        {"label": "投資活動によるキャッシュ・フロー", "unit": "(億円)", "values": cf.get("investing_cf")},
        {"label": "財務活動によるキャッシュ・フロー", "unit": "(億円)", "values": cf.get("financing_cf")},
        {"label": "フリー・キャッシュ・フロー",       "unit": "(億円)", "values": cf.get("fcf")},
    ]
    for row in rows:
        if row["values"] is None:
            row["values"] = [None] * len(years)
    write_time_series_sheet(ws, "CF計算書", years, rows)


def write_segments_sheet(ws, data: dict):
    years = data.get("fiscal_years", [])
    segments = data.get("segments", [])
    ws.title = "セグメント"
    ws.column_dimensions["A"].width = 28
    ws.column_dimensions["B"].width = 14
    for i, yr in enumerate(years):
        col = get_column_letter(i + 3)
        ws.column_dimensions[col].width = 10
        style_header(ws.cell(1, i + 3), yr)
    style_header(ws.cell(1, 1), "セグメント")
    style_header(ws.cell(1, 2), "種別")

    row_idx = 2
    for seg in segments:
        name = seg.get("name", "不明")
        for kind, key in [("売上(億)", "revenue"), ("利益(億)", "profit")]:
            style_label(ws.cell(row_idx, 1), name)
            style_label(ws.cell(row_idx, 2), kind)
            vals = seg.get(key) or [None] * len(years)
            for c_idx, v in enumerate(vals, start=3):
                style_data(ws.cell(row_idx, c_idx), v)
            row_idx += 1
    ws.freeze_panes = "C2"


def write_peers_sheet(ws, data: dict):
    peers = data.get("peers", [])
    ws.title = "同業比較"
    headers = ["企業名", "自己資本利益率ROE(%)", "投下資本利益率ROIC(%)", "株価純資産倍率PBR(倍)", "EV/EBITDA(倍)", "売上高営業利益率(%)"]
    keys    = ["name",   "roe",    "roic",    "pbr",    "ev_ebitda",      "operating_margin"]
    for c, h in enumerate(headers, 1):
        ws.column_dimensions[get_column_letter(c)].width = 16
        style_header(ws.cell(1, c), h)
    for r, peer in enumerate(peers, 2):
        for c, key in enumerate(keys, 1):
            v = peer.get(key)
            if c == 1:
                style_label(ws.cell(r, c), v or "-")
            else:
                style_data(ws.cell(r, c), v)


# ─────────────────────────────────────────────
# メイン
# ─────────────────────────────────────────────

def main():
    if len(sys.argv) < 2:
        print("使い方: python fill_excel.py <company>")
        sys.exit(1)

    company = sys.argv[1]
    data = load_data(company)
    company_jp = data.get("company", company)

    # テンプレをコピー
    out_dir = BASE_DIR / "outputs" / company
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{company_jp}_財務分析.xlsx"

    if TEMPLATE.exists():
        shutil.copy(TEMPLATE, out_path)
        wb = openpyxl.load_workbook(out_path)
        # テンプレのシート1を「財務指標」として使う（残りの空シートを削除）
        ws_metrics = wb.active
        ws_metrics.delete_rows(1, ws_metrics.max_row)
        for sheet_name in [s for s in wb.sheetnames if s != ws_metrics.title]:
            del wb[sheet_name]
    else:
        wb = openpyxl.Workbook()
        ws_metrics = wb.active

    write_metrics_sheet(ws_metrics, data)

    # 追加シート
    write_pl_sheet(wb.create_sheet(), data)
    write_bs_sheet(wb.create_sheet(), data)
    write_cf_sheet(wb.create_sheet(), data)
    write_segments_sheet(wb.create_sheet(), data)
    write_peers_sheet(wb.create_sheet(), data)

    wb.save(out_path)
    print(f"[OK] Excel: {out_path}")


if __name__ == "__main__":
    main()
