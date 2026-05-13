import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login";
import NotesDashboard from "./pages/NotesDashboard";

const App = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<AppLayout />}>
      <Route path="/notes" element={<NotesDashboard />} />
      <Route path="/" element={<Navigate to="/notes" replace />} />
      <Route path="*" element={<Navigate to="/notes" replace />} />
    </Route>
  </Routes>
);

export default App;
