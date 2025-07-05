import { mode } from "@chakra-ui/theme-tools";

export const globalStyles = {
  colors: {
    brand: {
      100: "#E6F0FA", // Xanh biển nhạt
      200: "#A3D8F4", // Xanh biển sáng
      300: "#7CC6E8",
      400: "#54B4DC",
      500: "#2A67D0", // Màu xanh biển chủ đạo
      600: "#2459B3",
      700: "#1E4A96",
      800: "#183B79",
      900: "#132D5C",
    },
    brandScheme: {
      100: "#E6F0FA", // Xanh biển nhạt
      200: "#A3D8F4", // Xanh biển sáng
      300: "#7CC6E8",
      400: "#54B4DC",
      500: "#2A67D0", // Màu xanh biển chủ đạo
      600: "#2459B3",
      700: "#1E4A96",
      800: "#183B79",
      900: "#132D5C",
    },
    brandTabs: {
      100: "#E6F0FA", // Xanh biển nhạt
      200: "#A3D8F4", // Xanh biển sáng
      300: "#7CC6E8",
      400: "#54B4DC",
      500: "#2A67D0", // Màu xanh biển chủ đạo
      600: "#2459B3",
      700: "#1E4A96",
      800: "#183B79",
      900: "#132D5C",
    },
    secondaryGray: {
      100: "#E0E5F2",
      200: "#E1E9F8",
      300: "#F4F7FE",
      400: "#E9EDF7",
      500: "#8F9BBA",
      600: "#A3AED0",
      700: "#707EAE",
      800: "#707EAE",
      900: "#1B2559",
    },
    red: {
      100: "#FEEFEE",
      500: "#EE5D50",
      600: "#E31A1A",
    },
    blue: {
      50: "#EFF4FB",
      500: "#3965FF",
    },
    orange: {
      100: "#FFF6DA",
      500: "#FFB547",
    },
    green: {
      100: "#E6FAF5",
      500: "#01B574",
    },
    navy: {
      50: "#d0dcfb",
      100: "#aac0fe",
      200: "#a3b9f8",
      300: "#728fea",
      400: "#3652ba",
      500: "#1b3bbb",
      600: "#24388a",
      700: "#1B254B",
      800: "#111c44",
      900: "#0b1437",
    },
    gray: {
      100: "#FAFCFE",
    },
  },
  styles: {
    global: (props) => ({
      body: {
        overflowX: "hidden",
        bg: mode("secondaryGray.300", "navy.900")(props),
        fontFamily: "Roboto", // Sử dụng font Roboto
        letterSpacing: "-0.5px",
      },
      input: {
        color: "gray.700",
      },
      html: {
        fontFamily: "Roboto", // Sử dụng font Roboto
      },
    }),
  },
};
