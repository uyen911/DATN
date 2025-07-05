import React from "react";
import { Icon } from "@chakra-ui/react";
import {
  MdPerson,
  MdHome,
  MdLock,
  MdOutlineShoppingCart,
  MdCategory,
  MdOutlineReceiptLong,
  MdOutlineLocalOffer,
  MdOutlinePeopleAlt,
  MdOutlinePhotoSizeSelectLarge,
  MdSchedule,
  MdEventNote,
  MdAttachMoney,
  MdSupervisedUserCircle,
  MdBusiness, // Thêm icon mới cho chi nhánh
} from "react-icons/md";

// Import các view
import MainDashboard from "views/admin/default";
import Profile from "views/admin/profile";
import Category from "views/admin/categories";
import Order from "views/admin/orders";
import User from "views/admin/user";
import Product from "views/admin/products";
import ProfileApproval from "views/admin/profileapproval";
import StaffOrders from "views/admin/stafforder";
import WorkSchedule from "views/admin/workSchedule";
import WorkScheduleManagement from "views/admin/workScheduleAdmin";
import PersonalRevenue from "views/admin/personalRevenue";
import Banner from "views/admin/banner";
import Branch from "views/admin/branch";
import BranchStaff from "views/admin/branchstaff";
import SignInCentered from "views/auth/signIn";

const user = JSON.parse(localStorage.getItem("user"));

const routes = [
  // Trang chủ
  {
    name: "Trang chủ",
    layout: "/admin",
    path: "/default",
    icon: <Icon as={MdHome} width="20px" height="20px" color="#2563EB" />,
    component: MainDashboard,
  },
  // Đặt lịch
  {
    name: "Đặt lịch",
    layout: "/admin",
    path: "/booking",
    icon: <Icon as={MdOutlineReceiptLong} width="20px" height="20px" color="#2563EB" />,
    component: Order,
  },
  // Danh mục
  {
    name: "Danh mục",
    layout: "/admin",
    path: "/category",
    icon: <Icon as={MdCategory} width="20px" height="20px" color="#2563EB" />,
    component: Category,
  },
    // Chi nhánh quản lý nhân viên
  {
    name: "Chi nhánh quản lý nhân viên",
    layout: "/admin",
    path: "/branchstaff",
    icon: <Icon as={MdSupervisedUserCircle} width="20px" height="20px" color="#2563EB" />,
    component: BranchStaff,
  },
  // Quản lý bản tin
  {
    name: "Quản lý bản tin",
    layout: "/admin",
    path: "/banner",
    icon: <Icon as={MdOutlineLocalOffer} width="20px" height="20px" color="#2563EB" />,
    component: Banner,
  },
  // Quản lý chi nhánh
  {
    name: "Quản lý chi nhánh",
    layout: "/admin",
    path: "/branch",
    icon: <Icon as={MdBusiness} width="20px" height="20px" color="#2563EB" />,
    component: Branch,
  },

  // Dịch vụ
  {
    name: "Dịch vụ",
    layout: "/admin",
    path: "/service",
    icon: <Icon as={MdOutlineShoppingCart} width="20px" height="20px" color="#2563EB" />,
    component: Product,
  },
  // Duyệt hồ sơ
  {
    name: "Duyệt hồ sơ",
    layout: "/admin",
    path: "/approvel",
    icon: <Icon as={MdOutlinePhotoSizeSelectLarge} width="20px" height="20px" color="#2563EB" />,
    component: ProfileApproval,
  },
  // Người dùng
  {
    name: "Người dùng",
    layout: "/admin",
    path: "/user",
    icon: <Icon as={MdOutlinePeopleAlt} width="20px" height="20px" color="#2563EB" />,
    component: User,
  },
  // Quản lý lịch làm việc (Admin)
  {
    name: "Quản lý lịch làm việc",
    layout: "/admin",
    path: "/work-schedule-management",
    icon: <Icon as={MdEventNote} width="20px" height="20px" color="#2563EB" />,
    component: WorkScheduleManagement,
  },
  // Lịch hẹn của tôi (nhân viên)
  {
    name: "Lịch hẹn của tôi",
    layout: "/admin",
    path: "/staff-order",
    icon: <Icon as={MdOutlineReceiptLong} width="20px" height="20px" color="#2563EB" />,
    component: StaffOrders,
  },
  // Lịch làm việc (nhân viên)
  {
    name: "Lịch làm việc",
    layout: "/admin",
    path: "/work-schedule",
    icon: <Icon as={MdSchedule} width="20px" height="20px" color="#2563EB" />,
    component: WorkSchedule,
  },
  // Doanh thu cá nhân
  {
    name: "Doanh thu cá nhân",
    layout: "/admin",
    path: "/personal-revenue",
    icon: <Icon as={MdAttachMoney} width="20px" height="20px" color="#2563EB" />,
    component: PersonalRevenue,
  },
  // Hồ sơ cá nhân
  {
    name: "Hồ sơ",
    layout: "/admin",
    path: "/profile",
    icon: <Icon as={MdPerson} width="20px" height="20px" color="#2563EB" />,
    component: Profile,
  },
  // Đăng nhập
  {
    name: "Đăng nhập",
    layout: "/auth",
    path: "/sign-in",
    icon: <Icon as={MdLock} width="20px" height="20px" color="#2563EB" />,
    component: SignInCentered,
  },
];

export default routes;
