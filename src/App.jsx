
import React, { useState, useEffect } from 'react';

// --- Global Constants & Configuration ---

// RBAC Configuration
const ROLES = {
  ADMIN: 'Admin',
  LOAN_OFFICER: 'Loan Officer',
  CREDIT_ANALYST: 'Credit Analyst',
  RISK_MANAGER: 'Risk Manager',
  APPROVAL_MANAGER: 'Approval Manager',
};

// UI Status Colors Mapping
const STATUS_COLORS = {
  Approved: 'status-approved',
  'In Progress': 'status-in-progress',
  Pending: 'status-pending',
  Rejected: 'status-rejected',
  Exception: 'status-exception',
};

// Navigation Items
const NAV_ITEMS = [
  { id: 'DASHBOARD', label: 'Dashboard', roles: [ROLES.ADMIN, ROLES.LOAN_OFFICER, ROLES.APPROVAL_MANAGER] },
  { id: 'LOAN_LIST', label: 'Loans', roles: Object.values(ROLES) },
  { id: 'USER_MANAGEMENT', label: 'Users', roles: [ROLES.ADMIN] },
  { id: 'SETTINGS', label: 'Settings', roles: [ROLES.ADMIN, ROLES.LOAN_OFFICER] },
];

// Workflow Stages for Milestone Tracker
const LOAN_WORKFLOW_STAGES = [
  { id: 'APPLICATION_SUBMITTED', name: 'Application Submitted', responsibleRole: ROLES.LOAN_OFFICER },
  { id: 'DOCUMENTS_VERIFIED', name: 'Documents Verified', responsibleRole: ROLES.LOAN_OFFICER },
  { id: 'CREDIT_ASSESSMENT', name: 'Credit Assessment', responsibleRole: ROLES.CREDIT_ANALYST },
  { id: 'RISK_EVALUATION', name: 'Risk Evaluation', responsibleRole: ROLES.RISK_MANAGER },
  { id: 'FINAL_APPROVAL', name: 'Final Approval', responsibleRole: ROLES.APPROVAL_MANAGER },
  { id: 'DISBURSED', name: 'Disbursed', responsibleRole: ROLES.LOAN_OFFICER },
];

// --- Sample Data ---
const SAMPLE_LOANS = [
  {
    id: 'L001',
    applicantName: 'Alice Johnson',
    loanType: 'Home Loan',
    amount: 350000,
    status: 'In Progress',
    submittedDate: '2023-10-26',
    currentStage: 'CREDIT_ASSESSMENT',
    slaDue: '2023-11-10',
    riskScore: 720,
    creditScore: 780,
    officer: 'John Doe',
    documents: [
      { id: 'D001', name: 'Application Form', uploadedBy: 'Alice Johnson', date: '2023-10-26', type: 'PDF' },
      { id: 'D002', name: 'ID Proof', uploadedBy: 'Alice Johnson', date: '2023-10-26', type: 'JPG' },
      { id: 'D003', name: 'Income Statement', uploadedBy: 'Alice Johnson', date: '2023-10-26', type: 'PDF' },
    ],
    auditLog: [
      { id: 'A001', timestamp: '2023-10-26T10:00:00Z', user: 'Alice Johnson', role: 'Applicant', action: 'Application submitted', details: 'Initial application for Home Loan.' },
      { id: 'A002', timestamp: '2023-10-27T11:30:00Z', user: 'John Doe', role: ROLES.LOAN_OFFICER, action: 'Documents Verified', details: 'All mandatory documents verified and accepted.' },
    ]
  },
  {
    id: 'L002',
    applicantName: 'Bob Smith',
    loanType: 'Auto Loan',
    amount: 45000,
    status: 'Pending',
    submittedDate: '2023-10-25',
    currentStage: 'FINAL_APPROVAL',
    slaDue: '2023-11-05',
    riskScore: 680,
    creditScore: 710,
    officer: 'Jane Doe',
    documents: [
      { id: 'D004', name: 'Application Form', uploadedBy: 'Bob Smith', date: '2023-10-25', type: 'PDF' },
      { id: 'D005', name: 'ID Proof', uploadedBy: 'Bob Smith', date: '2023-10-25', type: 'PDF' },
    ],
    auditLog: [
      { id: 'A003', timestamp: '2023-10-25T09:00:00Z', user: 'Bob Smith', role: 'Applicant', action: 'Application submitted', details: 'Initial application for Auto Loan.' },
      { id: 'A004', timestamp: '2023-10-26T10:00:00Z', user: 'Jane Doe', role: ROLES.LOAN_OFFICER, action: 'Documents Verified', details: 'All documents verified.' },
      { id: 'A005', timestamp: '2023-10-27T14:00:00Z', user: 'Mike Ross', role: ROLES.CREDIT_ANALYST, action: 'Credit Assessment Completed', details: 'Credit score 710, recommended for approval.' },
      { id: 'A006', timestamp: '2023-10-28T16:00:00Z', user: 'Harvey Specter', role: ROLES.RISK_MANAGER, action: 'Risk Evaluation Completed', details: 'Low risk, proceed to final approval.' },
    ]
  },
  {
    id: 'L003',
    applicantName: 'Charlie Brown',
    loanType: 'Education Loan',
    amount: 75000,
    status: 'Approved',
    submittedDate: '2023-10-20',
    currentStage: 'DISBURSED',
    slaDue: '2023-11-01',
    riskScore: 750,
    creditScore: 810,
    officer: 'John Doe',
    documents: [],
    auditLog: [
      { id: 'A007', timestamp: '2023-10-20T12:00:00Z', user: 'Charlie Brown', role: 'Applicant', action: 'Application submitted', details: 'Education Loan application.' },
      { id: 'A008', timestamp: '2023-10-21T09:00:00Z', user: 'John Doe', role: ROLES.LOAN_OFFICER, action: 'Loan Approved', details: 'Loan has been approved and disbursed.' },
    ]
  },
  {
    id: 'L004',
    applicantName: 'Diana Prince',
    loanType: 'Personal Loan',
    amount: 15000,
    status: 'Rejected',
    submittedDate: '2023-10-18',
    currentStage: 'CREDIT_ASSESSMENT',
    slaDue: '2023-10-28',
    riskScore: 500,
    creditScore: 600,
    officer: 'Jane Doe',
    documents: [],
    auditLog: [
      { id: 'A009', timestamp: '2023-10-18T14:00:00Z', user: 'Diana Prince', role: 'Applicant', action: 'Application submitted', details: 'Personal Loan application.' },
      { id: 'A010', timestamp: '2023-10-20T11:00:00Z', user: 'Mike Ross', role: ROLES.CREDIT_ANALYST, action: 'Credit Assessment Completed', details: 'Credit score 600, deemed high risk.' },
      { id: 'A011', timestamp: '2023-10-20T15:00:00Z', user: 'Harvey Specter', role: ROLES.RISK_MANAGER, action: 'Risk Evaluation Completed', details: 'High risk, recommended for rejection.' },
      { id: 'A012', timestamp: '2023-10-21T09:00:00Z', user: 'Donna Paulsen', role: ROLES.APPROVAL_MANAGER, action: 'Loan Rejected', details: 'Application rejected due to high risk and low credit score.' },
    ]
  },
  {
    id: 'L005',
    applicantName: 'Clark Kent',
    loanType: 'Mortgage',
    amount: 800000,
    status: 'In Progress',
    submittedDate: '2023-11-01',
    currentStage: 'DOCUMENTS_VERIFIED',
    slaDue: '2023-11-15',
    riskScore: 700,
    creditScore: 750,
    officer: 'John Doe',
    documents: [],
    auditLog: [
      { id: 'A013', timestamp: '2023-11-01T09:00:00Z', user: 'Clark Kent', role: 'Applicant', action: 'Application submitted', details: 'Mortgage application.' },
      { id: 'A014', timestamp: '2023-11-02T10:00:00Z', user: 'John Doe', role: ROLES.LOAN_OFFICER, action: 'Documents Received', details: 'Initial documents received, pending verification.' },
    ]
  },
];

const SAMPLE_USERS = [
  { id: 'U001', name: 'John Doe', role: ROLES.LOAN_OFFICER, email: 'john.doe@example.com' },
  { id: 'U002', name: 'Jane Doe', role: ROLES.LOAN_OFFICER, email: 'jane.doe@example.com' },
  { id: 'U003', name: 'Mike Ross', role: ROLES.CREDIT_ANALYST, email: 'mike.ross@example.com' },
  { id: 'U004', name: 'Harvey Specter', role: ROLES.RISK_MANAGER, email: 'harvey.specter@example.com' },
  { id: 'U005', name: 'Donna Paulsen', role: ROLES.APPROVAL_MANAGER, email: 'donna.paulsen@example.com' },
  { id: 'U006', name: 'Jessica Pearson', role: ROLES.ADMIN, email: 'jessica.pearson@example.com' },
];

const App = () => {
  // Centralized Routing State
  const [view, setView] = useState({ screen: 'DASHBOARD', params: {} });
  const [currentUserRole, setCurrentUserRole] = useState(ROLES.APPROVAL_MANAGER); // Default to Approval Manager for demo
  const [loans, setLoans] = useState(SAMPLE_LOANS); // For state immutability demo
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    // Simulate fetching user role or setting default for demo
    // For a real app, this would come from an auth context
    console.log(`Current user role set to: ${currentUserRole}`);
  }, [currentUserRole]);

  // Handler for navigation (Card-First, Click-Through UX, Full-Screen Navigation)
  const handleNavigate = (screen, params = {}) => {
    setView({ screen, params });
    setIsSearching(false); // Close search overlay on navigation
    setSearchTerm('');
    setSearchResults([]);
  };

  // RBAC: Determine visible navigation items
  const getVisibleNavItems = (role) => {
    return NAV_ITEMS.filter(item => item.roles.includes(role));
  };

  // RBAC: Determine actions based on role and current loan status
  const getLoanActions = (loan, role) => {
    const actions = [];
    if (loan?.status === 'Pending' && role === ROLES.APPROVAL_MANAGER) {
      actions.push({ label: 'Approve Loan', action: () => alert(`Approving ${loan.id}`) });
      actions.push({ label: 'Reject Loan', action: () => alert(`Rejecting ${loan.id}`) });
    }
    if (loan?.currentStage === 'DOCUMENTS_VERIFIED' && role === ROLES.CREDIT_ANALYST) {
      actions.push({ label: 'Start Credit Assessment', action: () => alert(`Starting credit for ${loan.id}`) });
    }
    // More complex RBAC and workflow stage based actions would go here
    return actions;
  };

  // Global Search Logic (Floating global search with smart suggestions)
  const handleGlobalSearch = (term) => {
    setSearchTerm(term);
    if (term.length > 1) {
      const filteredLoans = SAMPLE_LOANS.filter(loan =>
        loan.id.toLowerCase().includes(term.toLowerCase()) ||
        loan.applicantName.toLowerCase().includes(term.toLowerCase()) ||
        loan.loanType.toLowerCase().includes(term.toLowerCase())
      ).map(loan => ({
        type: 'Loan',
        id: loan.id,
        title: `${loan.applicantName} - ${loan.loanType}`,
        description: `Status: ${loan.status}, Amount: $${loan.amount.toLocaleString()}`,
        navigate: () => handleNavigate('LOAN_DETAIL', { loanId: loan.id })
      }));

      const filteredUsers = SAMPLE_USERS.filter(user =>
        user.name.toLowerCase().includes(term.toLowerCase()) ||
        user.role.toLowerCase().includes(term.toLowerCase())
      ).map(user => ({
        type: 'User',
        id: user.id,
        title: `${user.name} (${user.role})`,
        description: `Email: ${user.email}`,
        navigate: () => handleNavigate('USER_MANAGEMENT', { userId: user.id }) // Placeholder
      }));

      setSearchResults([...filteredLoans, ...filteredUsers]);
    } else {
      setSearchResults([]);
    }
  };

  // --- Reusable UI Components ---

  const Card = ({ children, onClick, status, className = '', style = {} }) => {
    const statusClass = status ? STATUS_COLORS[status] || '' : '';
    return (
      <div
        className={`card ${statusClass} ${className}`}
        onClick={onClick}
        style={style}
      >
        {children}
      </div>
    );
  };

  const StatusPill = ({ status }) => {
    const statusClass = STATUS_COLORS[status] || '';
    return (
      <span
        className={`status-pill ${statusClass}`}
        style={{ marginRight: 'var(--spacing-sm)' }}
      >
        {status}
      </span>
    );
  };

  const MilestoneTracker = ({ currentStageId }) => {
    return (
      <div className="milestone-tracker">
        {LOAN_WORKFLOW_STAGES.map((stage, index) => {
          const isCompleted = LOAN_WORKFLOW_STAGES.findIndex(s => s.id === currentStageId) > index;
          const isCurrent = stage.id === currentStageId;
          const iconClass = isCompleted ? 'completed' : isCurrent ? 'current' : '';

          return (
            <div key={stage.id} className="milestone-stage">
              <div className={`milestone-icon ${iconClass}`}>
                {isCompleted ? '✓' : isCurrent ? '●' : index + 1}
              </div>
              <div className="milestone-info">
                <div className="milestone-title">{stage.name}</div>
                <div className="milestone-date text-secondary">
                  {isCompleted ? 'Completed' : isCurrent ? 'Current' : 'Pending'}
                  {/* SLA tracking could be added here */}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const ActivityFeed = ({ activities, allowedRoles = Object.values(ROLES) }) => {
    // RBAC for logs: Filter activities based on user's role if needed
    const visibleActivities = activities?.filter(activity => allowedRoles.includes(activity.role) || activity.role === 'Applicant') || [];

    return (
      <div className="audit-feed">
        {visibleActivities.length > 0 ? (
          visibleActivities.map((activity) => (
            <div key={activity.id} className="audit-item">
              <div className="audit-icon">
                {activity.user.charAt(0)}
              </div>
              <div className="audit-content">
                <div className="audit-header">
                  <span className="audit-user">{activity.user}</span>
                  <span className="audit-timestamp">{new Date(activity.timestamp).toLocaleString()}</span>
                </div>
                <div className="audit-message">{activity.action}: {activity.details}</div>
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'var(--text-center)', color: 'var(--text-secondary)' }}>No recent activities.</p>
        )}
      </div>
    );
  };

  const ChartPlaceholder = ({ type, title }) => (
    <div className="chart-placeholder card" style={{ cursor: 'default' }}>
      <p>{title} ({type} Chart)</p>
    </div>
  );

  // --- Screens ---

  const DashboardScreen = () => {
    // Example KPIs
    const totalLoans = loans.length;
    const approvedLoans = loans.filter(loan => loan.status === 'Approved').length;
    const pendingLoans = loans.filter(loan => loan.status === 'Pending').length;
    const inProgressLoans = loans.filter(loan => loan.status === 'In Progress').length;
    const rejectedLoans = loans.filter(loan => loan.status === 'Rejected').length;

    return (
      <div className="dashboard-screen">
        <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>Welcome, {currentUserRole}!</h1>

        <div className="grid grid-4-cols" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <Card onClick={() => handleNavigate('LOAN_LIST', { status: 'In Progress' })}>
            <h3 style={{ fontSize: 'var(--font-size-xl)' }}>{totalLoans}</h3>
            <p className="text-secondary">Total Loans</p>
            <div className="chart-placeholder" style={{ minHeight: '80px', fontSize: 'var(--font-size-sm)' }}>Trend: +5%</div>
          </Card>
          <Card onClick={() => handleNavigate('LOAN_LIST', { status: 'Approved' })}>
            <h3 style={{ fontSize: 'var(--font-size-xl)' }}>{approvedLoans}</h3>
            <p className="text-secondary">Approved Loans</p>
            <div className="chart-placeholder" style={{ minHeight: '80px', fontSize: 'var(--font-size-sm)' }}>Trend: Steady</div>
          </Card>
          <Card onClick={() => handleNavigate('LOAN_LIST', { status: 'Pending' })} className="pulsing-element"> {/* Pulse for real-time update indication */}
            <h3 style={{ fontSize: 'var(--font-size-xl)' }}>{pendingLoans}</h3>
            <p className="text-secondary">Pending Applications</p>
            <div className="chart-placeholder" style={{ minHeight: '80px', fontSize: 'var(--font-size-sm)' }}>Trend: +2 New</div>
          </Card>
          <Card onClick={() => handleNavigate('LOAN_LIST', { status: 'Rejected' })}>
            <h3 style={{ fontSize: 'var(--font-size-xl)' }}>{rejectedLoans}</h3>
            <p className="text-secondary">Rejected Loans</p>
            <div className="chart-placeholder" style={{ minHeight: '80px', fontSize: 'var(--font-size-sm)' }}>Trend: -1%</div>
          </Card>
        </div>

        <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Loan Pipeline Overview</h2>
        <div className="grid grid-2-cols" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <ChartPlaceholder type="Bar" title="Loan Application Status" />
          <ChartPlaceholder type="Line" title="Monthly Approval Rate" />
          <ChartPlaceholder type="Donut" title="Loan Types Distribution" />
          <ChartPlaceholder type="Gauge" title="Average SLA Performance" />
        </div>

        <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Recent System Activities</h2>
        <Card onClick={() => console.log('View all activities')} style={{ cursor: 'pointer' }}>
          <ActivityFeed activities={
            loans.flatMap(loan => loan.auditLog?.map(log => ({ ...log, loanId: loan.id, loanType: loan.loanType })) || [])
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .slice(0, 5) // Show top 5 recent activities
          } allowedRoles={NAV_ITEMS.find(item => item.id === 'DASHBOARD')?.roles || []} />
          <div className="flex justify-between items-center mt-md">
            <span className="text-accent text-sm">View All Activities</span>
            <span>➡️</span>
          </div>
        </Card>
      </div>
    );
  };

  const LoanListScreen = () => {
    const filteredLoans = loans.filter(loan => {
      const statusMatch = view.params.status ? loan.status === view.params.status : true;
      const searchMatch = searchTerm
        ? loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          loan.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          loan.loanType.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return statusMatch && searchMatch;
    });

    const handleApplyFilters = (filters) => {
      // Logic for applying filters (e.g., setView with new params)
      console.log('Applying filters:', filters);
    };

    const handleBulkAction = (actionType) => {
      alert(`Performing bulk action: ${actionType}`);
      // Implement bulk action logic here
    };

    return (
      <div className="loan-list-screen">
        <div className="flex justify-between items-center mb-lg">
          <h1 style={{ fontSize: 'var(--font-size-h2)' }}>Loan Applications {view.params.status ? `(${view.params.status})` : ''}</h1>
          <div className="flex gap-md">
            {/* These would typically open a side panel or modal */}
            <button className="btn btn-secondary" onClick={() => handleApplyFilters({})}>Filter</button>
            <button className="btn btn-secondary" onClick={() => handleBulkAction('Export')}>Export to Excel/PDF</button>
            {currentUserRole === ROLES.LOAN_OFFICER && (
              <button className="btn btn-primary" onClick={() => alert('Open New Loan Form')}>+ New Loan Application</button>
            )}
          </div>
        </div>

        {filteredLoans.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📄</span>
            <h3>No Loans Found</h3>
            <p>It looks like there are no loan applications matching your criteria.</p>
            {currentUserRole === ROLES.LOAN_OFFICER && (
              <button className="btn btn-primary" onClick={() => alert('Open New Loan Form')}>Start a New Application</button>
            )}
          </div>
        ) : (
          <div className="grid grid-3-cols">
            {filteredLoans.map((loan) => (
              <Card
                key={loan.id}
                status={loan.status}
                onClick={() => handleNavigate('LOAN_DETAIL', { loanId: loan.id })}
              >
                <div className="flex justify-between items-center mb-sm">
                  <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>{loan.applicantName}</h3>
                  <StatusPill status={loan.status} />
                </div>
                <p className="text-secondary" style={{ marginBottom: 'var(--spacing-xs)' }}>{loan.loanType} - #{loan.id}</p>
                <p className="font-bold" style={{ marginBottom: 'var(--spacing-md)' }}>
                  Amount: ${loan.amount?.toLocaleString()}
                </p>
                <div className="flex justify-between text-sm text-secondary">
                  <span>Submitted: {loan.submittedDate}</span>
                  <span>Officer: {loan.officer}</span>
                </div>
                {/* Hover actions (web) could be implemented here as an overlay or hidden div */}
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  };

  const LoanDetailScreen = ({ loanId }) => {
    const loan = loans.find(l => l.id === loanId);

    if (!loan) {
      return (
        <div>
          <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>Loan Not Found</h1>
          <p className="text-secondary">The loan with ID {loanId} could not be found.</p>
          <button className="btn btn-secondary mt-md" onClick={() => handleNavigate('LOAN_LIST')}>Back to Loan List</button>
        </div>
      );
    }

    const currentStageIndex = LOAN_WORKFLOW_STAGES.findIndex(stage => stage.id === loan.currentStage);
    const completedStages = LOAN_WORKFLOW_STAGES.slice(0, currentStageIndex + 1);

    const availableActions = getLoanActions(loan, currentUserRole);

    return (
      <div className="loan-detail-screen">
        <div className="breadcrumbs">
          <a onClick={() => handleNavigate('LOAN_LIST')} style={{ cursor: 'pointer' }}>Loans</a>
          <span>/</span>
          <span>{loan.applicantName} ({loan.id})</span>
        </div>

        <div className="flex justify-between items-center mb-lg">
          <h1 style={{ fontSize: 'var(--font-size-h2)' }}>Loan Application: {loan.applicantName}</h1>
          <div className="flex gap-md">
            {currentUserRole === ROLES.LOAN_OFFICER && (
              <button className="btn btn-secondary" onClick={() => alert(`Editing loan ${loan.id}`)}>Edit Form</button>
            )}
            {availableActions.map((action, index) => (
              <button key={index} className="btn btn-primary" onClick={action.action}>
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-2-cols">
          {/* Loan Summary Card (Record Summary Page) */}
          <Card style={{ padding: 0 }}>
            <div style={{ padding: 'var(--spacing-lg)' }}>
              <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Loan Summary</h3>
              <div className="flex justify-between items-center mb-sm">
                <p className="text-secondary" style={{ margin: 0 }}>Loan ID:</p>
                <p className="font-semibold" style={{ margin: 0 }}>{loan.id}</p>
              </div>
              <div className="flex justify-between items-center mb-sm">
                <p className="text-secondary" style={{ margin: 0 }}>Applicant:</p>
                <p className="font-semibold" style={{ margin: 0 }}>{loan.applicantName}</p>
              </div>
              <div className="flex justify-between items-center mb-sm">
                <p className="text-secondary" style={{ margin: 0 }}>Loan Type:</p>
                <p className="font-semibold" style={{ margin: 0 }}>{loan.loanType}</p>
              </div>
              <div className="flex justify-between items-center mb-sm">
                <p className="text-secondary" style={{ margin: 0 }}>Amount:</p>
                <p className="font-semibold" style={{ margin: 0 }}>${loan.amount?.toLocaleString()}</p>
              </div>
              <div className="flex justify-between items-center mb-sm">
                <p className="text-secondary" style={{ margin: 0 }}>Status:</p>
                <StatusPill status={loan.status} />
              </div>
              <div className="flex justify-between items-center mb-sm">
                <p className="text-secondary" style={{ margin: 0 }}>Submitted On:</p>
                <p className="font-semibold" style={{ margin: 0 }}>{loan.submittedDate}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-secondary" style={{ margin: 0 }}>SLA Due:</p>
                <p className="font-semibold" style={{ margin: 0 }}>{loan.slaDue}</p>
              </div>
            </div>
            {/* Quick Actions (e.g., related to loan summary) */}
            <div style={{ borderTop: '1px solid var(--border-light)', padding: 'var(--spacing-md)', display: 'flex', gap: 'var(--spacing-md)' }}>
              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => alert(`Generating PDF for ${loan.id}`)}>Generate PDF</button>
            </div>
          </Card>

          {/* Milestone Tracker (Workflow Progress) */}
          <Card style={{ padding: 0 }}>
            <div style={{ padding: 'var(--spacing-lg)' }}>
              <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Workflow Progress</h3>
              <MilestoneTracker currentStageId={loan.currentStage} />
            </div>
          </Card>

          {/* Documents Card (Related Records) */}
          <Card>
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Documents ({loan.documents?.length || 0})</h3>
            {loan.documents && loan.documents.length > 0 ? (
              loan.documents.map(doc => (
                <div key={doc.id} className="flex justify-between items-center mb-sm py-sm" style={{ borderBottom: '1px dashed var(--border-light)' }}>
                  <div>
                    <p className="font-semibold" style={{ margin: 0 }}>{doc.name}</p>
                    <span className="text-secondary text-sm">Uploaded by {doc.uploadedBy} on {doc.date}</span>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => alert(`Previewing ${doc.name}`)}>Preview</button>
                </div>
              ))
            ) : (
              <div className="text-secondary">No documents uploaded yet.</div>
            )}
            {currentUserRole === ROLES.LOAN_OFFICER && (
              <button className="btn btn-secondary mt-md" onClick={() => alert('Open document upload form')}>Upload Document</button>
            )}
          </Card>

          {/* Credit Assessment / Risk Evaluation Card */}
          <Card>
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Assessment & Risk</h3>
            <div className="flex justify-between items-center mb-sm">
              <p className="text-secondary" style={{ margin: 0 }}>Credit Score:</p>
              <p className="font-semibold" style={{ margin: 0 }}>{loan.creditScore}</p>
            </div>
            <div className="flex justify-between items-center mb-sm">
              <p className="text-secondary" style={{ margin: 0 }}>Risk Score:</p>
              <p className="font-semibold" style={{ margin: 0 }}>{loan.riskScore}</p>
            </div>
            {loan.riskScore && loan.riskScore < 600 && (
              <p className="error-message">High risk detected. Further review needed.</p>
            )}
            {currentUserRole === ROLES.CREDIT_ANALYST && (
              <button className="btn btn-secondary mt-md" onClick={() => alert(`Update Credit for ${loan.id}`)}>Update Credit</button>
            )}
            {currentUserRole === ROLES.RISK_MANAGER && (
              <button className="btn btn-secondary mt-md" onClick={() => alert(`Update Risk for ${loan.id}`)}>Update Risk</button>
            )}
          </Card>

          {/* News/Audit Feed (Appian Record Alignment) */}
          <Card className="col-span-2"> {/* Span two columns */}
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>News & Audit Trail</h3>
            <ActivityFeed activities={loan.auditLog} allowedRoles={[ROLES.ADMIN, ROLES.APPROVAL_MANAGER]} />
          </Card>
        </div>
      </div>
    );
  };

  const UserManagementScreen = () => {
    if (currentUserRole !== ROLES.ADMIN) {
      return (
        <Card style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'var(--status-rejected-border)' }}>Access Denied</h3>
          <p className="text-secondary">You do not have permission to view this page.</p>
        </Card>
      );
    }
    return (
      <div>
        <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>User Management</h1>
        <p className="text-secondary">
          This is a placeholder for user management. As an {ROLES.ADMIN}, you can manage users, roles, and permissions here.
        </p>
        <div className="grid grid-3-cols">
          {SAMPLE_USERS.map(user => (
            <Card key={user.id} onClick={() => alert(`Viewing user ${user.name}`)}>
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-lg)' }}>{user.name}</h3>
              <p className="text-secondary" style={{ margin: 'var(--spacing-xs) 0' }}>{user.role}</p>
              <p className="text-sm text-secondary">{user.email}</p>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const SettingsScreen = () => {
    return (
      <div>
        <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>Settings</h1>
        <p className="text-secondary">
          This is a placeholder for application settings.
          <br/>
          Current Role: <select
            value={currentUserRole}
            onChange={(e) => setCurrentUserRole(e.target.value)}
            className="form-control"
            style={{ width: '200px', display: 'inline-block', marginLeft: 'var(--spacing-md)' }}
          >
            {Object.values(ROLES).map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </p>
      </div>
    );
  };


  const renderScreen = () => {
    switch (view.screen) {
      case 'DASHBOARD':
        return <DashboardScreen />;
      case 'LOAN_LIST':
        return <LoanListScreen />;
      case 'LOAN_DETAIL':
        return <LoanDetailScreen loanId={view.params.loanId} />;
      case 'USER_MANAGEMENT':
        return <UserManagementScreen />;
      case 'SETTINGS':
        return <SettingsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-brand">LoanFlowPro</div>
        <nav className="header-nav">
          {getVisibleNavItems(currentUserRole).map(item => (
            <div
              key={item.id}
              className={`header-nav-item ${view.screen === item.id ? 'active' : ''}`}
              onClick={() => handleNavigate(item.id)}
              style={{ cursor: 'pointer' }}
            >
              {item.label}
            </div>
          ))}
        </nav>
        <div className="header-user-info">
          <span
            className="global-search-trigger"
            onClick={() => setIsSearching(true)}
            style={{ cursor: 'pointer', marginRight: 'var(--spacing-md)' }}
          >
            🔍 Global Search
          </span>
          <span>{currentUserRole}</span>
          <span style={{ marginLeft: 'var(--spacing-sm)' }}>|</span>
          <span
            style={{ marginLeft: 'var(--spacing-sm)', cursor: 'pointer' }}
            onClick={() => alert('Logout')}
          >
            Logout
          </span>
        </div>
      </header>

      <main className="main-content">
        {renderScreen()}
      </main>

      {isSearching && (
        <div className="global-search-overlay" onClick={() => setIsSearching(false)}>
          <div className="global-search-modal" onClick={e => e.stopPropagation()}>
            <input
              type="text"
              className="global-search-modal-input"
              placeholder="Search for loans, applicants, users..."
              value={searchTerm}
              onChange={(e) => handleGlobalSearch(e.target.value)}
              autoFocus
            />
            <div className="global-search-results">
              {searchResults.length > 0 ? (
                searchResults.map(result => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="global-search-result-item"
                    onClick={result.navigate}
                  >
                    <div className="global-search-result-title">{result.title}</div>
                    <div className="global-search-result-description">{result.description}</div>
                  </div>
                ))
              ) : (
                searchTerm.length > 1 && <p className="text-secondary text-center">No results found for "{searchTerm}"</p>
              )}
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => setIsSearching(false)}
              style={{ width: '100%', marginTop: 'var(--spacing-md)' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;