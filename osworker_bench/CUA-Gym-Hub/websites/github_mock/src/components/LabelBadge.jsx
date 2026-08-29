
    import React from 'react';
    import { useStore } from '../lib/store';

    function hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
        : null;
    }

    function getContrastColor(hex) {
      const rgb = hexToRgb(hex);
      if (!rgb) return '#c9d1d9';
      const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
      return luminance > 0.6 ? '#000000' : hex;
    }

    export default function LabelBadge({ name, repoId }) {
      const { state } = useStore();
      const labelEntity = (state.labels || []).find(
        l => l.name === name && (!repoId || l.repoId === repoId)
      );
      const color = labelEntity?.color || '#0075ca';
      const rgb = hexToRgb(color);
      const bgColor = rgb
        ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`
        : 'rgba(0, 117, 202, 0.2)';
      const textColor = getContrastColor(color);
      const borderColor = rgb
        ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`
        : 'rgba(0, 117, 202, 0.4)';

      return (
        <span
          className="px-2 py-0.5 rounded-full text-xs font-medium inline-block whitespace-nowrap"
          style={{
            backgroundColor: bgColor,
            color: textColor,
            border: `1px solid ${borderColor}`,
          }}
        >
          {name}
        </span>
      );
    }
