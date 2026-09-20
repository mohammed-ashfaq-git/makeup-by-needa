#!/usr/bin/env bash
#
# Local development MySQL server for the Makeup by Needa CMS.
#
# Boots a private MySQL 5.7 instance without apt, system packages or root:
#   - MySQL binaries are fetched from the npm package `mysql-server-5.7-lin-x64`
#   - the one missing library (libaio) is compiled from source
# Everything lives in ~/.cache/mysql-dev and nothing is installed system-wide.
#
# In production, simply point DATABASE_URL at your real MySQL server — this
# script is never used there.
#
# Usage:  bash scripts/dev-db.sh
# Then:   npm run db:setup        (apply migrations + seed)
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEV_DIR="${MYSQL_DEV_DIR:-$HOME/.cache/mysql-dev}"
SERVER_DIR="$DEV_DIR/server"
LIBAIO_DIR="$DEV_DIR/libaio"
DATA_DIR="$DEV_DIR/data"
RUN_DIR="$DEV_DIR/run"
TMP_DIR="$DEV_DIR/tmp"
PORT="${MYSQL_DEV_PORT:-3306}"
APP_DB="${MYSQL_DEV_DB:-makeup_by_needa}"
APP_USER="${MYSQL_DEV_USER:-mbn_app}"
APP_PASSWORD="${MYSQL_DEV_PASSWORD:-dev-mbn-3f9a2c}"
SOCKET="$RUN_DIR/mysqld.sock"

mkdir -p "$DEV_DIR" "$RUN_DIR" "$TMP_DIR"

command -v curl >/dev/null 2>&1 || { echo "curl is required"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "node is required"; exit 1; }

# ---------------------------------------------------------------- binaries
if [ ! -x "$SERVER_DIR/mysqld" ]; then
  echo "→ Downloading MySQL 5.7 server binaries (from npm)…"
  curl -fsSL --retry 3 -o "$DEV_DIR/mysql.tgz" \
    "https://registry.npmjs.org/mysql-server-5.7-lin-x64/-/mysql-server-5.7-lin-x64-1.0.0.tgz"
  mkdir -p "$SERVER_DIR"
  tar -xzf "$DEV_DIR/mysql.tgz" -C "$SERVER_DIR" --strip-components=2 package/server
  rm -f "$DEV_DIR/mysql.tgz"
fi

if [ ! -e "$LIBAIO_DIR/libaio-master/src/libaio.so.1" ]; then
  echo "→ Building libaio from source (needed by mysqld)…"
  mkdir -p "$LIBAIO_DIR"
  curl -fsSL --retry 3 -o "$LIBAIO_DIR/src.tgz" \
    "https://codeload.github.com/crossbuild/libaio/tar.gz/refs/heads/master"
  tar -xzf "$LIBAIO_DIR/src.tgz" -C "$LIBAIO_DIR"
  ( cd "$LIBAIO_DIR/libaio-master" && make -s )
  ln -sf libaio.so.1.0.1 "$LIBAIO_DIR/libaio-master/src/libaio.so.1"
  rm -f "$LIBAIO_DIR/src.tgz"
fi

export LD_LIBRARY_PATH="$LIBAIO_DIR/libaio-master/src${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"

# ---------------------------------------------------------------- config
if [ ! -f "$DEV_DIR/my.cnf" ]; then
  cat > "$DEV_DIR/my.cnf" <<EOF
[mysqld]
secure_file_priv = ""
bind-address = 127.0.0.1
port = $PORT
socket = $SOCKET
pid-file = $RUN_DIR/mysqld.pid
datadir = $DATA_DIR
tmpdir = $TMP_DIR
basedir = $SERVER_DIR
character-set-server = utf8mb4
collation-server = utf8mb4_general_ci
skip-name-resolve
max_allowed_packet = 32M
innodb_buffer_pool_size = 96M
innodb_log_file_size = 32M
log_error = $RUN_DIR/mysqld.err
explicit_defaults_for_timestamp
EOF
fi

# ---------------------------------------------------------------- already running?
if [ -S "$SOCKET" ] && node -e "
const net = require('net');
const s = net.connect('$SOCKET');
s.on('connect', () => { s.end(); process.exit(0); });
s.on('error', () => process.exit(1));
setTimeout(() => process.exit(1), 2000);
" >/dev/null 2>&1; then
  echo "✓ MySQL is already running on 127.0.0.1:$PORT"
  exit 0
fi

# ---------------------------------------------------------------- initialise
if [ ! -d "$DATA_DIR/mysql" ]; then
  echo "→ Initialising MySQL data directory (first run)…"
  "$SERVER_DIR/mysqld" \
    --defaults-file="$DEV_DIR/my.cnf" \
    --initialize-insecure \
    --user="$(id -un)"
fi

# ---------------------------------------------------------------- start
echo "→ Starting MySQL on 127.0.0.1:$PORT …"
"$SERVER_DIR/mysqld" \
  --defaults-file="$DEV_DIR/my.cnf" \
  --user="$(id -un)" \
  --console &
MYSQLD_PID=$!

cleanup() {
  kill "$MYSQLD_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Wait until the server answers on the socket.
for i in $(seq 1 60); do
  if [ -S "$SOCKET" ] && node -e "
const net = require('net');
const s = net.connect('$SOCKET');
s.on('connect', () => { s.end(); process.exit(0); });
s.on('error', () => process.exit(1));
setTimeout(() => process.exit(1), 1000);
" >/dev/null 2>&1; then
    break
  fi
  sleep 1
  if ! kill -0 "$MYSQLD_PID" 2>/dev/null; then
    echo "mysqld exited during startup — tail of the log:"
    tail -20 "$RUN_DIR/mysqld.err" || true
    exit 1
  fi
done

# Create the application database and user (idempotent).
node --input-type=module -e "
import mysql from 'mysql2/promise';
const conn = await mysql.createConnection({ socketPath: '$SOCKET', user: 'root', password: '' });
await conn.query('CREATE DATABASE IF NOT EXISTS \`$APP_DB\` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci');
await conn.query('CREATE USER IF NOT EXISTS \`$APP_USER\`@\`127.0.0.1\` IDENTIFIED BY ?', ['$APP_PASSWORD']);
await conn.query('GRANT ALL PRIVILEGES ON \`$APP_DB\`.* TO \`$APP_USER\`@\`127.0.0.1\`');
await conn.query('FLUSH PRIVILEGES');
await conn.end();
console.log('✓ Database \`$APP_DB\` and user \`$APP_USER\` are ready.');
"

echo "✓ MySQL is running (pid $MYSQLD_PID)."
echo "  Connection string: mysql://$APP_USER:$APP_PASSWORD@127.0.0.1:$PORT/$APP_DB"
echo "  Next step: npm run db:setup"

# Stay alive while mysqld runs.
wait "$MYSQLD_PID"
