export type UserRole = 'student' | 'admin' | 'master_admin';
export type UserStatus = 'active' | 'pending_admin_approval' | 'disabled' | 'rejected';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  isPro?: boolean;
}

export interface PipelineOp {
  id: string;
  stage: string;
  operation: string;
  label: string;
  inputImage: string;
  outputImage: string;
  params: Record<string, any>;
  metrics: Record<string, any>;
  matlab_analytics?: Record<string, any>;
  timestamp: string;
  proOnly?: boolean;
}

export interface Review {
  id: string;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Blog {
  id: string;
  title: string;
  author: string;
  role: string;
  category: string;
  date: string;
  content: string;
}

export interface Report {
  id: string;
  title: string;
  userEmail: string;
  userName: string;
  operations: PipelineOp[];
  notes?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userEmail: string;
  userName: string;
  plan: string;
  amount: string;
  paymentId: string;
  status: string;
  date: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'retention' | 'system' | 'account_disabled' | 'admin_approval_request';
  userEmail?: string;
  timestamp: string;
}
