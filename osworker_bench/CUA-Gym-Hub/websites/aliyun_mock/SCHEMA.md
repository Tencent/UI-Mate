# aliyun_mock Schema

**Deploy order**: 4 (alphabetical among all *_mock dirs, BASE_PORT=8000 → port 8004)
**Base URL**: `http://localhost:5173/` (dev) or configured preview port
**Go Endpoint**: `GET /go?sid=<sid>` → `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`
**State read**: `GET /state?sid=<sid>` → `{stored_state, has_custom_state, sid}`

## State Schema

| Key | Type | Description |
|-----|------|-------------|
| `user` | object | Logged-in user: `{accountId, accountName, displayName, email, phone, region, language, role, balance, creditRating, verificationStatus}` |
| `currentRegion` | string | Active region ID (e.g., `"cn-hangzhou"`). All resource list pages filter by this. |
| `regions` | array | 10 regions; each: `{id, name, nameZh, zone}` — `zone` is `"cn"` or `"intl"` |
| `ecsInstances` | array | Each: `{id, name, status, regionId, zoneId, instanceType, vCPU, memory, osType, osName, imageId, publicIpAddress, privateIpAddress, vpcId, vswitchId, securityGroupIds[], keyPairName, billingMethod, renewalStatus, creationTime, expiredTime, tags[], systemDiskSize, systemDiskCategory, dataDiskCount}` — `status` can be `"Running"`, `"Stopped"`, `"Starting"`, `"Stopping"`, `"Expired"` |
| `disks` | array | Each: `{id, name, status, regionId, zoneId, category, performanceLevel, size, instanceId, device, diskType, billingMethod, encrypted, creationTime, tags[]}` — `diskType`: `"system"` or `"data"` |
| `securityGroups` | array | Each: `{id, name, description, regionId, vpcId, type, instanceCount, creationTime, rules[]}` — `rules[]` each: `{id, direction, protocol, portRange, sourceCidrIp, priority, policy, description}` |
| `vpcs` | array | Each: `{id, name, status, regionId, cidrBlock, description, vswitchCount, routeTableCount, creationTime, isDefault, tags[]}` |
| `vswitches` | array | Each: `{id, name, status, vpcId, zoneId, cidrBlock, availableIpCount, description, creationTime, isDefault}` |
| `eips` | array | Each: `{id, name, status, ipAddress, bandwidth, internetChargeType, instanceId, instanceType, regionId, billingMethod, creationTime}` |
| `ossBuckets` | array | Each: `{name, regionId, storageClass, acl, creationTime, objectCount, storageSize, lastModifiedTime, versioning, encryption, tags[], files[]}` — `files[]` each: `{name, size, lastModified, storageClass, type}` where `type` is `"file"` or `"folder"` |
| `rdsInstances` | array | Each: `{id, name, status, regionId, zoneId, engine, engineVersion, instanceType, vCPU, memory, storageSize, storageType, connectionString, port, vpcId, vswitchId, billingMethod, creationTime, expiredTime, category, maxConnections, maxIOPS, tags[]}` |
| `slbInstances` | array | Each: `{id, name, status, regionId, addressType, address, networkType, vpcId, bandwidth, billingMethod, creationTime, listenerCount, backendServerCount, listeners[]}` — `listeners[]` each: `{protocol, frontendPort, backendPort, status}` |
| `billing` | object | `{balance, currency, monthlySpend[], productBreakdown[], unpaidOrders, coupons[], renewalReminders[]}` |
| `alarms` | array | Each: `{id, name, status, product, metricName, threshold, comparisonOperator, statistics, period, evaluationCount, instanceId, contactGroups[], enabled, creationTime}` — `status`: `"OK"`, `"ALARM"`, `"INSUFFICIENT_DATA"` |
| `operationLog` | array | Each: `{id, eventTime, serviceName, eventName, resourceType, resourceId, resourceName, userAgent, sourceIpAddress, result}` |
| `messages` | array | Each: `{id, type, title, content, isRead, createdAt}` — `type`: `"system"`, `"billing"`, `"security"`, `"product"` |
| `recentProducts` | array | Each: `{id, name, nameZh, path, icon, lastVisited}` |
| `favoriteProducts` | array | Each: `{id, name, nameZh, path}` |

### Default ECS Instance IDs
`i-bp1abc2def3ghi4jk5` (web-server-prod-01, Running, cn-hangzhou), `i-bp2bcd3efg4hij5kl6` (api-server-prod-01, Running, cn-hangzhou), `i-bp3cde4fgh5ijk6lm7` (db-proxy-01, Running, cn-hangzhou), `i-bp4def5ghi6jkl7mn8` (dev-test-01, Stopped, cn-hangzhou), `i-bp5efg6hij7klm8no9` (staging-web-01, Stopped, cn-shanghai), `i-bp6fgh7ijk8lmn9op0` (log-collector-01, Expired, cn-shanghai)

### Default Security Group IDs
`sg-bp1web123456789` (web-sg-prod), `sg-bp1app123456789` (app-sg-prod), `sg-bp1db123456789` (db-sg-prod)

### Default VPC IDs
`vpc-bp1prod123456789` (prod-vpc, 172.16.0.0/12), `vpc-bp1dev123456789` (dev-vpc, 10.0.0.0/8)

### Default VSwitch IDs
`vsw-bp1web123456789`, `vsw-bp1app123456789`, `vsw-bp1devA123456789`, `vsw-bp1devB123456789`

### Default OSS Bucket Names
`hangzhoutech-static-assets`, `hangzhoutech-backups`, `hangzhoutech-logs`, `hangzhoutech-media`

### Default RDS Instance IDs
`rm-bp1mysql123456789` (prod-mysql-master, MySQL 8.0), `pgm-bp1pg123456789` (prod-postgres, PostgreSQL 15)

### Default Message IDs
`msg-001` through `msg-005` — 2 unread (`msg-001`, `msg-002`), 3 read

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "user": {
      "accountId": "1386-7890-1234",
      "accountName": "Hangzhou Tech Co.",
      "displayName": "Zhang Wei",
      "balance": 12586.42,
      "creditRating": "A",
      "region": "cn-hangzhou"
    },
    "currentRegion": "cn-hangzhou",
    "ecsInstances": [
      {
        "id": "i-bp1abc2def3ghi4jk5",
        "name": "web-server-prod-01",
        "status": "Running",
        "regionId": "cn-hangzhou",
        "zoneId": "cn-hangzhou-h",
        "instanceType": "ecs.g7.xlarge",
        "vCPU": 4,
        "memory": 16,
        "osType": "linux",
        "osName": "Alibaba Cloud Linux 3.2104 LTS 64-bit",
        "publicIpAddress": "47.98.123.45",
        "privateIpAddress": "172.16.0.10",
        "securityGroupIds": ["sg-bp1web123456789"],
        "billingMethod": "Subscription",
        "tags": []
      }
    ],
    "messages": [
      {"id": "msg-001", "type": "system", "title": "Test Notification", "content": "Test", "isRead": false, "createdAt": "2024-03-15T06:00:00Z"}
    ],
    "favoriteProducts": [],
    "recentProducts": []
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Start ECS instance | `ecsInstances[i].status`: `"Stopped"` → `"Starting"` → `"Running"`; `operationLog` grows by 1 |
| Stop ECS instance | `ecsInstances[i].status`: `"Running"` → `"Stopping"` → `"Stopped"`; `operationLog` grows by 1 |
| Restart ECS instance | `ecsInstances[i].status`: `"Running"` → `"Stopping"` → `"Starting"` → `"Running"`; `operationLog` grows by 1 |
| Release ECS instance | `ecsInstances` array shrinks by 1; associated system disk removed from `disks`; data disks set to `instanceId: ""`; `operationLog` grows by 1 |
| Rename ECS instance | `ecsInstances[i].name` updated; `operationLog` grows by 1 |
| Add instance to security group | `ecsInstances[i].securityGroupIds` array grows by 1 |
| Add security group rule | `securityGroups[i].rules` array grows by 1 |
| Delete security group rule | `securityGroups[i].rules` array shrinks by 1 |
| Create security group | `securityGroups` array grows by 1 |
| Upload file to OSS bucket | `ossBuckets[i].files` array grows by 1; `objectCount` increments by 1 |
| Delete file from OSS bucket | `ossBuckets[i].files` array shrinks by 1; `objectCount` decrements by 1 |
| Toggle OSS bucket versioning | `ossBuckets[i].versioning` → `"Enabled"` or `"Suspended"` |
| Change OSS bucket ACL | `ossBuckets[i].acl` updated |
| Create OSS bucket | `ossBuckets` array grows by 1 |
| Create VPC | `vpcs` array grows by 1 |
| Create VSwitch | `vswitches` array grows by 1; `vpcs[i].vswitchCount` increments |
| Change region selector | `currentRegion` updated; all region-filtered lists re-filter |
| Mark notification as read | `messages[i].isRead` → `true` |
| Mark all notifications read | all `messages[i].isRead` → `true` |
| Toggle alarm enabled/disabled | `alarms[i].enabled` toggled |
| Toggle product favorite | `favoriteProducts` array grows or shrinks by 1 |
| Bulk start ECS instances | Multiple `ecsInstances[i].status` → `"Running"`; `operationLog` grows |
| Bulk stop ECS instances | Multiple `ecsInstances[i].status` → `"Stopped"`; `operationLog` grows |
