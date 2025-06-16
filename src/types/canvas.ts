export type CanvasTool =
  | "brush"
  | "eraser"
  | "line"
  | "rectangle"
  | "circle"
  | "polygon"
  | "text"
  | "fill"
  | "eyedropper"
  | "selection"

export interface CanvasHistory {
  imageData: string
}
