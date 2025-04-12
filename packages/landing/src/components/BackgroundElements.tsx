import { useEffect, useState } from "react";

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

// Map of transport types to emoji representations
const transportEmojis: Record<TransportType, string> = {
  paperplane: "✈️",
  bus: "🚌",
  car: "🚗",
  train: "🚂",
  boat: "⛵",
  bicycle: "🚲",
  helicopter: "🚁",
  rocket: "🚀",
  tram: "🚊",
};

export default function BackgroundElements() {
  const [elements, setElements] = useState<TransportElement[]>([]);

  useEffect(() => {
    // Create a grid-like pattern with some randomness
    const generateElements = () => {
      const newElements: TransportElement[] = [];
      const transportTypes = Object.keys(transportEmojis) as TransportType[];
      let idCounter = 0;

      // Calculate a reasonable number of elements based on screen size
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const gridSize = 150; // Size of each cell in the grid

      // Calculate rows and columns
      const columns = Math.ceil(screenWidth / gridSize);
      const rows = Math.ceil(screenHeight / gridSize);

      // Only place elements in some grid cells (for a sparser look)
      const fillProbability = 0.35; // Chance of placing an element in a cell

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          // Skip some cells randomly
          if (Math.random() > fillProbability) continue;

          // Base position at center of grid cell
          const baseX = col * gridSize + gridSize / 2;
          const baseY = row * gridSize + gridSize / 2;

          // Add some randomness to position within the cell
          const jitterX = (Math.random() - 0.5) * gridSize * 0.8;
          const jitterY = (Math.random() - 0.5) * gridSize * 0.8;

          // Random transport type
          const typeIndex = Math.floor(Math.random() * transportTypes.length);
          const type = transportTypes[typeIndex];

          // Random rotation that's a multiple of 45 degrees
          const rotation = Math.floor(Math.random() * 8) * 45;

          // Random scale between 0.6 and 1.4
          const scale = 0.6 + Math.random() * 0.8;

          // Vary opacity between 0.08 and 0.2
          const opacity = 0.08 + Math.random() * 0.12;

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
          <div className="text-primary text-2xl">
            {transportEmojis[element.type]}
          </div>
        </div>
      ))}
    </div>
  );
}
