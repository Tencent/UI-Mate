import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { StoreProvider } from './store/StoreContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import EC2 from './pages/EC2';
import EC2SecurityGroups from './pages/EC2SecurityGroups';
import EC2KeyPairs from './pages/EC2KeyPairs';
import S3Buckets from './pages/S3Buckets';
import S3BucketDetail from './pages/S3BucketDetail';
import LambdaFunctions from './pages/LambdaFunctions';
import LambdaFunctionDetail from './pages/LambdaFunctionDetail';
import RDS from './pages/RDS';
import RDSDetail from './pages/RDSDetail';
import IAMDashboard from './pages/IAMDashboard';
import IAMUsers from './pages/IAMUsers';
import IAMGroups from './pages/IAMGroups';
import IAMRoles from './pages/IAMRoles';
import IAMPolicies from './pages/IAMPolicies';
import BillingDashboard from './pages/BillingDashboard';
import CostExplorer from './pages/CostExplorer';
import StateInspector from './pages/StateInspector';
import Placeholder from './pages/Placeholder';
import HelpDoc from './pages/HelpDoc';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ec2" element={<EC2 />} />
            <Route path="/ec2/security-groups" element={<EC2SecurityGroups />} />
            <Route path="/ec2/key-pairs" element={<EC2KeyPairs />} />
            <Route path="/s3" element={<S3Buckets />} />
            <Route path="/s3/:bucketName" element={<S3BucketDetail />} />
            <Route path="/lambda" element={<LambdaFunctions />} />
            <Route path="/lambda/:functionName" element={<LambdaFunctionDetail />} />
            <Route path="/rds" element={<RDS />} />
            <Route path="/rds/:dbId" element={<RDSDetail />} />
            <Route path="/iam" element={<IAMDashboard />} />
            <Route path="/iam/users" element={<IAMUsers />} />
            <Route path="/iam/groups" element={<IAMGroups />} />
            <Route path="/iam/roles" element={<IAMRoles />} />
            <Route path="/iam/policies" element={<IAMPolicies />} />
            <Route path="/billing" element={<BillingDashboard />} />
            <Route path="/billing/cost-explorer" element={<CostExplorer />} />
            <Route path="/local/:service/:item" element={<Placeholder />} />
            <Route path="/go" element={<StateInspector />} />
            <Route path="/help/:topic" element={<HelpDoc />} />
            <Route path="*" element={<RedirectWithQuery to="/" />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </StoreProvider>
  );
}

export default App;
