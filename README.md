@xai/canvas-drawing
A reusable React canvas drawing component with a variety of tools including brush, eraser, shapes, text, and more.
Installation
npm install @xai/canvas-drawing

Prerequisites
This package requires the following peer dependencies:

react (^17.0.0 or ^18.0.0)
react-dom (^17.0.0 or ^18.0.0)
react-hotkeys-hook (^4.0.0)

You may also need to install shadcn/ui components (e.g., Tooltip, Slider, Popover) or their underlying Radix UI primitives, as the CanvasToolbar uses them.
Usage
import { CanvasDrawing } from '@xai/canvas-drawing';
import 'tailwindcss/tailwind.css'; // Required for styling

function App() {
const handleImageGenerated = (file, url) => {
console.log('Image generated:', file, url);
// Example: Save the file or display the image
};

return (
<div className="h-screen">
<CanvasDrawing
        onImageGenerated={handleImageGenerated}
        initialWidth={800}
        initialHeight={600}
        initialBackground="canvas-texture"
        initialTool="brush"
        initialColor="#00f5ff"
        initialBrushSize={10}
      />
</div>
);
}

export default App;

Props

Prop
Type
Default
Description

onImageGenerated
Function
Required
Callback when the canvas image is saved (receives File and URL).

initialWidth
Number
800
Initial canvas width.

initialHeight
Number
600
Initial canvas height.

initialBackground
String
"canvas-texture"
Initial background style (e.g., "white", "neon-gradient").

initialTool
CanvasTool
"brush"
Initial drawing tool.

initialColor
String
"#00f5ff"
Initial color (hex format).

initialBrushSize
Number
10
Initial brush size.

Notes

The component uses Tailwind CSS for styling. Ensure Tailwind is configured in your project.
Background images (e.g., canvas-texture.png) referenced in the component must be available in your project's public directory or served via a CDN.
The CanvasToolbar relies on shadcn/ui components. You may need to install and configure them separately.

License
MIT
