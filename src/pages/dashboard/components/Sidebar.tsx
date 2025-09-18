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
  Settings,
  DirectoryDomain,
  DocumentMultiple_01,
} from '@carbon/icons-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardLayout() {
  const [isSideNavExpanded, setIsSideNavExpanded] = useState(false);
  const navigate = useNavigate();

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
        <HeaderName prefix="PIMS" onClick={() => navigate('/dashboard')}>
          Dashboard
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
          <HeaderGlobalAction
            aria-label="Notifications"
            onClick={() => navigate('/notifications')}
          >
            <Notification size={20} />
          </HeaderGlobalAction>

          <HeaderGlobalAction
            aria-label="User account"
            onClick={() => navigate('/settings')}
          >
            <Settings size={20} />
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
          <SideNavLink
            onClick={() => navigate('/dashboard/home')}
            renderIcon={Home}
          >
            Home
          </SideNavLink>
          <SideNavLink
            onClick={() => navigate('/dashboard/inventory')}
            renderIcon={InventoryManagement}
          >
            Inventory
          </SideNavLink>
          <SideNavLink
            onClick={() => navigate('/dashboard/categories')}
            renderIcon={DocumentMultiple_01}
          >
            Categories
          </SideNavLink>
          <SideNavLink
            onClick={() => navigate('/dashboard/locations')}
            renderIcon={DirectoryDomain}
          >
            Locations
          </SideNavLink>
          <SideNavLink
            onClick={() => navigate('/dashboard/suppliers')}
            renderIcon={Package}
          >
            Suppliers
          </SideNavLink>
          <SideNavLink
            onClick={() => navigate('/dashboard/employees')}
            renderIcon={UserAdmin}
          >
            Employees
          </SideNavLink>
          <SideNavLink
            onClick={() => navigate('/dashboard/products')}
            renderIcon={ShoppingCart}
          >
            Products
          </SideNavLink>
          <SideNavLink
            onClick={() => navigate('/dashboard/orders')}
            renderIcon={DocumentTasks}
          >
            Orders
          </SideNavLink>
          <SideNavLink
            onClick={() => navigate('/dashboard/reports')}
            renderIcon={Report}
          >
            Reports
          </SideNavLink>
          <SideNavLink
            onClick={() => navigate('/dashboard/audit')}
            renderIcon={DocumentTasks}
          >
            Audit Log
          </SideNavLink>
          <SideNavLink
            onClick={() => navigate('/dashboard/transactions')}
            renderIcon={DocumentTasks}
          >
            Transactions
          </SideNavLink>
          <SideNavLink
            onClick={() => navigate('/dashboard/analytics')}
            renderIcon={Report}
          >
            Analytics
          </SideNavLink>
          <SideNavLink
            onClick={() => navigate('/notifications')}
            renderIcon={Notification}
          >
            Notifications
          </SideNavLink>
        </SideNavItems>
      </SideNav>
    </>
  );
}
