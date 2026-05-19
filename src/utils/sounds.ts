// Programmatic sound effects using the Web Audio API — no files needed

function getCtx(): AudioContext {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
}

// Short satisfying blip — played when logging km
export function playLogSound() {
    try {
        const ctx = getCtx();
        const now = ctx.currentTime;

        const freqs = [440, 550, 660]; // ascending notes
        freqs.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + i * 0.08);

            gain.gain.setValueAtTime(0, now + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.25, now + i * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.18);

            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.2);
        });
    } catch (e) {
        // Silently fail if audio isn't available
    }
}

// Longer triumphant sweep — played on achievement unlock
export function playAchievementSound() {
    try {
        const ctx = getCtx();
        const now = ctx.currentTime;

        // Rising arpeggio then held chord
        const sequence = [
            { freq: 330, start: 0,    dur: 0.15 },
            { freq: 440, start: 0.12, dur: 0.15 },
            { freq: 550, start: 0.24, dur: 0.15 },
            { freq: 660, start: 0.36, dur: 0.5  },
            { freq: 550, start: 0.36, dur: 0.5  }, // harmony
            { freq: 440, start: 0.36, dur: 0.5  }, // harmony
        ];

        sequence.forEach(({ freq, start, dur }) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + start);

            gain.gain.setValueAtTime(0, now + start);
            gain.gain.linearRampToValueAtTime(0.18, now + start + 0.03);
            gain.gain.setValueAtTime(0.18, now + start + dur - 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur + 0.15);

            osc.start(now + start);
            osc.stop(now + start + dur + 0.2);
        });
    } catch (e) {
        // Silently fail
    }
}