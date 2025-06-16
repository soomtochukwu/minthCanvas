# @maziofweb3/minth-canvas

A reusable React component for creating interactive canvas-based drawings, designed for web3 applications like NFT creation on platforms such as Lisk and Celo. Built with HTML5 Canvas and React hooks, it features a dual-canvas approach for optimized performance, supporting tools like brush, eraser, shapes, text, and more, with undo/redo and image export capabilities. Optimized for use in Next.js applications with the App Router.

## Features

- **Drawing Tools**: Brush, eraser, line, rectangle, circle, polygon, text, fill, eyedropper, and selection.
- **Real-Time Previews**: Uses a temporary canvas for smooth drawing previews.
- **Undo/Redo**: History management with up to 20 steps.
- **Keyboard Shortcuts**: Powered by `react-hotkeys-hook` for tool selection and actions.
- **Background Customization**: Supports solid colors, transparent backgrounds, or custom images.
- **Image Export**: Generates high-resolution PNGs via a callback for NFT or other use cases.
- **Responsive**: Handles mouse and touch events for cross-device compatibility.

## Installation

```bash
npm install @maziofweb3/minth-canvas --legacy-peer-deps
```

## Prerequisites

- **Dependencies**:
  ```bash
  npm install @radix-ui/react-tooltip @radix-ui/react-slider @radix-ui/react-popover
  ```
- **Peer Dependencies**:
  ```bash
  npm install react react-dom react-hotkeys-hook clsx tailwind-merge
  ```
- **Next.js**: Requires Next.js 13 or later with the App Router. Components using `@maziofweb3/minth-canvas` must include the `"use client"` directive for React Server Components.
- **Tailwind CSS**: Configure Tailwind CSS in your Next.js project for styling. See [Tailwind CSS Setup](#tailwind-css-setup).
- **Background Images**: Place images like `canvas-texture.png`, `circuit-pattern.png`, or `hex-grid.png` in your `public` directory or serve via a CDN. See [Background Customization](#background-customization).

## Usage

The `CanvasDrawing` component is designed for client-side rendering in Next.js App Router applications. Since it includes interactive features and uses client-side hooks, you must mark the component or page with `"use client"`.

### Example: Using in a Next.js Page

Create a client component (e.g., `app/canvas/page.tsx`) in your Next.js App Router project:

```tsx
"use client";

import { CanvasDrawing } from "@maziofweb3/minth-canvas";
import "tailwindcss/tailwind.css";

export default function CanvasPage() {
  const handleImageGenerated = (file: File, url: string) => {
    console.log("Image generated:", file, url);
    // Example: Display the image
    const img = new Image();
    img.src = url;
    document.body.appendChild(img);
  };

  return (
    <div className="h-screen">
      <CanvasDrawing
        onImageGenerated={handleImageGenerated}
        initialWidth={800}
        initialHeight={600}
        initialBackground="white"
        initialTool="brush"
        initialColor="#00f5ff"
        initialBrushSize={10}
      />
    </div>
  );
}
```

### Example: Using in a Client Component

If you want to use `CanvasDrawing` within a server component, wrap it in a client component. Create a client component (e.g., `components/CanvasWrapper.tsx`):

```tsx
"use client";

import { CanvasDrawing } from "@maziofweb3/minth-canvas";

interface CanvasWrapperProps {
  onImageGenerated: (file: File, url: string) => void;
}

export default function CanvasWrapper({
  onImageGenerated,
}: CanvasWrapperProps) {
  return (
    <div className="h-screen">
      <CanvasDrawing
        onImageGenerated={onImageGenerated}
        initialWidth={800}
        initialHeight={600}
        initialBackground="white"
        initialTool="brush"
        initialColor="#00f5ff"
        initialBrushSize={10}
      />
    </div>
  );
}
```

Then, import it into a server component or page (e.g., `app/nft/page.tsx`):

```tsx
import CanvasWrapper from "@/components/CanvasWrapper";

export default function NFTPage() {
  const handleImageGenerated = (file: File, url: string) => {
    console.log("Image generated:", file, url);
  };

  return (
    <main>
      <h1>Create NFT Artwork</h1>
      <CanvasWrapper onImageGenerated={handleImageGenerated} />
    </main>
  );
}
```

**Note**: Ensure your Next.js project includes Tailwind CSS styles by importing `tailwindcss/tailwind.css` in a global CSS file or a layout component.

## API

### `CanvasDrawing` Props

| Prop                | Type                                | Default            | Description                                                                  |
| ------------------- | ----------------------------------- | ------------------ | ---------------------------------------------------------------------------- |
| `onImageGenerated`  | `(file: File, url: string) => void` | Required           | Callback when the canvas image is saved as a PNG. Receives the file and URL. |
| `initialWidth`      | `number`                            | `800`              | Initial canvas width in pixels.                                              |
| `initialHeight`     | `number`                            | `600`              | Initial canvas height in pixels.                                             |
| `initialBackground` | `string`                            | `"canvas-texture"` | Initial background style (e.g., `"white"`, `"transparent"`, or image name).  |
| `initialTool`       | `CanvasTool`                        | `"brush"`          | Initial drawing tool. See [Supported Tools](#supported-tools).               |
| `initialColor`      | `string`                            | `"#00f5ff"`        | Initial color in hex format (e.g., `"#ff0000"`).                             |
| `initialBrushSize`  | `number`                            | `10`               | Initial brush size in pixels.                                                |

### Supported Tools

```typescript
type CanvasTool =
  | "brush"
  | "eraser"
  | "line"
  | "rectangle"
  | "circle"
  | "polygon"
  | "text"
  | "fill"
  | "eyedropper"
  | "selection";
```

### Keyboard Shortcuts

Powered by `react-hotkeys-hook`:

- **Tools**:
  - `b`: Brush
  - `e`: Eraser
  - `l`: Line
  - `r`: Rectangle
  - `c`: Circle
  - `p`: Polygon
  - `t`: Text
  - `f`: Fill
  - `i`: Eyedropper
  - `s`: Selection
- **Actions**:
  - `Ctrl+Z`: Undo
  - `Ctrl+Y`: Redo

## Tailwind CSS Setup

Configure Tailwind CSS in your Next.js project:

1. Install Tailwind CSS:

   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

2. Update `tailwind.config.js`:

   ```javascript
   /** @type {import('tailwindcss').Config} */
   module.exports = {
     content: [
       "./app/**/*.{js,ts,jsx,tsx,mdx}",
       "./pages/**/*.{js,ts,jsx,tsx,mdx}",
       "./components/**/*.{js,ts,jsx,tsx,mdx}",
       "./node_modules/@maziofweb3/minth-canvas/dist/**/*.{js,jsx,ts,tsx}",
     ],
     theme: {
       extend: {},
     },
     plugins: [],
   };
   ```

3. Create or update `app/globals.css`:

   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

4. Ensure `globals.css` is imported in your root layout (`app/layout.tsx`):

   ```tsx
   import "./globals.css";

   export default function RootLayout({ children }) {
     return (
       <html lang="en">
         <body>{children}</body>
       </html>
     );
   }
   ```

## Background Customization

The `initialBackground` prop supports:

- Solid colors: `"white"`, `"transparent"`, or any valid CSS color.
- Image-based backgrounds: Place image files (e.g., `canvas-texture.png`) in your Next.js `public` directory (e.g., `public/canvas-texture.png`) or serve via a CDN. Example values:
  - `"canvas-texture"`
  - `"circuit-pattern"`
  - `"hex-grid"`

## Advanced Usage

### Architecture

The package uses a dual-canvas approach:

- **Main Canvas**: Stores finalized drawings.
- **Temporary Canvas**: Renders real-time previews for performance.

State management is handled via React hooks, with history stored as data URLs for undo/redo.

### Extending the Canvas

To add a new tool:

1. Update `types/canvas.ts` to include the new tool type.
2. Add tool-specific state in `CanvasDrawing.tsx`.
3. Update `CanvasToolbar.tsx` with a button for the tool.
4. Implement drawing logic in `startDrawing`, `draw`, and `stopDrawing` functions.
5. Add a keyboard shortcut if desired.

See the [Contributor Guide](CONTRIBUTING.md) for detailed instructions.

## Contributing

Contributions are welcome! Please read our [Contributor Guide](CONTRIBUTING.md) for setup instructions, coding standards, and how to add features or fix bugs.

1. Fork the repository: `https://github.com/soomtochukwu/minthCanvas`
2. Create a feature branch: `git checkout -b feature/new-tool`
3. Commit changes: `git commit -m "Add new tool"`
4. Push to the branch: `git push origin feature/new-tool`
5. Open a pull request.

## License

MIT License. See [LICENSE](LICENSE) for details.

## Support

For issues, feature requests, or questions, open an issue on [GitHub](https://github.com/soomtochukwu/minthCanvas/issues).

## Keywords

- React
- Canvas
- Drawing
- Web3
- Art
- Minth
- Lisk
- Celo
