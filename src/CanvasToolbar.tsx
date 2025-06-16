"use client";

import type React from "react";
import { useState, useCallback } from "react";
import type { CanvasTool } from "./types/canvas";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./components/ui/tooltip";
import { Slider } from "./components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./components/ui/popover";

interface CanvasToolbarProps {
  currentTool: CanvasTool;
  setCurrentTool: (tool: CanvasTool) => void;
  currentColor: string;
  setCurrentColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndoRedo: {
    canUndo: boolean;
    canRedo: boolean;
  };
  currentBackground: string;
  onBackgroundChange: (background: string) => void;
}

const WEB3_COLORS = [
  "#00f5ff", // Cyan
  "#39ff14", // Neon Green
  "#ff00ff", // Magenta
  "#ff3131", // Red
  "#ffff00", // Yellow
  "#ffffff", // White
  "#1a1a1a", // Dark Gray
  "#9d00ff", // Purple
  "#00ff9d", // Mint
  "#0066ff", // Blue
];

export default function CanvasToolbar({
  currentTool,
  setCurrentTool,
  currentColor,
  setCurrentColor,
  brushSize,
  setBrushSize,
  onUndo,
  onRedo,
  onClear,
  canUndoRedo,
  currentBackground = "canvas",
  onBackgroundChange,
}: CanvasToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBackgroundOptions, setShowBackgroundOptions] = useState(false);

  // Use callbacks for all handlers to prevent state updates during render
  const handleToolChange = useCallback(
    (tool: CanvasTool) => {
      setCurrentTool(tool);
    },
    [setCurrentTool]
  );

  const handleColorChange = useCallback(
    (color: string) => {
      // Validate hex color (e.g., #RRGGBB)
      const hexColor = color.match(/^#[0-9A-Fa-f]{6}$/) ? color : "#00f5ff";
      setCurrentColor(hexColor);
    },
    [setCurrentColor]
  );

  const handleBrushSizeChange = useCallback(
    (value: number[]) => {
      setBrushSize(value[0]);
    },
    [setBrushSize]
  );

  const handleBackgroundChange = useCallback(
    (background: string) => {
      if (onBackgroundChange) {
        onBackgroundChange(background);
      }
      setShowBackgroundOptions(false);
    },
    [onBackgroundChange]
  );

  return (
    <div className="mt-4 p-4 bg-gray-900/60 backdrop-blur-md rounded-lg border border-gray-800/50 shadow-lg">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        {/* Tool Selection */}
        <div className="flex items-center gap-2 flex-wrap">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleToolChange("brush")}
                  className={`p-2 rounded-md transition-all ${
                    currentTool === "brush"
                      ? "bg-cyan-900/50 text-cyan-400 shadow-lg shadow-cyan-500/20"
                      : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                    <path d="M2 2l7.586 7.586"></path>
                    <circle cx="11" cy="11" r="2"></circle>
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Brush Tool (B)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleToolChange("eraser")}
                  className={`p-2 rounded-md transition-all ${
                    currentTool === "eraser"
                      ? "bg-cyan-900/50 text-cyan-400 shadow-lg shadow-cyan-500/20"
                      : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
                    <line x1="16" y1="8" x2="2" y2="22"></line>
                    <line x1="17.5" y1="15" x2="9" y2="15"></line>
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Eraser Tool (E)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleToolChange("line")}
                  className={`p-2 rounded-md transition-all ${
                    currentTool === "line"
                      ? "bg-cyan-900/50 text-cyan-400 shadow-lg shadow-cyan-500/20"
                      : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Line Tool (L)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleToolChange("rectangle")}
                  className={`p-2 rounded-md transition-all ${
                    currentTool === "rectangle"
                      ? "bg-cyan-900/50 text-cyan-400 shadow-lg shadow-cyan-500/20"
                      : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rectangle Tool (R)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleToolChange("circle")}
                  className={`p-2 rounded-md transition-all ${
                    currentTool === "circle"
                      ? "bg-cyan-900/50 text-cyan-400 shadow-lg shadow-cyan-500/20"
                      : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Circle Tool (C)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleToolChange("polygon")}
                  className={`p-2 rounded-md transition-all ${
                    currentTool === "polygon"
                      ? "bg-cyan-900/50 text-cyan-400 shadow-lg shadow-cyan-500/20"
                      : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Polygon Tool (P)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleToolChange("text")}
                  className={`p-2 rounded-md transition-all ${
                    currentTool === "text"
                      ? "bg-cyan-900/50 text-cyan-400 shadow-lg shadow-cyan-500/20"
                      : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="4 7 4 4 20 4 20 7"></polyline>
                    <line x1="9" y1="20" x2="15" y2="20"></line>
                    <line x1="12" y1="4" x2="12" y2="20"></line>
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Text Tool (T)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleToolChange("fill")}
                  className={`p-2 rounded-md transition-all ${
                    currentTool === "fill"
                      ? "bg-cyan-900/50 text-cyan-400 shadow-lg shadow-cyan-500/20"
                      : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 11h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h2V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2z"></path>
                    <path d="M2 11h5"></path>
                    <path d="M5 11V7"></path>
                    <path d="M10 5V3"></path>
                    <path d="M14 5V3"></path>
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Fill Tool (F)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleToolChange("eyedropper")}
                  className={`p-2 rounded-md transition-all ${
                    currentTool === "eyedropper"
                      ? "bg-cyan-900/50 text-cyan-400 shadow-lg shadow-cyan-500/20"
                      : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                    <circle cx="2" cy="2" r="1"></circle>
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Eyedropper Tool (I)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleToolChange("selection")}
                  className={`p-2 rounded-md transition-all ${
                    currentTool === "selection"
                      ? "bg-cyan-900/50 text-cyan-400 shadow-lg shadow-cyan-500/20"
                      : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-gray-300"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3h18v18H3z"></path>
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Selection Tool (S)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Background Selection */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">Background:</span>
          <Popover
            open={showBackgroundOptions}
            onOpenChange={setShowBackgroundOptions}
          >
            <PopoverTrigger asChild>
              <button
                className="px-3 py-2 rounded-md bg-gray-800/60 backdrop-blur-sm text-gray-300 hover:bg-gray-700/70 hover:text-white flex items-center gap-2 transition-all border border-gray-700/50 hover:border-cyan-500/50 hover:shadow-[0_0_10px_rgba(0,245,255,0.2)] group"
                aria-label="Select background"
              >
                <div
                  className="w-6 h-6 rounded overflow-hidden border border-gray-600 group-hover:border-cyan-500/50 transition-all"
                  style={{
                    background:
                      currentBackground === "transparent"
                        ? "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMWYxZjEiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2YxZjFmMSIvPjwvc3ZnPg==')"
                        : currentBackground === "white"
                        ? "#ffffff"
                        : currentBackground === "black"
                        ? "#000000"
                        : currentBackground === "dark-gray"
                        ? "#1a1a1a"
                        : currentBackground === "navy"
                        ? "#000080"
                        : currentBackground === "deep-purple"
                        ? "#301934"
                        : currentBackground === "canvas-texture"
                        ? "#f5f5dc url('/canvas-texture.png')"
                        : currentBackground === "circuit"
                        ? "#0a0a0a url('/circuit-pattern.png')"
                        : currentBackground === "hex-grid"
                        ? "#0a192f url('/hex-grid.png')"
                        : currentBackground === "digital-noise"
                        ? "#111 url('/digital-noise.png')"
                        : currentBackground === "neon-gradient"
                        ? "linear-gradient(135deg, #00f5ff, #9d00ff)"
                        : currentBackground === "cyber-gradient"
                        ? "linear-gradient(135deg, #ff00ff, #00f5ff)"
                        : currentBackground === "green-gradient"
                        ? "linear-gradient(135deg, #39ff14, #00f5ff)"
                        : currentBackground === "parchment"
                        ? "#f5f0e1 url('/parchment.png')"
                        : currentBackground === "sketch"
                        ? "#ffffff url('/sketch-paper.png')"
                        : currentBackground === "holographic"
                        ? "linear-gradient(135deg, #ff00ff, #00f5ff, #39ff14)"
                        : currentBackground === "matrix"
                        ? "#000 url('/matrix-pattern.png')"
                        : currentBackground === "geometric"
                        ? "#0a0a0a url('/geometric-mesh.png')"
                        : currentBackground.startsWith("#")
                        ? currentBackground
                        : "#f5f5dc",
                  }}
                ></div>
                <span className="text-sm font-medium">
                  {currentBackground === "transparent"
                    ? "Transparent"
                    : currentBackground === "canvas-texture"
                    ? "Canvas"
                    : currentBackground === "circuit"
                    ? "Circuit"
                    : currentBackground === "hex-grid"
                    ? "Hex Grid"
                    : currentBackground === "digital-noise"
                    ? "Digital Noise"
                    : currentBackground === "neon-gradient"
                    ? "Neon Gradient"
                    : currentBackground === "cyber-gradient"
                    ? "Cyber Gradient"
                    : currentBackground === "green-gradient"
                    ? "Green Gradient"
                    : currentBackground === "parchment"
                    ? "Parchment"
                    : currentBackground === "sketch"
                    ? "Sketch Paper"
                    : currentBackground === "holographic"
                    ? "Holographic"
                    : currentBackground === "matrix"
                    ? "Matrix"
                    : currentBackground === "geometric"
                    ? "Geometric"
                    : currentBackground.charAt(0).toUpperCase() +
                      currentBackground.slice(1).replace("-", " ")}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 bg-gray-900/90 backdrop-blur-md border border-gray-800/80 shadow-xl shadow-cyan-500/10 rounded-lg">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-cyan-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  Canvas Background
                </h4>

                <div className="space-y-3">
                  <div>
                    <h5 className="text-xs font-medium text-gray-400 mb-2">
                      Solid Colors
                    </h5>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={() => handleBackgroundChange("transparent")}
                        className={`p-1 rounded transition-all ${
                          currentBackground === "transparent"
                            ? "ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20"
                            : "hover:ring-1 hover:ring-gray-500"
                        }`}
                      >
                        <div className="w-full aspect-square rounded bg-transparent border border-gray-600 relative overflow-hidden">
                          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMWYxZjEiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2YxZjFmMSIvPjwvc3ZnPg==')]"></div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-center text-white py-0.5">
                            Transparent
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleBackgroundChange("white")}
                        className={`p-1 rounded transition-all ${
                          currentBackground === "white"
                            ? "ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20"
                            : "hover:ring-1 hover:ring-gray-500"
                        }`}
                      >
                        <div className="w-full aspect-square rounded bg-white relative overflow-hidden">
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-center text-white py-0.5">
                            White
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleBackgroundChange("black")}
                        className={`p-1 rounded transition-all ${
                          currentBackground === "black"
                            ? "ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20"
                            : "hover:ring-1 hover:ring-gray-500"
                        }`}
                      >
                        <div className="w-full aspect-square rounded bg-black relative overflow-hidden">
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-center text-white py-0.5">
                            Black
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleBackgroundChange("dark-gray")}
                        className={`p-1 rounded transition-all ${
                          currentBackground === "dark-gray"
                            ? "ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20"
                            : "hover:ring-1 hover:ring-gray-500"
                        }`}
                      >
                        <div className="w-full aspect-square rounded bg-[#1a1a1a] relative overflow-hidden">
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-center text-white py-0.5">
                            Dark Gray
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleBackgroundChange("navy")}
                        className={`p-1 rounded transition-all ${
                          currentBackground === "navy"
                            ? "ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20"
                            : "hover:ring-1 hover:ring-gray-500"
                        }`}
                      >
                        <div className="w-full aspect-square rounded bg-[#000080] relative overflow-hidden">
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-center text-white py-0.5">
                            Navy
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleBackgroundChange("deep-purple")}
                        className={`p-1 rounded transition-all ${
                          currentBackground === "deep-purple"
                            ? "ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20"
                            : "hover:ring-1 hover:ring-gray-500"
                        }`}
                      >
                        <div className="w-full aspect-square rounded bg-[#301934] relative overflow-hidden">
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-center text-white py-0.5">
                            Deep Purple
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-medium text-gray-400 mb-2">
                      Web3 Textures
                    </h5>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleBackgroundChange("circuit")}
                        className={`p-1 rounded transition-all ${
                          currentBackground === "circuit"
                            ? "ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20"
                            : "hover:ring-1 hover:ring-gray-500"
                        }`}
                      >
                        <div className="w-full aspect-square rounded bg-[#0a0a0a] bg-[url('/circuit-pattern.png')] bg-cover relative overflow-hidden">
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-center text-white py-0.5">
                            Circuit
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleBackgroundChange("hex-grid")}
                        className={`p-1 rounded transition-all ${
                          currentBackground === "hex-grid"
                            ? "ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20"
                            : "hover:ring-1 hover:ring-gray-500"
                        }`}
                      >
                        <div className="w-full aspect-square rounded bg-[#0a192f] bg-[url('/hex-grid.png')] bg-cover relative overflow-hidden">
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-center text-white py-0.5">
                            Hex Grid
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleBackgroundChange("digital-noise")}
                        className={`p-1 rounded transition-all ${
                          currentBackground === "digital-noise"
                            ? "ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20"
                            : "hover:ring-1 hover:ring-gray-500"
                        }`}
                      >
                        <div className="w-full aspect-square rounded bg-[#111] bg-[url('/digital-noise.png')] bg-cover relative overflow-hidden">
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-center text-white py-0.5">
                            Digital Noise
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-medium text-gray-400 mb-2">
                      Gradients
                    </h5>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleBackgroundChange("neon-gradient")}
                        className={`p-1 rounded transition-all ${
                          currentBackground === "neon-gradient"
                            ? "ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20"
                            : "hover:ring-1 hover:ring-gray-500"
                        }`}
                      >
                        <div className="w-full aspect-square rounded bg-gradient-to-br from-[#00f5ff] to-[#9d00ff] relative overflow-hidden">
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-center text-white py-0.5">
                            Neon
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleBackgroundChange("cyber-gradient")}
                        className={`p-1 rounded transition-all ${
                          currentBackground === "cyber-gradient"
                            ? "ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20"
                            : "hover:ring-1 hover:ring-gray-500"
                        }`}
                      >
                        <div className="w-full aspect-square rounded bg-gradient-to-br from-[#ff00ff] to-[#00f5ff] relative overflow-hidden">
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-center text-white py-0.5">
                            Cyber
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleBackgroundChange("green-gradient")}
                        className={`p-1 rounded transition-all ${
                          currentBackground === "green-gradient"
                            ? "ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20"
                            : "hover:ring-1 hover:ring-gray-500"
                        }`}
                      >
                        <div className="w-full aspect-square rounded bg-gradient-to-br from-[#39ff14] to-[#00f5ff] relative overflow-hidden">
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-center text-white py-0.5">
                            Green
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-medium text-gray-400 mb-2">
                      Paper Textures
                    </h5>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleBackgroundChange("canvas-texture")}
                        className={`p-1 rounded transition-all ${
                          currentBackground === "canvas-texture"
                            ? "ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20"
                            : "hover:ring-1 hover:ring-gray-500"
                        }`}
                      >
                        <div className="w-full aspect-square rounded bg-[#f5f5dc] bg-[url('/canvas-texture.png')] bg-cover relative overflow-hidden">
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-center text-white py-0.5">
                            Canvas
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleBackgroundChange("parchment")}
                        className={`p-1 rounded transition-all ${
                          currentBackground === "parchment"
                            ? "ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20"
                            : "hover:ring-1 hover:ring-gray-500"
                        }`}
                      >
                        <div className="w-full aspect-square rounded bg-[#f5f0e1] bg-[url('/parchment.png')] bg-cover relative overflow-hidden">
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-center text-white py-0.5">
                            Parchment
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleBackgroundChange("sketch")}
                        className={`p-1 rounded transition-all ${
                          currentBackground === "sketch"
                            ? "ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20"
                            : "hover:ring-1 hover:ring-gray-500"
                        }`}
                      >
                        <div className="w-full aspect-square rounded bg-white bg-[url('/sketch-paper.png')] bg-cover relative overflow-hidden">
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-center text-white py-0.5">
                            Sketch
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-medium text-gray-400 mb-2">
                      Futuristic
                    </h5>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleBackgroundChange("holographic")}
                        className={`p-1 rounded transition-all ${
                          currentBackground === "holographic"
                            ? "ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20"
                            : "hover:ring-1 hover:ring-gray-500"
                        }`}
                      >
                        <div className="w-full aspect-square rounded bg-gradient-to-br from-[#ff00ff] via-[#00f5ff] to-[#39ff14] relative overflow-hidden">
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-center text-white py-0.5">
                            Holographic
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleBackgroundChange("matrix")}
                        className={`p-1 rounded transition-all ${
                          currentBackground === "matrix"
                            ? "ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20"
                            : "hover:ring-1 hover:ring-gray-500"
                        }`}
                      >
                        <div className="w-full aspect-square rounded bg-black bg-[url('/matrix-pattern.png')] bg-cover relative overflow-hidden">
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-center text-white py-0.5">
                            Matrix
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleBackgroundChange("geometric")}
                        className={`p-1 rounded transition-all ${
                          currentBackground === "geometric"
                            ? "ring-2 ring-cyan-500 shadow-lg shadow-cyan-500/20"
                            : "hover:ring-1 hover:ring-gray-500"
                        }`}
                      >
                        <div className="w-full aspect-square rounded bg-[#0a0a0a] bg-[url('/geometric-mesh.png')] bg-cover relative overflow-hidden">
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-center text-white py-0.5">
                            Geometric
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-medium text-gray-400 mb-2">
                      Custom Color
                    </h5>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="w-10 h-10 rounded cursor-pointer bg-transparent border border-gray-700"
                        onChange={(e) => {
                          handleBackgroundChange(e.target.value);
                        }}
                      />
                      <div className="text-xs text-gray-400">
                        Pick a custom background color
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Color Picker */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">Color:</span>
          <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
            <PopoverTrigger asChild>
              <div
                className="w-8 h-8 rounded-full border-2 border-white/20 shadow-md hover:scale-110 transition-transform cursor-pointer"
                style={{ backgroundColor: currentColor }}
                onClick={() => setShowColorPicker(true)}
                aria-label="Select color"
              />
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3 bg-gray-900 border border-gray-800">
              <div className="grid grid-cols-5 gap-2 mb-3">
                {WEB3_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full hover:scale-110 transition-transform ${
                      currentColor === color
                        ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      handleColorChange(color);
                      setShowColorPicker(false);
                    }}
                  />
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-400">Custom Color</label>
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => handleColorChange(e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Brush Size */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <span className="text-sm text-gray-400">Size:</span>
          <div className="flex-grow">
            <Slider
              value={[brushSize]}
              min={1}
              max={50}
              step={1}
              onValueChange={handleBrushSizeChange}
              className="w-full"
            />
          </div>
          <span className="text-sm text-gray-300 min-w-[24px] text-center">
            {brushSize}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onUndo}
                  disabled={!canUndoRedo.canUndo}
                  className={`p-2 rounded-md transition-all ${
                    canUndoRedo.canUndo
                      ? "bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white"
                      : "bg-gray-800/30 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 7v6h6"></path>
                    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Undo (Ctrl+Z)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onRedo}
                  disabled={!canUndoRedo.canRedo}
                  className={`p-2 rounded-md transition-all ${
                    canUndoRedo.canRedo
                      ? "bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white"
                      : "bg-gray-800/30 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 7v6h-6"></path>
                    <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"></path>
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Redo (Ctrl+Y)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onClear}
                  className="p-2 bg-gray-800/50 text-gray-300 hover:bg-red-900/50 hover:text-red-400 rounded-md transition-all"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear Canvas</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
