import React from 'react';
import { Svg, Path } from 'react-native-svg';

type BlockIconProps = {
  size?: number;
  color?: string;
};

export default function BlockIcon({ size = 24, color = 'black' }: BlockIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM4 12C4 7.58 7.58 4 12 4C13.85 4 15.55 4.63 16.9 5.69L5.69 16.9C4.59163 15.5032 3.99623 13.7769 4 12ZM12 20C10.15 20 8.45 19.37 7.1 18.31L18.31 7.1C19.4084 8.49679 20.0038 10.2231 20 12C20 16.42 16.42 20 12 20Z" 
        fill={color}
      />
    </Svg>
  );
}
