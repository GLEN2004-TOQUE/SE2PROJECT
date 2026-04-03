export default function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500&display=swap');

      *, *::before, *::after { box-sizing: border-box; }

      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      @keyframes pulse-ring {
        0%   { transform: scale(0.92); opacity: .5; }
        50%  { transform: scale(1.03); opacity: .12; }
        100% { transform: scale(0.92); opacity: .5; }
      }
      @keyframes shimmer {
        0%   { background-position: -200% center; }
        100% { background-position:  200% center; }
      }
      @keyframes ticker {
        0%   { opacity: 0; transform: translateY(6px); }
        100% { opacity: 1; transform: translateY(0); }
      }

      .sd-root {
        min-height: 100vh;
        background-color: #12080a;
        background-image:
          radial-gradient(ellipse 70% 50% at 5%  0%,   rgba(110,15,15,.6)  0%, transparent 65%),
          radial-gradient(ellipse 55% 40% at 95% 95%,  rgba(160,120,15,.2) 0%, transparent 60%),
          radial-gradient(ellipse 40% 35% at 50% 50%,  rgba(70,8,8,.45)    0%, transparent 75%);
        font-family: 'DM Sans', sans-serif;
        color: #f0e2c0;
        position: relative;
      }

      .sd-root::before {
        content: '';
        position: fixed; inset: 0; z-index: 0; pointer-events: none;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.05'/%3E%3C/svg%3E");
        opacity: .4;
      }

      .deco-ring {
        position: fixed; border-radius: 50%; pointer-events: none;
        border: 1px solid rgba(200,160,40,.1);
        animation: pulse-ring 8s ease-in-out infinite;
        width: 700px; height: 700px; top: -250px; right: -250px;
      }
      .deco-ring-2 {
        width: 400px; height: 400px; bottom: -140px; left: -140px; top: auto; right: auto;
        animation-delay: -4s;
      }

      .sd-body {
        position: relative; z-index: 1;
        max-width: 1100px; margin: 0 auto;
        padding: 2.5rem 1.5rem 4rem;
      }

      .sd-welcome {
        margin-bottom: 2.2rem;
        animation: fadeUp .5s cubic-bezier(.22,1,.36,1) both;
      }
      .sd-welcome h1 {
        font-family: 'Playfair Display', serif;
        font-size: 2rem; font-weight: 700;
        color: #f5e6c8; line-height: 1.2;
        margin-bottom: .35rem;
      }
      .sd-welcome p {
        font-size: .85rem; font-weight: 300;
        color: rgba(200,170,100,.55);
        letter-spacing: .03em;
      }

      .sd-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
        animation: fadeUp .55s .08s cubic-bezier(.22,1,.36,1) both;
      }
      .sd-stat {
        background: rgba(255,255,255,.04);
        border: 1px solid rgba(200,160,50,.12);
        border-radius: 14px;
        padding: 1.1rem 1.2rem;
        position: relative; overflow: hidden;
        transition: border-color .2s, background .2s;
      }
      .sd-stat:hover {
        border-color: rgba(200,160,50,.28);
        background: rgba(255,255,255,.065);
      }
      .sd-stat::before {
        content: '';
        position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(200,160,50,.3), transparent);
      }
      .sd-stat-label {
        font-size: .65rem; letter-spacing: .12em; text-transform: uppercase;
        color: rgba(200,170,100,.45); margin-bottom: .5rem;
      }
      .sd-stat-value {
        font-size: 1.6rem; font-weight: 500; color: #f0e2c0;
        line-height: 1;
      }
      .sd-stat-sub {
        font-size: .72rem; color: rgba(200,170,100,.4);
        margin-top: .3rem;
      }
      .sd-stat-icon {
        position: absolute; right: 1rem; top: 50%;
        transform: translateY(-50%);
        font-size: 1.6rem; opacity: .12;
      }
      .sd-tier-badge {
        display: inline-flex; align-items: center; gap: .35rem;
        font-size: .72rem; letter-spacing: .06em; text-transform: uppercase;
        padding: .25rem .65rem; border-radius: 20px; margin-top: .4rem;
      }
      .sd-tier-badge.beginner  { background: rgba(100,100,120,.2);  color: rgba(180,180,210,.7); border: 1px solid rgba(100,100,120,.3); }
      .sd-tier-badge.intermediate { background: rgba(60,130,80,.15); color: rgba(100,210,130,.8); border: 1px solid rgba(60,130,80,.25); }
      .sd-tier-badge.advanced  { background: rgba(60,100,200,.15); color: rgba(100,160,255,.8); border: 1px solid rgba(60,100,200,.25); }
      .sd-tier-badge.master    { background: rgba(190,140,20,.15);  color: #c9a227;             border: 1px solid rgba(190,140,20,.3); }

      .sd-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.2rem;
        margin-bottom: 1.2rem;
        animation: fadeUp .6s .15s cubic-bezier(.22,1,.36,1) both;
      }
      @media (max-width: 700px) {
        .sd-grid { grid-template-columns: 1fr; }
      }

      .sd-card {
        background: rgba(255,255,255,.035);
        border: 1px solid rgba(200,160,50,.1);
        border-radius: 18px;
        padding: 1.4rem 1.5rem;
        position: relative; overflow: hidden;
      }
      .sd-card::before {
        content: '';
        position: absolute; top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(200,160,50,.25), transparent);
      }
      .sd-card-header {
        display: flex; align-items: center; gap: .7rem;
        margin-bottom: 1.1rem;
      }
      .sd-card-icon {
        width: 32px; height: 32px; border-radius: 10px;
        background: linear-gradient(135deg, #7a1515, #4a0c0c);
        box-shadow: 0 0 0 3px rgba(190,140,30,.15);
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      .sd-card-icon svg { width: 15px; height: 15px; color: #c9a227; }
      .sd-card-title {
        font-size: .95rem; font-weight: 500; color: #f0e2c0;
      }
      .sd-card-sub {
        font-size: .72rem; color: rgba(200,170,100,.45);
        margin-top: .15rem;
      }

      .sd-quiz-input {
        width: 100%;
        padding: .7rem .95rem;
        background: rgba(255,255,255,.055);
        border: 1px solid rgba(200,160,50,.2);
        border-radius: 10px;
        color: #f5e6c8;
        font-family: 'DM Sans', sans-serif;
        font-size: .9rem; font-weight: 300;
        outline: none;
        transition: border-color .2s, box-shadow .2s;
        margin-bottom: .75rem;
      }
      .sd-quiz-input::placeholder { color: rgba(200,170,100,.28); }
      .sd-quiz-input:focus {
        border-color: rgba(200,160,50,.5);
        box-shadow: 0 0 0 3px rgba(190,140,30,.12);
      }
      .sd-quiz-err {
        font-size: .75rem; color: #e07070;
        margin-bottom: .6rem; margin-top: -.3rem;
      }
      .sd-btn-primary {
        width: 100%;
        padding: .7rem 1rem;
        background: linear-gradient(135deg, #8b1a1a 0%, #6b1010 50%, #8b1a1a 100%);
        background-size: 200% auto;
        border: none; border-radius: 10px;
        color: #fff8e8;
        font-family: 'DM Sans', sans-serif;
        font-size: .85rem; font-weight: 500; letter-spacing: .04em;
        cursor: pointer;
        box-shadow: 0 4px 18px rgba(120,20,20,.5), 0 1px 0 rgba(255,200,80,.12) inset;
        transition: transform .15s, box-shadow .2s, opacity .2s;
      }
      .sd-btn-primary:hover {
        animation: shimmer .9s linear infinite;
        transform: translateY(-1px);
      }
      .sd-btn-primary:active { transform: translateY(0); }
      .sd-btn-primary:disabled { opacity: .5; cursor: not-allowed; }

      .sd-lb-tabs {
        display: flex; gap: .4rem; margin-bottom: .85rem;
      }
      .sd-lb-tab {
        padding: .3rem .75rem;
        border-radius: 7px;
        font-size: .72rem; letter-spacing: .06em; text-transform: uppercase;
        cursor: pointer;
        background: transparent;
        border: 1px solid rgba(200,160,50,.15);
        color: rgba(200,170,100,.45);
        font-family: 'DM Sans', sans-serif;
        transition: background .15s, color .15s, border-color .15s;
      }
      .sd-lb-tab:hover {
        border-color: rgba(200,160,50,.3);
        color: rgba(200,170,100,.7);
      }
      .sd-lb-tab.active {
        background: #c9a227;
        border-color: #c9a227;
        color: #1a0505;
      }
      .sd-lb-list { display: flex; flex-direction: column; gap: .45rem; }
      .sd-lb-row {
        display: flex; align-items: center; gap: .75rem;
        padding: .55rem .7rem;
        background: rgba(255,255,255,.03);
        border: 1px solid rgba(255,255,255,.06);
        border-radius: 10px;
        animation: ticker .3s ease both;
      }
      .sd-lb-rank {
        width: 22px; text-align: center;
        font-size: .75rem; font-weight: 600;
        color: rgba(200,170,100,.4);
        flex-shrink: 0;
      }
      .sd-lb-rank.top { color: #c9a227; }
      .sd-lb-name {
        flex: 1; font-size: .82rem; color: #f0e2c0;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .sd-lb-pts {
        font-size: .78rem; font-weight: 500; color: #c9a227;
        white-space: nowrap;
      }
      .sd-lb-tier {
        font-size: .62rem; letter-spacing: .06em; text-transform: uppercase;
        padding: .18rem .5rem; border-radius: 5px;
        background: rgba(200,160,40,.1); color: rgba(200,160,60,.6);
        border: 1px solid rgba(200,160,40,.15);
        flex-shrink: 0;
      }
      .sd-lb-empty, .sd-empty {
        text-align: center;
        padding: 2rem 1rem;
        font-size: .8rem; color: rgba(200,170,100,.3);
        letter-spacing: .04em;
      }
      .sd-lb-loading {
        display: flex; align-items: center; justify-content: center;
        padding: 1.5rem;
        gap: .6rem;
        font-size: .8rem; color: rgba(200,170,100,.35);
      }
      .sd-lb-spinner {
        width: 14px; height: 14px;
        border: 2px solid rgba(200,160,40,.2);
        border-top-color: rgba(200,160,40,.6);
        border-radius: 50%;
        animation: spin .7s linear infinite;
        flex-shrink: 0;
      }

      .sd-card-full {
        animation: fadeUp .65s .22s cubic-bezier(.22,1,.36,1) both;
      }

      .sd-badge-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
        gap: .75rem;
      }
      .sd-badge-item {
        display: flex; flex-direction: column; align-items: center;
        gap: .45rem; padding: .85rem .5rem;
        background: rgba(255,255,255,.04);
        border: 1px solid rgba(200,160,50,.12);
        border-radius: 12px;
        text-align: center;
        transition: border-color .2s, background .2s;
      }
      .sd-badge-item:hover {
        border-color: rgba(200,160,50,.28);
        background: rgba(255,255,255,.065);
      }
      .sd-badge-icon {
        width: 40px; height: 40px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.3rem;
        background: linear-gradient(135deg, rgba(120,25,25,.6), rgba(70,10,10,.6));
        border: 1px solid rgba(200,160,50,.2);
      }
      .sd-badge-name {
        font-size: .65rem; color: rgba(200,170,100,.55);
        letter-spacing: .04em; line-height: 1.3;
      }

      .sd-history-list { display: flex; flex-direction: column; gap: .5rem; }
      .sd-history-row {
        display: flex; align-items: center;
        padding: .6rem .8rem;
        background: rgba(255,255,255,.03);
        border: 1px solid rgba(255,255,255,.06);
        border-radius: 10px;
        gap: .8rem;
      }
      .sd-history-dot {
        width: 8px; height: 8px; border-radius: 50%;
        background: #c9a227; flex-shrink: 0;
        box-shadow: 0 0 6px rgba(200,160,40,.5);
      }
      .sd-history-title { flex: 1; font-size: .82rem; color: #f0e2c0; }
      .sd-history-score {
        font-size: .78rem; color: #c9a227; font-weight: 500; white-space: nowrap;
      }
      .sd-history-date {
        font-size: .7rem; color: rgba(200,170,100,.3); white-space: nowrap;
      }

      .sd-section-label {
        font-size: .65rem; letter-spacing: .14em; text-transform: uppercase;
        color: rgba(200,160,50,.4); margin-bottom: .7rem;
        display: flex; align-items: center; gap: .5rem;
      }
      .sd-section-label::after {
        content: ''; flex: 1; height: 1px;
        background: rgba(200,160,50,.1);
      }

      .sd-streak-flame {
        display: inline-flex; align-items: center; gap: .3rem;
      }

        .sd-nav {
        position: sticky;
        top: 0;
        z-index: 30;
        background: rgba(10, 5, 5, 0.75);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(200, 160, 50, 0.25);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.8rem 2rem;
        transition: all 0.3s ease;
        }

        .sd-nav-brand {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        }

        .sd-nav-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        }

        .sd-nav-icon img {
        width: 24px;
        height: 24px;
        object-fit: contain;
        display: block;
        }

        .sd-nav-title {
        font-family: 'Playfair Display', serif;
        font-size: 1.2rem;
        font-weight: 700;
        letter-spacing: -0.01em;
        background: linear-gradient(135deg, #f5e6c8 0%, #c9a227 80%);
        background-clip: text;
        -webkit-background-clip: text;
        color: transparent;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .sd-nav-right {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        }

        .sd-user-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        padding: 0.3rem 0.8rem 0.3rem 0.6rem;
        border-radius: 40px;
        border: 1px solid rgba(200, 160, 50, 0.2);
        transition: all 0.2s;
        }

        .sd-user-info:hover {
        border-color: rgba(200, 160, 50, 0.5);
        background: rgba(255, 255, 255, 0.08);
        }

        .sd-user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: linear-gradient(135deg, #c9a227, #8b6914);
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'DM Sans', sans-serif;
        font-weight: 600;
        font-size: 0.8rem;
        color: #1a0505;
        box-shadow: 0 0 0 1px rgba(200, 160, 50, 0.3);
        }

        .sd-user-name {
        font-family: 'DM Sans', sans-serif;
        font-size: 0.85rem;
        font-weight: 500;
        color: #f0e2c0;
        letter-spacing: 0.01em;
        }

        .sd-nav-logout {
        padding: 0.4rem 1rem;
        background: transparent;
        border: 1px solid rgba(200, 160, 50, 0.4);
        border-radius: 30px;
        color: rgba(200, 170, 100, 0.8);
        font-family: 'DM Sans', sans-serif;
        font-size: 0.75rem;
        font-weight: 500;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.25s ease;
        backdrop-filter: blur(4px);
        }

        .sd-nav-logout:hover {
        background: rgba(200, 160, 50, 0.15);
        border-color: #c9a227;
        color: #c9a227;
        transform: translateY(-1px);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }

        /* Mobile responsiveness */
        @media (max-width: 600px) {
        .sd-nav {
            padding: 0.6rem 1rem;
        }
        .sd-nav-title {
            font-size: 1rem;
        }
        .sd-user-name {
            display: none;
        }
        .sd-user-info {
            padding: 0.2rem;
        }
        .sd-nav-logout {
            padding: 0.3rem 0.8rem;
            font-size: 0.7rem;
        }
        }
    `}</style>
  );
}