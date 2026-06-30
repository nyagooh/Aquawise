import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {
  AppFrame, DashboardView, GISWorkspace, AssetPanel, LeakPanel, AICard,
  KPIS, KpiCard, CompositionCard, MaterialsCard, AgeCard, ReservoirCard, AlertsCard, FLOW, CORAL,
} from './AppUI';

const fps = 30;
const fade = (frame: number, duration: number) =>
  interpolate(frame, [0, 16, duration - 16, duration], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const sp = (frame: number, delay = 0, cfg: {damping?: number; stiffness?: number} = {}) =>
  spring({frame: frame - delay, fps, config: {damping: 20, stiffness: 80, ...cfg}});

const LOGO_MARK = staticFile('audio/Aquawise-mark-blue.png');
const LOGO_LOCKUP = staticFile('audio/Aquawise-lockup-blue.png');

const Caption: React.FC<{children: React.ReactNode; dark?: boolean}> = ({children, dark}) => {
  const frame = useCurrentFrame();
  const p = sp(frame, 0, {damping: 18, stiffness: 120});
  return (
    <div className={`caption ${dark ? 'caption-dark' : ''}`} style={{opacity: p, transform: `translateX(-50%) translateY(${20 - p * 20}px)`}}>
      <span>{children}</span>
    </div>
  );
};

/* ── 1 · Hook — mark reveal ── */
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = sp(frame, 8, {damping: 14, stiffness: 90});
  const out = interpolate(frame, [130, 180], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill className="scene white" style={{opacity: fade(frame, 180)}}>
      <div className="water-orbit" style={{transform: `translate(-50%,-50%) scale(${0.3 + pulse * 1.1})`, opacity: 0.9 * out}}/>
      <div className="opening-mark" style={{opacity: out, transform: `translate(-50%,-50%) scale(${0.85 + pulse * 0.15})`}}>
        <Img src={LOGO_MARK} className="logo-mark" alt="AquaWise"/>
      </div>
      {frame > 70 && <Caption dark>Every utility loses water it can&apos;t see.</Caption>}
    </AbsoluteFill>
  );
};

/* ── 2 · The living network — dashboard establishes ── */
const Living: React.FC = () => {
  const frame = useCurrentFrame();
  const p = sp(frame, 16);
  const tilt = interpolate(frame, [30, 140, 210], [1, 0.3, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  return (
    <AbsoluteFill className="scene navy" style={{opacity: fade(frame, 210)}}>
      <div className="brand-intro"><Img src={LOGO_LOCKUP} className="logo-lockup" alt="AquaWise"/><span>Your whole network, alive.</span></div>
      <div className="app-stage" style={{opacity: p, transform: `perspective(2200px) rotateX(${tilt * 8}deg) rotateY(${-tilt * 9}deg) scale(${0.8 + p * 0.18}) translateY(${60 - p * 60}px)`}}>
        <AppFrame active="dashboard" title="Operations Dashboard" sub="Kisumu Water Network · 3,233 segments · 716 km"><DashboardView/></AppFrame>
      </div>
      {frame > 120 && <Caption>One living system for the entire network.</Caption>}
    </AbsoluteFill>
  );
};

/* ── 3 · Asset management — every card individually ── */
const AssetManagement: React.FC = () => {
  const frame = useCurrentFrame();
  // Phase A (0-170): KPI cards pop in one by one.  Phase B (170-510): big cards cycle centre stage.
  const cards = [<CompositionCard key="c"/>, <MaterialsCard key="m"/>, <AgeCard key="a"/>, <ReservoirCard key="r"/>];
  const phase = 85;
  const idx = Math.min(cards.length - 1, Math.max(0, Math.floor((frame - 175) / phase)));
  const local = frame - 175 - idx * phase;
  const cin = sp(local, 0, {damping: 18, stiffness: 90});
  const cout = interpolate(local, [phase - 16, phase], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const showCards = frame >= 170;
  return (
    <AbsoluteFill className="scene navy" style={{opacity: fade(frame, 510)}}>
      <div className="beat-eyebrow">ASSET MANAGEMENT</div>
      {!showCards && (
        <div className="kpi-spot-grid">
          {KPIS.map((k, i) => {
            const e = sp(frame, 14 + i * 13);
            return <div key={k.label} style={{opacity: e, transform: `translateY(${30 - e * 30}px) scale(${0.9 + e * 0.1})`}}><KpiCard k={k}/></div>;
          })}
        </div>
      )}
      {showCards && (
        <div className="spot" style={{width: 860, opacity: cin * cout, transform: `translate(-50%,-50%) translateY(${40 - cin * 40}px) scale(${0.97 + cin * 0.05})`}}>
          {cards[idx]}
        </div>
      )}
      {frame > 40 && <Caption>Manage every asset — pipe, valve, pump, reservoir, meter.</Caption>}
    </AbsoluteFill>
  );
};

/* ── 4 · See the network — GIS map + asset panel ── */
const SeeNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = sp(frame, 8);
  const zoom = interpolate(frame, [30, 280], [1, 1.12], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const panel = sp(frame, 150, {damping: 18, stiffness: 95});
  return (
    <AbsoluteFill className="scene navy" style={{opacity: fade(frame, 300)}}>
      <div className="app-stage flush" style={{opacity: enter, transform: `scale(${(0.92 + enter * 0.08) * zoom})`}}>
        <AppFrame active="gis" title="GIS Map" sub="Kisumu Water Supply Network · live operational view" flush><GISWorkspace dash={frame * 4}/></AppFrame>
      </div>
      <div className="float-card" style={{opacity: panel, transform: `translateX(${80 - panel * 80}px)`}}><AssetPanel/></div>
      {frame > 60 && <Caption>See it all live — down to a single valve.</Caption>}
    </AbsoluteFill>
  );
};

/* ── 5 · Alerts ── */
const Alerts: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = sp(frame, 10, {damping: 18, stiffness: 90});
  const ping = (frame % 30) / 30;
  return (
    <AbsoluteFill className="scene navy" style={{opacity: fade(frame, 240)}}>
      <div className="beat-eyebrow">REAL-TIME ALERTS</div>
      <div className="spot" style={{width: 760, opacity: enter, transform: `translate(-50%,-50%) translateY(${40 - enter * 40}px) scale(${0.95 + enter * 0.05})`}}>
        <AlertsCard/>
      </div>
      <div style={{position: 'absolute', left: '50%', top: '50%', marginLeft: 300, marginTop: -150, zIndex: 25}}>
        <span style={{display: 'block', width: 70, height: 70, borderRadius: '50%', border: `4px solid ${CORAL}`, transform: `scale(${1 + ping})`, opacity: 1 - ping}}/>
      </div>
      {frame > 50 && <Caption>The moment something drifts — you know first.</Caption>}
    </AbsoluteFill>
  );
};

/* ── 6 · Non-revenue water ── */
const NRW: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = sp(frame, 8);
  const zoom = interpolate(frame, [110, 300], [1, 1.22], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const mini = sp(frame, 150, {damping: 18, stiffness: 90});
  const leakPulse = (frame % 36) / 36;
  const measured = interpolate(frame, [60, 150], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill className="scene navy" style={{opacity: fade(frame, 300)}}>
      <div className="app-stage flush" style={{opacity: enter, transform: `scale(${(0.92 + enter * 0.08) * zoom}) translateY(${(zoom - 1) * -60}px)`}}>
        <AppFrame active="nrw" title="Non-Revenue Water" sub="Expected vs measured flow · loss localisation" flush><GISWorkspace dash={frame * 5} leak leakPulse={leakPulse}/></AppFrame>
      </div>
      <div className="nrw-mini" style={{opacity: mini, transform: `translateY(${60 - mini * 60}px)`}}>
        <div className="lg"><span><i style={{background: FLOW}}/>Expected flow</span><span><i style={{background: CORAL}}/>Measured flow</span></div>
        <svg viewBox="0 0 480 150" style={{width: '100%'}}>
          <path d="M6 120 C90 110 110 60 170 72 S300 110 360 66 470 40 474 52" fill="none" stroke={FLOW} strokeWidth="7"/>
          <path d="M6 120 C90 110 110 60 170 72 S300 130 360 126 470 120 474 132" fill="none" stroke={CORAL} strokeWidth="7" strokeDasharray="14 10" strokeDashoffset={(1 - measured) * 600} opacity={measured}/>
        </svg>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 12}}>
          <div><div style={{color: '#94a3b8', fontSize: 13}}>Flow variance</div><strong style={{fontSize: 22, color: CORAL}}>Investigate</strong></div>
          <div style={{textAlign: 'right'}}><div style={{color: '#94a3b8', fontSize: 13}}>Estimated NRW</div><strong style={{fontSize: 22}}>22.5%</strong></div>
        </div>
      </div>
      {frame > 60 && <Caption>Pinpoint non-revenue water before it drains revenue.</Caption>}
    </AbsoluteFill>
  );
};

/* ── 7 · AI co-pilot + hydraulic model (centerpiece) ── */
const AIAdvisor: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = sp(frame, 8);
  const cardIn = sp(frame, 40, {damping: 18, stiffness: 80});
  const sim = frame < 150 ? 'Ready to run' : frame < 250 ? 'Running…' : 'Simulation successful';
  const wave = interpolate(frame, [150, 250], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const applied = frame > 320;
  return (
    <AbsoluteFill className="scene navy" style={{opacity: fade(frame, 420)}}>
      <div className="beat-eyebrow">AI CO-PILOT</div>
      <div className="app-stage flush" style={{opacity: enter, transform: `scale(${0.9 + enter * 0.1})`, top: 150}}>
        <AppFrame active="gis" title="GIS Map · Simulation" sub="AquaWise AI · validated on the hydraulic model" flush><GISWorkspace dash={frame * (3 + wave * 7)} sim={sim}/></AppFrame>
        <div className="sim-wave" style={{opacity: sim === 'Running…' ? 0.9 : 0, transform: `scale(${0.2 + wave * 2.4})`}}/>
      </div>
      <div style={{position: 'absolute', right: 130, top: 250, zIndex: 30, opacity: cardIn, transform: `translateY(${70 - cardIn * 70}px)`}}>
        <AICard applied={applied}/>
      </div>
      {frame > 70 && <Caption>AI recommends the fix — proven on the hydraulic model first.</Caption>}
    </AbsoluteFill>
  );
};

/* ── 8 · Outcome + lockup ── */
const Lockup: React.FC = () => {
  const frame = useCurrentFrame();
  const p = sp(frame, 16, {damping: 18, stiffness: 75});
  return (
    <AbsoluteFill className="scene lockup" style={{background: '#f4f7fc'}}>
      <div className="halo" style={{transform: `translate(-50%,-50%) scale(${0.7 + p * 0.5})`, opacity: 0.6}}/>
      <div className="lockup-logo" style={{opacity: p, transform: `translate(-50%,-50%) scale(${0.85 + p * 0.15})`}}>
        <Img src={LOGO_LOCKUP} className="logo-lockup" alt="AquaWise"/>
        <p>Manage every asset. See the whole network.<br/>Let AI and the hydraulic model guide every decision.</p>
        <strong>See it. Simulate it. Act.</strong>
      </div>
    </AbsoluteFill>
  );
};

const FilmGrade: React.FC = () => {
  const frame = useCurrentFrame();
  const sweep = interpolate(frame % 240, [0, 240], [-30, 130]);
  const g = (frame * 53) % 100;
  return (
    <AbsoluteFill className="film-grade" style={{pointerEvents: 'none'}}>
      <div className="film-vignette"/>
      <div className="film-sweep" style={{transform: `translateX(${sweep}%) skewX(-18deg)`}}/>
      <div className="film-grain" style={{backgroundPosition: `${g}px ${(g * 1.7) % 100}px`}}/>
      <div className="film-bar film-bar-top"/>
      <div className="film-bar film-bar-bottom"/>
    </AbsoluteFill>
  );
};

const VO: React.FC<{from: number; n: string}> = ({from, n}) => (
  <Sequence from={from}><Audio src={staticFile(`audio/voiceover-${n}.mp3`)} volume={1}/></Sequence>
);

export const AquaWiseTrailer: React.FC<{withAudio?: boolean}> = ({withAudio = true}) => (
  <AbsoluteFill className="trailer">
    {withAudio && <>
      <Audio src={staticFile('audio/ambient.wav')} volume={0.34}/>
      <VO from={6} n="01"/>
      <VO from={186} n="02"/>
      <VO from={396} n="03"/>
      <VO from={906} n="04"/>
      <VO from={1206} n="05"/>
      <VO from={1446} n="06"/>
      <VO from={1746} n="07"/>
      <VO from={2166} n="08"/>
    </>}
    <Sequence from={0} durationInFrames={180}><Hook/></Sequence>
    <Sequence from={180} durationInFrames={210}><Living/></Sequence>
    <Sequence from={390} durationInFrames={510}><AssetManagement/></Sequence>
    <Sequence from={900} durationInFrames={300}><SeeNetwork/></Sequence>
    <Sequence from={1200} durationInFrames={240}><Alerts/></Sequence>
    <Sequence from={1440} durationInFrames={300}><NRW/></Sequence>
    <Sequence from={1740} durationInFrames={420}><AIAdvisor/></Sequence>
    <Sequence from={2160} durationInFrames={240}><Lockup/></Sequence>
    <FilmGrade/>
  </AbsoluteFill>
);
