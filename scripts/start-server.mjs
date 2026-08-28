// Cross-platform launcher for json-server.
import { spawn } from 'node:child_process';
import path from 'node:path';

const port = process.env.PORT || '3001';
const isWindows = process.platform === 'win32';
const jsonServerBin = path.join(
  process.cwd(),
  'node_modules',
  '.bin',
  isWindows ? 'json-server.cmd' : 'json-server'
);

const child = spawn(
  jsonServerBin,
  ['--watch', 'db.json', '--port', String(port), '--host', '0.0.0.0'],
  { stdio: 'inherit', shell: isWindows }
);

child.on('exit', (code) => process.exit(code ?? 0));
child.on('error', (err) => {
  console.error('Failed to start json-server:', err);
  process.exit(1);
});