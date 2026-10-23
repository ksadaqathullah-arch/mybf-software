#!/usr/bin/env node

/**
 * Dual-Port Runner for MYBF Platform
 * 
 * Runs two completely isolated instances:
 * 1. Port 3000: Public Website, Member Portal & Chapter Portal (Zero-Trust Super Admin blocked)
 * 2. Port 4000: Central System & Super Administrator Workspace
 */

import { spawn } from 'child_process';

console.log('\x1b[36m%s\x1b[0m', '=======================================================');
console.log('\x1b[36m%s\x1b[0m', '  MYBF DUAL-PORT ISOLATION RUNNER');
console.log('\x1b[36m%s\x1b[0m', '=======================================================');
console.log('\x1b[32m%s\x1b[0m', '  [PUBLIC]       http://localhost:3000 (Members, Chapters & Public)');
console.log('\x1b[35m%s\x1b[0m', '  [SUPER ADMIN]  http://localhost:4000 (Central System Workspace)');
console.log('\x1b[36m%s\x1b[0m', '=======================================================\n');

function runProcess(name, port, cwd, color) {
  const env = {
    ...process.env,
    PORT: String(port),
  };

  const proc = spawn('npx', ['next', 'dev', '-p', String(port)], {
    cwd: cwd || process.cwd(),
    env,
    stdio: 'pipe',
    shell: true,
  });

  const prefix = `${color}[${name}:${port}]\x1b[0m `;

  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line) => {
      if (line.trim()) {
        console.log(`${prefix}${line}`);
      }
    });
  });

  proc.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach((line) => {
      if (line.trim()) {
        console.error(`${prefix}\x1b[31m${line}\x1b[0m`);
      }
    });
  });

  proc.on('close', (code) => {
    console.log(`${prefix} exited with code ${code}`);
  });

  return proc;
}

const publicProc = runProcess('PUBLIC', 3000, process.cwd(), '\x1b[32m');
const adminProc = runProcess('ADMIN', 4000, './apps/admin', '\x1b[35m');

function cleanup() {
  console.log('\nShutting down both instances...');
  publicProc.kill('SIGINT');
  adminProc.kill('SIGINT');
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
