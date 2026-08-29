import React from 'react';
import StatusCell from './StatusCell';
import PeopleCell from './PeopleCell';
import DateCell from './DateCell';
import TimelineCell from './TimelineCell';
import NumbersCell from './NumbersCell';
import TextCell from './TextCell';
import DropdownCell from './DropdownCell';
import TagsCell from './TagsCell';

export default function ColumnCell({ column, item, value }) {
  const width = column.width || 140;

  const renderCell = () => {
    switch (column.type) {
      case 'status':
        return <StatusCell column={column} item={item} value={value} />;
      case 'people':
        return <PeopleCell column={column} item={item} value={value} />;
      case 'date':
        return <DateCell column={column} item={item} value={value} />;
      case 'timeline':
        return <TimelineCell column={column} item={item} value={value} />;
      case 'numbers':
        return <NumbersCell column={column} item={item} value={value} />;
      case 'text':
        return <TextCell column={column} item={item} value={value} />;
      case 'dropdown':
        return <DropdownCell column={column} item={item} value={value} />;
      case 'tags':
        return <TagsCell column={column} item={item} value={value} />;
      default:
        return <span style={{ color: '#676879', fontSize: 12 }}>-</span>;
    }
  };

  return (
    <div className="column-cell" style={{ width, minWidth: width }}>
      {renderCell()}
    </div>
  );
}
