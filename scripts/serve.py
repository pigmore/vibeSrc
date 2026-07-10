#!/usr/bin/env python3
"""Serve the vibeSrc static site with Python's standard library.

Usage:
  python3 scripts/serve.py
  python3 scripts/serve.py --host 0.0.0.0 --port 8080
"""

from __future__ import annotations

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class VibeSrcHandler(SimpleHTTPRequestHandler):
    """Static-file handler with small development-friendly headers."""

    def end_headers(self) -> None:
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        super().end_headers()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Serve the vibeSrc static HTML demos.")
    parser.add_argument("--host", default="127.0.0.1", help="Host/interface to bind. Use 0.0.0.0 for LAN access.")
    parser.add_argument("--port", type=int, default=8080, help="Port to listen on.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    root = Path(__file__).resolve().parents[1]
    handler = partial(VibeSrcHandler, directory=str(root))
    server = ThreadingHTTPServer((args.host, args.port), handler)
    local_url = f"http://127.0.0.1:{args.port}/"
    bound_url = f"http://{args.host}:{args.port}/"
    print(f"Serving vibeSrc from {root}", flush=True)
    print(f"Local: {local_url}", flush=True)
    if args.host not in {"127.0.0.1", "localhost"}:
        print(f"Bound: {bound_url}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...", flush=True)
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
