#!/usr/bin/env python3
"""MAKE_VO.PY — voice clips for new or changed lines, in the same voices as the existing clips.

The game looks a line up by a hash of "<speaker>|<text>" (see VOICE.key in index.html / level2.html) and
plays assets/vo/<file> from assets/vo/manifest.json. This script makes the clip for each line given and
adds it to the manifest; lines that already have a clip are skipped (use --force to remake them).

Voices (Microsoft Edge neural voices, free; matched to the existing clips by pitch and pace):
    narr / noori : en-IN-NeerjaNeural   (narrator a touch faster than Noori)
    billu        : en-IN-PrabhatNeural
    chintu, monty, ant and the other animals : en-US-AnaNeural

    pip install edge-tts
    python3 tools/make_vo.py lines.json          # [{"who":"noori","text":"..."}, ...]
    python3 tools/make_vo.py --say noori "This is one whole pizza."
    python3 tools/make_vo.py --words narr "..."  # also print when each word is said (ms), for syncing animations
"""
import asyncio, hashlib, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VO = os.path.join(ROOT, "assets", "vo")
MAN = os.path.join(VO, "manifest.json")

VOICES = {
    "narr":  ("en-IN-NeerjaNeural", "-5%", "+0Hz"),
    "noori": ("en-IN-NeerjaNeural", "-9%", "+0Hz"),
    "billu": ("en-IN-PrabhatNeural", "+0%", "+0Hz"),
}
ANIMAL = ("en-US-AnaNeural", "+0%", "+0Hz")


def norm(t):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", t)).strip()


def key(who, text):
    """the same FNV-1a hash as VOICE.key in the game (over UTF-16 code units)"""
    b = (who + "|" + norm(text)).encode("utf-16-le")
    h = 0x811C9DC5
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8)
        h = (h * 16777619) & 0xFFFFFFFF
    return format(h, "08x")


def spoken(who, text):
    """what the voice reads: a quoted line ("Monty: “…”") is read without the speaker's name"""
    t = norm(text)
    m = re.match(r'^\s*[A-Z][A-Za-z]+(?: and [A-Z][A-Za-z]+)?(?:\s*\([^)]*\))?:\s*[“"](.*)[”"]\s*⭐?\s*$', t)
    if m:
        t = m.group(1)
    return t.replace("⭐", "").strip()


async def make(who, text, force=False, words=False, dry=False):
    import edge_tts
    man = json.load(open(MAN))
    k = key(who, text)
    if k in man and not force and not words and not dry:
        return k, man[k], None
    voice, rate, pitch = VOICES.get(who, ANIMAL)
    com = edge_tts.Communicate(spoken(who, text), voice, rate=rate, pitch=pitch, boundary="WordBoundary")
    audio, marks = bytearray(), []
    async for ch in com.stream():
        if ch["type"] == "audio":
            audio += ch["data"]
        elif ch["type"] == "WordBoundary":
            marks.append((round(ch["offset"] / 10000), ch["text"]))
    if dry:   # only the timings, nothing written
        return k, man.get(k), marks
    name = f"{k}-{hashlib.sha1(bytes(audio)).hexdigest()[:6]}.mp3"
    if k in man and man[k] != name and os.path.exists(os.path.join(VO, man[k])):
        os.remove(os.path.join(VO, man[k]))
    open(os.path.join(VO, name), "wb").write(audio)
    man = json.load(open(MAN))
    man[k] = name
    json.dump(dict(sorted(man.items())), open(MAN, "w"), separators=(",", ":"))
    return k, name, marks


async def main(a):
    force = "--force" in a
    a = [x for x in a if x != "--force"]
    if a and a[0] == "--marks":   # word timings of a line, without touching its clip
        for i in range(1, len(a) - 1, 2):
            k, f, marks = await make(a[i], a[i + 1], dry=True)
            print(k, f, "::", " ".join(f"{t}@{ms}" for ms, t in marks))
        return
    if a and a[0] in ("--say", "--words"):
        k, f, marks = await make(a[1], a[2], force or a[0] == "--words", a[0] == "--words")
        print(k, f)
        if marks:
            print(" ".join(f"{t}@{ms}" for ms, t in marks))
        return
    for item in json.load(open(a[0])):
        k, f, _ = await make(item["who"], item["text"], force)
        print(k, f, item["who"], "|", item["text"])

if __name__ == "__main__":
    asyncio.run(main(sys.argv[1:]))
