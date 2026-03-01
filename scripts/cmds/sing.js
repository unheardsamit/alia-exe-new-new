const a = require("axios");
const b = require("fs");
const c = require("path");
const d = require("yt-search");

module.exports = {
  config: {
    name: "song",
    aliases: ["sing","music"],
    version: "0.0.1",
    author: "ArYAN",
    countDown: 5,
    role: 0,
    shortDescription: "Search and download music from YouTube",
    longDescription: "Search and download music from YouTube",
    category: "MUSIC",
    guide: "/music <song name or YouTube URL>"
  },

  onStart: async function ({ api: e, event: f, args: g }) {
    if (!g.length) return e.sendMessage("❌ Provide a song name or YouTube URL.", f.threadID, f.messageID);

    let h = g.join(" ");
    
    e.setMessageReaction("⏰", f.messageID, (err) => {}, true);

    try {
      let j;
      if (h.startsWith("http")) {
        j = h;
      } else {
        const k = await d(h);
        if (!k || !k.videos.length) throw new Error("No results found.");
        j = k.videos[0].url;
      }

      const l = `http://65.109.80.126:20409/aryan/youtube?url=${encodeURIComponent(j)}&type=audio`;
      const m = await a.get(l);
      const n = m.data;

      if (!n.status || !n.mp3) throw new Error("API failed to return download URL (mp3).");

      const o = `${n.title}.mp3`.replace(/[\\/:"*?<>|]/g, "");
      const p = c.join(__dirname, o);

      const q = await a.get(n.mp3, { 
        responseType: "arraybuffer",
        maxContentLength: Infinity, 
        maxBodyLength: Infinity
      });
      
      b.writeFileSync(p, q.data);
      
      const messageBody = `🎶 Title: ${n.title}`;

      e.setMessageReaction("✅", f.messageID, (err) => {}, true); 
      
      await e.sendMessage(
        { attachment: b.createReadStream(p), body: messageBody },
        f.threadID,
        () => {
          b.unlinkSync(p);
        },
        f.messageID
      );

    } catch (r) {
      console.error(r);
      e.setMessageReaction("❌", f.messageID, (err) => {}, true);
      e.sendMessage(`❌ Failed to download song: ${r.message}`, f.threadID, f.messageID);
    }
  }
};
