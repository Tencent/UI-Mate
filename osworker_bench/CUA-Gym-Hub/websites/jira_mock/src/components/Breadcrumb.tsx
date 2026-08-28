import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

interface BreadcrumbProps {
  pageName: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ pageName }) => {
  const { state } = useStore();
  const project = state.projects[0];

  return (
    <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
      <Link to="/" className="text-xira-blue hover:underline">
        Projects
      </Link>
      <span>/</span>
      <Link
        to={`/project/${project.key}/board`}
        className="text-xira-blue hover:underline"
      >
        {project.name}
      </Link>
      <span>/</span>
      <span className="text-gray-700 font-medium">{pageName}</span>
    </div>
  );
};
