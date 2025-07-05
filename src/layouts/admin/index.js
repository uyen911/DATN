import { Box, useDisclosure, Portal } from "@chakra-ui/react";
import Footer from "components/footer/FooterAdmin.js";
import Navbar from "components/navbar/NavbarAdmin.js";
import Sidebar from "components/sidebar/Sidebar.js";
import { SidebarContext } from "contexts/SidebarContext";
import React, { useState } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import routes from "routes.js";

export default function Dashboard(props) {
  const { ...rest } = props;

  // States
  const [fixed] = useState(false);
  const [toggleSidebar, setToggleSidebar] = useState(false);
  const { onOpen } = useDisclosure();
  const user = JSON.parse(localStorage.getItem("user")); // Assuming user info is in localStorage
  const getRoute = () => {
    return window.location.pathname !== "/admin/full-screen-maps";
  };
  // Function to determine whether to show the route
  const getFilteredRoutes = (routes, userRole) => {
    return routes.filter((route) => {
      if (userRole === "admin") {
        return [
          "/default",
          "/category",
          "/service",
          "/approvel",
          "/user", "/booking", "/branch",
          "/work-schedule-management",
          "/profile","/banner","/branchstaff",
        ].includes(route.path);
      } else if (userRole === "manager") {
        return [
          "/booking",
          "/work-schedule-management",
          "/default",
          "/profile",
        ].includes(route.path);
      } else if (userRole === "staff") {
        return [
          "/staff-order",
          "/work-schedule",
          "/personal-revenue",
          "/profile",
        ].includes(route.path);
      }
      return false; // Default: no routes for invalid roles
    });
  };

  // Get filtered routes based on user role
  const filteredRoutes = getFilteredRoutes(routes, user?.user?.role);

  // Function to get the active route (for the sidebar)
  const getActiveRoute = (routes) => {
    let activeRoute = "Bạn không có quyền truy cập";
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse) {
        let collapseActiveRoute = getActiveRoute(routes[i].items);
        if (collapseActiveRoute !== activeRoute) {
          return collapseActiveRoute;
        }
      } else if (routes[i].category) {
        let categoryActiveRoute = getActiveRoute(routes[i].items);
        if (categoryActiveRoute !== activeRoute) {
          return categoryActiveRoute;
        }
      } else {
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        ) {
          return routes[i].name;
        }
      }
    }
    return activeRoute;
  };

  // Function to get active navbar
  const getActiveNavbar = (routes) => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse) {
        let collapseActiveNavbar = getActiveNavbar(routes[i].items);
        if (collapseActiveNavbar !== activeNavbar) {
          return collapseActiveNavbar;
        }
      } else if (routes[i].category) {
        let categoryActiveNavbar = getActiveNavbar(routes[i].items);
        if (categoryActiveNavbar !== activeNavbar) {
          return categoryActiveNavbar;
        }
      } else {
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        ) {
          return routes[i].secondary;
        }
      }
    }
    return activeNavbar;
  };

  // Function to get active navbar text
  const getActiveNavbarText = (routes) => {
    let activeNavbar = false;
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].collapse) {
        let collapseActiveNavbar = getActiveNavbarText(routes[i].items);
        if (collapseActiveNavbar !== activeNavbar) {
          return collapseActiveNavbar;
        }
      } else if (routes[i].category) {
        let categoryActiveNavbar = getActiveNavbarText(routes[i].items);
        if (categoryActiveNavbar !== activeNavbar) {
          return categoryActiveNavbar;
        }
      } else {
        if (
          window.location.href.indexOf(routes[i].layout + routes[i].path) !== -1
        ) {
          return routes[i].messageNavbar;
        }
      }
    }
    return activeNavbar;
  };

  // Render routes based on the filtered list
  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/admin") {
        return (
          <Route
            path={prop.layout + prop.path}
            component={prop.component}
            key={key}
          />
        );
      }
      if (prop.collapse) {
        return getRoutes(prop.items);
      }
      if (prop.category) {
        return getRoutes(prop.items);
      } else {
        return null;
      }
    });
  };

  return (
    <Box>
      <Box>
        <SidebarContext.Provider
          value={{
            toggleSidebar,
            setToggleSidebar,
          }}
        >
          <Sidebar routes={filteredRoutes} display="none" {...rest} />
          <Box
            float="right"
            minHeight="100vh"
            height="100%"
            overflow="auto"
            position="relative"
            maxHeight="100%"
            w={{ base: "100%", xl: "calc( 100% - 290px )" }}
            maxWidth={{ base: "100%", xl: "calc( 100% - 290px )" }}
            transition="all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)"
            transitionDuration=".2s, .2s, .35s"
            transitionProperty="top, bottom, width"
            transitionTimingFunction="linear, linear, ease"
          >
            <Portal>
              <Box>
                <Navbar
                  onOpen={onOpen}
                  logoText={"Horizon UI Dashboard PRO"}
                  brandText={getActiveRoute(filteredRoutes)}
                  secondary={getActiveNavbar(filteredRoutes)}
                  message={getActiveNavbarText(filteredRoutes)}
                  fixed={fixed}
                  {...rest}
                />
              </Box>
            </Portal>
            {getRoute() ? (
              <Box
                mx="auto"
                p={{ base: "20px", md: "30px" }}
                pe="20px"
                minH="100vh"
                pt="50px"
              >
                <Switch>
                  {getRoutes(filteredRoutes)}
                  <Redirect from="/" to="/admin/profile" />
                </Switch>
              </Box>
            ) : null}
            <Box>
              <Footer />
            </Box>
          </Box>
        </SidebarContext.Provider>
      </Box>
    </Box>
  );
}
