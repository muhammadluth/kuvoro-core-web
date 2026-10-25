import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('schema defines primary key, expiry index and timestamps',()=>{const sql=readFileSync('db/schema.sql','utf8'); assert.match(sql,/id UUID PRIMARY KEY/);assert.match(sql,/last_seen TIMESTAMPTZ/);assert.match(sql,/last_seen_idx/);});
test('presence endpoint checks session ID before mutation',()=>{const route=readFileSync('src/app/api/presence/route.ts','utf8');assert.match(route,/safeId\(body\?\.id\)/);assert.match(route,/status:400/);});
