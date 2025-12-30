import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, CheckCircle, XCircle, Heart } from 'lucide-react';

/**
 * 💡 화면 여백 처리 및 반응형 대응:
 * 1. 고정된 width 대신 부모 컨테이너의 100%를 사용하도록 변경했습니다.
 * 2. 캔버스의 비율(2:1)을 유지하면서 화면 크기에 따라 리사이징되도록 useEffect를 추가했습니다.
 */

// ==================================================================================
// 🔧 문제 데이터
// ==================================================================================
const QUIZ_DATA = [
  {
    question: "다음 중 질서 교단·이단심문청·성기사에 대한 설명으로 가장 정확한 것은?",
    options: ["성기사는 독립적으로 사고하고 결정하도록 훈련된다", "이단심문관은 재판 없이 처형할 권한이 없다", "맹세를 어기면 신성력 감소라는 구조적 제재가 가해질 수 있다", "이단으로 판명된 자는 반드시 즉시 사형된다"],
    answer: 2
  },
  {
    question: "다크렐름에서 전지한 존재가 존재하지 않는다는 설정이 게임 시스템으로 구현된 방식은?",
    options: ["신은 모든 것을 항상 볼 수 있지만 개입만 제한된다", "신은 대주교 이상 유닛을 통해서만 미래를 예지할 수 있다", "신은 신도를 통해서만 정보를 얻을 수 있으며, 신도가 보지 못한 일은 알 수 없다", "신은 기도 횟수가 일정 수를 넘기면 전지 상태에 근접한다"],
    answer: 2
  },
  {
    question: "다음 중 신앙심에 대한 설명으로 옳은 것은?",
    options: ["독실한 상태가 되면 신앙심이 자동으로 상승한다", "신앙심이 높으면 신성력을 더 잘 활용하며 신의 음성을 잘 인식한다", "신앙심은 지력과 반비례한다", "신앙심이 낮은 유닛은 명령을 더 잘 따른다"],
    answer: 1
  },
  {
    question: "다음 중 [헤러틱 슬레이어] 아타나스의 최종 엔딩에 대한 설명으로 옳은 것은?",
    options: ["아타나스는 질서의 영웅으로 승천한다", "아타나스는 믿음을 끝까지 지켜 사도의 자격을 유지한다", "로클렘은 신성 훼손을 막기 위해 아타나스를 지옥으로 보낸다", "아타나스는 로클렘의 목을 따고 새로운 유일신이 된다"],
    answer: 2
  },
  {
    question: "파파비오에 대한 설명으로 옳지 않은 것은?",
    options: ["[삭제]", "[편집]", "[편집]", "[제거]"],
    answer: 3
  }
];

const BRACHIO_PIXELS = [
  [0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0], 
  [0,0,0,0,0,0,0,0,0,0,0,0,1,2,1,1,0,0], 
  [0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0], 
  [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0], 
  [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0], 
  [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0], 
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0], 
  [0,0,0,0,1,1,0,1,1,0,0,1,1,0,1,1,0,0], 
  [0,0,0,0,3,3,0,3,3,0,0,3,3,0,3,3,0,0], 
];

const ALLO_PIXELS = [
  [0,0,0,0,0,0,0,1,1,1,1,0,0],
  [0,0,0,0,0,0,1,1,1,2,1,0,0], 
  [0,0,0,0,0,0,1,1,1,1,3,0,0], 
  [0,0,0,0,0,0,1,1,1,1,0,0,0],
  [0,0,0,0,1,1,1,1,1,1,0,0,0],
  [0,1,1,1,1,1,1,1,1,1,0,0,0],
  [1,1,1,1,1,1,1,1,1,1,0,0,0],
  [1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,1,1,0,0,0,1,1,0,0,0,0],
  [0,0,3,3,0,0,0,3,3,0,0,0,0],
];

const METEOR_PIXELS = [
  [0,0,1,1,1,0,0],
  [0,1,1,2,1,1,0],
  [1,1,2,1,1,1,1],
  [1,1,1,1,2,1,1],
  [0,1,1,1,1,1,0],
  [0,0,1,1,1,0,0],
];

export default function App() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [gameState, setGameState] = useState('START');
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  
  const requestRef = useRef();
  const gameTimeRef = useRef(0);
  const bgOffsetRef = useRef(0);
  const meteorPosRef = useRef({ x: 0, y: -50 });
  const finalDistanceRef = useRef(0);
  const lastQuizTimeRef = useRef(0);
  
  // 기준 크기 (좌표 계산용)
  const BASE_WIDTH = 800;
  const BASE_HEIGHT = 400;
  const GROUND_Y = 320;
  const RUN_SPEED = 4;
  const PIXEL_SIZE = 6; 

  // 화면 크기 조절 대응
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        // 2:1 비율 유지
        setDimensions({ width: width, height: width / 2 });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const drawPixelArt = (ctx, pixels, startX, startY, colorMap, scale = 1, flip = false) => {
    pixels.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel !== 0) {
          ctx.fillStyle = colorMap[pixel] || '#000';
          const drawX = flip 
            ? startX + (row.length - 1 - x) * scale 
            : startX + x * scale;
          const drawY = startY + y * scale;
          ctx.fillRect(Math.floor(drawX), Math.floor(drawY), Math.ceil(scale), Math.ceil(scale));
        }
      });
    });
  };

  const loop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // 비율 계산 (좌표 보정용)
    const scale = dimensions.width / BASE_WIDTH;
    const currentGroundY = GROUND_Y * scale;

    ctx.fillStyle = '#A5F3FC'; 
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, currentGroundY, dimensions.width, 10 * scale);
    ctx.fillStyle = '#D2B48C';
    ctx.fillRect(0, currentGroundY + (10 * scale), dimensions.width, dimensions.height - currentGroundY);

    if (gameState === 'RUNNING') {
      bgOffsetRef.current += RUN_SPEED;
      gameTimeRef.current += 1;
      
      if (currentQuizIndex < QUIZ_DATA.length) {
        if (gameTimeRef.current - lastQuizTimeRef.current > 150) {
           setGameState('QUIZ');
        }
      } else {
        finalDistanceRef.current += RUN_SPEED;
        if (finalDistanceRef.current > 350) setGameState('WIN');
      }
    } else if (gameState === 'METEOR') {
      meteorPosRef.current.y += 10;
      meteorPosRef.current.x += 2;
      if (meteorPosRef.current.y > GROUND_Y - 40) setGameState('GAMEOVER');
    }

    const bounce = (gameState === 'RUNNING' || gameState === 'WIN') ? Math.sin(gameTimeRef.current * 0.2) * 4 : 0;
    let playerX = 80;
    if (gameState === 'WIN') playerX = Math.min(80 + finalDistanceRef.current, BASE_WIDTH / 2 - 80);

    // 플레이어 (스케일 적용)
    drawPixelArt(ctx, BRACHIO_PIXELS, playerX * scale, (GROUND_Y - (BRACHIO_PIXELS.length * PIXEL_SIZE) - bounce) * scale, 
      { 1: '#67E8F9', 2: '#083344', 3: '#22D3EE' }, PIXEL_SIZE * scale);

    if (currentQuizIndex >= QUIZ_DATA.length) {
      const alloX = Math.max(BASE_WIDTH - 150, BASE_WIDTH / 2 + 20);
      drawPixelArt(ctx, ALLO_PIXELS, alloX * scale, (GROUND_Y - (ALLO_PIXELS.length * PIXEL_SIZE) - bounce) * scale, 
        { 1: '#F472B6', 2: '#500724', 3: '#EC4899' }, PIXEL_SIZE * scale, true);
      
      if (gameState === 'WIN') {
        ctx.font = `${40 * scale}px Arial`;
        ctx.fillText('❤️', (BASE_WIDTH / 2 - 20) * scale, (GROUND_Y - 150) * scale);
      }
    }

    if (gameState === 'METEOR') {
      drawPixelArt(ctx, METEOR_PIXELS, meteorPosRef.current.x * scale, meteorPosRef.current.y * scale, 
        { 1: '#EA580C', 2: '#7C2D12' }, PIXEL_SIZE * 1.5 * scale);
    }

    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, currentQuizIndex, dimensions]);

  const startGame = () => {
    setGameState('RUNNING');
    setCurrentQuizIndex(0);
    gameTimeRef.current = 0;
    bgOffsetRef.current = 0;
    finalDistanceRef.current = 0;
    lastQuizTimeRef.current = 0;
    meteorPosRef.current = { x: 140, y: -100 };
  };

  const handleAnswer = (idx) => {
    if (idx === QUIZ_DATA[currentQuizIndex].answer) {
      setCurrentQuizIndex(p => p + 1);
      lastQuizTimeRef.current = gameTimeRef.current;
      setGameState('RUNNING');
    } else {
      meteorPosRef.current = { x: 140, y: -100 };
      setGameState('METEOR');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'monospace', padding: '1rem' }}>
      <div 
        ref={containerRef}
        style={{ 
          position: 'relative', 
          border: '8px solid #0891b2', 
          borderRadius: '0.5rem', 
          overflow: 'hidden', 
          backgroundColor: 'black', 
          width: '100%', 
          maxWidth: '800px', 
          aspectRatio: '2 / 1' 
        }}
      >
        <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} />

        {gameState === 'START' && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h1 style={{ fontSize: 'min(5vw, 2rem)', fontWeight: 'bold', marginBottom: '1.5rem', color: '#22d3ee' }}>BCHIPANDO'S LOVE QUEST</h1>
            <button onClick={startGame} style={{ padding: '0.75rem 1.75rem', backgroundColor: '#06b6d4', border: 'none', borderRadius: '9999px', color: 'white', fontSize: 'min(4vw, 1.125rem)', fontWeight: 'bold', cursor: 'pointer' }}>
              START ADVENTURE
            </button>
          </div>
        )}

        {gameState === 'QUIZ' && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', padding: '1.25rem', width: '100%', maxWidth: '500px', border: '4px solid #06b6d4' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#0891b2' }}>Quiz {currentQuizIndex + 1}</h2>
              </div>
              <p style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem', lineHeight: 1.2 }}>{QUIZ_DATA[currentQuizIndex].question}</p>
              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {QUIZ_DATA[currentQuizIndex].options.map((opt, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleAnswer(i)} 
                    style={{ width: '100%', textAlign: 'left', padding: '0.6rem', borderRadius: '0.5rem', border: '2px solid #f1f5f9', backgroundColor: 'white', color: '#334155', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    <span style={{ marginRight: '0.5rem', color: '#06b6d4' }}>{i+1}.</span> {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {gameState === 'GAMEOVER' && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(69,10,10,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <XCircle size={dimensions.width * 0.08} color="#ef4444" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: 'min(6vw, 2rem)', fontWeight: '900', marginBottom: '1.5rem' }}>EXTINCTION...</h2>
            <button onClick={startGame} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#dc2626', border: 'none', borderRadius: '9999px', color: 'white', fontSize: '1.125rem', fontWeight: 'bold', cursor: 'pointer' }}>RETRY</button>
          </div>
        )}

        {gameState === 'WIN' && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(236,72,153,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={dimensions.width * 0.08} color="#ec4899" fill="#ec4899" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: 'min(6vw, 2rem)', fontWeight: '900' }}>HAPPY ENDING!</h2>
            <button onClick={startGame} style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', backgroundColor: 'white', border: 'none', borderRadius: '9999px', color: '#db2777', fontSize: '1.125rem', fontWeight: 'bold', cursor: 'pointer' }}>PLAY AGAIN</button>
          </div>
        )}
      </div>
    </div>
  );
}
