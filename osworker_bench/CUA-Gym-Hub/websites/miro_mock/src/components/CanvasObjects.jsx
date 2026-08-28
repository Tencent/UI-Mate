import React, { useRef, useEffect, useState } from 'react';
import { Group, Rect, Circle, Text, Line, Image as KonvaImage, Arrow } from 'react-konva';

function useImageEl(url) {
  const [img, setImg] = useState(null);
  useEffect(() => {
    if (!url) { setImg(null); return; }
    const i = new window.Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => setImg(i);
    i.src = url;
    return () => { i.onload = null; };
  }, [url]);
  return img;
}

export const StickyNote = ({ id, x, y, width, height, text, fill, rotation, isSelected, votes, onSelect, onChange, onDoubleClick, onHover, onHoverEnd }) => (
  <Group
    id={id} x={x} y={y} rotation={rotation || 0}
    draggable
    onClick={onSelect}
    onTap={onSelect}
    onDblClick={onDoubleClick}
    onMouseEnter={onHover}
    onMouseLeave={onHoverEnd}
    onDragEnd={(e) => onChange?.({ x: e.target.x(), y: e.target.y() })}
    onTransformEnd={(e) => {
      const node = e.target;
      onChange?.({ x: node.x(), y: node.y(), width: Math.max(20, node.width() * node.scaleX()), height: Math.max(20, node.height() * node.scaleY()), rotation: node.rotation() });
      node.scaleX(1); node.scaleY(1);
    }}
  >
    <Rect width={width} height={height} fill={fill || '#fef3c7'} cornerRadius={6} shadowBlur={isSelected ? 6 : 2} shadowColor="rgba(0,0,0,0.15)" shadowOffsetY={2} />
    <Text text={text || ''} width={width} height={height} padding={10} fontSize={14} fontFamily="Inter" fill="#050038" align="center" verticalAlign="middle" />
    {votes > 0 && (
      <Group x={width - 24} y={4}>
        <Circle radius={10} fill="#2d9bf0" />
        <Text text={String(votes)} width={20} height={20} offsetX={10} offsetY={10} align="center" verticalAlign="middle" fontSize={11} fill="white" />
      </Group>
    )}
  </Group>
);

export const Shape = ({ id, x, y, width, height, shapeType, fill, stroke, strokeWidth, rotation, isSelected, onSelect, onChange, onHover, onHoverEnd }) => {
  const common = {
    id,
    onClick: onSelect, onTap: onSelect,
    onMouseEnter: onHover, onMouseLeave: onHoverEnd,
    draggable: true,
    onDragEnd: (e) => onChange?.({ x: e.target.x(), y: e.target.y() }),
    onTransformEnd: (e) => {
      const node = e.target;
      onChange?.({ x: node.x(), y: node.y(), width: Math.max(20, node.width() * node.scaleX()), height: Math.max(20, node.height() * node.scaleY()), rotation: node.rotation() });
      node.scaleX(1); node.scaleY(1);
    },
    fill: fill || '#bfdbfe',
    stroke: stroke || '#1d4ed8',
    strokeWidth: strokeWidth ?? 2,
    rotation: rotation || 0,
  };
  if (shapeType === 'circle') {
    return <Circle x={x + (width || 0) / 2} y={y + (height || 0) / 2} radius={Math.min(width || 0, height || 0) / 2} {...common} />;
  }
  return <Rect x={x} y={y} width={width} height={height} cornerRadius={4} {...common} />;
};

export const UrlImage = ({ id, x, y, width, height, url, rotation, onSelect, onChange, onHover, onHoverEnd }) => {
  const img = useImageEl(url);
  return (
    <KonvaImage
      id={id} x={x} y={y} width={width} height={height} image={img}
      rotation={rotation || 0}
      draggable
      onClick={onSelect} onTap={onSelect}
      onMouseEnter={onHover} onMouseLeave={onHoverEnd}
      onDragEnd={(e) => onChange?.({ x: e.target.x(), y: e.target.y() })}
      onTransformEnd={(e) => {
        const node = e.target;
        onChange?.({ x: node.x(), y: node.y(), width: Math.max(20, node.width() * node.scaleX()), height: Math.max(20, node.height() * node.scaleY()), rotation: node.rotation() });
        node.scaleX(1); node.scaleY(1);
      }}
    />
  );
};

export const Connector = ({ id, points, stroke, strokeWidth, onSelect, onHover, onHoverEnd }) => (
  <Arrow
    id={id}
    points={points || [0, 0, 0, 0]}
    stroke={stroke || '#1d4ed8'}
    strokeWidth={strokeWidth ?? 2}
    fill={stroke || '#1d4ed8'}
    pointerLength={10} pointerWidth={10}
    onClick={onSelect} onTap={onSelect}
    onMouseEnter={onHover} onMouseLeave={onHoverEnd}
  />
);

export const Frame = ({ id, x, y, width, height, title, fill, isSelected, onSelect, onChange, onHover, onHoverEnd }) => (
  <Group
    id={id} x={x} y={y}
    draggable
    onClick={onSelect} onTap={onSelect}
    onMouseEnter={onHover} onMouseLeave={onHoverEnd}
    onDragEnd={(e) => onChange?.({ x: e.target.x(), y: e.target.y() })}
  >
    <Rect width={width} height={height} fill={fill || '#ffffff'} stroke={isSelected ? '#2d9bf0' : '#cccccc'} strokeWidth={isSelected ? 2 : 1} cornerRadius={4} dash={[8, 4]} />
    <Text text={title || 'Frame'} x={6} y={-20} fontSize={13} fontStyle="bold" fill="#050038" />
  </Group>
);

export const TextObject = ({ id, x, y, width, height, text, fontSize, fontFamily, fill, rotation, onSelect, onChange, onDoubleClick, onHover, onHoverEnd }) => (
  <Text
    id={id} x={x} y={y} width={width} height={height}
    text={text || ''}
    fontSize={fontSize || 16}
    fontFamily={fontFamily || 'Inter'}
    fill={fill || '#050038'}
    rotation={rotation || 0}
    draggable
    onClick={onSelect} onTap={onSelect}
    onDblClick={onDoubleClick}
    onMouseEnter={onHover} onMouseLeave={onHoverEnd}
    onDragEnd={(e) => onChange?.({ x: e.target.x(), y: e.target.y() })}
  />
);

export const MockCursor = ({ x, y, name, color }) => (
  <Group x={x} y={y} listening={false}>
    <Line points={[0, 0, 0, 16, 5, 12, 9, 18, 12, 16, 8, 10, 14, 10]} closed fill={color || '#e63946'} stroke="white" strokeWidth={1} />
    <Group x={14} y={8}>
      <Rect width={Math.max(40, (name || '').length * 7)} height={18} fill={color || '#e63946'} cornerRadius={3} />
      <Text text={name || ''} x={6} y={3} fontSize={11} fill="white" />
    </Group>
  </Group>
);
