#!/usr/bin/env node
// Regenerates the "Recently" block in README.md from the GitHub API.
// Zero dependencies. Any network/API failure leaves README.md untouched and exits 0:
// a dead feed must never be able to damage the page.

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const README = join(ROOT, "README.md");
const START = "<!-- feed:start -->";
const END = "<!-- feed:end -->";

const LOGIN = process.env.PROFILE_LOGIN || "coweringg";
const LIMIT = 5;
const API = "https://api.github.com";

const headers = () => {
  const h = { Accept: "application/vnd.github+json", "User-Agent": "readme-feed" };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
};

async function gh(path) {
  const res = await fetch(`${API}${path}`, { headers: headers() });
  if (!res.ok) throw new Error(`GET ${path} -> ${res.status} ${res.statusText}`);
  return res.json();
}

const day = (iso) => iso.slice(0, 10);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const rel = (url, text) => `[${text}](${url})`;

async function repos() {
  const all = await gh(`/users/${LOGIN}/repos?per_page=100&sort=pushed`);
  return all
    // Archived, forked and self-marked-deprecated repos are dropped: the feed exists to
    // show current work, and "Selected work" above it is the curated surface.
    .filter((r) => !r.fork && !r.archived && r.name !== LOGIN && !/^\s*\(?(old|deprecated|archived)/i.test(r.description || ""))
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, LIMIT)
    .map((r) => {
      const bits = [esc(r.language), r.stargazers_count ? `${r.stargazers_count}★` : null].filter(Boolean);
      return `${rel(r.html_url, esc(r.name))}${bits.length ? ` · ${bits.join(" · ")}` : ""} — ${day(r.pushed_at)}`;
    });
}

async function releases() {
  const all = await gh(`/users/${LOGIN}/repos?per_page=100`);
  const out = [];
  for (const r of all) {
    if (!r.has_downloads && r.size === 0) continue;
    const rels = await gh(`/repos/${LOGIN}/${r.name}/releases?per_page=5`).catch(() => []);
    for (const rel of rels.slice(0, 2)) {
      out.push({
        line: `${rel(r.html_url, esc(rel.tag_name || r.name))} — ${day(rel.published_at)}`,
        at: rel.published_at,
      });
    }
  }
  return out.sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, LIMIT).map((x) => x.line);
}

async function mergedPRs() {
  const ev = await gh(`/users/${LOGIN}/events/public?per_page=100`);
  const seen = new Map();
  for (const e of ev) {
    if (e.type !== "PullRequestEvent" || !e.payload?.pull_request) continue;
    const pr = e.payload.pull_request;
    if (pr.merged_at) seen.set(pr.html_url, pr);
  }
  // The events endpoint exposes merged_at, but not reliably; confirm via search.
  const confirmed = [];
  for (const pr of [...seen.values()].slice(0, LIMIT * 2)) {
    const full = await gh(`/repos/${pr.base.repo.full_name}/pulls/${pr.number}`).catch(() => null);
    if (full?.merged_at) {
      confirmed.push({
        line: `${rel(full.html_url, esc(full.title))} — ${esc(full.base.repo.full_name)} — ${day(full.merged_at)}`,
        at: full.merged_at,
      });
    }
  }
  return confirmed.sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, LIMIT).map((x) => x.line);
}

function render(cols) {
  const live = cols.filter((c) => c.lines.length);
  if (!live.length) {
    return ["", "_Nothing published yet._", ""];
  }
  if (live.length === 1) {
    return ["", ...live[0].lines.map((l) => `- ${l}`), ""];
  }
  const width = Math.floor(100 / live.length);
  const cells = live
    .map((c) => {
      const body = c.lines.map((l) => `<br>${l}`).join("");
      return `<td valign="top" width="${width}%"><strong>${c.title}</strong><br><br>${body}</td>`;
    })
    .join("");
  return ["", `<table><tr>${cells}</tr></table>`, ""];
}

async function main() {
  const [repoLines, releaseLines, prLines] = await Promise.all([
    repos().catch((e) => (console.warn(`  feed: repos unavailable (${e.message})`), [])),
    releases().catch((e) => (console.warn(`  feed: releases unavailable (${e.message})`), [])),
    mergedPRs().catch((e) => (console.warn(`  feed: pull requests unavailable (${e.message})`), [])),
  ]);

  const cols = [
    { title: "Repository", lines: repoLines },
    { title: "Release", lines: releaseLines },
    { title: "Merged PR", lines: prLines },
  ];
  const live = cols.filter((c) => c.lines.length);
  const block = render(cols);

  const current = await readFile(README, "utf8");
  // Preserve the file's own line ending: this script runs on Windows too, and writing
  // LF into a CRLF checkout would make every run produce a spurious diff.
  const eol = current.includes("\r\n") ? "\r\n" : "\n";
  const next = current.replace(
    new RegExp(`\\r?\\n${START}[\\s\\S]*?${END}\\r?\\n?`),
    `${eol}${START}${eol}${block.join(eol)}${END}${eol}`
  );

  if (next === current) {
    console.log("  feed: already up to date");
  } else {
    await writeFile(README, next, "utf8");
    console.log(`  feed: updated (${live.length || "no"} live column${live.length === 1 ? "" : "s"})`);
  }
  for (const c of live) console.log(`         ${c.title}: ${c.lines.length}`);
}

main().catch((e) => {
  console.warn(`  feed: skipped, README untouched (${e.message})`);
});