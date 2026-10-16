import React, { useState, useEffect, useRef, useMemo } from 'react';

export interface FindingItem {
  id: string;
  label: string;
  value: string;
  q: string;
  fix: string;
  hint: string;
  w: number;
  box?: [number, number, number, number] | null;
  pretext?: string;
  ver?: boolean;
  drop?: boolean;
  sev?: number;
}

export interface Profile {
  id: string;
  name: string;
  img?: string;
  summary?: string;
  base: [string, string][];
  posts: [string, string][];
  c: FindingItem[];
  mail: {
    from: string;
    to: string;
    subject: string;
    l: [string | null, string][];
  };
  voice: string;
}

const BASE = 0;
const WT: Record<number, number> = { 1: 6, 2: 14, 3: 25 };

const RX: [string, string, RegExp, number][] = [
  ['Personal email', 'Which email can reset your password?', /[\w.+-]+@[\w-]+\.[\w.]+/g, 0],
  ['Phone number', 'Which number gets your codes?', /\+?\d[\d\s().-]{8,}\d/g, 0],
  ['First pet', 'Name of your first pet?', /(?:my|our) (?:dog|cat|puppy|kitten|pup),? (?:named |called )?([A-Z][a-z]+)/gi, 1],
  ['Birthday', 'What is your birth date?', /turn(?:s|ing)? \d+|\d+ days (?:till|until)[^.!\n]{0,25}/gi, 0],
  ['School', 'What school did you attend?', /[A-Z][\w']+(?: [A-Z][\w']+)* (?:High|Elementary|Academy|University)(?: School)?/g, 0],
  ['Travel plans', 'Is the account holder travelling?', /(?:flying out|out of office|away|back on|travelling|traveling)[^.!\n]{0,40}/gi, 0],
  ['Employer', 'Who is your employer?', /(?:work(?:ing)? (?:at|for)|joined) ([A-Z][\w&]+(?: [A-Z][\w&]+)?)/gi, 1],
];

const norm = (c: FindingItem[]) => {
  const t = c.reduce((a, x) => a + x.w, 0);
  if (t > 100) c.forEach((x) => (x.w = Math.round((x.w * 100) / t)));
  return c;
};

function exif(buf: ArrayBuffer) {
  const v = new DataView(buf);
  const out: {
    make?: string;
    model?: string;
    serial?: string;
    date?: string;
    lat?: number;
    lon?: number;
  } = {};
  try {
    if (v.getUint16(0) !== 0xffd8) return out;
    let o = 2;
    while (o < v.byteLength - 4) {
      const m = v.getUint16(o);
      if (m === 0xffe1) {
        const s = o + 4;
        if (v.getUint32(s) !== 0x45786966) break;
        const t = s + 6;
        const le = v.getUint16(t) === 0x4949;
        const g16 = (q: number) => v.getUint16(q, le);
        const g32 = (q: number) => v.getUint32(q, le);
        const str = (q: number, n: number) => {
          let r = '';
          for (let i = 0; i < n; i++) {
            const c = v.getUint8(q + i);
            if (!c) break;
            r += String.fromCharCode(c);
          }
          return r.trim();
        };
        const rat = (q: number) => g32(q) / (g32(q + 4) || 1);
        const ifd = (
          q: number,
          fn: (tag: number, cnt: number, vp: number, vo: number) => void
        ) => {
          const n = g16(q);
          for (let i = 0; i < n; i++) {
            const e = q + 2 + i * 12;
            const tag = g16(e);
            const typ = g16(e + 2);
            const cnt = g32(e + 4);
            const sz =
              ({ 1: 1, 2: 1, 3: 2, 4: 4, 5: 8 }[typ] || 1) * cnt;
            fn(tag, cnt, sz > 4 ? t + g32(e + 8) : e + 8, e + 8);
          }
        };
        let xp = 0;
        let gp = 0;
        ifd(t + g32(t + 4), (tag, cnt, vp, vo) => {
          if (tag === 0x010f) out.make = str(vp, cnt);
          if (tag === 0x0110) out.model = str(vp, cnt);
          if (tag === 0x8769) xp = t + g32(vo);
          if (tag === 0x8825) gp = t + g32(vo);
        });
        if (xp)
          ifd(xp, (tag, cnt, vp) => {
            if (tag === 0x9003) out.date = str(vp, cnt);
            if (tag === 0xa431) out.serial = str(vp, cnt);
          });
        if (gp) {
          const G: Record<number, any> = {};
          ifd(gp, (tag, _cnt, vp, vo) => {
            if (tag === 1 || tag === 3) G[tag] = str(vo, 2);
            if (tag === 2 || tag === 4)
              G[tag] = [rat(vp), rat(vp + 8), rat(vp + 16)];
          });
          if (G[2] && G[4]) {
            const d = (a: number[]) => a[0] + a[1] / 60 + a[2] / 3600;
            out.lat = (G[1] === 'S' ? -1 : 1) * d(G[2]);
            out.lon = (G[3] === 'W' ? -1 : 1) * d(G[4]);
          }
        }
        break;
      }
      o += 2 + v.getUint16(o + 2);
    }
  } catch (e) {}
  return out;
}

const TPROMPT = (t: string) =>
  `You are a careful privacy auditor. Read the text below, which someone plans to post online. Find details an attacker could use for social engineering, guessing account-recovery answers, stalking, fraud or impersonation: full names, employer and role, school, hometown, birth dates or ages, pet names, family members' names, phone numbers, emails, usernames and payment handles, travel dates, live location, routines, workplace details, financial hints. Report only details that are explicitly written in the text. Copy "quote" exactly, character for character, as short as possible. Reply with JSON only, no markdown: {"summary":"one or two plain sentences","findings":[{"quote":"exact text","label":"short name","severity":1,"confidence":0.9,"q":"recovery question it helps answer","pretext":"one sentence an attacker could write using it, in the first person as the author","fix":"short action","hint":"why it matters, under 12 words"}]}. severity is 1 to 3. confidence is 0 to 1. At most 8 findings. If nothing risky is present, return an empty findings list.\n\nTEXT:\n"""${t}"""`;

const PROMPT = `You are a careful privacy auditor. Look at this photo someone plans to post online. Report only details that are clearly visible and legible. Never guess, never infer a name or place that is not shown, and do not identify people from their faces. Look for: readable text (names, badges, lanyards, documents, screens, envelopes, plates, street signs, shop names), uniforms and logos that show an employer or school, landmarks or backgrounds that show a home, workplace or routine, other people or children in frame, valuables, reflections, and visible pet names. For text, "value" must be the exact text as printed. Each "box" must be tight around the item, as fractions 0 to 1 of the image: [left edge x, top edge y, width, height]. Reply with JSON only, no markdown: {"summary":"one or two plain sentences","findings":[{"label":"short name","value":"what is visible","severity":1,"confidence":0.9,"box":[0.1,0.2,0.3,0.1],"q":"recovery question or question it helps answer","pretext":"one sentence an attacker could write using it, in the first person as the photo's owner","fix":"short action such as Blur the badge","hint":"why it matters, under 12 words"}]}. severity is 1 to 3. confidence is 0 to 1. Use box null only for things with no clear spot. At most 6 findings. If nothing risky is visible, return an empty findings list.`;

const VPROMPT = (l: { label: string; value: string }[]) =>
  `You are checking claims about cropped regions of a photo. Each attached image is one crop, in the same order as this list. For each, say whether the claimed item is clearly visible and legible in that crop. Do not guess.\n${l
    .map((x, i) => `${i + 1}. ${x.label}: ${x.value}`)
    .join('\n')}\nReply with JSON only, no markdown: {"results":[{"n":1,"visible":true,"value":"exact text or description as seen","severity":1}]}. severity is 1 to 3.`;

function crop(bmp: ImageBitmap, b: [number, number, number, number]): Promise<Blob> {
  const px = b[2] * 0.15;
  const py = b[3] * 0.15;
  const x = Math.max(0, b[0] - px);
  const y = Math.max(0, b[1] - py);
  const w = Math.min(1 - x, b[2] + 2 * px);
  const h = Math.min(1 - y, b[3] + 2 * py);
  const sw = w * bmp.width;
  const sh = h * bmp.height;
  const k = Math.min(1, 1024 / Math.max(sw, sh));
  const c = document.createElement('canvas');
  c.width = Math.max(8, Math.round(sw * k));
  c.height = Math.max(8, Math.round(sh * k));
  const ctx = c.getContext('2d');
  if (ctx) {
    ctx.drawImage(bmp, x * bmp.width, y * bmp.height, sw, sh, 0, 0, c.width, c.height);
  }
  return new Promise((r) => c.toBlob((blob) => r(blob!), 'image/jpeg', 0.9));
}

async function aiJSON(prompt: string, blobs?: Blob[]): Promise<any> {
  const groqKey = (
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GROQ_API_KEY) ||
    localStorage.getItem('groq_api_key') ||
    ''
  ).trim();

  if (!groqKey) return null;

  try {
    if (blobs && blobs.length > 0) {
      const b64DataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blobs[0]);
      });

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.2-11b-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: b64DataUrl } },
              ],
            },
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || '{}';
        return JSON.parse(content.replace(/```json|```/g, '').trim());
      } else {
        console.warn('Groq Vision error:', res.status, await res.text());
      }
    } else {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || '{}';
        return JSON.parse(content.replace(/```json|```/g, '').trim());
      } else {
        console.warn('Groq Text error:', res.status, await res.text());
      }
    }
  } catch (err) {
    console.warn('Groq API exception:', err);
  }

  return null;
}

export function App() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [cur, setCur] = useState<Profile | null>(null);
  const [fixed, setFixed] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<'mail' | 'qs' | 'voice'>('mail');
  const [shownScore, setShownScore] = useState<number>(0);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [enterAnimation, setEnterAnimation] = useState<boolean>(true);
  const [statusMsg, setStatusMsg] = useState<string>('');

  // Dialog states

  const [textInput, setTextInput] = useState<string>(
    'Flying out of Pune tomorrow, back on the 28th. My dog Mango turns 5 this week! Proud Delhi Public School alum. Reach me at sam.rao@gmail.com, or +91 98765 43210. Working at Quill Labs.'
  );
  const [textMsg, setTextMsg] = useState<string>('');
  const [textScanning, setTextScanning] = useState<boolean>(false);

  // Photo modal states
  const [photoMsg, setPhotoMsg] = useState<string>('');
  const [photoScanning, setPhotoScanning] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textDialogRef = useRef<HTMLDialogElement>(null);
  const photoDialogRef = useRef<HTMLDialogElement>(null);
  const offPrevRef = useRef<Set<string>>(new Set());

  // Score calculations
  const totalScore = useMemo(() => {
    if (!cur) return 0;
    return BASE + cur.c.reduce((a, x) => a + x.w, 0);
  }, [cur]);

  const currentScore = useMemo(() => {
    if (!cur) return 0;
    return BASE + cur.c.reduce((a, x) => a + (fixed.has(x.id) ? 0 : x.w), 0);
  }, [cur, fixed]);

  // Handle score animation
  useEffect(() => {
    if (!cur) return;
    const to = currentScore;
    const from = shownScore;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    const d = prefersReduced ? 0 : 700;
    const t0 = performance.now();

    let animId: number;
    const step = (n: number) => {
      const k = d ? Math.min(1, (n - t0) / d) : 1;
      const e = 1 - Math.pow(1 - k, 3);
      const val = Math.round(from + (to - from) * e);
      setShownScore(val);
      if (k < 1) {
        animId = requestAnimationFrame(step);
      }
    };
    animId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animId);
  }, [currentScore, cur]);

  // Keep offPrev tracking
  useEffect(() => {
    offPrevRef.current = new Set(fixed);
  }, [fixed]);

  // Dialog openers & closers
  const openTextDialog = () => {
    setTextMsg('');
    textDialogRef.current?.showModal();
  };

  const closeTextDialog = () => {
    textDialogRef.current?.close();
  };

  const openPhotoDialog = () => {
    setPhotoMsg('');
    setPhotoScanning(false);
    photoDialogRef.current?.showModal();
  };

  const closePhotoDialog = () => {
    photoDialogRef.current?.close();
  };

  // Load profile
  const loadProfile = (p: Profile) => {
    setCur(p);
    setFixed(new Set());
    setShownScore(0);
    setEnterAnimation(true);
    offPrevRef.current = new Set();
    setStatusMsg('');
  };

  // Toggle detail removal
  const toggleFix = (id: string) => {
    setFixed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    setEnterAnimation(false);
  };

  // Fix all details sequentially
  const handleFixAll = () => {
    if (!cur) return;
    const unfixed = cur.c.filter((x) => !fixed.has(x.id));
    unfixed.forEach((x, i) => {
      setTimeout(() => {
        setFixed((prev) => new Set(prev).add(x.id));
      }, i * 260);
    });
  };

  // Reset all
  const handleReset = () => {
    setFixed(new Set());
    setStatusMsg('');
  };

  // Copy helper
  const handleCopy = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(
        () => setStatusMsg('Copied.'),
        () => setStatusMsg('Could not copy automatically.')
      );
    } else {
      setStatusMsg('Text copied to clipboard.');
    }
  };

  // Scan text logic
  const handleScanText = async () => {
    const txt = textInput.trim();
    if (!txt) {
      setTextMsg('Paste some text first.');
      return;
    }
    setTextScanning(true);
    setTextMsg('Reading your text.');

    let hits: {
      s: number;
      e: number;
      label: string;
      q: string;
      pretext?: string;
      fix: string;
      hint: string;
      sev: number;
    }[] = [];
    let summary = '';
    let ai = false;

    try {
      const j = await aiJSON(TPROMPT(txt));
      if (j && (j.findings || j.summary)) {
        ai = true;
        summary = j.summary || '';
        (j.findings || [])
          .filter((x: any) => (+x.confidence || 0) >= 0.5 && x.quote)
          .forEach((x: any) => {
            const q = String(x.quote);
            let i = txt.indexOf(q);
            if (i < 0) i = txt.toLowerCase().indexOf(q.toLowerCase());
            if (i >= 0) {
              hits.push({
                s: i,
                e: i + q.length,
                label: x.label,
                q: x.q,
                pretext: x.pretext,
                fix: x.fix,
                hint: x.hint,
                sev: Math.min(3, Math.max(1, Math.round(+x.severity) || 1)),
              });
            }
          });
      }
    } catch (e) {
      console.warn('AI Text scan error:', e);
    }

    if (!ai) {
      RX.forEach(([label, q, re, g]) => {
        const regex = new RegExp(re.source, re.flags);
        for (const m of txt.matchAll(regex)) {
          let s: number;
          let e: number;
          if (g && m[1]) {
            s = (m.index ?? 0) + m[0].lastIndexOf(m[1]);
            e = s + m[1].length;
          } else {
            s = m.index ?? 0;
            e = s + m[0].length;
          }
          hits.push({
            s,
            e,
            label,
            q,
            fix: `Remove ${label.toLowerCase()}`,
            hint: 'Found by pattern matching.',
            sev: 2,
          });
        }
      });
      summary =
        'Groq AI was not available, so this used pattern matching. It can miss details or flag the wrong ones.';
    }

    hits.sort((a, b) => a.s - b.s);
    const k: typeof hits = [];
    hits.forEach((h) => {
      if (!k.length || h.s >= k[k.length - 1].e) k.push(h);
    });

    setTextScanning(false);
    if (!k.length) {
      setTextMsg('No exposed details found in this text.');
      return;
    }

    let out = '';
    let i = 0;
    k.forEach((h, n) => {
      const id = 's' + n;
      const val = txt.slice(h.s, h.e).replace(/\s+/g, ' ');
      (h as any).id = id;
      (h as any).value = val;
      out += txt.slice(i, h.s).replace(/\[\[/g, '') + `[[${id}|${val}]]`;
      i = h.e;
    });
    out += txt.slice(i).replace(/\[\[/g, '');

    const c = norm(
      k.map((h, n) => ({
        id: 's' + n,
        label: h.label || 'Detail',
        value: (h as any).value,
        q: h.q || 'What could this reveal?',
        fix: h.fix || 'Remove this detail',
        hint: h.hint || '',
        w: WT[h.sev] || 14,
        pretext: h.pretext,
      }))
    );

    const p: Profile = {
      id: 'custom',
      name: 'Your text',
      summary,
      base: [['Source', 'Pasted text']],
      posts: [['Pasted just now', out]],
      c,
      mail: {
        from: 'sender@lookalike-domain.com',
        to: 'Someone who trusts you',
        subject: 'Quick request',
        l: c
          .map((x) => [x.id, x.pretext || `I'm referencing your ${x.label.toLowerCase()}.`] as [string | null, string])
          .concat([[null, 'Please act on the attached request today.']]),
      },
      voice: 'Add any public audio or video of you to this check by hand.',
    };

    setProfiles((prev) => {
      const idx = prev.findIndex((x) => x.id === 'custom');
      if (idx > -1) {
        const copy = [...prev];
        copy[idx] = p;
        return copy;
      }
      return [...prev, p];
    });

    closeTextDialog();
    loadProfile(p);
  };

  // Scan photo logic
  const handleScanPhoto = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    setPhotoScanning(true);
    setPhotoMsg('Reading hidden file data.');

    try {
      const buf = await file.arrayBuffer();
      const m = exif(buf);
      const bmp = await createImageBitmap(file);
      const sc = Math.min(1, 1280 / Math.max(bmp.width, bmp.height));
      const cv = document.createElement('canvas');
      cv.width = Math.round(bmp.width * sc);
      cv.height = Math.round(bmp.height * sc);
      const ctx = cv.getContext('2d');
      if (ctx) {
        ctx.drawImage(bmp, 0, 0, cv.width, cv.height);
      }
      const blob = await new Promise<Blob>((r) => cv.toBlob((b) => r(b!), 'image/jpeg', 0.85));
      const url = cv.toDataURL('image/jpeg', 0.85);

      const f: FindingItem[] = [];
      let summary = '';

      if (m.lat != null && m.lon != null) {
        f.push({
          id: 'p_gps',
          label: 'Exact location in the file',
          value: `${m.lat.toFixed(5)}, ${m.lon.toFixed(5)}`,
          sev: 3,
          q: 'Where do you live or work?',
          pretext: `I took this at ${m.lat.toFixed(3)}, ${m.lon.toFixed(3)}, so you know it's really me.`,
          fix: 'Strip location data',
          hint: 'GPS coordinates sit inside the file.',
          w: WT[3],
        });
      }
      const dev = [m.make, m.model].filter(Boolean).join(' ');
      if (dev) {
        f.push({
          id: 'p_dev',
          label: 'Camera or phone',
          value: dev + (m.serial ? `, serial ${m.serial}` : ''),
          sev: 1,
          q: 'Which device do you use?',
          pretext: `Sent from my ${dev}.`,
          fix: 'Strip device details',
          hint: 'Helps an attacker fake your device.',
          w: WT[1],
        });
      }
      if (m.date) {
        f.push({
          id: 'p_date',
          label: 'Time it was taken',
          value: m.date,
          sev: 1,
          q: 'What were you doing then?',
          pretext: `I took this photo on ${m.date.slice(0, 10).replace(/:/g, '-')}.`,
          fix: 'Strip date and time',
          hint: 'Reveals your routine.',
          w: WT[1],
        });
      }

      setPhotoMsg('Looking for details in the picture.');
      let ok = false;
      let dropped = 0;

      try {
        const j = await aiJSON(PROMPT, [blob]);
        if (j && (j.findings || j.summary)) {
          ok = true;
          summary = j.summary || '';
          const a = (j.findings || [])
            .filter((x: any) => (+x.confidence || 0) >= 0.5)
            .slice(0, 6)
            .map((x: any, idx: number) => ({
              id: 'p_vis_' + idx,
              label: x.label,
              value: x.value,
              sev: Math.min(3, Math.max(1, Math.round(+x.severity) || 1)),
              box:
                Array.isArray(x.box) && x.box.length === 4
                  ? (x.box.map((n: any) => Math.min(1, Math.max(0, +n || 0))) as [
                      number,
                      number,
                      number,
                      number,
                    ])
                  : null,
              q: x.q,
              pretext: x.pretext,
              fix: x.fix,
              hint: x.hint,
              w: WT[Math.min(3, Math.max(1, Math.round(+x.severity) || 1))] || 14,
              ver: false,
              drop: false,
            }));

          const bx = a.filter(
            (x: any) => x.box && x.box[2] > 0.01 && x.box[3] > 0.01
          );
          if (bx.length) {
            setPhotoMsg('Double-checking each finding up close.');
            try {
              const crops = await Promise.all(
                bx.map((x: any) => crop(bmp, x.box!))
              );
              const v = await aiJSON(VPROMPT(bx), crops);
              ((v && v.results) || []).forEach((r: any) => {
                const target = bx[r.n - 1];
                if (!target) return;
                if (r.visible === false) {
                  target.drop = true;
                } else {
                  target.ver = true;
                  if (r.value) target.value = r.value;
                  if (r.severity) {
                    target.sev = Math.min(3, Math.max(1, Math.round(+r.severity) || target.sev));
                    target.w = WT[target.sev] || 14;
                  }
                }
              });
            } catch (e) {
              console.warn('Verification exception:', e);
            }
          }

          dropped = a.filter((x: any) => x.drop).length;
          a.filter((x: any) => !x.drop).forEach((x: any) => f.push(x));
        }
      } catch (e) {
        console.warn('Vision AI analysis exception:', e);
      }

      if (!ok) {
        summary =
          'The picture itself could not be analysed (check VITE_GROQ_API_KEY in .env), so only the hidden file data was checked.';
      } else {
        if (dropped) {
          summary += ` ${dropped} possible finding${
            dropped > 1 ? 's were' : ' was'
          } dropped because it could not be confirmed on a close look.`;
        }
        if (!f.length) summary += ' Nothing risky was found.';
      }

      const c = norm(
        f.map((x, i) => ({
          id: 'p' + i,
          label: x.label || 'Detail',
          value:
            (x.value || '') +
            (x.ver === false && x.box ? ' (not double-checked)' : ''),
          q: x.q || 'What could this reveal?',
          fix: x.fix || 'Remove this detail',
          hint: x.hint || '',
          w: WT[x.sev || 2] || 14,
          box: x.box,
          pretext: x.pretext,
        }))
      );

      const p: Profile = {
        id: 'photo',
        name: 'Your photo',
        img: url,
        summary,
        base: [['Source', 'Uploaded photo']],
        posts: [],
        c,
        mail: {
          from: 'sender@lookalike-domain.com',
          to: 'Someone who trusts you',
          subject: 'Quick favour',
          l: c
            .map((x) => [x.id, x.pretext || `I'm referencing ${x.label.toLowerCase()}.`] as [string | null, string])
            .concat([[null, 'Can you send me the code you just received?']]),
        },
        voice: 'A photo carries no audio. Add any public video of you to this check by hand.',
      };

      setProfiles((prev) => {
        const idx = prev.findIndex((x) => x.id === 'photo');
        if (idx > -1) {
          const copy = [...prev];
          copy[idx] = p;
          return copy;
        }
        return [...prev, p];
      });

      closePhotoDialog();
      loadProfile(p);
    } catch (e) {
      console.error(e);
      setPhotoMsg('That image could not be read. Try a JPEG or PNG.');
      setPhotoScanning(false);
    }
  };

  // Intersection observer for rv elements on initial screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.rv').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [cur]);

  // Derived styling for score ring
  const isHigh = shownScore > 60;
  const isMid = shownScore > 30;
  const strokeColor = isHigh ? 'var(--bad)' : isMid ? 'var(--mid)' : 'var(--good)';
  const bandText = isHigh ? 'High' : isMid ? 'Moderate' : 'Low';

  // Deletion letter & audit JSON
  const exposedItems = cur ? cur.c.filter((x) => !fixed.has(x.id)) : [];
  const removedItems = cur ? cur.c.filter((x) => fixed.has(x.id)) : [];

  const letterContent = cur
    ? `Subject: Request for erasure of personal data (GDPR Art. 17 / CCPA §1798.105)\n\nTo the data protection officer,\n\nI am ${cur.name}. Please delete the following personal data published about me and confirm within 30 days:\n\n${
        exposedItems.length
          ? exposedItems.map((x) => `- ${x.label}: ${x.value}`).join('\n')
          : '- No exposed items remain.'
      }\n\nRegards,\n${cur.name}`
    : '';

  const auditContent = cur
    ? JSON.stringify(
        {
          subject: cur.name,
          date: new Date().toISOString().slice(0, 10),
          riskBefore: totalScore,
          riskNow: currentScore,
          removed: removedItems.map((x) => x.label),
          stillExposed: exposedItems.map((x) => x.label),
        },
        null,
        2
      )
    : '';

  return (
    <div className="wrap">
      {/* Header when a profile is active */}
      <div id="top" hidden={!cur}>
        <h1>Doppelgänger</h1>
        <p className="lede">
          Ordinary public posts add up. See the profile an attacker can assemble
          about a person, the message they could send, and what changes when each
          detail is removed.
        </p>
      </div>

      {/* Profile picker bar */}
      <div className="bar" id="picker" role="tablist" aria-label="Choose a profile">
        {profiles.map((p) => (
          <button
            key={p.id}
            className="tab"
            role="tab"
            aria-selected={p === cur}
            onClick={() => loadProfile(p)}
          >
            {p.name}
          </button>
        ))}
        {profiles.length > 0 && (
          <>
            <button className="btn" id="photo" onClick={openPhotoDialog}>
              Scan your photo
            </button>
            <button className="btn ghost" id="open" onClick={openTextDialog}>
              Scan your own text
            </button>
          </>
        )}
      </div>

      {/* Hero / Empty State */}
      {!cur && (
        <section id="empty">
          <div className="brand">
            <svg width="30" height="20" viewBox="0 0 30 20" aria-hidden="true">
              <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle
                className="c2"
                cx="20"
                cy="10"
                r="8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            Doppelgänger
          </div>
          <div className="hero">
            <div>
              <h2>
                <span>
                  <i>Your posts</i>
                </span>
                <span>
                  <i style={{ animationDelay: '.12s' }}>say more</i>
                </span>
                <span>
                  <i style={{ animationDelay: '.24s' }}>than you think.</i>
                </span>
              </h2>
              <p className="lede fa" style={{ animationDelay: '.6s' }}>
                Photos and captions leak small details that add up. Scan what
                you plan to post and see the profile an attacker could build,
                the message they could send, and how much safer you get as each
                detail comes out.
              </p>
              <div className="acts fa" style={{ animationDelay: '.8s' }}>
                <button className="btn" id="photo" onClick={openPhotoDialog}>
                  Scan your photo
                </button>
                <button className="btn ghost" id="open" onClick={openTextDialog}>
                  Scan your own text
                </button>
              </div>
              <p className="note fa" style={{ animationDelay: '1s' }}>
                This page does not save your photo or text.
              </p>
            </div>
            <div
              className="demo fa"
              style={{ animationDelay: '.5s' }}
              role="img"
              aria-label="Animated example: two details in a post are highlighted, turned into attacker notes, then removed as the risk score falls from 88 to 14."
            >
              <small>Example scan</small>
              <p className="dp">
                Boarding at <span className="dm">gate 22, back Thursday</span>.
                Already missing <span className="dm" style={{ animationDelay: '.4s' }}>Biscuit</span>.
              </p>
              <div className="dr" style={{ animationDelay: '.3s' }}>
                <b>Away until Thursday</b>
                <span>Shows when you cannot be reached</span>
              </div>
              <div className="dr" style={{ animationDelay: '.6s' }}>
                <b>First pet: Biscuit</b>
                <span>A common bank recovery answer</span>
              </div>
              <div className="dscore">
                <span className="dn"></span>
                <div className="dbar">
                  <i></i>
                </div>
              </div>
            </div>
          </div>
          <div className="steps">
            <div className="st rv">
              <b>1</b>
              <h3>Add what you plan to post</h3>
              <p>
                Pick a photo or paste a caption. A photo's hidden file data is
                read on your device.
              </p>
            </div>
            <div className="st rv" style={{ transitionDelay: '.12s' }}>
              <b>2</b>
              <h3>See what an attacker sees</h3>
              <p>
                Each risky detail is marked, with the security question it
                answers and the message it enables.
              </p>
            </div>
            <div className="st rv" style={{ transitionDelay: '.24s' }}>
              <b>3</b>
              <h3>Remove it and watch the risk fall</h3>
              <p>Turn on each fix, then copy the deletion letter or the audit.</p>
            </div>
          </div>
          <p className="note rv" style={{ maxWidth: '70ch' }}>
            It looks for exact location and device data, readable badges and
            screens, names and handles, pet and school answers, travel dates and
            family names. A clean result means nothing obvious was found, not
            that you are safe.
          </p>
        </section>
      )}

      {/* Main Analysis Screen */}
      {cur && (
        <div id="app">
          {/* Top row */}
          <div className="grid">
            <section className="card" aria-labelledby="l1">
              <h2 id="l1">{cur.img ? 'What the photo gives away' : 'What they posted'}</h2>
              <p className="sub">
                {cur.img ? '' : 'Highlighted phrases are the ones an attacker keeps.'}
              </p>
              <div id="posts">
                {cur.img ? (
                  <>
                    <figure className="shot">
                      <img src={cur.img} alt="Your uploaded photo" />
                      <div className="pins">
                        {cur.c
                          .filter((x) => x.box)
                          .map((x, i) => {
                            const [a, b, w, h] = x.box!;
                            const isGone = fixed.has(x.id);
                            const isHl = highlightedId === x.id;
                            return (
                              <button
                                key={x.id}
                                className={`pin ${isGone ? 'gone' : ''} ${isHl ? 'hl' : ''}`}
                                style={{
                                  left: `${a * 100}%`,
                                  top: `${b * 100}%`,
                                  width: `${w * 100}%`,
                                  height: `${h * 100}%`,
                                  animationDelay: `${0.3 + i * 0.15}s`,
                                }}
                                aria-label={x.label}
                                onClick={() => toggleFix(x.id)}
                                onMouseEnter={() => setHighlightedId(x.id)}
                                onMouseLeave={() => setHighlightedId(null)}
                              >
                                <i>{i + 1}</i>
                              </button>
                            );
                          })}
                      </div>
                    </figure>
                    {cur.c
                      .filter((x) => !x.box)
                      .map((x) => (
                        <div key={x.id} className="post">
                          <small>{x.label}</small>
                          <mark
                            data-b={x.id}
                            className={`${fixed.has(x.id) ? 'gone' : ''} ${
                              highlightedId === x.id ? 'hl' : ''
                            }`}
                            onMouseEnter={() => setHighlightedId(x.id)}
                            onMouseLeave={() => setHighlightedId(null)}
                          >
                            {x.value}
                          </mark>
                        </div>
                      ))}
                    <p className="note">{cur.summary || ''}</p>
                  </>
                ) : (
                  <>
                    {cur.posts.map(([w, x], pIdx) => {
                      // Parse tokens like [[id|text]]
                      const parts: React.ReactNode[] = [];
                      const regex = /\[\[(\w+)\|(.+?)\]\]/g;
                      let lastIdx = 0;
                      let m: RegExpExecArray | null;
                      let n = 0;

                      while ((m = regex.exec(x)) !== null) {
                        if (m.index > lastIdx) {
                          parts.push(x.substring(lastIdx, m.index));
                        }
                        const id = m[1];
                        const text = m[2];
                        const isGone = fixed.has(id);
                        const isHl = highlightedId === id;
                        const delay = enterAnimation ? 0.3 + n * 0.3 : 0;
                        n++;

                        parts.push(
                          <mark
                            key={id + '-' + m.index}
                            data-b={id}
                            className={`${isGone ? 'gone' : enterAnimation ? 'sweep' : ''} ${
                              isHl ? 'hl' : ''
                            }`}
                            style={{ animationDelay: `${delay}s` }}
                            onMouseEnter={() => setHighlightedId(id)}
                            onMouseLeave={() => setHighlightedId(null)}
                          >
                            {text}
                          </mark>
                        );
                        lastIdx = regex.lastIndex;
                      }
                      if (lastIdx < x.length) {
                        parts.push(x.substring(lastIdx));
                      }

                      return (
                        <div key={pIdx} className="post">
                          <small>{w}</small>
                          {parts}
                        </div>
                      );
                    })}
                    <p className="note">{cur.summary || ''}</p>
                  </>
                )}
              </div>
            </section>

            <section className="card" aria-labelledby="r1">
              <h2 id="r1">What an attacker builds from it</h2>
              <div className="score" aria-live="polite">
                <div className="ringbox">
                  <svg className="ring" viewBox="0 0 120 120" aria-hidden="true">
                    <circle className="rt" cx="60" cy="60" r="52" />
                    <circle
                      className="rf"
                      id="fill"
                      cx="60"
                      cy="60"
                      r="52"
                      pathLength={100}
                      style={{
                        strokeDashoffset: 100 - shownScore,
                        stroke: strokeColor,
                      }}
                    />
                  </svg>
                  <span className="num" id="num">
                    {shownScore}
                  </span>
                </div>
                <span>
                  <span className="band" id="band" style={{ color: strokeColor }}>
                    {bandText}
                  </span>
                  <br />
                  <span className="sub" style={{ margin: 0 }}>
                    Impersonation risk, out of 100
                  </span>
                </span>
              </div>
              <dl id="dossier">
                {cur.base.map(([k, v], i) => (
                  <div
                    key={'base-' + i}
                    className={`row ${enterAnimation ? 'enter' : ''}`}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
                {cur.c.map((x, i) => {
                  const off = fixed.has(x.id);
                  const isHl = highlightedId === x.id;
                  const flipped = off !== offPrevRef.current.has(x.id);
                  return (
                    <div
                      key={x.id}
                      className={`row ${off ? 'off' : ''} ${
                        enterAnimation ? 'enter' : ''
                      } ${flipped ? 'flip' : ''} ${isHl ? 'hl' : ''}`}
                      data-b={x.id}
                      tabIndex={0}
                      style={{ animationDelay: `${(cur.base.length + i) * 80}ms` }}
                      onMouseEnter={() => setHighlightedId(x.id)}
                      onMouseLeave={() => setHighlightedId(null)}
                      onFocus={() => setHighlightedId(x.id)}
                      onBlur={() => setHighlightedId(null)}
                    >
                      <dt>{x.label}</dt>
                      <dd>{off ? 'Not found in public sources' : x.value}</dd>
                    </div>
                  );
                })}
              </dl>
            </section>
          </div>

          {/* Bottom row */}
          <div className="grid">
            <section className="card" aria-labelledby="a1">
              <h2 id="a1">Attack simulator</h2>
              <p className="sub">Built only from details that are still public.</p>
              <div
                className="seg"
                role="tablist"
                id="atabs"
                data-i={tab === 'mail' ? '0' : tab === 'qs' ? '1' : '2'}
              >
                <i className="thumb"></i>
                <button
                  className="sg"
                  role="tab"
                  data-t="mail"
                  aria-selected={tab === 'mail'}
                  onClick={() => setTab('mail')}
                >
                  Spear-phishing email
                </button>
                <button
                  className="sg"
                  role="tab"
                  data-t="qs"
                  aria-selected={tab === 'qs'}
                  onClick={() => setTab('qs')}
                >
                  Security questions
                </button>
                <button
                  className="sg"
                  role="tab"
                  data-t="voice"
                  aria-selected={tab === 'voice'}
                  onClick={() => setTab('voice')}
                >
                  Voice clone
                </button>
              </div>

              <div id="attack" className="fadein" key={tab}>
                {tab === 'mail' && (
                  <div>
                    {(() => {
                      const m = cur.mail;
                      const ls = m.l.filter(([id]) => !id || !fixed.has(id));
                      const used = ls.filter(([id]) => id).length;
                      const all = m.l.filter(([id]) => id).length;
                      return (
                        <>
                          <div className="mail">
                            <div className="mh">
                              From: {m.from}
                              <br />
                              To: {m.to}
                              <br />
                              Subject: {m.subject}
                            </div>
                            <p>Hi,</p>
                            {ls.map(([, t], lIdx) => (
                              <p key={lIdx} className="ln">
                                {t}
                              </p>
                            ))}
                            <p>
                              Thanks,
                              <br />
                              {cur.name}
                            </p>
                          </div>
                          <p className="note">
                            {used === 0
                              ? 'Nothing personal is left. This now reads as a generic message and is easy to doubt.'
                              : `Personalised with ${used} of ${all} public details. The sender address is a lookalike domain.`}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                )}

                {tab === 'qs' && (
                  <table>
                    <thead>
                      <tr>
                        <th>Recovery question</th>
                        <th>Attacker's answer</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cur.c.map((x) => {
                        const o = fixed.has(x.id);
                        return (
                          <tr key={x.id}>
                            <td>{x.q}</td>
                            <td>{o ? 'No public answer' : x.value}</td>
                            <td>
                              <span className={`chip ${o ? 'ok' : ''}`}>
                                {o ? 'Blocked' : 'Bypassed'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                {tab === 'voice' && (
                  <div>
                    <p>{cur.voice}</p>
                    <p className="note">
                      A few minutes of clear audio is often enough to imitate a
                      voice on a phone call. The toggles here do not cover audio
                      and video, so remove or restrict those recordings
                      separately and agree on a call-back code with your finance
                      team.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="card" aria-labelledby="g1">
              <h2 id="g1">Remove details</h2>
              <p className="sub">
                Turn on each fix and watch the risk fall.{' '}
                <b id="prg">
                  {fixed.size} of {cur.c.length} removed.
                </b>
              </p>
              <div id="ghost">
                {cur.c.map((x) => (
                  <button
                    key={x.id}
                    className="sw"
                    role="switch"
                    aria-checked={fixed.has(x.id)}
                    data-f={x.id}
                    onClick={() => toggleFix(x.id)}
                    onMouseEnter={() => setHighlightedId(x.id)}
                    onMouseLeave={() => setHighlightedId(null)}
                  >
                    <span className="knob"></span>
                    <span>
                      <b>{x.fix}</b>
                      <span className="h">{x.hint}</span>
                    </span>
                    <span className="pts">−{x.w}</span>
                  </button>
                ))}
              </div>
              <div className="acts">
                <button className="btn" id="all" onClick={handleFixAll}>
                  Fix everything
                </button>
                <button className="btn ghost" id="reset" onClick={handleReset}>
                  Start over
                </button>
              </div>

              <details>
                <summary>Deletion request letter</summary>
                <pre id="letter">{letterContent}</pre>
                <div className="acts">
                  <button
                    className="btn ghost"
                    data-copy="letter"
                    onClick={() => handleCopy(letterContent)}
                  >
                    Copy letter
                  </button>
                </div>
              </details>

              <details>
                <summary>Privacy audit</summary>
                <pre id="audit">{auditContent}</pre>
                <div className="acts">
                  <button
                    className="btn ghost"
                    data-copy="audit"
                    onClick={() => handleCopy(auditContent)}
                  >
                    Copy JSON
                  </button>
                  <button className="btn ghost" onClick={() => window.print()}>
                    Print
                  </button>
                </div>
              </details>

              <p className="msg" id="msg" role="status">
                {statusMsg ||
                  (currentScore <= BASE && cur.c.length > 0
                    ? 'Every detail is removed.'
                    : '')}
              </p>
            </section>
          </div>
        </div>
      )}

      {/* Dialog: Scan your own text */}
      <dialog id="scan" ref={textDialogRef}>
        <h2>Scan your own text</h2>
        <p className="sub" style={{ margin: '4px 0 0' }}>
          Paste a bio or a few posts. Nothing leaves this page.
        </p>
        <textarea
          id="paste"
          aria-label="Text to scan"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
        />
        <p className="msg" id="smsg">
          {textMsg}
        </p>
        <div className="acts">
          <button
            className="btn"
            id="go"
            disabled={textScanning}
            onClick={handleScanText}
          >
            {textScanning ? 'Reading...' : 'Scan text'}
          </button>
          <button className="btn ghost" id="cancel" onClick={closeTextDialog}>
            Cancel
          </button>
        </div>
      </dialog>

      {/* Dialog: Scan a photo */}
      <dialog id="pdlg" ref={photoDialogRef}>
        <h2>Scan a photo</h2>
        <p className="sub" style={{ margin: '4px 0 0' }}>
          Pick a photo you plan to post. Hidden file data is read on this page. A
          resized copy is sent to Groq AI to look for details that give you away.
        </p>

        <label
          className={`drop ${isDragOver ? 'over' : ''}`}
          id="drop"
          htmlFor="file"
          hidden={photoScanning}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files?.[0]) {
              handleScanPhoto(e.dataTransfer.files[0]);
            }
          }}
        >
          <b>Choose an image</b>
          <span>or drop it here. JPEG, PNG or WebP.</span>
        </label>
        <input
          type="file"
          id="file"
          ref={fileInputRef}
          accept="image/*"
          hidden
          onChange={(e) => {
            if (e.target.files?.[0]) {
              handleScanPhoto(e.target.files[0]);
            }
            e.target.value = '';
          }}
        />



        <div className="prog" id="prog" hidden={!photoScanning}>
          <i></i>
        </div>
        <p className="msg" id="pmsg" role="status">
          {photoMsg}
        </p>
        <div className="acts">
          <button className="btn ghost" id="pcancel" onClick={closePhotoDialog}>
            Cancel
          </button>
        </div>
      </dialog>
    </div>
  );
}

export default App;
