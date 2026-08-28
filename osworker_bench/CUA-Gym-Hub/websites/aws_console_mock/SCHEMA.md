# aws_console_mock Schema

**Deploy order**: 3 (0-indexed, alphabetical among *_mock dirs; BASE_PORT=8000 -> port 8003)
**Public URL**: `https://cua-gym-aws-console.xlang.ai`
**Go Endpoint**: `GET /go?sid=<sid>` -> `{initial_state, current_state, state_diff}`
**Inject**: `POST /post?sid=<sid>` with body `{"action":"set","state":{...}}`
**Update current only**: `POST /post?sid=<sid>` with body `{"action":"set_current","state":{...}}`
**Reset**: `POST /post?sid=<sid>` with body `{"action":"reset"}`

## State Schema

### Top-Level Keys

| Key | Type | Description |
|-----|------|-------------|
| `user` | object | Account info |
| `recentServices` | array | Recently visited services |
| `favorites` | array | Favorited services |
| `ec2` | array | EC2 instances |
| `volumes` | array | EBS volumes |
| `snapshots` | array | EBS snapshots |
| `amis` | array | Amazon Machine Images |
| `elasticIps` | array | Elastic IP addresses |
| `loadBalancers` | array | Load balancers (ALB/NLB) |
| `targetGroups` | array | Target groups for load balancers |
| `autoScalingGroups` | array | Auto Scaling groups |
| `launchTemplates` | array | EC2 launch templates |
| `securityGroups` | array | EC2 security groups |
| `keyPairs` | array | EC2 key pairs |
| `s3` | array | S3 buckets |
| `lambda` | array | Lambda functions |
| `lambdaLayers` | array | Lambda layers |
| `rds` | array | RDS database instances |
| `rdsSnapshots` | array | RDS snapshots |
| `rdsSubnetGroups` | array | RDS subnet groups |
| `rdsParameterGroups` | array | RDS parameter groups |
| `iam` | object | IAM resources (users, roles, policies, groups, identityProviders, accountSettings) |
| `vpc` | object | VPC resources (vpcs, subnets, routeTables, internetGateways, natGateways, networkAcls) |
| `cloudwatch` | object | CloudWatch resources (alarms, logGroups, dashboards) |
| `dynamodb` | object | DynamoDB resources (tables) |
| `sns` | object | SNS resources (topics, subscriptions) |
| `sqs` | object | SQS resources (queues) |
| `cloudfront` | object | CloudFront resources (distributions) |
| `route53` | object | Route 53 resources (hostedZones, records) |
| `billing` | object | Billing & Cost Management data |
| `notifications` | array | Console notifications |
| `flash` | array | Transient flash messages (usually empty) |

### Detailed Field Schemas

#### `user`
```
{ name, email, accountId, region, accountAlias }
```

#### `recentServices[]` / `favorites[]`
```
{ id, name, path, lastVisited }
```

#### `ec2[]`
```
{ id, name, type, state, publicIp, privateIp, az, vpcId, subnetId, ami, amiName, platform, keyPair, securityGroups[], launchTime, monitoring, tags[] }
```
- `state`: "running" | "stopped" | "terminated" | "pending"

#### `volumes[]`
```
{ id, name, size, volumeType, state, iops, throughput, az, attachedTo, device, created, encrypted, snapshotId }
```
- `volumeType`: "gp3" | "gp2" | "io1" | "st1"
- `state`: "in-use" | "available"

#### `snapshots[]`
```
{ id, name, description, volumeId, volumeSize, status, started, progress, encrypted, ownerId }
```

#### `amis[]`
```
{ id, name, description, owner, state, architecture, platform, rootDeviceType, virtualization, created, public }
```

#### `elasticIps[]`
```
{ allocationId, publicIp, associationId, instanceId, privateIp, networkInterfaceId, domain, tags[] }
```

#### `loadBalancers[]`
```
{ name, arn, type, scheme, state, dnsName, vpcId, az[], securityGroups[], listeners[], created, tags[] }
```
- `type`: "application" | "network"
- `listeners[]`: `{ port, protocol, defaultAction }`

#### `targetGroups[]`
```
{ name, arn, protocol, port, targetType, vpcId, healthCheck, targets[], loadBalancer }
```
- `healthCheck`: `{ path, protocol, interval, timeout, healthyThreshold, unhealthyThreshold }`
- `targets[]`: `{ id, port, health }`

#### `autoScalingGroups[]`
```
{ name, minSize, maxSize, desiredCapacity, launchTemplate, launchTemplateVersion, az[], vpcZoneIdentifier, targetGroupARNs[], healthCheckType, healthCheckGracePeriod, instances[], created, tags[], policies[] }
```
- `policies[]`: `{ name, type, metric, target }`

#### `launchTemplates[]`
```
{ id, name, version, defaultVersion, latestVersion, ami, instanceType, keyPair, securityGroups[], userData, iamInstanceProfile, monitoring, created, createdBy, tags[] }
```

#### `securityGroups[]`
```
{ id, name, description, vpcId, inboundRules[], outboundRules[], tags[] }
```
- `inboundRules[]` / `outboundRules[]`: `{ protocol, port, source|destination, description }`

#### `keyPairs[]`
```
{ name, id, type, fingerprint, created }
```
- `type`: "RSA" | "ED25519"

#### `s3[]`
```
{ name, region, created, access, versioning, encryption, objects[] }
```
- `objects[]`: `{ key, size, lastModified, storageClass, type }`

#### `lambda[]`
```
{ name, description, runtime, handler, memorySize, timeout, lastModified, codeSize, code, environment, layers, role, tags }
```

#### `lambdaLayers[]`
```
{ name, arn, description, runtimes[], version, size, created }
```

#### `rds[]`
```
{ id, engine, engineVersion, class, status, role, endpoint, port, az, multiAZ, storage, storageType, vpcId, created, tags[] }
```
- `status`: "available" | "stopped" | "creating"

#### `rdsSnapshots[]`
```
{ id, dbInstanceId, engine, status, type, created, storage, encrypted }
```

#### `rdsSubnetGroups[]`
```
{ name, description, vpcId, status, subnets[] }
```

#### `rdsParameterGroups[]`
```
{ name, family, description, type }
```

#### `iam`
```
{
  users[]: { name, arn, created, lastActivity, groups[], policies[], mfaEnabled, accessKeyAge, passwordLastUsed, path, tags[] },
  roles[]: { name, arn, created, lastActivity, trustedEntities, description, policies[], path, maxSessionDuration },
  policies[]: { name, arn, type, description, attachedEntities, created, updated },
  groups[]: { name, arn, created, users[], policies[], path },
  identityProviders[]: { name, type, arn, created },
  accountSettings: { passwordPolicy, aliases[] }
}
```

#### `vpc`
```
{
  vpcs[]: { id, name, cidr, state, isDefault, tenancy, dnsHostnames, dnsResolution, tags[] },
  subnets[]: { id, name, vpcId, cidr, az, availableIps, autoAssignPublicIp, routeTable, type },
  routeTables[]: { id, name, vpcId, associations[], routes[] },
  internetGateways[]: { id, name, state, vpcId },
  natGateways[]: { id, name, state, subnetId, publicIp, privateIp, created },
  networkAcls[]: { id, name, vpcId, isDefault, associations[], inbound[], outbound[] }
}
```

#### `cloudwatch`
```
{
  alarms[]: { name, description, metric, namespace, statistic, period, evaluationPeriods, threshold, comparisonOperator, state, dimensions[], actions[], updated },
  logGroups[]: { name, storedBytes, retentionDays, created, streams },
  dashboards[]: { name, widgets, lastModified, created }
}
```
- `alarms[].state`: "OK" | "ALARM" | "INSUFFICIENT_DATA"

#### `dynamodb`
```
{
  tables[]: { name, status, partitionKey, sortKey, billingMode, itemCount, tableSize, created, gsi[], lsi[], ttl, encryption, tags[] }
}
```

#### `sns`
```
{
  topics[]: { name, arn, displayName, type, subscriptionCount, created },
  subscriptions[]: { id, topicArn, protocol, endpoint, status }
}
```

#### `sqs`
```
{
  queues[]: { name, url, type, messagesAvailable, messagesInFlight, created, visibilityTimeout, messageRetention, maxMessageSize, deliveryDelay, receiveWaitTime, deadLetterQueue, maxReceives, encryption }
}
```
- `type`: "Standard" | "FIFO"
- `messageRetention`: value in seconds (e.g. 345600 = 4 days)

#### `cloudfront`
```
{
  distributions[]: { id, domainName, status, state, origins[], priceClass, alternateNames[], defaultCacheBehavior, comment, lastModified, created }
}
```

#### `route53`
```
{
  hostedZones[]: { id, name, type, recordCount, comment, vpcId, created },
  records[]: { id, zoneId, name, type, ttl, value }
}
```
- `hostedZones[].type`: "Public" | "Private"
- `records[].type`: "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "NS" | "SOA"

#### `billing`
```
{
  currentMonth, forecast, lastMonth, currency,
  history[]: { month, amount },
  byService[]: { service, amount, percentage },
  freeTier[]: { service, usage, limit, unit },
  budgets[]: { name, amount, actual, forecast, period, scope, alerts[] },
  paymentMethods[]: { id, type, last4, expiry, isDefault, name },
  taxSettings: { country, state, taxId, companyName, address }
}
```

#### `notifications[]`
```
{ id, title, message, type, timestamp, read, service }
```

## Reducer Actions (dispatch types)

### EC2
| Action | Payload | Effect |
|--------|---------|--------|
| `LAUNCH_INSTANCE` | instance object | Add to `ec2[]` |
| `TERMINATE_INSTANCE` | instanceId | Remove from `ec2[]` |
| `UPDATE_INSTANCE_STATE` | `{ instanceId, state }` | Set `ec2[].state` |
| `UPDATE_INSTANCE_TAGS` | `{ instanceId, tags }` | Set `ec2[].tags` |
| `UPDATE_INSTANCE` | `{ instanceId, ...fields }` | Merge fields into instance |
| `CREATE_VOLUME` | volume object | Add to `volumes[]` |
| `DELETE_VOLUME` | volumeId | Remove from `volumes[]` |
| `ATTACH_VOLUME` | `{ volumeId, instanceId, device }` | Set volume attachedTo/device/state |
| `DETACH_VOLUME` | volumeId | Clear volume attachedTo, set state=available |
| `CREATE_SNAPSHOT` | snapshot object | Add to `snapshots[]` |
| `DELETE_SNAPSHOT` | snapshotId | Remove from `snapshots[]` |
| `ALLOCATE_EIP` | eip object | Add to `elasticIps[]` |
| `RELEASE_EIP` | allocationId | Remove from `elasticIps[]` |
| `ASSOCIATE_EIP` | `{ allocationId, instanceId, privateIp }` | Set eip association fields |
| `DISASSOCIATE_EIP` | allocationId | Clear eip association fields |
| `CREATE_LOAD_BALANCER` | lb object | Add to `loadBalancers[]` |
| `DELETE_LOAD_BALANCER` | lb name | Remove from `loadBalancers[]` |
| `CREATE_TARGET_GROUP` | tg object | Add to `targetGroups[]` |
| `DELETE_TARGET_GROUP` | tg name | Remove from `targetGroups[]` |
| `REGISTER_TARGET` | `{ targetGroupName, target }` | Add target to tg |
| `DEREGISTER_TARGET` | `{ targetGroupName, targetId }` | Remove target from tg |
| `CREATE_ASG` | asg object | Add to `autoScalingGroups[]` |
| `DELETE_ASG` | asg name | Remove from `autoScalingGroups[]` |
| `UPDATE_ASG` | `{ name, ...fields }` | Merge fields into asg |
| `CREATE_LAUNCH_TEMPLATE` | lt object | Add to `launchTemplates[]` |
| `DELETE_LAUNCH_TEMPLATE` | lt id | Remove from `launchTemplates[]` |
| `CREATE_SECURITY_GROUP` | sg object | Add to `securityGroups[]` |
| `DELETE_SECURITY_GROUP` | sg id | Remove from `securityGroups[]` |
| `UPDATE_SECURITY_GROUP` | `{ id, ...fields }` | Merge fields into sg |
| `CREATE_KEY_PAIR` | kp object | Add to `keyPairs[]` |
| `DELETE_KEY_PAIR` | kp name | Remove from `keyPairs[]` |
| `DELETE_AMI` | ami id | Remove from `amis[]` |

### S3
| Action | Payload | Effect |
|--------|---------|--------|
| `CREATE_BUCKET` | bucket object | Add to `s3[]` |
| `DELETE_BUCKET` | bucket name | Remove from `s3[]` |
| `UPLOAD_OBJECT` | `{ bucketName, object }` | Add object to bucket |
| `DELETE_OBJECT` | `{ bucketName, key }` | Remove object from bucket |
| `CREATE_FOLDER` | `{ bucketName, folder }` | Add folder object to bucket |
| `UPDATE_BUCKET_VERSIONING` | `{ bucketName, versioning }` | Set bucket versioning |

### Lambda
| Action | Payload | Effect |
|--------|---------|--------|
| `CREATE_FUNCTION` | function object | Add to `lambda[]` |
| `DELETE_FUNCTION` | function name | Remove from `lambda[]` |
| `UPDATE_FUNCTION_CODE` | `{ name, code }` | Set function code |
| `UPDATE_FUNCTION_CONFIG` | `{ name, ...fields }` | Merge fields into function |
| `CREATE_LAMBDA_LAYER` | layer object | Add to `lambdaLayers[]` |
| `DELETE_LAMBDA_LAYER` | layer name | Remove from `lambdaLayers[]` |

### RDS
| Action | Payload | Effect |
|--------|---------|--------|
| `CREATE_DB` | db object | Add to `rds[]` |
| `DELETE_DB` | db id | Remove from `rds[]` |
| `UPDATE_DB_STATUS` | `{ dbId, status }` | Set db status |
| `UPDATE_DB` | `{ id, ...fields }` | Merge fields into db |
| `CREATE_RDS_SNAPSHOT` | snapshot object | Add to `rdsSnapshots[]` |
| `DELETE_RDS_SNAPSHOT` | snapshot id | Remove from `rdsSnapshots[]` |
| `UPDATE_RDS_SNAPSHOT_STATUS` | `{ id, status }` | Set snapshot status |
| `CREATE_RDS_PARAMETER_GROUP` | parameter group object | Add to `rdsParameterGroups[]` |
| `DELETE_RDS_PARAMETER_GROUP` | parameter group name | Remove from `rdsParameterGroups[]` |

### IAM
| Action | Payload | Effect |
|--------|---------|--------|
| `CREATE_USER` | user object | Add to `iam.users[]` |
| `DELETE_USER` | user name | Remove from `iam.users[]` |
| `CREATE_ROLE` | role object | Add to `iam.roles[]` |
| `DELETE_ROLE` | role name | Remove from `iam.roles[]` |
| `CREATE_GROUP` | group object | Add to `iam.groups[]` |
| `DELETE_GROUP` | group name | Remove from `iam.groups[]` |
| `ADD_USER_TO_GROUP` | `{ userName, groupName }` | Add user to group's users[] |
| `REMOVE_USER_FROM_GROUP` | `{ userName, groupName }` | Remove user from group's users[] |
| `CREATE_POLICY` | policy object | Add to `iam.policies[]` |
| `DELETE_POLICY` | policy name | Remove from `iam.policies[]` |
| `CREATE_IDENTITY_PROVIDER` | provider object | Add to `iam.identityProviders[]` |
| `DELETE_IDENTITY_PROVIDER` | provider ARN | Remove from `iam.identityProviders[]` |
| `UPDATE_IAM_ACCOUNT_SETTINGS` | partial accountSettings object | Merge into `iam.accountSettings` |
| `DEACTIVATE_ACCESS_KEY` | `{ userName, accessKeyId }` | Set `iam.users[].accessKeys[].status = 'Inactive'` |
| `DELETE_ACCESS_KEY` | `{ userName, accessKeyId }` | Remove key from `iam.users[].accessKeys[]` |

### VPC
| Action | Payload | Effect |
|--------|---------|--------|
| `CREATE_VPC` | vpc object | Add to `vpc.vpcs[]` |
| `DELETE_VPC` | vpc id | Remove from `vpc.vpcs[]` |
| `CREATE_SUBNET` | subnet object | Add to `vpc.subnets[]` |
| `DELETE_SUBNET` | subnet id | Remove from `vpc.subnets[]` |
| `CREATE_ROUTE_TABLE` | rt object | Add to `vpc.routeTables[]` |
| `DELETE_ROUTE_TABLE` | rt id | Remove from `vpc.routeTables[]` |
| `CREATE_IGW` | igw object | Add to `vpc.internetGateways[]` |
| `DELETE_IGW` | igw id | Remove from `vpc.internetGateways[]` |
| `UPDATE_IGW` | `{ id, ...fields }` | Merge fields into internet gateway (used for attach/detach state) |
| `CREATE_NAT` | nat object | Add to `vpc.natGateways[]` |
| `DELETE_NAT` | nat id | Remove from `vpc.natGateways[]` |

### CloudWatch
| Action | Payload | Effect |
|--------|---------|--------|
| `CREATE_ALARM` | alarm object | Add to `cloudwatch.alarms[]` |
| `DELETE_ALARM` | alarm name | Remove from `cloudwatch.alarms[]` |
| `UPDATE_ALARM_STATE` | `{ name, state }` | Set alarm state |
| `CREATE_LOG_GROUP` | log group object | Add to `cloudwatch.logGroups[]` |
| `DELETE_LOG_GROUP` | log group name | Remove from `cloudwatch.logGroups[]` |
| `CREATE_DASHBOARD` | dashboard object | Add to `cloudwatch.dashboards[]` |
| `DELETE_DASHBOARD` | dashboard name | Remove from `cloudwatch.dashboards[]` |

### DynamoDB
| Action | Payload | Effect |
|--------|---------|--------|
| `CREATE_DYNAMO_TABLE` | table object | Add to `dynamodb.tables[]` |
| `DELETE_DYNAMO_TABLE` | table name | Remove from `dynamodb.tables[]` |
| `UPDATE_DYNAMO_TABLE` | `{ name, ...fields }` | Merge fields into table |

### SNS
| Action | Payload | Effect |
|--------|---------|--------|
| `CREATE_TOPIC` | topic object | Add to `sns.topics[]` |
| `DELETE_TOPIC` | topic name | Remove from `sns.topics[]`, remove subscriptions |
| `CREATE_SUBSCRIPTION` | subscription object | Add to `sns.subscriptions[]`, increment topic count |
| `DELETE_SUBSCRIPTION` | subscription id or `{ arn, topicArn }` | Remove from `sns.subscriptions[]`, decrement topic count |

### SQS
| Action | Payload | Effect |
|--------|---------|--------|
| `CREATE_QUEUE` | queue object | Add to `sqs.queues[]` |
| `DELETE_QUEUE` | queue name | Remove from `sqs.queues[]` |
| `PURGE_QUEUE` | queue name | Set messagesAvailable=0, messagesInFlight=0 |
| `SEND_MESSAGE` | queue name or `{ queueName, body }` | Increment messagesAvailable |

### CloudFront
| Action | Payload | Effect |
|--------|---------|--------|
| `CREATE_DISTRIBUTION` | distribution object | Add to `cloudfront.distributions[]` |
| `DELETE_DISTRIBUTION` | distribution id | Remove from `cloudfront.distributions[]` |
| `UPDATE_DISTRIBUTION` | `{ id, ...fields }` | Merge fields into distribution |

### Route 53
| Action | Payload | Effect |
|--------|---------|--------|
| `CREATE_HOSTED_ZONE` | zone object | Add to `route53.hostedZones[]` |
| `DELETE_HOSTED_ZONE` | zone id | Remove from `route53.hostedZones[]` and its records |
| `CREATE_RECORD` | record object | Add to `route53.records[]` |
| `DELETE_RECORD` | record id or `{ zoneId, name, type }` | Remove from `route53.records[]` |

### Billing
| Action | Payload | Effect |
|--------|---------|--------|
| `ADD_PAYMENT_METHOD` | payment method object | Add to `billing.paymentMethods[]` |
| `REMOVE_PAYMENT_METHOD` | payment method id | Remove from `billing.paymentMethods[]` |
| `CREATE_BUDGET` | budget object | Add to `billing.budgets[]` |
| `DELETE_BUDGET` | budget id | Remove from `billing.budgets[]` (note: payload is `id`, not `name`) |
| `UPDATE_TAX_SETTINGS` | partial taxSettings object | Merge into `billing.taxSettings` |

### General
| Action | Payload | Effect |
|--------|---------|--------|
| `SET_REGION` | region string | Set `user.region` |
| `SWITCH_ROLE` | role string | Set `user.role` |
| `MARK_NOTIFICATION_READ` | notification id | Set `notifications[].read = true` |
| `DISMISS_NOTIFICATION` | notification id | Remove from `notifications[]` |
| `ADD_NOTIFICATION` | notification object | Add to `notifications[]` |
| `TOGGLE_FAVORITE` | service object | Add/remove from `favorites[]` |
| `ADD_RECENT_SERVICE` | service object | Add to front of `recentServices[]` |
| `ADD_FLASH` | `{ type, message }` | Add to `flash[]` |
| `DISMISS_FLASH` | flash id | Remove from `flash[]` |

## Minimal Inject Example

```json
{
  "action": "set",
  "state": {
    "user": {
      "name": "Admin User",
      "email": "admin@company.com",
      "accountId": "1234-5678-9012",
      "region": "us-east-1",
      "accountAlias": "my-company-prod"
    },
    "ec2": [
      {
        "id": "i-0a1b2c3d4e5f6g7h8",
        "name": "Web-Server-01",
        "type": "t2.micro",
        "state": "stopped",
        "publicIp": "-",
        "privateIp": "10.0.1.42",
        "az": "us-east-1a",
        "vpcId": "vpc-0abc1234def56789",
        "subnetId": "subnet-0def5678abc12345",
        "ami": "ami-0abcdef1234567890",
        "amiName": "Amazon Linux 2023 AMI",
        "platform": "Linux/UNIX",
        "keyPair": "my-key-pair",
        "securityGroups": ["sg-web-server"],
        "launchTime": "2024-03-10T08:30:00Z",
        "monitoring": "disabled",
        "tags": [{"Key": "Environment", "Value": "Production"}]
      }
    ]
  }
}
```

## Observable State Changes (for LLM evaluation)

| User Action | State Field Changed |
|-------------|---------------------|
| Start/stop EC2 instance | `ec2[].state` ("running" <-> "stopped") |
| Create/delete S3 bucket | `s3` array length; bucket `name` present/absent |
| Upload object to S3 bucket | `s3[].objects` array gains entry |
| Create/delete Lambda function | `lambda` array length; function `name` present/absent |
| Update Lambda code or env vars | `lambda[].code`, `lambda[].environment` |
| Start/stop RDS instance | `rds[].status` ("available" <-> "stopped") |
| Create/delete IAM user | `iam.users` array length |
| Add user to IAM group | `iam.groups[].users[]` gains entry |
| Attach policy to user/role | `iam.users[].policies[]` or `iam.roles[].policies[]` |
| Create/delete security group | `securityGroups` array length |
| Create/delete key pair | `keyPairs` array length |
| Deregister AMI | `amis` array length |
| Allocate/release Elastic IP | `elasticIps` array length |
| Create/delete EBS volume | `volumes` array length |
| Create/delete VPC | `vpc.vpcs` array length |
| Create/delete CloudWatch alarm | `cloudwatch.alarms` array length |
| Create/delete DynamoDB table | `dynamodb.tables` array length |
| Create/delete SNS topic | `sns.topics` array length |
| Create/delete SQS queue | `sqs.queues` array length |
| Send message to SQS queue | `sqs.queues[].messagesAvailable` increments |
| Create/delete Route 53 record | `route53.records` array length |
| Create/delete CloudFront distribution | `cloudfront.distributions` array length |
| Create/delete budget | `billing.budgets` array length |
| Add/remove payment method | `billing.paymentMethods` array length |
| Update tax settings | `billing.taxSettings` fields |
| Update IAM account settings (password policy) | `iam.accountSettings.passwordPolicy` |
| Deactivate IAM access key | `iam.users[].accessKeys[].status` = 'Inactive' |
| Delete IAM access key | `iam.users[].accessKeys[]` array length |
| Attach/detach Internet Gateway | `vpc.internetGateways[].state`, `vpc.internetGateways[].vpcId` |
| Create/delete RDS parameter group | `rdsParameterGroups` array length |
| Mark notification as read | `notifications[].read` true |
| Add to favorites | `favorites` array gains service entry |
| Change region | `user.region` |
| Launch instance from AMI | `ec2` array gains new instance; `amis[].id` referenced in `ec2[].imageId` |

## Routes

| Route | Page | Key Interactions |
|-------|------|------------------|
| `/` | Dashboard | Service search, recently visited, cost cards |
| `/ec2` | EC2 Instances | Launch/terminate/start/stop instances |
| `/ec2/dashboard` | EC2 Dashboard | Resource overview |
| `/ec2/instances/:id` | Instance Detail | Tags, state, monitoring |
| `/ec2/instance-types` | Instance Types | Browse instance types |
| `/ec2/amis` | AMIs | Launch from AMI, deregister |
| `/ec2/volumes` | EBS Volumes | Create/delete/attach/detach |
| `/ec2/snapshots` | EBS Snapshots | Create/delete |
| `/ec2/security-groups` | Security Groups | Create/delete, manage rules |
| `/ec2/key-pairs` | Key Pairs | Create/delete |
| `/ec2/elastic-ips` | Elastic IPs | Allocate/release/associate |
| `/ec2/load-balancers` | Load Balancers | Create/delete |
| `/ec2/target-groups` | Target Groups | Create/delete, register targets |
| `/ec2/auto-scaling` | Auto Scaling | Create/delete/update ASG |
| `/ec2/launch-templates` | Launch Templates | Create/delete |
| `/s3` | S3 Buckets | Create/delete buckets |
| `/s3/:bucketName` | Bucket Detail | Upload/delete objects, versioning |
| `/lambda` | Lambda Functions | Create/delete functions |
| `/lambda/dashboard` | Lambda Dashboard | Overview |
| `/lambda/layers` | Lambda Layers | Create/delete layers |
| `/lambda/:functionName` | Function Detail | Edit code, config, env vars |
| `/rds` | RDS Databases | Create/delete/start/stop |
| `/rds/dashboard` | RDS Dashboard | Overview |
| `/rds/snapshots` | RDS Snapshots | Create/delete |
| `/rds/subnet-groups` | Subnet Groups | View |
| `/rds/parameter-groups` | Parameter Groups | View/edit parameters |
| `/rds/:dbId` | DB Detail | Config, monitoring |
| `/iam` | IAM Dashboard | Security summary |
| `/iam/users` | IAM Users | Create/delete, manage groups |
| `/iam/groups` | IAM Groups | Create/delete, manage policies |
| `/iam/roles` | IAM Roles | Create/delete, trust relationships |
| `/iam/policies` | IAM Policies | Create/delete, policy documents |
| `/iam/identity-providers` | Identity Providers | Create/delete |
| `/iam/account-settings` | Account Settings | Password policy |
| `/billing` | Billing Dashboard | Cost overview |
| `/billing/cost-explorer` | Cost Explorer | Cost analysis |
| `/billing/bills` | Bills | Monthly bills, charges breakdown |
| `/billing/budgets` | Budgets | Create/delete budgets |
| `/billing/payment-methods` | Payment Methods | Add/remove |
| `/billing/tax-settings` | Tax Settings | View/edit |
| `/vpc` | VPC Dashboard | Resource overview |
| `/vpc/vpcs` | VPCs | Create/delete |
| `/vpc/subnets` | Subnets | Create/delete |
| `/vpc/route-tables` | Route Tables | Create/delete |
| `/vpc/internet-gateways` | Internet Gateways | Create/delete/attach |
| `/vpc/nat-gateways` | NAT Gateways | Create/delete |
| `/cloudwatch` | CloudWatch Dashboard | Overview |
| `/cloudwatch/alarms` | Alarms | Create/delete, state changes |
| `/cloudwatch/logs` | Log Groups | Create/delete |
| `/cloudwatch/dashboards` | Dashboards | Create/delete |
| `/dynamodb` | DynamoDB Tables | Create/delete |
| `/dynamodb/:tableName` | Table Detail | Items, indexes |
| `/sns` | SNS Topics | Create/delete, subscriptions |
| `/sqs` | SQS Queues | Create/delete, send message, purge |
| `/cloudfront` | CloudFront | Create/delete distributions |
| `/route53` | Route 53 | Create/delete zones, manage records |
| `/go` | State Inspector | View initial/current/diff state |

## Implemented Interactive Capabilities

The following capabilities were fully implemented (not stubs):

### EC2
- **Launch instance from AMI** (`/ec2/amis`): Select an AMI, click "Launch instance from AMI", fill in instance name and type in the modal, click "Launch instance" — creates a real `ec2[]` entry with state `"running"`, IPs, AZ, security groups, key pair, launchTime, and imageId
- **Instance start/stop/terminate** (`/ec2`, `/ec2/instances/:id`): Buttons dispatch `UPDATE_INSTANCE_STATE` or `TERMINATE_INSTANCE`
- **Instance tags edit** (`/ec2/instances/:id` → Tags tab): Edit and save tags via `UPDATE_INSTANCE_TAGS`
- **Deregister AMI** (`/ec2/amis`): Dispatch `DELETE_AMI`
- **Security Groups Actions dropdown** (`/ec2/security-groups`): "Copy ARN" and "Manage tags" options
- **Key Pairs Actions dropdown** (`/ec2/key-pairs`): "Download private key" and "Copy fingerprint" options
- **Pagination** on EC2 instances (20/page), EC2 AMIs (all), EC2 instance types (10/page)
- **All RefreshCw buttons** show a success flash message when clicked

### S3
- **Create/delete bucket** (`/s3`): Modal form dispatches `CREATE_BUCKET` / `DELETE_BUCKET`
- **Upload object** (`/s3/:bucketName`): File input dispatches `UPLOAD_OBJECT`
- **Delete object** (`/s3/:bucketName`): Dispatches `DELETE_OBJECT`
- **Create folder** (`/s3/:bucketName`): Dispatches `CREATE_FOLDER`
- **Versioning toggle** (`/s3/:bucketName` → Properties): Dispatches `UPDATE_BUCKET_VERSIONING`
- **Pagination** (25/page)

### Lambda
- **Create/delete function** (`/lambda`): Dispatches `CREATE_FUNCTION` / `DELETE_FUNCTION`
- **Edit function code** (`/lambda/:name` → Code tab): Dispatches `UPDATE_FUNCTION_CODE`
- **Edit general config** (`/lambda/:name` → Configuration tab): Saves description, memory, timeout via `UPDATE_FUNCTION_CONFIG`
- **Edit environment variables** (`/lambda/:name` → Configuration tab): Saves env vars via `UPDATE_FUNCTION_CONFIG`
- **Monitor/Aliases/Versions tabs**: Show real content (monitoring sparklines, aliases list, versions list)

### RDS
- **Create/delete/start/stop database** (`/rds`): Dispatches appropriate actions
- **Modify database** (`/rds`): Enabled modify button dispatches `UPDATE_DB`
- **Monitoring tab sparklines** (`/rds/:dbId` → Monitoring): Shows CPU, connections, storage, IOPS, read/write throughput charts with deterministic SVG polylines
- **Create/delete RDS snapshot** (`/rds/snapshots`)
- **Create/delete parameter group** (`/rds/parameter-groups`): Dispatches `CREATE_RDS_PARAMETER_GROUP` / `DELETE_RDS_PARAMETER_GROUP`
- **Edit parameters** (`/rds/parameter-groups`): Opens parameter edit modal

### IAM
- **Create/delete user, role, group, policy, identity provider**
- **Account Settings save**: Dispatches `UPDATE_IAM_ACCOUNT_SETTINGS` with password policy fields
- **Deactivate/delete access keys**: Dispatches `DEACTIVATE_ACCESS_KEY` / `DELETE_ACCESS_KEY`
- **IAM Dashboard security recommendations**: Dynamically computed from actual state (MFA, root access keys, password policy, users count)
- **Policy actions dropdown** (`/iam/policies`): "Attach", "Detach", "Set permissions boundary" options

### VPC
- **Internet Gateway attach/detach** (`/vpc/internet-gateways`): Uses `UPDATE_IGW` action (reads IGW state before dispatch to avoid stale state race condition)
- **Create/delete VPC, subnet, route table, NAT gateway**

### Billing
- **Cost arrow direction** (`/billing`): Shows up-arrow for cost increases, down-arrow for decreases
- **Recommended actions** (`/billing`): Each action is clickable and routes to the relevant service
- **Update tax settings** (`/billing/tax-settings`): Dispatches `UPDATE_TAX_SETTINGS`
- **Create/delete budget** (`/billing/budgets`)
- **Add/remove payment method** (`/billing/payment-methods`)

### CloudWatch
- **Create/delete alarm** with threshold, metric, and comparison operator
- **Alarm state changes** (OK / ALARM / INSUFFICIENT_DATA)
- **Create/delete log group**
- **Create/delete dashboard**

### Dashboard
- **Widget three-dot menus** (`/`): Both "Recently visited" and "Welcome to AWS" widgets have functional dropdowns ("Remove widget", "Move to top")
- **Reset to default layout** button shows flash confirmation
- **Add widgets** button shows flash confirmation

### DynamoDB
- **Create/delete table**: Dispatches `CREATE_DYNAMO_TABLE` / `DELETE_DYNAMO_TABLE`
- **Table Detail Items scan**: Real scan UI shows table items

### SNS / SQS
- **Create/delete topic and subscription** (SNS)
- **Create/delete queue**, **send message**, **purge queue** (SQS)

### CloudFront / Route 53
- **Create/delete distribution** (CloudFront)
- **Create/delete hosted zone and records** (Route 53)
