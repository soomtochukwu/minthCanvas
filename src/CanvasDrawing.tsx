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
      isSelecting: true,
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
        context.fillStyle = currentColor;
        context.lineWidth = brushSize;

        tempContext.lineCap = "round";
        tempContext.lineJoin = "round";
        tempContext.strokeStyle = currentColor;
        tempContext.fillStyle = currentColor;
        tempContext.lineWidth = brushSize;

        setCtx(context);
        setTempCtx(tempContext);

        // Save initial canvas state
        const initialState = canvas.toDataURL("image/png");
        setHistory([{ imageData: initialState }]);
      }
    }
  }, []);

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

    // Validate color to ensure it's a valid hex code
    const validColor = /^#[0-9A-Fa-f]{6}$/.test(currentColor)
      ? currentColor
      : "#00f5ff";

    ctx.strokeStyle = validColor;
    ctx.fillStyle = validColor;
    ctx.lineWidth = brushSize;

    tempCtx.strokeStyle = validColor;
    tempCtx.fillStyle = validColor;
    tempCtx.lineWidth = brushSize;
  }, [ctx, tempCtx, currentColor, brushSize]);

  // Handle undo
  const handleUndo = useCallback(() => {
    if (!ctx || !canvasRef.current || history.length <= 1) return;

    const currentState = canvasRef.current.toDataURL("image/png");
    setRedoStack((prev) => [...prev, { imageData: currentState }]);

    setHistory((prev) => {
      const newHistory = prev.slice(0, -1);
      const lastState = newHistory[newHistory.length - 1];

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = lastState.imageData;
      img.onload = () => {
        ctx.clearRect(
          0,
          0,
          canvasRef.current!.width,
          canvasRef.current!.height
        );
        ctx.drawImage(
          img,
          0,
          0,
          canvasRef.current!.width,
          canvasRef.current!.height
        );
      };

      return newHistory;
    });
  }, [ctx, history]);

  // Handle redo
  const handleRedo = useCallback(() => {
    if (!ctx || !canvasRef.current || redoStack.length === 0) return;

    const currentState = canvasRef.current.toDataURL("image/png");
    setHistory((prev) => [...prev, { imageData: currentState }]);

    const redoState = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = redoState.imageData;
    img.onload = () => {
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      ctx.drawImage(
        img,
        0,
        0,
        canvasRef.current!.width,
        canvasRef.current!.height
      );
    };
  }, [ctx, redoStack]);

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
          tempCtx.fillStyle = currentColor;
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
          if (selectionToolState.isSelecting) {
            clearTempCanvas();

            const minX = Math.min(selectionToolState.startX, x);
            const minY = Math.min(selectionToolState.startY, y);
            const width = Math.abs(x - selectionToolState.startX);
            const height = Math.abs(y - selectionToolState.startY);

            if (width > 0 && height > 0) {
              const imageData = ctx.getImageData(minX, minY, width, height);
              setSelectionToolState((prev) => ({
                ...prev,
                endX: x,
                endY: y,
                isSelecting: false,
                selectedImageData: imageData,
              }));
            } else {
              setSelectionToolState((prev) => ({
                ...prev,
                isSelecting: false,
                selectedImageData: null,
              }));
            }
          } else if (selectionToolState.isDragging) {
            const offsetX = x - selectionToolState.dragStartX;
            const offsetY = y - selectionToolState.dragStartY;

            ctx.putImageData(
              selectionToolState.selectedImageData!,
              selectionToolState.startX + offsetX,
              selectionToolState.startY + offsetY
            );

            clearTempCanvas();

            setSelectionToolState((prev) => ({
              ...prev,
              startX: prev.startX + offsetX,
              startY: prev.startY + offsetY,
              isDragging: false,
              dragStartX: 0,
              dragStartY: 0,
            }));

            saveCanvasState();
          }
          break;
      }
    },
    [
      ctx,
      tempCtx,
      currentTool,
      isDrawing,
      lineToolState,
      shapeToolState,
      isFilled,
      selectionToolState,
      getPointerPosition,
      clearTempCanvas,
      calculateConstrainedLine,
      calculateConstrainedRect,
      saveCanvasState,
    ]
  );

  // Flood fill algorithm
  const floodFill = useCallback(
    (startX: number, startY: number, fillColor: string) => {
      if (!ctx || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const startColor = ctx.getImageData(startX, startY, 1, 1).data;
      const targetColor = [
        startColor[0],
        startColor[1],
        startColor[2],
        startColor[3],
      ];
      const fillColorRGB = hexToRgb(fillColor);
      if (!fillColorRGB) return;

      const newColor = [fillColorRGB.r, fillColorRGB.g, fillColorRGB.b, 255];

      if (
        targetColor[0] === newColor[0] &&
        targetColor[1] === newColor[1] &&
        targetColor[2] === newColor[2] &&
        targetColor[3] === newColor[3]
      ) {
        return;
      }

      const stack: Array<[number, number]> = [
        [Math.floor(startX), Math.floor(startY)],
      ];
      const width = canvas.width;
      const height = canvas.height;

      while (stack.length) {
        const [x, y] = stack.pop()!;
        const idx = (y * width + x) * 4;

        if (
          x < 0 ||
          x >= width ||
          y < 0 ||
          y >= height ||
          !matchColor(data, idx, targetColor)
        ) {
          continue;
        }

        data[idx] = newColor[0];
        data[idx + 1] = newColor[1];
        data[idx + 2] = newColor[2];
        data[idx + 3] = newColor[3];

        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
      }

      ctx.putImageData(imageData, 0, 0);
      saveCanvasState();
    },
    [ctx, saveCanvasState]
  );

  // Helper to convert hex to RGB
  const hexToRgb = (
    hex: string
  ): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  // Helper to match colors in flood fill
  const matchColor = (
    data: Uint8ClampedArray,
    idx: number,
    targetColor: number[]
  ): boolean => {
    return (
      data[idx] === targetColor[0] &&
      data[idx + 1] === targetColor[1] &&
      data[idx + 2] === targetColor[2] &&
      data[idx + 3] === targetColor[3]
    );
  };

  // Pick color with eyedropper
  const pickColor = useCallback(
    (x: number, y: number) => {
      if (!ctx) return;

      const pixel = ctx.getImageData(x, y, 1, 1).data;
      const color = rgbToHex(pixel[0], pixel[1], pixel[2]);
      setCurrentColor(color);
    },
    [ctx]
  );

  // Convert RGB to hex
  const rgbToHex = (r: number, g: number, b: number): string => {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  };

  // Handle text input submission
  const handleTextSubmit = useCallback(() => {
    if (!ctx || !textToolState.isPlacing || textInput.trim() === "") return;

    ctx.font = `${textToolState.fontSize}px ${textToolState.fontFamily}`;
    ctx.fillStyle = currentColor;
    ctx.fillText(textInput, textToolState.x, textToolState.y);

    setTextToolState((prev) => ({ ...prev, isPlacing: false }));
    setShowTextInput(false);
    setTextInput("");
    saveCanvasState();
  }, [ctx, textToolState, textInput, currentColor, saveCanvasState]);

  // Handle clear canvas
  const handleClear = useCallback(() => {
    if (!ctx || !canvasRef.current) return;

    setShowConfirmClear(true);
  }, [ctx]);

  // Confirm clear canvas
  const confirmClear = useCallback(() => {
    if (!ctx || !canvasRef.current) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveCanvasState();
    setShowConfirmClear(false);
  }, [ctx, saveCanvasState]);

  // Handle save
  const handleSave = useCallback(() => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "canvas_drawing.png", {
          type: "image/png",
        });
        const url = URL.createObjectURL(blob);
        onImageGenerated(file, url);
      }
    }, "image/png");
  }, [onImageGenerated]);

  // Handle background change
  const handleBackgroundChange = useCallback(
    (background: string) => {
      setCurrentBackground(background);

      if (!ctx || !canvasRef.current) return;

      // Preserve current drawing
      const currentDrawing = canvasRef.current.toDataURL();

      // Apply new background
      const canvas = canvasRef.current;
      canvas.style.background = getBackgroundStyle(background);

      // Restore drawing
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = currentDrawing;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };

      saveCanvasState();
    },
    [ctx, saveCanvasState]
  );

  // Get background style
  const getBackgroundStyle = (background: string): string => {
    switch (background) {
      case "transparent":
        return "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiNmMWYxZjEiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iI2YxZjFmMSIvPjwvc3ZnPg==')";
      case "white":
        return "#ffffff";
      case "black":
        return "#000000";
      case "dark-gray":
        return "#1a1a1a";
      case "navy":
        return "#000080";
      case "deep-purple":
        return "#301934";
      case "canvas-texture":
        return "#f5f5dc url('/canvas-texture.png')";
      case "circuit":
        return "#0a0a0a url('/circuit-pattern.png')";
      case "hex-grid":
        return "#0a192f url('/hex-grid.png')";
      case "digital-noise":
        return "#111 url('/digital-noise.png')";
      case "neon-gradient":
        return "linear-gradient(135deg, #00f5ff, #9d00ff)";
      case "cyber-gradient":
        return "linear-gradient(135deg, #ff00ff, #00f5ff)";
      case "green-gradient":
        return "linear-gradient(135deg, #39ff14, #00f5ff)";
      case "parchment":
        return "#f5f0e1 url('/parchment.png')";
      case "sketch":
        return "#ffffff url('/sketch-paper.png')";
      case "holographic":
        return "linear-gradient(135deg, #ff00ff, #00f5ff, #39ff14)";
      case "matrix":
        return "#000 url('/matrix-pattern.png')";
      case "geometric":
        return "#0a0a0a url('/geometric-mesh.png')";
      default:
        return background.startsWith("#") ? background : "#f5f5dc";
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      <CanvasToolbar
        currentTool={currentTool}
        setCurrentTool={setCurrentTool}
        currentColor={currentColor}
        setCurrentColor={setCurrentColor}
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
        canUndoRedo={{
          canUndo: history.length > 1,
          canRedo: redoStack.length > 0,
        }}
        currentBackground={currentBackground}
        onBackgroundChange={handleBackgroundChange}
      />
      <div className="flex-grow relative mt-4">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 border border-gray-800 rounded-lg shadow-lg"
          style={{
            background: getBackgroundStyle(currentBackground),
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <canvas
          ref={tempCanvasRef}
          className="absolute top-0 left-0 pointer-events-none"
        />
      </div>
      {showTextInput && (
        <div className="absolute top-4 left-4 bg-gray-900 p-4 rounded-lg border border-gray-800">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="bg-gray-800 text-white p-2 rounded"
            placeholder="Enter text"
            autoFocus
          />
          <button
            onClick={handleTextSubmit}
            className="ml-2 bg-cyan-500 text-black px-4 py-2 rounded"
          >
            Apply
          </button>
        </div>
      )}
      {showConfirmClear && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <p className="text-white mb-4">
              Are you sure you want to clear the canvas?
            </p>
            <div className="flex gap-4">
              <button
                onClick={confirmClear}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="bg-gray-700 text-white px-4 py-2 rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
