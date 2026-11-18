#!/usr/bin/env python3
"""Build a minimal, local-only deployment snapshot for the portfolio."""

from __future__ import annotations

import os
import shutil
import sys
import tempfile
from pathlib import Path
from typing import NoReturn


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / ".publish"
REQUIRED_FILES = ("index.html", "styles.css", "script.js")
ASSET_DIR = ROOT / "assets"


def fail(message: str) -> NoReturn:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def validate_sources() -> list[Path]:
    sources = [ROOT / name for name in REQUIRED_FILES]
    for path in sources:
        if not path.is_file() or path.is_symlink():
            fail(f"required public source is missing or not a regular file: {path.name}")
    if not ASSET_DIR.is_dir() or ASSET_DIR.is_symlink():
        fail("required public asset directory is missing or not a regular directory")

    asset_files = sorted(ASSET_DIR.rglob("*"))
    for path in asset_files:
        if path.is_symlink():
            fail("asset tree contains a symlink; remove it before packaging")
        if path.is_file():
            continue
        if not path.is_dir():
            fail("asset tree contains a non-regular filesystem entry")
    if not any(path.is_file() for path in asset_files):
        fail("asset directory is empty")
    return sources


def safe_remove_generated_output(path: Path) -> None:
    if path.is_symlink():
        fail("publish output is a symlink; refusing to replace it")
    if not path.exists():
        return
    resolved = path.resolve()
    if resolved.parent != ROOT:
        fail("publish output resolves outside the project directory")
    if not path.is_dir():
        fail("publish output exists and is not a directory")
    shutil.rmtree(path)


def build_snapshot() -> tuple[int, int]:
    sources = validate_sources()
    with tempfile.TemporaryDirectory(prefix=".publish-stage-", dir=ROOT) as stage_name:
        stage = Path(stage_name)
        for source in sources:
            shutil.copy2(source, stage / source.name)
        shutil.copytree(ASSET_DIR, stage / "assets", copy_function=shutil.copy2)
        (stage / ".nojekyll").write_text("", encoding="utf-8")

        files = [path for path in stage.rglob("*") if path.is_file()]
        top_level = {path.name for path in stage.iterdir()}
        required_top_level = {"index.html", "styles.css", "script.js", "assets", ".nojekyll"}
        if top_level != required_top_level:
            fail("generated package does not match the approved file allowlist")

        file_count = len(files)
        total_bytes = sum(path.stat().st_size for path in files)
        safe_remove_generated_output(OUTPUT)
        os.replace(stage, OUTPUT)
    return file_count, total_bytes


def main() -> None:
    file_count, total_bytes = build_snapshot()
    print(f"Packaged {file_count} files ({total_bytes:,} bytes) into .publish/")
    print("Included: index.html, styles.css, script.js, assets/, .nojekyll")


if __name__ == "__main__":
    main()
