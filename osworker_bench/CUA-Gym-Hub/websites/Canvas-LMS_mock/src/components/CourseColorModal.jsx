import React, { useState } from 'react';
import { X } from 'lucide-react';
import './CourseColorModal.css';

const COLOR_PALETTE = [
  '#EE0612', '#E71F63', '#6B3FA0', '#394B58', '#0374B5',
  '#008EE2', '#00BCD5', '#0B874B', '#8BC34A', '#FFC107',
  '#F5A623', '#FC5E13', '#8D6E63', '#D81B60', '#455A64',
];

export default function CourseColorModal({ course, onClose, onApply }) {
  const [nickname, setNickname] = useState(course.nickname || course.name);
  const [selectedColor, setSelectedColor] = useState(course.color || '#0374B5');
  const [hexInput, setHexInput] = useState(course.color || '#0374B5');

  const handleHexChange = (val) => {
    setHexInput(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      setSelectedColor(val);
    }
  };

  const handleColorClick = (color) => {
    setSelectedColor(color);
    setHexInput(color);
  };

  const handleApply = () => {
    onApply({
      courseId: course.id,
      nickname: nickname !== course.name ? nickname : null,
      color: selectedColor
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="color-modal" onClick={(e) => e.stopPropagation()}>
        <div className="color-modal-header">
          <h3>Choose a color and nickname</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="color-modal-body">
          <div className="color-modal-field">
            <label>Nickname:</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="color-modal-input"
              placeholder="Enter nickname"
            />
          </div>

          <div className="color-modal-field">
            <label>Color:</label>
            <div className="color-swatches">
              {COLOR_PALETTE.map(color => (
                <button
                  key={color}
                  className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
                  style={{ background: color }}
                  onClick={() => handleColorClick(color)}
                  title={color}
                />
              ))}
            </div>
            <div className="hex-input-row">
              <input
                type="text"
                value={hexInput}
                onChange={(e) => handleHexChange(e.target.value)}
                className="color-modal-input hex-input"
                placeholder="#000000"
                maxLength={7}
              />
              <div
                className="hex-preview"
                style={{ background: selectedColor }}
              />
            </div>
          </div>
        </div>
        <div className="color-modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleApply}>Apply</button>
        </div>
      </div>
    </div>
  );
}
