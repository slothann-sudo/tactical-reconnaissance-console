import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  Crosshair,
  Navigation,
  Radio,
  Satellite,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "协同侦察实验控制台 | VEHICLE-01" },
      {
        name: "description",
        content: "有人车与多架无人机协同目标侦察实验的默认持续任务界面。",
      },
      { property: "og:title", content: "有人车—无人机协同侦察实验控制台" },
      {
        property: "og:description",
        content: "普通负荷下的有人车持续威胁判断与无人机前出侦察态势界面。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TacticalConsole,
});

type Target = {
  id: string;
  threat: "HIGH" | "MEDIUM";
  distance: string;
  velocity: string;
  source: string;
  bearing: string;
};

const targets: Target[] = [
  { id: "T01", threat: "HIGH", distance: "3.8 km", velocity: "+18 m/s", source: "VEHICLE", bearing: "042°" },
  { id: "T02", threat: "MEDIUM", distance: "2.6 km", velocity: "+11 m/s", source: "UAV-01", bearing: "068°" },
  { id: "T03", threat: "HIGH", distance: "5.1 km", velocity: "+23 m/s", source: "VEHICLE", bearing: "081°" },
];

const uavs = [
  { id: "UAV-01", zone: "A 区", direction: "NE / 046°", progress: 72 },
  { id: "UAV-02", zone: "B 区", direction: "E / 082°", progress: 58 },
  { id: "UAV-03", zone: "C 区", direction: "SE / 124°", progress: 41 },
];

function TacticalConsole() {
  const [selectedTarget, setSelectedTarget] = useState("T01");
  const [elapsedSeconds, setElapsedSeconds] = useState(2304);

  useEffect(() => {
    const timer = window.setInterval(() => setElapsedSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const time = new Date(elapsedSeconds * 1000).toISOString().slice(11, 19);

  return (
    <main className="console-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true"><Crosshair size={21} strokeWidth={1.5} /></div>
          <div>
            <div className="eyebrow">COOPERATIVE RECONNAISSANCE / EXP-03</div>
            <h1>有人车—无人机协同目标侦察</h1>
          </div>
        </div>
        <div className="top-statuses" aria-label="系统状态">
          <StatusCell label="PLATFORM" value="VEHICLE-01 / AUTO" />
          <StatusCell label="SECTOR" value="R03" />
          <StatusCell label="AIR UNITS" value="UAV × 3" />
          <StatusCell label="MISSION PHASE" value="FORWARD RECON" />
          <StatusCell label="SYSTEM" value="NORMAL" active />
          <StatusCell label="TASK TIME" value={time} mono />
        </div>
      </header>

      <section className="workspace">
        <section className="situation-panel" aria-labelledby="situation-heading">
          <div className="panel-heading map-heading">
            <div>
              <span className="section-index">01</span>
              <h2 id="situation-heading">综合任务态势图</h2>
              <span className="subcode">TACTICAL SITUATION / R03</span>
            </div>
            <div className="map-metrics">
              <span><i className="status-dot" />LINK STABLE</span>
              <span>GRID 500 M</span>
              <span>ZOOM 1:25K</span>
            </div>
          </div>
          <TacticalMap />
          <div className="map-legend" aria-label="态势图图例">
            <span><i className="legend-line solid" />已行驶路线</span>
            <span><i className="legend-line dashed" />规划路线</span>
            <span><i className="legend-ring" />搜索范围</span>
            <span><i className="legend-target" />探测目标</span>
            <span className="coordinates">N 39°54′18.2″ / E 116°23′41.7″</span>
          </div>
        </section>

        <aside className="uav-panel" aria-labelledby="uav-heading">
          <div className="panel-heading">
            <div>
              <span className="section-index">02</span>
              <h2 id="uav-heading">UAV 前出侦察</h2>
              <span className="subcode">3 UNITS / ALL ONLINE</span>
            </div>
            <Satellite size={18} strokeWidth={1.4} />
          </div>
          <div className="uav-summary">
            <span><i className="status-dot" />协同链路稳定</span>
            <span>延迟 24 ms</span>
          </div>
          <div className="uav-list">
            {uavs.map((uav, index) => <UavStatus key={uav.id} {...uav} index={index} />)}
          </div>
          <div className="passive-monitor">
            <ShieldCheck size={15} />
            <span>当前无人工介入请求</span>
          </div>
        </aside>
      </section>

      <section className="decision-zone" aria-labelledby="decision-heading">
        <div className="decision-prompt">
          <div className="prompt-topline">
            <span className="section-index">03</span>
            <span className="load-indicator">普通负荷 / 3 个候选目标</span>
          </div>
          <h2 id="decision-heading">当前哪个目标威胁最高？</h2>
          <p>依据实时距离、接近速度与多源侦察数据持续判断</p>
          <div className="assessment-state"><Activity size={14} />威胁评估持续进行中</div>
        </div>
        <div className="target-grid">
          {targets.map((target) => (
            <TargetCard
              key={target.id}
              target={target}
              selected={selectedTarget === target.id}
              onSelect={() => setSelectedTarget(target.id)}
            />
          ))}
        </div>
      </section>

      <footer className="system-strip">
        <span className="strip-title">SYS / EVENT LOG</span>
        <span><i className="status-dot" />VEHICLE-01：AUTO NAVIGATION ACTIVE</span>
        <span><i className="status-dot" />UAV NETWORK：3 UNITS ONLINE</span>
        <span><i className="status-dot" />FORWARD RECONNAISSANCE：ACTIVE</span>
        <span className="strip-clock">SYSTEM STATUS：NORMAL</span>
      </footer>
    </main>
  );
}

function StatusCell({ label, value, active, mono }: { label: string; value: string; active?: boolean; mono?: boolean }) {
  return (
    <div className="status-cell">
      <span>{label}</span>
      <strong className={`${active ? "is-active" : ""} ${mono ? "tabular" : ""}`}>{active && <i className="status-dot" />}{value}</strong>
    </div>
  );
}

function TargetCard({ target, selected, onSelect }: { target: Target; selected: boolean; onSelect: () => void }) {
  return (
    <button type="button" className={`target-card ${selected ? "selected" : ""}`} onClick={onSelect} aria-pressed={selected}>
      <span className="target-corner" aria-hidden="true" />
      <span className="target-title-row">
        <span className="target-id"><Crosshair size={18} strokeWidth={1.5} />{target.id}</span>
        <span className="threat-level">威胁 {target.threat}</span>
      </span>
      <span className="target-data">
        <DataPair label="距离" value={target.distance} />
        <DataPair label="接近速度" value={target.velocity} />
        <DataPair label="信息来源" value={target.source} />
        <DataPair label="方位" value={target.bearing} />
      </span>
      <span className="target-footer">
        <span>{selected ? "当前判断" : "选择目标"}</span>
        <span className="signal-bars"><i /><i /><i /><i /></span>
      </span>
    </button>
  );
}

function DataPair({ label, value }: { label: string; value: string }) {
  return <span className="data-pair"><small>{label}</small><b>{value}</b></span>;
}

function UavStatus({ id, zone, direction, progress, index }: { id: string; zone: string; direction: string; progress: number; index: number }) {
  return (
    <article className="uav-card">
      <div className="uav-card-head">
        <div><span className="unit-index">0{index + 1}</span><h3>{id}</h3></div>
        <span className="normal-state"><i className="status-dot" />侦察中</span>
      </div>
      <div className="uav-body">
        <MiniRadar index={index} />
        <dl>
          <div><dt>当前区域</dt><dd>{zone}</dd></div>
          <div><dt>飞行方向</dt><dd>{direction}</dd></div>
          <div><dt>任务进度</dt><dd>{progress}%</dd></div>
        </dl>
      </div>
      <div className="progress-track"><i style={{ width: `${progress}%` }} /></div>
      <div className="uav-card-foot"><Radio size={12} />正常执行当前侦察任务</div>
    </article>
  );
}

function MiniRadar({ index }: { index: number }) {
  const positions = [[40, 18], [53, 39], [26, 46]];
  const point = positions[index] ?? positions[0];
  return (
    <svg className="mini-radar" viewBox="0 0 72 72" aria-label="小型雷达扫描预览">
      <circle cx="36" cy="36" r="30" className="radar-boundary" />
      <circle cx="36" cy="36" r="19" className="radar-grid" />
      <path d="M36 6V66M6 36H66" className="radar-grid" />
      <path d="M36 36 L36 7 A29 29 0 0 1 61 50 Z" className="radar-sweep" />
      <circle cx={point[0]} cy={point[1]} r="2.5" className="radar-contact" />
      <path d="M33 40l3-9 3 9-3-2z" className="radar-unit" />
    </svg>
  );
}

function TacticalMap() {
  return (
    <div className="map-stage">
      <div className="map-scale north-mark"><span>N</span><Navigation size={18} fill="currentColor" /></div>
      <div className="map-scale scale-mark"><i />1 KM</div>
      <svg viewBox="0 0 1000 590" className="tactical-map" role="img" aria-label="车辆由西南起点沿规划路线向东北终点行进，三架无人机在前方不同区域进行侦察">
        <defs>
          <pattern id="minorGrid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" className="minor-grid" /></pattern>
          <pattern id="majorGrid" width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" fill="url(#minorGrid)" /><path d="M100 0H0V100" className="major-grid" /></pattern>
          <radialGradient id="vehicleSweep"><stop offset="0" className="sweep-start" /><stop offset="1" className="sweep-end" /></radialGradient>
          <linearGradient id="sectorFade"><stop className="sector-start" /><stop offset="1" className="sector-end" /></linearGradient>
          <filter id="softGlow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <marker id="arrowCyan" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" className="marker-cyan" /></marker>
          <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6Z" className="marker-green" /></marker>
        </defs>
        <rect width="1000" height="590" fill="url(#majorGrid)" />

        <g className="terrain">
          <path d="M-30 110C120 54 183 170 320 108S540 42 678 104 852 154 1040 68" />
          <path d="M-40 148C118 92 188 206 330 146S552 80 690 142 866 194 1040 105" />
          <path d="M-22 496C94 430 202 510 324 468S518 424 640 483 845 530 1040 438" />
          <path d="M40 250l112-38 76 34 102-35 86 32 105-48 98 25 118-36 93 46 140-28" />
        </g>
        <g className="sector-lines"><path d="M615 0V590" /><path d="M820 0V590" /><text x="630" y="34">SECTOR A</text><text x="835" y="34">SECTOR B / C</text></g>

        <path d="M94 502 C185 470 203 412 306 397 S432 405 485 335" className="route-shadow" />
        <path d="M94 502 C185 470 203 412 306 397 S432 405 485 335" className="route-complete" markerEnd="url(#arrowGreen)" />
        <path d="M485 335 C563 267 611 278 677 224 S799 176 918 84" className="route-future" markerEnd="url(#arrowCyan)" />

        <g transform="translate(94 502)" className="point-label"><circle r="8" /><circle r="3" /><path d="M12 0h48" /><text x="67" y="5">START / S-01</text></g>
        <g transform="translate(918 84)" className="point-label end"><circle r="10" /><path d="M-5-5l10 10m0-10L-5 5" /><path d="M-13 14v20" /><text x="-50" y="52">END / E-07</text></g>

        <g transform="translate(485 335)">
          <circle r="95" className="vehicle-radar-ring" />
          <circle r="62" className="vehicle-radar-inner" />
          <path d="M0 0L-21-90A95 95 0 0 1 80-51Z" fill="url(#vehicleSweep)" className="vehicle-sweep" />
          <g className="vehicle-symbol" filter="url(#softGlow)"><rect x="-15" y="-10" width="30" height="20" rx="2" /><path d="M-9-10v-7h18v7M0-17v-11M-20-7h-5v14h5M20-7h5v14h-5" /></g>
          <path d="M0-35v-42" className="heading-vector" markerEnd="url(#arrowGreen)" />
          <g className="vehicle-tag"><rect x="31" y="13" width="116" height="38" /><text x="42" y="29">VEHICLE-01</text><text x="42" y="43">AUTO / HDG 044°</text></g>
        </g>

        <UavMapUnit x={650} y={160} id="UAV-01" zone="A" rotation={18} />
        <UavMapUnit x={795} y={265} id="UAV-02" zone="B" rotation={8} />
        <UavMapUnit x={878} y={404} id="UAV-03" zone="C" rotation={-24} />

        <path d="M505 321Q570 230 646 166M514 342Q644 350 790 273M499 350Q685 467 870 412" className="coordination-link" />

        <TargetMarker x={558} y={225} id="T01" />
        <TargetMarker x={714} y={366} id="T02" />
        <TargetMarker x={839} y={136} id="T03" />

        <g className="map-readout"><text x="22" y="34">R03 / LIVE TACTICAL FEED</text><text x="22" y="52">REF: 39.9042N 116.4074E</text></g>
        <g className="map-ticks"><path d="M0 12h16M0 48h9M0 84h9M0 120h16M984 12h16M991 48h9M991 84h9M984 120h16" /></g>
      </svg>
    </div>
  );
}

function UavMapUnit({ x, y, id, zone, rotation }: { x: number; y: number; id: string; zone: string; rotation: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation})`} className="uav-map-unit">
      <path d="M0 0L-70-44A84 84 0 0 1 70-44Z" fill="url(#sectorFade)" className="search-sector" />
      <path d="M-70-44A84 84 0 0 1 70-44" className="search-arc" />
      <circle r="5" /><path d="M-17 0H17M0-8V12M-11-5L11 5M11-5L-11 5" />
      <path d="M0-12v-38" className="uav-vector" markerEnd="url(#arrowCyan)" />
      <g transform={`rotate(${-rotation})`}><rect x="16" y="10" width="92" height="34" /><text x="25" y="25">{id}</text><text x="25" y="38">AREA {zone} / RECON</text></g>
    </g>
  );
}

function TargetMarker({ x, y, id }: { x: number; y: number; id: string }) {
  return (
    <g transform={`translate(${x} ${y})`} className="map-target">
      <circle r="16" /><circle r="5" /><path d="M-23 0h12M11 0h12M0-23v12M0 11v12" />
      <rect x="21" y="-13" width="48" height="24" /><text x="30" y="4">{id}</text>
    </g>
  );
}