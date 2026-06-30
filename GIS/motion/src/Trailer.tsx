import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

import {AppFrame, DashboardView, GISWorkspace, AssetPanel, LeakPanel} from './AppUI';

const BLUE = '#2563EB';
const FLOW = '#1FA2FF';
const NAVY = '#0B1020';
const CORAL = '#D4675E';
const AMBER = '#D9A156';
const GREEN = '#4FA877';

const fade = (frame: number, duration: number) =>
  interpolate(frame, [0, 18, duration - 18, duration], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const AquaLogo: React.FC<{light?: boolean; compact?: boolean}> = ({light, compact}) => (
  <div className={`logo ${compact ? 'logo-compact' : ''}`}>
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="15" fill={light ? '#fff' : BLUE} />
      <path d="M12 50 32 14 52 50" fill="none" stroke={light ? BLUE : '#fff'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
      <path d="M21 50 32 14 43 50" fill="none" opacity=".5" stroke={light ? BLUE : '#fff'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
      <path d="M29 50 32 14 35 50" fill="none" opacity=".25" stroke={light ? BLUE : '#fff'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="3.5" />
    </svg>
    {!compact && <span>AquaWise</span>}
  </div>
);

const Caption: React.FC<{children: React.ReactNode; dark?: boolean}> = ({children, dark}) => {
  const frame = useCurrentFrame();
  const progress = spring({frame, fps: 30, config: {damping: 18, stiffness: 120}});
  return (
    <div className={`caption ${dark ? 'caption-dark' : ''}`} style={{opacity: progress, transform: `translateY(${24 - progress * 24}px)`}}>
      <span>{children}</span>
    </div>
  );
};

const GridNetwork: React.FC<{alert?: boolean; stable?: boolean; zoom?: number}> = ({alert, stable, zoom = 1}) => {
  const frame = useCurrentFrame();
  const dash = -frame * 4;
  const nodes = [
    [160, 260], [370, 170], [585, 290], [800, 160], [1040, 255], [1290, 155], [1510, 280],
    [280, 520], [520, 490], [740, 590], [980, 465], [1240, 565], [1470, 505], [1690, 650],
    [410, 790], [690, 770], [920, 850], [1190, 765], [1450, 840],
  ];
  const links = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[0,7],[7,8],[8,2],[8,9],[9,10],[10,4],[10,11],[11,12],[12,6],[12,13],[7,14],[14,15],[15,9],[15,16],[16,17],[17,11],[17,18],[18,13]];
  return (
    <svg className="network" viewBox="0 0 1920 1080" style={{transform: `scale(${zoom})`}}>
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {links.map(([a,b], index) => (
        <line key={index} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke={alert && index === 12 ? CORAL : stable ? FLOW : '#24436f'} strokeWidth={alert && index === 12 ? 10 : 6} opacity={stable ? .85 : .55}/>
      ))}
      {links.slice(0, 18).map(([a,b], index) => (
        <line key={`flow-${index}`} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke={FLOW} strokeWidth="4" strokeDasharray="2 30" strokeDashoffset={dash - index * 13} strokeLinecap="round" opacity={stable ? 1 : .75} filter="url(#glow)"/>
      ))}
      {nodes.map(([x,y], index) => <circle key={index} cx={x} cy={y} r={index % 5 === 0 ? 13 : 8} fill={alert && index === 11 ? CORAL : FLOW} stroke="#dff4ff" strokeWidth="4" opacity={.95}/>) }
      {alert && <circle className="pulse-ring" cx="1240" cy="565" r={34 + Math.sin(frame / 5) * 7} fill="none" stroke={CORAL} strokeWidth="7" opacity=".8"/>}
    </svg>
  );
};

const HiddenNetwork: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pulse = spring({frame: frame - 12, fps, config: {damping: 14, stiffness: 90}});
  const dive = interpolate(frame, [70, 170], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  return (
    <AbsoluteFill className="scene white" style={{opacity: fade(frame, 210)}}>
      <div className="water-orbit" style={{transform: `translate(-50%,-50%) scale(${.25 + pulse * 1.1 + dive * 10})`, opacity: 1 - dive * .7}} />
      <div className="opening-mark" style={{opacity: 1 - dive, transform: `translate(-50%,-50%) scale(${.85 + pulse * .15})`}}>
        <AquaLogo compact />
      </div>
      <div className="network-dive" style={{opacity: dive, transform: `scale(${.7 + dive * .3})`}}><GridNetwork stable /></div>
      {frame > 92 && <Caption dark>Every asset carries water—and risk.</Caption>}
    </AbsoluteFill>
  );
};

const ProblemCard: React.FC<{label: string; icon: string; x: number; y: number; delay: number}> = ({label, icon, x, y, delay}) => {
  const frame = useCurrentFrame();
  const p = spring({frame: frame - delay, fps: 30, config: {damping: 16, stiffness: 105}});
  return <div className="problem-card" style={{left: x, top: y, opacity: p, transform: `translateY(${50 - p * 50}px) rotate(${(1-p) * (x % 2 ? 5 : -5)}deg)`}}><b>{icon}</b><span>{label}</span></div>;
};

const NRWProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const words = frame < 95 ? ['DISCONNECTED', 'ASSETS'] : frame < 190 ? ['HIDDEN', 'LOSSES'] : ['RISING', 'NRW'];
  return (
    <AbsoluteFill className="scene pale" style={{opacity: fade(frame, 300)}}>
      <div className="kinetic-title"><span>{words[0]}</span><strong>{words[1]}</strong></div>
      <ProblemCard label="GIS network" icon="⌁" x={160} y={180} delay={15}/>
      <ProblemCard label="Asset register" icon="▦" x={1340} y={170} delay={30}/>
      <ProblemCard label="Maintenance" icon="⌕" x={230} y={700} delay={48}/>
      <ProblemCard label="Hydraulic model" icon="◇" x={1380} y={720} delay={65}/>
      <div className="loss-flow">
        <div className="flow-main" />
        <div className="flow-leak" style={{height: interpolate(frame, [100, 260], [0, 230], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}} />
        <span style={{opacity: interpolate(frame, [150, 195], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>treated water</span>
        <em style={{opacity: interpolate(frame, [190, 240], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>revenue lost</em>
      </div>
      {frame > 205 && <Caption dark>Disconnected assets. Hidden losses. Rising NRW.</Caption>}
    </AbsoluteFill>
  );
};

const Introduce: React.FC = () => {
  const frame = useCurrentFrame();
  const p = spring({frame: frame - 20, fps: 30, config: {damping: 20, stiffness: 80}});
  // Settle the tilt back to flat so the real dashboard reads clearly.
  const tilt = interpolate(frame, [40, 150, 250], [1, 0.25, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const chips = interpolate(frame, [10, 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill className="scene navy" style={{opacity: fade(frame, 300)}}>
      <div className="brand-intro"><AquaLogo light/><span>Meet AquaWise — your whole network, alive.</span></div>
      <div className="upload-chips" style={{opacity: chips}}><span>GIS</span><span>Asset register</span><span>EPANET model</span><b>Unified ✓</b></div>
      <div className="app-stage" style={{transform: `perspective(2200px) rotateX(${tilt*8}deg) rotateY(${-tilt*9}deg) scale(${.78+p*.2}) translateY(${70-p*70}px)`, opacity: p}}>
        <AppFrame active="dashboard" title="Operations Dashboard" sub="Kisumu Water Network · 3,233 segments · 716 km">
          <DashboardView/>
        </AppFrame>
      </div>
      {frame > 200 && <Caption>One living view of every asset you own.</Caption>}
    </AbsoluteFill>
  );
};

const AssetJourney: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = spring({frame: frame - 10, fps: 30, config: {damping: 20, stiffness: 80}});
  const zoom = interpolate(frame, [40, 200], [1, 1.12], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const card = spring({frame: frame - 150, fps: 30, config: {damping: 17, stiffness: 95}});
  return (
    <AbsoluteFill className="scene navy" style={{opacity: fade(frame, 330)}}>
      <div className="app-stage flush" style={{opacity: enter, transform: `scale(${(0.92 + enter * 0.08) * zoom})`}}>
        <AppFrame active="gis" title="GIS Map" sub="Kisumu Water Supply Network · live operational view" flush>
          <GISWorkspace dash={frame * 4}/>
        </AppFrame>
      </div>
      <div className="float-card" style={{opacity: card, transform: `translateX(${80 - card * 80}px)`}}>
        <AssetPanel/>
      </div>
      {frame > 60 && frame < 150 && <div className="lens-eyebrow" style={{opacity: interpolate(frame,[60,90,140,150],[0,1,1,0])}}>ASSET MANAGEMENT</div>}
      {frame > 215 && <Caption>Know what you own — down to a single valve.</Caption>}
    </AbsoluteFill>
  );
};

const NRWDetection: React.FC = () => {
  const frame = useCurrentFrame();
  const enter = spring({frame: frame - 8, fps: 30, config: {damping: 20, stiffness: 80}});
  const zoom = interpolate(frame, [120, 300], [1, 1.25], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const board = spring({frame: frame - 175, fps: 30, config: {damping: 18, stiffness: 90}});
  const leakPulse = (frame % 36) / 36;
  const phrases = frame < 100 ? 'Detect the difference.' : frame < 200 ? 'Locate the leak.' : 'Protect the revenue.';
  return (
    <AbsoluteFill className="scene navy" style={{opacity: fade(frame, 330)}}>
      <div className="app-stage flush" style={{opacity: enter, transform: `scale(${(0.92 + enter * 0.08) * zoom}) translateY(${(zoom - 1) * -60}px)`}}>
        <AppFrame active="leaks" title="Leak Intelligence" sub="Anomaly detection · expected vs measured flow" flush>
          <GISWorkspace dash={frame * 5} leak leakPulse={leakPulse}/>
        </AppFrame>
      </div>
      <div className="float-card wide" style={{opacity: board, transform: `translateY(${80 - board * 80}px)`}}>
        <LeakPanel/>
      </div>
      <div className="word-swap" key={phrases}>{phrases}</div>
      {frame > 240 && <Caption>See exactly where water — and revenue — disappears.</Caption>}
    </AbsoluteFill>
  );
};

const Simulate:React.FC=()=>{
  const frame=useCurrentFrame();
  const enter = spring({frame: frame - 8, fps: 30, config: {damping: 20, stiffness: 80}});
  // Cursor glides to the Run-simulation button (~frame 70) then the state machine runs.
  const click = spring({frame: frame - 70, fps: 30, config: {damping: 12, stiffness: 150}});
  const sim = frame < 95 ? 'Ready to run' : frame < 185 ? 'Running…' : 'Simulation successful';
  const wave = interpolate(frame, [95, 185], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill className="scene navy" style={{opacity:fade(frame,360)}}>
    <div className="sim-eyebrow"><span>HYDRAULIC MODEL</span><h1>Decide with the model — not a guess.</h1></div>
    <div className="app-stage flush sim" style={{opacity: enter, transform: `scale(${0.9 + enter * 0.1})`}}>
      <AppFrame active="gis" title="GIS Map · Simulation" sub="Hazen-Williams · pressure-driven hydraulic run" flush>
        <GISWorkspace dash={frame * (3 + wave * 6)} sim={sim}/>
      </AppFrame>
      <div className="sim-wave" style={{opacity: sim === 'Running…' ? 0.9 : 0, transform: `scale(${0.2 + wave * 2.4})`}}/>
      <div className="ui-cursor" style={{left: `${78 - click * 6}%`, top: `${20 - click * 2}%`, transform: `scale(${1 - click * 0.15})`}}/>
    </div>
    {frame>270&&<Caption>Test the fix before a crew ever leaves the depot.</Caption>}
  </AbsoluteFill>;
};

const Action:React.FC=()=>{
  const frame=useCurrentFrame();
  const p=spring({frame:frame-20,fps:30,config:{damping:17,stiffness:95}});
  const stable=frame>125;
  return <AbsoluteFill className="scene navy" style={{opacity:fade(frame,240)}}>
    <div className="action-copy"><span>PRIORITIZED OPERATIONS</span><h1>Insight becomes action.</h1><p>Every intervention updates the asset history and strengthens the next decision.</p></div>
    <div className="action-queue" style={{opacity:p,transform:`translateX(${120-p*120}px)`}}>
      {[['PV-204','Isolate pressure zone','Assigned',CORAL],['P-1184','Inspect suspected leak','In progress',AMBER],['FM-032','Validate bulk flow','Scheduled',FLOW]].map(([id,task,status,color],i)=><div key={id} style={{transform:`translateY(${(1-p)*(i+1)*35}px)`}}><i style={{background:color}}/><b>{id}</b><span>{task}</span><em>{status}</em></div>)}
    </div>
    <div className="action-network" style={{opacity:interpolate(frame,[80,150],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}><GridNetwork stable={stable} zoom={.62}/></div>
    {frame>165&&<Caption>Better asset decisions. Lower water loss.</Caption>}
  </AbsoluteFill>;
};

const Lockup:React.FC=()=>{
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const p=spring({frame:frame-18,fps,config:{damping:18,stiffness:75}});
  const invert=interpolate(frame,[125,175],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
  return <AbsoluteFill className="scene lockup" style={{background:`rgb(${255-(244*invert)},${255-(239*invert)},${255-(223*invert)})`}}>
    <div className="halo" style={{transform:`translate(-50%,-50%) scale(${.7+p*.5})`,opacity:.65-invert*.3}}/>
    <div className="lockup-logo" style={{opacity:p,transform:`translate(-50%,-50%) scale(${.8+p*.2})`,color:invert>.5?'#fff':NAVY}}><AquaLogo light={invert<.5}/><p>Manage every asset. Understand every flow.<br/>Reduce non-revenue water.</p><strong>See it. Simulate it. Act.</strong></div>
  </AbsoluteFill>;
};

// Premium grade — film grain, vignette, cinematic letterbox and a slow light
// sweep, layered on top so every scene reads like a high-end product ad.
const FilmGrade: React.FC = () => {
  const frame = useCurrentFrame();
  const sweep = interpolate(frame % 240, [0, 240], [-30, 130]);
  const grainShift = (frame * 53) % 100;
  return (
    <AbsoluteFill className="film-grade" style={{pointerEvents: 'none'}}>
      <div className="film-vignette" />
      <div className="film-sweep" style={{transform: `translateX(${sweep}%) skewX(-18deg)`}} />
      <div className="film-grain" style={{backgroundPosition: `${grainShift}px ${(grainShift * 1.7) % 100}px`}} />
      <div className="film-bar film-bar-top" />
      <div className="film-bar film-bar-bottom" />
    </AbsoluteFill>
  );
};

export const AquaWiseTrailer:React.FC<{withAudio?: boolean}>=({withAudio = true})=> (
  <AbsoluteFill className="trailer">
    {withAudio && <>
      <Audio src={staticFile('audio/ambient.wav')} volume={0.34}/>
      <Sequence from={18}><Audio src={staticFile('audio/voiceover-01.mp3')} volume={1}/></Sequence>
      <Sequence from={225}><Audio src={staticFile('audio/voiceover-02.mp3')} volume={1}/></Sequence>
      <Sequence from={525}><Audio src={staticFile('audio/voiceover-03.mp3')} volume={1}/></Sequence>
      <Sequence from={825}><Audio src={staticFile('audio/voiceover-04.mp3')} volume={1}/></Sequence>
      <Sequence from={1155}><Audio src={staticFile('audio/voiceover-05.mp3')} volume={1}/></Sequence>
      <Sequence from={1485}><Audio src={staticFile('audio/voiceover-06.mp3')} volume={1}/></Sequence>
      <Sequence from={1840}><Audio src={staticFile('audio/voiceover-07.mp3')} volume={1}/></Sequence>
      <Sequence from={2080}><Audio src={staticFile('audio/voiceover-08.mp3')} volume={1}/></Sequence>
    </>}
    <Sequence from={0} durationInFrames={210}><HiddenNetwork/></Sequence>
    <Sequence from={210} durationInFrames={300}><NRWProblem/></Sequence>
    <Sequence from={510} durationInFrames={300}><Introduce/></Sequence>
    <Sequence from={810} durationInFrames={330}><AssetJourney/></Sequence>
    <Sequence from={1140} durationInFrames={330}><NRWDetection/></Sequence>
    <Sequence from={1470} durationInFrames={360}><Simulate/></Sequence>
    <Sequence from={1830} durationInFrames={240}><Action/></Sequence>
    <Sequence from={2070} durationInFrames={180}><Lockup/></Sequence>
    <FilmGrade/>
  </AbsoluteFill>
);
