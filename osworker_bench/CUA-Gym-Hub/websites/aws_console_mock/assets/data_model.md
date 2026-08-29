# XWS Console Mock — Data Model

## Entity Definitions

All entities are stored in a single state object managed by React Context and persisted to localStorage. The `createInitialData()` function in `dataManager.js` (currently `initialState.js`) returns the default state.

---

### §User (Current Account)
The logged-in user context. Always present, never changes through UI actions.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| name | string | `"Admin User"` | Display name in top nav |
| email | string | `"admin@company.com"` | Shown in account dropdown |
| accountId | string | `"1234-5678-9012"` | 12-digit AWS account ID (formatted with hyphens) |
| region | string | `"us-east-1"` | Currently selected region |
| accountAlias | string | `"my-company-prod"` | Friendly account alias |

---

### §EC2Instances
Virtual machine instances. Core interactive entity with full CRUD + state transitions.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | `"i-0a1b2c3d4e5f6g7h8"` | Format: `i-` followed by 17 hex chars |
| name | string | `"Web-Server-01"` | User-assigned name tag |
| type | string | `"t2.micro"` | Instance type (t2.micro, t3.small, m5.large, etc.) |
| state | string | `"running"` | One of: `running`, `stopped`, `pending`, `stopping`, `shutting-down`, `terminated` |
| publicIp | string | `"54.123.45.67"` | Public IPv4 address, `"-"` when stopped |
| privateIp | string | `"10.0.1.42"` | Private IPv4 address |
| az | string | `"us-east-1a"` | Availability zone |
| vpcId | string | `"vpc-0abc1234"` | VPC identifier |
| subnetId | string | `"subnet-0def5678"` | Subnet identifier |
| ami | string | `"ami-0abcdef1234567890"` | AMI ID used to launch |
| amiName | string | `"Amazon Linux 2023 AMI"` | Human-readable AMI name |
| platform | string | `"Linux/UNIX"` | Platform type |
| keyPair | string | `"my-key-pair"` | Key pair name |
| securityGroups | string[] | `["sg-web-server"]` | Attached security group names |
| launchTime | string (ISO 8601) | `"2024-03-15T10:30:00Z"` | When instance was launched |
| monitoring | string | `"disabled"` | `"enabled"` or `"disabled"` |
| tags | {Key:string, Value:string}[] | `[{Key:"Environment", Value:"Production"}]` | Resource tags |

**State transitions:**
- `stopped` → `pending` → `running` (start)
- `running` → `stopping` → `stopped` (stop)
- `running`/`stopped` → `shutting-down` → `terminated` (terminate)

---

### §S3Buckets
Object storage buckets containing files (objects).

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| name | string | `"my-app-assets-prod"` | Globally unique bucket name, lowercase + hyphens + dots |
| region | string | `"us-east-1"` | Bucket region |
| created | string (ISO 8601) | `"2023-01-15T10:00:00Z"` | Creation timestamp |
| access | string | `"Bucket and objects not public"` | Access level description |
| versioning | string | `"Disabled"` | `"Enabled"`, `"Disabled"`, or `"Suspended"` |
| encryption | string | `"SSE-S3"` | Default encryption type |
| objects | S3Object[] | (see below) | Array of contained objects |

### §S3Objects
Individual files within an S3 bucket.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| key | string | `"images/logo.png"` | Object key (acts as file path) |
| size | number | `20480` | Size in bytes |
| lastModified | string (ISO 8601) | `"2023-10-01T12:05:00Z"` | Last modification timestamp |
| storageClass | string | `"Standard"` | `"Standard"`, `"Standard-IA"`, `"Glacier"`, etc. |
| type | string | `"png"` | File extension/type inferred from key |

---

### §LambdaFunctions
Serverless function definitions.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| name | string | `"process-image-resize"` | Function name (unique per region) |
| description | string | `"Resizes uploaded images to thumbnails"` | User description |
| runtime | string | `"nodejs18.x"` | Runtime: `nodejs18.x`, `python3.12`, `java17`, etc. |
| handler | string | `"index.handler"` | Entry point |
| memorySize | number | `128` | Memory in MB (128, 256, 512, 1024, etc.) |
| timeout | number | `30` | Timeout in seconds |
| lastModified | string (ISO 8601) | `"2023-11-05T09:15:00Z"` | Last modification time |
| codeSize | number | `1024` | Deployed code size in bytes |
| code | string | `"exports.handler = async (event) => {..."` | Inline function code |
| environment | {[key:string]:string} | `{"BUCKET_NAME":"my-app-assets"}` | Environment variables |
| layers | string[] | `[]` | Attached layer ARNs |
| role | string | `"arn:aws:iam::1234:role/LambdaExec"` | Execution role ARN |
| tags | {[key:string]:string} | `{"project":"web-app"}` | Resource tags |

---

### §RDSDatabases
Managed relational database instances.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | `"prod-db-primary"` | DB instance identifier |
| engine | string | `"mysql"` | `"mysql"`, `"postgres"`, `"mariadb"`, `"aurora-mysql"` |
| engineVersion | string | `"8.0.35"` | Engine version |
| class | string | `"db.t3.medium"` | Instance class |
| status | string | `"available"` | `"available"`, `"creating"`, `"deleting"`, `"stopped"`, `"backing-up"`, `"modifying"` |
| role | string | `"Instance"` | `"Instance"` or `"Cluster"` |
| endpoint | string | `"prod-db.cluster-xyz.us-east-1.rds.amazonaws.com"` | Connection endpoint |
| port | number | `3306` | Connection port |
| az | string | `"us-east-1a"` | Availability zone |
| multiAZ | boolean | `false` | Multi-AZ deployment |
| storage | number | `20` | Allocated storage in GB |
| storageType | string | `"gp3"` | `"gp2"`, `"gp3"`, `"io1"`, `"magnetic"` |
| vpcId | string | `"vpc-0abc1234"` | VPC identifier |
| created | string (ISO 8601) | `"2023-06-01T08:00:00Z"` | Creation timestamp |
| tags | {Key:string, Value:string}[] | `[{Key:"Environment", Value:"Production"}]` | Resource tags |

---

### §IAMUsers
Identity and access management users.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| name | string | `"admin"` | Unique username |
| arn | string | `"arn:aws:iam::1234:user/admin"` | Full ARN |
| created | string | `"2023-01-01"` | Creation date (date only) |
| lastActivity | string | `"2024-03-15"` | Last console activity date |
| groups | string[] | `["Admins"]` | Group memberships |
| policies | string[] | `["AdministratorAccess"]` | Directly attached policy names |
| mfaEnabled | boolean | `true` | MFA status |
| accessKeyAge | string | `"90 days"` | Age of oldest access key |
| passwordLastUsed | string | `"2024-03-15"` | Last password use date |
| path | string | `"/"` | IAM path |
| tags | {Key:string, Value:string}[] | `[]` | User tags |

### §IAMRoles
IAM roles for services and cross-account access.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| name | string | `"EC2ServiceRole"` | Role name |
| arn | string | `"arn:aws:iam::1234:role/EC2ServiceRole"` | Full ARN |
| created | string | `"2023-01-02"` | Creation date |
| lastActivity | string | `"2024-03-10"` | Last usage date |
| trustedEntities | string | `"AWS service: ec2.amazonaws.com"` | Trust relationship description |
| description | string | `"Allows EC2 instances to call AWS services"` | Role description |
| policies | string[] | `["AmazonS3ReadOnlyAccess"]` | Attached policy names |
| path | string | `"/"` | IAM path |
| maxSessionDuration | number | `3600` | Max session duration in seconds |

### §IAMPolicies
IAM permission policies.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| name | string | `"AdministratorAccess"` | Policy name |
| arn | string | `"arn:aws:iam::aws:policy/AdministratorAccess"` | Full ARN |
| type | string | `"AWS managed"` | `"AWS managed"` or `"Customer managed"` |
| description | string | `"Provides full access to AWS services"` | Policy description |
| attachedEntities | number | `2` | Number of attached users/roles/groups |
| created | string | `"2023-01-01"` | Creation date |
| updated | string | `"2023-01-01"` | Last update date |

### §IAMGroups
IAM user groups for permission management.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| name | string | `"Admins"` | Group name |
| arn | string | `"arn:aws:iam::1234:group/Admins"` | Full ARN |
| created | string | `"2023-01-01"` | Creation date |
| users | string[] | `["admin"]` | Member usernames |
| policies | string[] | `["AdministratorAccess"]` | Attached policy names |
| path | string | `"/"` | IAM path |

---

### §Billing
Cost and usage data.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| currentMonth | number | `145.20` | Current month-to-date cost in USD |
| forecast | number | `160.00` | End-of-month forecast in USD |
| lastMonth | number | `135.00` | Previous month total cost |
| currency | string | `"USD"` | Currency code |
| history | MonthCost[] | (see below) | Monthly cost history (6-12 months) |
| byService | ServiceCost[] | (see below) | Current month cost breakdown by service |
| freeTier | FreeTierUsage[] | (see below) | Free tier usage tracking |

#### MonthCost
| Field | Type | Example |
|-------|------|---------|
| month | string | `"Jan 2024"` |
| amount | number | `120.50` |

#### ServiceCost
| Field | Type | Example |
|-------|------|---------|
| name | string | `"Amazon EC2"` |
| amount | number | `85.50` |
| percentage | number | `58.9` |
| color | string | `"#FF9900"` |

#### FreeTierUsage
| Field | Type | Example |
|-------|------|---------|
| service | string | `"Amazon EC2"` |
| usageType | string | `"750 hours of t2.micro"` |
| limit | string | `"750 Hrs"` |
| used | number | `595.46` |
| percentage | number | `79.39` |

---

### §SecurityGroups
VPC security groups for network access control.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | `"sg-0abc1234def56789"` | Security group ID |
| name | string | `"web-server-sg"` | Group name |
| description | string | `"Allow HTTP/HTTPS traffic"` | Description |
| vpcId | string | `"vpc-0abc1234"` | VPC ID |
| inboundRules | SGRule[] | (see below) | Inbound rules |
| outboundRules | SGRule[] | (see below) | Outbound rules |

#### SGRule
| Field | Type | Example |
|-------|------|---------|
| protocol | string | `"TCP"` |
| port | string | `"443"` |
| source | string | `"0.0.0.0/0"` |
| description | string | `"HTTPS"` |

---

### §KeyPairs
SSH key pairs for EC2 access.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| name | string | `"my-key-pair"` | Key pair name |
| id | string | `"key-0abc1234"` | Key pair ID |
| type | string | `"RSA"` | `"RSA"` or `"ED25519"` |
| fingerprint | string | `"a1:b2:c3:d4:..."` | Key fingerprint |
| created | string (ISO 8601) | `"2023-01-10T09:00:00Z"` | Creation timestamp |

---

### §Notifications
Console notifications for resource events.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | `"notif-001"` | Unique notification ID |
| title | string | `"Instance started"` | Notification title |
| message | string | `"i-0a1b2c3d is now running"` | Detail message |
| type | string | `"success"` | `"success"`, `"warning"`, `"error"`, `"info"` |
| timestamp | string (ISO 8601) | `"2024-03-15T10:31:00Z"` | When the notification was created |
| read | boolean | `false` | Whether user has seen it |
| service | string | `"EC2"` | Source service |

---

### §RecentServices
Recently visited services shown on Console Home.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| id | string | `"ec2"` | Service identifier |
| name | string | `"EC2"` | Display name |
| path | string | `"/ec2"` | Route path |
| lastVisited | string (ISO 8601) | `"2024-03-15T10:00:00Z"` | Last visit time |

---

## createInitialData() Structure

```javascript
export const getDefaultData = () => ({
  user: {
    name: "Admin User",
    email: "admin@company.com",
    accountId: "1234-5678-9012",
    region: "us-east-1",
    accountAlias: "my-company-prod"
  },

  recentServices: [
    { id: "ec2", name: "EC2", path: "/ec2", lastVisited: "2024-03-15T10:00:00Z" },
    { id: "s3", name: "S3", path: "/s3", lastVisited: "2024-03-15T09:30:00Z" },
    { id: "lambda", name: "Lambda", path: "/lambda", lastVisited: "2024-03-14T16:00:00Z" },
    { id: "rds", name: "RDS", path: "/rds", lastVisited: "2024-03-14T14:00:00Z" },
    { id: "iam", name: "IAM", path: "/iam", lastVisited: "2024-03-13T11:00:00Z" },
    { id: "billing", name: "Billing", path: "/billing", lastVisited: "2024-03-12T09:00:00Z" }
  ],

  ec2: [
    {
      id: "i-0a1b2c3d4e5f6g7h8",
      name: "Web-Server-01",
      type: "t2.micro",
      state: "running",
      publicIp: "54.123.45.67",
      privateIp: "10.0.1.42",
      az: "us-east-1a",
      vpcId: "vpc-0abc1234def56789",
      subnetId: "subnet-0def5678abc12345",
      ami: "ami-0abcdef1234567890",
      amiName: "Amazon Linux 2023 AMI",
      platform: "Linux/UNIX",
      keyPair: "my-key-pair",
      securityGroups: ["sg-web-server"],
      launchTime: "2024-03-10T08:30:00Z",
      monitoring: "disabled",
      tags: [
        { Key: "Environment", Value: "Production" },
        { Key: "Project", Value: "WebApp" }
      ]
    },
    {
      id: "i-0x9y8z7a6b5c4d3e2",
      name: "Worker-Node-Alpha",
      type: "m5.large",
      state: "stopped",
      publicIp: "-",
      privateIp: "10.0.2.18",
      az: "us-east-1b",
      vpcId: "vpc-0abc1234def56789",
      subnetId: "subnet-0ghi9012def34567",
      ami: "ami-0bcdef2345678901a",
      amiName: "Ubuntu Server 22.04 LTS",
      platform: "Linux/UNIX",
      keyPair: "deploy-key",
      securityGroups: ["sg-worker-nodes"],
      launchTime: "2024-03-08T14:00:00Z",
      monitoring: "enabled",
      tags: [
        { Key: "Environment", Value: "Staging" },
        { Key: "Project", Value: "DataPipeline" }
      ]
    },
    {
      id: "i-0f1e2d3c4b5a69870",
      name: "API-Gateway-Prod",
      type: "t3.small",
      state: "running",
      publicIp: "52.87.123.45",
      privateIp: "10.0.1.100",
      az: "us-east-1a",
      vpcId: "vpc-0abc1234def56789",
      subnetId: "subnet-0def5678abc12345",
      ami: "ami-0abcdef1234567890",
      amiName: "Amazon Linux 2023 AMI",
      platform: "Linux/UNIX",
      keyPair: "my-key-pair",
      securityGroups: ["sg-web-server", "sg-api-access"],
      launchTime: "2024-02-28T11:00:00Z",
      monitoring: "enabled",
      tags: [
        { Key: "Environment", Value: "Production" },
        { Key: "Project", Value: "APIService" }
      ]
    },
    {
      id: "i-0ab12cd34ef567890",
      name: "Dev-Test-Box",
      type: "t2.micro",
      state: "running",
      publicIp: "3.92.55.12",
      privateIp: "10.0.3.5",
      az: "us-east-1c",
      vpcId: "vpc-0abc1234def56789",
      subnetId: "subnet-0jkl3456ghi78901",
      ami: "ami-0bcdef2345678901a",
      amiName: "Ubuntu Server 22.04 LTS",
      platform: "Linux/UNIX",
      keyPair: "dev-key",
      securityGroups: ["sg-dev-access"],
      launchTime: "2024-03-14T16:45:00Z",
      monitoring: "disabled",
      tags: [
        { Key: "Environment", Value: "Development" },
        { Key: "Owner", Value: "dev-team" }
      ]
    }
  ],

  s3: [
    {
      name: "my-app-assets-prod",
      region: "us-east-1",
      created: "2023-01-15T10:00:00Z",
      access: "Bucket and objects not public",
      versioning: "Enabled",
      encryption: "SSE-S3",
      objects: [
        { key: "index.html", size: 1024, lastModified: "2024-03-01T12:00:00Z", storageClass: "Standard", type: "html" },
        { key: "css/styles.css", size: 4096, lastModified: "2024-03-01T12:05:00Z", storageClass: "Standard", type: "css" },
        { key: "js/app.js", size: 32768, lastModified: "2024-03-01T12:05:00Z", storageClass: "Standard", type: "js" },
        { key: "images/logo.png", size: 20480, lastModified: "2024-02-15T09:00:00Z", storageClass: "Standard", type: "png" },
        { key: "images/hero-banner.jpg", size: 245760, lastModified: "2024-02-15T09:00:00Z", storageClass: "Standard", type: "jpg" }
      ]
    },
    {
      name: "data-lake-raw",
      region: "us-west-2",
      created: "2023-02-20T14:30:00Z",
      access: "Bucket and objects not public",
      versioning: "Disabled",
      encryption: "SSE-S3",
      objects: [
        { key: "2024/03/events-20240301.json", size: 1048576, lastModified: "2024-03-01T00:05:00Z", storageClass: "Standard", type: "json" },
        { key: "2024/03/events-20240302.json", size: 986234, lastModified: "2024-03-02T00:05:00Z", storageClass: "Standard", type: "json" },
        { key: "schemas/event-schema.avro", size: 2048, lastModified: "2023-06-01T10:00:00Z", storageClass: "Standard", type: "avro" }
      ]
    },
    {
      name: "company-backups",
      region: "us-east-1",
      created: "2023-06-01T08:00:00Z",
      access: "Bucket and objects not public",
      versioning: "Enabled",
      encryption: "SSE-KMS",
      objects: [
        { key: "db-backup-2024-03-14.sql.gz", size: 52428800, lastModified: "2024-03-14T02:00:00Z", storageClass: "Standard-IA", type: "gz" },
        { key: "db-backup-2024-03-15.sql.gz", size: 53477376, lastModified: "2024-03-15T02:00:00Z", storageClass: "Standard-IA", type: "gz" }
      ]
    }
  ],

  lambda: [
    {
      name: "process-image-resize",
      description: "Resizes uploaded images to thumbnail and medium sizes",
      runtime: "nodejs18.x",
      handler: "index.handler",
      memorySize: 256,
      timeout: 30,
      lastModified: "2024-03-01T09:15:00Z",
      codeSize: 2048,
      code: "const sharp = require('sharp');\n\nexports.handler = async (event) => {\n  const bucket = event.Records[0].s3.bucket.name;\n  const key = event.Records[0].s3.object.key;\n  \n  console.log(`Processing image: ${key} from ${bucket}`);\n  \n  // Resize to thumbnail\n  const thumbnail = await sharp(imageBuffer)\n    .resize(150, 150)\n    .toBuffer();\n  \n  return {\n    statusCode: 200,\n    body: JSON.stringify({ message: 'Image resized successfully' })\n  };\n};",
      environment: { THUMBNAIL_SIZE: "150", OUTPUT_BUCKET: "my-app-assets-prod" },
      layers: [],
      role: "arn:aws:iam::123456789012:role/LambdaExecutionRole",
      tags: { project: "web-app" }
    },
    {
      name: "api-auth-handler",
      description: "Handles API Gateway authentication and token validation",
      runtime: "python3.12",
      handler: "lambda_function.lambda_handler",
      memorySize: 128,
      timeout: 10,
      lastModified: "2024-02-20T14:30:00Z",
      codeSize: 1536,
      code: "import json\nimport jwt\n\ndef lambda_handler(event, context):\n    token = event.get('authorizationToken', '')\n    \n    try:\n        decoded = jwt.decode(token, 'secret', algorithms=['HS256'])\n        return generate_policy(decoded['sub'], 'Allow', event['methodArn'])\n    except jwt.InvalidTokenError:\n        return generate_policy('user', 'Deny', event['methodArn'])\n\ndef generate_policy(principal_id, effect, resource):\n    return {\n        'principalId': principal_id,\n        'policyDocument': {\n            'Version': '2012-10-17',\n            'Statement': [{\n                'Action': 'execute-api:Invoke',\n                'Effect': effect,\n                'Resource': resource\n            }]\n        }\n    }",
      environment: { JWT_SECRET: "my-secret-key", LOG_LEVEL: "INFO" },
      layers: [],
      role: "arn:aws:iam::123456789012:role/LambdaAuthRole",
      tags: { project: "api-service" }
    },
    {
      name: "scheduled-cleanup",
      description: "Nightly cleanup of expired temporary files from S3",
      runtime: "nodejs18.x",
      handler: "index.handler",
      memorySize: 128,
      timeout: 300,
      lastModified: "2024-01-15T11:00:00Z",
      codeSize: 1024,
      code: "const AWS = require('aws-sdk');\nconst s3 = new AWS.S3();\n\nexports.handler = async (event) => {\n  const now = Date.now();\n  const cutoff = now - (24 * 60 * 60 * 1000); // 24 hours ago\n  \n  console.log('Starting cleanup task...');\n  \n  // List and delete expired objects\n  const params = {\n    Bucket: process.env.CLEANUP_BUCKET,\n    Prefix: 'tmp/'\n  };\n  \n  const objects = await s3.listObjectsV2(params).promise();\n  console.log(`Found ${objects.Contents.length} objects to check`);\n  \n  return { deleted: 0, checked: objects.Contents.length };\n};",
      environment: { CLEANUP_BUCKET: "data-lake-raw", RETENTION_HOURS: "24" },
      layers: [],
      role: "arn:aws:iam::123456789012:role/LambdaExecutionRole",
      tags: { project: "maintenance" }
    }
  ],

  rds: [
    {
      id: "prod-db-primary",
      engine: "mysql",
      engineVersion: "8.0.35",
      class: "db.t3.medium",
      status: "available",
      role: "Instance",
      endpoint: "prod-db-primary.cxyz1234abcd.us-east-1.rds.amazonaws.com",
      port: 3306,
      az: "us-east-1a",
      multiAZ: true,
      storage: 100,
      storageType: "gp3",
      vpcId: "vpc-0abc1234def56789",
      created: "2023-06-01T08:00:00Z",
      tags: [{ Key: "Environment", Value: "Production" }]
    },
    {
      id: "analytics-postgres",
      engine: "postgres",
      engineVersion: "15.4",
      class: "db.r6g.large",
      status: "available",
      role: "Instance",
      endpoint: "analytics-postgres.cxyz1234abcd.us-east-1.rds.amazonaws.com",
      port: 5432,
      az: "us-east-1b",
      multiAZ: false,
      storage: 200,
      storageType: "gp3",
      vpcId: "vpc-0abc1234def56789",
      created: "2023-09-15T10:00:00Z",
      tags: [{ Key: "Environment", Value: "Production" }, { Key: "Team", Value: "Analytics" }]
    },
    {
      id: "dev-test-db",
      engine: "mysql",
      engineVersion: "8.0.35",
      class: "db.t3.micro",
      status: "stopped",
      role: "Instance",
      endpoint: "dev-test-db.cxyz1234abcd.us-east-1.rds.amazonaws.com",
      port: 3306,
      az: "us-east-1a",
      multiAZ: false,
      storage: 20,
      storageType: "gp2",
      vpcId: "vpc-0abc1234def56789",
      created: "2024-01-10T14:00:00Z",
      tags: [{ Key: "Environment", Value: "Development" }]
    }
  ],

  iam: {
    users: [
      {
        name: "admin",
        arn: "arn:aws:iam::123456789012:user/admin",
        created: "2023-01-01",
        lastActivity: "2024-03-15",
        groups: ["Admins"],
        policies: ["AdministratorAccess"],
        mfaEnabled: true,
        accessKeyAge: "90 days",
        passwordLastUsed: "2024-03-15",
        path: "/",
        tags: []
      },
      {
        name: "deploy-bot",
        arn: "arn:aws:iam::123456789012:user/deploy-bot",
        created: "2023-03-15",
        lastActivity: "2024-03-15",
        groups: ["CI-CD"],
        policies: [],
        mfaEnabled: false,
        accessKeyAge: "365 days",
        passwordLastUsed: "N/A",
        path: "/",
        tags: [{ Key: "Purpose", Value: "CI/CD Pipeline" }]
      },
      {
        name: "jane.developer",
        arn: "arn:aws:iam::123456789012:user/jane.developer",
        created: "2023-06-15",
        lastActivity: "2024-03-14",
        groups: ["Developers"],
        policies: [],
        mfaEnabled: true,
        accessKeyAge: "45 days",
        passwordLastUsed: "2024-03-14",
        path: "/",
        tags: [{ Key: "Team", Value: "Engineering" }]
      },
      {
        name: "data-analyst",
        arn: "arn:aws:iam::123456789012:user/data-analyst",
        created: "2023-09-01",
        lastActivity: "2024-03-12",
        groups: ["ReadOnly"],
        policies: ["AmazonS3ReadOnlyAccess"],
        mfaEnabled: true,
        accessKeyAge: "N/A",
        passwordLastUsed: "2024-03-12",
        path: "/",
        tags: [{ Key: "Team", Value: "Analytics" }]
      }
    ],
    roles: [
      {
        name: "EC2ServiceRole",
        arn: "arn:aws:iam::123456789012:role/EC2ServiceRole",
        created: "2023-01-02",
        lastActivity: "2024-03-15",
        trustedEntities: "AWS service: ec2.amazonaws.com",
        description: "Allows EC2 instances to call AWS services on your behalf",
        policies: ["AmazonS3ReadOnlyAccess", "CloudWatchAgentServerPolicy"],
        path: "/",
        maxSessionDuration: 3600
      },
      {
        name: "LambdaExecutionRole",
        arn: "arn:aws:iam::123456789012:role/LambdaExecutionRole",
        created: "2023-01-02",
        lastActivity: "2024-03-15",
        trustedEntities: "AWS service: lambda.amazonaws.com",
        description: "Allows Lambda functions to access AWS resources",
        policies: ["AmazonS3FullAccess", "AWSLambdaBasicExecutionRole"],
        path: "/",
        maxSessionDuration: 3600
      },
      {
        name: "RDSMonitoringRole",
        arn: "arn:aws:iam::123456789012:role/RDSMonitoringRole",
        created: "2023-06-01",
        lastActivity: "2024-03-15",
        trustedEntities: "AWS service: monitoring.rds.amazonaws.com",
        description: "Allows RDS to publish monitoring metrics to CloudWatch",
        policies: ["AmazonRDSEnhancedMonitoringRole"],
        path: "/",
        maxSessionDuration: 3600
      }
    ],
    policies: [
      { name: "AdministratorAccess", arn: "arn:aws:iam::aws:policy/AdministratorAccess", type: "AWS managed", description: "Provides full access to AWS services and resources", attachedEntities: 1, created: "2023-01-01", updated: "2023-01-01" },
      { name: "AmazonS3FullAccess", arn: "arn:aws:iam::aws:policy/AmazonS3FullAccess", type: "AWS managed", description: "Provides full access to all buckets via the AWS Management Console", attachedEntities: 1, created: "2023-01-01", updated: "2023-01-01" },
      { name: "AmazonS3ReadOnlyAccess", arn: "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess", type: "AWS managed", description: "Provides read-only access to all buckets", attachedEntities: 2, created: "2023-01-01", updated: "2023-01-01" },
      { name: "AWSLambdaBasicExecutionRole", arn: "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole", type: "AWS managed", description: "Allows Lambda to write logs to CloudWatch", attachedEntities: 1, created: "2023-01-01", updated: "2023-01-01" },
      { name: "CloudWatchAgentServerPolicy", arn: "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy", type: "AWS managed", description: "Allows CloudWatch Agent to publish metrics", attachedEntities: 1, created: "2023-01-01", updated: "2023-01-01" },
      { name: "DeploymentPolicy", arn: "arn:aws:iam::123456789012:policy/DeploymentPolicy", type: "Customer managed", description: "Custom policy for CI/CD deployments", attachedEntities: 1, created: "2023-03-15", updated: "2024-01-10" }
    ],
    groups: [
      { name: "Admins", arn: "arn:aws:iam::123456789012:group/Admins", created: "2023-01-01", users: ["admin"], policies: ["AdministratorAccess"], path: "/" },
      { name: "Developers", arn: "arn:aws:iam::123456789012:group/Developers", created: "2023-06-01", users: ["jane.developer"], policies: ["AmazonS3FullAccess"], path: "/" },
      { name: "CI-CD", arn: "arn:aws:iam::123456789012:group/CI-CD", created: "2023-03-15", users: ["deploy-bot"], policies: ["DeploymentPolicy"], path: "/" },
      { name: "ReadOnly", arn: "arn:aws:iam::123456789012:group/ReadOnly", created: "2023-09-01", users: ["data-analyst"], policies: ["AmazonS3ReadOnlyAccess"], path: "/" }
    ]
  },

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
      { service: "Amazon DynamoDB", usageType: "25 GB of storage", limit: "25 GB", used: 0, percentage: 0 }
    ]
  },

  securityGroups: [
    {
      id: "sg-0abc1234def56789",
      name: "web-server-sg",
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
      id: "sg-0def5678abc12345",
      name: "db-access-sg",
      description: "Allow MySQL and PostgreSQL from app layer",
      vpcId: "vpc-0abc1234def56789",
      inboundRules: [
        { protocol: "TCP", port: "3306", source: "sg-0abc1234def56789", description: "MySQL from web servers" },
        { protocol: "TCP", port: "5432", source: "sg-0abc1234def56789", description: "PostgreSQL from web servers" }
      ],
      outboundRules: [
        { protocol: "All", port: "All", source: "0.0.0.0/0", description: "All outbound traffic" }
      ]
    }
  ],

  keyPairs: [
    { name: "my-key-pair", id: "key-0abc1234def56789", type: "RSA", fingerprint: "a1:b2:c3:d4:e5:f6:a7:b8:c9:d0:e1:f2:a3:b4:c5:d6", created: "2023-01-10T09:00:00Z" },
    { name: "deploy-key", id: "key-0def5678abc12345", type: "RSA", fingerprint: "f1:e2:d3:c4:b5:a6:f7:e8:d9:c0:b1:a2:f3:e4:d5:c6", created: "2023-03-15T12:00:00Z" },
    { name: "dev-key", id: "key-0ghi9012def34567", type: "ED25519", fingerprint: "01:23:45:67:89:ab:cd:ef:01:23:45:67:89:ab:cd:ef", created: "2024-01-05T10:00:00Z" }
  ],

  notifications: [
    { id: "notif-001", title: "Instance state change", message: "i-0a1b2c3d4e5f6g7h8 (Web-Server-01) is now running", type: "info", timestamp: "2024-03-15T10:30:00Z", read: true, service: "EC2" },
    { id: "notif-002", title: "RDS maintenance scheduled", message: "prod-db-primary has a maintenance window in 3 days", type: "warning", timestamp: "2024-03-15T08:00:00Z", read: false, service: "RDS" },
    { id: "notif-003", title: "Budget alert", message: "Your month-to-date costs have reached 80% of your budget ($250.00)", type: "warning", timestamp: "2024-03-14T12:00:00Z", read: false, service: "Billing" },
    { id: "notif-004", title: "Lambda deployment successful", message: "Function process-image-resize deployed successfully", type: "success", timestamp: "2024-03-14T09:15:00Z", read: true, service: "Lambda" }
  ]
});
```

---

## Relationships

```
User
  └── manages → EC2 Instances, S3 Buckets, Lambda Functions, RDS Databases
  └── configures → IAM Users/Roles/Policies/Groups
  └── views → Billing data, Notifications

EC2 Instance
  └── uses → Key Pair (keyPair field)
  └── uses → Security Group(s) (securityGroups field)
  └── in → VPC/Subnet (vpcId, subnetId)

S3 Bucket
  └── contains → S3 Objects (objects array)

Lambda Function
  └── uses → IAM Role (role field)
  └── references → Environment Variables

RDS Database
  └── in → VPC (vpcId)
  └── uses → Security Group (implied)

IAM User
  └── belongs to → IAM Group(s) (groups field)
  └── has → IAM Policy(s) (policies field)

IAM Role
  └── has → IAM Policy(s) (policies field)

IAM Group
  └── contains → IAM Users (users field)
  └── has → IAM Policy(s) (policies field)
```
