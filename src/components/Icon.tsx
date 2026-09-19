import React from "react";
import Svg, { Circle, Line, Path, Polyline } from "react-native-svg";

/**
 * Set de iconos de línea (estilo Feather), limpios y consistentes.
 * Uso: <Icon name="check" size={20} color="#fff" />
 */
export type IconName =
  | "chevron-left"
  | "chevron-right"
  | "chevron-up"
  | "chevron-down"
  | "map-pin"
  | "check"
  | "navigation"
  | "search"
  | "package"
  | "list"
  | "menu"
  | "x";

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export default function Icon({
  name,
  size = 22,
  color = "#111",
  strokeWidth = 2,
}: Props) {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === "chevron-left" && <Path d="M15 18l-6-6 6-6" {...common} />}
      {name === "chevron-right" && <Path d="M9 18l6-6-6-6" {...common} />}
      {name === "chevron-up" && <Path d="M18 15l-6-6-6 6" {...common} />}
      {name === "chevron-down" && <Path d="M6 9l6 6 6-6" {...common} />}
      {name === "check" && <Path d="M20 6L9 17l-5-5" {...common} />}
      {name === "map-pin" && (
        <>
          <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" {...common} />
          <Circle cx={12} cy={10} r={3} {...common} />
        </>
      )}
      {name === "navigation" && (
        <Path d="M3 11l19-9-9 19-2-8-8-2z" {...common} />
      )}
      {name === "search" && (
        <>
          <Circle cx={11} cy={11} r={7} {...common} />
          <Line x1={21} y1={21} x2={16.65} y2={16.65} {...common} />
        </>
      )}
      {name === "package" && (
        <>
          <Path
            d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
            {...common}
          />
          <Polyline points="3.27 6.96 12 12.01 20.73 6.96" {...common} />
          <Line x1={12} y1={22.08} x2={12} y2={12} {...common} />
        </>
      )}
      {name === "list" && (
        <>
          <Line x1={8} y1={6} x2={21} y2={6} {...common} />
          <Line x1={8} y1={12} x2={21} y2={12} {...common} />
          <Line x1={8} y1={18} x2={21} y2={18} {...common} />
          <Line x1={3} y1={6} x2={3.01} y2={6} {...common} />
          <Line x1={3} y1={12} x2={3.01} y2={12} {...common} />
          <Line x1={3} y1={18} x2={3.01} y2={18} {...common} />
        </>
      )}
      {name === "menu" && (
        <>
          <Line x1={3} y1={6} x2={21} y2={6} {...common} />
          <Line x1={3} y1={12} x2={21} y2={12} {...common} />
          <Line x1={3} y1={18} x2={21} y2={18} {...common} />
        </>
      )}
      {name === "x" && (
        <>
          <Line x1={18} y1={6} x2={6} y2={18} {...common} />
          <Line x1={6} y1={6} x2={18} y2={18} {...common} />
        </>
      )}
    </Svg>
  );
}
