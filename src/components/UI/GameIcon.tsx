import React, { useState } from 'react';

interface GameIconProps {
  iconUrl?: string;
  color: string;
  name: string;
  className?: string;
}

export const GameIcon: React.FC<GameIconProps> = ({ iconUrl, color, name, className = '' }) => {
  const [imgFailed, setImgFailed] = useState(false);

  if (iconUrl && !imgFailed) {
    return (
      <img
        src={iconUrl}
        alt={name}
        className={className}
        onError={() => setImgFailed(true)}
      />
    );
  }
  return <div className={className} style={{ backgroundColor: color }} />;
};
