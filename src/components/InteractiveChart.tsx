import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useBroker } from '../context/BrokerContext';
import { Candle, ChartType, Timeframe } from '../types';
import { calculateEMA, calculateRSI, calculateBollingerBands } from '../utils/mockData';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw, Activity, Bell } from 'lucide-react';

interface InteractiveChartProps {
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onOpenAlerts?: () => void;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  fullscreen = false,
  onToggleFullscreen,
  onOpenAlerts
}) => {
  const {
    activeAsset,
    currentCandles,
    timeframe,
    setTimeframe,
    chartType,
    setChartType,
    indicators,
    toggleIndicator,
    positions,
    orders
  } = useBroker();

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Viewport state for pan & zoom
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [mousePos, setMousePos] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false
  });
  const [hoverCandle, setHoverCandle] = useState<Candle | null>(null);

  // Timeframes list
  const timeframes: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1D', '1W'];
  const chartTypes: { id: ChartType; label: string }[] = [
    { id: 'candles', label: 'Candles' },
    { id: 'area', label: 'Area' },
    { id: 'hollow', label: 'Hollow' }
  ];

  // Reset zoom & pan
  const handleResetView = useCallback(() => {
    setZoomLevel(1);
    setPanOffset(0);
  }, []);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomLevel(z => Math.min(3.5, z * 1.08));
    } else {
      setZoomLevel(z => Math.max(0.4, z * 0.92));
    }
  };

  // Drag pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX - panOffset);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePos({ x, y, active: true });
    }

    if (isDragging) {
      setPanOffset(e.clientX - dragStartX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setMousePos(prev => ({ ...prev, active: false }));
    setHoverCandle(null);
  };

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || currentCandles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina display DPR handling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Layout configuration
    const rightAxisWidth = 72;
    const bottomAxisHeight = 28;
    const rsiHeight = indicators.rsi ? Math.min(100, height * 0.22) : 0;
    const chartHeight = height - bottomAxisHeight - rsiHeight;
    const chartWidth = width - rightAxisWidth;

    // Background clear
    ctx.clearRect(0, 0, width, height);

    // Number of visible candles
    const baseVisibleCount = Math.floor(chartWidth / 12);
    const visibleCount = Math.max(15, Math.floor(baseVisibleCount / zoomLevel));
    
    // Slicing visible window with pan offset
    const candleWidth = chartWidth / visibleCount;
    const offsetCandles = Math.round(panOffset / candleWidth);
    const endIndex = Math.max(visibleCount, Math.min(currentCandles.length, currentCandles.length - offsetCandles));
    const startIndex = Math.max(0, endIndex - visibleCount);
    const visibleCandles = currentCandles.slice(startIndex, endIndex);

    if (visibleCandles.length === 0) return;

    // Find min and max prices
    let minPrice = Math.min(...visibleCandles.map(c => c.low));
    let maxPrice = Math.max(...visibleCandles.map(c => c.high));
    const pricePadding = (maxPrice - minPrice) * 0.1 || 1;
    minPrice -= pricePadding;
    maxPrice += pricePadding;
    const priceRange = maxPrice - minPrice;

    // Price to Y coordinate conversion
    const getY = (price: number) => {
      return chartHeight - ((price - minPrice) / priceRange) * chartHeight;
    };

    // Calculate indicators on entire dataset
    const allCloses = currentCandles.map(c => c.close);
    const ema20 = indicators.ema20 ? calculateEMA(allCloses, 20) : [];
    const ema50 = indicators.ema50 ? calculateEMA(allCloses, 50) : [];
    const bbands = indicators.bollinger ? calculateBollingerBands(allCloses, 20, 2) : null;
    const rsiValues = indicators.rsi ? calculateRSI(allCloses, 14) : [];

    // -------------------------------------------------------------
    // Draw Subtle Grid Lines
    // -------------------------------------------------------------
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;

    // Horizontal price grid lines
    const gridSteps = 6;
    for (let i = 0; i <= gridSteps; i++) {
      const p = minPrice + (priceRange / gridSteps) * i;
      const y = getY(p);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      // Price label on right axis
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.toFixed(activeAsset.digits), chartWidth + 8, y);
    }

    // Vertical time grid lines
    const timeStep = Math.max(1, Math.floor(visibleCandles.length / 6));
    for (let i = 0; i < visibleCandles.length; i += timeStep) {
      const x = i * candleWidth + (candleWidth / 2);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height - bottomAxisHeight);
      ctx.stroke();

      // Time label
      const d = new Date(visibleCandles[i].time * 1000);
      const timeStr = timeframe.includes('D') || timeframe.includes('W')
        ? `${d.getMonth() + 1}/${d.getDate()}`
        : `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(timeStr, x, height - 10);
    }

    // -------------------------------------------------------------
    // Draw Volume Sub-bars (bottom of price chart)
    // -------------------------------------------------------------
    if (indicators.volume) {
      const maxVol = Math.max(...visibleCandles.map(c => c.volume), 1);
      const maxVolHeight = chartHeight * 0.18;

      visibleCandles.forEach((c, idx) => {
        const x = idx * candleWidth + 1;
        const barW = Math.max(1, candleWidth - 2);
        const vHeight = (c.volume / maxVol) * maxVolHeight;
        const vY = chartHeight - vHeight;
        const isUp = c.close >= c.open;

        ctx.fillStyle = isUp ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)';
        ctx.fillRect(x, vY, barW, vHeight);
      });
    }

    // -------------------------------------------------------------
    // Draw Bollinger Bands (translucent channel)
    // -------------------------------------------------------------
    if (bbands && indicators.bollinger) {
      const visibleUpper = bbands.upper.slice(startIndex, endIndex);
      const visibleLower = bbands.lower.slice(startIndex, endIndex);
      const visibleMiddle = bbands.middle.slice(startIndex, endIndex);

      // Channel fill
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < visibleUpper.length; i++) {
        const up = visibleUpper[i];
        if (up !== null) {
          const x = i * candleWidth + (candleWidth / 2);
          const y = getY(up);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      for (let i = visibleLower.length - 1; i >= 0; i--) {
        const low = visibleLower[i];
        if (low !== null) {
          const x = i * candleWidth + (candleWidth / 2);
          const y = getY(low);
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 242, 254, 0.04)';
      ctx.fill();

      // Middle EMA line
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      started = false;
      for (let i = 0; i < visibleMiddle.length; i++) {
        const mid = visibleMiddle[i];
        if (mid !== null) {
          const x = i * candleWidth + (candleWidth / 2);
          const y = getY(mid);
          if (!started) { ctx.moveTo(x, y); started = true; }
          else { ctx.lineTo(x, y); }
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // -------------------------------------------------------------
    // Draw EMA Lines
    // -------------------------------------------------------------
    const drawLineIndicator = (values: (number | null)[], color: string, widthLine: number = 1.5) => {
      const visibleVals = values.slice(startIndex, endIndex);
      ctx.strokeStyle = color;
      ctx.lineWidth = widthLine;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < visibleVals.length; i++) {
        const v = visibleVals[i];
        if (v !== null) {
          const x = i * candleWidth + (candleWidth / 2);
          const y = getY(v);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();
    };

    if (indicators.ema20) drawLineIndicator(ema20, '#00F2FE', 1.5);
    if (indicators.ema50) drawLineIndicator(ema50, '#A78BFA', 1.5);

    // -------------------------------------------------------------
    // Draw Primary Candles or Area
    // -------------------------------------------------------------
    if (chartType === 'area') {
      // Smooth gradient glowing area
      ctx.beginPath();
      visibleCandles.forEach((c, idx) => {
        const x = idx * candleWidth + (candleWidth / 2);
        const y = getY(c.close);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      // Gradient Fill
      const lastX = (visibleCandles.length - 1) * candleWidth + (candleWidth / 2);
      ctx.lineTo(lastX, chartHeight);
      ctx.lineTo(candleWidth / 2, chartHeight);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, 0, 0, chartHeight);
      gradient.addColorStop(0, 'rgba(0, 242, 254, 0.25)');
      gradient.addColorStop(0.6, 'rgba(0, 242, 254, 0.04)');
      gradient.addColorStop(1, 'rgba(0, 242, 254, 0.0)');
      ctx.fillStyle = gradient;
      ctx.fill();

      // Top glowing stroke
      ctx.strokeStyle = '#00F2FE';
      ctx.lineWidth = 2;
      ctx.beginPath();
      visibleCandles.forEach((c, idx) => {
        const x = idx * candleWidth + (candleWidth / 2);
        const y = getY(c.close);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    } else {
      // Candlesticks (Standard or Hollow)
      visibleCandles.forEach((c, idx) => {
        const x = idx * candleWidth;
        const centerX = x + (candleWidth / 2);
        const openY = getY(c.open);
        const closeY = getY(c.close);
        const highY = getY(c.high);
        const lowY = getY(c.low);
        const isUp = c.close >= c.open;

        const bullColor = '#10B981';
        const bearColor = '#EF4444';
        const color = isUp ? bullColor : bearColor;

        // Wick
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(1, candleWidth * 0.1);
        ctx.beginPath();
        ctx.moveTo(centerX, highY);
        ctx.lineTo(centerX, lowY);
        ctx.stroke();

        // Body
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(2, Math.abs(closeY - openY));
        const bodyWidth = Math.max(2, candleWidth - Math.max(2, candleWidth * 0.25));
        const bodyX = centerX - (bodyWidth / 2);

        if (chartType === 'hollow' && isUp) {
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(bodyX, bodyTop, bodyWidth, bodyHeight);
        } else {
          ctx.fillStyle = color;
          ctx.fillRect(bodyX, bodyTop, bodyWidth, bodyHeight);
        }
      });
    }

    // -------------------------------------------------------------
    // Draw Open Positions & Limit Orders Overlay Lines
    // -------------------------------------------------------------
    positions.filter(p => p.symbol === activeAsset.symbol).forEach(pos => {
      const y = getY(pos.entryPrice);
      if (y >= 0 && y <= chartHeight) {
        // Entry line
        ctx.strokeStyle = pos.side === 'long' ? '#10B981' : '#EF4444';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Badge
        ctx.fillStyle = pos.side === 'long' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 68, 0.9)';
        ctx.fillRect(chartWidth - 110, y - 9, 106, 18);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${pos.side.toUpperCase()} ${pos.size} (${pos.pnl >= 0 ? '+' : ''}$${pos.pnl})`, chartWidth - 57, y + 3);
      }

      // Take profit line
      if (pos.takeProfit) {
        const tpY = getY(pos.takeProfit);
        if (tpY >= 0 && tpY <= chartHeight) {
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(0, tpY);
          ctx.lineTo(chartWidth, tpY);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = 'rgba(16, 185, 129, 0.8)';
          ctx.fillRect(chartWidth - 65, tpY - 8, 60, 16);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 9px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`TP $${pos.takeProfit}`, chartWidth - 35, tpY + 3);
        }
      }

      // Stop Loss line
      if (pos.stopLoss) {
        const slY = getY(pos.stopLoss);
        if (slY >= 0 && slY <= chartHeight) {
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 2]);
          ctx.beginPath();
          ctx.moveTo(0, slY);
          ctx.lineTo(chartWidth, slY);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
          ctx.fillRect(chartWidth - 65, slY - 8, 60, 16);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 9px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`SL $${pos.stopLoss}`, chartWidth - 35, slY + 3);
        }
      }
    });

    // -------------------------------------------------------------
    // Current Live Price Marker
    // -------------------------------------------------------------
    const currentPriceY = getY(activeAsset.price);
    if (currentPriceY >= 0 && currentPriceY <= chartHeight) {
      // Glow line
      ctx.strokeStyle = activeAsset.change24h >= 0 ? '#10B981' : '#EF4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, currentPriceY);
      ctx.lineTo(chartWidth, currentPriceY);
      ctx.stroke();

      // Right pill
      ctx.fillStyle = activeAsset.change24h >= 0 ? '#10B981' : '#EF4444';
      ctx.fillRect(chartWidth + 2, currentPriceY - 10, rightAxisWidth - 4, 20);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(activeAsset.price.toFixed(activeAsset.digits), chartWidth + (rightAxisWidth / 2), currentPriceY + 4);
    }

    // -------------------------------------------------------------
    // RSI Sub-Panel Oscillator
    // -------------------------------------------------------------
    if (indicators.rsi && rsiHeight > 0) {
      const rsiYTop = chartHeight;
      
      // Divider
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, rsiYTop);
      ctx.lineTo(width, rsiYTop);
      ctx.stroke();

      // RSI Label
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '10px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('RSI (14)', 8, rsiYTop + 14);

      // Overbought / Oversold 70 & 30 Lines
      const getRsiY = (rsiVal: number) => {
        return rsiYTop + rsiHeight - ((rsiVal / 100) * (rsiHeight - 20)) - 10;
      };

      const y70 = getRsiY(70);
      const y30 = getRsiY(30);

      // Channel fill
      ctx.fillStyle = 'rgba(167, 139, 250, 0.04)';
      ctx.fillRect(0, y70, chartWidth, y30 - y70);

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(0, y70); ctx.lineTo(chartWidth, y70);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.beginPath();
      ctx.moveTo(0, y30); ctx.lineTo(chartWidth, y30);
      ctx.stroke();
      ctx.setLineDash([]);

      // RSI Curve
      const visibleRsi = rsiValues.slice(startIndex, endIndex);
      ctx.strokeStyle = '#A78BFA';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < visibleRsi.length; i++) {
        const val = visibleRsi[i];
        if (val !== null) {
          const x = i * candleWidth + (candleWidth / 2);
          const y = getRsiY(val);
          if (!started) { ctx.moveTo(x, y); started = true; }
          else { ctx.lineTo(x, y); }
        }
      }
      ctx.stroke();

      // Right axis RSI number
      const lastRsi = rsiValues[rsiValues.length - 1];
      if (lastRsi !== null && lastRsi !== undefined) {
        ctx.fillStyle = '#A78BFA';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(lastRsi.toFixed(1), chartWidth + 8, getRsiY(lastRsi));
      }
    }

    // -------------------------------------------------------------
    // Interactive Crosshair & Tooltip
    // -------------------------------------------------------------
    if (mousePos.active && mousePos.x <= chartWidth && mousePos.y <= height - bottomAxisHeight) {
      // Crosshair lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(mousePos.x, 0);
      ctx.lineTo(mousePos.x, height - bottomAxisHeight);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(chartWidth, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Hover Price badge on right axis
      if (mousePos.y <= chartHeight) {
        const hoverPrice = maxPrice - (mousePos.y / chartHeight) * priceRange;
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(chartWidth + 2, mousePos.y - 10, rightAxisWidth - 4, 20);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.strokeRect(chartWidth + 2, mousePos.y - 10, rightAxisWidth - 4, 20);
        ctx.fillStyle = '#F8FAFC';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(hoverPrice.toFixed(activeAsset.digits), chartWidth + (rightAxisWidth / 2), mousePos.y + 4);
      }

      // Find hovered candle
      const candleIndex = Math.floor(mousePos.x / candleWidth);
      if (candleIndex >= 0 && candleIndex < visibleCandles.length) {
        const c = visibleCandles[candleIndex];
        setHoverCandle(c);

        // Hover Time badge
        const d = new Date(c.time * 1000);
        const timeStr = `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        const textWidth = ctx.measureText(timeStr).width + 16;
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(mousePos.x - (textWidth / 2), height - 24, textWidth, 20);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.strokeRect(mousePos.x - (textWidth / 2), height - 24, textWidth, 20);
        ctx.fillStyle = '#F8FAFC';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(timeStr, mousePos.x, height - 10);
      }
    }

  }, [
    currentCandles,
    timeframe,
    chartType,
    zoomLevel,
    panOffset,
    mousePos,
    indicators,
    activeAsset,
    positions,
    orders
  ]);

  // Active or hovered stats for OHLCV banner
  const activeCandle = hoverCandle || (currentCandles.length > 0 ? currentCandles[currentCandles.length - 1] : null);

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col w-full h-full glass-panel rounded-2xl overflow-hidden select-none transition-all ${
        fullscreen ? 'fixed inset-0 z-50 rounded-none bg-[#090a0c]' : ''
      }`}
    >
      {/* Immersive Asset & Price Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 pb-3 border-b border-white/[0.06] bg-white/[0.01]">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">{activeAsset.name}</h2>
            <span className="text-[10px] glass-panel px-2.5 py-0.5 rounded uppercase font-bold text-indigo-300 border border-indigo-500/20">
              {activeAsset.category}
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold mono text-white tracking-tight">
              ${activeAsset.price.toLocaleString(undefined, { minimumFractionDigits: activeAsset.digits, maximumFractionDigits: activeAsset.digits })}
            </span>
            <span className={`text-sm font-medium ${activeAsset.change24h >= 0 ? 'text-[#00ffa3]' : 'text-[#ff5f5f]'}`}>
              {activeAsset.change24h >= 0 ? '+' : ''}{activeAsset.change24h.toFixed(2)}%
              <span className="opacity-75 ml-1 text-xs">
                ({activeAsset.change24h >= 0 ? '+' : ''}${(activeAsset.price * (activeAsset.change24h / 100)).toFixed(2)})
              </span>
            </span>
          </div>
        </div>

        {/* Timeframe Toggles & Chart Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            {timeframes.map(tf => (
              <button
                key={tf}
                id={`btn-timeframe-${tf}`}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                  timeframe === tf
                    ? 'active-tab'
                    : 'glass-btn text-white/70'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="h-5 w-[1px] bg-white/10 mx-1 hidden sm:block" />

          {/* Chart Type Selector */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.08]">
            {chartTypes.map(ct => (
              <button
                key={ct.id}
                id={`btn-charttype-${ct.id}`}
                onClick={() => setChartType(ct.id)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
                  chartType === ct.id
                    ? 'active-tab shadow-sm'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                {ct.label}
              </button>
            ))}
          </div>

          {/* Indicators Toolbar */}
          <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-xl border border-white/[0.08]">
            <Activity className="w-3.5 h-3.5 text-indigo-400 mr-1" />
            <button
              id="toggle-ema20"
              onClick={() => toggleIndicator('ema20')}
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-all ${
                indicators.ema20 ? 'bg-indigo-500/30 text-indigo-300 font-bold border border-indigo-500/40' : 'text-white/40 hover:text-white/70'
              }`}
            >
              EMA20
            </button>
            <button
              id="toggle-ema50"
              onClick={() => toggleIndicator('ema50')}
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-all ${
                indicators.ema50 ? 'bg-purple-500/30 text-purple-300 font-bold border border-purple-500/40' : 'text-white/40 hover:text-white/70'
              }`}
            >
              EMA50
            </button>
            <button
              id="toggle-bollinger"
              onClick={() => toggleIndicator('bollinger')}
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-all ${
                indicators.bollinger ? 'bg-blue-500/30 text-blue-300 font-bold border border-blue-500/40' : 'text-white/40 hover:text-white/70'
              }`}
            >
              BB
            </button>
            <button
              id="toggle-rsi"
              onClick={() => toggleIndicator('rsi')}
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-all ${
                indicators.rsi ? 'bg-indigo-500/30 text-indigo-300 font-bold border border-indigo-500/40' : 'text-white/40 hover:text-white/70'
              }`}
            >
              RSI
            </button>
            <button
              id="toggle-volume"
              onClick={() => toggleIndicator('volume')}
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-all ${
                indicators.volume ? 'bg-[#00ffa3]/20 text-[#00ffa3] font-bold border border-[#00ffa3]/30' : 'text-white/40 hover:text-white/70'
              }`}
            >
              VOL
            </button>
          </div>

          {/* Zoom / Reset / Fullscreen */}
          <div className="flex items-center gap-1">
            <button
              id="btn-zoom-in"
              onClick={() => setZoomLevel(z => Math.min(3.5, z * 1.15))}
              className="p-1.5 glass-btn rounded-lg text-white/60 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-zoom-out"
              onClick={() => setZoomLevel(z => Math.max(0.4, z * 0.85))}
              className="p-1.5 glass-btn rounded-lg text-white/60 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-zoom-reset"
              onClick={handleResetView}
              className="p-1.5 glass-btn rounded-lg text-white/60 hover:text-white"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            {onOpenAlerts && (
              <button
                id="btn-chart-alerts"
                onClick={onOpenAlerts}
                className="p-1.5 glass-btn rounded-lg text-amber-400/80 hover:text-amber-300"
                title="Create Price Alert"
              >
                <Bell className="w-3.5 h-3.5" />
              </button>
            )}
            {onToggleFullscreen && (
              <button
                id="btn-toggle-fullscreen"
                onClick={onToggleFullscreen}
                className="p-1.5 glass-btn rounded-lg text-white/60 hover:text-white"
                title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Real-time OHLCV Readout Strip */}
      {activeCandle && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-1.5 text-[11px] font-mono-numbers bg-black/20 border-b border-white/[0.04] text-white/60">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-white/90">{activeAsset.symbol}</span>
            <span className="text-white/40">·</span>
            <span className="text-white/50">{timeframe}</span>
          </div>

          <div className="flex items-center gap-3">
            <span>O: <strong className="text-white/90 font-medium">{activeCandle.open.toFixed(activeAsset.digits)}</strong></span>
            <span>H: <strong className="text-emerald-400 font-medium">{activeCandle.high.toFixed(activeAsset.digits)}</strong></span>
            <span>L: <strong className="text-rose-400 font-medium">{activeCandle.low.toFixed(activeAsset.digits)}</strong></span>
            <span>C: <strong className={activeCandle.close >= activeCandle.open ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>{activeCandle.close.toFixed(activeAsset.digits)}</strong></span>
            <span className="hidden sm:inline">Vol: <strong className="text-white/80 font-medium">{activeCandle.volume.toLocaleString()}</strong></span>
            <span className={activeCandle.close >= activeCandle.open ? 'text-emerald-400' : 'text-rose-400'}>
              {(((activeCandle.close - activeCandle.open) / activeCandle.open) * 100).toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="relative flex-1 w-full min-h-[360px] cursor-crosshair overflow-hidden">
        <canvas
          ref={canvasRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className="absolute inset-0 w-full h-full"
        />

        {/* Watermark subtle logo in background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
          <span className="text-[120px] font-black tracking-widest uppercase font-display text-white">
            {activeAsset.symbol.split('/')[0]}
          </span>
        </div>
      </div>
    </div>
  );
};
