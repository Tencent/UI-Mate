const BASE_KEY = 'aliyun_mock_state'
const BASE_INITIAL_KEY = 'aliyun_mock_initial_state'

export const getSessionId = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const sid = urlParams.get('sid')
  if (sid) sessionStorage.setItem('aliyun_sid', sid)
  return sid || sessionStorage.getItem('aliyun_sid') || null
}

export const storageKey = (sid) => sid ? `${BASE_KEY}_${sid}` : BASE_KEY
export const initialKey = (sid) => sid ? `${BASE_INITIAL_KEY}_${sid}` : BASE_INITIAL_KEY

export const fetchCustomState = async (sid) => {
  if (!sid) return null
  try {
    const res = await fetch(`/state?sid=${encodeURIComponent(sid)}`)
    const data = await res.json()
    return data.has_custom_state ? data.stored_state : null
  } catch (e) { return null }
}

export function createInitialData() {
  return {
    user: {
      accountId: "1386-7890-1234",
      accountName: "杭州科技有限公司",
      displayName: "张伟",
      email: "zhangwei@hangzhoutech.com",
      phone: "+86-138-xxxx-5678",
      region: "cn-hangzhou",
      language: "zh-CN",
      role: "admin",
      balance: 12586.42,
      creditRating: "A",
      verificationStatus: "verified"
    },
    currentRegion: "cn-hangzhou",
    regions: [
      { id: "cn-hangzhou", name: "华东1（杭州）", zone: "cn" },
      { id: "cn-shanghai", name: "华东2（上海）", zone: "cn" },
      { id: "cn-beijing", name: "华北2（北京）", zone: "cn" },
      { id: "cn-shenzhen", name: "华南1（深圳）", zone: "cn" },
      { id: "cn-chengdu", name: "西南1（成都）", zone: "cn" },
      { id: "cn-hongkong", name: "中国香港", zone: "intl" },
      { id: "ap-southeast-1", name: "新加坡", zone: "intl" },
      { id: "us-west-1", name: "美国（硅谷）", zone: "intl" },
      { id: "eu-central-1", name: "德国（法兰克福）", zone: "intl" },
      { id: "ap-northeast-1", name: "日本（东京）", zone: "intl" }
    ],
    ecsInstances: [
      {
        id: "i-bp1abc2def3ghi4jk5",
        name: "web-server-prod-01",
        status: "Running",
        regionId: "cn-hangzhou",
        zoneId: "cn-hangzhou-h",
        instanceType: "ecs.g7.xlarge",
        vCPU: 4,
        memory: 16,
        osType: "linux",
        osName: "Alibaba Cloud Linux 3.2104 LTS 64位",
        imageId: "aliyun_3_x64_20G_alibase_20230727",
        publicIpAddress: "47.98.123.45",
        privateIpAddress: "172.16.0.10",
        vpcId: "vpc-bp1prod123456789",
        vswitchId: "vsw-bp1web123456789",
        securityGroupIds: ["sg-bp1web123456789"],
        keyPairName: "prod-keypair",
        billingMethod: "包年包月",
        renewalStatus: "自动续费",
        creationTime: "2024-01-15T08:30:00Z",
        expiredTime: "2026-01-15T08:30:00Z",
        tags: [{ key: "env", value: "production" }, { key: "team", value: "frontend" }],
        systemDiskSize: 40,
        systemDiskCategory: "cloud_essd",
        dataDiskCount: 1
      },
      {
        id: "i-bp2bcd3efg4hij5kl6",
        name: "api-server-prod-01",
        status: "Running",
        regionId: "cn-hangzhou",
        zoneId: "cn-hangzhou-h",
        instanceType: "ecs.c7.large",
        vCPU: 2,
        memory: 4,
        osType: "linux",
        osName: "CentOS 7.9 64位",
        imageId: "centos_7_9_x64_20G_alibase_20230901",
        publicIpAddress: "47.98.124.56",
        privateIpAddress: "172.16.0.11",
        vpcId: "vpc-bp1prod123456789",
        vswitchId: "vsw-bp1app123456789",
        securityGroupIds: ["sg-bp1app123456789"],
        keyPairName: "prod-keypair",
        billingMethod: "包年包月",
        renewalStatus: "自动续费",
        creationTime: "2024-01-20T10:00:00Z",
        expiredTime: "2026-01-20T10:00:00Z",
        tags: [{ key: "env", value: "production" }, { key: "team", value: "backend" }],
        systemDiskSize: 40,
        systemDiskCategory: "cloud_essd",
        dataDiskCount: 0
      },
      {
        id: "i-bp3cde4fgh5ijk6lm7",
        name: "db-proxy-01",
        status: "Running",
        regionId: "cn-hangzhou",
        zoneId: "cn-hangzhou-g",
        instanceType: "ecs.g7.2xlarge",
        vCPU: 8,
        memory: 32,
        osType: "linux",
        osName: "Ubuntu 22.04 64位",
        imageId: "ubuntu_22_04_x64_20G_alibase_20230901",
        publicIpAddress: "",
        privateIpAddress: "172.16.1.10",
        vpcId: "vpc-bp1prod123456789",
        vswitchId: "vsw-bp1app123456789",
        securityGroupIds: ["sg-bp1db123456789", "sg-bp1app123456789"],
        keyPairName: "prod-keypair",
        billingMethod: "按量付费",
        renewalStatus: "",
        creationTime: "2024-02-01T09:00:00Z",
        expiredTime: null,
        tags: [{ key: "env", value: "production" }, { key: "team", value: "dba" }],
        systemDiskSize: 100,
        systemDiskCategory: "cloud_essd",
        dataDiskCount: 2
      },
      {
        id: "i-bp4def5ghi6jkl7mn8",
        name: "dev-test-01",
        status: "Stopped",
        regionId: "cn-hangzhou",
        zoneId: "cn-hangzhou-h",
        instanceType: "ecs.t6-c1m1.large",
        vCPU: 1,
        memory: 1,
        osType: "linux",
        osName: "Alibaba Cloud Linux 3.2104 LTS 64位",
        imageId: "aliyun_3_x64_20G_alibase_20230727",
        publicIpAddress: "",
        privateIpAddress: "172.16.2.10",
        vpcId: "vpc-bp1dev123456789",
        vswitchId: "vsw-bp1devA123456789",
        securityGroupIds: ["sg-bp1web123456789"],
        keyPairName: "dev-keypair",
        billingMethod: "按量付费",
        renewalStatus: "",
        creationTime: "2024-03-01T11:00:00Z",
        expiredTime: null,
        tags: [{ key: "env", value: "dev" }],
        systemDiskSize: 20,
        systemDiskCategory: "cloud_efficiency",
        dataDiskCount: 0
      },
      {
        id: "i-bp5efg6hij7klm8no9",
        name: "staging-web-01",
        status: "Stopped",
        regionId: "cn-shanghai",
        zoneId: "cn-shanghai-b",
        instanceType: "ecs.g7.large",
        vCPU: 4,
        memory: 16,
        osType: "windows",
        osName: "Windows Server 2022 数据中心版 64位",
        imageId: "win2022_dc_x64_20G_alibase_20230901",
        publicIpAddress: "120.55.67.89",
        privateIpAddress: "10.0.0.10",
        vpcId: "vpc-bp1prod123456789",
        vswitchId: "vsw-bp1web123456789",
        securityGroupIds: ["sg-bp1web123456789"],
        keyPairName: "",
        billingMethod: "包年包月",
        renewalStatus: "手动续费",
        creationTime: "2024-01-10T07:00:00Z",
        expiredTime: "2025-01-10T07:00:00Z",
        tags: [{ key: "env", value: "staging" }],
        systemDiskSize: 50,
        systemDiskCategory: "cloud_ssd",
        dataDiskCount: 0
      },
      {
        id: "i-bp6fgh7ijk8lmn9op0",
        name: "log-collector-01",
        status: "Expired",
        regionId: "cn-shanghai",
        zoneId: "cn-shanghai-b",
        instanceType: "ecs.s6-c1m2.small",
        vCPU: 1,
        memory: 2,
        osType: "windows",
        osName: "Windows Server 2019 数据中心版 64位",
        imageId: "win2019_dc_x64_20G_alibase_20230901",
        publicIpAddress: "",
        privateIpAddress: "10.0.1.10",
        vpcId: "vpc-bp1prod123456789",
        vswitchId: "vsw-bp1web123456789",
        securityGroupIds: ["sg-bp1app123456789"],
        keyPairName: "",
        billingMethod: "包年包月",
        renewalStatus: "",
        creationTime: "2023-06-01T06:00:00Z",
        expiredTime: "2024-06-01T06:00:00Z",
        tags: [{ key: "env", value: "production" }],
        systemDiskSize: 40,
        systemDiskCategory: "cloud_ssd",
        dataDiskCount: 0
      }
    ],
    disks: [
      { id: "d-bp1sys001", name: "sys-web-server-prod-01", status: "In_use", regionId: "cn-hangzhou", zoneId: "cn-hangzhou-h", category: "cloud_essd", performanceLevel: "PL1", size: 40, instanceId: "i-bp1abc2def3ghi4jk5", device: "/dev/vda", diskType: "system", billingMethod: "包年包月", encrypted: false, creationTime: "2024-01-15T08:30:00Z", tags: [] },
      { id: "d-bp2sys002", name: "sys-api-server-prod-01", status: "In_use", regionId: "cn-hangzhou", zoneId: "cn-hangzhou-h", category: "cloud_essd", performanceLevel: "PL1", size: 40, instanceId: "i-bp2bcd3efg4hij5kl6", device: "/dev/vda", diskType: "system", billingMethod: "包年包月", encrypted: false, creationTime: "2024-01-20T10:00:00Z", tags: [] },
      { id: "d-bp3sys003", name: "sys-db-proxy-01", status: "In_use", regionId: "cn-hangzhou", zoneId: "cn-hangzhou-g", category: "cloud_essd", performanceLevel: "PL2", size: 100, instanceId: "i-bp3cde4fgh5ijk6lm7", device: "/dev/vda", diskType: "system", billingMethod: "按量付费", encrypted: false, creationTime: "2024-02-01T09:00:00Z", tags: [] },
      { id: "d-bp4sys004", name: "sys-dev-test-01", status: "In_use", regionId: "cn-hangzhou", zoneId: "cn-hangzhou-h", category: "cloud_efficiency", performanceLevel: "PL0", size: 20, instanceId: "i-bp4def5ghi6jkl7mn8", device: "/dev/vda", diskType: "system", billingMethod: "按量付费", encrypted: false, creationTime: "2024-03-01T11:00:00Z", tags: [] },
      { id: "d-bp5sys005", name: "sys-staging-web-01", status: "In_use", regionId: "cn-shanghai", zoneId: "cn-shanghai-b", category: "cloud_ssd", performanceLevel: "PL1", size: 50, instanceId: "i-bp5efg6hij7klm8no9", device: "/dev/vda", diskType: "system", billingMethod: "包年包月", encrypted: false, creationTime: "2024-01-10T07:00:00Z", tags: [] },
      { id: "d-bp6sys006", name: "sys-log-collector-01", status: "In_use", regionId: "cn-shanghai", zoneId: "cn-shanghai-b", category: "cloud_ssd", performanceLevel: "PL1", size: 40, instanceId: "i-bp6fgh7ijk8lmn9op0", device: "/dev/vda", diskType: "system", billingMethod: "包年包月", encrypted: false, creationTime: "2023-06-01T06:00:00Z", tags: [] },
      { id: "d-bp7data001", name: "data-disk-db-proxy-01", status: "In_use", regionId: "cn-hangzhou", zoneId: "cn-hangzhou-g", category: "cloud_essd", performanceLevel: "PL1", size: 500, instanceId: "i-bp3cde4fgh5ijk6lm7", device: "/dev/vdb", diskType: "data", billingMethod: "按量付费", encrypted: true, creationTime: "2024-02-01T09:00:00Z", tags: [] },
      { id: "d-bp8data002", name: "data-disk-db-proxy-02", status: "In_use", regionId: "cn-hangzhou", zoneId: "cn-hangzhou-g", category: "cloud_essd", performanceLevel: "PL1", size: 200, instanceId: "i-bp3cde4fgh5ijk6lm7", device: "/dev/vdc", diskType: "data", billingMethod: "按量付费", encrypted: true, creationTime: "2024-02-05T10:00:00Z", tags: [] },
      { id: "d-bp9data003", name: "data-disk-web-server-01", status: "In_use", regionId: "cn-hangzhou", zoneId: "cn-hangzhou-h", category: "cloud_essd", performanceLevel: "PL1", size: 100, instanceId: "i-bp1abc2def3ghi4jk5", device: "/dev/vdb", diskType: "data", billingMethod: "包年包月", encrypted: false, creationTime: "2024-01-20T12:00:00Z", tags: [] },
      { id: "d-bp0data004", name: "data-disk-unattached", status: "Available", regionId: "cn-hangzhou", zoneId: "cn-hangzhou-h", category: "cloud_efficiency", performanceLevel: "PL0", size: 200, instanceId: "", device: "", diskType: "data", billingMethod: "按量付费", encrypted: false, creationTime: "2024-03-10T14:00:00Z", tags: [] }
    ],
    securityGroups: [
      {
        id: "sg-bp1web123456789",
        name: "web-sg-prod",
        description: "Web服务器安全组 - 允许HTTP、HTTPS和SSH访问",
        regionId: "cn-hangzhou",
        vpcId: "vpc-bp1prod123456789",
        type: "普通",
        instanceCount: 3,
        creationTime: "2024-01-10T06:00:00Z",
        rules: [
          { id: "rule-001", direction: "ingress", protocol: "tcp", portRange: "80/80", sourceCidrIp: "0.0.0.0/0", priority: 1, policy: "Accept", description: "允许HTTP" },
          { id: "rule-002", direction: "ingress", protocol: "tcp", portRange: "443/443", sourceCidrIp: "0.0.0.0/0", priority: 1, policy: "Accept", description: "允许HTTPS" },
          { id: "rule-003", direction: "ingress", protocol: "tcp", portRange: "22/22", sourceCidrIp: "10.0.0.0/8", priority: 1, policy: "Accept", description: "允许内网SSH" },
          { id: "rule-004", direction: "egress", protocol: "all", portRange: "-1/-1", sourceCidrIp: "0.0.0.0/0", priority: 100, policy: "Accept", description: "允许所有出方向" }
        ]
      },
      {
        id: "sg-bp1app123456789",
        name: "app-sg-prod",
        description: "应用服务器安全组",
        regionId: "cn-hangzhou",
        vpcId: "vpc-bp1prod123456789",
        type: "普通",
        instanceCount: 2,
        creationTime: "2024-01-10T06:30:00Z",
        rules: [
          { id: "rule-005", direction: "ingress", protocol: "tcp", portRange: "8080/8080", sourceCidrIp: "172.16.0.0/12", priority: 1, policy: "Accept", description: "允许VPC内应用端口" },
          { id: "rule-006", direction: "ingress", protocol: "tcp", portRange: "8443/8443", sourceCidrIp: "172.16.0.0/12", priority: 1, policy: "Accept", description: "允许HTTPS应用端口" },
          { id: "rule-007", direction: "ingress", protocol: "tcp", portRange: "22/22", sourceCidrIp: "10.0.0.0/8", priority: 1, policy: "Accept", description: "内网SSH" },
          { id: "rule-008", direction: "egress", protocol: "all", portRange: "-1/-1", sourceCidrIp: "0.0.0.0/0", priority: 100, policy: "Accept", description: "允许所有出方向" }
        ]
      },
      {
        id: "sg-bp1db123456789",
        name: "db-sg-prod",
        description: "数据库服务器安全组 - 仅限内网访问MySQL和PostgreSQL",
        regionId: "cn-hangzhou",
        vpcId: "vpc-bp1prod123456789",
        type: "企业级",
        instanceCount: 1,
        creationTime: "2024-01-10T07:00:00Z",
        rules: [
          { id: "rule-009", direction: "ingress", protocol: "tcp", portRange: "3306/3306", sourceCidrIp: "172.16.0.0/12", priority: 1, policy: "Accept", description: "允许VPC内MySQL" },
          { id: "rule-010", direction: "ingress", protocol: "tcp", portRange: "5432/5432", sourceCidrIp: "172.16.0.0/12", priority: 1, policy: "Accept", description: "允许VPC内PostgreSQL" },
          { id: "rule-011", direction: "ingress", protocol: "tcp", portRange: "6379/6379", sourceCidrIp: "172.16.0.0/12", priority: 2, policy: "Accept", description: "允许VPC内Redis" },
          { id: "rule-012", direction: "egress", protocol: "all", portRange: "-1/-1", sourceCidrIp: "0.0.0.0/0", priority: 100, policy: "Accept", description: "允许所有出方向" }
        ]
      }
    ],
    vpcs: [
      {
        id: "vpc-bp1prod123456789",
        name: "生产VPC",
        status: "Available",
        regionId: "cn-hangzhou",
        cidrBlock: "172.16.0.0/12",
        description: "生产环境专有网络，承载所有生产工作负载",
        vswitchCount: 2,
        routeTableCount: 1,
        creationTime: "2024-01-05T03:00:00Z",
        isDefault: false,
        tags: [{ key: "env", value: "production" }]
      },
      {
        id: "vpc-bp1dev123456789",
        name: "开发VPC",
        status: "Available",
        regionId: "cn-hangzhou",
        cidrBlock: "10.0.0.0/8",
        description: "开发和测试专有网络",
        vswitchCount: 2,
        routeTableCount: 1,
        creationTime: "2024-01-05T04:00:00Z",
        isDefault: false,
        tags: [{ key: "env", value: "dev" }]
      }
    ],
    vswitches: [
      { id: "vsw-bp1web123456789", name: "Web层子网", status: "Available", vpcId: "vpc-bp1prod123456789", zoneId: "cn-hangzhou-h", cidrBlock: "172.16.0.0/24", availableIpCount: 248, description: "Web层交换机", creationTime: "2024-01-05T03:10:00Z", isDefault: false },
      { id: "vsw-bp1app123456789", name: "应用层子网", status: "Available", vpcId: "vpc-bp1prod123456789", zoneId: "cn-hangzhou-g", cidrBlock: "172.16.1.0/24", availableIpCount: 244, description: "应用层交换机", creationTime: "2024-01-05T03:15:00Z", isDefault: false },
      { id: "vsw-bp1devA123456789", name: "开发子网A", status: "Available", vpcId: "vpc-bp1dev123456789", zoneId: "cn-hangzhou-h", cidrBlock: "10.0.0.0/24", availableIpCount: 250, description: "开发子网可用区A", creationTime: "2024-01-05T04:10:00Z", isDefault: false },
      { id: "vsw-bp1devB123456789", name: "开发子网B", status: "Available", vpcId: "vpc-bp1dev123456789", zoneId: "cn-hangzhou-g", cidrBlock: "10.0.1.0/24", availableIpCount: 250, description: "开发子网可用区B", creationTime: "2024-01-05T04:15:00Z", isDefault: false }
    ],
    eips: [
      { id: "eip-bp1eip001", name: "prod-eip-web", status: "InUse", ipAddress: "47.98.123.45", bandwidth: 100, internetChargeType: "PayByTraffic", instanceId: "i-bp1abc2def3ghi4jk5", instanceType: "EcsInstance", regionId: "cn-hangzhou", billingMethod: "按量付费", creationTime: "2024-01-15T08:25:00Z" },
      { id: "eip-bp2eip002", name: "prod-eip-api", status: "InUse", ipAddress: "47.98.124.56", bandwidth: 50, internetChargeType: "PayByTraffic", instanceId: "i-bp2bcd3efg4hij5kl6", instanceType: "EcsInstance", regionId: "cn-hangzhou", billingMethod: "按量付费", creationTime: "2024-01-20T10:00:00Z" },
      { id: "eip-bp3eip003", name: "spare-eip-01", status: "Available", ipAddress: "120.26.45.100", bandwidth: 20, internetChargeType: "PayByBandwidth", instanceId: "", instanceType: "", regionId: "cn-hangzhou", billingMethod: "按量付费", creationTime: "2024-03-01T08:00:00Z" }
    ],
    ossBuckets: [
      {
        name: "hangzhoutech-static-assets",
        regionId: "cn-hangzhou",
        storageClass: "Standard",
        acl: "private",
        creationTime: "2024-02-01T10:00:00Z",
        objectCount: 15234,
        storageSize: 4.7,
        lastModifiedTime: "2024-03-15T14:30:00Z",
        versioning: "Enabled",
        encryption: "AES256",
        tags: [{ key: "project", value: "website" }],
        files: [
          { name: "index.html", size: 12345, lastModified: "2024-03-15T14:30:00Z", storageClass: "Standard", type: "file" },
          { name: "styles.css", size: 45678, lastModified: "2024-03-14T10:00:00Z", storageClass: "Standard", type: "file" },
          { name: "app.js", size: 234567, lastModified: "2024-03-15T14:00:00Z", storageClass: "Standard", type: "file" },
          { name: "images/", size: 0, lastModified: "2024-02-10T08:00:00Z", storageClass: "Standard", type: "folder" },
          { name: "images/logo.png", size: 23456, lastModified: "2024-02-10T08:00:00Z", storageClass: "Standard", type: "file" },
          { name: "images/banner.jpg", size: 456789, lastModified: "2024-02-15T12:00:00Z", storageClass: "Standard", type: "file" },
          { name: "data/", size: 0, lastModified: "2024-03-01T09:00:00Z", storageClass: "Standard", type: "folder" },
          { name: "data/export.csv", size: 98765, lastModified: "2024-03-01T09:00:00Z", storageClass: "Standard", type: "file" },
          { name: "data/config.json", size: 3456, lastModified: "2024-03-10T11:00:00Z", storageClass: "Standard", type: "file" },
          { name: "fonts/inter.woff2", size: 67890, lastModified: "2024-02-01T10:00:00Z", storageClass: "Standard", type: "file" },
          { name: "fonts/roboto.woff2", size: 56789, lastModified: "2024-02-01T10:00:00Z", storageClass: "Standard", type: "file" },
          { name: "robots.txt", size: 234, lastModified: "2024-02-01T10:00:00Z", storageClass: "Standard", type: "file" },
          { name: "sitemap.xml", size: 8765, lastModified: "2024-03-01T06:00:00Z", storageClass: "Standard", type: "file" }
        ]
      },
      {
        name: "hangzhoutech-backups",
        regionId: "cn-shanghai",
        storageClass: "IA",
        acl: "private",
        creationTime: "2024-02-10T08:00:00Z",
        objectCount: 342,
        storageSize: 128.5,
        lastModifiedTime: "2024-03-14T23:00:00Z",
        versioning: null,
        encryption: null,
        tags: [{ key: "project", value: "backup" }],
        files: [
          { name: "db-backup-20240314.sql.gz", size: 52428800, lastModified: "2024-03-14T23:00:00Z", storageClass: "IA", type: "file" },
          { name: "db-backup-20240313.sql.gz", size: 51380224, lastModified: "2024-03-13T23:00:00Z", storageClass: "IA", type: "file" },
          { name: "config-backup-20240310.tar.gz", size: 1048576, lastModified: "2024-03-10T02:00:00Z", storageClass: "IA", type: "file" }
        ]
      },
      {
        name: "hangzhoutech-logs",
        regionId: "cn-hangzhou",
        storageClass: "Archive",
        acl: "private",
        creationTime: "2024-01-15T12:00:00Z",
        objectCount: 8921,
        storageSize: 56.3,
        lastModifiedTime: "2024-03-15T00:00:00Z",
        versioning: null,
        encryption: null,
        tags: [{ key: "project", value: "logging" }],
        files: []
      },
      {
        name: "hangzhoutech-media",
        regionId: "cn-hangzhou",
        storageClass: "Standard",
        acl: "public-read",
        creationTime: "2024-03-01T14:00:00Z",
        objectCount: 1234,
        storageSize: 23.8,
        lastModifiedTime: "2024-03-15T16:00:00Z",
        versioning: "Suspended",
        encryption: null,
        tags: [{ key: "project", value: "media" }],
        files: []
      }
    ],
    rdsInstances: [
      {
        id: "rm-bp1mysql123456789",
        name: "prod-mysql-master",
        status: "Running",
        regionId: "cn-hangzhou",
        zoneId: "cn-hangzhou-h",
        engine: "MySQL",
        engineVersion: "8.0",
        instanceType: "rds.mysql.s3.large",
        vCPU: 4,
        memory: 8,
        storageSize: 200,
        storageType: "cloud_essd",
        connectionString: "rm-bp1mysql123456789.mysql.rds.aliyuncs.com",
        port: 3306,
        vpcId: "vpc-bp1prod123456789",
        vswitchId: "vsw-bp1app123456789",
        billingMethod: "包年包月",
        creationTime: "2024-01-20T09:00:00Z",
        expiredTime: "2026-01-20T09:00:00Z",
        category: "高可用版",
        maxConnections: 4000,
        maxIOPS: 10000,
        tags: [{ key: "env", value: "production" }],
        databases: [
          { name: "app_production", characterSet: "utf8mb4", status: "Running", description: "主应用数据库" },
          { name: "app_analytics", characterSet: "utf8mb4", status: "Running", description: "数据分析库" },
          { name: "user_center", characterSet: "utf8mb4", status: "Running", description: "用户中心数据库" }
        ],
        accounts: [
          { name: "admin", type: "高权限账号", status: "可用", description: "管理员账号" },
          { name: "app_user", type: "普通账号", status: "可用", description: "应用程序账号" },
          { name: "readonly", type: "普通账号", status: "可用", description: "只读账号" }
        ],
        backups: [
          { id: "bk-001", backupMode: "自动备份", backupMethod: "物理备份", backupSize: 1536, backupStartTime: "2024-03-15T02:00:00Z", backupEndTime: "2024-03-15T02:15:00Z", status: "成功" },
          { id: "bk-002", backupMode: "自动备份", backupMethod: "物理备份", backupSize: 1520, backupStartTime: "2024-03-14T02:00:00Z", backupEndTime: "2024-03-14T02:14:00Z", status: "成功" },
          { id: "bk-003", backupMode: "手动备份", backupMethod: "物理备份", backupSize: 1510, backupStartTime: "2024-03-13T10:00:00Z", backupEndTime: "2024-03-13T10:12:00Z", status: "成功" }
        ]
      },
      {
        id: "pgm-bp1pg123456789",
        name: "prod-postgres",
        status: "Running",
        regionId: "cn-hangzhou",
        zoneId: "cn-hangzhou-g",
        engine: "PostgreSQL",
        engineVersion: "15",
        instanceType: "pg.n2.medium.1",
        vCPU: 2,
        memory: 4,
        storageSize: 100,
        storageType: "cloud_essd",
        connectionString: "pgm-bp1pg123456789.pg.rds.aliyuncs.com",
        port: 5432,
        vpcId: "vpc-bp1prod123456789",
        vswitchId: "vsw-bp1app123456789",
        billingMethod: "按量付费",
        creationTime: "2024-02-15T11:00:00Z",
        expiredTime: null,
        category: "高可用版",
        maxConnections: 2000,
        maxIOPS: 5000,
        tags: [{ key: "env", value: "production" }],
        databases: [
          { name: "geo_data", characterSet: "utf8", status: "Running", description: "地理数据库" }
        ],
        accounts: [
          { name: "pg_admin", type: "高权限账号", status: "可用", description: "PostgreSQL管理员" }
        ],
        backups: [
          { id: "bk-pg-001", backupMode: "自动备份", backupMethod: "物理备份", backupSize: 512, backupStartTime: "2024-03-15T03:00:00Z", backupEndTime: "2024-03-15T03:08:00Z", status: "成功" }
        ]
      }
    ],
    slbInstances: [
      {
        id: "lb-bp1web123456789",
        name: "生产Web负载均衡",
        status: "active",
        regionId: "cn-hangzhou",
        addressType: "internet",
        address: "120.78.123.45",
        networkType: "vpc",
        vpcId: "vpc-bp1prod123456789",
        bandwidth: 100,
        billingMethod: "按流量计费",
        creationTime: "2024-01-25T11:00:00Z",
        listenerCount: 2,
        backendServerCount: 3,
        listeners: [
          { protocol: "HTTP", frontendPort: 80, backendPort: 80, status: "running", scheduler: "wrr", healthCheck: true, healthCheckPath: "/health" },
          { protocol: "HTTPS", frontendPort: 443, backendPort: 443, status: "running", scheduler: "wrr", healthCheck: true, healthCheckPath: "/health" }
        ],
        backendServers: [
          { serverId: "i-bp1abc2def3ghi4jk5", serverName: "web-server-prod-01", weight: 100, port: 80, status: "正常" },
          { serverId: "i-bp2bcd3efg4hij5kl6", serverName: "api-server-prod-01", weight: 100, port: 80, status: "正常" },
          { serverId: "i-bp3cde4fgh5ijk6lm7", serverName: "db-proxy-01", weight: 50, port: 80, status: "异常" }
        ]
      },
      {
        id: "lb-bp1int123456789",
        name: "生产内部负载均衡",
        status: "active",
        regionId: "cn-hangzhou",
        addressType: "intranet",
        address: "172.16.0.100",
        networkType: "vpc",
        vpcId: "vpc-bp1prod123456789",
        bandwidth: -1,
        billingMethod: "按流量计费",
        creationTime: "2024-02-05T14:00:00Z",
        listenerCount: 1,
        backendServerCount: 2,
        listeners: [
          { protocol: "TCP", frontendPort: 8080, backendPort: 8080, status: "running", scheduler: "rr", healthCheck: true, healthCheckPath: "" }
        ],
        backendServers: [
          { serverId: "i-bp2bcd3efg4hij5kl6", serverName: "api-server-prod-01", weight: 100, port: 8080, status: "正常" },
          { serverId: "i-bp3cde4fgh5ijk6lm7", serverName: "db-proxy-01", weight: 100, port: 8080, status: "正常" }
        ]
      }
    ],
    billing: {
      balance: 12586.42,
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
        { product: "其他", amount: 174.80, percentage: 5.4 }
      ],
      unpaidOrders: 0,
      coupons: [
        { id: "coupon-001", name: "新用户优惠券", amount: 200, expiry: "2024-06-30", status: "可用" },
        { id: "coupon-002", name: "ECS专项优惠", amount: 500, expiry: "2024-12-31", status: "可用" }
      ],
      renewalReminders: [
        { resourceId: "i-bp1abc2def3ghi4jk5", resourceName: "web-server-prod-01", type: "ECS", expiry: "2026-01-15T08:30:00Z", daysLeft: 279 },
        { resourceId: "rm-bp1mysql123456789", resourceName: "prod-mysql-master", type: "RDS", expiry: "2026-01-20T09:00:00Z", daysLeft: 284 }
      ]
    },
    alarms: [
      { id: "alarm-001", name: "ECS CPU过高 - web-server", status: "OK", product: "ECS", metricName: "CPUUtilization", threshold: 80, comparisonOperator: ">=", statistics: "Average", period: 300, evaluationCount: 3, instanceId: "i-bp1abc2def3ghi4jk5", contactGroups: ["运维团队"], enabled: true, creationTime: "2024-02-01T10:00:00Z" },
      { id: "alarm-002", name: "ECS 内存过高 - api-server", status: "OK", product: "ECS", metricName: "MemoryUtilization", threshold: 85, comparisonOperator: ">=", statistics: "Average", period: 300, evaluationCount: 3, instanceId: "i-bp2bcd3efg4hij5kl6", contactGroups: ["运维团队"], enabled: true, creationTime: "2024-02-05T11:00:00Z" },
      { id: "alarm-003", name: "ECS CPU严重告警 - db-proxy", status: "ALARM", product: "ECS", metricName: "CPUUtilization", threshold: 90, comparisonOperator: ">=", statistics: "Average", period: 60, evaluationCount: 2, instanceId: "i-bp3cde4fgh5ijk6lm7", contactGroups: ["运维团队", "DBA团队"], enabled: true, creationTime: "2024-02-10T09:00:00Z" },
      { id: "alarm-004", name: "RDS 连接数告警", status: "INSUFFICIENT_DATA", product: "RDS", metricName: "ConnectionCount", threshold: 3500, comparisonOperator: ">=", statistics: "Maximum", period: 300, evaluationCount: 3, instanceId: "rm-bp1mysql123456789", contactGroups: ["DBA团队"], enabled: true, creationTime: "2024-03-01T08:00:00Z" }
    ],
    operationLog: [
      { id: "log-001", eventTime: "2024-03-15T14:30:00Z", serviceName: "ECS", eventName: "停止实例", resourceType: "Instance", resourceId: "i-bp4def5ghi6jkl7mn8", resourceName: "dev-test-01", userAgent: "console", sourceIpAddress: "120.26.45.67", result: "成功" },
      { id: "log-002", eventTime: "2024-03-15T13:00:00Z", serviceName: "ECS", eventName: "启动实例", resourceType: "Instance", resourceId: "i-bp4def5ghi6jkl7mn8", resourceName: "dev-test-01", userAgent: "console", sourceIpAddress: "120.26.45.67", result: "成功" },
      { id: "log-003", eventTime: "2024-03-14T10:00:00Z", serviceName: "OSS", eventName: "创建Bucket", resourceType: "Bucket", resourceId: "hangzhoutech-media", resourceName: "hangzhoutech-media", userAgent: "console", sourceIpAddress: "120.26.45.67", result: "成功" },
      { id: "log-004", eventTime: "2024-03-13T16:30:00Z", serviceName: "ECS", eventName: "修改实例属性", resourceType: "Instance", resourceId: "i-bp1abc2def3ghi4jk5", resourceName: "web-server-prod-01", userAgent: "console", sourceIpAddress: "120.26.45.67", result: "成功" },
      { id: "log-005", eventTime: "2024-03-12T09:00:00Z", serviceName: "VPC", eventName: "创建交换机", resourceType: "VSwitch", resourceId: "vsw-bp1devB123456789", resourceName: "开发子网B", userAgent: "console", sourceIpAddress: "120.26.45.67", result: "成功" }
    ],
    messages: [
      { id: "msg-001", type: "system", title: "ECS实例续费提醒", content: "您的ECS实例 web-server-prod-01 (i-bp1abc2def3ghi4jk5) 将于30天后到期，请及时续费。", isRead: false, createdAt: "2024-03-15T06:00:00Z" },
      { id: "msg-002", type: "security", title: "异常登录检测", content: "检测到来自IP 203.0.113.45 在 2024-03-14 23:45 的异常登录。如非本人操作，请检查账户安全。", isRead: false, createdAt: "2024-03-14T23:50:00Z" },
      { id: "msg-003", type: "billing", title: "2月账单已出", content: "您2024年2月的账单已生成，总计：2,987.50 元。", isRead: true, createdAt: "2024-03-01T08:00:00Z" },
      { id: "msg-004", type: "system", title: "系统维护通知", content: "计划在 2024-03-20 02:00-06:00（UTC+8）进行维护。部分服务可能暂时不可用。", isRead: true, createdAt: "2024-03-10T10:00:00Z" },
      { id: "msg-005", type: "product", title: "新功能：ESSD PL3上线", content: "ESSD云盘PL3性能级别现已在华东1（杭州）地域可用，单盘最高可达100万IOPS。", isRead: true, createdAt: "2024-03-05T09:00:00Z" }
    ],
    tickets: [
      { id: "ticket-20240315001", title: "ECS实例无法通过SSH连接", category: "云服务器ECS", priority: "高", status: "处理中", createdAt: "2024-03-15T10:30:00Z", updatedAt: "2024-03-15T14:00:00Z", description: "生产环境 web-server-prod-01 实例今天上午10点起无法通过SSH连接，内网和外网均不可达。已确认安全组规则正常。", replies: [
        { id: "r1", role: "客服", name: "刘工程师", content: "您好，已收到您的工单。我们正在排查该问题，初步判断可能是实例内部网络配置异常，请稍候。", createdAt: "2024-03-15T11:00:00Z" },
        { id: "r2", role: "用户", name: "张伟", content: "好的，请尽快处理，这是生产环境的服务器。", createdAt: "2024-03-15T11:30:00Z" },
        { id: "r3", role: "客服", name: "刘工程师", content: "经排查，您的实例sshd服务未正常启动。建议您通过VNC远程连接重启sshd服务：systemctl restart sshd", createdAt: "2024-03-15T14:00:00Z" }
      ]},
      { id: "ticket-20240312002", title: "OSS存储费用异常增长", category: "对象存储OSS", priority: "中", status: "已解决", createdAt: "2024-03-12T09:00:00Z", updatedAt: "2024-03-13T16:00:00Z", description: "发现OSS存储费用在过去一周内异常增长了300%，请帮忙排查原因。", replies: [
        { id: "r4", role: "客服", name: "王工程师", content: "您好，经排查发现您的 hangzhoutech-logs Bucket 的日志转储策略导致大量重复文件写入，建议优化日志归档策略。", createdAt: "2024-03-12T14:00:00Z" },
        { id: "r5", role: "用户", name: "张伟", content: "已按建议调整，费用已恢复正常。谢谢！", createdAt: "2024-03-13T16:00:00Z" }
      ]},
      { id: "ticket-20240308003", title: "RDS数据库连接数超限", category: "云数据库RDS", priority: "高", status: "已关闭", createdAt: "2024-03-08T08:00:00Z", updatedAt: "2024-03-09T10:00:00Z", description: "MySQL实例 prod-mysql-master 连接数经常达到上限4000，导致新连接被拒绝。", replies: [
        { id: "r6", role: "客服", name: "陈工程师", content: "建议升级实例规格以获取更高的最大连接数，或优化应用层连接池配置。", createdAt: "2024-03-08T10:00:00Z" },
        { id: "r7", role: "用户", name: "张伟", content: "已优化连接池配置，问题解决。", createdAt: "2024-03-09T10:00:00Z" }
      ]}
    ],
    recentProducts: [
      { id: "ecs", name: "ECS", nameZh: "云服务器 ECS", path: "/ecs", lastVisited: "2024-03-15T14:00:00Z" },
      { id: "oss", name: "OSS", nameZh: "对象存储 OSS", path: "/oss", lastVisited: "2024-03-15T12:00:00Z" },
      { id: "rds", name: "RDS", nameZh: "云数据库 RDS", path: "/rds", lastVisited: "2024-03-14T16:00:00Z" },
      { id: "slb", name: "SLB", nameZh: "负载均衡 SLB", path: "/slb", lastVisited: "2024-03-14T10:00:00Z" },
      { id: "vpc", name: "VPC", nameZh: "专有网络 VPC", path: "/vpc", lastVisited: "2024-03-13T15:00:00Z" }
    ],
    favoriteProducts: [
      { id: "ecs", name: "ECS", nameZh: "云服务器 ECS", path: "/ecs" },
      { id: "oss", name: "OSS", nameZh: "对象存储 OSS", path: "/oss" },
      { id: "rds", name: "RDS", nameZh: "云数据库 RDS", path: "/rds" }
    ]
  }
}

export function initializeData(sid = null, customState = null) {
  const sKey = storageKey(sid)
  const iKey = initialKey(sid)

  if (customState) {
    const defaultData = createInitialData()
    const merged = { ...defaultData, ...customState }
    localStorage.setItem(sKey, JSON.stringify(merged))
    localStorage.setItem(iKey, JSON.stringify(merged))
    // Sync initial state to server
    const effectiveSid = sid || (typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('sid') || null) : null)
    if (effectiveSid) {
      fetch(`/post?sid=${encodeURIComponent(effectiveSid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set', state: merged })
      }).catch(() => {})
    }
    return merged
  }

  const stored = localStorage.getItem(sKey)
  if (stored) {
    try { return JSON.parse(stored) } catch (e) {}
  }

  const defaultData = createInitialData()
  localStorage.setItem(sKey, JSON.stringify(defaultData))
  if (!localStorage.getItem(iKey)) {
    localStorage.setItem(iKey, JSON.stringify(defaultData))
  }
  // Sync initial state to server
  const effectiveSid = sid || (typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('sid') || null) : null)
  if (effectiveSid) {
    fetch(`/post?sid=${encodeURIComponent(effectiveSid)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'set', state: defaultData })
    }).catch(() => {})
  }
  return defaultData
}
