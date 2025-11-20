import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Search,
  Filter,
  Download,
  Shield,
  TrendingUp,
  Users,
  Building2,
  Globe,
  CheckCircle,
  ArrowRight,
  Star,
  BarChart3,
  Target,
  Rocket,
  Sparkles,
} from "lucide-react";

import LiveDataBar from "../components/Landing/LiveDataBar";
import DataNebula from "../components/Landing/DataNebula";
import LoginModal from "../components/Landing/LoginModal";
import RegisterModal from "../components/Landing/RegisterModal";
import PricingTable from "../components/Shared/PricingTable";
import TopNav from "../components/Shared/TopNav";
import Footer from "../components/Shared/Footer";

const LandingPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ leads: 10452, companies: 814, job_titles: 2109 });
  const [loading, setLoading] = useState<boolean>(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${apiBase}/public/stats`);
        if (res.ok) {
          const data = await res.json();
          setStats({
            leads: data.leads,
            companies: data.companies,
            job_titles: data.job_titles,
          });
        }
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [apiBase]);

  const features = [
    {
      icon: Search,
      title: "Advanced Search & Filters",
      description: "Find leads by job title, company, location, domain, and more with intelligent filtering.",
      color: "from-cyan to-blue-500",
    },
    {
      icon: Filter,
      title: "Smart Grouping",
      description: "Organize leads by company, create custom lists, and manage your pipeline efficiently.",
      color: "from-purple-500 to-magenta",
    },
    {
      icon: Download,
      title: "Export & Integration",
      description: "Export leads to CSV, integrate with your CRM, and take your data anywhere you need.",
      color: "from-blue-500 to-cyan",
    },
    {
      icon: Shield,
      title: "Verified Data",
      description: "All leads are verified and enriched with up-to-date information you can trust.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Analytics",
      description: "Track your search patterns, view insights, and optimize your outreach strategy.",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share lead lists, collaborate with your team, and scale your sales operations.",
      color: "from-pink-500 to-rose-500",
    },
  ];

  const benefits = [
    {
      icon: Rocket,
      title: "10x Faster Lead Discovery",
      description: "Find qualified leads in seconds, not hours. Our intelligent search cuts through the noise.",
    },
    {
      icon: Target,
      title: "Precision Targeting",
      description: "Filter by exact criteria - job titles, companies, locations, domains - and hit your ideal customer profile.",
    },
    {
      icon: BarChart3,
      title: "Data-Driven Decisions",
      description: "Get insights on top companies, job titles, and locations to refine your outreach strategy.",
    },
    {
      icon: Sparkles,
      title: "Always Fresh Data",
      description: "Our database is continuously updated with the latest information from verified sources.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Sales Director",
      company: "TechStart Inc.",
      quote: "Lead Nexus transformed our outbound strategy. We're closing 3x more deals with better-qualified leads.",
      rating: 5,
    },
    {
      name: "Michael Rodriguez",
      role: "Growth Manager",
      company: "ScaleUp Co.",
      quote: "The search filters are incredible. We found our perfect ICP in minutes, not days.",
      rating: 5,
    },
    {
      name: "Emily Watson",
      role: "Founder",
      company: "Startup Labs",
      quote: "Best investment we made this quarter. The ROI on our outreach campaigns has skyrocketed.",
      rating: 5,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-night text-white">
      <TopNav
        variant="landing"
        onLoginClick={() => setShowLoginModal(true)}
        onRegisterClick={() => setShowRegisterModal(true)}
      />

      {/* Hero Section */}
      <section className="relative flex min-h-screen flex-col justify-center px-6 pb-24 pt-32 md:px-14">
        <DataNebula />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-5xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-4 py-2 text-sm text-cyan"
          >
            <Sparkles className="h-4 w-4" />
            <span>Trusted by 500+ Sales Teams Worldwide</span>
          </motion.div>

          <h1 className="mt-5 text-5xl font-bold leading-tight text-white md:text-7xl lg:text-8xl">
            Find Your Perfect
            <br />
            <span className="bg-gradient-to-r from-cyan via-blue-400 to-magenta bg-clip-text text-transparent">
              B2B Leads
            </span>
            <br />
            in Seconds, Not Hours
          </h1>

          <p className="mt-6 text-xl text-gray-300 md:text-2xl">
            The most powerful lead discovery platform for modern sales teams. Search, filter, and export thousands of
            verified B2B contacts with precision targeting and real-time insights.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowRegisterModal(true)}
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan to-magenta px-8 py-4 text-lg font-semibold text-night shadow-2xl shadow-cyan/30 transition hover:shadow-cyan/50"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/pricing")}
              className="rounded-full border-2 border-white/20 bg-white/5 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 hover:border-white/30"
            >
              View Pricing
            </motion.button>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </motion.div>

        <LiveDataBar leads={stats.leads} companies={stats.companies} jobTitles={stats.job_titles} loading={loading} />
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-24 md:px-14">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-white md:text-5xl">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-cyan to-magenta bg-clip-text text-transparent">
                Scale Your Sales
              </span>
            </h2>
            <p className="mt-4 text-xl text-gray-400">
              Powerful features designed for modern sales teams who demand precision and speed
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group glass-panel rounded-3xl border border-white/10 p-8 transition hover:border-cyan/30 hover:shadow-2xl hover:shadow-cyan/10"
              >
                <div className={`mb-4 inline-flex rounded-2xl bg-gradient-to-br ${feature.color} p-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                <p className="mt-3 text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative z-10 px-6 py-24 md:px-14">
        <div className="glass-panel mx-auto max-w-7xl rounded-[36px] border border-white/10 p-12 md:p-16">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-white md:text-5xl">
                Why Sales Teams
                <br />
                <span className="bg-gradient-to-r from-cyan to-magenta bg-clip-text text-transparent">
                  Choose Lead Nexus
                </span>
              </h2>
              <p className="mt-6 text-lg text-gray-300">
                Join thousands of sales professionals who have transformed their outbound strategy with our platform.
              </p>
              <div className="mt-8 space-y-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan/20">
                      <benefit.icon className="h-6 w-6 text-cyan" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{benefit.title}</h3>
                      <p className="mt-1 text-gray-400">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8"
            >
              <p className="mb-6 text-sm uppercase tracking-[0.3em] text-gray-400">Platform Stats</p>
              <div className="space-y-6">
                {[
                  { label: "Data Accuracy", value: 98, color: "from-cyan to-blue-500" },
                  { label: "Search Speed", value: 95, color: "from-purple-500 to-magenta" },
                  { label: "User Satisfaction", value: 92, color: "from-blue-500 to-cyan" },
                ].map((stat, idx) => (
                  <div key={stat.label}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-gray-300">{stat.label}</span>
                      <span className="font-semibold text-white">{stat.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${stat.value}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.2, duration: 1 }}
                        className={`h-full rounded-full bg-gradient-to-r ${stat.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 px-6 py-24 md:px-14">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-white md:text-5xl">
              Loved by{" "}
              <span className="bg-gradient-to-r from-cyan to-magenta bg-clip-text text-transparent">
                Sales Teams
              </span>
            </h2>
            <p className="mt-4 text-xl text-gray-400">See what our customers are saying</p>
          </motion.div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="glass-panel rounded-3xl border border-white/10 p-8"
              >
                <div className="mb-4 flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-6 text-gray-300">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan to-magenta">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">
                      {testimonial.role} at {testimonial.company}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 px-6 py-24 md:px-14">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold text-white md:text-5xl">
              Choose Your{" "}
              <span className="bg-gradient-to-r from-cyan to-magenta bg-clip-text text-transparent">Plan</span>
            </h2>
            <p className="mt-4 text-xl text-gray-400">
              Flexible pricing designed for teams of all sizes. Start free, scale as you grow.
            </p>
          </motion.div>

          <div className="mt-16">
            <PricingTable
              onSelectPlan={(plan) => {
                localStorage.setItem("lead-nexus-preselected-plan", plan);
                setShowRegisterModal(true);
              }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-12 text-center"
          >
            <p className="text-gray-400">
              All plans include 14-day free trial • No credit card required • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-24 md:px-14">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-panel mx-auto max-w-5xl rounded-[36px] border border-cyan/30 bg-gradient-to-br from-cyan/10 to-magenta/10 p-12 text-center md:p-16"
        >
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Ready to Transform Your
            <br />
            <span className="bg-gradient-to-r from-cyan to-magenta bg-clip-text text-transparent">
              Sales Pipeline?
            </span>
          </h2>
          <p className="mt-6 text-xl text-gray-300">
            Join thousands of sales teams who are closing more deals with better-qualified leads.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowRegisterModal(true)}
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan to-magenta px-10 py-4 text-lg font-semibold text-night shadow-2xl shadow-cyan/30 transition hover:shadow-cyan/50"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLoginModal(true)}
              className="rounded-full border-2 border-white/20 bg-white/5 px-10 py-4 text-lg font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
            >
              Sign In
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Team Section */}
      <section id="team" className="relative z-10 px-6 py-24 md:px-14">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white md:text-5xl">
              Lead‑Nexus{" "}
              <span className="bg-gradient-to-r from-cyan to-magenta bg-clip-text text-transparent">
                Official Project Team
              </span>
            </h2>
            <p className="mt-4 text-xl text-gray-400">
              The multidisciplinary team powering engineering, AI and operations.
            </p>
          </motion.div>

          {/* Internal Guide */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="glass-panel rounded-3xl border border-cyan/30 bg-gradient-to-br from-cyan/10 to-magenta/10 p-8 md:p-10">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan to-magenta">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-white mb-2">Internal Guide</h3>
                  <p className="text-xl font-medium text-cyan mb-4">Prof. Aarti Bhargav Patel</p>
                  <p className="text-gray-300 mb-4">
                    Academic mentor providing supervision and domain guidance across software engineering, ethics, and
                    data compliance to ensure high‑quality outcomes.
                  </p>
                  <div className="mt-6 space-y-3">
                    <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Mentorship Focus</p>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-cyan mt-0.5 flex-shrink-0" />
                        <span>Architecture/design reviews for quality and maintainability</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-cyan mt-0.5 flex-shrink-0" />
                        <span>Security, privacy, and regulatory alignment (GDPR/CCPA)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-cyan mt-0.5 flex-shrink-0" />
                        <span>Evaluation of deliverables, documentation, and release readiness</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Team Members Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Atharva Meherkar",
                role: "Frontend Lead (React)",
                description: "Leads UI development to deliver a modern, responsive, and intuitive experience for all roles.",
                advantages: [
                  "Owns React-based dashboards and user-facing features",
                  "Optimizes performance and UX for fast, fluid navigation",
                  "Implements component library and design system consistency",
                ],
                gradient: "from-blue-500 to-cyan",
                icon: "💻",
              },
              {
                name: "Akash Mirande",
                role: "Backend Developer (Python/FastAPI)",
                description: "Builds scalable APIs and services with robust database integration and data processing.",
                advantages: [
                  "Designs FastAPI services and efficient PostgreSQL access",
                  "Implements CSV/Excel data processing and validation",
                  "Ensures API reliability and data integrity",
                ],
                gradient: "from-green-500 to-emerald-500",
                icon: "⚙️",
              },
              {
                name: "Usman Khan",
                role: "AI/ML Specialist",
                description: "Delivers ML capabilities for lead quality scoring and intelligent data processing.",
                advantages: [
                  "Develops rule-based lead scoring algorithms",
                  "Implements feature extraction for lead quality assessment",
                  "Builds scalable scoring systems for lead prioritization",
                ],
                gradient: "from-purple-500 to-magenta",
                icon: "🤖",
              },
              {
                name: "Yash Joshi",
                role: "DevOps & Infrastructure Lead",
                description: "Manages development environment, database setup and system configuration.",
                advantages: [
                  "Configures development and production environments",
                  "Manages database migrations and schema updates",
                  "Ensures system stability and deployment readiness",
                ],
                gradient: "from-orange-500 to-red-500",
                icon: "☁️",
              },
              {
                name: "Vedant Telgar",
                role: "QA & Security Lead",
                description: "Drives quality assurance, security implementation and code validation.",
                advantages: [
                  "Implements secure authentication and authorization",
                  "Validates data integrity and input sanitization",
                  "Ensures code quality and error handling across the application",
                ],
                gradient: "from-yellow-500 to-amber-500",
                icon: "🔒",
              },
            ].map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="glass-panel group rounded-3xl border border-white/10 p-6 transition hover:border-cyan/30 hover:shadow-2xl hover:shadow-cyan/10"
              >
                <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${member.gradient} text-2xl`}>
                  {member.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-1">{member.name}</h3>
                <p className="text-sm font-medium text-cyan mb-3">{member.role}</p>
                <p className="text-gray-400 mb-4 text-sm">{member.description}</p>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Key Advantages</p>
                  <ul className="space-y-2">
                    {member.advantages.map((advantage, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan flex-shrink-0" />
                        <span>{advantage}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
        }}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => {
          setShowRegisterModal(false);
        }}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />
    </div>
  );
};

export default LandingPage;
