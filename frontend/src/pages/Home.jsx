import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaGoogle, FaEnvelope } from "react-icons/fa";
import ArtifactPanel from "../components/ArtifactPanel";
import ChatArea from "../components/ChatArea";
import Sidebar from "../components/Sidebar";
import Logo from "../components/Logo";
import api from "../utils/axios";
import { setUserData } from "../redux/user.slice";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";

function Home() {
  const { userData } = useSelector(state => state.user);
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const login = async (token) => {
    try {
      const { data } = await api.post(`/api/auth/login`, { token })
      dispatch(setUserData(data.user))
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setErrorMsg(error.response?.data?.message || error.message || "Backend login failed");
      setIsLoading(false);
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setErrorMsg("");
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      await login(token);
    } catch (error) {
      console.log(error);
      setErrorMsg(error.message || "Google Sign-in failed");
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      setErrorMsg("");
      setIsLoading(true);
      let result;
      if (isSignUp) {
        if (!name.trim()) throw new Error("Name is required for sign up");
        result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
      }
      const token = await result.user.getIdToken(true);
      await login(token);
    } catch (error) {
      console.log(error);
      setErrorMsg(error.message || "Authentication failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-brand-bg text-brand-text font-['Inter'] overflow-hidden">
      <Sidebar />
      <ChatArea />
      <ArtifactPanel />

      {!userData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
          <div className="w-[900px] h-[550px] bg-brand-card border border-brand-border rounded-2xl shadow-2xl flex overflow-hidden">

            {/* Left Side */}
            <div className="hidden md:flex w-1/2 bg-brand-bg border-r border-brand-border p-12 flex-col relative overflow-hidden">

              {/* Decorative background elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] opacity-20 pointer-events-none">
                <svg viewBox="0 0 100 100" className="w-full h-full text-brand-primary" fill="none" stroke="currentColor" strokeWidth="0.5">
                  <path d="M0,50 Q25,25 50,50 T100,50" strokeOpacity="0.2" />
                  <path d="M0,60 Q25,35 50,60 T100,60" strokeOpacity="0.3" />
                  <path d="M0,70 Q25,45 50,70 T100,70" strokeOpacity="0.1" />
                  <circle cx="20" cy="70" r="1.5" fill="currentColor" stroke="none" />
                  <circle cx="80" cy="80" r="1" fill="currentColor" stroke="none" />
                  <circle cx="60" cy="30" r="2" fill="currentColor" stroke="none" opacity="0.5" />
                </svg>
              </div>

              <div className="flex-1 flex flex-col justify-center relative z-10 -mt-12">
                <Logo size="large" className="mb-12" />

                <div>
                  <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-brand-text mb-4">The unified workspace.</h2>
                  <p className="text-sm text-brand-text-muted leading-relaxed max-w-[280px]">
                    Switch seamlessly between chat, code generation, PDF analysis, and presentation creation without losing context.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side */}
            <div className="w-full md:w-1/2 p-12 flex flex-col justify-center items-center bg-brand-card relative">
              <div className="w-full max-w-[320px] flex flex-col items-center text-center">

                <Logo size="default" className="mb-6 md:hidden" />

                <div className="hidden md:flex justify-center mb-6">
                  <div className="w-fit px-6 h-16 rounded-2xl bg-brand-bg flex items-center justify-center shadow-sm border border-brand-border">
                    <Logo size="small" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-brand-text mb-2">
                  {isSignUp ? "Create an account" : "Welcome back"}
                </h2>
                <p className="text-sm text-brand-text-muted mb-6">
                  {isSignUp ? "Sign up to start your workspace." : "Sign in to your workspace."}
                </p>

                {errorMsg && (
                  <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100 mb-4 w-full">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleEmailAuth} className="w-full flex flex-col gap-3 mb-4">
                  {isSignUp && (
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary/50 transition-colors text-brand-text"
                      required
                    />
                  )}
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary/50 transition-colors text-brand-text"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary/50 transition-colors text-brand-text"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-1 flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-primary hover:bg-brand-hover transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(234,88,12,0.23)]"
                  >
                    {isLoading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
                  </button>
                </form>

                <div className="w-full flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-brand-border"></div>
                  <span className="text-[11px] font-medium text-brand-text-muted uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-brand-border"></div>
                </div>

                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  type="button"
                  className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl text-sm font-medium text-brand-text bg-brand-bg border border-brand-border hover:bg-white/5 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                >
                  <FaGoogle size={14} className="text-[#EA4335]" />
                  Continue with Google
                </button>

                <p className="text-sm text-brand-text-muted">
                  {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                  <button 
                    type="button" 
                    onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(""); }} 
                    className="text-brand-primary font-medium hover:underline cursor-pointer bg-transparent border-none"
                  >
                    {isSignUp ? "Sign in" : "Sign up"}
                  </button>
                </p>

                <p className="text-[11px] text-brand-text-muted mt-6 px-4 text-center">
                  By continuing, you agree to our <Link to="/terms" className="text-brand-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-brand-primary hover:underline">Privacy Policy</Link>.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Home;