// Die letzte Frage tippt sich einmal, Buchstabe für Buchstabe. Timer sind
// injizierbar, damit der Ablauf ohne echte Wartezeit testbar ist.

export function typewriterSchedule(text, totalMs) {
  const chars = Array.from(text);
  const step = totalMs / chars.length;
  return chars.map((char, i) => ({ char, at: Math.round(step * (i + 1)) }));
}

export function createTypewriter({ text, totalMs, write, schedule = (fn, ms) => setTimeout(fn, ms) }) {
  let started = false;
  const chars = Array.from(text);
  return {
    get started() { return started; },
    start() {
      if (started) return false;
      started = true;
      const plan = typewriterSchedule(text, totalMs);
      plan.forEach((step, i) => {
        schedule(() => write(chars.slice(0, i + 1).join(''), i === plan.length - 1), step.at);
      });
      return true;
    },
  };
}
