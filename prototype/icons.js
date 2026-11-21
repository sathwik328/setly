/**
 * PUSHPA Consistent Inline SVG Icon Set
 * 2px stroke, rounded corners, zero emojis.
 */

const Icons = {
  // Layered glowing SVG flame logo
  flameLogo(size = 48) {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" class="flame-logo-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="flame-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <!-- Outer Deep Red Flame -->
        <path d="M32 4C32 4 48 20 48 38C48 49 40 58 32 58C24 58 16 49 16 38C16 26 26 12 32 4Z" fill="#FF3D2E" filter="url(#flame-glow)"/>
        <!-- Mid Orange Flame -->
        <path d="M32 14C32 14 44 26 44 40C44 48 38 54 32 54C26 54 20 48 20 40C20 30 28 20 32 14Z" fill="#FF6A00"/>
        <!-- Inner Yellow Flame -->
        <path d="M32 24C32 24 40 32 40 42C40 48 36 51 32 51C28 51 24 48 24 42C24 34 29 28 32 24Z" fill="#FFB020"/>
        <!-- White-Hot Core -->
        <path d="M32 36C32 36 36 40 36 45C36 48 34 49 32 49C30 49 28 48 28 45C28 41 30 38 32 36Z" fill="#FFF4EA"/>
      </svg>
    `;
  },

  // Tiny streak flame icon
  flameStreak(size = 18) {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C12 2 17 8 17 14C17 17.5 14.5 20 12 20C9.5 20 7 17.5 7 14C7 9.5 10.5 5 12 2Z" fill="#FF6A00"/>
        <path d="M12 9C12 9 14.5 12 14.5 15C14.5 16.5 13.5 17.5 12 17.5C10.5 17.5 9.5 16.5 9.5 15C9.5 12.5 11 10.5 12 9Z" fill="#FFB020"/>
      </svg>
    `;
  },

  today: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`,
  plan: `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
  progress: `<svg viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>`,
  profile: `<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M6 20v-1a6 6 0 0 1 12 0v1"/></svg>`,
  log: `<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
  history: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/></svg>`,
  reports: `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  settings: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  spark: `<svg viewBox="0 0 24 24"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"/></svg>`,
  check: `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
  lock: `<svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  back: `<svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>`,
  plus: `<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  trash: `<svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  eye: `<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  eyeOff: `<svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
  share: `<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
  play: `<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  pause: `<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
  skip: `<svg viewBox="0 0 24 24"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>`,
  calendarScene() {
    return `
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="15" y="20" width="70" height="65" rx="8" stroke="var(--accent)" stroke-width="3" fill="var(--s2)"/>
        <line x1="15" y1="36" x2="85" y2="36" stroke="var(--line-strong)" stroke-width="2"/>
        <circle cx="30" cy="16" r="3" fill="var(--dim)"/>
        <circle cx="70" cy="16" r="3" fill="var(--dim)"/>
        <circle cx="32" cy="50" r="5" fill="var(--accent)"/>
        <circle cx="50" cy="50" r="5" fill="var(--dim)"/>
        <circle cx="68" cy="50" r="5" fill="var(--dim)"/>
        <circle cx="32" cy="68" r="5" fill="var(--dim)"/>
        <circle cx="50" cy="68" r="5" fill="var(--dim)"/>
        <circle cx="68" cy="68" r="5" fill="var(--dim)"/>
      </svg>
    `;
  },
  notebookScene() {
    return `
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="15" width="60" height="70" rx="6" stroke="var(--accent)" stroke-width="3" fill="var(--s2)"/>
        <line x1="28" y1="15" x2="28" y2="85" stroke="var(--accent)" stroke-width="2"/>
        <line x1="38" y1="30" x2="70" y2="30" stroke="var(--tx)" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="38" y1="45" x2="65" y2="45" stroke="var(--dim)" stroke-width="2" stroke-linecap="round"/>
        <line x1="38" y1="60" x2="60" y2="60" stroke="var(--dim)" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Icons;
}

export { Icons };
export default Icons;
