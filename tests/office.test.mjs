import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('schema defines primary key, expiry index and timestamps',()=>{const sql=readFileSync('db/schema.sql','utf8'); assert.match(sql,/id UUID PRIMARY KEY/);assert.match(sql,/last_seen TIMESTAMPTZ/);assert.match(sql,/last_seen_idx/);});
test('presence endpoint checks session ID before mutation',()=>{const route=readFileSync('src/app/api/presence/route.ts','utf8');assert.match(route,/safeId\(body\?\.id\)/);assert.match(route,/status:400/);});

test("office scene uses Phaser with shared collision rules and no chat controls",()=>{const scene=readFileSync("src/components/game/office-scene.ts","utf8");const ui=readFileSync("src/components/office.tsx","utf8");assert.match(scene,/import Phaser from "phaser"/);assert.match(scene,/canMove\(x,y\)/);assert.doesNotMatch(ui,/chat-pane|chat-input|VolumeX|Microphone|live video/i);});

test("office renderer references actual CC0 atlases",()=>{const scene=readFileSync("src/components/game/office-scene.ts","utf8");assert.match(scene,/this\.add\.image\(x\*TILE,y\*TILE,"indoor",frame\)/);assert.match(scene,/this\.add\.sprite\(0,-5,"chars",0\)/);assert.match(scene,/roguelikeIndoor-atlas\.png/);assert.match(scene,/roguelikeChar-atlas\.png/);});
