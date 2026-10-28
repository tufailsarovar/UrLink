
import { Box } from "@mui/material";
import { motion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

const MotionBox = motion.create(Box);

export default function MainLayout() {
  const location = useLocation();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#FCFCFF",
        color: "#241A38",
      }}
    >
      <Navbar />

      <Box
        component="main"
        className="app-main"
        sx={{
          flex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <MotionBox
          key={location.pathname}
          initial={{ opacity: 0, y: 7 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          sx={{
            flex: 1,
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Outlet />
        </MotionBox>
      </Box>

      <Footer />
    </Box>
  );
}
