import {
  Header,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderMenuButton,
  SideNav,
  SideNavItems,
  SideNavLink,
} from '@carbon/react';
import {
  Notification,
  Home,
  InventoryManagement,
  UserAdmin,
  ShoppingCart,
  Report,
  DocumentTasks,
  Package,
  Logout,
  DirectoryDomain,
  DocumentMultiple_01,
  UserRole,
  // Settings,
} from '@carbon/icons-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import NotificationBadge from '../../../components/NotificationBadge';
import { useGlobalNotifications } from '../../../contexts/GlobalNotificationContext';

// Header component that uses the global notification context
const HeaderWithNotifications = () => {
  const [isSideNavExpanded, setIsSideNavExpanded] = useState(false);
  const navigate = useNavigate();
  const { logout, session } = useAuth();
  const { unreadCount } = useGlobalNotifications();

  const userRole = session?.user?.role;

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Still navigate to login even if logout API fails
      navigate('/login');
    }
  };

  return (
    <>
      {/* Global Header */}
      <Header aria-label="Pharma Dashboard">
        <HeaderMenuButton
          aria-label="Open menu"
          onClick={() => setIsSideNavExpanded(!isSideNavExpanded)}
          isActive={isSideNavExpanded}
          isCollapsible={true}
        />
        <HeaderName
          prefix="PIMS"
          onClick={() => {
            if (userRole === 'SELLER') {
              navigate('/dashboard/seller');
            } else if (userRole === 'ADMIN' || userRole === 'MANAGER') {
              navigate('/dashboard/admin');
            } else {
              navigate('/dashboard');
            }
          }}
        >
          {userRole === 'SELLER'
            ? 'Seller'
            : userRole === 'ADMIN' || userRole === 'MANAGER'
              ? 'Admin Dashboard'
              : 'Dashboard'}
        </HeaderName>

        {/* Right side icons */}
        <HeaderGlobalBar>
          {/* <HeaderGlobalAction
            aria-label="Search"
            onClick={() => setIsSearchOpen(!isSearchOpen)} 
          >
            <Search labelText="Search" />
          </HeaderGlobalAction>
            {/* Search Component */}
          {/* {isSearchOpen && (
            <div className="absolute top-16 right-6 bg-white shadow-md p-4 rounded-md z-50">
              <Search
                id="header-search"
                labelText="Search"
                placeholder="Search..."
                size="lg"
                onChange={(e) => console.log(e.target.value)}
              />
            </div>
          )} */}
          {userRole !== 'SELLER' && (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <HeaderGlobalAction
                aria-label="Notifications"
                onClick={() => navigate('/notifications')}
              >
                <Notification size={20} />
              </HeaderGlobalAction>
              <NotificationBadge count={unreadCount} />
            </div>
          )}

          {/* Settings page hidden */}
          {/* <HeaderGlobalAction
            aria-label="Settings"
            onClick={() => navigate('/settings')}
          >
            <Settings size={20} />
          </HeaderGlobalAction> */}

          <HeaderGlobalAction aria-label="Logout" onClick={handleLogout}>
            <Logout size={20} />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>

      {/* Sidebar */}
      <SideNav
        isFixedNav={false}
        isRail={true}
        enterDelayMs={100}
        isChildOfHeader
        expanded={isSideNavExpanded}
        aria-label="Side navigation"
      >
        <SideNavItems>
          {/* Home - hide for SELLER */}
          {userRole !== 'SELLER' && (
            <SideNavLink
              onClick={() => {
                if (userRole === 'ADMIN' || userRole === 'MANAGER') {
                  navigate('/dashboard/admin');
                } else {
                  navigate('/dashboard');
                }
              }}
              renderIcon={Home}
            >
              Home
            </SideNavLink>
          )}
          {/* Inventory - Admin and Manager only (Pharmacist uses Home) */}
          {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
            <SideNavLink
              onClick={() => navigate('/dashboard/inventory')}
              renderIcon={InventoryManagement}
            >
              Inventory
            </SideNavLink>
          )}
          {/* Categories - Admin, Manager, Pharmacist */}
          {(userRole === 'ADMIN' ||
            userRole === 'MANAGER' ||
            userRole === 'PHARMACIST') && (
            <SideNavLink
              onClick={() => navigate('/dashboard/categories')}
              renderIcon={DocumentMultiple_01}
            >
              Categories
            </SideNavLink>
          )}
          {/* Unit Types - Admin, Manager, Pharmacist */}
          {(userRole === 'ADMIN' ||
            userRole === 'MANAGER' ||
            userRole === 'PHARMACIST') && (
            <SideNavLink
              onClick={() => navigate('/dashboard/unit-types')}
              renderIcon={Package}
            >
              Unit Types
            </SideNavLink>
          )}
          {/* Locations - Admin and Manager only */}
          {(userRole === 'ADMIN' ||
            userRole === 'MANAGER' ||
            userRole === 'PHARMACIST') && (
            <SideNavLink
              onClick={() => navigate('/dashboard/locations')}
              renderIcon={DirectoryDomain}
            >
              Locations
            </SideNavLink>
          )}
          {/* Suppliers - Admin and Manager only */}
          {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
            <SideNavLink
              onClick={() => navigate('/dashboard/suppliers')}
              renderIcon={Package}
            >
              Suppliers
            </SideNavLink>
          )}
          {/* Employees - Admin only */}
          {userRole === 'ADMIN' && (
            <SideNavLink
              onClick={() => navigate('/dashboard/employees')}
              renderIcon={UserAdmin}
            >
              Employees
            </SideNavLink>
          )}
          {/* Products - Admin, Manager, Pharmacist */}
          {(userRole === 'ADMIN' ||
            userRole === 'MANAGER' ||
            userRole === 'PHARMACIST') && (
            <SideNavLink
              onClick={() => navigate('/dashboard/products')}
              renderIcon={ShoppingCart}
            >
              Products
            </SideNavLink>
          )}
          {/* Orders - Admin and Manager only */}
          {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
            <SideNavLink
              onClick={() => navigate('/dashboard/orders')}
              renderIcon={DocumentTasks}
            >
              Orders
            </SideNavLink>
          )}
          {/* Reports - Admin and Manager only */}
          {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
            <SideNavLink
              onClick={() => navigate('/dashboard/reports')}
              renderIcon={Report}
            >
              Reports
            </SideNavLink>
          )}
          {/* Audit Log - Admin and Manager only */}
          {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
            <SideNavLink
              onClick={() => navigate('/dashboard/audit')}
              renderIcon={DocumentTasks}
            >
              Audit Log
            </SideNavLink>
          )}
          {/* Transactions - Admin and Manager only */}
          {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
            <SideNavLink
              onClick={() => navigate('/dashboard/transactions')}
              renderIcon={DocumentTasks}
            >
              Transactions
            </SideNavLink>
          )}
          {/* Analytics - Admin and Manager only */}
          {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
            <SideNavLink
              onClick={() => navigate('/dashboard/analytics')}
              renderIcon={Report}
            >
              Analytics
            </SideNavLink>
          )}
          {/* Seller - Admin and Seller only (not Manager) */}
          {(userRole === 'ADMIN' || userRole === 'SELLER') && (
            <SideNavLink
              onClick={() => navigate('/dashboard/seller')}
              renderIcon={UserRole}
            >
              Seller
            </SideNavLink>
          )}
          {/* Removed Notifications sidebar link; header icon remains the entry point */}
          {false && (
            <SideNavLink
              onClick={() => navigate('/notifications')}
              renderIcon={Notification}
            >
              Notifications
            </SideNavLink>
          )}
        </SideNavItems>
      </SideNav>
    </>
  );
};

// Main component that renders the dashboard layout
export default function DashboardLayout() {
  return <HeaderWithNotifications />;
}
