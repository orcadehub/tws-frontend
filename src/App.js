// import { Buffer } from 'buffer';  // Polyfill for Buffer
// global.Buffer = Buffer; // Make Buffer available globally
import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Leader from "./pages/Leader";
import Friends from "./pages/Friends";
import Tasks from "./pages/Tasks";
import AirDrop from "./pages/Airdrop";
import Signup from "./pages/Signup";
import AddTask from "./pages/AddTask";
import Onboarding from "./pages/Onboarding";
// import Demo from "./pages/Demo";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Landing from "./pages/Landing";
import Error from "./components/Error";
function App() {
  useEffect(() => {
    // Disable double-tap zoom
    const handleGestureStart = (e) => e.preventDefault();
    document.addEventListener("gesturestart", handleGestureStart);

    // Prevent zoom on pinch gestures
    const handleTouchMove = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    document.addEventListener("touchmove", handleTouchMove, { passive: false });

    // Cleanup event listeners on unmount
    return () => {
      document.removeEventListener("gesturestart", handleGestureStart);
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/game" element={<Landing />} />
          <Route exact path="/home" element={<Home />} />
          <Route exact path="/onboarding" element={<Landing />} />
          <Route exact path="/error" element={<Error />} /> 
          {/* Dynamic route for referral ID */}
          <Route exact path="/verify-chatid/:chatid" element={<Signup />} />
          {/* New route for chatid */}
          <Route exact path="/toplist" element={<Leader />} />
          <Route exact path="/friends" element={<Friends />} />
          <Route exact path="/tasks" element={<Tasks />} />
          <Route exact path="/airdrop" element={<AirDrop />} />
          <Route exact path="/addtask" element={<AddTask />} />
        </Routes>

        <ConditionalHeader />
      </Router>
      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        draggable
      />
    </>
  );
}

function ConditionalHeader() {
  const location = useLocation();

  // Don't show the Header on certain routes
  const noHeaderRoutes = ["/onboarding", "/verify-chatid","/game","/error"];
  const isHeaderHidden = noHeaderRoutes.some((path) =>
    location.pathname.startsWith(path.split(":")[0])
  );

  return !isHeaderHidden && <Header />;
}

export default App;
