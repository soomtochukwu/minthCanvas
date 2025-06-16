"use client";

import type React from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import CanvasToolbar from "./CanvasToolbar";
import type { CanvasHistory, CanvasTool } from "./types/canvas";
import { useHotkeys } from "react-hotkeys-hook";

export interface CanvasDrawingProps {
  onImageGenerated: (file: File, url: string) => void;
}
export type { CanvasHistory, CanvasTool };

// Tool states interfaces
interface LineToolState {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isDrawing: boolean;
  shiftKey: boolean;
}

interface ShapeToolState {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isDrawing: boolean;
  isFilled: boolean;
  shiftKey: boolean;
}

interface TextToolState {
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  isPlacing: boolean;
}

interface PolygonToolState {
  points: Array<{ x: number; y: number }>;
  isDrawing: boolean;
  tempEndX: number;
  tempEndY: number;
}

interface SelectionToolState {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isSelecting: boolean;
  selectedImageData: ImageData | null;
  isDragging: boolean;
  dragStartX: number;
  dragStartY: number;
}

export default function CanvasDrawing({
  onImageGenerated,
}: CanvasDrawingProps) {
  // Main canvas refs and state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [tempCtx, setTempCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [currentBackground, setCurrentBackground] = useState("canvas");

  // Tool states
  const [currentTool, setCurrentTool] = useState<CanvasTool>("brush");
  const [currentColor, setCurrentColor] = useState("#00f5ff");
  const [brushSize, setBrushSize] = useState(10);
  const [isFilled, setIsFilled] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  // History management
  const [history, setHistory] = useState<CanvasHistory[]>([]);
  const [redoStack, setRedoStack] = useState<CanvasHistory[]>([]);

  // Tool-specific states
  const [lineToolState, setLineToolState] = useState<LineToolState>({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    isDrawing: false,
    shiftKey: false,
  });

  const [shapeToolState, setShapeToolState] = useState<ShapeToolState>({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    isDrawing: false,
    isFilled: false,
    shiftKey: false,
  });

  const [textToolState, setTextToolState] = useState<TextToolState>({
    x: 0,
    y: 0,
    text: "",
    fontSize: 20,
    fontFamily: "Arial",
    isPlacing: false,
  });

  const [polygonToolState, setPolygonToolState] = useState<PolygonToolState>({
    points: [],
    isDrawing: false,
    tempEndX: 0,
    tempEndY: 0,
  });

  const [selectionToolState, setSelectionToolState] =
    useState<SelectionToolState>({
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      isSelecting: false,
      selectedImageData: null,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
    });

  const [textInput, setTextInput] = useState<string>("");
  const [showTextInput, setShowTextInput] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(20);
  const [fontFamily, setFontFamily] = useState<string>("Arial");

  // Initialize main canvas and temp canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const tempCanvas = tempCanvasRef.current;

    if (!canvas || !tempCanvas) return;

    // Set canvas size based on container
    const container = canvas.parentElement;
    if (container) {
      const { width, height } = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const newWidth = Math.min(width - 20, 1400) * dpr;
      const newHeight = Math.min(height - 80, 900) * dpr;

      setCanvasSize({
        width: newWidth / dpr,
        height: newHeight / dpr,
      });

      canvas.width = newWidth;
      canvas.height = newHeight;
      tempCanvas.width = newWidth;
      tempCanvas.height = newHeight;

      // Set CSS size to match logical pixels
      canvas.style.width = `${newWidth / dpr}px`;
      canvas.style.height = `${newHeight / dpr}px`;
      tempCanvas.style.width = `${newWidth / dpr}px`;
      tempCanvas.style.height = `${newHeight / dpr}px`;

      const context = canvas.getContext("2d", { willReadFrequently: true });
      const tempContext = tempCanvas.getContext("2d", {
        willReadFrequently: true,
      });

      if (context && tempContext) {
        context.lineCap = "round";
        context.lineJoin = "round";
        context.strokeStyle = currentColor;
        context.lineWidth = brushSize;

        tempContext.lineCap = "round";
        tempContext.lineJoin = "round";
        tempContext.strokeStyle = currentColor;
        tempContext.lineWidth = brushSize;

        setCtx(context);
        setTempCtx(tempContext);

        // Save initial canvas state
        const initialState = canvas.toDataURL("image/png");
        setHistory([{ imageData: initialState }]);
      }
    }
  }, [currentColor, brushSize]);

  // Update canvas size on window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const tempCanvas = tempCanvasRef.current;

      if (!canvas || !tempCanvas || !ctx) return;

      const container = canvas.parentElement;
      if (container) {
        const dpr = window.devicePixelRatio || 1;
        const { width, height } = container.getBoundingClientRect();
        const newWidth = Math.min(width - 20, 1400) * dpr;
        const newHeight = Math.min(height - 80, 900) * dpr;

        setCanvasSize({
          width: newWidth / dpr,
          height: newHeight / dpr,
        });

        // Preserve current drawing
        const currentDrawing = canvas.toDataURL();

        canvas.width = newWidth;
        canvas.height = newHeight;
        tempCanvas.width = newWidth;
        tempCanvas.height = newHeight;

        canvas.style.width = `${newWidth / dpr}px`;
        canvas.style.height = `${newHeight / dpr}px`;
        tempCanvas.style.width = `${newWidth / dpr}px`;
        tempCanvas.style.height = `${newHeight / dpr}px`;

        // Restore drawing
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = currentDrawing;
        img.onload = () => {
          ctx.drawImage(img, 0, 0, newWidth / dpr, newHeight / dpr);
        };
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [ctx, tempCtx]);

  // Update context when tool, color, or size changes
  useEffect(() => {
    if (!ctx || !tempCtx) return;

    ctx.strokeStyle = currentColor;
    ctx.fillStyle = currentColor;
    ctx.lineWidth = brushSize;

    tempCtx.strokeStyle = currentColor;
    tempCtx.fillStyle = currentColor;
    tempCtx.lineWidth = brushSize;
  }, [ctx, tempCtx, currentColor, brushSize]);

  // Keyboard shortcuts
  useHotkeys("ctrl+z", handleUndo, { enableOnFormTags: true });
  useHotkeys("ctrl+y", handleRedo, { enableOnFormTags: true });
  useHotkeys(
    "ctrl+s",
    (e) => {
      e.preventDefault();
      handleSave();
    },
    { enableOnFormTags: true }
  );

  useHotkeys("b", () => setCurrentTool("brush"), { enableOnFormTags: false });
  useHotkeys("e", () => setCurrentTool("eraser"), { enableOnFormTags: false });
  useHotkeys("l", () => setCurrentTool("line"), { enableOnFormTags: false });
  useHotkeys("r", () => setCurrentTool("rectangle"), {
    enableOnFormTags: false,
  });
  useHotkeys("c", () => setCurrentTool("circle"), { enableOnFormTags: false });
  useHotkeys("p", () => setCurrentTool("polygon"), { enableOnFormTags: false });
  useHotkeys("t", () => setCurrentTool("text"), { enableOnFormTags: false });
  useHotkeys("f", () => setCurrentTool("fill"), { enableOnFormTags: false });
  useHotkeys("i", () => setCurrentTool("eyedropper"), {
    enableOnFormTags: false,
  });
  useHotkeys("s", () => setCurrentTool("selection"), {
    enableOnFormTags: false,
  });

  // Save canvas state for undo/redo
  const saveCanvasState = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL("image/png");

    setHistory((prev) => {
      const newHistory = [...prev, { imageData }];
      if (newHistory.length > 20) {
        return newHistory.slice(newHistory.length - 20);
      }
      return newHistory;
    });

    setRedoStack([]);
  }, []);

  // Get pointer position relative to canvas
  const getPointerPosition = useCallback(
    (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>
        | MouseEvent
        | TouchEvent
    ) => {
      if (!canvasRef.current) return { x: 0, y: 0 };

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      let x, y;

      if ("touches" in e) {
        e.preventDefault(); // Prevent scrolling
        x = (e.touches[0].clientX - rect.left) * (canvas.width / rect.width);
        y = (e.touches[0].clientY - rect.top) * (canvas.height / rect.height);
      } else {
        x = (e.clientX - rect.left) * (canvas.width / rect.width);
        y = (e.clientY - rect.top) * (canvas.height / rect.height);
      }

      return { x, y };
    },
    []
  );

  // Clear the temporary canvas
  const clearTempCanvas = useCallback(() => {
    if (!tempCtx || !tempCanvasRef.current) return;
    tempCtx.clearRect(
      0,
      0,
      tempCanvasRef.current.width,
      tempCanvasRef.current.height
    );
  }, [tempCtx]);

  // Apply the temporary canvas to the main canvas
  const applyTempCanvas = useCallback(() => {
    if (!ctx || !tempCtx || !canvasRef.current || !tempCanvasRef.current)
      return;

    ctx.drawImage(tempCanvasRef.current, 0, 0);
    clearTempCanvas();
  }, [ctx, tempCtx, clearTempCanvas]);

  // Calculate constrained line for shift key
  const calculateConstrainedLine = useCallback(
    (startX: number, startY: number, endX: number, endY: number) => {
      const dx = endX - startX;
      const dy = endY - startY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Snap to 0°, 45°, 90°, 135°, 180°, etc.
      const snapAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
      const newEndX = startX + distance * Math.cos(snapAngle);
      const newEndY = startY + distance * Math.sin(snapAngle);

      return { x: newEndX, y: newEndY };
    },
    []
  );

  // Calculate constrained rectangle for shift key
  const calculateConstrainedRect = useCallback(
    (startX: number, startY: number, endX: number, endY: number) => {
      const dx = endX - startX;
      const dy = endY - startY;
      const size = Math.max(Math.abs(dx), Math.abs(dy));

      const newEndX = startX + (dx >= 0 ? size : -size);
      const newEndY = startY + (dy >= 0 ? size : -size);

      return { x: newEndX, y: newEndY };
    },
    []
  );

  // Start drawing
  const startDrawing = useCallback(
    (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>
    ) => {
      if (!ctx || !tempCtx || !canvasRef.current) return;

      const { x, y } = getPointerPosition(e);
      const isShiftPressed = "shiftKey" in e && e.shiftKey;

      switch (currentTool) {
        case "brush":
          setIsDrawing(true);
          ctx.beginPath();
          ctx.moveTo(x, y);
          break;

        case "eraser":
          setIsDrawing(true);
          ctx.beginPath();
          ctx.moveTo(x, y);
          break;

        case "line":
          setLineToolState({
            startX: x,
            startY: y,
            endX: x,
            endY: y,
            isDrawing: true,
            shiftKey: isShiftPressed,
          });
          tempCtx.strokeStyle = currentColor;
          tempCtx.lineWidth = brushSize;
          tempCtx.lineCap = "round";
          tempCtx.lineJoin = "round";
          break;

        case "rectangle":
        case "circle":
          setShapeToolState({
            startX: x,
            startY: y,
            endX: x,
            endY: y,
            isDrawing: true,
            isFilled,
            shiftKey: isShiftPressed,
          });
          break;

        case "polygon":
          if (!polygonToolState.isDrawing) {
            setPolygonToolState({
              points: [{ x, y }],
              isDrawing: true,
              tempEndX: x,
              tempEndY: y,
            });
          } else {
            setPolygonToolState((prev) => ({
              ...prev,
              points: [...prev.points, { x, y }],
              tempEndX: x,
              tempEndY: y,
            }));
          }
          break;

        case "text":
          setTextToolState({
            x,
            y,
            text: "",
            fontSize,
            fontFamily,
            isPlacing: true,
          });
          setShowTextInput(true);
          break;

        case "fill":
          floodFill(x, y, currentColor);
          break;

        case "eyedropper":
          pickColor(x, y);
          break;

        case "selection":
          setSelectionToolState({
            startX: x,
            startY: y,
            endX: x,
            endY: y,
            isSelecting: true,
            selectedImageData: null,
            isDragging: false,
            dragStartX: 0,
            dragStartY: 0,
          });
          break;
      }
    },
    [
      ctx,
      tempCtx,
      currentTool,
      currentColor,
      brushSize,
      isFilled,
      polygonToolState,
      fontSize,
      fontFamily,
      getPointerPosition,
    ]
  );

  // Draw
  const draw = useCallback(
    (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>
    ) => {
      if (!ctx || !tempCtx || !canvasRef.current || !tempCanvasRef.current)
        return;

      const { x, y } = getPointerPosition(e);
      const isShiftPressed = "shiftKey" in e && e.shiftKey;

      switch (currentTool) {
        case "brush":
          if (isDrawing) {
            ctx.lineTo(x, y);
            ctx.stroke();
          }
          break;

        case "eraser":
          if (isDrawing) {
            ctx.save();
            ctx.globalCompositeOperation = "destination-out";
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.restore();
          }
          break;

        case "line":
          if (lineToolState.isDrawing) {
            clearTempCanvas();

            // Use direct pointer coordinates for preview
            let endX = x;
            let endY = y;

            if (isShiftPressed || lineToolState.shiftKey) {
              const constrained = calculateConstrainedLine(
                lineToolState.startX,
                lineToolState.startY,
                x,
                y
              );
              endX = constrained.x;
              endY = constrained.y;
            }

            // Draw preview on temp canvas
            tempCtx.beginPath();
            tempCtx.moveTo(lineToolState.startX, lineToolState.startY);
            tempCtx.lineTo(endX, endY);
            tempCtx.stroke();

            // Update state for reference, but don't rely on it for drawing
            setLineToolState((prev) => ({
              ...prev,
              endX,
              endY,
              shiftKey: isShiftPressed,
            }));
          }
          break;

        case "rectangle":
          if (shapeToolState.isDrawing) {
            clearTempCanvas();

            let endX = x;
            let endY = y;

            if (isShiftPressed || shapeToolState.shiftKey) {
              const constrained = calculateConstrainedRect(
                shapeToolState.startX,
                shapeToolState.startY,
                x,
                y
              );
              endX = constrained.x;
              endY = constrained.y;
            }

            const width = endX - shapeToolState.startX;
            const height = endY - shapeToolState.startY;

            tempCtx.beginPath();
            tempCtx.rect(
              shapeToolState.startX,
              shapeToolState.startY,
              width,
              height
            );

            if (shapeToolState.isFilled) {
              tempCtx.fill();
            } else {
              tempCtx.stroke();
            }

            setShapeToolState((prev) => ({
              ...prev,
              endX,
              endY,
              shiftKey: isShiftPressed,
            }));
          }
          break;

        case "circle":
          if (shapeToolState.isDrawing) {
            clearTempCanvas();

            let endX = x;
            let endY = y;

            if (isShiftPressed || shapeToolState.shiftKey) {
              const constrained = calculateConstrainedRect(
                shapeToolState.startX,
                shapeToolState.startY,
                x,
                y
              );
              endX = constrained.x;
              endY = constrained.y;
            }

            const radiusX = Math.abs(endX - shapeToolState.startX) / 2;
            const radiusY = Math.abs(endY - shapeToolState.startY) / 2;
            const centerX =
              shapeToolState.startX + (endX - shapeToolState.startX) / 2;
            const centerY =
              shapeToolState.startY + (endY - shapeToolState.startY) / 2;

            tempCtx.beginPath();
            tempCtx.ellipse(
              centerX,
              centerY,
              radiusX,
              radiusY,
              0,
              0,
              Math.PI * 2
            );

            if (shapeToolState.isFilled) {
              tempCtx.fill();
            } else {
              tempCtx.stroke();
            }

            setShapeToolState((prev) => ({
              ...prev,
              endX,
              endY,
              shiftKey: isShiftPressed,
            }));
          }
          break;

        case "polygon":
          if (
            polygonToolState.isDrawing &&
            polygonToolState.points.length > 0
          ) {
            clearTempCanvas();

            tempCtx.beginPath();
            tempCtx.moveTo(
              polygonToolState.points[0].x,
              polygonToolState.points[0].y
            );

            for (let i = 1; i < polygonToolState.points.length; i++) {
              tempCtx.lineTo(
                polygonToolState.points[i].x,
                polygonToolState.points[i].y
              );
            }

            tempCtx.lineTo(x, y);
            tempCtx.stroke();

            setPolygonToolState((prev) => ({
              ...prev,
              tempEndX: x,
              tempEndY: y,
            }));
          }
          break;

        case "selection":
          const selState = selectionToolState;

          if (selState.isSelecting) {
            clearTempCanvas();

            tempCtx.setLineDash([5, 5]);
            tempCtx.strokeStyle = "#ffffff";
            tempCtx.lineWidth = 1;
            tempCtx.strokeRect(
              selState.startX,
              selState.startY,
              x - selState.startX,
              y - selState.startY
            );
            tempCtx.setLineDash([]);
            tempCtx.strokeStyle = currentColor;
            tempCtx.lineWidth = brushSize;

            setSelectionToolState((prev) => ({
              ...prev,
              endX: x,
              endY: y,
            }));
          } else if (selState.isDragging && selState.selectedImageData) {
            clearTempCanvas();

            const offsetX = x - selState.dragStartX;
            const offsetY = y - selState.dragStartY;

            tempCtx.putImageData(
              selState.selectedImageData,
              selState.startX + offsetX,
              selState.startY + offsetY
            );
          }
          break;
      }
    },
    [
      ctx,
      tempCtx,
      isDrawing,
      currentTool,
      currentColor,
      brushSize,
      lineToolState,
      shapeToolState,
      polygonToolState,
      selectionToolState,
      getPointerPosition,
      clearTempCanvas,
      calculateConstrainedLine,
      calculateConstrainedRect,
    ]
  );

  // Stop drawing
  const stopDrawing = useCallback(
    (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>
    ) => {
      if (!ctx || !tempCtx || !canvasRef.current) return;

      const { x, y } = getPointerPosition(e);
      const isShiftPressed = "shiftKey" in e && e.shiftKey;

      switch (currentTool) {
        case "brush":
        case "eraser":
          if (isDrawing) {
            setIsDrawing(false);
            ctx.closePath();
            saveCanvasState();
          }
          break;

        case "line":
          if (lineToolState.isDrawing) {
            let endX = x;
            let endY = y;

            if (isShiftPressed || lineToolState.shiftKey) {
              const constrained = calculateConstrainedLine(
                lineToolState.startX,
                lineToolState.startY,
                x,
                y
              );
              endX = constrained.x;
              endY = constrained.y;
            }

            // Avoid drawing if start and end are the same
            if (
              Math.abs(lineToolState.startX - endX) < 1 &&
              Math.abs(lineToolState.startY - endY) < 1
            ) {
              clearTempCanvas();
              setLineToolState({
                startX: 0,
                startY: 0,
                endX: 0,
                endY: 0,
                isDrawing: false,
                shiftKey: false,
              });
              return;
            }

            ctx.beginPath();
            ctx.moveTo(lineToolState.startX, lineToolState.startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            clearTempCanvas();

            setLineToolState({
              startX: 0,
              startY: 0,
              endX: 0,
              endY: 0,
              isDrawing: false,
              shiftKey: false,
            });

            saveCanvasState();
          }
          break;

        case "rectangle":
          if (shapeToolState.isDrawing) {
            let endX = x;
            let endY = y;

            if (isShiftPressed || shapeToolState.shiftKey) {
              const constrained = calculateConstrainedRect(
                shapeToolState.startX,
                shapeToolState.startY,
                x,
                y
              );
              endX = constrained.x;
              endY = constrained.y;
            }

            const width = endX - shapeToolState.startX;
            const height = endY - shapeToolState.startY;

            ctx.beginPath();
            ctx.rect(
              shapeToolState.startX,
              shapeToolState.startY,
              width,
              height
            );

            if (shapeToolState.isFilled) {
              ctx.fill();
            } else {
              ctx.stroke();
            }

            clearTempCanvas();

            setShapeToolState({
              startX: 0,
              startY: 0,
              endX: 0,
              endY: 0,
              isDrawing: false,
              isFilled: isFilled,
              shiftKey: false,
            });

            saveCanvasState();
          }
          break;

        case "circle":
          if (shapeToolState.isDrawing) {
            let endX = x;
            let endY = y;

            if (isShiftPressed || shapeToolState.shiftKey) {
              const constrained = calculateConstrainedRect(
                shapeToolState.startX,
                shapeToolState.startY,
                x,
                y
              );
              endX = constrained.x;
              endY = constrained.y;
            }

            const radiusX = Math.abs(endX - shapeToolState.startX) / 2;
            const radiusY = Math.abs(endY - shapeToolState.startY) / 2;
            const centerX =
              shapeToolState.startX + (endX - shapeToolState.startX) / 2;
            const centerY =
              shapeToolState.startY + (endY - shapeToolState.startY) / 2;

            ctx.beginPath();
            ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);

            if (shapeToolState.isFilled) {
              ctx.fill();
            } else {
              ctx.stroke();
            }

            clearTempCanvas();

            setShapeToolState({
              startX: 0,
              startY: 0,
              endX: 0,
              endY: 0,
              isDrawing: false,
              isFilled: isFilled,
              shiftKey: false,
            });

            saveCanvasState();
          }
          break;

        case "selection":
          const selState = selectionToolState;

          if (selState.isSelecting) {
            const startX = Math.min(selState.startX, selState.endX);
            const startY = Math.min(selState.startY, selState.endY);
            const width = Math.abs(selState.endX - selState.startX);
            const height = Math.abs(selState.endY - selState.startY);

            if (width > 0 && height > 0) {
              const imageData = ctx.getImageData(startX, startY, width, height);

              setSelectionToolState((prev) => ({
                ...prev,
                isSelecting: false,
                selectedImageData: imageData,
                startX,
                startY,
                endX: startX + width,
                endY: startY + height,
                isDragging: true,
                dragStartX: x,
                dragStartY: y,
              }));

              clearTempCanvas();

              tempCtx.putImageData(imageData, startX, startY);

              tempCtx.setLineDash([5, 5]);
              tempCtx.strokeStyle = "#ffffff";
              tempCtx.lineWidth = 1;
              tempCtx.strokeRect(startX, startY, width, height);
              tempCtx.setLineDash([]);
              tempCtx.strokeStyle = currentColor;
              tempCtx.lineWidth = brushSize;
            } else {
              setSelectionToolState({
                startX: 0,
                startY: 0,
                endX: 0,
                endY: 0,
                isSelecting: false,
                selectedImageData: null,
                isDragging: false,
                dragStartX: 0,
                dragStartY: 0,
              });

              clearTempCanvas();
            }
          } else if (selState.isDragging && selState.selectedImageData) {
            const offsetX = x - selState.dragStartX;
            const offsetY = y - selState.dragStartY;

            ctx.clearRect(
              selState.startX,
              selState.startY,
              selState.endX - selState.startX,
              selState.endY - selState.startY
            );

            ctx.putImageData(
              selState.selectedImageData,
              selState.startX + offsetX,
              selState.startY + offsetY
            );

            clearTempCanvas();

            setSelectionToolState({
              startX: 0,
              startY: 0,
              endX: 0,
              endY: 0,
              isSelecting: false,
              selectedImageData: null,
              isDragging: false,
              dragStartX: 0,
              dragStartY: 0,
            });

            saveCanvasState();
          }
          break;
      }
    },
    [
      ctx,
      tempCtx,
      isDrawing,
      currentTool,
      currentColor,
      brushSize,
      isFilled,
      lineToolState,
      shapeToolState,
      selectionToolState,
      getPointerPosition,
      clearTempCanvas,
      calculateConstrainedLine,
      calculateConstrainedRect,
      saveCanvasState,
    ]
  );

  // Handle double click for polygons
  const handleDoubleClick = useCallback(() => {
    if (
      !ctx ||
      !canvasRef.current ||
      currentTool !== "polygon" ||
      !polygonToolState.isDrawing
    )
      return;

    if (polygonToolState.points.length >= 3) {
      ctx.beginPath();
      ctx.moveTo(polygonToolState.points[0].x, polygonToolState.points[0].y);

      for (let i = 1; i < polygonToolState.points.length; i++) {
        ctx.lineTo(polygonToolState.points[i].x, polygonToolState.points[i].y);
      }

      ctx.closePath();

      if (isFilled) {
        ctx.fill();
      } else {
        ctx.stroke();
      }

      clearTempCanvas();

      setPolygonToolState({
        points: [],
        isDrawing: false,
        tempEndX: 0,
        tempEndY: 0,
      });

      saveCanvasState();
    }
  }, [
    ctx,
    currentTool,
    polygonToolState,
    isFilled,
    clearTempCanvas,
    saveCanvasState,
  ]);

  // Handle text input submission
  const handleTextSubmit = useCallback(() => {
    if (!ctx || !canvasRef.current || !textToolState.isPlacing || !textInput)
      return;

    ctx.font = `${textToolState.fontSize}px ${textToolState.fontFamily}`;
    ctx.fillStyle = currentColor;
    ctx.textBaseline = "top";

    ctx.fillText(textInput, textToolState.x, textToolState.y);

    setTextToolState({
      x: 0,
      y: 0,
      text: "",
      fontSize: fontSize,
      fontFamily: fontFamily,
      isPlacing: false,
    });
    setTextInput("");
    setShowTextInput(false);

    saveCanvasState();
  }, [
    ctx,
    textToolState,
    textInput,
    currentColor,
    fontSize,
    fontFamily,
    saveCanvasState,
  ]);

  // Pick color from canvas
  const pickColor = useCallback(
    (x: number, y: number) => {
      if (!ctx || !canvasRef.current) return;

      try {
        const pixel = ctx.getImageData(x, y, 1, 1).data;

        if (pixel[3] === 0) return;

        const color = `#${pixel[0].toString(16).padStart(2, "0")}${pixel[1]
          .toString(16)
          .padStart(2, "0")}${pixel[2].toString(16).padStart(2, "0")}`;

        setCurrentColor(color);
        setCurrentTool("brush");
      } catch (error) {
        console.error("Error picking color:", error);
      }
    },
    [ctx, setCurrentColor, setCurrentTool]
  );

  // Flood fill
  const floodFill = useCallback(
    (startX: number, startY: number, fillColor: string) => {
      if (!ctx || !canvasRef.current) return;

      try {
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        const startPos = (Math.floor(startY) * width + Math.floor(startX)) * 4;
        const startR = data[startPos];
        const startG = data[startPos + 1];
        const startB = data[startPos + 2];
        const startA = data[startPos + 3];

        const fillR = Number.parseInt(fillColor.slice(1, 3), 16);
        const fillG = Number.parseInt(fillColor.slice(3, 5), 16);
        const fillB = Number.parseInt(fillColor.slice(5, 7), 16);
        const fillA = 255;

        if (
          startR === fillR &&
          startG === fillG &&
          startB === fillB &&
          startA === fillA
        ) {
          return;
        }

        const threshold = 10;
        const pixelsToCheck = [
          { x: Math.floor(startX), y: Math.floor(startY) },
        ];
        const visited = new Set();

        while (pixelsToCheck.length > 0) {
          const { x, y } = pixelsToCheck.pop()!;
          const pos = (y * width + x) * 4;

          const key = `${x},${y}`;
          if (visited.has(key)) continue;
          visited.add(key);

          if (
            x >= 0 &&
            x < width &&
            y >= 0 &&
            y < height &&
            Math.abs(data[pos] - startR) <= threshold &&
            Math.abs(data[pos + 1] - startG) <= threshold &&
            Math.abs(data[pos + 2] - startB) <= threshold &&
            Math.abs(data[pos + 3] - startA) <= threshold
          ) {
            data[pos] = fillR;
            data[pos + 1] = fillG;
            data[pos + 2] = fillB;
            data[pos + 3] = fillA;

            pixelsToCheck.push({ x: x + 1, y });
            pixelsToCheck.push({ x: x - 1, y });
            pixelsToCheck.push({ x, y: y + 1 });
            pixelsToCheck.push({ x, y: y - 1 });
          }
        }

        ctx.putImageData(imageData, 0, 0);
        saveCanvasState();
      } catch (error) {
        console.error("Error in flood fill:", error);
      }
    },
    [ctx, saveCanvasState]
  );

  // Add double click listener
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleCanvasDoubleClick = (e: MouseEvent) => {
      e.preventDefault();
      handleDoubleClick();
    };

    canvas.addEventListener("dblclick", handleCanvasDoubleClick);

    return () => {
      canvas.removeEventListener("dblclick", handleCanvasDoubleClick);
    };
  }, [handleDoubleClick]);

  // Handle key events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        if (currentTool === "line" && lineToolState.isDrawing) {
          setLineToolState((prev) => ({ ...prev, shiftKey: true }));
        } else if (
          (currentTool === "rectangle" || currentTool === "circle") &&
          shapeToolState.isDrawing
        ) {
          setShapeToolState((prev) => ({ ...prev, shiftKey: true }));
        }
      } else if (e.key === "Escape") {
        if (currentTool === "polygon" && polygonToolState.isDrawing) {
          setPolygonToolState({
            points: [],
            isDrawing: false,
            tempEndX: 0,
            tempEndY: 0,
          });
          clearTempCanvas();
        } else if (currentTool === "text" && textToolState.isPlacing) {
          setTextToolState({
            x: 0,
            y: 0,
            text: "",
            fontSize: fontSize,
            fontFamily: fontFamily,
            isPlacing: false,
          });
          setShowTextInput(false);
        } else if (
          currentTool === "selection" &&
          selectionToolState.selectedImageData
        ) {
          setSelectionToolState({
            startX: 0,
            startY: 0,
            endX: 0,
            endY: 0,
            isSelecting: false,
            selectedImageData: null,
            isDragging: false,
            dragStartX: 0,
            dragStartY: 0,
          });
          clearTempCanvas();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        if (currentTool === "line" && lineToolState.isDrawing) {
          setLineToolState((prev) => ({ ...prev, shiftKey: false }));
        } else if (
          (currentTool === "rectangle" || currentTool === "circle") &&
          shapeToolState.isDrawing
        ) {
          setShapeToolState((prev) => ({ ...prev, shiftKey: false }));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    currentTool,
    lineToolState.isDrawing,
    shapeToolState.isDrawing,
    polygonToolState.isDrawing,
    textToolState.isPlacing,
    selectionToolState.selectedImageData,
    fontSize,
    fontFamily,
    clearTempCanvas,
  ]);

  // Handle undo
  function handleUndo() {
    if (history.length <= 1) return;

    const newHistory = [...history];
    const lastState = newHistory.pop();

    if (lastState) {
      setRedoStack((prev) => [...prev, lastState]);
    }

    setHistory(newHistory);

    if (newHistory.length > 0 && canvasRef.current && ctx) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = newHistory[newHistory.length - 1].imageData;
      img.onload = () => {
        ctx.clearRect(
          0,
          0,
          canvasRef.current!.width,
          canvasRef.current!.height
        );
        ctx.drawImage(img, 0, 0);
      };
    }
  }

  // Handle redo
  function handleRedo() {
    if (redoStack.length === 0) return;

    const newRedoStack = [...redoStack];
    const nextState = newRedoStack.pop();

    if (nextState) {
      setHistory((prev) => [...prev, nextState]);
      setRedoStack(newRedoStack);

      if (canvasRef.current && ctx) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = nextState.imageData;
        img.onload = () => {
          ctx.clearRect(
            0,
            0,
            canvasRef.current!.width,
            canvasRef.current!.height
          );
          ctx.drawImage(img, 0, 0);
        };
      }
    }
  }

  // Clear canvas
  const clearCanvas = useCallback(() => {
    if (!ctx || !canvasRef.current) return;

    saveCanvasState();

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setShowConfirmClear(false);

    saveCanvasState();
  }, [ctx, saveCanvasState]);

  // Save canvas as image
  const handleSave = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;

    const highResCanvas = document.createElement("canvas");
    const highResCtx = highResCanvas.getContext("2d", {
      willReadFrequently: true,
    });

    highResCanvas.width = canvas.width * 2;
    highResCanvas.height = canvas.height * 2;

    if (highResCtx) {
      highResCtx.scale(2, 2);
      highResCtx.drawImage(canvas, 0, 0);

      highResCanvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], "nft-artwork.png", {
              type: "image/png",
            });
            const url = URL.createObjectURL(blob);
            onImageGenerated(file, url);
          }
        },
        "image/png",
        1.0
      );
    }
  }, [onImageGenerated]);

  // Handle tool change
  const handleToolChange = useCallback(
    (tool: CanvasTool) => {
      setIsDrawing(false);
      clearTempCanvas();

      if (currentTool === "polygon" && polygonToolState.isDrawing) {
        setPolygonToolState({
          points: [],
          isDrawing: false,
          tempEndX: 0,
          tempEndY: 0,
        });
      }

      if (currentTool === "text" && textToolState.isPlacing) {
        setTextToolState({
          x: 0,
          y: 0,
          text: "",
          fontSize: fontSize,
          fontFamily: fontFamily,
          isPlacing: false,
        });
        setShowTextInput(false);
      }

      if (currentTool === "selection" && selectionToolState.selectedImageData) {
        setSelectionToolState({
          startX: 0,
          startY: 0,
          endX: 0,
          endY: 0,
          isSelecting: false,
          selectedImageData: null,
          isDragging: false,
          dragStartX: 0,
          dragStartY: 0,
        });
      }

      setCurrentTool(tool);
    },
    [
      currentTool,
      polygonToolState.isDrawing,
      textToolState.isPlacing,
      selectionToolState.selectedImageData,
      clearTempCanvas,
    ]
  );

  // Handle color change
  const handleColorChange = useCallback((color: string) => {
    setCurrentColor(color);
  }, []);

  // Handle brush size change
  const handleBrushSizeChange = useCallback((size: number) => {
    setBrushSize(size);
  }, []);

  // Handle fill mode toggle
  const handleFillModeToggle = useCallback(() => {
    setIsFilled((prev) => !prev);
  }, []);

  // Handle clear confirmation
  const handleClearConfirm = useCallback(() => {
    setShowConfirmClear(true);
  }, []);

  // Handle background change
  const handleBackgroundChange = useCallback((background: string) => {
    setCurrentBackground(background);

    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    canvas.style.backgroundColor = "";
    canvas.style.backgroundImage = "";
    canvas.style.backgroundSize = "";

    switch (background) {
      case "transparent":
        canvas.style.backgroundColor = "transparent";
        break;
      case "white":
        canvas.style.backgroundColor = "#ffffff";
        break;
      case "black":
        canvas.style.backgroundColor = "#000000";
        break;
      case "dark-gray":
        canvas.style.backgroundColor = "#1a1a1a";
        break;
      case "navy":
        canvas.style.backgroundColor = "#000080";
        break;
      case "deep-purple":
        canvas.style.backgroundColor = "#301934";
        break;
      case "canvas-texture":
        canvas.style.backgroundColor = "#f5f5dc";
        canvas.style.backgroundImage = "url('/canvas-texture.png')";
        break;
      case "circuit":
        canvas.style.backgroundColor = "#0a0a0a";
        canvas.style.backgroundImage = "url('/circuit-pattern.png')";
        break;
      case "hex-grid":
        canvas.style.backgroundColor = "#0a192f";
        canvas.style.backgroundImage = "url('/hex-grid.png')";
        break;
      case "digital-noise":
        canvas.style.backgroundColor = "#111";
        canvas.style.backgroundImage = "url('/digital-noise.png')";
        break;
      case "neon-gradient":
        canvas.style.backgroundImage =
          "linear-gradient(135deg, #00f5ff, #9d00ff)";
        break;
      case "cyber-gradient":
        canvas.style.backgroundImage =
          "linear-gradient(135deg, #ff00ff, #00f5ff)";
        break;
      case "green-gradient":
        canvas.style.backgroundImage =
          "linear-gradient(135deg, #39ff14, #00f5ff)";
        break;
      case "parchment":
        canvas.style.backgroundColor = "#f5f0e1";
        canvas.style.backgroundImage = "url('/parchment.png')";
        break;
      case "sketch":
        canvas.style.backgroundColor = "#ffffff";
        canvas.style.backgroundImage = "url('/sketch-paper.png')";
        break;
      case "holographic":
        canvas.style.backgroundImage =
          "linear-gradient(135deg, #ff00ff, #00f5ff, #39ff14)";
        break;
      case "matrix":
        canvas.style.backgroundColor = "#000";
        canvas.style.backgroundImage = "url('/matrix-pattern.png')";
        break;
      case "geometric":
        canvas.style.backgroundColor = "#0a0a0a";
        canvas.style.backgroundImage = "url('/geometric-mesh.png')";
        break;
      case "grid":
        canvas.style.backgroundColor = "#ffffff";
        canvas.style.backgroundImage = "url('/grid-pattern.png')";
        canvas.style.backgroundSize = "20px 20px";
        break;
      case "dots":
        canvas.style.backgroundColor = "#ffffff";
        canvas.style.backgroundImage =
          "radial-gradient(circle, #000000 1px, transparent 1px)";
        canvas.style.backgroundSize = "20px 20px";
        break;
      default:
        if (background.startsWith("#")) {
          canvas.style.backgroundColor = background;
        }
    }
  }, []);

  // Update cursor
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    switch (currentTool) {
      case "brush":
        canvas.style.cursor =
          'url("data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="3"/></svg>") 12 12, auto';
        break;
      case "eraser":
        canvas.style.cursor =
          'url("data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="8" y="8" width="8" height="8" rx="2"/></svg>") 12 12, auto';
        break;
      case "line":
        canvas.style.cursor = "crosshair";
        break;
      case "rectangle":
      case "circle":
        canvas.style.cursor = "crosshair";
        break;
      case "polygon":
        canvas.style.cursor = "crosshair";
        break;
      case "text":
        canvas.style.cursor = "text";
        break;
      case "fill":
        canvas.style.cursor =
          'url("data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M19 11h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h2V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2z"/></svg>") 12 12, auto';
        break;
      case "eyedropper":
        canvas.style.cursor =
          'url("data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/></svg>") 12 12, auto';
        break;
      case "selection":
        canvas.style.cursor = "default";
        break;
      default:
        canvas.style.cursor = "default";
    }
  }, [currentTool]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex-grow flex flex-col">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold ">Create Your NFT Artwork</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleFillModeToggle}
              className={`px-3 py-1 rounded-md text-sm ${
                isFilled
                  ? "bg-cyan-900/50 text-cyan-400 shadow-lg shadow-cyan-500/20"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-gray-300"
              }`}
            >
              {isFilled ? "Filled" : "Outline"}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg text-white font-medium transition-all duration-300 shadow-lg shadow-purple-500/20 flex items-center gap-2"
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
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Save NFT
            </button>
          </div>
        </div>

        <div className="relative flex-grow flex justify-center items-center bg-gray-950/50 rounded-lg border border-gray-800/50 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/scale.svg')] opacity-5"></div>

          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="relative z-10 touch-none shadow-2xl shadow-cyan-500/10 border border-gray-800/50 rounded-lg"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />

          <canvas
            ref={tempCanvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="absolute z-20 touch-none pointer-events-none"
            style={{ top: 0, left: 0 }}
          />
        </div>

        <CanvasToolbar
          currentTool={currentTool}
          setCurrentTool={handleToolChange}
          currentColor={currentColor}
          setCurrentColor={handleColorChange}
          brushSize={brushSize}
          setBrushSize={handleBrushSizeChange}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClear={handleClearConfirm}
          canUndoRedo={{
            canUndo: history.length > 1,
            canRedo: redoStack.length > 0,
          }}
          currentBackground={currentBackground}
          onBackgroundChange={handleBackgroundChange}
        />
      </div>

      {showTextInput && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-medium text-white mb-4">Enter Text</h3>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white mb-4"
              placeholder="Enter your text here..."
              autoFocus
            />
            <div className="flex flex-col space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Font Size
                </label>
                <input
                  type="range"
                  min="10"
                  max="72"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number.parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="text-right text-sm text-gray-400">
                  {fontSize}px
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Font Family
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
                >
                  <option value="Arial">Arial</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Trebuchet MS">Trebuchet MS</option>
                  <option value="Impact">Impact</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowTextInput(false);
                  setTextToolState((prev) => ({ ...prev, isPlacing: false }));
                }}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTextSubmit}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md text-white transition-colors"
              >
                Add Text
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmClear && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-medium text-white mb-4">
              Clear Canvas?
            </h3>
            <p className="text-gray-400 mb-6">
              This action cannot be undone. Are you sure you want to clear the
              canvas?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={clearCanvas}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
