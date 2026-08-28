import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function CampaignDetail() {
  const { state } = useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const campaign = state.campaigns.find(c => c.id === id);

  useEffect(() => {
    if (!campaign) {
      navigate('/campaigns', { replace: true });
    } else if (campaign.status === 'sent' && campaign.report) {
      navigate(`/campaigns/${id}/report`, { replace: true });
    } else {
      // Draft or scheduled - go to setup wizard
      navigate(`/campaigns/${id}/setup`, { replace: true });
    }
  }, [campaign, id, navigate]);

  return null;
}
