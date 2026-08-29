import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, BookOpen, ExternalLink } from 'lucide-react';

const DOCS = {
  'getting-started': {
    title: 'Getting Started with AWS',
    service: 'AWS',
    sections: [
      {
        heading: 'What is AWS?',
        body: 'Amazon Web Services (AWS) is the world\'s most comprehensive and broadly adopted cloud, offering over 200 fully featured services from data centers globally. Millions of customers—including the fastest-growing startups, largest enterprises, and leading government agencies—are using AWS to lower costs, become more agile, and innovate faster.',
      },
      {
        heading: 'Step 1: Create an AWS Account',
        body: 'To get started, sign up for an AWS account. You\'ll need a valid email address, a phone number, and a credit card. AWS offers a Free Tier so you can explore services without incurring costs.',
        code: '# Example: Install the AWS CLI\ncurl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"\nunzip awscliv2.zip\nsudo ./aws/install',
      },
      {
        heading: 'Step 2: Configure the AWS CLI',
        body: 'After installing the AWS CLI, configure it with your credentials. You\'ll need your Access Key ID and Secret Access Key from the IAM console.',
        code: '$ aws configure\nAWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE\nAWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\nDefault region name [None]: us-east-1\nDefault output format [None]: json',
      },
      {
        heading: 'Step 3: Launch Your First Resource',
        body: 'Now you\'re ready to launch your first AWS resource. Navigate to EC2 to launch a virtual server, S3 to store files, or Lambda to run serverless code.',
      },
    ],
  },
  'aws-documentation': {
    title: 'AWS Documentation',
    service: 'AWS',
    sections: [
      {
        heading: 'Overview',
        body: 'AWS Documentation contains user guides, API references, developer guides, tutorials, and more to help you use AWS products and services.',
      },
      {
        heading: 'Documentation by Service',
        body: 'Browse documentation organized by service category. Each service has a dedicated user guide, API reference, and CLI reference.',
        list: ['Compute: EC2, Lambda, ECS, EKS', 'Storage: S3, EBS, EFS, Glacier', 'Database: RDS, DynamoDB, ElastiCache, Redshift', 'Networking: VPC, Route 53, CloudFront, API Gateway', 'Security: IAM, KMS, Secrets Manager, WAF'],
      },
      {
        heading: 'SDK & Tools Documentation',
        body: 'AWS provides SDKs for many programming languages including Python (boto3), JavaScript, Java, Go, Ruby, .NET, and more. Find SDK documentation and code examples in each service\'s developer guide.',
      },
    ],
  },
  'aws-pricing': {
    title: 'AWS Pricing',
    service: 'AWS',
    sections: [
      {
        heading: 'How AWS Pricing Works',
        body: 'With AWS you pay only for the individual services you need, for as long as you use them, and without requiring long-term contracts or complex licensing. AWS pricing is similar to how you pay for utilities like water and electricity.',
      },
      {
        heading: 'Key Pricing Principles',
        body: 'AWS pricing is based on three key principles:',
        list: ['Pay as you go: Pay only for resources you actually use', 'Pay less when you reserve: Reserved Instances offer up to 75% savings', 'Pay even less per unit by using more: Volume discounts apply automatically'],
      },
      {
        heading: 'Free Tier',
        body: 'AWS offers a Free Tier to help you get hands-on experience with AWS services at no charge. The Free Tier includes offers that expire after 12 months, offers that never expire, and short-term free trials.',
      },
    ],
  },
  'aws-free-tier': {
    title: 'AWS Free Tier',
    service: 'AWS',
    sections: [
      {
        heading: 'What is the AWS Free Tier?',
        body: 'The AWS Free Tier enables you to gain free, hands-on experience with the AWS platform, products, and services. AWS Free Tier includes three types of offers: free trials, 12 months free, and always free.',
      },
      {
        heading: '12 Months Free Highlights',
        body: 'After signing up for AWS, the following services are free for 12 months:',
        list: ['Amazon EC2: 750 hours/month of t2.micro or t3.micro instances', 'Amazon S3: 5 GB of standard storage', 'Amazon RDS: 750 hours/month of db.t2.micro or db.t3.micro', 'Amazon CloudFront: 50 GB data transfer out', 'AWS Lambda: 1 million free requests per month (always free)'],
      },
      {
        heading: 'Always Free',
        body: 'These offers do not expire and are available to all AWS customers:',
        list: ['AWS Lambda: 1M requests and 400,000 GB-seconds compute/month', 'Amazon DynamoDB: 25 GB of storage', 'Amazon SNS: 1 million publishes', 'AWS CloudWatch: 10 custom metrics and 10 alarms'],
      },
    ],
  },
  'aws-support': {
    title: 'AWS Support',
    service: 'AWS',
    sections: [
      {
        heading: 'Support Plans',
        body: 'AWS Support offers four support plans tailored to different needs:',
        list: ['Basic: Free. Access to documentation, whitepapers, and support forums.', 'Developer: $29/month. Business hours email support, general guidance.', 'Business: $100/month. 24/7 phone/chat, production system impaired SLA.', 'Enterprise: $15,000/month. Technical Account Manager, 15-min SLA for critical issues.'],
      },
      {
        heading: 'Trusted Advisor',
        body: 'AWS Trusted Advisor is an online tool that provides real-time guidance to help you provision your resources following AWS best practices. Trusted Advisor checks help optimize your AWS infrastructure, increase security and performance, reduce overall costs, and monitor service limits.',
      },
      {
        heading: 'AWS Health Dashboard',
        body: 'The AWS Health Dashboard provides alerts and remediation guidance when AWS is experiencing events that may impact you. It gives you a personalized view into the performance and availability of the AWS services underlying your AWS resources.',
      },
    ],
  },
  'ec2-user-guide': {
    title: 'Amazon EC2 User Guide',
    service: 'EC2',
    sections: [
      {
        heading: 'What is Amazon EC2?',
        body: 'Amazon Elastic Compute Cloud (Amazon EC2) provides on-demand, scalable computing capacity in the Amazon Web Services (AWS) Cloud. Using Amazon EC2 reduces hardware costs so you can develop and deploy applications faster.',
      },
      {
        heading: 'Instance Lifecycle',
        body: 'An Amazon EC2 instance transitions through different states from the moment you launch it through to its termination.',
        list: ['Pending: The instance is preparing to enter the running state.', 'Running: The instance is running and ready for use.', 'Stopping: The instance is preparing to be stopped.', 'Stopped: The instance is shut down and can be restarted at any time.', 'Shutting-down: The instance is preparing to be terminated.', 'Terminated: The instance has been permanently deleted.'],
      },
      {
        heading: 'Connecting to Your Instance',
        body: 'You can connect to your Linux instance using SSH or EC2 Instance Connect. For Windows, use RDP.',
        code: '# Connect via SSH\nssh -i "your-key.pem" ec2-user@ec2-xx-xx-xx-xx.compute-1.amazonaws.com',
      },
    ],
  },
  'ec2-instance-types': {
    title: 'EC2 Instance Types',
    service: 'EC2',
    sections: [
      {
        heading: 'Overview',
        body: 'Amazon EC2 provides a wide selection of instance types optimized to fit different use cases. Instance types comprise varying combinations of CPU, memory, storage, and networking capacity.',
      },
      {
        heading: 'General Purpose',
        body: 'General purpose instances provide a balance of compute, memory, and networking resources.',
        list: ['t3/t4g: Burstable performance. Best for low-to-moderate CPU workloads.', 'm6i/m6g: Fixed performance. Ideal for web servers and code repositories.', 'mac1/mac2: macOS workloads for Xcode builds and testing.'],
      },
      {
        heading: 'Compute Optimized',
        body: 'Compute optimized instances are ideal for compute-bound applications.',
        list: ['c6i/c6g: High-performance web servers, scientific modeling', 'c5n: Network-intensive workloads up to 100 Gbps'],
      },
      {
        heading: 'Memory Optimized',
        body: 'Memory optimized instances deliver fast performance for workloads that process large data sets in memory.',
        list: ['r6i/r6g: In-memory databases, real-time big data analytics', 'x2idn/x2iedn: SAP HANA, in-memory databases', 'u-6tb1: Highest memory, up to 24 TB'],
      },
    ],
  },
  'ec2-security-groups-guide': {
    title: 'EC2 Security Groups',
    service: 'EC2',
    sections: [
      {
        heading: 'What are Security Groups?',
        body: 'A security group acts as a virtual firewall for your EC2 instances to control incoming and outgoing traffic. Inbound rules control the incoming traffic to your instance, and outbound rules control the outgoing traffic.',
      },
      {
        heading: 'Security Group Rules',
        body: 'Each rule specifies a protocol, port range, and source (for inbound) or destination (for outbound).',
        list: ['Protocol: TCP, UDP, ICMP, or All', 'Port range: Single port (e.g. 80) or range (e.g. 1024-65535)', 'Source/Destination: CIDR block, another security group, or prefix list'],
      },
      {
        heading: 'Best Practices',
        body: '',
        list: ['Use the principle of least privilege — open only the ports you need', 'Use separate security groups for different tiers (web, app, database)', 'Avoid using 0.0.0.0/0 for inbound SSH/RDP', 'Reference security groups instead of IP addresses where possible'],
      },
    ],
  },
  'ec2-key-pairs-guide': {
    title: 'EC2 Key Pairs',
    service: 'EC2',
    sections: [
      {
        heading: 'What are Key Pairs?',
        body: 'A key pair, consisting of a public key and a private key, is a set of security credentials that you use to prove your identity when connecting to an Amazon EC2 instance. Amazon EC2 stores the public key on your instance, and you store the private key.',
      },
      {
        heading: 'Creating a Key Pair',
        body: 'You can create a key pair using the AWS console, CLI, or SDK. When you create a key pair, the private key is downloaded automatically — store it safely.',
        code: '# Create a key pair via AWS CLI\naws ec2 create-key-pair \\\n  --key-name MyKeyPair \\\n  --query "KeyMaterial" \\\n  --output text > MyKeyPair.pem\n\nchmod 400 MyKeyPair.pem',
      },
      {
        heading: 'Supported Formats',
        body: '',
        list: ['RSA: 2048-bit RSA key, supported by all EC2 instance types', 'ED25519: Faster and smaller signature, not supported on Windows'],
      },
    ],
  },
  's3-user-guide': {
    title: 'Amazon S3 User Guide',
    service: 'S3',
    sections: [
      {
        heading: 'What is Amazon S3?',
        body: 'Amazon S3 (Simple Storage Service) is an object storage service that offers industry-leading scalability, data availability, security, and performance. You can store and retrieve any amount of data, at any time, from anywhere.',
      },
      {
        heading: 'Buckets and Objects',
        body: 'Amazon S3 stores data as objects within buckets. An object consists of a file and any metadata that describes that file. A bucket is a container for objects.',
        list: ['Bucket names are globally unique across all AWS accounts', 'Objects can be up to 5 TB in size', 'You can store an unlimited number of objects in a bucket', 'S3 is a key-value store; object keys are the full path'],
      },
      {
        heading: 'Storage Classes',
        body: '',
        list: ['S3 Standard: High availability, low latency. Default class.', 'S3 Intelligent-Tiering: Auto-moves objects between access tiers.', 'S3 Standard-IA: Infrequent access, lower cost, retrieval fee.', 'S3 Glacier: Archival, retrieval in minutes to hours.', 'S3 Glacier Deep Archive: Lowest cost, retrieval in 12+ hours.'],
      },
    ],
  },
  's3-bucket-policies': {
    title: 'S3 Bucket Policies',
    service: 'S3',
    sections: [
      {
        heading: 'Overview',
        body: 'Bucket policies are resource-based IAM policies that you can use to grant permissions to your Amazon S3 bucket and the objects in it. Bucket policies use JSON-based access policy language.',
      },
      {
        heading: 'Policy Structure',
        body: 'A bucket policy consists of a Version, an optional Id, and one or more Statement elements.',
        code: '{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Sid": "PublicReadGetObject",\n      "Effect": "Allow",\n      "Principal": "*",\n      "Action": "s3:GetObject",\n      "Resource": "arn:aws:s3:::my-bucket/*"\n    }\n  ]\n}',
      },
      {
        heading: 'Common Use Cases',
        body: '',
        list: ['Grant public read access to static website objects', 'Restrict access to specific IP addresses or VPCs', 'Require HTTPS-only access (deny HTTP)', 'Grant cross-account access to bucket contents'],
      },
    ],
  },
  's3-acls': {
    title: 'S3 Access Control Lists',
    service: 'S3',
    sections: [
      {
        heading: 'What are ACLs?',
        body: 'Amazon S3 access control lists (ACLs) enable you to manage access to buckets and objects. Each bucket and object has an ACL attached to it as a sub-resource. It defines which AWS accounts or groups are granted access and the type of access.',
      },
      {
        heading: 'Canned ACLs',
        body: 'Amazon S3 supports a set of predefined grants, known as canned ACLs:',
        list: ['private: Owner gets FULL_CONTROL. No one else has access.', 'public-read: Owner gets FULL_CONTROL. AllUsers group gets READ access.', 'public-read-write: Owner gets FULL_CONTROL. AllUsers group gets READ and WRITE.', 'authenticated-read: Owner gets FULL_CONTROL. AuthenticatedUsers get READ.', 'bucket-owner-read: Object owner gets FULL_CONTROL. Bucket owner gets READ.'],
      },
      {
        heading: 'ACLs vs Bucket Policies',
        body: 'AWS recommends using bucket policies over ACLs for most use cases. ACLs are a legacy access control mechanism that predates IAM. Bucket policies offer more granular control and are easier to audit.',
      },
    ],
  },
  's3-versioning': {
    title: 'S3 Versioning',
    service: 'S3',
    sections: [
      {
        heading: 'What is Versioning?',
        body: 'Versioning is a means of keeping multiple variants of an object in the same bucket. You can use versioning to preserve, retrieve, and restore every version of every object stored in your bucket.',
      },
      {
        heading: 'Enabling Versioning',
        body: 'You can enable versioning at the bucket level via the console, CLI, or SDK. Once enabled, versioning can be suspended but not disabled.',
        code: '# Enable versioning via AWS CLI\naws s3api put-bucket-versioning \\\n  --bucket my-bucket \\\n  --versioning-configuration Status=Enabled',
      },
      {
        heading: 'Version States',
        body: 'An S3 bucket can be in one of three states:',
        list: ['Unversioned (default): No version IDs are assigned to objects.', 'Versioning-enabled: Each object gets a unique version ID.', 'Versioning-suspended: New objects get a null version ID; existing versions are preserved.'],
      },
    ],
  },
  'lambda-developer-guide': {
    title: 'AWS Lambda Developer Guide',
    service: 'Lambda',
    sections: [
      {
        heading: 'What is AWS Lambda?',
        body: 'AWS Lambda is a compute service that lets you run code without provisioning or managing servers. Lambda runs your code on a high-availability compute infrastructure and performs all of the administration of the compute resources.',
      },
      {
        heading: 'Supported Runtimes',
        body: 'Lambda supports the following runtimes:',
        list: ['Node.js 18.x, 20.x', 'Python 3.9, 3.10, 3.11, 3.12', 'Java 11, 17, 21', 'Go 1.x', '.NET 6, 8', 'Ruby 3.2', 'Custom runtime via Lambda Runtime API'],
      },
      {
        heading: 'Execution Model',
        body: 'When your function is invoked, Lambda runs the handler method. The handler receives event data as the first argument and a context object as the second.',
        code: '# Python handler example\ndef handler(event, context):\n    print("Event:", event)\n    return {\n        "statusCode": 200,\n        "body": "Hello from Lambda!"\n    }',
      },
    ],
  },
  'lambda-function-config': {
    title: 'Lambda Function Configuration',
    service: 'Lambda',
    sections: [
      {
        heading: 'Memory and Timeout',
        body: 'You configure the amount of memory allocated to your Lambda function. Lambda allocates CPU power proportional to the memory. Timeout defines the maximum execution time (up to 15 minutes).',
        list: ['Memory: 128 MB to 10,240 MB in 1 MB increments', 'Timeout: 1 second to 900 seconds (15 minutes)', 'Ephemeral storage: 512 MB to 10,240 MB (/tmp)'],
      },
      {
        heading: 'Environment Variables',
        body: 'Environment variables let you store configuration settings and secrets outside your function code. Lambda encrypts environment variables at rest using AWS KMS.',
        code: '# Access environment variables in Python\nimport os\n\ndef handler(event, context):\n    db_host = os.environ["DB_HOST"]\n    api_key = os.environ["API_KEY"]',
      },
      {
        heading: 'Concurrency',
        body: '',
        list: ['Reserved concurrency: Guarantees a set number of concurrent executions', 'Provisioned concurrency: Pre-initializes execution environments to reduce cold starts', 'Account concurrency limit: 1,000 concurrent executions by default (can be raised)'],
      },
    ],
  },
  'lambda-triggers': {
    title: 'Lambda Triggers',
    service: 'Lambda',
    sections: [
      {
        heading: 'What are Triggers?',
        body: 'A trigger is a resource or configuration that invokes a Lambda function. Triggers can be AWS services, custom applications, or event source mappings.',
      },
      {
        heading: 'Supported Triggers',
        body: '',
        list: ['API Gateway: HTTP/REST/WebSocket APIs', 'S3: Object created, deleted, or replicated events', 'DynamoDB Streams: Table data change events', 'SQS: Messages in a queue', 'SNS: Published messages', 'EventBridge: Scheduled or event-driven invocations', 'Cognito: User pool triggers (pre-signup, post-confirm, etc.)'],
      },
      {
        heading: 'Invocation Types',
        body: '',
        list: ['Synchronous (RequestResponse): Caller waits for the response. Used by API Gateway.', 'Asynchronous (Event): Lambda queues the event and returns immediately. Used by S3, SNS.', 'Poll-based: Lambda polls a stream/queue. Used by SQS, DynamoDB Streams, Kinesis.'],
      },
    ],
  },
  'lambda-layers': {
    title: 'Lambda Layers',
    service: 'Lambda',
    sections: [
      {
        heading: 'What are Layers?',
        body: 'A Lambda layer is a .zip file archive that can contain additional code or data. Layers can contain library dependencies, a custom runtime, or configuration files. Using layers reduces the size of your deployment packages.',
      },
      {
        heading: 'Creating a Layer',
        body: 'Package your dependencies in a directory structure matching the runtime\'s expected path, zip it, and publish it as a layer.',
        code: '# Python example: create a layer with requests library\nmkdir -p python/lib/python3.11/site-packages\npip install requests -t python/lib/python3.11/site-packages/\nzip -r my-layer.zip python/\n\naws lambda publish-layer-version \\\n  --layer-name my-python-requests \\\n  --zip-file fileb://my-layer.zip \\\n  --compatible-runtimes python3.11',
      },
      {
        heading: 'Limits',
        body: '',
        list: ['Up to 5 layers per function', 'Total unzipped size of all layers and function code: 250 MB', 'Layers are versioned — each publish creates a new version'],
      },
    ],
  },
  'rds-user-guide': {
    title: 'Amazon RDS User Guide',
    service: 'RDS',
    sections: [
      {
        heading: 'What is Amazon RDS?',
        body: 'Amazon Relational Database Service (Amazon RDS) makes it easy to set up, operate, and scale a relational database in the cloud. It provides cost-efficient and resizable capacity while automating time-consuming administration tasks.',
      },
      {
        heading: 'Supported Engines',
        body: '',
        list: ['Amazon Aurora (MySQL/PostgreSQL compatible)', 'MySQL 5.7, 8.0', 'PostgreSQL 13, 14, 15, 16', 'MariaDB 10.6, 10.11', 'Oracle Database (SE2, EE)', 'Microsoft SQL Server (Express, Web, Standard, Enterprise)'],
      },
      {
        heading: 'Automated Backups',
        body: 'Amazon RDS automatically backs up your database and transaction logs. The backup retention period can be configured from 1 to 35 days. You can also take manual snapshots at any time.',
      },
    ],
  },
  'rds-instance-classes': {
    title: 'RDS DB Instance Classes',
    service: 'RDS',
    sections: [
      {
        heading: 'Instance Class Types',
        body: 'Amazon RDS supports three types of instance classes:',
        list: ['Standard: db.m5, db.m6g, db.m6i — Balanced compute, memory, and network', 'Memory Optimized: db.r5, db.r6g, db.r6i — High memory for large datasets', 'Burstable Performance: db.t3, db.t4g — Low-to-moderate workloads'],
      },
      {
        heading: 'Graviton-Based Instances',
        body: 'AWS Graviton-based instances (db.m6g, db.r6g, db.t4g) offer up to 35% performance improvement and up to 20% cost savings over comparable x86 instances.',
      },
      {
        heading: 'Choosing an Instance Class',
        body: '',
        list: ['Development/Test: db.t3.micro or db.t3.small', 'Small production: db.t3.medium or db.m5.large', 'Medium production: db.m5.xlarge or db.r5.large', 'Large production: db.r5.2xlarge or larger'],
      },
    ],
  },
  'rds-multi-az': {
    title: 'RDS Multi-AZ Deployments',
    service: 'RDS',
    sections: [
      {
        heading: 'What is Multi-AZ?',
        body: 'Amazon RDS Multi-AZ deployments provide enhanced availability and durability for RDS instances. When you provision a Multi-AZ DB instance, Amazon RDS automatically creates a primary DB instance and synchronously replicates the data to a standby instance in a different Availability Zone.',
      },
      {
        heading: 'Failover',
        body: 'In the event of a planned or unplanned outage of your DB instance, Amazon RDS automatically switches to a standby replica in another Availability Zone. Failover typically completes within 60-120 seconds.',
        list: ['No data loss due to synchronous replication', 'Automatic failover — no manual intervention required', 'DNS endpoint remains the same after failover'],
      },
      {
        heading: 'Multi-AZ vs Read Replicas',
        body: '',
        list: ['Multi-AZ: High availability (HA) — standby is not readable', 'Read Replicas: Read scaling — replicas are readable endpoints', 'Multi-AZ DB Cluster: Both HA and readable standbys (new feature)'],
      },
    ],
  },
  'rds-read-replicas': {
    title: 'RDS Read Replicas',
    service: 'RDS',
    sections: [
      {
        heading: 'What are Read Replicas?',
        body: 'Amazon RDS Read Replicas make it easy to elastically scale out beyond the capacity constraints of a single DB instance for read-heavy database workloads. You can create one or more replicas of a given source DB instance.',
      },
      {
        heading: 'Creating a Read Replica',
        body: 'You can create a Read Replica within the same region, or in a different region for cross-region replication. Read Replicas use asynchronous replication.',
        code: '# Create a read replica via AWS CLI\naws rds create-db-instance-read-replica \\\n  --db-instance-identifier mydb-replica \\\n  --source-db-instance-identifier mydb',
      },
      {
        heading: 'Promoting a Read Replica',
        body: 'You can promote a read replica to a standalone DB instance. This is useful for disaster recovery or to migrate a database. Promotion breaks replication permanently.',
      },
    ],
  },
  'iam-user-guide': {
    title: 'AWS IAM User Guide',
    service: 'IAM',
    sections: [
      {
        heading: 'What is IAM?',
        body: 'AWS Identity and Access Management (IAM) is a web service that helps you securely control access to AWS resources. With IAM, you can centrally manage permissions that control which AWS resources users can access.',
      },
      {
        heading: 'IAM Identities',
        body: '',
        list: ['Root user: Created when you first set up your AWS account. Has full access to all services.', 'IAM users: Individual people or applications that need access to AWS.', 'IAM groups: Collections of users that share the same permissions.', 'IAM roles: Temporary credentials for AWS services, applications, or federated users.'],
      },
      {
        heading: 'Authentication vs Authorization',
        body: 'IAM handles both authentication (who you are) and authorization (what you can do). Authentication uses credentials (password, access keys, MFA). Authorization uses policies attached to identities or resources.',
      },
    ],
  },
  'iam-policies': {
    title: 'IAM Policies and Permissions',
    service: 'IAM',
    sections: [
      {
        heading: 'What are IAM Policies?',
        body: 'Policies are JSON documents that define permissions. You attach policies to IAM identities (users, groups, roles) or AWS resources to grant or deny access.',
      },
      {
        heading: 'Policy Structure',
        body: 'A policy consists of one or more statements. Each statement includes an Effect, Action, and Resource.',
        code: '{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Action": [\n        "s3:GetObject",\n        "s3:PutObject"\n      ],\n      "Resource": "arn:aws:s3:::my-bucket/*"\n    }\n  ]\n}',
      },
      {
        heading: 'Policy Types',
        body: '',
        list: ['AWS managed policies: Created and maintained by AWS', 'Customer managed policies: Created and maintained by you', 'Inline policies: Embedded directly in a user, group, or role', 'Resource-based policies: Attached to resources (e.g. S3 bucket policies)'],
      },
    ],
  },
  'iam-roles-guide': {
    title: 'IAM Roles',
    service: 'IAM',
    sections: [
      {
        heading: 'What are IAM Roles?',
        body: 'An IAM role is an IAM identity with specific permissions. Unlike a user, a role does not have long-term credentials. Instead, it provides temporary security credentials when assumed.',
      },
      {
        heading: 'Common Use Cases',
        body: '',
        list: ['EC2 instance roles: Allow EC2 instances to call AWS services', 'Lambda execution roles: Allow Lambda functions to access AWS resources', 'Cross-account access: Allow users from another AWS account to access your resources', 'Federated access: Allow users authenticated by an external IdP to access AWS'],
      },
      {
        heading: 'Trust Policy',
        body: 'A trust policy defines which principals can assume the role. It\'s a resource-based policy attached to the role.',
        code: '{\n  "Version": "2012-10-17",\n  "Statement": [\n    {\n      "Effect": "Allow",\n      "Principal": { "Service": "ec2.amazonaws.com" },\n      "Action": "sts:AssumeRole"\n    }\n  ]\n}',
      },
    ],
  },
  'iam-best-practices': {
    title: 'IAM Best Practices',
    service: 'IAM',
    sections: [
      {
        heading: 'Key Best Practices',
        body: '',
        list: [
          'Lock away your AWS account root user access keys',
          'Create individual IAM users — never share credentials',
          'Use groups to assign permissions to IAM users',
          'Grant least privilege — start with minimum permissions',
          'Enable MFA for privileged users',
          'Use roles for applications running on EC2',
          'Use roles to delegate permissions to AWS services',
          'Do not share access keys — use IAM roles instead',
          'Rotate credentials regularly',
          'Remove unnecessary credentials and permissions',
          'Use policy conditions for extra security (IP, MFA, time)',
          'Monitor activity with AWS CloudTrail',
        ],
      },
      {
        heading: 'MFA (Multi-Factor Authentication)',
        body: 'Enable MFA for the root account and all privileged users. You can use virtual MFA apps (Google Authenticator, Authy), hardware MFA devices, or FIDO2 security keys.',
      },
    ],
  },
  'iam-access-analyzer': {
    title: 'IAM Access Analyzer',
    service: 'IAM',
    sections: [
      {
        heading: 'What is Access Analyzer?',
        body: 'AWS IAM Access Analyzer helps you identify resources in your organization and accounts that are shared with an external entity. It analyzes resource-based policies and generates findings when it identifies a policy that allows access to a principal outside your zone of trust.',
      },
      {
        heading: 'Supported Resource Types',
        body: '',
        list: ['Amazon S3 buckets', 'AWS IAM roles', 'AWS KMS keys', 'AWS Lambda functions and layers', 'Amazon SQS queues', 'AWS Secrets Manager secrets', 'Amazon SNS topics'],
      },
      {
        heading: 'Findings',
        body: 'When Access Analyzer finds a policy that grants access to an external principal, it generates a finding. Each finding includes details about the resource, the external principal, and the conditions that allow access. You can archive or resolve findings.',
      },
    ],
  },
  'billing-user-guide': {
    title: 'AWS Billing User Guide',
    service: 'Billing',
    sections: [
      {
        heading: 'Overview',
        body: 'AWS Billing and Cost Management is the service you use to pay your AWS bill, monitor your usage, and analyze and control your costs. The console provides a unified view of your AWS costs and usage.',
      },
      {
        heading: 'Understanding Your Bill',
        body: 'Your AWS bill shows charges for each service, grouped by region. You\'ll find line items for each service you\'ve used during the billing period.',
        list: ['Bills page: Detailed breakdown of charges by service', 'Cost Explorer: Visualize and analyze cost trends', 'Budgets: Set custom cost or usage budgets with alerts', 'Cost Allocation Tags: Tag resources to track costs by project or team'],
      },
      {
        heading: 'Payment Methods',
        body: 'AWS accepts credit/debit cards, ACH direct debit (US only), and invoicing (Enterprise customers). You can manage payment methods in the Billing console under Payment Methods.',
      },
    ],
  },
  'billing-budgets': {
    title: 'AWS Budgets',
    service: 'Billing',
    sections: [
      {
        heading: 'What are AWS Budgets?',
        body: 'AWS Budgets lets you set custom budgets to track your cost and usage. You can set alerts to notify you when your costs or usage exceed (or are forecasted to exceed) your budgeted amount.',
      },
      {
        heading: 'Budget Types',
        body: '',
        list: ['Cost budgets: Monitor spending against a dollar threshold', 'Usage budgets: Monitor service usage (e.g. EC2 instance-hours)', 'Savings Plans budgets: Track Savings Plans utilization and coverage', 'Reservation budgets: Track Reserved Instance utilization and coverage'],
      },
      {
        heading: 'Budget Alerts',
        body: 'You can configure up to 5 alert thresholds per budget. Alerts can be sent via email or SNS topic. Alert types: actual (already spent) or forecasted (predicted to spend).',
      },
    ],
  },
  'billing-cost-tags': {
    title: 'Cost Allocation Tags',
    service: 'Billing',
    sections: [
      {
        heading: 'What are Cost Allocation Tags?',
        body: 'A tag is a label that you assign to an AWS resource. Each tag consists of a key and an optional value. Cost allocation tags allow you to organize your resource costs on your cost allocation report.',
      },
      {
        heading: 'Tag Types',
        body: '',
        list: ['AWS-generated tags: Automatically applied by AWS (e.g. aws:createdBy)', 'User-defined tags: Tags you create and apply to your resources'],
      },
      {
        heading: 'Activating Tags',
        body: 'You must activate tags in the Billing console before they appear in your cost allocation report. Only activated tags are included in the report. There can be a 24-hour delay before new tags appear.',
        code: '# Tag a resource via AWS CLI\naws ec2 create-tags \\\n  --resources i-1234567890abcdef0 \\\n  --tags Key=Project,Value=MyApp Key=Environment,Value=Production',
      },
    ],
  },
  'pricing': {
    title: 'AWS Pricing',
    service: 'AWS',
    sections: [
      {
        heading: 'Pay-as-you-go',
        body: 'With AWS, you pay only for the individual services you need for as long as you use them. There are no long-term contracts required. Pricing is consumption-based — the more you use, the more you pay, but also the more you save per unit.',
      },
      {
        heading: 'Savings Plans & Reserved Instances',
        body: '',
        list: ['Reserved Instances: 1- or 3-year commitment, up to 72% savings vs On-Demand', 'Savings Plans: Flexible pricing model, up to 66% savings on compute', 'Spot Instances: Up to 90% savings for fault-tolerant workloads'],
      },
      {
        heading: 'Data Transfer Pricing',
        body: 'Data transfer in to AWS is free. Data transfer out is charged per GB. Data transfer between AWS services in the same region is generally free or low cost.',
      },
    ],
  },
};

export default function HelpDoc() {
  const { topic } = useParams();
  const navigate = useNavigate();
  const doc = DOCS[topic];

  if (!doc) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center text-aws-text-secondary">
        <BookOpen size={48} className="mx-auto mb-4 text-aws-text-disabled" />
        <h2 className="text-xl font-bold mb-2">Documentation not found</h2>
        <p className="text-sm mb-6">The requested help topic does not exist.</p>
        <button className="aws-btn aws-btn-primary" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        className="flex items-center gap-1 text-sm text-aws-blue hover:underline mb-4"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft size={14} /> Back
      </button>

      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-100 text-aws-orange border border-orange-200">
          {doc.service}
        </span>
        <span className="text-xs text-aws-text-disabled">Documentation</span>
      </div>

      <h1 className="text-2xl font-bold text-aws-text mb-6 border-b border-aws-border pb-4">
        {doc.title}
      </h1>

      <div className="space-y-8">
        {doc.sections.map((section, i) => (
          <div key={i}>
            <h2 className="text-lg font-bold text-aws-text mb-2">{section.heading}</h2>
            {section.body && (
              <p className="text-sm text-aws-text-secondary leading-relaxed mb-3">{section.body}</p>
            )}
            {section.list && (
              <ul className="space-y-1 ml-4">
                {section.list.map((item, j) => (
                  <li key={j} className="text-sm text-aws-text-secondary flex gap-2">
                    <span className="text-aws-orange mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            {section.code && (
              <pre className="mt-3 bg-gray-900 text-green-400 text-xs p-4 overflow-x-auto leading-relaxed" style={{ borderRadius: 2, fontFamily: 'monospace' }}>
                {section.code}
              </pre>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-aws-border flex items-center gap-2 text-xs text-aws-text-disabled">
        <ExternalLink size={12} />
        <span>This is a local sandbox reference — see aws.amazon.com for full documentation.</span>
      </div>
    </div>
  );
}
