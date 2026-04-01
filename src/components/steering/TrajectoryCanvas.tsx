"use client";

import { useRef, useCallback, useEffect } from "react";
import { ARROW_LEN } from "@/lib/steering/constants";
import {
  calculateMetrics,
  buildTrajectory,
  SteeringParams,
} from "@/lib/steering/math";

type TrajectoryCanvasProps = {
  params: SteeringParams;
};

export default function TrajectoryCanvas({ params }: TrajectoryCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    const metrics = calculateMetrics(params);
    const points = buildTrajectory(metrics);

    const allX = points.map((point) => point.x);
    const allY = points.map((point) => point.y);

    const dataMinX = Math.min(0, ...allX);
    const dataMaxX = Math.max(...allX, metrics.forward + ARROW_LEN + 1);
    const dataMinY = Math.min(0, ...allY);
    const dataMaxY = Math.max(
      ...allY,
      metrics.lateral + Math.sin(metrics.theta) * ARROW_LEN,
    );

    const xRange = dataMaxX - dataMinX || 1;
    const yRange = dataMaxY - dataMinY || 1;

    const minX = dataMinX - xRange * 0.08;
    const maxX = dataMaxX + xRange * 0.12;
    const minY = dataMinY - yRange * 0.22;
    const maxY = dataMaxY + yRange * 0.22;

    const padL = 52;
    const padR = 28;
    const padT = 28;
    const padB = 52;

    const drawW = W - padL - padR;
    const drawH = H - padT - padB;

    const scaleX = drawW / (maxX - minX);
    const scaleY = drawH / (maxY - minY);
    const scale = Math.min(scaleX, scaleY);

    const usedW = (maxX - minX) * scale;
    const usedH = (maxY - minY) * scale;
    const extraX = (drawW - usedW) / 2;
    const extraY = (drawH - usedH) / 2;

    const ox = padL + extraX - minX * scale;
    const oy = padT + extraY + usedH + minY * scale;

    const toCanvas = (x: number, y: number) =>
      [ox + x * scale, oy - y * scale] as const;

    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
    const axisColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)";
    const textColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;

    for (let gx = Math.ceil(minX); gx <= maxX; gx++) {
      const [cx] = toCanvas(gx, 0);
      ctx.beginPath();
      ctx.moveTo(cx, padT);
      ctx.lineTo(cx, H - padB);
      ctx.stroke();
    }

    for (let gy = Math.ceil(minY); gy <= maxY; gy++) {
      const [, cy] = toCanvas(0, gy);
      ctx.beginPath();
      ctx.moveTo(padL, cy);
      ctx.lineTo(W - padR, cy);
      ctx.stroke();
    }

    ctx.strokeStyle = axisColor;

    const [axisX0, axisY0] = toCanvas(0, 0);
    const [axisXEnd] = toCanvas(maxX, 0);
    const [, axisYEnd] = toCanvas(0, maxY);

    ctx.beginPath();
    ctx.moveTo(axisX0, axisY0);
    ctx.lineTo(axisXEnd, axisY0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(axisX0, axisY0);
    ctx.lineTo(axisX0, axisYEnd);
    ctx.stroke();

    ctx.fillStyle = textColor;
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.fillText("Forward (m)", W / 2, H - 6);

    ctx.save();
    ctx.translate(12, H / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Lateral (m)", 0, 0);
    ctx.restore();

    ctx.strokeStyle = "#1D9E75";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.beginPath();

    points.forEach(({ x, y }, index) => {
      const [cx, cy] = toCanvas(x, y);
      if (index === 0) {
        ctx.moveTo(cx, cy);
      } else {
        ctx.lineTo(cx, cy);
      }
    });

    ctx.stroke();
  }, [params]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      draw();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    return () => resizeObserver.disconnect();
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: 300, display: "block", borderRadius: 8 }}
    />
  );
}
