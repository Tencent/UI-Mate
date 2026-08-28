const BASE_STORAGE_KEY = 'azure_portal_state';
const BASE_INITIAL_KEY = 'azure_portal_initialState';

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

let _syncTimer = null;

export const saveState = (state, sid = null) => {
  localStorage.setItem(storageKey(sid), JSON.stringify(state));
  if (sid) {
    clearTimeout(_syncTimer);
    _syncTimer = setTimeout(() => {
      fetch(`/post?sid=${encodeURIComponent(sid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_current', state }),
      }).catch(() => {});
    }, 300);
  }
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
    const data = { ...getDefaultData(), ...customState };
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
  currentUser: {
    id: "user-001",
    displayName: "Alex Johnson",
    email: "alex.johnson@contoso.com",
    avatarUrl: null,
    directoryName: "Contoso",
    directoryId: "tenant-contoso-001"
  },

  tenant: {
    id: "tenant-contoso-001",
    displayName: "Contoso",
    domain: "contoso.onmicrosoft.com",
    tenantId: "72f988bf-86f1-41af-91ab-2d7cd011db47"
  },

  subscriptions: [
    {
      id: "sub-001",
      subscriptionId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      displayName: "Pay-As-You-Go",
      state: "Enabled",
      tenantId: "tenant-contoso-001",
      spendingLimit: "Off"
    }
  ],

  resourceGroups: [
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
  ],

  virtualMachines: [
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
  ],

  storageAccounts: [
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
  ],

  virtualNetworks: [
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
  ],

  networkSecurityGroups: [
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
  ],

  appServices: [
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
  ],

  sqlDatabases: [
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
  ],

  costManagement: {
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
  },

  activityLog: [
    { id: "event-001", timestamp: "2024-12-14T15:30:00Z", operation: "Microsoft.Compute/virtualMachines/start/action", operationName: "Start Virtual Machine", status: "Succeeded", level: "Informational", resourceGroup: "rg-web-prod", resourceName: "vm-web-server-01", resourceType: "Microsoft.Compute/virtualMachines", initiatedBy: "alex.johnson@contoso.com" },
    { id: "event-002", timestamp: "2024-12-14T14:00:00Z", operation: "Microsoft.Compute/virtualMachines/deallocate/action", operationName: "Deallocate Virtual Machine", status: "Succeeded", level: "Informational", resourceGroup: "rg-networking", resourceName: "vm-jumpbox", resourceType: "Microsoft.Compute/virtualMachines", initiatedBy: "alex.johnson@contoso.com" },
    { id: "event-003", timestamp: "2024-12-14T12:15:00Z", operation: "Microsoft.Storage/storageAccounts/write", operationName: "Create/Update Storage Account", status: "Succeeded", level: "Informational", resourceGroup: "rg-data-dev", resourceName: "contosodatadev", resourceType: "Microsoft.Storage/storageAccounts", initiatedBy: "alex.johnson@contoso.com" },
    { id: "event-004", timestamp: "2024-12-13T09:00:00Z", operation: "Microsoft.Network/networkSecurityGroups/securityRules/write", operationName: "Create/Update Security Rule", status: "Succeeded", level: "Informational", resourceGroup: "rg-web-prod", resourceName: "nsg-web-prod", resourceType: "Microsoft.Network/networkSecurityGroups", initiatedBy: "alex.johnson@contoso.com" },
    { id: "event-005", timestamp: "2024-12-12T16:45:00Z", operation: "Microsoft.Web/sites/restart/action", operationName: "Restart Web App", status: "Succeeded", level: "Informational", resourceGroup: "rg-web-prod", resourceName: "contoso-web-app", resourceType: "Microsoft.Web/sites", initiatedBy: "alex.johnson@contoso.com" },
    { id: "event-006", timestamp: "2024-12-12T10:30:00Z", operation: "Microsoft.Resources/subscriptions/resourceGroups/write", operationName: "Create/Update Resource Group", status: "Succeeded", level: "Informational", resourceGroup: "rg-data-dev", resourceName: "rg-data-dev", resourceType: "Microsoft.Resources/resourceGroups", initiatedBy: "alex.johnson@contoso.com" },
    { id: "event-007", timestamp: "2024-12-11T14:20:00Z", operation: "Microsoft.Compute/virtualMachines/write", operationName: "Create/Update Virtual Machine", status: "Failed", level: "Error", resourceGroup: "rg-web-prod", resourceName: "vm-test-fail", resourceType: "Microsoft.Compute/virtualMachines", initiatedBy: "alex.johnson@contoso.com" },
    { id: "event-008", timestamp: "2024-12-10T08:00:00Z", operation: "Microsoft.Sql/servers/databases/write", operationName: "Create/Update Database", status: "Succeeded", level: "Informational", resourceGroup: "rg-data-dev", resourceName: "contoso-db", resourceType: "Microsoft.Sql/servers/databases", initiatedBy: "alex.johnson@contoso.com" }
  ],

  notifications: [
    { id: "notif-001", title: "Virtual machine started", message: "vm-web-server-01 was started successfully.", level: "success", timestamp: "2024-12-14T15:30:00Z", read: false, resourceName: "vm-web-server-01" },
    { id: "notif-002", title: "Virtual machine deallocated", message: "vm-jumpbox was deallocated.", level: "info", timestamp: "2024-12-14T14:00:00Z", read: false, resourceName: "vm-jumpbox" },
    { id: "notif-003", title: "Budget alert", message: "Your spending has reached 60% of your monthly budget ($800.00).", level: "warning", timestamp: "2024-12-13T09:00:00Z", read: true, resourceName: "Monthly-Total" },
    { id: "notif-004", title: "Deployment failed", message: "Failed to create virtual machine vm-test-fail. Quota exceeded for Standard_D series.", level: "error", timestamp: "2024-12-11T14:20:00Z", read: true, resourceName: "vm-test-fail" },
    { id: "notif-005", title: "Security recommendation", message: "2 virtual machines do not have endpoint protection installed.", level: "warning", timestamp: "2024-12-10T08:00:00Z", read: true, resourceName: null }
  ],

  favorites: [
    { id: "fav-001", name: "All resources", icon: "Grid", path: "/all-resources" },
    { id: "fav-002", name: "Resource groups", icon: "Folder", path: "/resource-groups" },
    { id: "fav-003", name: "Virtual machines", icon: "Monitor", path: "/virtual-machines" },
    { id: "fav-004", name: "Storage accounts", icon: "Database", path: "/storage-accounts" },
    { id: "fav-005", name: "App Services", icon: "Globe", path: "/app-services" },
    { id: "fav-006", name: "SQL databases", icon: "Table", path: "/sql-databases" },
    { id: "fav-007", name: "Subscriptions", icon: "Key", path: "/subscriptions" },
    { id: "fav-008", name: "Cost Management", icon: "DollarSign", path: "/cost-management" }
  ],

  allServicesCategories: [
    {
      category: "Compute",
      services: [
        { name: "Virtual machines", icon: "Monitor", path: "/virtual-machines" },
        { name: "App Services", icon: "Globe", path: "/app-services" },
        { name: "Function Apps", icon: "Zap", path: "/app-services" },
        { name: "Kubernetes services", icon: "Box", path: "/all-resources" },
        { name: "Container Instances", icon: "Package", path: "/all-resources" }
      ]
    },
    {
      category: "Networking",
      services: [
        { name: "Virtual networks", icon: "Network", path: "/virtual-networks" },
        { name: "Load balancers", icon: "GitBranch", path: "/all-resources" },
        { name: "Network security groups", icon: "Shield", path: "/network-security-groups" },
        { name: "Public IP addresses", icon: "Globe", path: "/all-resources" },
        { name: "DNS zones", icon: "Globe", path: "/all-resources" }
      ]
    },
    {
      category: "Storage",
      services: [
        { name: "Storage accounts", icon: "Database", path: "/storage-accounts" },
        { name: "Disks", icon: "Disc", path: "/all-resources" }
      ]
    },
    {
      category: "Databases",
      services: [
        { name: "SQL databases", icon: "Table", path: "/sql-databases" },
        { name: "Xzure Cosmos DB", icon: "Globe", path: "/sql-databases" },
        { name: "Xzure Database for PostgreSQL", icon: "Database", path: "/sql-databases" },
        { name: "Xzure Database for MySQL", icon: "Database", path: "/sql-databases" }
      ]
    },
    {
      category: "Web",
      services: [
        { name: "App Services", icon: "Globe", path: "/app-services" },
        { name: "API Management", icon: "Server", path: "/all-resources" }
      ]
    },
    {
      category: "Identity",
      services: [
        { name: "Microsoft Entra ID", icon: "Users", path: "/subscriptions" },
        { name: "Managed identities", icon: "User", path: "/all-resources" }
      ]
    },
    {
      category: "Management + Governance",
      services: [
        { name: "Subscriptions", icon: "Key", path: "/subscriptions" },
        { name: "Resource groups", icon: "Folder", path: "/resource-groups" },
        { name: "Cost Management", icon: "DollarSign", path: "/cost-management" },
        { name: "Activity log", icon: "FileText", path: "/activity-log" },
        { name: "Monitor", icon: "BarChart", path: "/activity-log" },
        { name: "Advisor", icon: "Lightbulb", path: "/cost-management" }
      ]
    },
    {
      category: "Security",
      services: [
        { name: "Microsoft Defender for Cloud", icon: "Shield", path: "/all-resources" },
        { name: "Key vaults", icon: "Lock", path: "/all-resources" }
      ]
    }
  ],

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
});
