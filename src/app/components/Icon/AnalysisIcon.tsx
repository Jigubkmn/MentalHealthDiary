import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface AnalysisIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export default function AnalysisIcon({ width = 32, height = 32, color = 'black' }: AnalysisIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
      <Path
        d="M4.66666 5.33325V23.3333C4.66666 24.3941 5.08809 25.4115 5.83824 26.1617C6.58838 26.9118 7.6058 27.3333 8.66666 27.3333H26.6667"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.66666 19.9999L14.6667 13.9999L19.3333 18.6666L26.6667 11.3333"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
