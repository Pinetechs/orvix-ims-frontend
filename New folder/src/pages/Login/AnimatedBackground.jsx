import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', setCanvasSize);
    setCanvasSize();

    const dataPoints = Array.from({ length: 18 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 7 + Math.random() * 7,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.008 + Math.random() * 0.012,
    }));

    const roads = Array.from({ length: 3 }, (_, index) => {
      const y = (canvas.height / 4) * (index + 1);
      return {
        x1: 0,
        y1: y,
        cx: canvas.width / 2 + (Math.random() - 0.5) * 200,
        cy: y + (Math.random() - 0.5) * 80,
        x2: canvas.width,
        y2: y + (Math.random() - 0.5) * 60,
        opacity: 0.18,
      };
    });

    const vehicles = Array.from({ length: 7 }, () => ({
      x: Math.random() * canvas.width,
      y: (canvas.height / 4) * (Math.floor(Math.random() * 3) + 1) + (Math.random() - 0.5) * 30,
      radius: 8 + Math.random() * 4,
      speed: 0.7 + Math.random() * 1.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    const drawBackground = () => {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(0.7, '#e9ecef');
      gradient.addColorStop(1, '#f8fafc');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      roads.forEach((road) => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(road.x1, road.y1);
        ctx.bezierCurveTo(road.cx, road.cy, road.cx, road.cy, road.x2, road.y2);
        ctx.strokeStyle = '#D9B310';
        ctx.globalAlpha = road.opacity;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#D9B31044';
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.restore();
      });

      dataPoints.forEach((point) => {
        ctx.save();
        ctx.beginPath();
        const pulseRadius = point.radius + Math.sin(point.pulse) * 2.5;
        ctx.arc(point.x, point.y, pulseRadius, 0, Math.PI * 2);
        const radial = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, pulseRadius);
        radial.addColorStop(0, '#0B3C5Dcc');
        radial.addColorStop(0.7, '#0B3C5D44');
        radial.addColorStop(1, 'transparent');
        ctx.fillStyle = radial;
        ctx.globalAlpha = 0.45;
        ctx.fill();
        ctx.restore();
        point.pulse += point.pulseSpeed;
      });

      vehicles.forEach((vehicle) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(vehicle.x, vehicle.y, vehicle.radius + Math.sin(vehicle.pulse) * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = '#D9B310';
        ctx.globalAlpha = 0.85;
        ctx.shadowColor = '#D9B31099';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
        vehicle.x += vehicle.speed;
        vehicle.pulse += 0.04;
        if (vehicle.x > canvas.width + 30) {
          vehicle.x = -30;
          vehicle.y = (canvas.height / 4) * (Math.floor(Math.random() * 3) + 1) + (Math.random() - 0.5) * 30;
        }
      });
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBackground();
      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: 0 }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
    </Box>
  );
};

export default AnimatedBackground;
