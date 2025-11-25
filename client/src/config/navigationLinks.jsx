// src/config/navigationLinks.jsx
import {
  Home as HomeIcon,
  LayoutGrid,
  Ticket,
  CalendarDays,
  Plus,
  QrCode,
  IndianRupee,
  Tag,
  Settings,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";

/**
 * Centralized navigation links configuration for the command palette.
 * This ensures all pages show the same links in the same order.
 * Individual pages should filter out their own route when displaying.
 */
export const navigationLinks = [
  {
    title: "Home",
    desc: "Back to the homepage",
    icon: <HomeIcon className="h-5 w-5" />,
    route: "/",
    group: "Navigation",
    auth: false,
  },
  {
    title: "Dashboard",
    desc: "Creator control center",
    icon: <LayoutGrid className="h-5 w-5" />,
    route: "/dashboard",
    group: "Navigation",
    auth: true,
  },
  {
    title: "My Passes",
    desc: "View tickets you purchased",
    icon: <Ticket className="h-5 w-5" />,
    route: "/my-passes",
    group: "Navigation",
    auth: true,
  },
  {
    title: "Events",
    desc: "Browse all events",
    icon: <CalendarDays className="h-5 w-5" />,
    route: "/events",
    group: "Navigation",
    auth: false,
  },
  {
    title: "Withdrawals",
    desc: "Manage earnings & withdrawals",
    icon: <IndianRupee className="h-5 w-5" />,
    route: "/withdrawals",
    group: "Navigation",
    auth: true,
  },
  {
    title: "Pricing",
    desc: "View subscription plans",
    icon: <Tag className="h-5 w-5" />,
    route: "/pricing",
    group: "Navigation",
    auth: false,
  },
  {
    title: "Create Event",
    desc: "Publish a new event",
    icon: <Plus className="h-5 w-5" />,
    route: "/events/create",
    group: "Actions",
    auth: true,
  },
  {
    title: "Scan Tickets",
    desc: "Open QR scanner",
    icon: <QrCode className="h-5 w-5" />,
    route: "/scan",
    group: "Actions",
    auth: true,
  },
  {
    title: "Settings",
    desc: "Profile & app preferences",
    icon: <Settings className="h-5 w-5" />,
    route: "/settings",
    group: "Navigation",
    auth: true,
  },
  {
    title: "Help",
    desc: "FAQs and support",
    icon: <HelpCircle className="h-5 w-5" />,
    route: "/help",
    group: "Support",
    auth: false,
  },
];

/**
 * Get filtered navigation links for a specific page
 * @param {string} currentRoute - The current page route to exclude
 * @param {boolean} isAuthenticated - Whether the user is authenticated
 * @param {object} user - The user object (for role-based links)
 * @returns {Array} Filtered navigation links
 */
export const getNavigationLinks = (currentRoute, isAuthenticated, user = null) => {
  let links = [...navigationLinks];

  // Add admin-only links if user is admin
  if (user?.role === "admin") {
    links.push({
      title: "Admin Withdrawals",
      desc: "Manage all withdrawal requests",
      icon: <ShieldCheck className="h-5 w-5" />,
      route: "/admin/withdrawals",
      group: "Admin",
      auth: true,
    });
  }

  // Filter by authentication
  links = links.filter((l) => (l.auth ? isAuthenticated : true));

  // Exclude current page
  links = links.filter((l) => l.route !== currentRoute);

  return links;
};
