# Alibaba Cloud (Xliyun) Console Mock -- Data Model

This document defines all entity types, their fields, relationships, and example values for `dataManager.js`.

---

## 1. User / Account

```js
user: {
  accountId: "1386-7890-1234",        // String, 12-digit format
  accountName: "Hangzhou Tech Co.",    // String, company name
  displayName: "Zhang Wei",           // String, current user display name
  email: "zhangwei@hangzhoutech.com", // String
  phone: "+86-138-xxxx-5678",         // String
  region: "cn-hangzhou",              // String, default selected region
  language: "zh-CN",                  // String, "zh-CN" or "en"
  role: "admin",                      // String, "admin" | "user"
  balance: 12586.42,                  // Number, account balance in CNY
  creditRating: "A",                  // String
  verificationStatus: "verified"      // String
}
```

## 2. Regions

```js
regions: [
  { id: "cn-hangzhou", name: "China (Hangzhou)", nameZh: "华东1（杭州）", zone: "cn" },
  { id: "cn-shanghai", name: "China (Shanghai)", nameZh: "华东2（上海）", zone: "cn" },
  { id: "cn-beijing", name: "China (Beijing)", nameZh: "华北2（北京）", zone: "cn" },
  { id: "cn-shenzhen", name: "China (Shenzhen)", nameZh: "华南1（深圳）", zone: "cn" },
  { id: "cn-chengdu", name: "China (Chengdu)", nameZh: "西南1（成都）", zone: "cn" },
  { id: "cn-hongkong", name: "China (Hong Kong)", nameZh: "中国香港", zone: "intl" },
  { id: "ap-southeast-1", name: "Singapore", nameZh: "新加坡", zone: "intl" },
  { id: "us-west-1", name: "US (Silicon Valley)", nameZh: "美国（硅谷）", zone: "intl" },
  { id: "eu-central-1", name: "Germany (Frankfurt)", nameZh: "德国（法兰克福）", zone: "intl" },
  { id: "ap-northeast-1", name: "Japan (Tokyo)", nameZh: "日本（东京）", zone: "intl" }
]
```

## 3. ECS Instances (Elastic Compute Service)

```js
ecsInstances: [
  {
    id: "i-bp1234567890abcdef",          // String, instance ID
    name: "web-server-prod-01",           // String, user-defined name
    status: "Running",                    // "Running" | "Stopped" | "Starting" | "Stopping" | "Expired"
    regionId: "cn-hangzhou",              // String, region
    zoneId: "cn-hangzhou-h",              // String, availability zone
    instanceType: "ecs.g7.xlarge",        // String, spec family.generation.size
    vCPU: 4,                              // Number
    memory: 16,                           // Number, GiB
    osType: "linux",                      // "linux" | "windows"
    osName: "Alibaba Cloud Linux 3.2104 LTS 64-bit", // String
    imageId: "aliyun_3_x64_20G_alibase_20230727", // String
    publicIpAddress: "47.98.123.45",      // String or ""
    privateIpAddress: "172.16.0.10",      // String
    vpcId: "vpc-bp1a2b3c4d5e6f7g8",      // String
    vswitchId: "vsw-bp1a2b3c4d5e6f7g8",  // String
    securityGroupIds: ["sg-bp1234567890abcdef"], // Array<String>
    keyPairName: "my-keypair",            // String
    billingMethod: "Subscription",        // "Subscription" | "Pay-As-You-Go"
    renewalStatus: "AutoRenewal",         // "AutoRenewal" | "ManualRenewal" | "NotRenewal"
    creationTime: "2024-01-15T08:30:00Z", // ISO datetime
    expiredTime: "2025-01-15T08:30:00Z",  // ISO datetime or null
    tags: [
      { key: "env", value: "production" },
      { key: "team", value: "backend" }
    ],
    systemDiskSize: 40,                   // Number, GiB
    systemDiskCategory: "cloud_essd",     // String
    dataDiskCount: 1                      // Number
  }
  // ... more instances
]
```

## 4. Cloud Disks (Block Storage)

```js
disks: [
  {
    id: "d-bp1234567890abcdef",
    name: "data-disk-01",
    status: "In_use",                     // "In_use" | "Available" | "Creating" | "Detaching"
    regionId: "cn-hangzhou",
    zoneId: "cn-hangzhou-h",
    category: "cloud_essd",               // "cloud_essd" | "cloud_ssd" | "cloud_efficiency" | "cloud"
    performanceLevel: "PL1",              // "PL0" | "PL1" | "PL2" | "PL3"
    size: 100,                            // Number, GiB
    instanceId: "i-bp1234567890abcdef",   // String, attached ECS instance or ""
    device: "/dev/vdb",                   // String, mount point or ""
    diskType: "data",                     // "system" | "data"
    billingMethod: "Subscription",
    encrypted: false,
    creationTime: "2024-01-15T08:30:00Z",
    tags: []
  }
]
```

## 5. Security Groups

```js
securityGroups: [
  {
    id: "sg-bp1234567890abcdef",
    name: "web-sg-prod",
    description: "Security group for web servers",
    regionId: "cn-hangzhou",
    vpcId: "vpc-bp1a2b3c4d5e6f7g8",
    type: "normal",                       // "normal" | "enterprise"
    instanceCount: 3,
    creationTime: "2024-01-10T06:00:00Z",
    rules: [
      {
        direction: "ingress",             // "ingress" | "egress"
        protocol: "tcp",                  // "tcp" | "udp" | "icmp" | "all"
        portRange: "80/80",               // String "startPort/endPort"
        sourceCidrIp: "0.0.0.0/0",       // String
        priority: 1,                      // 1-100
        policy: "Accept",                 // "Accept" | "Drop"
        description: "Allow HTTP"
      },
      {
        direction: "ingress",
        protocol: "tcp",
        portRange: "443/443",
        sourceCidrIp: "0.0.0.0/0",
        priority: 1,
        policy: "Accept",
        description: "Allow HTTPS"
      },
      {
        direction: "ingress",
        protocol: "tcp",
        portRange: "22/22",
        sourceCidrIp: "10.0.0.0/8",
        priority: 1,
        policy: "Accept",
        description: "Allow SSH from internal"
      }
    ]
  }
]
```

## 6. VPC (Virtual Private Cloud)

```js
vpcs: [
  {
    id: "vpc-bp1a2b3c4d5e6f7g8",
    name: "prod-vpc",
    status: "Available",
    regionId: "cn-hangzhou",
    cidrBlock: "172.16.0.0/12",
    description: "Production VPC",
    vswitchCount: 3,
    routeTableCount: 1,
    creationTime: "2024-01-05T03:00:00Z",
    isDefault: false,
    tags: [{ key: "env", value: "production" }]
  }
]
```

## 7. VSwitches (Subnets)

```js
vswitches: [
  {
    id: "vsw-bp1a2b3c4d5e6f7g8",
    name: "web-subnet",
    status: "Available",
    vpcId: "vpc-bp1a2b3c4d5e6f7g8",
    zoneId: "cn-hangzhou-h",
    cidrBlock: "172.16.0.0/24",
    availableIpCount: 248,
    description: "Web tier subnet",
    creationTime: "2024-01-05T03:10:00Z",
    isDefault: false
  }
]
```

## 8. EIP (Elastic IP Addresses)

```js
eips: [
  {
    id: "eip-bp1234567890abcdef",
    name: "prod-eip-01",
    status: "InUse",                      // "InUse" | "Available"
    ipAddress: "47.98.123.45",
    bandwidth: 100,                       // Mbps
    internetChargeType: "PayByTraffic",   // "PayByTraffic" | "PayByBandwidth"
    instanceId: "i-bp1234567890abcdef",
    instanceType: "EcsInstance",          // "EcsInstance" | "SlbInstance" | "Nat"
    regionId: "cn-hangzhou",
    billingMethod: "Subscription",
    creationTime: "2024-01-15T08:25:00Z"
  }
]
```

## 9. OSS Buckets (Object Storage Service)

```js
ossBuckets: [
  {
    name: "hangzhoutech-static-assets",   // String, globally unique
    regionId: "cn-hangzhou",
    storageClass: "Standard",             // "Standard" | "IA" | "Archive" | "ColdArchive"
    acl: "private",                       // "private" | "public-read" | "public-read-write"
    creationTime: "2024-02-01T10:00:00Z",
    objectCount: 15234,
    storageSize: 4.7,                     // GiB
    lastModifiedTime: "2024-03-15T14:30:00Z",
    versioning: "Enabled",               // "Enabled" | "Suspended" | null
    encryption: "AES256",                 // "AES256" | "KMS" | null
    tags: [{ key: "project", value: "website" }]
  }
]
```

## 10. RDS Instances (Relational Database Service)

```js
rdsInstances: [
  {
    id: "rm-bp1234567890abcdef",
    name: "prod-mysql-master",
    status: "Running",                    // "Running" | "Stopped" | "Creating" | "Deleting"
    regionId: "cn-hangzhou",
    zoneId: "cn-hangzhou-h",
    engine: "MySQL",                      // "MySQL" | "PostgreSQL" | "SQLServer" | "MariaDB"
    engineVersion: "8.0",
    instanceType: "rds.mysql.s3.large",   // String, DB instance class
    vCPU: 4,
    memory: 8,                            // GiB
    storageSize: 200,                     // GiB
    storageType: "cloud_essd",
    connectionString: "rm-bp1234567890.mysql.rds.aliyuncs.com",
    port: 3306,
    vpcId: "vpc-bp1a2b3c4d5e6f7g8",
    vswitchId: "vsw-bp1a2b3c4d5e6f7g8",
    billingMethod: "Subscription",
    creationTime: "2024-01-20T09:00:00Z",
    expiredTime: "2025-01-20T09:00:00Z",
    category: "HighAvailability",         // "Basic" | "HighAvailability" | "AlwaysOn" | "Finance"
    maxConnections: 4000,
    maxIOPS: 10000,
    tags: [{ key: "env", value: "production" }]
  }
]
```

## 11. SLB Instances (Server Load Balancer)

```js
slbInstances: [
  {
    id: "lb-bp1234567890abcdef",
    name: "prod-web-lb",
    status: "active",                     // "active" | "inactive" | "locked"
    regionId: "cn-hangzhou",
    addressType: "internet",              // "internet" | "intranet"
    address: "120.78.123.45",
    networkType: "vpc",
    vpcId: "vpc-bp1a2b3c4d5e6f7g8",
    bandwidth: 100,                       // Mbps, -1 for PayByTraffic
    billingMethod: "PayByTraffic",
    creationTime: "2024-01-25T11:00:00Z",
    listenerCount: 2,
    backendServerCount: 3,
    listeners: [
      { protocol: "HTTP", frontendPort: 80, backendPort: 80, status: "running" },
      { protocol: "HTTPS", frontendPort: 443, backendPort: 443, status: "running" }
    ]
  }
]
```

## 12. Billing / Cost Data

```js
billing: {
  balance: 12586.42,                      // CNY
  currency: "CNY",
  monthlySpend: [
    { month: "2024-03", amount: 3245.80 },
    { month: "2024-02", amount: 2987.50 },
    { month: "2024-01", amount: 3102.15 },
    { month: "2023-12", amount: 2876.30 },
    { month: "2023-11", amount: 2654.90 },
    { month: "2023-10", amount: 2432.10 }
  ],
  productBreakdown: [
    { product: "ECS", amount: 1856.40, percentage: 57.2 },
    { product: "RDS", amount: 645.20, percentage: 19.9 },
    { product: "OSS", amount: 234.50, percentage: 7.2 },
    { product: "SLB", amount: 189.30, percentage: 5.8 },
    { product: "EIP", amount: 145.60, percentage: 4.5 },
    { product: "Other", amount: 174.80, percentage: 5.4 }
  ],
  unpaidOrders: 0,
  coupons: [
    { id: "coupon-001", name: "New User Discount", amount: 200, expiry: "2024-06-30", status: "available" }
  ],
  renewalReminders: [
    { resourceId: "i-bp1234567890abcdef", resourceName: "web-server-prod-01", type: "ECS", expiry: "2025-01-15T08:30:00Z", daysLeft: 305 }
  ]
}
```

## 13. CloudMonitor Alarms

```js
alarms: [
  {
    id: "alarm-001",
    name: "ECS CPU High",
    status: "OK",                         // "OK" | "ALARM" | "INSUFFICIENT_DATA"
    product: "ECS",
    metricName: "CPUUtilization",
    threshold: 80,
    comparisonOperator: ">=",
    statistics: "Average",
    period: 300,                          // seconds
    evaluationCount: 3,
    instanceId: "i-bp1234567890abcdef",
    contactGroups: ["ops-team"],
    enabled: true,
    creationTime: "2024-02-01T10:00:00Z"
  }
]
```

## 14. Recent Activity / Operation Log

```js
operationLog: [
  {
    id: "log-001",
    eventTime: "2024-03-15T14:30:00Z",
    serviceName: "ECS",
    eventName: "StopInstance",
    resourceType: "Instance",
    resourceId: "i-bp1234567890abcdef",
    resourceName: "web-server-prod-01",
    userAgent: "console",
    sourceIpAddress: "120.26.45.67",
    result: "Success"
  }
]
```

## 15. Recent Products / Favorites

```js
recentProducts: [
  { id: "ecs", name: "ECS", nameZh: "云服务器 ECS", path: "/ecs", icon: "server", lastVisited: "2024-03-15T14:00:00Z" },
  { id: "oss", name: "OSS", nameZh: "对象存储 OSS", path: "/oss", icon: "database", lastVisited: "2024-03-15T12:00:00Z" },
  { id: "rds", name: "RDS", nameZh: "云数据库 RDS", path: "/rds", icon: "database", lastVisited: "2024-03-14T16:00:00Z" },
  { id: "slb", name: "SLB", nameZh: "负载均衡 SLB", path: "/slb", icon: "share2", lastVisited: "2024-03-14T10:00:00Z" },
  { id: "vpc", name: "VPC", nameZh: "专有网络 VPC", path: "/vpc", icon: "globe", lastVisited: "2024-03-13T15:00:00Z" }
],

favoriteProducts: [
  { id: "ecs", name: "ECS", nameZh: "云服务器 ECS", path: "/ecs" },
  { id: "oss", name: "OSS", nameZh: "对象存储 OSS", path: "/oss" },
  { id: "rds", name: "RDS", nameZh: "云数据库 RDS", path: "/rds" }
]
```

## 16. Messages / Notifications

```js
messages: [
  {
    id: "msg-001",
    type: "system",                       // "system" | "billing" | "security" | "product"
    title: "ECS Instance Renewal Reminder",
    content: "Your ECS instance web-server-prod-01 (i-bp1234567890abcdef) will expire in 30 days. Please renew in time.",
    isRead: false,
    createdAt: "2024-03-15T06:00:00Z"
  },
  {
    id: "msg-002",
    type: "billing",
    title: "February Bill Available",
    content: "Your February 2024 bill has been generated. Total: 2,987.50 CNY.",
    isRead: true,
    createdAt: "2024-03-01T08:00:00Z"
  },
  {
    id: "msg-003",
    type: "security",
    title: "Abnormal Login Detected",
    content: "An abnormal login was detected from IP 203.0.113.45 at 2024-03-14 23:45. If this was not you, please check your account security.",
    isRead: false,
    createdAt: "2024-03-14T23:50:00Z"
  }
]
```

---

## Relationships

- **ECS Instance** -> belongs to **Region**, **VPC**, **VSwitch**, **Security Group**; has attached **Disks** and **EIP**
- **Disk** -> belongs to **Region**; optionally attached to **ECS Instance**
- **Security Group** -> belongs to **VPC**; associated with multiple **ECS Instances**
- **VPC** -> belongs to **Region**; contains **VSwitches**
- **VSwitch** -> belongs to **VPC** and **Zone**
- **EIP** -> belongs to **Region**; optionally bound to **ECS Instance** or **SLB**
- **OSS Bucket** -> belongs to **Region** (independent of VPC)
- **RDS Instance** -> belongs to **Region**, **VPC**, **VSwitch**
- **SLB Instance** -> belongs to **Region**, **VPC**; routes to **ECS Instances** as backend servers
- **Alarm** -> monitors a specific resource (ECS, RDS, etc.)
- **Operation Log** -> references a resource and service

---

## Suggested `createInitialData()` Seed Counts

| Entity | Count | Notes |
|--------|-------|-------|
| Regions | 10 | Fixed list above |
| ECS Instances | 6 | Mix of Running/Stopped, Subscription/PayAsYouGo, Linux/Windows |
| Disks | 10 | 6 system + 4 data disks |
| Security Groups | 3 | Web, App, DB tiers |
| VPCs | 2 | Prod + Dev |
| VSwitches | 4 | 2 per VPC |
| EIPs | 3 | 2 InUse + 1 Available |
| OSS Buckets | 4 | Various storage classes |
| RDS Instances | 2 | MySQL + PostgreSQL |
| SLB Instances | 2 | Internet + Intranet |
| Alarms | 4 | Mix of OK / ALARM states |
| Operation Log | 10 | Recent operations |
| Messages | 5 | Mix of read/unread |
| Billing months | 6 | Last 6 months |
| Recent Products | 5 | As listed above |
| Favorite Products | 3 | As listed above |
