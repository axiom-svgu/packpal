import { useEffect, useState } from "react";

// Available transport types
type TransportType =
  | "paperplane"
  | "bus"
  | "car"
  | "train"
  | "boat"
  | "bicycle"
  | "helicopter"
  | "rocket"
  | "tram";

interface TransportElement {
  id: number;
  type: TransportType;
  position: { x: number; y: number };
  rotation: number;
  scale: number;
  opacity: number;
}

// SVG outline icons for each transport type
const transportIcons: Record<TransportType, React.ReactNode> = {
  paperplane: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.5"
      width="24"
      height="24"
    >
      <path d="M22 2L2 10l9 3L14 22l8-20z" />
      <path d="M22 2L13 13" />
    </svg>
  ),
  bus: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.5"
      width="24"
      height="24"
    >
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <circle cx="7" cy="19" r="1" />
      <circle cx="17" cy="19" r="1" />
      <path d="M5 5V3h14v2" />
    </svg>
  ),
  car: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.5"
      width="24"
      height="24"
    >
      <path d="M3 9l2-5h14l2 5" />
      <rect x="2" y="9" width="20" height="10" rx="2" />
      <circle cx="7" cy="19" r="1" />
      <circle cx="17" cy="19" r="1" />
    </svg>
  ),
  train: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.5"
      width="28"
      height="28"
    >
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M4 11h16" />
      <path d="M12 3v8" />
      <circle cx="8" cy="18" r="1" />
      <circle cx="16" cy="18" r="1" />
    </svg>
  ),
  boat: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.5"
      width="24"
      height="24"
    >
      <path d="M12 3v10l9 4-9 4-9-4 9-4" />
      <path d="M4 11l8-8 8 8" />
    </svg>
  ),
  bicycle: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.5"
      width="28"
      height="28"
    >
      <circle cx="6" cy="15" r="4" />
      <circle cx="18" cy="15" r="4" />
      <path d="M6 15l6-9 6 9-6-3z" />
    </svg>
  ),
  helicopter: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.5"
      width="28"
      height="28"
    >
      <path d="M4 12h16" />
      <path d="M12 4c5.5 0 8 2.5 8 8H4c0-5.5 2.5-8 8-8z" />
      <path d="M16 16c0 2-1.8 3-4 3s-4-1-4-3" />
      <path d="M12 4v4" />
    </svg>
  ),
  rocket: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.5"
      width="24"
      height="24"
    >
      <path d="M12 2l5 10-5 10-5-10z" />
      <path d="M7 12h10" />
      <path d="M7 5c-3 2.5-3 9.5 0 14" />
      <path d="M17 5c3 2.5 3 9.5 0 14" />
    </svg>
  ),
  tram: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="1.5"
      width="24"
      height="24"
    >
      <rect x="5" y="5" width="14" height="15" rx="2" />
      <path d="M5 10h14" />
      <path d="M9 20l-2 2" />
      <path d="M15 20l2 2" />
      <path d="M8 2h8" />
      <path d="M12 2v3" />
    </svg>
  ),
};

export default function BackgroundElements() {
  const [elements, setElements] = useState<TransportElement[]>([]);

  useEffect(() => {
    // Create a more evenly distributed pattern with subtle randomness
    const generateElements = () => {
      const newElements: TransportElement[] = [];
      const transportTypes = Object.keys(transportIcons) as TransportType[];
      let idCounter = 0;

      // Screen dimensions
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Define grid spacing - increase spacing to make less crowded
      const horizontalSpacing = 240;
      const verticalSpacing = 240;

      // Calculate rows and columns
      const columns = Math.floor(screenWidth / horizontalSpacing) + 1;
      const rows = Math.floor(screenHeight / verticalSpacing) + 1;

      // Pattern distribution settings - less elements will be skipped
      const skipPattern = [
        [0, 0, 0, 1],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [1, 0, 0, 0],
      ];

      // Small offset for each row to create a more natural staggered look
      const rowOffsets = [
        0,
        horizontalSpacing / 3,
        -horizontalSpacing / 4,
        horizontalSpacing / 2,
      ];

      for (let row = 0; row < rows; row++) {
        const rowOffset = rowOffsets[row % rowOffsets.length];

        for (let col = 0; col < columns; col++) {
          // Use pattern to create balanced distribution
          if (
            skipPattern[row % skipPattern.length][
              col % skipPattern[0].length
            ] === 1
          ) {
            continue;
          }

          // Base position with slight offset for each row
          const baseX = col * horizontalSpacing + rowOffset;
          const baseY = row * verticalSpacing;

          // Add subtle randomness (reduced compared to previous version)
          const jitterX = (Math.random() - 0.5) * horizontalSpacing * 0.25;
          const jitterY = (Math.random() - 0.5) * verticalSpacing * 0.25;

          // Randomly select transport type
          let typeIndex = Math.floor(Math.random() * transportTypes.length);

          // Ensure neighboring elements have different types
          if (newElements.length > 0) {
            const lastElement = newElements[newElements.length - 1];
            if (lastElement.type === transportTypes[typeIndex]) {
              typeIndex =
                (typeIndex +
                  1 +
                  Math.floor(Math.random() * (transportTypes.length - 1))) %
                transportTypes.length;
            }
          }

          const type = transportTypes[typeIndex];

          // Rotation in multiples of 30 degrees for more natural look
          const rotation = Math.floor(Math.random() * 12) * 30;

          // More constrained scale for consistency
          const scale = 0.9 + Math.random() * 0.6;

          // Opacity for white outlines - slightly higher for better visibility
          const opacity = 0.15 + Math.random() * 0.1;

          newElements.push({
            id: idCounter++,
            type,
            position: {
              x: baseX + jitterX,
              y: baseY + jitterY,
            },
            rotation,
            scale,
            opacity,
          });
        }
      }

      setElements(newElements);
    };

    generateElements();

    // Regenerate on window resize
    const handleResize = () => {
      generateElements();
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {elements.map((element) => (
        <div
          key={element.id}
          className="absolute"
          style={{
            left: `${element.position.x}px`,
            top: `${element.position.y}px`,
            transform: `rotate(${element.rotation}deg) scale(${element.scale})`,
            opacity: element.opacity,
          }}
        >
          {transportIcons[element.type]}
        </div>
      ))}
    </div>
  );
}
