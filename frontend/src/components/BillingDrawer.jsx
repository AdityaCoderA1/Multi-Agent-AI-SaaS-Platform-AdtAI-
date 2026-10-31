import { AnimatePresence, motion } from "framer-motion";
import { X, Check } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { createOrder } from "../features/billing.api";
import api from "../utils/axios";
import Logo from "./Logo";

export default function BillingDrawer({
  open,
  onClose
}) {

  const {userData}=useSelector(state=>state.user)
  const [activeTab, setActiveTab] = useState("plans"); // plans, usage

  const handleUpgrade = async (plan) => {
    try {
        const data = await createOrder(plan);
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY,
            amount: data.order.amount,
            currency: data.order.currency,
            name: "adtAI",
            description: `${data.plan.name} Plan`,
            order_id: data.order.id,
            handler: async (response) => {
              try {
                const {data}=await api.post("/api/billing/verify-payment", response);
                console.log(data)
              } catch (error) {
                console.log(error);
              }
            },
            theme: { color: "#F97316" }
        };
        const razorpay = new window.Razorpay(options);
        razorpay.open();
    } catch (error) {
        console.log(error);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-5xl bg-brand-bg rounded-2xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden border border-brand-border"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-brand-border bg-brand-card">
                <div>
                  <h2 className="text-brand-text text-2xl font-bold font-['Space_Grotesk'] tracking-tight">
                    Billing & Plans
                  </h2>
                  <div className="flex gap-6 mt-4">
                    <button 
                      onClick={() => setActiveTab("plans")}
                      className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'plans' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-text-muted hover:text-brand-text'}`}
                    >
                      Plans
                    </button>
                    <button 
                      onClick={() => setActiveTab("usage")}
                      className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${activeTab === 'usage' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-text-muted hover:text-brand-text'}`}
                    >
                      Usage
                    </button>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-brand-bg border border-brand-border hover:bg-gray-100 flex items-center justify-center transition-colors self-start"
                >
                  <X size={16} className="text-brand-text-muted hover:text-brand-text" />
                </button>
              </div>

              {/* Content */}
              <div className="p-8 bg-brand-bg flex-1 overflow-y-auto">
                {activeTab === "plans" ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Free Plan */}
                    <div className="bg-brand-card rounded-2xl border border-brand-border p-6 shadow-sm flex flex-col">
                      <h3 className="text-brand-text font-bold font-['Space_Grotesk'] text-xl">Free</h3>
                      <div className="mt-4 mb-2 flex items-baseline">
                        <span className="text-4xl font-black text-brand-text">$0</span>
                        <span className="text-brand-text-muted text-sm ml-1">/ month</span>
                      </div>
                      <p className="text-brand-text-muted text-sm mb-6 h-10">
                        For individuals getting started with adtAI.
                      </p>
                      
                      <div className="space-y-3 mb-8 flex-1">
                        <div className="flex items-start gap-2">
                          <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                          <span className="text-sm text-brand-text-muted">Limited messages</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                          <span className="text-sm text-brand-text-muted">Basic AI models</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                          <span className="text-sm text-brand-text-muted">Up to 3 documents</span>
                        </div>
                      </div>

                      <button className="w-full py-2.5 rounded-xl border border-brand-border text-brand-text-muted font-semibold text-sm cursor-not-allowed">
                        Current Plan
                      </button>
                    </div>

                    {/* Pro Plan */}
                    <div className="bg-brand-card rounded-2xl border-2 border-brand-primary p-6 shadow-md relative flex flex-col">
                      <span className="absolute -top-3 right-6 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                        Most Popular
                      </span>
                      <h3 className="text-brand-text font-bold font-['Space_Grotesk'] text-xl">Pro</h3>
                      <div className="mt-4 mb-2 flex items-baseline">
                        <span className="text-4xl font-black text-brand-text">$19</span>
                        <span className="text-brand-text-muted text-sm ml-1">/ month</span>
                      </div>
                      <p className="text-brand-text-muted text-sm mb-6 h-10">
                        For professionals who need more power and speed.
                      </p>
                      
                      <div className="space-y-3 mb-8 flex-1">
                        <div className="flex items-start gap-2">
                          <Check size={16} className="text-brand-primary mt-0.5 shrink-0" />
                          <span className="text-sm text-brand-text">Unlimited messages</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check size={16} className="text-brand-primary mt-0.5 shrink-0" />
                          <span className="text-sm text-brand-text">Advanced AI models</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check size={16} className="text-brand-primary mt-0.5 shrink-0" />
                          <span className="text-sm text-brand-text">Unlimited documents</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check size={16} className="text-brand-primary mt-0.5 shrink-0" />
                          <span className="text-sm text-brand-text">Priority support</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleUpgrade("pro")}
                        className="w-full py-2.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-white font-semibold text-sm transition-colors shadow-sm cursor-pointer"
                      >
                        Upgrade to Pro
                      </button>
                    </div>

                    {/* Team Plan */}
                    <div className="bg-brand-card rounded-2xl border border-brand-border p-6 shadow-sm flex flex-col">
                      <h3 className="text-brand-text font-bold font-['Space_Grotesk'] text-xl">Team</h3>
                      <div className="mt-4 mb-2 flex items-baseline">
                        <span className="text-4xl font-black text-brand-text">$49</span>
                        <span className="text-brand-text-muted text-sm ml-1">/ month</span>
                      </div>
                      <p className="text-brand-text-muted text-sm mb-6 h-10">
                        For teams collaborating with advanced features.
                      </p>
                      
                      <div className="space-y-3 mb-8 flex-1">
                        <div className="flex items-start gap-2">
                          <Check size={16} className="text-brand-text mt-0.5 shrink-0" />
                          <span className="text-sm text-brand-text-muted">Everything in Pro</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check size={16} className="text-brand-text mt-0.5 shrink-0" />
                          <span className="text-sm text-brand-text-muted">Team workspace</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check size={16} className="text-brand-text mt-0.5 shrink-0" />
                          <span className="text-sm text-brand-text-muted">Shared documents</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check size={16} className="text-brand-text mt-0.5 shrink-0" />
                          <span className="text-sm text-brand-text-muted">Admin controls</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleUpgrade("team")}
                        className="w-full py-2.5 rounded-xl border border-brand-border text-brand-text hover:bg-gray-50 font-semibold text-sm transition-colors cursor-pointer"
                      >
                        Upgrade to Team
                      </button>
                    </div>

                  </div>
                ) : (
                  <div className="bg-brand-card rounded-2xl border border-brand-border p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
                    <Logo size="large" className="opacity-50 mb-4 grayscale" />
                    <h3 className="text-brand-text text-xl font-bold">Usage Metrics</h3>
                    <p className="text-brand-text-muted text-sm mt-2 max-w-md text-center">
                      You have used {userData?.credits || 0} out of your {userData?.totalCredits || 100} credits this month.
                    </p>
                    <div className="w-full max-w-md mt-6">
                       <div className="h-3 rounded-full bg-brand-bg border border-brand-border overflow-hidden">
                        <div
                          className="h-full bg-brand-primary transition-all duration-500"
                          style={{
                            width: `${Math.min(100, ((userData?.credits || 0) / (userData?.totalCredits || 1)) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-brand-border bg-brand-card text-center">
                 <p className="text-xs text-brand-text-muted flex justify-center items-center gap-1">
                   <span className="text-gray-400">🔒</span> Secure billing powered by Razorpay. You can cancel anytime.
                 </p>
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}