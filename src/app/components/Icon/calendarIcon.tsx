import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface CalendarIconProps {
  width?: number;
  height?: number;
  color?: string;
}

export default function CalendarIcon({ width = 32, height = 32, color = '#FFA500' }: CalendarIconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 32 32" fill="none">
      <Path
        d="M14.5 16.5H16.5V23M5 12H27M21 8V4M11 8V4M7 28H25C25.5304 28 26.0391 27.7893 26.4142 27.4142C26.7893 27.0391 27 26.5304 27 26V8C27 7.46957 26.7893 6.96086 26.4142 6.58579C26.0391 6.21071 25.5304 6 25 6H7C6.46957 6 5.96086 6.21071 5.58579 6.58579C5.21071 6.96086 5 7.46957 5 8V26C5 26.5304 5.21071 27.0391 5.58579 27.4142C5.96086 27.7893 6.46957 28 7 28Z" 
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
