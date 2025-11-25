import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, Sparkles, Zap, Crown, ArrowLeft } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/Toast";

const Pricing = () => {
  const [plans, setPlans] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchPricing();
    fetchCurrentSubscription();
  }, []);

  const fetchPricing = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/subscriptions/pricing`
      );
      setPlans(response.data.data);
    } catch (error) {
      console.error("Error fetching pricing:", error);
      toast.error({ title: "Error", description: "Failed to load pricing plans" });
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/subscriptions/current`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCurrentSubscription(response.data.data);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  };

  const handleSubscribe = async (planKey) => {
    if (planKey === "free") {
      toast.info({ title: "Info", description: "You're already on the free plan!" });
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      // Create order
      const orderResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/subscriptions/create-order`,
        { plan: planKey },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { orderId, amount, publicKey } = orderResponse.data.data;

      // Razorpay payment
      const options = {
        key: publicKey,
        amount: amount,
        currency: "INR",
        name: "Super Pass",
        description: `${plans[planKey].name} Plan Subscription`,
        order_id: orderId,
        handler: async function (response) {
          try {
            await axios.post(
              `${import.meta.env.VITE_API_URL}/subscriptions/verify-payment`,
              {
                plan: planKey,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success({ 
              title: "Subscription Successful! 🎉", 
              description: `You are now subscribed to the ${plans[planKey].name} plan.` 
            });
            fetchCurrentSubscription();
          } catch (error) {
            toast.error({ 
              title: "Verification Failed", 
              description: "Payment verification failed. Please contact support." 
            });
          }
        },
        theme: {
          color: "#3b82f6",
        },
      };

      if (!window.Razorpay) {
        toast.error({ 
          title: "Error", 
          description: "Razorpay SDK failed to load. Please check your internet connection." 
        });
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast.error({ 
        title: "Subscription Failed", 
        description: error.response?.data?.message || "Failed to create subscription. Please try again." 
      });
    }
  };

  const getPlanIcon = (planKey) => {
    switch (planKey) {
      case "free":
        return <Sparkles className="w-6 h-6" />;
      case "pro":
        return <Zap className="w-6 h-6" />;
      case "ultra":
        return <Crown className="w-6 h-6" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white flex items-center justify-center">
        <div className="text-sm text-white/60">Loading pricing...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100svh] w-full bg-[#05070d] text-white overflow-hidden font-space">
      {/* Background layers - matching Dashboard theme */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0b0f1a] via-[#080b14] to-[#05070d]" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(900px_420px_at_84%_-10%,rgba(64,131,255,0.22),transparent_60%),radial-gradient(780px_360px_at_-18%_12%,rgba(0,174,255,0.12),transparent_60%)]" />
      <div
        aria-hidden="true"
        className="fixed right-[-14%] top-[-22%] w-[86%] h-[68%] opacity-45 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(120,150,255,.14) 0 1px, transparent 1px 32px),repeating-linear-gradient(90deg, rgba(120,150,255,.14) 0 1px, transparent 1px 32px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(72% 72% at 100% 0%, black 38%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(72% 72% at 100% 0%, black 38%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto w-[92%] max-w-[1200px] pb-28 pt-6 md:pt-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-blue-500" />
              <span className="h-3 w-3 rounded bg-indigo-500" />
              <span className="h-3 w-3 rounded bg-emerald-500" />
              <span className="ml-1 h-[10px] w-[10px] rounded-sm border border-white/20" />
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              <span className="font-forum text-[#19cfbc]">Pricing</span>
            </h1>
          </div>
          <p className="text-sm text-white/60">Choose the perfect plan for your event hosting needs</p>
          {currentSubscription && (
            <div className="mt-4 inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-blue-400/30 bg-blue-400/10 text-blue-200">
              Current Plan: <span className="font-semibold capitalize">{currentSubscription.plan}</span>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans &&
            Object.entries(plans).map(([key, plan]) => {
              const isCurrentPlan = currentSubscription?.plan === key;
              const isPro = key === "pro";

              return (
                <div
                  key={key}
                  className={`relative rounded-2xl border p-6 backdrop-blur-sm transition-all duration-300 ${
                    isPro
                      ? "border-blue-500/50 bg-white/10 scale-105"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {isPro && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      POPULAR
                    </div>
                  )}

                  {/* Icon */}
                  <div className="h-12 w-12 rounded-xl bg-white/10 border border-white/10 grid place-items-center text-white/85 mb-4">
                    {getPlanIcon(key)}
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-2xl font-semibold text-white/90 mb-2">
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">
                      ₹{plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-sm text-white/60 ml-2">/month</span>
                    )}
                  </div>

                  {/* Events Limit */}
                  <div className="mb-6 text-sm text-white/70">
                    <span className="font-medium">
                      {plan.eventsLimit === null
                        ? "Unlimited"
                        : plan.eventsLimit}{" "}
                      event{plan.eventsLimit !== 1 ? "s" : ""}
                    </span>{" "}
                    per month
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-sm text-white/80">
                        <Check className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSubscribe(key)}
                    disabled={isCurrentPlan}
                    className={`w-full h-11 rounded-xl font-medium text-sm transition-all ${
                      isCurrentPlan
                        ? "bg-white/5 text-white/50 cursor-not-allowed border border-white/10"
                        : isPro
                        ? "bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white"
                        : "border border-white/10 bg-white/5 hover:bg-white/10 text-white"
                    }`}
                  >
                    {isCurrentPlan
                      ? "Current Plan"
                      : key === "free"
                      ? "Get Started"
                      : "Subscribe Now"}
                  </button>
                </div>
              );
            })}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-xs text-white/60">
            All plans include secure payment processing and 24/7 customer support
          </p>
          <p className="text-xs text-white/60 mt-1">
            Cancel anytime • No hidden fees • Instant activation
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
