import React, { useRef, useEffect } from 'react';
import { Rect, Circle, Text, Image as KonvaImage, Star, Transformer } from 'react-konva';
import useImage from 'use-image';

const URLImage = ({ image, ...props }) => {
  const [img] = useImage(image.src, 'anonymous');
  return <KonvaImage image={img} {...props} />;
};

export const CanvasObject = ({ shapeProps, isSelected, onSelect, onChange }) => {
  const shapeRef = useRef();
  const trRef = useRef();

  useEffect(() => {
    if (isSelected && trRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  if (shapeProps.visible === false) {
    return null;
  }

  const handleDragEnd = (e) => {
    onChange({
      ...shapeProps,
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransformEnd = (e) => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale to 1 and adjust width/height/fontSize
    node.scaleX(1);
    node.scaleY(1);

    const newAttrs = {
      ...shapeProps,
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
    };

    if (shapeProps.type === 'text') {
      newAttrs.fontSize = shapeProps.fontSize * scaleX;
      newAttrs.width = Math.max(5, node.width() * scaleX);
    } else if (shapeProps.type === 'circle') {
      newAttrs.radius = Math.max(5, node.radius() * scaleX);
    } else if (shapeProps.type === 'star') {
      newAttrs.innerRadius = node.innerRadius() * scaleX;
      newAttrs.outerRadius = node.outerRadius() * scaleX;
    } else {
      newAttrs.width = Math.max(5, node.width() * scaleX);
      newAttrs.height = Math.max(5, node.height() * scaleY);
    }

    onChange(newAttrs);
  };

  const commonProps = {
    onClick: onSelect,
    onTap: onSelect,
    ref: shapeRef,
    draggable: true,
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
    ...shapeProps,
  };

  return (
    <>
      {shapeProps.type === 'rect' && <Rect {...commonProps} />}
      {shapeProps.type === 'circle' && <Circle {...commonProps} />}
      {shapeProps.type === 'star' && <Star {...commonProps} />}
      {shapeProps.type === 'text' && <Text {...commonProps} />}
      {shapeProps.type === 'image' && <URLImage image={{ src: shapeProps.src }} {...commonProps} />}
      
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
          anchorFill="#00C4CC"
          anchorStroke="#ffffff"
          borderStroke="#00C4CC"
        />
      )}
    </>
  );
};
