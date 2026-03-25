import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import UploadResume from "./pages/UploadResume";
import ResumeDetails from "./pages/ResumeDetails";
import JobUpload from "./pages/JobUpload";
import JobRepository from "./pages/JobRepository";
import MatchesView from "./pages/MatchesView";
import LandingPage from "./pages/LandingPage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { PrivateRoute } from "./components/PrivateRoute";

export const App = () => (
  <BrowserRouter>
    <Routes>
     
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="uploadresume" element={<UploadResume />} />
        <Route path="resume/:id" element={<ResumeDetails />} />
        <Route path="job-upload" element={<JobUpload />} />
        <Route path="jobs" element={<JobRepository />} />
        <Route path="job/:id/matches" element={<MatchesView />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
