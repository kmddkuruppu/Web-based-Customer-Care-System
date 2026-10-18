export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  AGENT: 'CUSTOMER_CARE_AGENT',
  SENIOR: 'SENIOR_CUSTOMER_CARE_AGENT',
  SUPERVISOR: 'SUPERVISOR',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
};

export const ROLE_LABELS = {
  CUSTOMER: 'Customer',
  CUSTOMER_CARE_AGENT: 'Customer Care Agent',
  SENIOR_CUSTOMER_CARE_AGENT: 'Senior Agent',
  SUPERVISOR: 'Supervisor',
  MANAGER: 'Manager',
  ADMIN: 'Administrator',
};

export const STATUSES = [
  'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER',
  'ESCALATED', 'RESOLVED', 'CLOSED', 'ARCHIVED',
];

export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export const EMPTY_FILTERS = { search: '', status: '', category: '', priority: '' };

export const HOME_PATH = {
  CUSTOMER: '/customer/dashboard',
  CUSTOMER_CARE_AGENT: '/agent/dashboard',
  SENIOR_CUSTOMER_CARE_AGENT: '/senior/escalated',
  SUPERVISOR: '/supervisor/dashboard',
  MANAGER: '/manager/reports',
  ADMIN: '/admin/users',
};

export const MENUS = {
  CUSTOMER: [
    { to: '/customer/dashboard', label: 'Dashboard', icon: 'home' },
    { to: '/customer/submit', label: 'Submit Complaint', icon: 'file-plus' },
    { to: '/customer/tickets', label: 'My Tickets', icon: 'inbox' },
  ],
  CUSTOMER_CARE_AGENT: [
    { to: '/agent/dashboard', label: 'Dashboard', icon: 'home' },
    { to: '/agent/tickets', label: 'Assigned Tickets', icon: 'inbox' },
  ],
  SENIOR_CUSTOMER_CARE_AGENT: [
    { to: '/senior/escalated', label: 'Escalated Tickets', icon: 'alert' },
  ],
  SUPERVISOR: [
    { to: '/supervisor/dashboard', label: 'Dashboard', icon: 'home' },
    { to: '/supervisor/tickets', label: 'Ticket Assignment', icon: 'user-check' },
  ],
  MANAGER: [
    { to: '/manager/reports', label: 'Reports & Analytics', icon: 'bar-chart' },
  ],
  ADMIN: [
    { to: '/admin/users', label: 'User Management', icon: 'users' },
    { to: '/admin/categories', label: 'Categories', icon: 'folder' },
  ],
};
