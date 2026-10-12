import "@/App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/AppShell";
import Dashboard from "@/pages/Dashboard";
import StudyChapters from "@/pages/StudyChapters";
import StudySession from "@/pages/StudySession";
import ExamSetup from "@/pages/ExamSetup";
import ExamRunner from "@/pages/ExamRunner";
import ExamResults from "@/pages/ExamResults";
import WrongAnswers from "@/pages/WrongAnswers";
import Courses from "@/pages/Courses";
import Landing from "@/pages/Landing";
import { AuthPage } from "@/pages/Auth";
import { RequireAuth } from "@/components/RequireAuth";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<AuthPage mode="signin" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/wrong-answers" element={<WrongAnswers />} />
            <Route path="/subject/:sid/study" element={<StudyChapters />} />
            <Route path="/subject/:sid/study/:cid" element={<StudySession />} />
            <Route path="/subject/:sid/exam" element={<ExamSetup />} />
            <Route path="/exam/results" element={<ExamResults />} />
          </Route>
        </Route>
        <Route path="/exam/run" element={<RequireAuth><ExamRunner /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Toaster theme="light" position="bottom-right" richColors />
    </BrowserRouter>
  );
}

export default App;
