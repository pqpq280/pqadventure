import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, CheckCircle, XCircle, Heart } from 'lucide-react';

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
    options: ["[편집]", "[삭제]", "[편집]", "[제거]"],
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
  
  const stateRef = useRef({
    gameState: 'START',
    currentQuizIndex: 0,
    gameTime: 0,
    lastQuizTime: 0,
    finalDistance: 0,
    meteorPos: { x: 140, y: -100 }
  });

  const BASE_WIDTH = 800;
  const BASE_HEIGHT = 400;
  const RUN_SPEED = 7; 
  const PIXEL_SIZE = 6; 
  const QUIZ_INTERVAL = 80; 

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        const vh = window.innerHeight;
        const targetHeight = Math.min(width * 0.65, vh * 0.6); 
        setDimensions({ width: width, height: targetHeight });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    stateRef.current.gameState = gameState;
    stateRef.current.currentQuizIndex = currentQuizIndex;
  }, [gameState, currentQuizIndex]);

  const drawPixelArt = (ctx, pixels, startX, startY, colorMap, scale = 1, flip = false) => {
    pixels.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel !== 0) {
          ctx.fillStyle = colorMap[pixel] || '#000';
          const drawX = flip ? startX + (row.length - 1 - x) * scale : startX + x * scale;
          const drawY = startY + y * scale;
          ctx.fillRect(Math.floor(drawX), Math.floor(drawY), Math.ceil(scale), Math.ceil(scale));
        }
      });
    });
  };

  useEffect(() => {
    let animationId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      const { gameState: curState, currentQuizIndex: curIdx, gameTime, lastQuizTime, finalDistance, meteorPos } = stateRef.current;
      const scaleX = dimensions.width / BASE_WIDTH;
      const scaleY = dimensions.height / BASE_HEIGHT;
      const scale = Math.min(scaleX, scaleY);
      
      const currentGroundY = dimensions.height - (80 * scaleY);

      ctx.fillStyle = '#A5F3FC'; 
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(0, currentGroundY, dimensions.width, 10 * scale);
      ctx.fillStyle = '#D2B48C';
      ctx.fillRect(0, currentGroundY + (10 * scale), dimensions.width, dimensions.height - currentGroundY);

      if (curState === 'RUNNING') {
        stateRef.current.gameTime += 1;
        if (curIdx < QUIZ_DATA.length) {
          if (stateRef.current.gameTime - lastQuizTime > QUIZ_INTERVAL) {
            setGameState('QUIZ');
          }
        } else {
          stateRef.current.finalDistance += RUN_SPEED;
          if (stateRef.current.finalDistance > 300) setGameState('WIN');
        }
      } else if (curState === 'METEOR') {
        stateRef.current.meteorPos.y += 18 * scale;
        stateRef.current.meteorPos.x += 3 * scale;
        if (stateRef.current.meteorPos.y > currentGroundY - (30 * scale)) setGameState('GAMEOVER');
      }

      const bounce = (curState === 'RUNNING' || curState === 'WIN') ? Math.sin(stateRef.current.gameTime * 0.4) * 6 * scale : 0;
      let playerX = 60 * scaleX;
      if (curState === 'WIN') playerX = Math.min(playerX + (finalDistance * scaleX), dimensions.width / 2 - (50 * scaleX));

      drawPixelArt(ctx, BRACHIO_PIXELS, playerX, currentGroundY - (BRACHIO_PIXELS.length * PIXEL_SIZE * scale) - bounce, 
        { 1: '#67E8F9', 2: '#083344', 3: '#22D3EE' }, PIXEL_SIZE * scale);

      if (curIdx >= QUIZ_DATA.length) {
        const alloX = dimensions.width - (120 * scaleX);
        drawPixelArt(ctx, ALLO_PIXELS, alloX, currentGroundY - (ALLO_PIXELS.length * PIXEL_SIZE * scale) - bounce, 
          { 1: '#F472B6', 2: '#500724', 3: '#EC4899' }, PIXEL_SIZE * scale, true);
        if (curState === 'WIN') {
          ctx.font = `${30 * scale}px Arial`;
          ctx.fillText('❤️', dimensions.width / 2 - (15 * scale), currentGroundY - (100 * scale));
        }
      }

      if (curState === 'METEOR') {
        drawPixelArt(ctx, METEOR_PIXELS, meteorPos.x * scaleX, meteorPos.y, 
          { 1: '#EA580C', 2: '#7C2D12' }, PIXEL_SIZE * 1.5 * scale);
      }

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [dimensions, gameState]);

  const startGame = () => {
    stateRef.current = {
      gameState: 'RUNNING',
      currentQuizIndex: 0,
      gameTime: 0,
      lastQuizTime: 0,
      finalDistance: 0,
      meteorPos: { x: 140, y: -100 }
    };
    setCurrentQuizIndex(0);
    setGameState('RUNNING');
  };

  const handleAnswer = (idx) => {
    if (idx === QUIZ_DATA[currentQuizIndex].answer) {
      const nextIdx = currentQuizIndex + 1;
      stateRef.current.lastQuizTime = stateRef.current.gameTime;
      stateRef.current.currentQuizIndex = nextIdx;
      setCurrentQuizIndex(nextIdx);
      setGameState('RUNNING');
    } else {
      stateRef.current.meteorPos = { x: 140, y: -50 };
      setGameState('METEOR');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: 'white', fontFamily: 'sans-serif', overflow: 'hidden', touchAction: 'none', padding: '10px' }}>
      <div ref={containerRef} style={{ position: 'relative', width: '100%', maxWidth: '800px', height: dimensions.height, backgroundColor: '#000', overflow: 'hidden', borderRadius: '1rem', border: '4px solid #0891b2' }}>
        <canvas ref={canvasRef} width={dimensions.width} height={dimensions.height} style={{ display: 'block' }} />

        {gameState === 'START' && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
            <h1 style={{ fontSize: 'min(9vw, 2.5rem)', fontWeight: '900', marginBottom: '25px', color: '#22d3ee', letterSpacing: '-1px' }}>브키판도의 모험</h1>
            <button onClick={startGame} style={{ padding: '15px 40px', backgroundColor: '#06b6d4', border: 'none', borderRadius: '50px', color: 'white', fontSize: '1.4rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 6px 20px rgba(6,182,212,0.5)' }}>모험 시작</button>
          </div>
        )}

        {gameState === 'QUIZ' && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '1.25rem', padding: '20px', width: '95%', maxWidth: '500px', border: '4px solid #06b6d4', maxHeight: '95%', overflowY: 'auto' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#0891b2', marginBottom: '8px', textTransform: 'uppercase' }}>QUESTION {currentQuizIndex + 1} / {QUIZ_DATA.length}</p>
              <p style={{ fontSize: 'min(5vw, 1.25rem)', fontWeight: '800', color: '#0f172a', marginBottom: '20px', lineHeight: '1.4' }}>{QUIZ_DATA[currentQuizIndex].question}</p>
              <div style={{ display: 'grid', gap: '10px' }}>
                {QUIZ_DATA[currentQuizIndex].options.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(i)} style={{ textAlign: 'left', padding: '14px 18px', borderRadius: '1rem', border: '2px solid #e2e8f0', backgroundColor: '#f8fafc', color: '#1e293b', fontWeight: '700', fontSize: 'min(4.2vw, 1rem)', cursor: 'pointer', lineHeight: '1.3', display: 'flex', alignItems: 'flex-start' }} onTouchStart={(e) => e.currentTarget.style.backgroundColor = '#e0f2fe'} onTouchEnd={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}>
                    <span style={{ color: '#06b6d4', marginRight: '10px', flexShrink: 0 }}>{i + 1}.</span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {(gameState === 'GAMEOVER' || gameState === 'WIN') && (
           <div style={{ position: 'absolute', inset: 0, backgroundColor: gameState === 'WIN' ? 'rgba(236,72,153,0.6)' : 'rgba(69,10,10,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
             {gameState === 'WIN' ? <Heart size={80} color="white" fill="white" /> : <XCircle size={80} color="#ef4444" />}
             <h2 style={{ fontSize: '3rem', fontWeight: '900', color: 'white', margin: '20px 0' }}>{gameState === 'WIN' ? 'HAPPY ENDING!' : '멸종했습니다...'}</h2>
             <button onClick={startGame} style={{ padding: '15px 45px', backgroundColor: 'white', color: gameState === 'WIN' ? '#ec4899' : '#000', borderRadius: '50px', fontWeight: '900', border: 'none', cursor: 'pointer', fontSize: '1.3rem', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>다시 시작하기</button>
           </div>
        )}
      </div>
      <div style={{ marginTop: '15px', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>브키판도의 멸종을 막아주세요!</div>
    </div>
  );
}
