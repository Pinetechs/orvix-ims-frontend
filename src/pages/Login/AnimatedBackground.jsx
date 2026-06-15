import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const randomBetween = (min, max) => min + Math.random() * (max - min);

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = 0;
    let height = 0;

    const inventoryNodes = Array.from({ length: 52 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: randomBetween(1.8, 4.8),
      speed: randomBetween(0.00001, 0.00009),
      phase: randomBetween(0, Math.PI * 2),
    }));

    const beams = Array.from({ length: 4 }, (_, index) => ({
      offset: index / 4,
      speed: randomBetween(0.00002, 0.00008),
      width: randomBetween(90, 180),
    }));

    const setCanvasSize = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const drawGrid = () => {
      const gridSize = 64;
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = '#5EA8FF';
      ctx.lineWidth = 1;

      for (let x = -gridSize; x < width + gridSize; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + width * 0.16, height);
        ctx.stroke();
      }

      for (let y = 0; y < height + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y - height * 0.08);
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawShelfBlocks = (time) => {
      const blockWidth = Math.min(158, width * 0.15);
      const blockHeight = 38;
      const rows = 5;
      const columns = 7;
      const startX = width * 0.52;
      const startY = height * 0.13;

      ctx.save();
      ctx.translate(startX, startY);
      ctx.rotate(-0.075);
      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const x = column * (blockWidth * 0.58);
          const y = row * (blockHeight + 17);
          const pulse = Math.sin(time * 0.001 + row + column) * 0.045;
          ctx.fillStyle = `rgba(255, 255, 255, ${0.048 + pulse})`;
          ctx.strokeStyle = `rgba(16, 124, 255, ${0.11 + Math.max(pulse, 0)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(x, y, blockWidth, blockHeight, 12);
          ctx.fill();
          ctx.stroke();
        }
      }
      ctx.restore();
    };

    const drawScannerBeams = (time) => {
      beams.forEach((beam) => {
        const x = ((time * beam.speed + beam.offset) % 1) * (width + beam.width) - beam.width;
        const gradient = ctx.createLinearGradient(x, 0, x + beam.width, height);
        gradient.addColorStop(0, 'rgba(4, 112, 255, 0)');
        gradient.addColorStop(0.5, 'rgba(16, 124, 255, 0.18)');
        gradient.addColorStop(1, 'rgba(0, 81, 210, 0)');

        ctx.save();
        ctx.fillStyle = gradient;
        ctx.globalCompositeOperation = 'screen';
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + beam.width, 0);
        ctx.lineTo(x + beam.width + width * 0.18, height);
        ctx.lineTo(x + width * 0.18, height);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });
    };

    const drawLogoArc = (time) => {
      const centerX = width * 0.28;
      const centerY = height * 0.58;
      const radius = Math.min(width, height) * 0.22;
      const sweep = Math.sin(time * 0.0008) * 0.08;

      ctx.save();
      ctx.globalAlpha = 0.11;
      ctx.lineWidth = Math.max(20, radius * 0.11);
      ctx.strokeStyle = '#107CFF';
      ctx.shadowColor = '#0470FF';
      ctx.shadowBlur = 34;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, Math.PI * 0.72 + sweep, Math.PI * 1.88 + sweep);
      ctx.stroke();

      const slashGradient = ctx.createLinearGradient(centerX, centerY + radius, centerX + radius * 1.42, centerY - radius * 1.22);
      slashGradient.addColorStop(0, 'rgba(0, 60, 157, 0.06)');
      slashGradient.addColorStop(1, 'rgba(16, 124, 255, 0.2)');
      ctx.fillStyle = slashGradient;
      ctx.beginPath();
      ctx.moveTo(centerX + radius * 0.45, centerY + radius * 0.25);
      ctx.lineTo(centerX + radius * 1.65, centerY - radius * 1.2);
      ctx.lineTo(centerX + radius * 1.8, centerY - radius * 1.28);
      ctx.lineTo(centerX + radius * 0.63, centerY + radius * 0.52);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawNodes = (time) => {
      inventoryNodes.forEach((node, index) => {
        const x = node.x * width;
        const y = ((node.y + time * node.speed) % 1) * height;
        const glow = 0.18 + Math.sin(time * 0.002 + node.phase) * 0.12;
        const color = index % 4 === 0 ? '#107CFF' : index % 2 === 0 ? '#0470FF' : '#5EA8FF';

        ctx.save();
        ctx.globalAlpha = glow;
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(x, y, node.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    };

    const render = (time = 0) => {
      ctx.clearRect(0, 0, width, height);
      drawGrid();
      drawLogoArc(time);
      drawShelfBlocks(time);
      drawScannerBeams(time);
      drawNodes(time);
      animationFrameId = window.requestAnimationFrame(render);
    };

    window.addEventListener('resize', setCanvasSize);
    setCanvasSize();
    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.94,
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </Box>
  );
};

export default AnimatedBackground;
