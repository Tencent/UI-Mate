import React from 'react';
import { useParams } from 'react-router-dom';
import { Info } from 'lucide-react';

function titleCase(value = '') {
  return value.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

export default function Placeholder() {
  const { service, item } = useParams();
  const title = `${titleCase(service)} ${titleCase(item)}`;

  return (
    <div className="flex flex-col items-center justify-center py-20 text-aws-text-secondary">
      <Info size={48} className="mb-4 text-aws-text-disabled" />
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="text-sm max-w-lg text-center">
        This local sandbox page records navigation intent and keeps the XWS Console flow usable for computer-use tasks.
      </p>
      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="border border-aws-border px-4 py-3"><div className="text-xs">Resources</div><div className="font-bold">3</div></div>
        <div className="border border-aws-border px-4 py-3"><div className="text-xs">Status</div><div className="font-bold text-aws-success">Healthy</div></div>
        <div className="border border-aws-border px-4 py-3"><div className="text-xs">Region</div><div className="font-bold">Local</div></div>
      </div>
    </div>
  );
}
