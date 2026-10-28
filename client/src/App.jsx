
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";

import MainLayout from "./layouts/MainLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const Home = lazy(() => import("./pages/Home.jsx"));
const Latest = lazy(() => import("./pages/Latest.jsx"));
const Categories = lazy(() => import("./pages/Categories.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));
const ManageLinks = lazy(() => import("./pages/ManageLinks.jsx"));
const AddLink = lazy(() => import("./pages/AddLink.jsx"));
const EditLink = lazy(() => import("./pages/EditLink.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const ManageCategories = lazy(() => import("./pages/ManageCategories.jsx"));
const ManageUsers = lazy(() => import("./pages/ManageUsers.jsx"));
const ResourceDetails = lazy(() => import("./pages/ResourceDetails.jsx"));

const LegalPage = lazy(() => import("./pages/legal/LegalPage.jsx"));

function PageLoader() {
  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      sx={{
        minHeight: "45vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#FCFCFF",
      }}
    >
      <CircularProgress
        size={30}
        thickness={4}
        sx={{ color: "#8052D6" }}
      />
    </Box>
  );
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="latest" element={<Latest />} />
          <Route path="categories" element={<Categories />} />
          <Route path="resource/:id" element={<ResourceDetails />} />
          <Route path="login" element={<Login />} />

          <Route path="about" element={<LegalPage page="about" />} />
          <Route path="contact" element={<LegalPage page="contact" />} />
          <Route path="terms" element={<LegalPage page="terms" />} />
          <Route path="privacy" element={<LegalPage page="privacy" />} />
          <Route path="disclaimer" element={<LegalPage page="disclaimer" />} />
          <Route path="cookies" element={<LegalPage page="cookies" />} />
          <Route
            path="report-resource"
            element={<LegalPage page="report-resource" />}
          />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="links" element={<ManageLinks />} />
          <Route path="links/new" element={<AddLink />} />
          <Route path="links/:id/edit" element={<EditLink />} />
        </Route>

        <Route
          path="/admin/login"
          element={<Navigate to="/login" replace />}
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
