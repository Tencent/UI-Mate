import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AssetDetail from '../components/AssetDetail';

function AssetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <AssetDetail
      assetId={id}
      onBack={() => navigate(-1)}
    />
  );
}

export default AssetDetailPage;
