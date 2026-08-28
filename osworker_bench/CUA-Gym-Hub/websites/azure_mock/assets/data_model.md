# Xzure Portal Mock — Data Model

This document defines all entity types, their fields, relationships, and example seed data for `dataManager.js`.

---

## Entity Hierarchy

```
currentUser (singleton)
tenant (singleton)
  └── subscriptions[]
       └── resourceGroups[]
            └── resources (VMs, Storage Accounts, etc.)
```

---

## 1. Current User (singleton)

| Field | Type | Example |
|-------|------|---------|
| id | string | `"user-001"` |
| displayName | string | `"Alex Johnson"` |
| email | string | `"alex.johnson@contoso.com"` |
| avatarUrl | string | `null` (use initials) |
| directoryName | string | `"Contoso"` |
| directoryId | string | `"tenant-contoso-001"` |

---

## 2. Tenant (singleton)

| Field | Type | Example |
|-------|------|---------|
| id | string | `"tenant-contoso-001"` |
| displayName | string | `"Contoso"` |
| domain | string | `"contoso.onmicrosoft.com"` |
| tenantId | string | `"72f988bf-86f1-41af-91ab-2d7cd011db47"` |

---

## 3. Subscriptions

| Field | Type | Example |
|-------|------|---------|
| id | string | `"sub-001"` |
| subscriptionId | string | `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"` |
| displayName | string | `"Pay-As-You-Go"` |
| state | string | `"Enabled"` |
| tenantId | string | `"tenant-contoso-001"` |
| spendingLimit | string | `"Off"` |

**Seed data**: 1 subscription
```js
{
  id: "sub-001",
  subscriptionId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  displayName: "Pay-As-You-Go",
  state: "Enabled",
  tenantId: "tenant-contoso-001",
  spendingLimit: "Off"
}
```

---

## 4. Resource Groups

| Field | Type | Example |
|-------|------|---------|
| id | string | `"rg-001"` |
| name | string | `"rg-web-prod"` |
| subscriptionId | string | `"sub-001"` |
| location | string | `"East US"` |
| tags | object | `{ environment: "production", team: "web" }` |
| provisioningState | string | `"Succeeded"` |
| createdDate | string (ISO) | `"2024-06-15T10:30:00Z"` |

**Seed data**: 3 resource groups
```js
[
  {
    id: "rg-001",
    name: "rg-web-prod",
    subscriptionId: "sub-001",
    location: "East US",
    tags: { environment: "production", team: "web" },
    provisioningState: "Succeeded",
    createdDate: "2024-06-15T10:30:00Z"
  },
  {
    id: "rg-002",
    name: "rg-data-dev",
    subscriptionId: "sub-001",
    location: "West US 2",
    tags: { environment: "development", team: "data" },
    provisioningState: "Succeeded",
    createdDate: "2024-08-20T14:00:00Z"
  },
  {
    id: "rg-003",
    name: "rg-networking",
    subscriptionId: "sub-001",
    location: "East US",
    tags: { environment: "production", team: "infrastructure" },
    provisioningState: "Succeeded",
    createdDate: "2024-05-10T08:15:00Z"
  }
]
```

---

## 5. Virtual Machines

| Field | Type | Example |
|-------|------|---------|
| id | string | `"vm-001"` |
| name | string | `"vm-web-server-01"` |
| resourceGroup | string | `"rg-web-prod"` |
| subscriptionId | string | `"sub-001"` |
| location | string | `"East US"` |
| status | string | `"Running"` / `"Stopped"` / `"Deallocated"` |
| powerState | string | `"VM running"` / `"VM deallocated"` |
| size | string | `"Standard_DS2_v2"` |
| osType | string | `"Linux"` / `"Windows"` |
| osImage | string | `"Ubuntu Server 22.04 LTS"` |
| publicIpAddress | string \| null | `"52.168.100.45"` |
| privateIpAddress | string | `"10.0.1.4"` |
| virtualNetwork | string | `"vnet-web-prod"` |
| subnet | string | `"default"` |
| networkSecurityGroup | string | `"nsg-web-prod"` |
| osDiskSizeGb | number | `30` |
| osDiskType | string | `"Premium SSD"` |
| computerName | string | `"vm-web-server-01"` |
| adminUsername | string | `"azureuser"` |
| tags | object | `{ role: "webserver", env: "prod" }` |
| createdDate | string (ISO) | `"2024-07-01T09:00:00Z"` |

**Seed data**: 4 VMs
```js
[
  {
    id: "vm-001",
    name: "vm-web-server-01",
    resourceGroup: "rg-web-prod",
    subscriptionId: "sub-001",
    location: "East US",
    status: "Running",
    powerState: "VM running",
    size: "Standard_DS2_v2",
    osType: "Linux",
    osImage: "Ubuntu Server 22.04 LTS",
    publicIpAddress: "52.168.100.45",
    privateIpAddress: "10.0.1.4",
    virtualNetwork: "vnet-web-prod",
    subnet: "default",
    networkSecurityGroup: "nsg-web-prod",
    osDiskSizeGb: 30,
    osDiskType: "Premium SSD",
    computerName: "vm-web-server-01",
    adminUsername: "azureuser",
    tags: { role: "webserver", env: "prod" },
    createdDate: "2024-07-01T09:00:00Z"
  },
  {
    id: "vm-002",
    name: "vm-web-server-02",
    resourceGroup: "rg-web-prod",
    subscriptionId: "sub-001",
    location: "East US",
    status: "Running",
    powerState: "VM running",
    size: "Standard_DS2_v2",
    osType: "Linux",
    osImage: "Ubuntu Server 22.04 LTS",
    publicIpAddress: "52.168.100.46",
    privateIpAddress: "10.0.1.5",
    virtualNetwork: "vnet-web-prod",
    subnet: "default",
    networkSecurityGroup: "nsg-web-prod",
    osDiskSizeGb: 30,
    osDiskType: "Premium SSD",
    computerName: "vm-web-server-02",
    adminUsername: "azureuser",
    tags: { role: "webserver", env: "prod" },
    createdDate: "2024-07-01T09:15:00Z"
  },
  {
    id: "vm-003",
    name: "vm-db-primary",
    resourceGroup: "rg-data-dev",
    subscriptionId: "sub-001",
    location: "West US 2",
    status: "Running",
    powerState: "VM running",
    size: "Standard_E4s_v3",
    osType: "Linux",
    osImage: "Ubuntu Server 20.04 LTS",
    publicIpAddress: null,
    privateIpAddress: "10.1.1.4",
    virtualNetwork: "vnet-data-dev",
    subnet: "db-subnet",
    networkSecurityGroup: "nsg-data-dev",
    osDiskSizeGb: 64,
    osDiskType: "Premium SSD",
    computerName: "vm-db-primary",
    adminUsername: "azureuser",
    tags: { role: "database", env: "dev" },
    createdDate: "2024-08-25T11:30:00Z"
  },
  {
    id: "vm-004",
    name: "vm-jumpbox",
    resourceGroup: "rg-networking",
    subscriptionId: "sub-001",
    location: "East US",
    status: "Stopped",
    powerState: "VM deallocated",
    size: "Standard_B1s",
    osType: "Windows",
    osImage: "Windows Server 2022 Datacenter",
    publicIpAddress: "52.168.100.99",
    privateIpAddress: "10.0.0.4",
    virtualNetwork: "vnet-web-prod",
    subnet: "management",
    networkSecurityGroup: "nsg-management",
    osDiskSizeGb: 128,
    osDiskType: "Standard SSD",
    computerName: "vm-jumpbox",
    adminUsername: "adminuser",
    tags: { role: "management", env: "prod" },
    createdDate: "2024-06-20T16:00:00Z"
  }
]
```

---

## 6. Storage Accounts

| Field | Type | Example |
|-------|------|---------|
| id | string | `"sa-001"` |
| name | string | `"contosowebprod"` |
| resourceGroup | string | `"rg-web-prod"` |
| subscriptionId | string | `"sub-001"` |
| location | string | `"East US"` |
| kind | string | `"StorageV2"` |
| performance | string | `"Standard"` / `"Premium"` |
| replication | string | `"LRS"` / `"GRS"` / `"RA-GRS"` / `"ZRS"` |
| accessTier | string | `"Hot"` / `"Cool"` |
| status | string | `"Available"` |
| primaryEndpoint | string | `"https://contosowebprod.blob.core.windows.net"` |
| createdDate | string (ISO) | `"2024-06-16T12:00:00Z"` |
| tags | object | `{ purpose: "web-assets" }` |
| containers | array | See Containers sub-entity |

### Containers (nested in Storage Account)

| Field | Type | Example |
|-------|------|---------|
| id | string | `"container-001"` |
| name | string | `"images"` |
| publicAccessLevel | string | `"Private"` / `"Blob"` / `"Container"` |
| leaseState | string | `"Available"` |
| lastModified | string (ISO) | `"2024-11-15T08:00:00Z"` |
| blobCount | number | `156` |

**Seed data**: 2 storage accounts
```js
[
  {
    id: "sa-001",
    name: "contosowebprod",
    resourceGroup: "rg-web-prod",
    subscriptionId: "sub-001",
    location: "East US",
    kind: "StorageV2",
    performance: "Standard",
    replication: "LRS",
    accessTier: "Hot",
    status: "Available",
    primaryEndpoint: "https://contosowebprod.blob.core.windows.net",
    createdDate: "2024-06-16T12:00:00Z",
    tags: { purpose: "web-assets" },
    containers: [
      { id: "container-001", name: "images", publicAccessLevel: "Blob", leaseState: "Available", lastModified: "2024-11-15T08:00:00Z", blobCount: 156 },
      { id: "container-002", name: "documents", publicAccessLevel: "Private", leaseState: "Available", lastModified: "2024-10-20T14:30:00Z", blobCount: 42 },
      { id: "container-003", name: "backups", publicAccessLevel: "Private", leaseState: "Available", lastModified: "2024-12-01T03:00:00Z", blobCount: 8 }
    ]
  },
  {
    id: "sa-002",
    name: "contosodatadev",
    resourceGroup: "rg-data-dev",
    subscriptionId: "sub-001",
    location: "West US 2",
    kind: "StorageV2",
    performance: "Standard",
    replication: "GRS",
    accessTier: "Hot",
    status: "Available",
    primaryEndpoint: "https://contosodatadev.blob.core.windows.net",
    createdDate: "2024-08-21T09:00:00Z",
    tags: { purpose: "data-lake", environment: "dev" },
    containers: [
      { id: "container-004", name: "raw-data", publicAccessLevel: "Private", leaseState: "Available", lastModified: "2024-11-28T21:00:00Z", blobCount: 1250 },
      { id: "container-005", name: "processed", publicAccessLevel: "Private", leaseState: "Available", lastModified: "2024-11-29T06:00:00Z", blobCount: 890 }
    ]
  }
]
```

---

## 7. Virtual Networks

| Field | Type | Example |
|-------|------|---------|
| id | string | `"vnet-001"` |
| name | string | `"vnet-web-prod"` |
| resourceGroup | string | `"rg-web-prod"` |
| subscriptionId | string | `"sub-001"` |
| location | string | `"East US"` |
| addressSpace | string | `"10.0.0.0/16"` |
| status | string | `"Succeeded"` |
| subnets | array | See Subnets sub-entity |
| tags | object | `{}` |
| createdDate | string (ISO) | `"2024-06-15T10:45:00Z"` |

### Subnets (nested)

| Field | Type | Example |
|-------|------|---------|
| id | string | `"subnet-001"` |
| name | string | `"default"` |
| addressPrefix | string | `"10.0.1.0/24"` |
| connectedDevices | number | `2` |
| networkSecurityGroup | string \| null | `"nsg-web-prod"` |

**Seed data**: 2 VNets
```js
[
  {
    id: "vnet-001",
    name: "vnet-web-prod",
    resourceGroup: "rg-web-prod",
    subscriptionId: "sub-001",
    location: "East US",
    addressSpace: "10.0.0.0/16",
    status: "Succeeded",
    subnets: [
      { id: "subnet-001", name: "default", addressPrefix: "10.0.1.0/24", connectedDevices: 2, networkSecurityGroup: "nsg-web-prod" },
      { id: "subnet-002", name: "management", addressPrefix: "10.0.0.0/24", connectedDevices: 1, networkSecurityGroup: "nsg-management" }
    ],
    tags: {},
    createdDate: "2024-06-15T10:45:00Z"
  },
  {
    id: "vnet-002",
    name: "vnet-data-dev",
    resourceGroup: "rg-data-dev",
    subscriptionId: "sub-001",
    location: "West US 2",
    addressSpace: "10.1.0.0/16",
    status: "Succeeded",
    subnets: [
      { id: "subnet-003", name: "db-subnet", addressPrefix: "10.1.1.0/24", connectedDevices: 1, networkSecurityGroup: "nsg-data-dev" }
    ],
    tags: { environment: "dev" },
    createdDate: "2024-08-20T14:30:00Z"
  }
]
```

---

## 8. Network Security Groups

| Field | Type | Example |
|-------|------|---------|
| id | string | `"nsg-001"` |
| name | string | `"nsg-web-prod"` |
| resourceGroup | string | `"rg-web-prod"` |
| subscriptionId | string | `"sub-001"` |
| location | string | `"East US"` |
| inboundRules | array | See rules |
| outboundRules | array | See rules |
| tags | object | `{}` |
| createdDate | string (ISO) | `"2024-06-15T11:00:00Z"` |

### Security Rules

| Field | Type | Example |
|-------|------|---------|
| name | string | `"AllowSSH"` |
| priority | number | `100` |
| direction | string | `"Inbound"` |
| access | string | `"Allow"` / `"Deny"` |
| protocol | string | `"TCP"` / `"UDP"` / `"*"` |
| sourcePortRange | string | `"*"` |
| destinationPortRange | string | `"22"` |
| sourceAddressPrefix | string | `"*"` |
| destinationAddressPrefix | string | `"*"` |
| description | string | `"Allow SSH access"` |

**Seed data**: 3 NSGs
```js
[
  {
    id: "nsg-001",
    name: "nsg-web-prod",
    resourceGroup: "rg-web-prod",
    subscriptionId: "sub-001",
    location: "East US",
    inboundRules: [
      { name: "AllowHTTP", priority: 100, direction: "Inbound", access: "Allow", protocol: "TCP", sourcePortRange: "*", destinationPortRange: "80", sourceAddressPrefix: "*", destinationAddressPrefix: "*", description: "Allow HTTP" },
      { name: "AllowHTTPS", priority: 110, direction: "Inbound", access: "Allow", protocol: "TCP", sourcePortRange: "*", destinationPortRange: "443", sourceAddressPrefix: "*", destinationAddressPrefix: "*", description: "Allow HTTPS" },
      { name: "AllowSSH", priority: 120, direction: "Inbound", access: "Allow", protocol: "TCP", sourcePortRange: "*", destinationPortRange: "22", sourceAddressPrefix: "10.0.0.0/24", destinationAddressPrefix: "*", description: "Allow SSH from management subnet" },
      { name: "DenyAllInbound", priority: 4096, direction: "Inbound", access: "Deny", protocol: "*", sourcePortRange: "*", destinationPortRange: "*", sourceAddressPrefix: "*", destinationAddressPrefix: "*", description: "Deny all other inbound" }
    ],
    outboundRules: [
      { name: "AllowAllOutbound", priority: 100, direction: "Outbound", access: "Allow", protocol: "*", sourcePortRange: "*", destinationPortRange: "*", sourceAddressPrefix: "*", destinationAddressPrefix: "*", description: "Allow all outbound" }
    ],
    tags: {},
    createdDate: "2024-06-15T11:00:00Z"
  },
  {
    id: "nsg-002",
    name: "nsg-data-dev",
    resourceGroup: "rg-data-dev",
    subscriptionId: "sub-001",
    location: "West US 2",
    inboundRules: [
      { name: "AllowPostgreSQL", priority: 100, direction: "Inbound", access: "Allow", protocol: "TCP", sourcePortRange: "*", destinationPortRange: "5432", sourceAddressPrefix: "10.1.0.0/16", destinationAddressPrefix: "*", description: "Allow PostgreSQL from VNet" },
      { name: "AllowSSH", priority: 110, direction: "Inbound", access: "Allow", protocol: "TCP", sourcePortRange: "*", destinationPortRange: "22", sourceAddressPrefix: "10.0.0.0/24", destinationAddressPrefix: "*", description: "Allow SSH from management" },
      { name: "DenyAllInbound", priority: 4096, direction: "Inbound", access: "Deny", protocol: "*", sourcePortRange: "*", destinationPortRange: "*", sourceAddressPrefix: "*", destinationAddressPrefix: "*", description: "Deny all" }
    ],
    outboundRules: [
      { name: "AllowAllOutbound", priority: 100, direction: "Outbound", access: "Allow", protocol: "*", sourcePortRange: "*", destinationPortRange: "*", sourceAddressPrefix: "*", destinationAddressPrefix: "*", description: "Allow all outbound" }
    ],
    tags: {},
    createdDate: "2024-08-20T15:00:00Z"
  },
  {
    id: "nsg-003",
    name: "nsg-management",
    resourceGroup: "rg-networking",
    subscriptionId: "sub-001",
    location: "East US",
    inboundRules: [
      { name: "AllowRDP", priority: 100, direction: "Inbound", access: "Allow", protocol: "TCP", sourcePortRange: "*", destinationPortRange: "3389", sourceAddressPrefix: "203.0.113.0/24", destinationAddressPrefix: "*", description: "Allow RDP from corporate network" },
      { name: "DenyAllInbound", priority: 4096, direction: "Inbound", access: "Deny", protocol: "*", sourcePortRange: "*", destinationPortRange: "*", sourceAddressPrefix: "*", destinationAddressPrefix: "*", description: "Deny all" }
    ],
    outboundRules: [
      { name: "AllowAllOutbound", priority: 100, direction: "Outbound", access: "Allow", protocol: "*", sourcePortRange: "*", destinationPortRange: "*", sourceAddressPrefix: "*", destinationAddressPrefix: "*", description: "Allow all outbound" }
    ],
    tags: {},
    createdDate: "2024-05-10T08:30:00Z"
  }
]
```

---

## 9. App Services (Web Apps)

| Field | Type | Example |
|-------|------|---------|
| id | string | `"app-001"` |
| name | string | `"contoso-web-app"` |
| resourceGroup | string | `"rg-web-prod"` |
| subscriptionId | string | `"sub-001"` |
| location | string | `"East US"` |
| status | string | `"Running"` |
| kind | string | `"app"` / `"functionapp"` |
| defaultHostName | string | `"contoso-web-app.azurewebsites.net"` |
| appServicePlan | string | `"asp-web-prod"` |
| runtime | string | `"Node.js 18 LTS"` |
| httpsOnly | boolean | `true` |
| tags | object | `{}` |
| createdDate | string (ISO) | `"2024-07-10T13:00:00Z"` |

**Seed data**: 2 web apps
```js
[
  {
    id: "app-001",
    name: "contoso-web-app",
    resourceGroup: "rg-web-prod",
    subscriptionId: "sub-001",
    location: "East US",
    status: "Running",
    kind: "app",
    defaultHostName: "contoso-web-app.azurewebsites.net",
    appServicePlan: "asp-web-prod",
    runtime: "Node.js 18 LTS",
    httpsOnly: true,
    tags: { app: "frontend" },
    createdDate: "2024-07-10T13:00:00Z"
  },
  {
    id: "app-002",
    name: "contoso-api",
    resourceGroup: "rg-web-prod",
    subscriptionId: "sub-001",
    location: "East US",
    status: "Running",
    kind: "app",
    defaultHostName: "contoso-api.azurewebsites.net",
    appServicePlan: "asp-web-prod",
    runtime: "Python 3.11",
    httpsOnly: true,
    tags: { app: "backend-api" },
    createdDate: "2024-07-10T14:00:00Z"
  }
]
```

---

## 10. SQL Databases

| Field | Type | Example |
|-------|------|---------|
| id | string | `"sqldb-001"` |
| name | string | `"contoso-db"` |
| resourceGroup | string | `"rg-data-dev"` |
| subscriptionId | string | `"sub-001"` |
| location | string | `"West US 2"` |
| serverName | string | `"contoso-sql-server"` |
| status | string | `"Online"` |
| pricingTier | string | `"Basic"` / `"Standard S0"` / `"Premium P1"` |
| maxSizeGb | number | `2` |
| collation | string | `"SQL_Latin1_General_CP1_CI_AS"` |
| tags | object | `{}` |
| createdDate | string (ISO) | `"2024-08-25T12:00:00Z"` |

**Seed data**: 1 database
```js
[
  {
    id: "sqldb-001",
    name: "contoso-db",
    resourceGroup: "rg-data-dev",
    subscriptionId: "sub-001",
    location: "West US 2",
    serverName: "contoso-sql-server",
    status: "Online",
    pricingTier: "Standard S0",
    maxSizeGb: 250,
    collation: "SQL_Latin1_General_CP1_CI_AS",
    tags: { environment: "dev" },
    createdDate: "2024-08-25T12:00:00Z"
  }
]
```

---

## 11. Cost / Billing

| Field | Type | Example |
|-------|------|---------|
| currentMonthCost | number | `487.23` |
| forecastedCost | number | `612.50` |
| budgetAmount | number | `800.00` |
| currency | string | `"USD"` |
| costByService | array | See below |
| costByResourceGroup | array | See below |
| costByLocation | array | See below |
| invoices | array | See below |

### Cost by Service

| Field | Type | Example |
|-------|------|---------|
| service | string | `"Virtual Machines"` |
| cost | number | `245.80` |
| percentage | number | `50.4` |

### Invoices

| Field | Type | Example |
|-------|------|---------|
| id | string | `"inv-001"` |
| period | string | `"November 2024"` |
| amount | number | `523.45` |
| status | string | `"Paid"` / `"Due"` |
| dueDate | string (ISO) | `"2024-12-15"` |

**Seed data**:
```js
{
  currentMonthCost: 487.23,
  forecastedCost: 612.50,
  budgetAmount: 800.00,
  currency: "USD",
  costByService: [
    { service: "Virtual Machines", cost: 245.80, percentage: 50.4 },
    { service: "Storage", cost: 82.15, percentage: 16.9 },
    { service: "App Service", cost: 65.00, percentage: 13.3 },
    { service: "SQL Database", cost: 45.28, percentage: 9.3 },
    { service: "Bandwidth", cost: 28.50, percentage: 5.9 },
    { service: "Other", cost: 20.50, percentage: 4.2 }
  ],
  costByResourceGroup: [
    { resourceGroup: "rg-web-prod", cost: 340.80 },
    { resourceGroup: "rg-data-dev", cost: 118.43 },
    { resourceGroup: "rg-networking", cost: 28.00 }
  ],
  costByLocation: [
    { location: "East US", cost: 368.80 },
    { location: "West US 2", cost: 118.43 }
  ],
  dailyCosts: [
    { date: "2024-12-01", cost: 16.24 },
    { date: "2024-12-02", cost: 16.24 },
    { date: "2024-12-03", cost: 16.24 },
    { date: "2024-12-04", cost: 16.30 },
    { date: "2024-12-05", cost: 16.24 },
    { date: "2024-12-06", cost: 16.50 },
    { date: "2024-12-07", cost: 16.24 },
    { date: "2024-12-08", cost: 16.24 },
    { date: "2024-12-09", cost: 16.40 },
    { date: "2024-12-10", cost: 16.24 },
    { date: "2024-12-11", cost: 16.35 },
    { date: "2024-12-12", cost: 16.24 },
    { date: "2024-12-13", cost: 16.24 },
    { date: "2024-12-14", cost: 16.50 },
    { date: "2024-12-15", cost: 16.24 }
  ],
  budgets: [
    { id: "budget-001", name: "Monthly-Total", amount: 800, timeGrain: "Monthly", currentSpend: 487.23, status: "OK" }
  ],
  invoices: [
    { id: "inv-001", period: "November 2024", amount: 523.45, status: "Paid", dueDate: "2024-12-15" },
    { id: "inv-002", period: "October 2024", amount: 498.12, status: "Paid", dueDate: "2024-11-15" },
    { id: "inv-003", period: "September 2024", amount: 475.88, status: "Paid", dueDate: "2024-10-15" }
  ]
}
```

---

## 12. Activity Log

| Field | Type | Example |
|-------|------|---------|
| id | string | `"event-001"` |
| timestamp | string (ISO) | `"2024-12-14T15:30:00Z"` |
| operation | string | `"Microsoft.Compute/virtualMachines/start/action"` |
| operationName | string | `"Start Virtual Machine"` |
| status | string | `"Succeeded"` / `"Failed"` |
| level | string | `"Informational"` / `"Warning"` / `"Error"` |
| resourceGroup | string | `"rg-web-prod"` |
| resourceName | string | `"vm-web-server-01"` |
| resourceType | string | `"Microsoft.Compute/virtualMachines"` |
| initiatedBy | string | `"alex.johnson@contoso.com"` |

**Seed data**: 8 recent activity events
```js
[
  { id: "event-001", timestamp: "2024-12-14T15:30:00Z", operation: "Microsoft.Compute/virtualMachines/start/action", operationName: "Start Virtual Machine", status: "Succeeded", level: "Informational", resourceGroup: "rg-web-prod", resourceName: "vm-web-server-01", resourceType: "Microsoft.Compute/virtualMachines", initiatedBy: "alex.johnson@contoso.com" },
  { id: "event-002", timestamp: "2024-12-14T14:00:00Z", operation: "Microsoft.Compute/virtualMachines/deallocate/action", operationName: "Deallocate Virtual Machine", status: "Succeeded", level: "Informational", resourceGroup: "rg-networking", resourceName: "vm-jumpbox", resourceType: "Microsoft.Compute/virtualMachines", initiatedBy: "alex.johnson@contoso.com" },
  { id: "event-003", timestamp: "2024-12-14T12:15:00Z", operation: "Microsoft.Storage/storageAccounts/write", operationName: "Create/Update Storage Account", status: "Succeeded", level: "Informational", resourceGroup: "rg-data-dev", resourceName: "contosodatadev", resourceType: "Microsoft.Storage/storageAccounts", initiatedBy: "alex.johnson@contoso.com" },
  { id: "event-004", timestamp: "2024-12-13T09:00:00Z", operation: "Microsoft.Network/networkSecurityGroups/securityRules/write", operationName: "Create/Update Security Rule", status: "Succeeded", level: "Informational", resourceGroup: "rg-web-prod", resourceName: "nsg-web-prod", resourceType: "Microsoft.Network/networkSecurityGroups", initiatedBy: "alex.johnson@contoso.com" },
  { id: "event-005", timestamp: "2024-12-12T16:45:00Z", operation: "Microsoft.Web/sites/restart/action", operationName: "Restart Web App", status: "Succeeded", level: "Informational", resourceGroup: "rg-web-prod", resourceName: "contoso-web-app", resourceType: "Microsoft.Web/sites", initiatedBy: "alex.johnson@contoso.com" },
  { id: "event-006", timestamp: "2024-12-12T10:30:00Z", operation: "Microsoft.Resources/subscriptions/resourceGroups/write", operationName: "Create/Update Resource Group", status: "Succeeded", level: "Informational", resourceGroup: "rg-data-dev", resourceName: "rg-data-dev", resourceType: "Microsoft.Resources/resourceGroups", initiatedBy: "alex.johnson@contoso.com" },
  { id: "event-007", timestamp: "2024-12-11T14:20:00Z", operation: "Microsoft.Compute/virtualMachines/write", operationName: "Create/Update Virtual Machine", status: "Failed", level: "Error", resourceGroup: "rg-web-prod", resourceName: "vm-test-fail", resourceType: "Microsoft.Compute/virtualMachines", initiatedBy: "alex.johnson@contoso.com" },
  { id: "event-008", timestamp: "2024-12-10T08:00:00Z", operation: "Microsoft.Sql/servers/databases/write", operationName: "Create/Update Database", status: "Succeeded", level: "Informational", resourceGroup: "rg-data-dev", resourceName: "contoso-db", resourceType: "Microsoft.Sql/servers/databases", initiatedBy: "alex.johnson@contoso.com" }
]
```

---

## 13. Notifications

| Field | Type | Example |
|-------|------|---------|
| id | string | `"notif-001"` |
| title | string | `"Deployment succeeded"` |
| message | string | `"vm-web-server-01 was started successfully"` |
| level | string | `"info"` / `"success"` / `"warning"` / `"error"` |
| timestamp | string (ISO) | `"2024-12-14T15:30:00Z"` |
| read | boolean | `false` |
| resourceName | string | `"vm-web-server-01"` |

**Seed data**: 5 notifications
```js
[
  { id: "notif-001", title: "Virtual machine started", message: "vm-web-server-01 was started successfully.", level: "success", timestamp: "2024-12-14T15:30:00Z", read: false, resourceName: "vm-web-server-01" },
  { id: "notif-002", title: "Virtual machine deallocated", message: "vm-jumpbox was deallocated.", level: "info", timestamp: "2024-12-14T14:00:00Z", read: false, resourceName: "vm-jumpbox" },
  { id: "notif-003", title: "Budget alert", message: "Your spending has reached 60% of your monthly budget ($800.00).", level: "warning", timestamp: "2024-12-13T09:00:00Z", read: true, resourceName: "Monthly-Total" },
  { id: "notif-004", title: "Deployment failed", message: "Failed to create virtual machine vm-test-fail. Quota exceeded for Standard_D series.", level: "error", timestamp: "2024-12-11T14:20:00Z", read: true, resourceName: "vm-test-fail" },
  { id: "notif-005", title: "Security recommendation", message: "2 virtual machines do not have endpoint protection installed.", level: "warning", timestamp: "2024-12-10T08:00:00Z", read: true, resourceName: null }
]
```

---

## 14. Favorites (sidebar pinned services)

```js
[
  { id: "fav-001", name: "All resources", icon: "Grid", path: "/all-resources" },
  { id: "fav-002", name: "Resource groups", icon: "Folder", path: "/resource-groups" },
  { id: "fav-003", name: "Virtual machines", icon: "Monitor", path: "/virtual-machines" },
  { id: "fav-004", name: "Storage accounts", icon: "Database", path: "/storage-accounts" },
  { id: "fav-005", name: "App Services", icon: "Globe", path: "/app-services" },
  { id: "fav-006", name: "SQL databases", icon: "Table", path: "/sql-databases" },
  { id: "fav-007", name: "Subscriptions", icon: "Key", path: "/subscriptions" },
  { id: "fav-008", name: "Cost Management", icon: "DollarSign", path: "/cost-management" }
]
```

---

## 15. All Services Categories

```js
[
  {
    category: "Compute",
    services: [
      { name: "Virtual machines", icon: "Monitor", path: "/virtual-machines" },
      { name: "App Services", icon: "Globe", path: "/app-services" },
      { name: "Function Apps", icon: "Zap", path: "/function-apps" },
      { name: "Kubernetes services", icon: "Box", path: "/kubernetes" },
      { name: "Container Instances", icon: "Package", path: "/container-instances" }
    ]
  },
  {
    category: "Networking",
    services: [
      { name: "Virtual networks", icon: "Network", path: "/virtual-networks" },
      { name: "Load balancers", icon: "GitBranch", path: "/load-balancers" },
      { name: "Network security groups", icon: "Shield", path: "/network-security-groups" },
      { name: "Public IP addresses", icon: "Globe", path: "/public-ips" },
      { name: "DNS zones", icon: "Globe", path: "/dns-zones" }
    ]
  },
  {
    category: "Storage",
    services: [
      { name: "Storage accounts", icon: "Database", path: "/storage-accounts" },
      { name: "Disks", icon: "Disc", path: "/disks" }
    ]
  },
  {
    category: "Databases",
    services: [
      { name: "SQL databases", icon: "Table", path: "/sql-databases" },
      { name: "Xzure Cosmos DB", icon: "Globe", path: "/cosmos-db" },
      { name: "Xzure Database for PostgreSQL", icon: "Database", path: "/postgresql" },
      { name: "Xzure Database for MySQL", icon: "Database", path: "/mysql" }
    ]
  },
  {
    category: "Web",
    services: [
      { name: "App Services", icon: "Globe", path: "/app-services" },
      { name: "API Management", icon: "Server", path: "/api-management" }
    ]
  },
  {
    category: "Identity",
    services: [
      { name: "Microsoft Entra ID", icon: "Users", path: "/entra-id" },
      { name: "Managed identities", icon: "User", path: "/managed-identities" }
    ]
  },
  {
    category: "Management + Governance",
    services: [
      { name: "Subscriptions", icon: "Key", path: "/subscriptions" },
      { name: "Resource groups", icon: "Folder", path: "/resource-groups" },
      { name: "Cost Management", icon: "DollarSign", path: "/cost-management" },
      { name: "Activity log", icon: "FileText", path: "/activity-log" },
      { name: "Monitor", icon: "BarChart", path: "/monitor" },
      { name: "Advisor", icon: "Lightbulb", path: "/advisor" }
    ]
  },
  {
    category: "Security",
    services: [
      { name: "Microsoft Defender for Cloud", icon: "Shield", path: "/defender" },
      { name: "Key vaults", icon: "Lock", path: "/key-vaults" }
    ]
  }
]
```

---

## createInitialData() Structure

```js
function createInitialData() {
  return {
    currentUser: { /* §1 */ },
    tenant: { /* §2 */ },
    subscriptions: [ /* §3 */ ],
    resourceGroups: [ /* §4 */ ],
    virtualMachines: [ /* §5 */ ],
    storageAccounts: [ /* §6 */ ],
    virtualNetworks: [ /* §7 */ ],
    networkSecurityGroups: [ /* §8 */ ],
    appServices: [ /* §9 */ ],
    sqlDatabases: [ /* §10 */ ],
    costManagement: { /* §11 */ },
    activityLog: [ /* §12 */ ],
    notifications: [ /* §13 */ ],
    favorites: [ /* §14 */ ],
    allServicesCategories: [ /* §15 */ ],
    recentResources: [
      { name: "vm-web-server-01", type: "Virtual machine", resourceGroup: "rg-web-prod", lastViewed: "2024-12-14T15:30:00Z" },
      { name: "contosowebprod", type: "Storage account", resourceGroup: "rg-web-prod", lastViewed: "2024-12-14T12:15:00Z" },
      { name: "contoso-web-app", type: "App Service", resourceGroup: "rg-web-prod", lastViewed: "2024-12-13T16:00:00Z" },
      { name: "rg-web-prod", type: "Resource group", resourceGroup: null, lastViewed: "2024-12-13T10:00:00Z" },
      { name: "contoso-db", type: "SQL database", resourceGroup: "rg-data-dev", lastViewed: "2024-12-12T14:00:00Z" }
    ],
    portalSettings: {
      theme: "light",
      menuBehavior: "flyout",
      serviceMenuBehavior: "collapsed",
      startupPage: "home",
      language: "English",
      regionalFormat: "English (United States)"
    }
  };
}
```
