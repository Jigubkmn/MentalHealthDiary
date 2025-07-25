import React from 'react';
import Svg, { Path } from 'react-native-svg';

type HeartIconProps = {
  size?: number;
  color?: string;
}

export default function HeartIcon({ size = 32, color = '#000000' }: HeartIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Path
        d="M16 10.6667C16 10.6667 16 10.6667 14.9867 9.33341C13.8133 7.78675 12.08 6.66675 10 6.66675C6.68 6.66675 4 9.34675 4 12.6667C4 13.9067 4.37333 15.0534 5.01333 16.0001C6.09333 17.6134 16 28.0001 16 28.0001M16 10.6667C16 10.6667 16 10.6667 17.0133 9.33341C18.1867 7.78675 19.92 6.66675 22 6.66675C25.32 6.66675 28 9.34675 28 12.6667C28 13.9067 27.6267 15.0534 26.9867 16.0001C25.9067 17.6134 16 28.0001 16 28.0001"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="white"
      />
    </Svg>
  );
}
