// DoodleBackground.jsx
// SVG-based scientific doodle backgrounds for BioLearn BD

export const DoodleBackground = () => (
  <div
    aria-hidden="true"
    style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 0,
      overflow: 'hidden',
    }}
  >
    <svg
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: 0.10 }}
    >
      {/* DNA Double Helix - left side */}
      <g stroke="#8BBDB0" strokeWidth="1.2" fill="none">
        <path d="M 40 20 C 55 35, 25 55, 40 70 C 55 85, 25 105, 40 120 C 55 135, 25 155, 40 170 C 55 185, 25 205, 40 220" />
        <path d="M 60 20 C 45 35, 75 55, 60 70 C 45 85, 75 105, 60 120 C 45 135, 75 155, 60 170 C 45 185, 75 205, 60 220" />
        <line x1="40" y1="45" x2="60" y2="45" strokeWidth="1" />
        <line x1="40" y1="70" x2="60" y2="70" strokeWidth="1" />
        <line x1="40" y1="95" x2="60" y2="95" strokeWidth="1" />
        <line x1="40" y1="120" x2="60" y2="120" strokeWidth="1" />
        <line x1="40" y1="145" x2="60" y2="145" strokeWidth="1" />
        <line x1="40" y1="170" x2="60" y2="170" strokeWidth="1" />
        <line x1="40" y1="195" x2="60" y2="195" strokeWidth="1" />
      </g>

      {/* Benzene / Hexagonal molecular ring - top right */}
      <g stroke="#8BBDB0" strokeWidth="1.2" fill="none" transform="translate(300, 30)">
        <polygon points="0,-24 20.8,-12 20.8,12 0,24 -20.8,12 -20.8,-12" />
        <line x1="0" y1="-24" x2="0" y2="-14" />
        <line x1="20.8" y1="-12" x2="12" y2="-7" />
        <line x1="20.8" y1="12" x2="12" y2="7" />
        <line x1="0" y1="24" x2="0" y2="14" />
        <line x1="-20.8" y1="12" x2="-12" y2="7" />
        <line x1="-20.8" y1="-12" x2="-12" y2="-7" />
        {/* Connected ring */}
        <polygon points="0,-12 10.4,-6 10.4,6 0,12 -10.4,6 -10.4,-6" />
      </g>

      {/* Animal Cell - large circle with nucleus */}
      <g stroke="#8BBDB0" strokeWidth="1.2" fill="none" transform="translate(500, 80)">
        <ellipse cx="0" cy="0" rx="55" ry="48" />
        <ellipse cx="-5" cy="-3" rx="20" ry="17" />
        {/* Mitochondria */}
        <ellipse cx="25" cy="20" rx="12" ry="7" transform="rotate(30, 25, 20)" />
        <path d="M 20 20 Q 25 16 30 20" strokeWidth="0.8" />
        {/* Vacuoles */}
        <circle cx="-28" cy="18" r="8" />
        <circle cx="30" cy="-25" r="6" />
        <circle cx="-20" cy="-28" r="5" />
      </g>

      {/* Atom symbol - bottom left */}
      <g stroke="#B8D8CF" strokeWidth="1.2" fill="none" transform="translate(130, 350)">
        <circle cx="0" cy="0" r="6" fill="#8BBDB0" stroke="none" opacity="0.4" />
        <ellipse cx="0" cy="0" rx="40" ry="15" />
        <ellipse cx="0" cy="0" rx="40" ry="15" transform="rotate(60)" />
        <ellipse cx="0" cy="0" rx="40" ry="15" transform="rotate(120)" />
      </g>

      {/* Plant leaf - top center */}
      <g stroke="#8BBDB0" strokeWidth="1.2" fill="none" transform="translate(620, 20)">
        <path d="M 0 60 C -30 40, -40 10, 0 0 C 40 10, 30 40, 0 60Z" />
        <line x1="0" y1="60" x2="0" y2="5" />
        <path d="M 0 45 C -10 38, -18 32, -22 28" />
        <path d="M 0 35 C 10 28, 18 22, 22 18" />
        <path d="M 0 55 C -6 48, -10 42, -12 38" />
      </g>

      {/* Bacteria shapes - scattered */}
      <g stroke="#B8D8CF" strokeWidth="1" fill="none">
        <ellipse cx="200" cy="300" rx="18" ry="8" transform="rotate(45, 200, 300)" />
        <line x1="200" y1="295" x2="200" y2="285" transform="rotate(45, 200, 295)" strokeWidth="0.8" />
        <line x1="200" y1="308" x2="200" y2="318" transform="rotate(45, 200, 308)" strokeWidth="0.8" />

        <ellipse cx="750" cy="200" rx="22" ry="9" transform="rotate(-20, 750, 200)" />
        <path d="M 762 196 Q 770 194 775 192" strokeWidth="0.8" />

        <ellipse cx="850" cy="350" rx="16" ry="7" />
        <line x1="862" y1="348" x2="872" y2="346" strokeWidth="0.8" />
      </g>

      {/* Test tube - right side */}
      <g stroke="#8BBDB0" strokeWidth="1.2" fill="none" transform="translate(800, 50)">
        <path d="M -8 0 L -8 50 Q -8 68 0 68 Q 8 68 8 50 L 8 0" />
        <line x1="-12" y1="0" x2="12" y2="0" />
        <path d="M -6 48 Q 0 55 6 48" strokeWidth="0.8" />
        <line x1="-7" y1="38" x2="7" y2="38" strokeWidth="0.6" opacity="0.6" />
      </g>

      {/* Chromosome (X shape) */}
      <g stroke="#8BBDB0" strokeWidth="1.5" fill="none" transform="translate(400, 320)">
        <path d="M -15 -30 C -5 -15, 5 -15, 15 -30" />
        <path d="M -15 30 C -5 15, 5 15, 15 30" />
        <path d="M -30 -15 C -15 -5, -15 5, -30 15" />
        <path d="M 30 -15 C 15 -5, 15 5, 30 15" />
        <circle cx="0" cy="0" r="5" />
      </g>

      {/* Microscope outline - far right */}
      <g stroke="#8BBDB0" strokeWidth="1.2" fill="none" transform="translate(900, 250)">
        {/* Eyepiece */}
        <rect x="-6" y="-60" width="12" height="20" rx="2" />
        {/* Body tube */}
        <rect x="-5" y="-40" width="10" height="30" />
        {/* Revolving nosepiece */}
        <ellipse cx="0" cy="-10" rx="14" ry="5" />
        {/* Objective lens */}
        <line x1="0" y1="-10" x2="8" y2="10" />
        <ellipse cx="8" cy="12" rx="5" ry="3" transform="rotate(20, 8, 12)" />
        {/* Stage */}
        <rect x="-20" y="20" width="40" height="6" rx="1" />
        {/* Arm */}
        <path d="M -4 -40 C -18 -20, -20 10, -20 22" />
        {/* Base */}
        <ellipse cx="-10" cy="45" rx="20" ry="6" />
      </g>

      {/* Additional benzene rings - molecular chain */}
      <g stroke="#B8D8CF" strokeWidth="1" fill="none" transform="translate(220, 50)">
        <polygon points="0,-16 13.9,-8 13.9,8 0,16 -13.9,8 -13.9,-8" />
        <polygon points="27.8,-16 41.7,-8 41.7,8 27.8,16 13.9,8 13.9,-8" />
        <line x1="13.9" y1="-8" x2="13.9" y2="8" />
      </g>

      {/* Botanical flower sketch */}
      <g stroke="#B8D8CF" strokeWidth="1" fill="none" transform="translate(680, 320)">
        <circle cx="0" cy="0" r="8" />
        <ellipse cx="0" cy="-22" rx="8" ry="14" />
        <ellipse cx="0" cy="-22" rx="8" ry="14" transform="rotate(72, 0, 0)" />
        <ellipse cx="0" cy="-22" rx="8" ry="14" transform="rotate(144, 0, 0)" />
        <ellipse cx="0" cy="-22" rx="8" ry="14" transform="rotate(216, 0, 0)" />
        <ellipse cx="0" cy="-22" rx="8" ry="14" transform="rotate(288, 0, 0)" />
        <line x1="0" y1="8" x2="0" y2="55" />
        <path d="M 0 35 C 15 28 25 20 20 10" />
      </g>

      {/* Small scattered dots - organic feel */}
      <g fill="#8BBDB0" opacity="0.5">
        <circle cx="150" cy="150" r="2" />
        <circle cx="350" cy="400" r="1.5" />
        <circle cx="600" cy="150" r="2" />
        <circle cx="750" cy="380" r="1.5" />
        <circle cx="100" cy="400" r="2" />
        <circle cx="480" cy="80" r="1.5" />
        <circle cx="900" cy="150" r="2" />
      </g>
    </svg>
  </div>
);

export const DoodleBackgroundLight = () => (
  <div
    aria-hidden="true"
    style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 0,
      overflow: 'hidden',
    }}
  >
    <svg
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: 0.08 }}
    >
      {/* Sparse: just a few key doodles */}

      {/* Hexagonal molecule - left */}
      <g stroke="#8BBDB0" strokeWidth="1" fill="none" transform="translate(80, 60)">
        <polygon points="0,-20 17.3,-10 17.3,10 0,20 -17.3,10 -17.3,-10" />
        <polygon points="0,-10 8.7,-5 8.7,5 0,10 -8.7,5 -8.7,-5" />
      </g>

      {/* Plant leaf - right */}
      <g stroke="#B8D8CF" strokeWidth="1" fill="none" transform="translate(880, 40)">
        <path d="M 0 50 C -25 33, -32 8, 0 0 C 32 8, 25 33, 0 50Z" />
        <line x1="0" y1="50" x2="0" y2="4" />
      </g>

      {/* DNA fragment - bottom left */}
      <g stroke="#B8D8CF" strokeWidth="1" fill="none" transform="translate(50, 280)">
        <path d="M 0 0 C 15 15, -15 35, 0 50 C 15 65, -15 85, 0 100" />
        <path d="M 20 0 C 5 15, 35 35, 20 50 C 5 65, 35 85, 20 100" />
        <line x1="0" y1="25" x2="20" y2="25" strokeWidth="0.8" />
        <line x1="0" y1="50" x2="20" y2="50" strokeWidth="0.8" />
        <line x1="0" y1="75" x2="20" y2="75" strokeWidth="0.8" />
      </g>

      {/* Atom - top right */}
      <g stroke="#B8D8CF" strokeWidth="1" fill="none" transform="translate(850, 200)">
        <circle cx="0" cy="0" r="4" fill="#8BBDB0" stroke="none" opacity="0.4" />
        <ellipse cx="0" cy="0" rx="30" ry="11" />
        <ellipse cx="0" cy="0" rx="30" ry="11" transform="rotate(60)" />
        <ellipse cx="0" cy="0" rx="30" ry="11" transform="rotate(120)" />
      </g>

      {/* Bacteria - bottom right */}
      <g stroke="#B8D8CF" strokeWidth="1" fill="none">
        <ellipse cx="820" cy="340" rx="15" ry="6" transform="rotate(30, 820, 340)" />
        <line x1="830" y1="337" x2="840" y2="334" strokeWidth="0.7" transform="rotate(30, 830, 337)" />
      </g>
    </svg>
  </div>
);
