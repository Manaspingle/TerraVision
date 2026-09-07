import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './components/LandingPage';
import { ImageProcessingStudio } from './components/ImageProcessingStudio';
import { BlogsSection } from './components/BlogsSection';
import { AuthModal } from './components/AuthModal';
import { ReportGeneratorModal } from './components/ReportGeneratorModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { RetentionNotificationsModal } from './components/RetentionNotificationsModal';
import { ReviewModal } from './components/ReviewSection';
import { AdminDashboard } from './components/AdminDashboard';
import { MasterAdminDashboard } from './components/MasterAdminDashboard';
import { UserProfile, Blog, Review, NotificationItem, PipelineOp } from './types';
import { fetchBlogsApi, fetchReviewsApi, fetchNotificationsApi } from './api';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [user, setUser] = useState<UserProfile | null>(null);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState<'student' | 'admin' | 'master_admin'>('student');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportOpsQueue, setReportOpsQueue] = useState<PipelineOp[]>([]);

  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Data
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const loadInitialData = async () => {
    try {
      const bRes = await fetchBlogsApi();
      setBlogs(bRes.blogs || []);

      const rRes = await fetchReviewsApi();
      setReviews(rRes.reviews || []);

      const nRes = await fetchNotificationsApi(user?.email);
      setNotifications(nRes.notifications || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [user]);

  const handleOpenAuth = (role: 'student' | 'admin' | 'master_admin', mode: 'login' | 'signup') => {
    setAuthRole(role);
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleNavigateToTab = (tab: string) => {
    if (tab === 'landing') {
      setActiveTab('landing');
      return;
    }
    if (!user) {
      handleOpenAuth('student', 'login');
    } else {
      setActiveTab(tab);
    }
  };

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    if (loggedInUser.role === 'master_admin' || loggedInUser.email === 'manaspingle.dev@gmail.com') {
      setActiveTab('master_admin');
    } else if (loggedInUser.role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('studio');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('landing');
  };

  const handleOpenReportModal = (ops: PipelineOp[]) => {
    setReportOpsQueue(ops);
    setReportModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={handleNavigateToTab}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onOpenNotifications={() => setNotificationsModalOpen(true)}
        onOpenSubscription={() => setSubscriptionModalOpen(true)}
        unreadNotifsCount={notifications.length}
      />

      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            user={user}
            onOpenAuth={handleOpenAuth}
            onNavigateToTab={handleNavigateToTab}
            reviews={reviews}
            onOpenReviewModal={() => {
              if (!user) {
                handleOpenAuth('student', 'login');
              } else {
                setReviewModalOpen(true);
              }
            }}
          />
        )}

        {activeTab === 'studio' && (
          user ? (
            <ImageProcessingStudio
              user={user}
              onOpenSubscription={() => setSubscriptionModalOpen(true)}
              onOpenReportModal={handleOpenReportModal}
            />
          ) : (
            <LandingPage
              user={user}
              onOpenAuth={handleOpenAuth}
              onNavigateToTab={handleNavigateToTab}
              reviews={reviews}
              onOpenReviewModal={() => handleOpenAuth('student', 'login')}
            />
          )
        )}

        {activeTab === 'blogs' && (
          user ? (
            <BlogsSection
              blogs={blogs}
              user={user}
              onBlogCreated={loadInitialData}
            />
          ) : (
            <LandingPage
              user={user}
              onOpenAuth={handleOpenAuth}
              onNavigateToTab={handleNavigateToTab}
              reviews={reviews}
              onOpenReviewModal={() => handleOpenAuth('student', 'login')}
            />
          )
        )}

        {activeTab === 'reviews' && (
          user ? (
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
              <div className="flex items-center justify-between glass-panel p-6">
                <div>
                  <h1 className="text-2xl font-bold text-white">TerraVision User Reviews & Star Ratings</h1>
                  <p className="text-xs text-slate-400">Real feedback from satellite analysis engineers.</p>
                </div>
                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="glow-btn text-xs"
                >
                  Write Review
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((rev) => (
                  <div key={rev.id} className="glass-panel p-6 border-slate-800 space-y-2">
                    <h4 className="font-bold text-white">{rev.userName}</h4>
                    <p className="text-xs text-amber-400 font-bold">Rating: {rev.rating} / 5 Stars</p>
                    <p className="text-xs text-slate-300">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <LandingPage
              user={user}
              onOpenAuth={handleOpenAuth}
              onNavigateToTab={handleNavigateToTab}
              reviews={reviews}
              onOpenReviewModal={() => handleOpenAuth('student', 'login')}
            />
          )
        )}

        {activeTab === 'admin' && (
          user?.role === 'admin' ? (
            <AdminDashboard
              currentUser={user}
              blogs={blogs}
              onRefreshBlogs={loadInitialData}
            />
          ) : (
            <LandingPage
              user={user}
              onOpenAuth={handleOpenAuth}
              onNavigateToTab={handleNavigateToTab}
              reviews={reviews}
              onOpenReviewModal={() => handleOpenAuth('student', 'login')}
            />
          )
        )}

        {/* DEDICATED MASTER ADMIN DEVELOPER DASHBOARD */}
        {activeTab === 'master_admin' && (
          user?.role === 'master_admin' || user?.email === 'manaspingle.dev@gmail.com' ? (
            <MasterAdminDashboard currentUser={user} />
          ) : (
            <LandingPage
              user={user}
              onOpenAuth={handleOpenAuth}
              onNavigateToTab={handleNavigateToTab}
              reviews={reviews}
              onOpenReviewModal={() => handleOpenAuth('student', 'login')}
            />
          )
        )}
      </main>

      <Footer onOpenMasterAdminAuth={() => handleOpenAuth('master_admin', 'login')} />

      {/* MODALS */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialRole={authRole}
        initialMode={authMode}
        onLoginSuccess={handleLoginSuccess}
      />

      <ReportGeneratorModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        user={user}
        operationsQueue={reportOpsQueue}
      />

      <SubscriptionModal
        isOpen={subscriptionModalOpen}
        onClose={() => setSubscriptionModalOpen(false)}
        user={user}
        onSubscriptionSuccess={() => {
          if (user) setUser({ ...user, isPro: true });
        }}
      />

      <RetentionNotificationsModal
        isOpen={notificationsModalOpen}
        onClose={() => setNotificationsModalOpen(false)}
        notifications={notifications}
      />

      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        user={user}
        onReviewSubmitted={loadInitialData}
      />
    </div>
  );
}

export default App;
