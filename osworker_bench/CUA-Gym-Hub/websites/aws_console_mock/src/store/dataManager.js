const BASE_STORAGE_KEY = 'aws_mock_state';
const BASE_INITIAL_KEY = 'aws_mock_initialState';

export function storageKey(sid) { return sid ? `${BASE_STORAGE_KEY}_${sid}` : BASE_STORAGE_KEY; }
export function initialKey(sid) { return sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY; }

export const getSessionId = () => {
  const params = new URLSearchParams(window.location.search);
  const urlSid = params.get('sid');
  if (urlSid) { sessionStorage.setItem('mock_sid', urlSid); return urlSid; }
  return sessionStorage.getItem('mock_sid') || null;
};

export const fetchCustomState = async (sid = null) => {
  try {
    const url = sid ? `/state?sid=${encodeURIComponent(sid)}` : '/state';
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      if (data.has_custom_state && data.stored_state) return data.stored_state;
    }
  } catch (e) { console.log('No custom state available'); }
  return null;
};

export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  const url = sid ? `/post?sid=${encodeURIComponent(sid)}` : '/post';
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'set_current', state })
  }).catch(() => {});
};

export const getInitialState = (sid = null) => {
  const stored = localStorage.getItem(initialKey(sid));
  return stored ? JSON.parse(stored) : null;
};

function deepMergeWithDefaults(defaults, custom) {
  if (!custom) return defaults;
  const result = { ...defaults };
  for (const key in custom) {
    if (custom[key] !== null && custom[key] !== undefined) {
      if (typeof custom[key] === 'object' && !Array.isArray(custom[key]) && typeof defaults[key] === 'object' && !Array.isArray(defaults[key])) {
        result[key] = deepMergeWithDefaults(defaults[key], custom[key]);
      } else {
        result[key] = custom[key];
      }
    }
  }
  return result;
}

export const initializeData = (sid = null, customState = null) => {
  const sk = storageKey(sid);
  const ik = initialKey(sid);

  if (customState) {
    const data = deepMergeWithDefaults(getDefaultData(), customState);
    localStorage.setItem(sk, JSON.stringify(data));
    localStorage.setItem(ik, JSON.stringify(data));
    return data;
  }

  const stored = localStorage.getItem(sk);
  if (stored) {
    if (!localStorage.getItem(ik)) localStorage.setItem(ik, stored);
    return JSON.parse(stored);
  }

  const data = getDefaultData();
  localStorage.setItem(sk, JSON.stringify(data));
  localStorage.setItem(ik, JSON.stringify(data));
  return data;
};

export const getDefaultData = () => ({
  user: {
    name: "Admin User",
    email: "admin@company.com",
    accountId: "1234-5678-9012",
    region: "us-east-1",
    accountAlias: "my-company-prod",
    role: "admin"
  },

  recentServices: [
    { id: "ec2", name: "EC2", path: "/ec2", lastVisited: "2024-03-15T10:00:00Z" },
    { id: "s3", name: "S3", path: "/s3", lastVisited: "2024-03-15T09:30:00Z" },
    { id: "lambda", name: "Lambda", path: "/lambda", lastVisited: "2024-03-14T16:00:00Z" },
    { id: "rds", name: "RDS", path: "/rds", lastVisited: "2024-03-14T14:00:00Z" },
    { id: "iam", name: "IAM", path: "/iam", lastVisited: "2024-03-13T11:00:00Z" },
    { id: "cloudwatch", name: "CloudWatch", path: "/cloudwatch", lastVisited: "2024-03-12T15:00:00Z" },
    { id: "vpc", name: "VPC", path: "/vpc", lastVisited: "2024-03-12T09:00:00Z" },
    { id: "billing", name: "Billing", path: "/billing", lastVisited: "2024-03-12T09:00:00Z" }
  ],

  favorites: [],

  // ========================
  // EC2
  // ========================
  ec2: [
    {
      id: "i-0a1b2c3d4e5f6g7h8", name: "Web-Server-01", type: "t2.micro", state: "running",
      publicIp: "54.123.45.67", privateIp: "10.0.1.42", az: "us-east-1a",
      vpcId: "vpc-0abc1234def56789", subnetId: "subnet-0def5678abc12345",
      ami: "ami-0abcdef1234567890", amiName: "Amazon Linux 2023 AMI", platform: "Linux/UNIX",
      keyPair: "my-key-pair", securityGroups: ["sg-0abc1234def56789"],
      launchTime: "2024-03-10T08:30:00Z", monitoring: "disabled",
      iamRole: "EC2ServiceRole",
      rootDeviceType: "ebs", rootDeviceName: "/dev/xvda",
      volumes: ["vol-0a1b2c3d4e5f6g7h8"],
      tags: [{ Key: "Environment", Value: "Production" }, { Key: "Project", Value: "WebApp" }]
    },
    {
      id: "i-0x9y8z7a6b5c4d3e2", name: "Worker-Node-Alpha", type: "m5.large", state: "stopped",
      publicIp: "-", privateIp: "10.0.2.18", az: "us-east-1b",
      vpcId: "vpc-0abc1234def56789", subnetId: "subnet-0ghi9012def34567",
      ami: "ami-0bcdef2345678901a", amiName: "Ubuntu Server 22.04 LTS", platform: "Linux/UNIX",
      keyPair: "deploy-key", securityGroups: ["sg-0def5678abc12345"],
      launchTime: "2024-03-08T14:00:00Z", monitoring: "enabled",
      iamRole: "EC2ServiceRole",
      rootDeviceType: "ebs", rootDeviceName: "/dev/sda1",
      volumes: ["vol-0b2c3d4e5f6g7h9i"],
      tags: [{ Key: "Environment", Value: "Staging" }, { Key: "Project", Value: "DataPipeline" }]
    },
    {
      id: "i-0f1e2d3c4b5a69870", name: "API-Gateway-Prod", type: "t3.small", state: "running",
      publicIp: "52.87.123.45", privateIp: "10.0.1.100", az: "us-east-1a",
      vpcId: "vpc-0abc1234def56789", subnetId: "subnet-0def5678abc12345",
      ami: "ami-0abcdef1234567890", amiName: "Amazon Linux 2023 AMI", platform: "Linux/UNIX",
      keyPair: "my-key-pair", securityGroups: ["sg-0abc1234def56789", "sg-0ghi3456jkl78901"],
      launchTime: "2024-02-28T11:00:00Z", monitoring: "enabled",
      iamRole: "EC2ServiceRole",
      rootDeviceType: "ebs", rootDeviceName: "/dev/xvda",
      volumes: ["vol-0c3d4e5f6g7h8i9j"],
      tags: [{ Key: "Environment", Value: "Production" }, { Key: "Project", Value: "APIService" }]
    },
    {
      id: "i-0ab12cd34ef567890", name: "Dev-Test-Box", type: "t2.micro", state: "running",
      publicIp: "3.92.55.12", privateIp: "10.0.3.5", az: "us-east-1c",
      vpcId: "vpc-0abc1234def56789", subnetId: "subnet-0jkl3456ghi78901",
      ami: "ami-0bcdef2345678901a", amiName: "Ubuntu Server 22.04 LTS", platform: "Linux/UNIX",
      keyPair: "dev-key", securityGroups: ["sg-0jkl5678mno12345"],
      launchTime: "2024-03-14T16:45:00Z", monitoring: "disabled",
      iamRole: "",
      rootDeviceType: "ebs", rootDeviceName: "/dev/sda1",
      volumes: ["vol-0d4e5f6g7h8i9j0k"],
      tags: [{ Key: "Environment", Value: "Development" }, { Key: "Owner", Value: "dev-team" }]
    },
    {
      id: "i-0cd34ef56gh789012", name: "Batch-Processor", type: "c5.xlarge", state: "running",
      publicIp: "-", privateIp: "10.0.2.50", az: "us-east-1b",
      vpcId: "vpc-0abc1234def56789", subnetId: "subnet-0ghi9012def34567",
      ami: "ami-0abcdef1234567890", amiName: "Amazon Linux 2023 AMI", platform: "Linux/UNIX",
      keyPair: "deploy-key", securityGroups: ["sg-0def5678abc12345"],
      launchTime: "2024-03-12T09:00:00Z", monitoring: "enabled",
      iamRole: "EC2ServiceRole",
      rootDeviceType: "ebs", rootDeviceName: "/dev/xvda",
      volumes: ["vol-0e5f6g7h8i9j0k1l"],
      tags: [{ Key: "Environment", Value: "Production" }, { Key: "Project", Value: "BatchJobs" }]
    }
  ],

  volumes: [
    { id: "vol-0a1b2c3d4e5f6g7h8", name: "Web-Server-01-root", size: 8, volumeType: "gp3", state: "in-use", iops: 3000, throughput: 125, az: "us-east-1a", attachedTo: "i-0a1b2c3d4e5f6g7h8", device: "/dev/xvda", created: "2024-03-10T08:30:00Z", encrypted: true, snapshotId: "snap-0111222333444555" },
    { id: "vol-0b2c3d4e5f6g7h9i", name: "Worker-Node-root", size: 30, volumeType: "gp3", state: "in-use", iops: 3000, throughput: 125, az: "us-east-1b", attachedTo: "i-0x9y8z7a6b5c4d3e2", device: "/dev/sda1", created: "2024-03-08T14:00:00Z", encrypted: true, snapshotId: "" },
    { id: "vol-0c3d4e5f6g7h8i9j", name: "API-Gateway-root", size: 8, volumeType: "gp3", state: "in-use", iops: 3000, throughput: 125, az: "us-east-1a", attachedTo: "i-0f1e2d3c4b5a69870", device: "/dev/xvda", created: "2024-02-28T11:00:00Z", encrypted: false, snapshotId: "" },
    { id: "vol-0d4e5f6g7h8i9j0k", name: "Dev-Test-root", size: 8, volumeType: "gp2", state: "in-use", iops: 100, throughput: 0, az: "us-east-1c", attachedTo: "i-0ab12cd34ef567890", device: "/dev/sda1", created: "2024-03-14T16:45:00Z", encrypted: false, snapshotId: "" },
    { id: "vol-0e5f6g7h8i9j0k1l", name: "Batch-Processor-root", size: 50, volumeType: "gp3", state: "in-use", iops: 3000, throughput: 125, az: "us-east-1b", attachedTo: "i-0cd34ef56gh789012", device: "/dev/xvda", created: "2024-03-12T09:00:00Z", encrypted: true, snapshotId: "" },
    { id: "vol-0f6g7h8i9j0k1l2m", name: "data-volume", size: 100, volumeType: "io1", state: "available", iops: 5000, throughput: 0, az: "us-east-1a", attachedTo: "", device: "", created: "2024-02-15T10:00:00Z", encrypted: true, snapshotId: "" },
    { id: "vol-0g7h8i9j0k1l2m3n", name: "backup-staging", size: 200, volumeType: "st1", state: "available", iops: 0, throughput: 500, az: "us-east-1b", attachedTo: "", device: "", created: "2024-01-20T08:00:00Z", encrypted: false, snapshotId: "" },
  ],

  snapshots: [
    { id: "snap-0111222333444555", name: "web-server-baseline", description: "Baseline snapshot of web server root volume", volumeId: "vol-0a1b2c3d4e5f6g7h8", volumeSize: 8, status: "completed", started: "2024-03-10T09:00:00Z", progress: "100%", encrypted: true, ownerId: "123456789012" },
    { id: "snap-0222333444555666", name: "worker-node-backup", description: "Weekly backup of worker node", volumeId: "vol-0b2c3d4e5f6g7h9i", volumeSize: 30, status: "completed", started: "2024-03-14T02:00:00Z", progress: "100%", encrypted: true, ownerId: "123456789012" },
    { id: "snap-0333444555666777", name: "data-migration-snapshot", description: "Pre-migration snapshot of data volume", volumeId: "vol-0f6g7h8i9j0k1l2m", volumeSize: 100, status: "completed", started: "2024-03-01T06:00:00Z", progress: "100%", encrypted: true, ownerId: "123456789012" },
  ],

  amis: [
    { id: "ami-0abcdef1234567890", name: "Amazon Linux 2023 AMI", description: "Amazon Linux 2023 AMI 2023.3.20240312.0", owner: "amazon", state: "available", architecture: "x86_64", platform: "Linux", rootDeviceType: "ebs", virtualization: "hvm", created: "2024-03-12T00:00:00Z", public: true },
    { id: "ami-0bcdef2345678901a", name: "Ubuntu Server 22.04 LTS", description: "Canonical, Ubuntu, 22.04 LTS, amd64 jammy image build on 2024-03-01", owner: "099720109477", state: "available", architecture: "x86_64", platform: "Linux", rootDeviceType: "ebs", virtualization: "hvm", created: "2024-03-01T00:00:00Z", public: true },
    { id: "ami-0cdef3456789012ab", name: "Windows Server 2022 Base", description: "Microsoft Windows Server 2022 Full Locale English AMI", owner: "amazon", state: "available", architecture: "x86_64", platform: "Windows", rootDeviceType: "ebs", virtualization: "hvm", created: "2024-02-15T00:00:00Z", public: true },
    { id: "ami-custom-webapp-v2", name: "WebApp-Golden-Image-v2", description: "Custom AMI with NGINX + Node.js pre-installed", owner: "123456789012", state: "available", architecture: "x86_64", platform: "Linux", rootDeviceType: "ebs", virtualization: "hvm", created: "2024-03-05T14:30:00Z", public: false },
    { id: "ami-custom-worker-v1", name: "Worker-Base-Image-v1", description: "Custom AMI for batch processing workers", owner: "123456789012", state: "available", architecture: "x86_64", platform: "Linux", rootDeviceType: "ebs", virtualization: "hvm", created: "2024-02-20T10:00:00Z", public: false },
  ],

  elasticIps: [
    { allocationId: "eipalloc-0a1b2c3d4e5f6789", publicIp: "54.123.45.67", associationId: "eipassoc-0111222333", instanceId: "i-0a1b2c3d4e5f6g7h8", privateIp: "10.0.1.42", networkInterfaceId: "eni-0aaa1111", domain: "vpc", tags: [{ Key: "Name", Value: "Web-Server-EIP" }] },
    { allocationId: "eipalloc-0b2c3d4e5f678901", publicIp: "52.87.123.45", associationId: "eipassoc-0222333444", instanceId: "i-0f1e2d3c4b5a69870", privateIp: "10.0.1.100", networkInterfaceId: "eni-0bbb2222", domain: "vpc", tags: [{ Key: "Name", Value: "API-Gateway-EIP" }] },
    { allocationId: "eipalloc-0c3d4e5f67890123", publicIp: "34.201.78.90", associationId: "", instanceId: "", privateIp: "", networkInterfaceId: "", domain: "vpc", tags: [{ Key: "Name", Value: "Unassociated-EIP" }] },
  ],

  loadBalancers: [
    {
      name: "prod-web-alb", arn: "arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/prod-web-alb/1234567890abcdef",
      type: "application", scheme: "internet-facing", state: "active",
      dnsName: "prod-web-alb-1234567890.us-east-1.elb.amazonaws.com",
      vpcId: "vpc-0abc1234def56789", az: ["us-east-1a", "us-east-1b"],
      securityGroups: ["sg-0abc1234def56789"],
      listeners: [
        { port: 80, protocol: "HTTP", defaultAction: "forward to prod-web-tg" },
        { port: 443, protocol: "HTTPS", defaultAction: "forward to prod-web-tg" }
      ],
      created: "2024-01-15T10:00:00Z",
      tags: [{ Key: "Environment", Value: "Production" }]
    },
    {
      name: "internal-api-nlb", arn: "arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/net/internal-api-nlb/abcdef1234567890",
      type: "network", scheme: "internal", state: "active",
      dnsName: "internal-api-nlb-abcdef1234.us-east-1.elb.amazonaws.com",
      vpcId: "vpc-0abc1234def56789", az: ["us-east-1a", "us-east-1b", "us-east-1c"],
      securityGroups: [],
      listeners: [
        { port: 8080, protocol: "TCP", defaultAction: "forward to api-tg" }
      ],
      created: "2024-02-01T14:00:00Z",
      tags: [{ Key: "Environment", Value: "Production" }]
    }
  ],

  targetGroups: [
    {
      name: "prod-web-tg", arn: "arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/prod-web-tg/1234567890",
      protocol: "HTTP", port: 80, targetType: "instance", vpcId: "vpc-0abc1234def56789",
      healthCheck: { path: "/health", protocol: "HTTP", interval: 30, timeout: 5, healthyThreshold: 3, unhealthyThreshold: 3 },
      targets: [
        { id: "i-0a1b2c3d4e5f6g7h8", port: 80, health: "healthy" },
        { id: "i-0f1e2d3c4b5a69870", port: 80, health: "healthy" }
      ],
      loadBalancer: "prod-web-alb"
    },
    {
      name: "api-tg", arn: "arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/api-tg/abcdef1234567890",
      protocol: "TCP", port: 8080, targetType: "instance", vpcId: "vpc-0abc1234def56789",
      healthCheck: { path: "/", protocol: "TCP", interval: 30, timeout: 10, healthyThreshold: 3, unhealthyThreshold: 3 },
      targets: [
        { id: "i-0f1e2d3c4b5a69870", port: 8080, health: "healthy" }
      ],
      loadBalancer: "internal-api-nlb"
    }
  ],

  autoScalingGroups: [
    {
      name: "web-server-asg", minSize: 2, maxSize: 6, desiredCapacity: 3,
      launchTemplate: "web-server-lt", launchTemplateVersion: "1",
      az: ["us-east-1a", "us-east-1b"], vpcZoneIdentifier: "subnet-0def5678abc12345,subnet-0ghi9012def34567",
      targetGroupARNs: ["arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/prod-web-tg/1234567890"],
      healthCheckType: "ELB", healthCheckGracePeriod: 300,
      instances: ["i-0a1b2c3d4e5f6g7h8", "i-0f1e2d3c4b5a69870"],
      created: "2024-01-15T10:30:00Z",
      tags: [{ Key: "Environment", Value: "Production" }],
      policies: [
        { name: "scale-out", type: "TargetTrackingScaling", metric: "ALBRequestCountPerTarget", target: 1000 },
        { name: "scale-in", type: "TargetTrackingScaling", metric: "ASGAverageCPUUtilization", target: 70 }
      ]
    }
  ],

  launchTemplates: [
    {
      id: "lt-0a1b2c3d4e5f6789", name: "web-server-lt", version: 1, defaultVersion: 1, latestVersion: 2,
      ami: "ami-0abcdef1234567890", instanceType: "t3.small", keyPair: "my-key-pair",
      securityGroups: ["sg-0abc1234def56789"],
      userData: "#!/bin/bash\nyum update -y\nyum install -y httpd\nsystemctl start httpd",
      iamInstanceProfile: "EC2ServiceRole",
      monitoring: true,
      created: "2024-01-15T10:00:00Z",
      createdBy: "admin",
      tags: [{ Key: "Environment", Value: "Production" }]
    },
    {
      id: "lt-0b2c3d4e5f678901", name: "worker-node-lt", version: 1, defaultVersion: 1, latestVersion: 1,
      ami: "ami-0bcdef2345678901a", instanceType: "m5.large", keyPair: "deploy-key",
      securityGroups: ["sg-0def5678abc12345"],
      userData: "",
      iamInstanceProfile: "EC2ServiceRole",
      monitoring: true,
      created: "2024-02-01T09:00:00Z",
      createdBy: "admin",
      tags: [{ Key: "Environment", Value: "Staging" }]
    }
  ],

  securityGroups: [
    {
      id: "sg-0abc1234def56789", name: "web-server-sg",
      description: "Allow HTTP, HTTPS, and SSH traffic for web servers",
      vpcId: "vpc-0abc1234def56789",
      inboundRules: [
        { protocol: "TCP", port: "80", source: "0.0.0.0/0", description: "HTTP" },
        { protocol: "TCP", port: "443", source: "0.0.0.0/0", description: "HTTPS" },
        { protocol: "TCP", port: "22", source: "10.0.0.0/16", description: "SSH from VPC" }
      ],
      outboundRules: [
        { protocol: "All", port: "All", source: "0.0.0.0/0", description: "All outbound traffic" }
      ]
    },
    {
      id: "sg-0def5678abc12345", name: "db-access-sg",
      description: "Allow MySQL and PostgreSQL from app layer",
      vpcId: "vpc-0abc1234def56789",
      inboundRules: [
        { protocol: "TCP", port: "3306", source: "sg-0abc1234def56789", description: "MySQL from web servers" },
        { protocol: "TCP", port: "5432", source: "sg-0abc1234def56789", description: "PostgreSQL from web servers" }
      ],
      outboundRules: [
        { protocol: "All", port: "All", source: "0.0.0.0/0", description: "All outbound traffic" }
      ]
    },
    {
      id: "sg-0ghi3456jkl78901", name: "api-access-sg",
      description: "Allow API traffic on port 8080",
      vpcId: "vpc-0abc1234def56789",
      inboundRules: [
        { protocol: "TCP", port: "8080", source: "sg-0abc1234def56789", description: "API from web tier" },
        { protocol: "TCP", port: "8080", source: "10.0.0.0/16", description: "API from VPC" }
      ],
      outboundRules: [
        { protocol: "All", port: "All", source: "0.0.0.0/0", description: "All outbound" }
      ]
    },
    {
      id: "sg-0jkl5678mno12345", name: "dev-access-sg",
      description: "Development environment - allow SSH and all outbound",
      vpcId: "vpc-0abc1234def56789",
      inboundRules: [
        { protocol: "TCP", port: "22", source: "0.0.0.0/0", description: "SSH from anywhere" },
        { protocol: "TCP", port: "3000", source: "0.0.0.0/0", description: "Dev server" },
        { protocol: "TCP", port: "8080", source: "0.0.0.0/0", description: "Alt HTTP" }
      ],
      outboundRules: [
        { protocol: "All", port: "All", source: "0.0.0.0/0", description: "All outbound" }
      ]
    }
  ],

  keyPairs: [
    { name: "my-key-pair", id: "key-0abc1234def56789", type: "RSA", fingerprint: "a1:b2:c3:d4:e5:f6:a7:b8:c9:d0:e1:f2:a3:b4:c5:d6", created: "2023-01-10T09:00:00Z" },
    { name: "deploy-key", id: "key-0def5678abc12345", type: "RSA", fingerprint: "f1:e2:d3:c4:b5:a6:f7:e8:d9:c0:b1:a2:f3:e4:d5:c6", created: "2023-03-15T12:00:00Z" },
    { name: "dev-key", id: "key-0ghi9012def34567", type: "ED25519", fingerprint: "01:23:45:67:89:ab:cd:ef:01:23:45:67:89:ab:cd:ef", created: "2024-01-05T10:00:00Z" }
  ],

  // ========================
  // S3
  // ========================
  s3: [
    {
      name: "my-app-assets-prod", region: "us-east-1", created: "2023-01-15T10:00:00Z",
      access: "Bucket and objects not public", versioning: "Enabled", encryption: "SSE-S3",
      objects: [
        { key: "index.html", size: 1024, lastModified: "2024-03-01T12:00:00Z", storageClass: "Standard", type: "html" },
        { key: "css/styles.css", size: 4096, lastModified: "2024-03-01T12:05:00Z", storageClass: "Standard", type: "css" },
        { key: "js/app.js", size: 32768, lastModified: "2024-03-01T12:05:00Z", storageClass: "Standard", type: "js" },
        { key: "images/logo.png", size: 20480, lastModified: "2024-02-15T09:00:00Z", storageClass: "Standard", type: "png" },
        { key: "images/hero-banner.jpg", size: 245760, lastModified: "2024-02-15T09:00:00Z", storageClass: "Standard", type: "jpg" }
      ]
    },
    {
      name: "data-lake-raw", region: "us-west-2", created: "2023-02-20T14:30:00Z",
      access: "Bucket and objects not public", versioning: "Disabled", encryption: "SSE-S3",
      objects: [
        { key: "2024/03/events-20240301.json", size: 1048576, lastModified: "2024-03-01T00:05:00Z", storageClass: "Standard", type: "json" },
        { key: "2024/03/events-20240302.json", size: 986234, lastModified: "2024-03-02T00:05:00Z", storageClass: "Standard", type: "json" },
        { key: "schemas/event-schema.avro", size: 2048, lastModified: "2023-06-01T10:00:00Z", storageClass: "Standard", type: "avro" }
      ]
    },
    {
      name: "company-backups", region: "us-east-1", created: "2023-06-01T08:00:00Z",
      access: "Bucket and objects not public", versioning: "Enabled", encryption: "SSE-KMS",
      objects: [
        { key: "db-backup-2024-03-14.sql.gz", size: 52428800, lastModified: "2024-03-14T02:00:00Z", storageClass: "Standard-IA", type: "gz" },
        { key: "db-backup-2024-03-15.sql.gz", size: 53477376, lastModified: "2024-03-15T02:00:00Z", storageClass: "Standard-IA", type: "gz" }
      ]
    },
    {
      name: "static-website-hosting", region: "us-east-1", created: "2024-01-10T09:00:00Z",
      access: "Objects can be public", versioning: "Disabled", encryption: "SSE-S3",
      objects: [
        { key: "index.html", size: 2048, lastModified: "2024-03-10T10:00:00Z", storageClass: "Standard", type: "html" },
        { key: "error.html", size: 512, lastModified: "2024-03-10T10:00:00Z", storageClass: "Standard", type: "html" },
        { key: "assets/style.css", size: 8192, lastModified: "2024-03-10T10:05:00Z", storageClass: "Standard", type: "css" }
      ]
    },
    {
      name: "logs-archive-2024", region: "us-east-1", created: "2024-01-01T00:00:00Z",
      access: "Bucket and objects not public", versioning: "Disabled", encryption: "SSE-S3",
      objects: [
        { key: "cloudtrail/2024/03/ct-log-001.json.gz", size: 524288, lastModified: "2024-03-15T06:00:00Z", storageClass: "Glacier", type: "gz" },
        { key: "cloudtrail/2024/03/ct-log-002.json.gz", size: 412000, lastModified: "2024-03-15T12:00:00Z", storageClass: "Glacier", type: "gz" },
        { key: "elb-logs/2024/03/15/access.log", size: 1048576, lastModified: "2024-03-15T23:59:00Z", storageClass: "Standard-IA", type: "log" }
      ]
    }
  ],

  // ========================
  // Lambda
  // ========================
  lambda: [
    {
      name: "process-image-resize", description: "Resizes uploaded images to thumbnail and medium sizes",
      runtime: "nodejs18.x", handler: "index.handler", memorySize: 256, timeout: 30,
      lastModified: "2024-03-01T09:15:00Z", codeSize: 2048,
      code: "const sharp = require('sharp');\n\nexports.handler = async (event) => {\n  const bucket = event.Records[0].s3.bucket.name;\n  const key = event.Records[0].s3.object.key;\n  \n  console.log(`Processing image: ${key} from ${bucket}`);\n  \n  // Resize to thumbnail\n  const thumbnail = await sharp(imageBuffer)\n    .resize(150, 150)\n    .toBuffer();\n  \n  return {\n    statusCode: 200,\n    body: JSON.stringify({ message: 'Image resized successfully' })\n  };\n};",
      environment: { THUMBNAIL_SIZE: "150", OUTPUT_BUCKET: "my-app-assets-prod" },
      layers: ["arn:aws:lambda:us-east-1:123456789012:layer:sharp-layer:1"],
      role: "arn:aws:iam::123456789012:role/LambdaExecutionRole",
      tags: { project: "web-app" },
      triggers: [{ type: "S3", source: "my-app-assets-prod", event: "s3:ObjectCreated:*" }],
      lastInvocation: "2024-03-15T08:30:00Z", invocations: 1250
    },
    {
      name: "api-auth-handler", description: "Handles API Gateway authentication and token validation",
      runtime: "python3.12", handler: "lambda_function.lambda_handler", memorySize: 128, timeout: 10,
      lastModified: "2024-02-20T14:30:00Z", codeSize: 1536,
      code: "import json\nimport jwt\n\ndef lambda_handler(event, context):\n    token = event.get('authorizationToken', '')\n    \n    try:\n        decoded = jwt.decode(token, 'secret', algorithms=['HS256'])\n        return generate_policy(decoded['sub'], 'Allow', event['methodArn'])\n    except jwt.InvalidTokenError:\n        return generate_policy('user', 'Deny', event['methodArn'])\n\ndef generate_policy(principal_id, effect, resource):\n    return {\n        'principalId': principal_id,\n        'policyDocument': {\n            'Version': '2012-10-17',\n            'Statement': [{\n                'Action': 'execute-api:Invoke',\n                'Effect': effect,\n                'Resource': resource\n            }]\n        }\n    }",
      environment: { JWT_SECRET: "my-secret-key", LOG_LEVEL: "INFO" },
      layers: [],
      role: "arn:aws:iam::123456789012:role/LambdaAuthRole",
      tags: { project: "api-service" },
      triggers: [{ type: "API Gateway", source: "prod-api", event: "ANY /auth/*" }],
      lastInvocation: "2024-03-15T10:00:00Z", invocations: 45200
    },
    {
      name: "scheduled-cleanup", description: "Nightly cleanup of expired temporary files from S3",
      runtime: "nodejs18.x", handler: "index.handler", memorySize: 128, timeout: 300,
      lastModified: "2024-01-15T11:00:00Z", codeSize: 1024,
      code: "const AWS = require('aws-sdk');\nconst s3 = new AWS.S3();\n\nexports.handler = async (event) => {\n  const now = Date.now();\n  const cutoff = now - (24 * 60 * 60 * 1000);\n  \n  console.log('Starting cleanup task...');\n  \n  const params = {\n    Bucket: process.env.CLEANUP_BUCKET,\n    Prefix: 'tmp/'\n  };\n  \n  const objects = await s3.listObjectsV2(params).promise();\n  console.log(`Found ${objects.Contents.length} objects to check`);\n  \n  return { deleted: 0, checked: objects.Contents.length };\n};",
      environment: { CLEANUP_BUCKET: "data-lake-raw", RETENTION_HOURS: "24" },
      layers: [],
      role: "arn:aws:iam::123456789012:role/LambdaExecutionRole",
      tags: { project: "maintenance" },
      triggers: [{ type: "EventBridge", source: "schedule", event: "rate(1 day)" }],
      lastInvocation: "2024-03-15T00:00:00Z", invocations: 365
    },
    {
      name: "order-processor", description: "Processes incoming orders from SQS queue",
      runtime: "python3.12", handler: "lambda_function.lambda_handler", memorySize: 512, timeout: 60,
      lastModified: "2024-03-10T16:00:00Z", codeSize: 3072,
      code: "import json\nimport boto3\n\ndef lambda_handler(event, context):\n    for record in event['Records']:\n        body = json.loads(record['body'])\n        order_id = body.get('order_id')\n        print(f'Processing order: {order_id}')\n        # Process order logic here\n    return {'processed': len(event['Records'])}",
      environment: { ORDERS_TABLE: "orders-table", NOTIFICATION_TOPIC: "order-notifications" },
      layers: [],
      role: "arn:aws:iam::123456789012:role/LambdaExecutionRole",
      tags: { project: "ecommerce" },
      triggers: [{ type: "SQS", source: "order-queue", event: "Messages" }],
      lastInvocation: "2024-03-15T09:45:00Z", invocations: 8750
    }
  ],

  lambdaLayers: [
    { name: "sharp-layer", arn: "arn:aws:lambda:us-east-1:123456789012:layer:sharp-layer", version: 1, runtime: "nodejs18.x", description: "Sharp image processing library", size: 8388608, created: "2024-01-15T10:00:00Z" },
    { name: "common-utils", arn: "arn:aws:lambda:us-east-1:123456789012:layer:common-utils", version: 3, runtime: "python3.12", description: "Common Python utilities and helpers", size: 1048576, created: "2024-03-01T09:00:00Z" },
  ],

  // ========================
  // RDS
  // ========================
  rds: [
    {
      id: "prod-db-primary", engine: "mysql", engineVersion: "8.0.35", class: "db.t3.medium",
      status: "available", role: "Instance",
      endpoint: "prod-db-primary.cxyz1234abcd.us-east-1.rds.amazonaws.com",
      port: 3306, az: "us-east-1a", multiAZ: true, storage: 100, storageType: "gp3",
      vpcId: "vpc-0abc1234def56789", created: "2023-06-01T08:00:00Z",
      backupRetention: 7, backupWindow: "03:00-04:00", maintenanceWindow: "sun:05:00-sun:06:00",
      masterUsername: "admin", publiclyAccessible: false,
      tags: [{ Key: "Environment", Value: "Production" }]
    },
    {
      id: "analytics-postgres", engine: "postgres", engineVersion: "15.4", class: "db.r6g.large",
      status: "available", role: "Instance",
      endpoint: "analytics-postgres.cxyz1234abcd.us-east-1.rds.amazonaws.com",
      port: 5432, az: "us-east-1b", multiAZ: false, storage: 200, storageType: "gp3",
      vpcId: "vpc-0abc1234def56789", created: "2023-09-15T10:00:00Z",
      backupRetention: 7, backupWindow: "04:00-05:00", maintenanceWindow: "sat:06:00-sat:07:00",
      masterUsername: "postgres", publiclyAccessible: false,
      tags: [{ Key: "Environment", Value: "Production" }, { Key: "Team", Value: "Analytics" }]
    },
    {
      id: "dev-test-db", engine: "mysql", engineVersion: "8.0.35", class: "db.t3.micro",
      status: "stopped", role: "Instance",
      endpoint: "dev-test-db.cxyz1234abcd.us-east-1.rds.amazonaws.com",
      port: 3306, az: "us-east-1a", multiAZ: false, storage: 20, storageType: "gp2",
      vpcId: "vpc-0abc1234def56789", created: "2024-01-10T14:00:00Z",
      backupRetention: 1, backupWindow: "03:00-04:00", maintenanceWindow: "sun:05:00-sun:06:00",
      masterUsername: "admin", publiclyAccessible: false,
      tags: [{ Key: "Environment", Value: "Development" }]
    }
  ],

  rdsSnapshots: [
    { id: "rds:prod-db-primary-2024-03-15", dbInstanceId: "prod-db-primary", engine: "mysql", status: "available", snapshotType: "automated", created: "2024-03-15T03:30:00Z", allocatedStorage: 100, encrypted: true },
    { id: "rds:prod-db-primary-2024-03-14", dbInstanceId: "prod-db-primary", engine: "mysql", status: "available", snapshotType: "automated", created: "2024-03-14T03:30:00Z", allocatedStorage: 100, encrypted: true },
    { id: "prod-db-pre-migration", dbInstanceId: "prod-db-primary", engine: "mysql", status: "available", snapshotType: "manual", created: "2024-03-01T10:00:00Z", allocatedStorage: 100, encrypted: true },
    { id: "rds:analytics-postgres-2024-03-15", dbInstanceId: "analytics-postgres", engine: "postgres", status: "available", snapshotType: "automated", created: "2024-03-15T04:30:00Z", allocatedStorage: 200, encrypted: false },
  ],

  rdsSubnetGroups: [
    { name: "default-vpc-subnet-group", description: "Default subnet group for VPC", vpcId: "vpc-0abc1234def56789", status: "Complete", subnets: ["subnet-0def5678abc12345", "subnet-0ghi9012def34567", "subnet-0jkl3456ghi78901"] },
    { name: "private-db-subnets", description: "Private subnets for database instances", vpcId: "vpc-0abc1234def56789", status: "Complete", subnets: ["subnet-0ghi9012def34567", "subnet-0jkl3456ghi78901"] },
  ],

  rdsParameterGroups: [
    { name: "default.mysql8.0", family: "mysql8.0", description: "Default parameter group for MySQL 8.0", type: "DB Parameter Group" },
    { name: "default.postgres15", family: "postgres15", description: "Default parameter group for PostgreSQL 15", type: "DB Parameter Group" },
    { name: "custom-mysql-performance", family: "mysql8.0", description: "Custom MySQL params optimized for performance", type: "DB Parameter Group" },
  ],

  // ========================
  // IAM
  // ========================
  iam: {
    users: [
      { name: "admin", arn: "arn:aws:iam::123456789012:user/admin", created: "2023-01-01", lastActivity: "2024-03-15", groups: ["Admins"], policies: ["AdministratorAccess"], mfaEnabled: true, accessKeyAge: "90 days", passwordLastUsed: "2024-03-15", path: "/", tags: [] },
      { name: "deploy-bot", arn: "arn:aws:iam::123456789012:user/deploy-bot", created: "2023-03-15", lastActivity: "2024-03-15", groups: ["CI-CD"], policies: [], mfaEnabled: false, accessKeyAge: "365 days", passwordLastUsed: "N/A", path: "/", tags: [{ Key: "Purpose", Value: "CI/CD Pipeline" }] },
      { name: "jane.developer", arn: "arn:aws:iam::123456789012:user/jane.developer", created: "2023-06-15", lastActivity: "2024-03-14", groups: ["Developers"], policies: [], mfaEnabled: true, accessKeyAge: "45 days", passwordLastUsed: "2024-03-14", path: "/", tags: [{ Key: "Team", Value: "Engineering" }] },
      { name: "data-analyst", arn: "arn:aws:iam::123456789012:user/data-analyst", created: "2023-09-01", lastActivity: "2024-03-12", groups: ["ReadOnly"], policies: ["AmazonS3ReadOnlyAccess"], mfaEnabled: true, accessKeyAge: "N/A", passwordLastUsed: "2024-03-12", path: "/", tags: [{ Key: "Team", Value: "Analytics" }] },
      { name: "bob.devops", arn: "arn:aws:iam::123456789012:user/bob.devops", created: "2023-08-01", lastActivity: "2024-03-15", groups: ["Developers", "CI-CD"], policies: [], mfaEnabled: true, accessKeyAge: "60 days", passwordLastUsed: "2024-03-15", path: "/", tags: [{ Key: "Team", Value: "DevOps" }] },
    ],
    roles: [
      { name: "EC2ServiceRole", arn: "arn:aws:iam::123456789012:role/EC2ServiceRole", created: "2023-01-02", lastActivity: "2024-03-15", trustedEntities: "AWS service: ec2.amazonaws.com", description: "Allows EC2 instances to call AWS services on your behalf", policies: ["AmazonS3ReadOnlyAccess", "CloudWatchAgentServerPolicy"], path: "/", maxSessionDuration: 3600 },
      { name: "LambdaExecutionRole", arn: "arn:aws:iam::123456789012:role/LambdaExecutionRole", created: "2023-01-02", lastActivity: "2024-03-15", trustedEntities: "AWS service: lambda.amazonaws.com", description: "Allows Lambda functions to access AWS resources", policies: ["AmazonS3FullAccess", "AWSLambdaBasicExecutionRole"], path: "/", maxSessionDuration: 3600 },
      { name: "RDSMonitoringRole", arn: "arn:aws:iam::123456789012:role/RDSMonitoringRole", created: "2023-06-01", lastActivity: "2024-03-15", trustedEntities: "AWS service: monitoring.rds.amazonaws.com", description: "Allows RDS to publish monitoring metrics to CloudWatch", policies: ["AmazonRDSEnhancedMonitoringRole"], path: "/", maxSessionDuration: 3600 },
      { name: "ECSTaskRole", arn: "arn:aws:iam::123456789012:role/ECSTaskRole", created: "2023-09-01", lastActivity: "2024-03-14", trustedEntities: "AWS service: ecs-tasks.amazonaws.com", description: "Allows ECS tasks to access AWS resources", policies: ["AmazonS3ReadOnlyAccess", "AmazonSQSFullAccess"], path: "/", maxSessionDuration: 3600 },
    ],
    policies: [
      { name: "AdministratorAccess", arn: "arn:aws:iam::aws:policy/AdministratorAccess", type: "AWS managed", description: "Provides full access to AWS services and resources", attachedEntities: 1, created: "2023-01-01", updated: "2023-01-01" },
      { name: "AmazonS3FullAccess", arn: "arn:aws:iam::aws:policy/AmazonS3FullAccess", type: "AWS managed", description: "Provides full access to all buckets via the AWS Management Console", attachedEntities: 1, created: "2023-01-01", updated: "2023-01-01" },
      { name: "AmazonS3ReadOnlyAccess", arn: "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess", type: "AWS managed", description: "Provides read-only access to all buckets", attachedEntities: 2, created: "2023-01-01", updated: "2023-01-01" },
      { name: "AWSLambdaBasicExecutionRole", arn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole", type: "AWS managed", description: "Allows Lambda to write logs to CloudWatch", attachedEntities: 1, created: "2023-01-01", updated: "2023-01-01" },
      { name: "CloudWatchAgentServerPolicy", arn: "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy", type: "AWS managed", description: "Allows CloudWatch Agent to publish metrics", attachedEntities: 1, created: "2023-01-01", updated: "2023-01-01" },
      { name: "AmazonRDSEnhancedMonitoringRole", arn: "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole", type: "AWS managed", description: "Provides access to RDS Enhanced Monitoring", attachedEntities: 1, created: "2023-01-01", updated: "2023-01-01" },
      { name: "AmazonSQSFullAccess", arn: "arn:aws:iam::aws:policy/AmazonSQSFullAccess", type: "AWS managed", description: "Provides full access to Amazon SQS", attachedEntities: 1, created: "2023-01-01", updated: "2023-01-01" },
      { name: "AmazonDynamoDBFullAccess", arn: "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess", type: "AWS managed", description: "Provides full access to Amazon DynamoDB", attachedEntities: 0, created: "2023-01-01", updated: "2023-01-01" },
      { name: "DeploymentPolicy", arn: "arn:aws:iam::123456789012:policy/DeploymentPolicy", type: "Customer managed", description: "Custom policy for CI/CD deployments", attachedEntities: 1, created: "2023-03-15", updated: "2024-01-10" },
      { name: "DataAnalystPolicy", arn: "arn:aws:iam::123456789012:policy/DataAnalystPolicy", type: "Customer managed", description: "Custom read-only policy for data analytics team", attachedEntities: 1, created: "2023-09-01", updated: "2024-02-15" },
    ],
    groups: [
      { name: "Admins", arn: "arn:aws:iam::123456789012:group/Admins", created: "2023-01-01", users: ["admin"], policies: ["AdministratorAccess"], path: "/" },
      { name: "Developers", arn: "arn:aws:iam::123456789012:group/Developers", created: "2023-06-01", users: ["jane.developer", "bob.devops"], policies: ["AmazonS3FullAccess"], path: "/" },
      { name: "CI-CD", arn: "arn:aws:iam::123456789012:group/CI-CD", created: "2023-03-15", users: ["deploy-bot", "bob.devops"], policies: ["DeploymentPolicy"], path: "/" },
      { name: "ReadOnly", arn: "arn:aws:iam::123456789012:group/ReadOnly", created: "2023-09-01", users: ["data-analyst"], policies: ["AmazonS3ReadOnlyAccess"], path: "/" },
    ],
    identityProviders: [
      { name: "Google", type: "OIDC", arn: "arn:aws:iam::123456789012:oidc-provider/accounts.google.com", created: "2023-06-01", thumbprints: ["9e99a48a9960b14926bb7f3b02e22da2b0ab7280"] },
    ],
    accountSettings: {
      passwordPolicy: { minimumLength: 12, requireUppercase: true, requireLowercase: true, requireNumbers: true, requireSymbols: true, maxAge: 90, preventReuse: 5, allowUsersToChange: true },
      securityTokenService: { regions: ["us-east-1", "us-west-2", "eu-west-1"] }
    }
  },

  // ========================
  // VPC
  // ========================
  vpc: {
    vpcs: [
      { id: "vpc-0abc1234def56789", name: "production-vpc", cidr: "10.0.0.0/16", state: "available", isDefault: true, tenancy: "default", dnsHostnames: true, dnsResolution: true, tags: [{ Key: "Environment", Value: "Production" }] },
      { id: "vpc-0xyz9876abc54321", name: "staging-vpc", cidr: "172.16.0.0/16", state: "available", isDefault: false, tenancy: "default", dnsHostnames: true, dnsResolution: true, tags: [{ Key: "Environment", Value: "Staging" }] },
    ],
    subnets: [
      { id: "subnet-0def5678abc12345", name: "public-subnet-1a", vpcId: "vpc-0abc1234def56789", cidr: "10.0.1.0/24", az: "us-east-1a", availableIps: 247, autoAssignPublicIp: true, routeTable: "rtb-0pub1234", type: "public" },
      { id: "subnet-0ghi9012def34567", name: "private-subnet-1b", vpcId: "vpc-0abc1234def56789", cidr: "10.0.2.0/24", az: "us-east-1b", availableIps: 245, autoAssignPublicIp: false, routeTable: "rtb-0priv5678", type: "private" },
      { id: "subnet-0jkl3456ghi78901", name: "private-subnet-1c", vpcId: "vpc-0abc1234def56789", cidr: "10.0.3.0/24", az: "us-east-1c", availableIps: 250, autoAssignPublicIp: false, routeTable: "rtb-0priv5678", type: "private" },
      { id: "subnet-0mno7890jkl12345", name: "public-subnet-1b", vpcId: "vpc-0abc1234def56789", cidr: "10.0.4.0/24", az: "us-east-1b", availableIps: 251, autoAssignPublicIp: true, routeTable: "rtb-0pub1234", type: "public" },
    ],
    routeTables: [
      { id: "rtb-0pub1234", name: "public-rt", vpcId: "vpc-0abc1234def56789", associations: ["subnet-0def5678abc12345", "subnet-0mno7890jkl12345"], routes: [
        { destination: "10.0.0.0/16", target: "local", status: "active" },
        { destination: "0.0.0.0/0", target: "igw-0abc1234", status: "active" }
      ]},
      { id: "rtb-0priv5678", name: "private-rt", vpcId: "vpc-0abc1234def56789", associations: ["subnet-0ghi9012def34567", "subnet-0jkl3456ghi78901"], routes: [
        { destination: "10.0.0.0/16", target: "local", status: "active" },
        { destination: "0.0.0.0/0", target: "nat-0abc1234def56789", status: "active" }
      ]},
    ],
    internetGateways: [
      { id: "igw-0abc1234", name: "prod-igw", state: "attached", vpcId: "vpc-0abc1234def56789" }
    ],
    natGateways: [
      { id: "nat-0abc1234def56789", name: "prod-nat", state: "available", subnetId: "subnet-0def5678abc12345", publicIp: "52.90.123.45", privateIp: "10.0.1.10", created: "2023-06-01T10:00:00Z" }
    ],
    networkAcls: [
      { id: "acl-0abc1234", name: "default-nacl", vpcId: "vpc-0abc1234def56789", isDefault: true, associations: ["subnet-0def5678abc12345", "subnet-0ghi9012def34567", "subnet-0jkl3456ghi78901", "subnet-0mno7890jkl12345"],
        inbound: [{ ruleNumber: 100, protocol: "All", portRange: "All", source: "0.0.0.0/0", allow: true }],
        outbound: [{ ruleNumber: 100, protocol: "All", portRange: "All", destination: "0.0.0.0/0", allow: true }]
      }
    ]
  },

  // ========================
  // CloudWatch
  // ========================
  cloudwatch: {
    alarms: [
      { name: "HighCPU-WebServer", description: "CPU utilization > 80% for 5 minutes", metric: "CPUUtilization", namespace: "AWS/EC2", statistic: "Average", period: 300, evaluationPeriods: 2, threshold: 80, comparisonOperator: "GreaterThanThreshold", state: "OK", dimensions: [{ Name: "InstanceId", Value: "i-0a1b2c3d4e5f6g7h8" }], actions: ["arn:aws:sns:us-east-1:123456789012:ops-alerts"], updated: "2024-03-15T10:00:00Z" },
      { name: "RDS-FreeStorage-Low", description: "Free storage space < 5 GB", metric: "FreeStorageSpace", namespace: "AWS/RDS", statistic: "Average", period: 300, evaluationPeriods: 1, threshold: 5368709120, comparisonOperator: "LessThanThreshold", state: "OK", dimensions: [{ Name: "DBInstanceIdentifier", Value: "prod-db-primary" }], actions: ["arn:aws:sns:us-east-1:123456789012:ops-alerts"], updated: "2024-03-15T08:00:00Z" },
      { name: "Lambda-Errors-High", description: "Lambda error rate > 5%", metric: "Errors", namespace: "AWS/Lambda", statistic: "Sum", period: 300, evaluationPeriods: 3, threshold: 10, comparisonOperator: "GreaterThanThreshold", state: "ALARM", dimensions: [{ Name: "FunctionName", Value: "api-auth-handler" }], actions: ["arn:aws:sns:us-east-1:123456789012:ops-alerts"], updated: "2024-03-15T09:30:00Z" },
      { name: "ALB-5xx-Count", description: "5xx error count > 50 in 5 minutes", metric: "HTTPCode_ELB_5XX_Count", namespace: "AWS/ApplicationELB", statistic: "Sum", period: 300, evaluationPeriods: 1, threshold: 50, comparisonOperator: "GreaterThanThreshold", state: "OK", dimensions: [{ Name: "LoadBalancer", Value: "app/prod-web-alb/1234567890abcdef" }], actions: [], updated: "2024-03-15T10:00:00Z" },
      { name: "Billing-Threshold", description: "Estimated charges > $300", metric: "EstimatedCharges", namespace: "AWS/Billing", statistic: "Maximum", period: 21600, evaluationPeriods: 1, threshold: 300, comparisonOperator: "GreaterThanThreshold", state: "OK", dimensions: [{ Name: "Currency", Value: "USD" }], actions: ["arn:aws:sns:us-east-1:123456789012:billing-alerts"], updated: "2024-03-15T06:00:00Z" },
    ],
    logGroups: [
      { name: "/aws/lambda/process-image-resize", storedBytes: 52428800, retentionDays: 30, created: "2024-01-15T10:00:00Z", streams: 12 },
      { name: "/aws/lambda/api-auth-handler", storedBytes: 104857600, retentionDays: 14, created: "2024-01-15T10:00:00Z", streams: 25 },
      { name: "/aws/lambda/scheduled-cleanup", storedBytes: 10485760, retentionDays: 7, created: "2024-01-15T10:00:00Z", streams: 5 },
      { name: "/aws/lambda/order-processor", storedBytes: 209715200, retentionDays: 30, created: "2024-03-10T16:00:00Z", streams: 18 },
      { name: "/aws/rds/instance/prod-db-primary/error", storedBytes: 5242880, retentionDays: 90, created: "2023-06-01T08:00:00Z", streams: 3 },
      { name: "/aws/rds/instance/prod-db-primary/slowquery", storedBytes: 15728640, retentionDays: 30, created: "2023-06-01T08:00:00Z", streams: 3 },
      { name: "/ecs/web-service", storedBytes: 314572800, retentionDays: 14, created: "2024-02-01T10:00:00Z", streams: 30 },
      { name: "application-logs", storedBytes: 524288000, retentionDays: 90, created: "2023-01-01T00:00:00Z", streams: 50 },
    ],
    dashboards: [
      { name: "Production-Overview", widgets: 8, lastModified: "2024-03-14T16:00:00Z" },
      { name: "API-Performance", widgets: 6, lastModified: "2024-03-10T10:00:00Z" },
      { name: "Cost-Monitoring", widgets: 4, lastModified: "2024-03-01T09:00:00Z" },
    ],
    metrics: {
      "CPUUtilization": [
        { timestamp: "2024-03-15T10:00:00Z", value: 45.2 },
        { timestamp: "2024-03-15T10:05:00Z", value: 52.1 },
        { timestamp: "2024-03-15T10:10:00Z", value: 38.7 },
        { timestamp: "2024-03-15T10:15:00Z", value: 61.3 },
        { timestamp: "2024-03-15T10:20:00Z", value: 55.8 },
        { timestamp: "2024-03-15T10:25:00Z", value: 42.5 },
      ],
      "NetworkIn": [
        { timestamp: "2024-03-15T10:00:00Z", value: 1048576 },
        { timestamp: "2024-03-15T10:05:00Z", value: 2097152 },
        { timestamp: "2024-03-15T10:10:00Z", value: 1572864 },
        { timestamp: "2024-03-15T10:15:00Z", value: 3145728 },
        { timestamp: "2024-03-15T10:20:00Z", value: 2621440 },
        { timestamp: "2024-03-15T10:25:00Z", value: 1835008 },
      ]
    }
  },

  // ========================
  // DynamoDB
  // ========================
  dynamodb: {
    tables: [
      { name: "users-table", status: "ACTIVE", partitionKey: "userId", sortKey: "", itemCount: 15420, sizeBytes: 52428800, created: "2023-03-01T10:00:00Z", readCapacity: 25, writeCapacity: 10, billingMode: "PROVISIONED", encryption: "DEFAULT", streamEnabled: false, tags: [{ Key: "Project", Value: "WebApp" }], gsi: [{ name: "email-index", partitionKey: "email", sortKey: "", status: "ACTIVE", itemCount: 15420 }] },
      { name: "orders-table", status: "ACTIVE", partitionKey: "orderId", sortKey: "timestamp", itemCount: 245000, sizeBytes: 524288000, created: "2023-06-15T14:00:00Z", readCapacity: 0, writeCapacity: 0, billingMode: "PAY_PER_REQUEST", encryption: "KMS", streamEnabled: true, tags: [{ Key: "Project", Value: "ecommerce" }], gsi: [{ name: "user-orders-index", partitionKey: "userId", sortKey: "timestamp", status: "ACTIVE", itemCount: 245000 }] },
      { name: "sessions-table", status: "ACTIVE", partitionKey: "sessionId", sortKey: "", itemCount: 3200, sizeBytes: 1048576, created: "2024-01-01T00:00:00Z", readCapacity: 50, writeCapacity: 50, billingMode: "PROVISIONED", encryption: "DEFAULT", streamEnabled: false, tags: [], gsi: [] },
    ]
  },

  // ========================
  // SNS
  // ========================
  sns: {
    topics: [
      { name: "ops-alerts", arn: "arn:aws:sns:us-east-1:123456789012:ops-alerts", displayName: "Operations Alerts", subscriptions: 3, created: "2023-01-15T10:00:00Z", type: "Standard" },
      { name: "billing-alerts", arn: "arn:aws:sns:us-east-1:123456789012:billing-alerts", displayName: "Billing Alerts", subscriptions: 2, created: "2023-01-15T10:00:00Z", type: "Standard" },
      { name: "order-notifications", arn: "arn:aws:sns:us-east-1:123456789012:order-notifications", displayName: "Order Notifications", subscriptions: 1, created: "2023-06-15T14:00:00Z", type: "Standard" },
      { name: "deployment-notifications", arn: "arn:aws:sns:us-east-1:123456789012:deployment-notifications", displayName: "Deploy Notifications", subscriptions: 4, created: "2023-03-15T10:00:00Z", type: "Standard" },
    ],
    subscriptions: [
      { arn: "arn:aws:sns:us-east-1:123456789012:ops-alerts:sub1", topicArn: "arn:aws:sns:us-east-1:123456789012:ops-alerts", protocol: "email", endpoint: "ops-team@company.com", status: "Confirmed" },
      { arn: "arn:aws:sns:us-east-1:123456789012:ops-alerts:sub2", topicArn: "arn:aws:sns:us-east-1:123456789012:ops-alerts", protocol: "sms", endpoint: "+1-555-0123", status: "Confirmed" },
      { arn: "arn:aws:sns:us-east-1:123456789012:ops-alerts:sub3", topicArn: "arn:aws:sns:us-east-1:123456789012:ops-alerts", protocol: "lambda", endpoint: "arn:aws:lambda:us-east-1:123456789012:function:alert-handler", status: "Confirmed" },
      { arn: "arn:aws:sns:us-east-1:123456789012:billing-alerts:sub1", topicArn: "arn:aws:sns:us-east-1:123456789012:billing-alerts", protocol: "email", endpoint: "finance@company.com", status: "Confirmed" },
      { arn: "arn:aws:sns:us-east-1:123456789012:billing-alerts:sub2", topicArn: "arn:aws:sns:us-east-1:123456789012:billing-alerts", protocol: "email", endpoint: "admin@company.com", status: "Confirmed" },
    ]
  },

  // ========================
  // SQS
  // ========================
  sqs: {
    queues: [
      { name: "order-queue", url: "https://sqs.us-east-1.amazonaws.com/123456789012/order-queue", type: "Standard", messagesAvailable: 12, messagesInFlight: 3, created: "2023-06-15T14:00:00Z", visibilityTimeout: 30, messageRetention: 345600, maxMessageSize: 262144, deliveryDelay: 0, receiveWaitTime: 20, deadLetterQueue: "order-queue-dlq", maxReceives: 5, encryption: "SSE-SQS" },
      { name: "order-queue-dlq", url: "https://sqs.us-east-1.amazonaws.com/123456789012/order-queue-dlq", type: "Standard", messagesAvailable: 2, messagesInFlight: 0, created: "2023-06-15T14:00:00Z", visibilityTimeout: 30, messageRetention: 1209600, maxMessageSize: 262144, deliveryDelay: 0, receiveWaitTime: 0, deadLetterQueue: "", maxReceives: 0, encryption: "SSE-SQS" },
      { name: "notification-queue", url: "https://sqs.us-east-1.amazonaws.com/123456789012/notification-queue", type: "Standard", messagesAvailable: 0, messagesInFlight: 0, created: "2024-01-10T09:00:00Z", visibilityTimeout: 60, messageRetention: 86400, maxMessageSize: 262144, deliveryDelay: 0, receiveWaitTime: 20, deadLetterQueue: "", maxReceives: 0, encryption: "SSE-SQS" },
      { name: "image-processing.fifo", url: "https://sqs.us-east-1.amazonaws.com/123456789012/image-processing.fifo", type: "FIFO", messagesAvailable: 5, messagesInFlight: 1, created: "2024-02-01T10:00:00Z", visibilityTimeout: 120, messageRetention: 345600, maxMessageSize: 262144, deliveryDelay: 0, receiveWaitTime: 20, deadLetterQueue: "", maxReceives: 0, encryption: "SSE-SQS" },
    ]
  },

  // ========================
  // CloudFront
  // ========================
  cloudfront: {
    distributions: [
      { id: "E1A2B3C4D5E6F7", domainName: "d1a2b3c4d5e6f7.cloudfront.net", status: "Deployed", state: "Enabled", origins: [{ domainName: "my-app-assets-prod.s3.amazonaws.com", id: "S3-my-app-assets-prod" }], defaultCacheBehavior: { viewerProtocolPolicy: "redirect-to-https", allowedMethods: ["GET", "HEAD"], cachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6" }, priceClass: "PriceClass_100", alternateNames: ["cdn.myapp.com"], comment: "Production CDN", lastModified: "2024-03-01T10:00:00Z", tags: [{ Key: "Environment", Value: "Production" }] },
      { id: "E7F6E5D4C3B2A1", domainName: "d7f6e5d4c3b2a1.cloudfront.net", status: "Deployed", state: "Enabled", origins: [{ domainName: "static-website-hosting.s3-website-us-east-1.amazonaws.com", id: "S3-Website" }], defaultCacheBehavior: { viewerProtocolPolicy: "allow-all", allowedMethods: ["GET", "HEAD"], cachePolicyId: "658327ea-f89d-4fab-a63d-7e88639e58f6" }, priceClass: "PriceClass_All", alternateNames: [], comment: "Static website CDN", lastModified: "2024-01-15T14:00:00Z", tags: [{ Key: "Project", Value: "Website" }] },
    ]
  },

  // ========================
  // Route 53
  // ========================
  route53: {
    hostedZones: [
      { id: "Z1234567890ABC", name: "myapp.com.", type: "Public", recordCount: 8, comment: "Production domain", created: "2023-01-01T00:00:00Z" },
      { id: "Z0987654321DEF", name: "internal.myapp.com.", type: "Private", recordCount: 5, comment: "Internal service discovery", vpcId: "vpc-0abc1234def56789", created: "2023-06-01T00:00:00Z" },
    ],
    records: [
      { id: "rec-001", zoneId: "Z1234567890ABC", name: "myapp.com.", type: "A", ttl: 300, value: "54.123.45.67" },
      { id: "rec-002", zoneId: "Z1234567890ABC", name: "www.myapp.com.", type: "CNAME", ttl: 300, value: "d1a2b3c4d5e6f7.cloudfront.net" },
      { id: "rec-003", zoneId: "Z1234567890ABC", name: "api.myapp.com.", type: "A", ttl: 60, value: "52.87.123.45" },
      { id: "rec-004", zoneId: "Z1234567890ABC", name: "cdn.myapp.com.", type: "CNAME", ttl: 300, value: "d1a2b3c4d5e6f7.cloudfront.net" },
      { id: "rec-005", zoneId: "Z1234567890ABC", name: "mail.myapp.com.", type: "MX", ttl: 300, value: "10 mail.myapp.com" },
      { id: "rec-006", zoneId: "Z1234567890ABC", name: "myapp.com.", type: "TXT", ttl: 300, value: "v=spf1 include:_spf.google.com ~all" },
      { id: "rec-007", zoneId: "Z1234567890ABC", name: "myapp.com.", type: "NS", ttl: 172800, value: "ns-1234.awsdns-56.org" },
      { id: "rec-008", zoneId: "Z1234567890ABC", name: "myapp.com.", type: "SOA", ttl: 900, value: "ns-1234.awsdns-56.org. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400" },
      { id: "rec-009", zoneId: "Z0987654321DEF", name: "db.internal.myapp.com.", type: "CNAME", ttl: 60, value: "prod-db-primary.cxyz1234abcd.us-east-1.rds.amazonaws.com" },
      { id: "rec-010", zoneId: "Z0987654321DEF", name: "cache.internal.myapp.com.", type: "A", ttl: 60, value: "10.0.2.50" },
      { id: "rec-011", zoneId: "Z0987654321DEF", name: "api.internal.myapp.com.", type: "A", ttl: 60, value: "10.0.1.100" },
    ]
  },

  // ========================
  // Billing
  // ========================
  billing: {
    currentMonth: 245.67,
    forecast: 285.00,
    lastMonth: 231.45,
    currency: "USD",
    history: [
      { month: "Oct 2023", amount: 198.30 },
      { month: "Nov 2023", amount: 210.50 },
      { month: "Dec 2023", amount: 225.00 },
      { month: "Jan 2024", amount: 218.75 },
      { month: "Feb 2024", amount: 231.45 },
      { month: "Mar 2024", amount: 245.67 }
    ],
    byService: [
      { name: "Amazon EC2", amount: 142.30, percentage: 57.9, color: "#FF9900" },
      { name: "Amazon RDS", amount: 52.80, percentage: 21.5, color: "#3B48CC" },
      { name: "Amazon S3", amount: 18.50, percentage: 7.5, color: "#3ECF8E" },
      { name: "AWS Lambda", amount: 8.20, percentage: 3.3, color: "#FF9900" },
      { name: "Amazon CloudWatch", amount: 12.40, percentage: 5.0, color: "#E7157B" },
      { name: "Data Transfer", amount: 6.97, percentage: 2.8, color: "#879596" },
      { name: "Other", amount: 4.50, percentage: 1.8, color: "#D5DBDB" }
    ],
    freeTier: [
      { service: "Amazon EC2", usageType: "750 hours of t2.micro Linux", limit: "750 Hrs", used: 595.46, percentage: 79.39 },
      { service: "Amazon S3", usageType: "5 GB of Standard storage", limit: "5 GB", used: 0.29, percentage: 5.8 },
      { service: "AWS Lambda", usageType: "1M free requests per month", limit: "1,000,000", used: 125000, percentage: 12.5 },
      { service: "Amazon RDS", usageType: "750 hours of db.t2.micro", limit: "750 Hrs", used: 750, percentage: 100.0 },
      { service: "Amazon DynamoDB", usageType: "25 GB of storage", limit: "25 GB", used: 0.55, percentage: 2.2 },
      { service: "Amazon SNS", usageType: "1M free publishes per month", limit: "1,000,000", used: 8500, percentage: 0.85 },
      { service: "Amazon SQS", usageType: "1M free requests per month", limit: "1,000,000", used: 45200, percentage: 4.52 }
    ],
    bills: [
      { period: "March 2024", total: 245.67, status: "Open", dueDate: "2024-04-03" },
      { period: "February 2024", total: 231.45, status: "Paid", dueDate: "2024-03-03", paidDate: "2024-03-01" },
      { period: "January 2024", total: 218.75, status: "Paid", dueDate: "2024-02-03", paidDate: "2024-02-01" },
      { period: "December 2023", total: 225.00, status: "Paid", dueDate: "2024-01-03", paidDate: "2024-01-02" },
    ],
    budgets: [
      { name: "Monthly-Total", type: "Cost", limit: 300, period: "MONTHLY", actual: 245.67, forecast: 285.00, alertThresholds: [80, 100], alerts: [{ threshold: 80, actual: 81.89, triggered: true }] },
      { name: "EC2-Budget", type: "Cost", limit: 200, period: "MONTHLY", actual: 142.30, forecast: 165.00, alertThresholds: [90], alerts: [] },
    ],
    paymentMethods: [
      { type: "Credit Card", last4: "4242", brand: "Visa", expiry: "12/2025", isDefault: true },
    ],
    taxSettings: {
      registrationNumber: "",
      businessLegalName: "My Company Inc.",
      address: { line1: "123 Cloud Street", city: "Seattle", state: "WA", zip: "98101", country: "US" },
      taxExemption: false
    }
  },

  // ========================
  // Notifications & Flash
  // ========================
  notifications: [
    { id: "notif-001", title: "Instance state change", message: "i-0a1b2c3d4e5f6g7h8 (Web-Server-01) is now running", type: "info", timestamp: "2024-03-15T10:30:00Z", read: true, service: "EC2" },
    { id: "notif-002", title: "RDS maintenance scheduled", message: "prod-db-primary has a maintenance window in 3 days", type: "warning", timestamp: "2024-03-15T08:00:00Z", read: false, service: "RDS" },
    { id: "notif-003", title: "Budget alert", message: "Your month-to-date costs have reached 80% of your budget ($250.00)", type: "warning", timestamp: "2024-03-14T12:00:00Z", read: false, service: "Billing" },
    { id: "notif-004", title: "Lambda deployment successful", message: "Function process-image-resize deployed successfully", type: "success", timestamp: "2024-03-14T09:15:00Z", read: true, service: "Lambda" },
    { id: "notif-005", title: "CloudWatch Alarm", message: "Lambda-Errors-High alarm is in ALARM state", type: "error", timestamp: "2024-03-15T09:30:00Z", read: false, service: "CloudWatch" },
  ],

  flash: []
});
