import { useNavigate, useLocation } from 'react-router-dom';

export default function FAB() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on publish page
  if (location.pathname === '/publish') return null;

  return (
    <button className="fab" onClick={() => navigate('/publish')} title="发布笔记">
      +
    </button>
  );
}
