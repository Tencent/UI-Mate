# XWS Console Mock -- TODO

> Status: READY FOR DEV
> Last updated by: plan agent, 2026-03-07
> Research sources: Cloudscape Design System official docs, @cloudscape-design/design-tokens v3.0.73 npm package (exact hex values extracted)

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Done

---

## P0 -- Visual Design System Overhaul (Cloudscape Alignment)

The current mock uses generic Tailwind colors (orange primary, Helvetica Neue, square corners). The real XWS Console uses the **Cloudscape Design System** with Open Sans font, a **blue-dominant** interactive color palette, rounded corners, and 4px-base spacing. These fixes are foundational and affect every page.

### P0.1 -- Color Palette Update (tailwind.config.js)

Replace the current color palette with exact Cloudscape design token values (light mode). Update `tailwind.config.js` theme.extend.colors.aws:

- [ ] **Primary action color**: Change from `#FF9900` (orange) to `#006ce0` (Cloudscape blue). The real XWS Console uses blue for ALL primary buttons, links, and interactive elements -- NOT orange. Orange (`#FF9900`) is only used for the AWS logo smile and occasional brand accents (not for buttons or active states).
  - `aws.blue` (links/buttons): `#006ce0` (currently `#0073BB`)
  - NEW `aws.blue-hover`: `#002b66`
  - NEW `aws.blue-active`: `#002b66`
  - NEW `aws.blue-light`: `#f0fbff` (hover background for normal/secondary buttons)
  - NEW `aws.blue-lighter`: `#d1f1ff` (active background for normal/secondary buttons, selected table rows)
- [ ] **Text colors**: Update to match Cloudscape tokens:
  - `aws.text`: `#0f141a` (currently `#16191F`)
  - `aws.text-secondary`: `#424650` (currently `#545B64`)
  - `aws.text-disabled`: `#b4b4bb` (currently `#879596`)
  - NEW `aws.text-form-secondary`: `#656871`
- [ ] **Borders**: Update border colors:
  - `aws.border`: `#c6c6cd` (currently `#D5DBDB`) -- matches `color-border-divider-default`
  - NEW `aws.border-secondary`: `#ebebf0` -- matches `color-border-divider-secondary`
  - NEW `aws.border-input`: `#8c8c94` -- matches `color-border-input-default`
- [ ] **Background colors**:
  - `aws.bg`: `#ffffff` (currently `#F2F3F3`) -- Cloudscape `color-background-layout-main` is white
  - `aws.squid`/`aws.nav`: `#0f141a` (currently `#232F3E`) -- matches `color-background-home-header`
  - `aws.dark`: `#0f141a` (update to match)
- [ ] **Status colors**: Update to exact Cloudscape values:
  - `aws.success`: `#00802f` (currently `#1D8102`)
  - `aws.error`: `#db0000` (currently `#D13212`)
  - `aws.warning`: `#855900` (currently `#FF9900`)
  - `aws.info`: `#006ce0`
  - NEW status backgrounds: `aws.status-error-bg`: `#fff5f5`, `aws.status-success-bg`: `#effff1`, `aws.status-warning-bg`: `#fffef0`, `aws.status-info-bg`: `#f0fbff`
- [ ] **Button disabled state tokens**: NEW `aws.disabled-bg`: `#ebebf0`, `aws.disabled-border`: `#b4b4bb`
- [ ] **Keep orange for branding only**: `aws.orange`: `#FF9900` -- used ONLY for: the AWS logo, the "smile" arc, and occasional brand illustrations. NOT for buttons, active sidebar, or any interactive elements.

### P0.2 -- Typography Update

- [ ] Change font-family from `"Helvetica Neue", -apple-system, ...` to `"Open Sans", "Helvetica Neue", Arial, sans-serif` in tailwind.config.js `fontFamily.aws`. Add Open Sans import in `index.html`:
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;700;800&display=swap" rel="stylesheet">
  ```
- [ ] Apply Cloudscape typography scale (add to tailwind config if needed): h1=24px/30px/bold, h2=20px/24px/bold, h3=18px/22px/bold, h4=16px/20px/bold, h5=14px/18px/bold. Body=14px/20px/400. Small=12px/16px/400.
- [ ] Code font (update fontFamily.mono): `Monaco, Menlo, Consolas, "Courier Prime", Courier, "Courier New", monospace`

### P0.3 -- Component Style Overhaul (index.css)

Cloudscape uses rounded corners, blue interactive colors, and specific spacing. Rewrite the CSS utility classes:

- [ ] **Primary button** (`.aws-btn-primary`): Background `#006ce0`, text `#ffffff`, border `none`. Hover: bg `#002b66`. Border-radius: `8px`. Padding: `4px 20px`, min-height: `32px`, font-weight: 700, font-size: 14px.
- [ ] **Normal/secondary button** (`.aws-btn-secondary`): Background `#ffffff`, text `#006ce0`, border `1px solid #006ce0`. Hover: bg `#f0fbff`, border-color `#002b66`, text `#002b66`. Border-radius: `8px`.
- [ ] **Danger button** (`.aws-btn-danger`): Text `#db0000`, border `1px solid #db0000`, bg white. Hover bg `#fff5f5`. Border-radius `8px`.
- [ ] **Disabled buttons**: bg `#ebebf0`, text `#8c8c94`, border `#b4b4bb`, cursor `not-allowed`.
- [ ] **Cards/Containers** (`.aws-card`): Change `border-radius` from `0` to `16px`. Add subtle `box-shadow: 0 1px 1px 0 rgba(0,20,61,0.05)`. Border color: `#c6c6cd`.
- [ ] **Inputs** (`.aws-input`): Border-radius `8px`. Border-color `#8c8c94`. Focus border: `#006ce0`. Focus ring: `0 0 0 2px #006ce0`.
- [ ] **Badges** (`.aws-badge`): Border-radius `4px` (pill-like). Font-size 12px.
- [ ] **Table headers** (`.aws-table th`): Remove `uppercase` and `tracking-wider`. Use normal case, font-weight 700, font-size 14px, color `#424650`.
- [ ] **Table row hover**: Background `#f0fbff` (replace current `blue-50/30`).
- [ ] **Table selected row**: Background `#d1f1ff`.
- [ ] **Sidebar active item** (`.aws-sidebar-item.active`): Change from orange to blue. Border-left-color: `#006ce0`. Text: `#006ce0`. Background: `#f0fbff`.
- [ ] **Tabs**: Replace orange active tab border with blue. Active tab: border-bottom `2px solid #006ce0`, text `#006ce0`. Inactive: transparent border, text `#424650`.
- [ ] **Links** (`.aws-link`): Color `#006ce0`, hover color `#002b66`.

### P0.4 -- Top Navigation Bar Update

- [ ] Background color: `#0f141a` (update from `#232F3E`).
- [ ] Header text/icons default color: `#dedee3` (matches `color-text-interactive-inverted-default`). Hover: `#f9f9fa`.
- [ ] Search bar: background `rgba(255,255,255,0.1)`, border `#424650`, border-radius `8px`. Focus border: `#006ce0`.
- [ ] Region selector dropdown background: `#0f141a` (update from `#1B2A3B`).

### P0.5 -- Sidebar Style Update

- [ ] Active item highlight: blue instead of orange (covered in P0.3).
- [ ] Remove `disabled: true` from ALL sidebar items. Every item should have a `path` and be navigable. Items that previously said "disabled" should link to a placeholder page or a real page (see P1).
- [ ] Sidebar background: keep white (`#ffffff`).

### P0.6 -- Flash Messages / Alerts Update

- [ ] Update FlashMessages.jsx: border-radius `16px` on each alert, use updated status colors and backgrounds from P0.1. Left border 4px wide with status color. Success icon color: `#00802f`. Error: `#db0000`. Warning: `#855900`. Info: `#006ce0`.

---

## P1 -- Enable Disabled Sidebar Items (Functional Pages)

Currently many sidebar items show `disabled: true` with no path. Each must become a navigable page with at minimum a list/table view. Add routes in App.jsx, create page components, and update SIDEBAR_CONFIG in Layout.jsx.

### P1.1 -- EC2 Disabled Items

- [ ] **EC2 Dashboard** (`/ec2/dashboard`): Summary cards showing: Running instances count, Stopped instances count, Security Groups count, Key Pairs count, Volumes count. Resource status overview. "Launch instance" CTA button linking to launch wizard.
- [ ] **Instance Types** (`/ec2/instance-types`): Read-only reference table of available instance types. Columns: Name, vCPUs, Memory (GiB), Storage, Network Performance, Free Tier eligible. Filterable by family prefix (t2/t3/m5/c5/r6g). No CRUD needed.
- [ ] **Launch Templates** (`/ec2/launch-templates`): Table: Template name, Template ID, Default version, Latest version, Created by, Creation date. "Create launch template" form: name, AMI (dropdown from AMIS), instance type, key pair, security groups, storage size/type. Dispatch `CREATE_LAUNCH_TEMPLATE` / `DELETE_LAUNCH_TEMPLATE`. Add `launchTemplates` array to data model.
- [ ] **AMIs** (`/ec2/amis`): Table: AMI name, AMI ID, Source (amazon/self), Owner, Status, Platform, Architecture, Creation date. Filter tabs: "Owned by me" / "Public images". Seed with the AMIS constant items plus 2-3 "owned" custom AMIs.
- [ ] **Volumes** (`/ec2/volumes`): Table: Volume ID, Size (GiB), Volume type (gp2/gp3/io1), State (in-use/available), IOPS, Attached Instance, AZ, Created. "Create volume" form: Size, Type, AZ, Encryption toggle. "Attach" / "Detach" actions on selected volumes. Dispatch `CREATE_VOLUME` / `DELETE_VOLUME` / `ATTACH_VOLUME` / `DETACH_VOLUME`. Add `volumes` array to data model.
- [ ] **Snapshots** (`/ec2/snapshots`): Table: Snapshot ID, Description, Size, Status (completed), Started, Progress, Volume ID, Encryption. "Create snapshot" form: select Volume, description. Dispatch `CREATE_SNAPSHOT` / `DELETE_SNAPSHOT`. Add `snapshots` array to data model.
- [ ] **Elastic IPs** (`/ec2/elastic-ips`): Table: Name, Allocated IPv4, Allocation ID, Associated Instance ID. "Allocate" / "Associate" / "Disassociate" / "Release" actions. Dispatch `ALLOCATE_EIP` / `RELEASE_EIP` / `ASSOCIATE_EIP` / `DISASSOCIATE_EIP`. Add `elasticIps` array.
- [ ] **Load Balancers** (`/ec2/load-balancers`): Table: Name, DNS name, State (active), Type (ALB/NLB), VPC ID, Listeners count. "Create Load Balancer" form: type selection, name, scheme (internet-facing/internal), VPC, listeners. Dispatch `CREATE_LB` / `DELETE_LB`. Add `loadBalancers` array.
- [ ] **Target Groups** (`/ec2/target-groups`): Table: Name, Protocol, Port, VPC, Target type, Health check path, Registered targets count. "Create target group" form. Dispatch `CREATE_TARGET_GROUP` / `DELETE_TARGET_GROUP`. Add `targetGroups` array.
- [ ] **Auto Scaling Groups** (`/ec2/auto-scaling`): Table: Name, Launch template, Min/Max/Desired capacity, Instances count, Health check type, AZs. "Create ASG" form. Dispatch `CREATE_ASG` / `DELETE_ASG` / `UPDATE_ASG`. Add `autoScalingGroups` array.

### P1.2 -- S3 Disabled Items

- [ ] **Access Points** (`/s3/access-points`): Table: Name, Bucket, ARN, Network origin (Internet/VPC), Created. "Create access point" form. Dispatch `CREATE_ACCESS_POINT` / `DELETE_ACCESS_POINT`. Add `s3AccessPoints` array.
- [ ] **Batch Operations** (`/s3/batch-operations`): Table: Job ID, Status (Completed/Active/Failed), Operation, Priority, Creation date. "Create job" button with mock form. Add `s3BatchJobs` array.
- [ ] **Storage Lens** (`/s3/storage-lens`): Dashboard page: total storage across all buckets (sum object sizes), object count, bucket count, average object size. Use recharts bar chart for storage-by-bucket breakdown.

### P1.3 -- Lambda Disabled Items

- [ ] **Lambda Dashboard** (`/lambda/dashboard`): Metrics cards: Total functions count, Invocations (mock "125,000 this month"), Errors ("0.02%"), Throttles ("0"), Avg duration ("45ms"). Top 5 most-invoked functions list (derived from lambda array).
- [ ] **Applications** (`/lambda/applications`): Read-only table: Application name, Runtime, Description, Stack status (CREATE_COMPLETE), Last deployed. 2-3 mock SAM app entries.
- [ ] **Layers** (`/lambda/layers`): Table: Layer name, Description, Compatible runtimes, Version, Created. "Create layer" form. Dispatch `CREATE_LAYER` / `DELETE_LAYER`. Add `lambdaLayers` array.

### P1.4 -- RDS Disabled Items

- [ ] **RDS Dashboard** (`/rds/dashboard`): Summary: total DB instances, by engine (recharts pie/bar), by status. Total storage allocated. Recent events list.
- [ ] **Query Editor** (`/rds/query-editor`): DB selector dropdown (from `state.rds`). SQL textarea. "Run" button shows mock result table (5 rows of sample data: id, name, email, created_at, status). Shows "Execution time: 0.023s, Rows returned: 5".
- [ ] **Performance Insights** (`/rds/performance-insights`): DB selector. Mock charts: DB Load (line chart), Top SQL table (5 entries with query, calls, avg_latency), Top waits table.
- [ ] **Snapshots** (`/rds/snapshots`): Table: Snapshot ID, Type (manual/automated), Status, DB instance, Engine, Size, Created. "Take snapshot" form. Dispatch `CREATE_RDS_SNAPSHOT` / `DELETE_RDS_SNAPSHOT`. Add `rdsSnapshots` array.
- [ ] **Automated backups** (`/rds/automated-backups`): Read-only table: DB instance, Status (active), AZ, Engine, Retention period, Latest restore time. Derived from RDS instances.
- [ ] **Subnet groups** (`/rds/subnet-groups`): Table: Name, VPC ID, Description, Subnets list, Status. "Create DB subnet group" form. Add `rdsSubnetGroups` array.
- [ ] **Parameter groups** (`/rds/parameter-groups`): Table: Name, Family, Description, Type (default/custom). Detail view: parameters list (key/value/source). Add `rdsParameterGroups` array.

### P1.5 -- IAM Disabled Items

- [ ] **Identity providers** (`/iam/identity-providers`): Table: Provider name, Type (SAML/OIDC), ARN, Created. "Add provider" form. Dispatch `CREATE_IDENTITY_PROVIDER` / `DELETE_IDENTITY_PROVIDER`. Add to `iam.identityProviders` array.
- [ ] **Account settings** (`/iam/account-settings`): Password policy form: Min password length (slider 8-128), checkboxes for require uppercase/lowercase/numbers/symbols, password expiration toggle. Account alias (editable text). "Save changes" button.

### P1.6 -- Billing Disabled Items

- [ ] **Bills** (`/billing/bills`): Month selector dropdown. Table: Service name, Usage type, Usage quantity, Cost. Grouped by service with expandable rows. Totals row at bottom. Data derived from `billing.byService` scaled by month.
- [ ] **Budgets** (`/billing/budgets`): Table: Budget name, Type (Cost), Budgeted amount, Current spend, Forecasted, Status badge (Under budget/green, Over budget/red). "Create budget" form: name, amount, period (monthly). Dispatch `CREATE_BUDGET` / `DELETE_BUDGET`. Add `billing.budgets` array.
- [ ] **Payment methods** (`/billing/payment-methods`): Read-only display: Mock credit card (Visa ending 4242, exp 12/2026, cardholder "Admin User"). "Add payment method" button shows flash message only.
- [ ] **Tax settings** (`/billing/tax-settings`): Read-only form: Legal entity name, Address (pre-filled mock company), Tax registration number. "Save" button shows flash message.

---

## P2 -- Additional AWS Services

Add new top-level services to SERVICE_CATEGORIES in Layout.jsx and corresponding routes in App.jsx. Each needs: sidebar config, list view with table, create form, detail page (optional), and state management actions.

### P2.1 -- CloudWatch (`/cloudwatch`)

Add to SERVICE_CATEGORIES under new group "Management & Governance". Icon: `BarChart3` from lucide-react. Color: `#E7157B`.

- [ ] **SIDEBAR_CONFIG** for `/cloudwatch`: Dashboard, Alarms, Log groups, Metrics (placeholder).
- [ ] **Routes**: `/cloudwatch`, `/cloudwatch/alarms`, `/cloudwatch/log-groups`, `/cloudwatch/log-groups/:logGroupName`.
- [ ] **Dashboard** (`/cloudwatch`): 4 metric summary cards: Active ALARM count (red badge), OK count (green), INSUFFICIENT_DATA count (gray), Total alarms. Recent alarm state changes list (last 5 changes with timestamp).
- [ ] **Alarms** (`/cloudwatch/alarms`): Table: Alarm name, State (OK/ALARM/INSUFFICIENT_DATA with colored dot badges -- green/red/gray), Metric name, Namespace, Threshold, Comparison, Period. "Create alarm" form: name, metric dropdown (CPUUtilization, NetworkIn, DiskReadOps, FreeableMemory, DatabaseConnections), namespace dropdown (AWS/EC2, AWS/RDS, AWS/Lambda), statistic (Average/Sum/Max), period (60/300/900), threshold value, comparison (>=, >, <, <=), evaluation periods. Dispatch `CREATE_ALARM` / `DELETE_ALARM` / `UPDATE_ALARM_STATE`.
- [ ] **Log groups** (`/cloudwatch/log-groups`): Table: Log group name, Stored bytes, Retention, Creation time. "Create log group" form: name, retention (dropdown: 1 day, 7 days, 30 days, 90 days, Never expire). Detail page (`/cloudwatch/log-groups/:logGroupName`): shows log streams list (3-5 mock streams with names like "2024/03/15/[$LATEST]abc123"), clicking a stream shows 10 mock log lines with ISO timestamps and message text.
- [ ] **Data model**: Add `cloudwatch: { alarms: [...], logGroups: [...] }` to `getDefaultData()`. Seed: 5 alarms (3 OK: "EC2-CPU-Low", "RDS-Storage-OK", "Lambda-Errors-Low"; 1 ALARM: "EC2-CPU-High" threshold >=80%; 1 INSUFFICIENT_DATA: "RDS-Connections-Monitor"). 4 log groups: "/aws/lambda/process-image-resize" (245KB, 30 days), "/aws/lambda/api-auth-handler" (128KB, 30 days), "/aws/rds/prod-db-primary" (1.2MB, 90 days), "custom/application-logs" (512KB, Never expire).
- [ ] **Reducer actions**: `CREATE_ALARM`, `DELETE_ALARM`, `UPDATE_ALARM_STATE`, `CREATE_LOG_GROUP`, `DELETE_LOG_GROUP`.

### P2.2 -- VPC (`/vpc`)

Add to SERVICE_CATEGORIES under new group "Networking & Content Delivery". Icon: `Network` from lucide-react. Color: `#8C4FFF`.

- [ ] **SIDEBAR_CONFIG** for `/vpc`: Dashboard, Your VPCs, Subnets, Route tables, Internet gateways, NAT gateways, Network ACLs (placeholder).
- [ ] **Routes**: `/vpc`, `/vpc/vpcs`, `/vpc/subnets`, `/vpc/route-tables`, `/vpc/internet-gateways`.
- [ ] **Your VPCs** (`/vpc/vpcs` or `/vpc`): Table: VPC ID, Name tag, State (available), IPv4 CIDR, Default VPC (yes/no), DHCP options set, Main route table. "Create VPC" form: Name, IPv4 CIDR (default 10.0.0.0/16), Tenancy (default). Dispatch `CREATE_VPC` / `DELETE_VPC`.
- [ ] **Subnets** (`/vpc/subnets`): Table: Subnet ID, Name, VPC ID, IPv4 CIDR, AZ, Available IPs, Auto-assign public IP (Yes/No). "Create subnet" form: Name, VPC (dropdown), AZ, CIDR. Dispatch `CREATE_SUBNET` / `DELETE_SUBNET`.
- [ ] **Route tables** (`/vpc/route-tables`): Table: Route table ID, Name, VPC ID, Main (yes/no), Associations count. Detail view: Routes table (Destination, Target, Status), Subnet associations list.
- [ ] **Internet gateways** (`/vpc/internet-gateways`): Table: IGW ID, Name, State (attached/detached), VPC ID. "Create" and "Attach to VPC" / "Detach" actions.
- [ ] **Data model**: Add `vpc: { vpcs: [...], subnets: [...], routeTables: [...], internetGateways: [...] }`. Seed: 1 VPC ("vpc-0abc1234def56789", 10.0.0.0/16, "Main VPC"), 3 subnets (10.0.1.0/24 in us-east-1a, 10.0.2.0/24 in us-east-1b, 10.0.3.0/24 in us-east-1c), 1 main route table, 1 internet gateway (attached).
- [ ] **Reducer actions**: `CREATE_VPC`, `DELETE_VPC`, `CREATE_SUBNET`, `DELETE_SUBNET`, `CREATE_IGW`, `DELETE_IGW`, `ATTACH_IGW`, `DETACH_IGW`.

### P2.3 -- DynamoDB (`/dynamodb`)

Add to SERVICE_CATEGORIES under "Database" group. Icon: `Table2` from lucide-react. Color: `#3B48CC`.

- [ ] **SIDEBAR_CONFIG** for `/dynamodb`: Dashboard (placeholder), Tables.
- [ ] **Routes**: `/dynamodb`, `/dynamodb/:tableName`.
- [ ] **Tables list** (`/dynamodb`): Table: Table name, Status (Active -- green badge), Partition key, Sort key, Items count, Table size, Read/Write capacity mode (On-demand). "Create table" form: Table name, Partition key (name + type dropdown: String/Number/Binary), Sort key (optional, name + type), Capacity mode (On-demand/Provisioned). Dispatch `CREATE_DYNAMO_TABLE` / `DELETE_DYNAMO_TABLE`.
- [ ] **Table detail** (`/dynamodb/:tableName`): Tabs: Overview, Items, Indexes (placeholder), Monitoring (placeholder), Tags. Overview: Table ARN, status, item count, size, key schema, billing mode. Items tab: table displaying 5-10 mock items as key-value rows (each item shown as JSON-like expandable row). "Create item" button opens JSON editor textarea. Dispatch `CREATE_DYNAMO_ITEM` / `DELETE_DYNAMO_ITEM`.
- [ ] **Data model**: Add `dynamodb: { tables: [...] }`. Seed: "Users" table (partitionKey: {name:"userId", type:"S"}, sortKey: {name:"email", type:"S"}, items: 5 mock user records, itemCount: 1500, sizeBytes: 2516582), "Orders" table (partitionKey: {name:"orderId", type:"S"}, sortKey: {name:"timestamp", type:"N"}, items: 5 mock order records, itemCount: 8500, sizeBytes: 15938355).
- [ ] **Reducer actions**: `CREATE_DYNAMO_TABLE`, `DELETE_DYNAMO_TABLE`, `CREATE_DYNAMO_ITEM`, `DELETE_DYNAMO_ITEM`.

### P2.4 -- SNS (`/sns`)

Add to SERVICE_CATEGORIES under new group "Application Integration". Icon: `Bell` (or `Megaphone`) from lucide-react. Color: `#E7157B`.

- [ ] **Routes**: `/sns`, `/sns/:topicName`.
- [ ] **Topics** (`/sns`): Table: Topic name, Type (Standard/FIFO), Subscriptions count, Display name, Created. "Create topic" form: Name, Type (Standard/FIFO), Display name. Dispatch `CREATE_SNS_TOPIC` / `DELETE_SNS_TOPIC`.
- [ ] **Topic detail** (`/sns/:topicName`): ARN display. Subscriptions table: Protocol (Email/SQS/Lambda/HTTP), Endpoint, Status (Confirmed/Pending). "Create subscription" button: Protocol dropdown, Endpoint input. "Publish message" button: Subject + Message textareas, shows success flash.
- [ ] **Data model**: Add `sns: { topics: [...] }`. Seed 2 topics: "order-notifications" (Standard, subscriptions: [{protocol:"email", endpoint:"admin@company.com", status:"Confirmed"}, {protocol:"sqs", endpoint:"arn:aws:sqs:us-east-1:123456789012:order-processing", status:"Confirmed"}, {protocol:"lambda", endpoint:"arn:aws:lambda:us-east-1:123456789012:function:process-order", status:"Confirmed"}]), "deployment-alerts" (Standard, subscriptions: [{protocol:"email", endpoint:"ops@company.com", status:"Confirmed"}, {protocol:"email", endpoint:"dev-lead@company.com", status:"Pending confirmation"}]).

### P2.5 -- SQS (`/sqs`)

Add to "Application Integration" group. Icon: `Inbox` from lucide-react. Color: `#E7157B`.

- [ ] **Routes**: `/sqs`, `/sqs/:queueName`.
- [ ] **Queues** (`/sqs`): Table: Queue name, Type (Standard/FIFO), URL, Messages available, Messages in flight, Created. "Create queue" form: Name, Type, Visibility timeout (0-43200 sec), Message retention (1-14 days), Max message size (1-256 KB). Dispatch `CREATE_SQS_QUEUE` / `DELETE_SQS_QUEUE`.
- [ ] **Queue detail** (`/sqs/:queueName`): Tabs: Details, Monitoring (placeholder), Lambda triggers (placeholder). Details: URL, ARN, Type, Visibility timeout, Retention period, Max size, Created. "Send message" button: opens textarea for message body, "Send" dispatches `SEND_SQS_MESSAGE` (increments messages available). "Poll for messages" button: shows 2-3 mock messages with ID, body preview, sent timestamp. "Delete message" removes from view.
- [ ] **Data model**: Add `sqs: { queues: [...] }`. Seed: "order-processing-queue" (Standard, visibilityTimeout: 30, retentionPeriod: 345600, maxMessageSize: 262144, messagesAvailable: 12, messagesInFlight: 3), "email-delivery-queue.fifo" (FIFO, messagesAvailable: 0, messagesInFlight: 0).

### P2.6 -- ECS (`/ecs`)

Add to SERVICE_CATEGORIES under new group "Containers". Icon: `Container` from lucide-react. Color: `#FF9900`.

- [ ] **SIDEBAR_CONFIG** for `/ecs`: Clusters, Task definitions.
- [ ] **Routes**: `/ecs`, `/ecs/:clusterName`, `/ecs/task-definitions`.
- [ ] **Clusters** (`/ecs`): Table: Cluster name, Status (ACTIVE -- green badge), Running tasks, Pending tasks, Services count, Container instances. "Create cluster" form: Name, Infrastructure (Fargate/EC2). Dispatch `CREATE_ECS_CLUSTER` / `DELETE_ECS_CLUSTER`.
- [ ] **Cluster detail** (`/ecs/:clusterName`): Tabs: Services, Tasks, Infrastructure, Tags. Services tab: mini-table of services (name, status, desired/running/pending counts, launch type). Tasks tab: running tasks list (Task ID, last status, launch type, started at).
- [ ] **Task definitions** (`/ecs/task-definitions`): Table: Family, Latest revision, Status (ACTIVE), Compatibilities (FARGATE, EC2), Created. Detail: container definitions table (Name, Image, CPU, Memory, Port mappings).
- [ ] **Data model**: Add `ecs: { clusters: [...], taskDefinitions: [...] }`. Seed: 1 cluster "web-app-cluster" (status: "ACTIVE", runningTasks: 2, pendingTasks: 0, services: [{name:"web-service", status:"ACTIVE", desiredCount:2, runningCount:2, launchType:"FARGATE"}], tasks: [{id:"task-abc123", status:"RUNNING", launchType:"FARGATE", startedAt:"2024-03-14T10:00:00Z"}]). 2 task definitions: "web-app" (revision 3, FARGATE, containers: [{name:"nginx", image:"nginx:latest", cpu:256, memory:512, portMappings:[{containerPort:80, protocol:"tcp"}]}]), "worker" (revision 2, FARGATE).

### P2.7 -- Route 53 (`/route53`)

Add to "Networking & Content Delivery" group. Icon: `Globe` from lucide-react. Color: `#8C4FFF`.

- [ ] **Routes**: `/route53`, `/route53/:zoneId`.
- [ ] **Hosted zones** (`/route53`): Table: Domain name, Type (Public/Private), Record count, Comment, Hosted zone ID. "Create hosted zone" form: Domain name, Type, Comment. Dispatch `CREATE_HOSTED_ZONE` / `DELETE_HOSTED_ZONE`.
- [ ] **Record sets** (`/route53/:zoneId`): Table: Record name, Type (A/AAAA/CNAME/MX/TXT/NS/SOA), Routing policy (Simple), Value/Route traffic to, TTL. "Create record" form: Record name, Type dropdown, Value, TTL. Dispatch `CREATE_DNS_RECORD` / `DELETE_DNS_RECORD`.
- [ ] **Data model**: Add `route53: { hostedZones: [...] }`. Seed: 1 zone "example.com" (type:"Public", id:"Z1234567890", records: [{name:"example.com", type:"NS", ttl:172800, value:"ns-1234.awsdns-12.co.uk"}, {name:"example.com", type:"SOA", ttl:900, value:"ns-1234.awsdns-12.co.uk. awsdns-hostmaster.amazon.com."}, {name:"www.example.com", type:"A", ttl:300, value:"54.123.45.67"}, {name:"api.example.com", type:"CNAME", ttl:300, value:"d1234567890.cloudfront.net"}, {name:"example.com", type:"MX", ttl:300, value:"10 mail.example.com"}, {name:"example.com", type:"TXT", ttl:300, value:"v=spf1 include:amazonses.com ~all"}]).

### P2.8 -- CloudFront (`/cloudfront`)

Add to "Networking & Content Delivery" group. Icon: `Cloud` from lucide-react. Color: `#8C4FFF`.

- [ ] **Routes**: `/cloudfront`, `/cloudfront/:distId`.
- [ ] **Distributions** (`/cloudfront`): Table: ID, Domain name, Origin domain, Status (Deployed/InProgress -- green/blue badge), State (Enabled), Last modified, Price class. "Create distribution" form: Origin domain name, Default cache behavior path, Price class, Comment. Dispatch `CREATE_CF_DISTRIBUTION` / `DELETE_CF_DISTRIBUTION`.
- [ ] **Distribution detail** (`/cloudfront/:distId`): Tabs: General, Origins, Behaviors (placeholder), Error pages (placeholder), Tags. General: ID, ARN, Domain name, Status, State, Last modified, Comment, Price class.
- [ ] **Data model**: Add `cloudfront: { distributions: [...] }`. Seed 1 distribution: {id:"E1A2B3C4D5E6F7", domainName:"d1234567890.cloudfront.net", originDomain:"my-app-assets-prod.s3.amazonaws.com", status:"Deployed", state:"Enabled", lastModified:"2024-02-28T11:00:00Z", priceClass:"PriceClass_100", comment:"Web app CDN"}.

---

## P3 -- Functional Improvements and Polish

### P3.1 -- EC2 Instance Detail Page

Currently clicking an instance name just selects it. Create a dedicated detail page.

- [ ] Create route `/ec2/instances/:instanceId` and `EC2InstanceDetail.jsx`. Tabs: Details, Security, Networking, Storage, Status checks, Monitoring, Tags.
- [ ] Details tab: 2-column grid showing ALL instance fields (same as current inline detail panel but on its own page).
- [ ] Monitoring tab: 6 mock metric charts using recharts (CPU Utilization, Network In, Network Out, Disk Read Ops, Disk Write Ops, Status Checks). Each chart is a simple line chart with 12 data points representing the last 12 hours, using random realistic values.
- [ ] Status checks tab: "Instance status check: Passed (green check)", "System status check: Passed (green check)".
- [ ] Link instance names and IDs in EC2 table to navigate to this page.

### P3.2 -- Security Group Detail and Inline Rule Editing

- [ ] Create route `/ec2/security-groups/:sgId` and `EC2SecurityGroupDetail.jsx`. Tabs: Inbound rules, Outbound rules, Tags.
- [ ] **Inbound rules tab**: Table showing current rules. "Edit inbound rules" button switches to edit mode where: each row has dropdowns for Protocol (TCP/UDP/ICMP/All traffic), Port range input, Source input, Description input. "Add rule" button appends blank row. "Save rules" button dispatches `UPDATE_SG_INBOUND_RULES`. "Cancel" reverts to read mode.
- [ ] **Outbound rules tab**: Same editing pattern as inbound.
- [ ] Add "Create security group" button on the SG list page with name, description, VPC selection. Navigate to detail page after creation.
- [ ] Link security group names in the table to the detail page.

### P3.3 -- Improved Global Search

- [ ] Expand search to ALL services (new ones from P2 included). Update ALL_SERVICES in Layout.jsx whenever new services are added.
- [ ] When search input is focused with empty query, show "Recently visited services" section (top 5 from `state.recentServices`).
- [ ] Add keyboard navigation: ArrowUp/ArrowDown moves highlight, Enter selects highlighted result, Escape closes dropdown.
- [ ] Match on service descriptions too (e.g., "database" matches RDS and DynamoDB).

### P3.4 -- Services Mega Menu Update

- [ ] Add all new services (CloudWatch, VPC, DynamoDB, SNS, SQS, ECS, Route 53, CloudFront) to SERVICE_CATEGORIES in Layout.jsx.
- [ ] Assign each new category and service an icon and color (per P2 specs).
- [ ] Add "Recently visited" row at top of mega menu with last 5 visited services as horizontal chips.

### P3.5 -- Reusable Pagination Component

- [ ] Create `src/components/Pagination.jsx`: Page size selector dropdown (10/25/50/100), Previous/Next buttons (blue secondary style), current page indicator ("Page 1 of 3"), "Showing X-Y of Z items" text. Props: `totalItems`, `pageSize`, `currentPage`, `onPageChange`, `onPageSizeChange`.
- [ ] Apply to all tables that can exceed 10 items: EC2 instances, S3 buckets, Lambda functions, RDS databases, IAM users/roles/groups/policies, CloudWatch alarms, DynamoDB tables, and all new tables from P1/P2.
- [ ] Default page size: 10.

### P3.6 -- Confirmation Dialogs for Destructive Actions

- [ ] Create reusable `ConfirmDeleteModal.jsx`: Warning icon, title ("Delete instance?"), explanation text, text input requiring exact resource name/ID to confirm, red "Delete" and gray "Cancel" buttons. Pattern matching S3's existing delete confirmation.
- [ ] Apply to: Terminate EC2 instance (type instance ID), Delete S3 bucket (type bucket name), Delete Lambda function (type function name), Delete RDS database (type db identifier), Delete IAM user (type username), Delete IAM role (type role name).

### P3.7 -- Reusable Tag Editor Component

- [ ] Create `src/components/TagEditor.jsx`: Table with Key/Value columns, "Add tag" button adding empty row, inline editing for key and value, "Remove" button per row, "Save tags" button. Props: `tags` (array of {Key, Value}), `onSave` callback.
- [ ] Replace read-only tag displays with this editable component in: EC2 instance detail (Tags tab), S3 bucket detail, Lambda function config (Tags tab), RDS detail (Tags tab), IAM user detail (Tags tab). Each save dispatches the appropriate update action.
- [ ] Add reducer cases: `UPDATE_INSTANCE_TAGS`, `UPDATE_BUCKET_TAGS`, `UPDATE_FUNCTION_TAGS`, `UPDATE_DB_TAGS`, `UPDATE_USER_TAGS`.

### P3.8 -- Refresh Button Functionality

- [ ] Every `<RefreshCw>` button currently does nothing. Add `onClick` handlers that: (1) add CSS class `animate-spin` to the icon for 600ms, (2) optionally show a brief "Refreshing..." flash message. After 600ms, remove the spin class. This provides visual feedback without changing data.

### P3.9 -- Dashboard Improvements

- [ ] Add "Build a solution" widget to the home dashboard: 4 cards ("Deploy a web application" -> /ec2, "Store files in the cloud" -> /s3, "Set up a database" -> /rds, "Configure networking" -> /vpc). Each card has an icon, title, description, and "Get started" link.
- [ ] Add "Trusted Advisor" widget: 5 mock recommendations: "MFA on root account" (green/passed), "Security groups unrestricted access" (yellow/warning, 1 SG), "Idle Load Balancers" (green/passed), "Under-utilized EC2 instances" (yellow/warning, 1 instance), "S3 bucket permissions" (green/passed).

---

## Data Seed Additions (add to getDefaultData())

All new data arrays should be added to the `getDefaultData()` function in `src/store/dataManager.js`. Each P1/P2 item above specifies what seed data is needed.

Summary of new top-level state keys to add:

- [ ] `volumes`: 6 entries (root volumes for each EC2 instance, matching instance AZs)
- [ ] `snapshots`: 3 entries
- [ ] `elasticIps`: 2 entries
- [ ] `launchTemplates`: 2 entries
- [ ] `loadBalancers`: 1 ALB entry
- [ ] `targetGroups`: 1 entry
- [ ] `autoScalingGroups`: 1 entry
- [ ] `s3AccessPoints`: 1 entry
- [ ] `s3BatchJobs`: 2 entries
- [ ] `lambdaLayers`: 1 entry
- [ ] `lambdaApplications`: 2 entries (read-only mock data)
- [ ] `rdsSnapshots`: 2 entries
- [ ] `rdsSubnetGroups`: 1 entry
- [ ] `rdsParameterGroups`: 3 entries (default.mysql8, default.postgres15, custom)
- [ ] Add `iam.identityProviders`: 1 entry
- [ ] Add `iam.accountSettings`: { minPasswordLength: 8, requireUppercase: true, requireLowercase: true, requireNumbers: true, requireSymbols: true, passwordExpiration: 90 }
- [ ] Add `billing.budgets`: 2 entries
- [ ] `cloudwatch`: per P2.1 spec
- [ ] `vpc`: per P2.2 spec
- [ ] `dynamodb`: per P2.3 spec
- [ ] `sns`: per P2.4 spec
- [ ] `sqs`: per P2.5 spec
- [ ] `ecs`: per P2.6 spec
- [ ] `route53`: per P2.7 spec
- [ ] `cloudfront`: per P2.8 spec
- [ ] `notifications`: Add 2 more: "CloudWatch alarm triggered: EC2-CPU-High" (warning, unread), "VPC Flow Log: Rejected connection from 198.51.100.0" (info, read).

## Reducer Action Additions (StoreContext.jsx)

- [ ] Add ALL reducer cases for every `Dispatch` action listed in P1 and P2 sections. Follow existing patterns (spread prev state, modify the relevant array, return newState). Approximate count: ~50 new action types.
- [ ] Every new action must produce observable state diffs in the `/go` endpoint.

---

## Out of Scope
- Authentication / login / logout (app starts pre-logged-in as "Admin User", account 1234-5678-9012)
- Real API calls to AWS services
- Actual file uploads (S3 upload is simulated with mock files)
- Real CloudWatch metrics data (use mock/static chart values)
- Cross-region resource replication
- AWS Organizations / multi-account management
- CloudFormation / Infrastructure as Code
- KMS / encryption key management
- AWS Config / compliance
- AWS CloudTrail / audit logging
