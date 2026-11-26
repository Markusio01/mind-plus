#!/usr/bin/env python3
"""Local preview server for MIND+ with caching switched off, so edits show on reload.

Run:  python3 tools/serve.py [port]     then open http://localhost:8791
"""
import functools
import http.server
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8791


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):      # keep the console quiet
        pass


if __name__ == "__main__":
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", PORT), functools.partial(Handler, directory=ROOT))
    print(f"MIND+ preview on http://localhost:{PORT}")
    srv.serve_forever()
