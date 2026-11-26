import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { DEFAULT_SITE_CONFIG, normalizeSiteConfig } from '../lib/siteConfig.ts';

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function getConfigStorePath(): { dir: string; file: string } {
  const dir = path.resolve(os.tmpdir(), 'nepmatics-config');
  const file = path.resolve(dir, 'site-config.json');
  if (!file.startsWith(dir + path.sep)) {
    throw new Error('Invalid config storage path.');
  }
  return { dir, file };
}

export async function GET(): Promise<Response> {
  try {
    const { file } = getConfigStorePath();
    const raw = await fs.readFile(file, 'utf-8');
    const parsed: unknown = JSON.parse(raw);
    return jsonResponse({ ok: true, config: normalizeSiteConfig(parsed) }, 200);
  } catch {
    return jsonResponse({ ok: true, config: DEFAULT_SITE_CONFIG }, 200);
  }
}

export async function PUT(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid configuration JSON.' }, 400);
  }

  const normalized = normalizeSiteConfig(body);
  try {
    const { dir, file } = getConfigStorePath();
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(file, JSON.stringify(normalized, null, 2), 'utf-8');
  } catch {
    // Still return normalized config if temp write fails
  }

  return jsonResponse({ ok: true, config: normalized }, 200);
}
