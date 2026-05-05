import { motion } from "framer-motion";
import { Compass, MapPin, Plane, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  { icon: Compass, title: "Plan day-by-day", desc: "Organize destinations, dates, and activities in a clean timeline." },
  { icon: MapPin, title: "Drag to reorder", desc: "Rearrange your day with smooth drag-and-drop interactions." },
  { icon: Sparkles, title: "XML / XSLT export", desc: "Export your trip as structured XML, rendered with a stylesheet." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const Landing = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-sand">
      <header className="container flex items-center justify-between py-6">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <Plane className="h-5 w-5 text-primary" />
          Wayfare
        </div>
        <nav className="flex items-center gap-3">
          {user ? (
            <Button asChild><Link to="/dashboard">Dashboard</Link></Button>
          ) : (
            <>
              <Button variant="ghost" asChild><Link to="/auth">Sign in</Link></Button>
              <Button asChild><Link to="/auth">Get started</Link></Button>
            </>
          )}
        </nav>
      </header>

      <main>
        <section className="container py-20 md:py-32 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <p className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-card">
              <Sparkles className="h-3.5 w-3.5 text-accent" /> Plan trips that actually happen
            </p>
            <h1 className="mt-6 text-5xl md:text-7xl font-semibold leading-[1.05] tracking-tight">
              Travel itineraries
              <br />
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
              Build day-by-day plans, reorder activities with a drag, and export everything as structured XML.
            </p>
            <div className="mt-10 flex items-center justify-center gap-3">
              <Button size="lg" asChild className="shadow-elegant">
                <Link to={user ? "/dashboard" : "/auth"}>Start planning</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#features">See how it works</a>
              </Button>
            </div>
          </motion.div>
        </section>

        <section id="features" className="container py-24">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={fadeUp}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl bg-card p-8 shadow-card transition-smooth hover:shadow-elegant hover:-translate-y-1"
              >
                <f.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-5 text-xl">{f.title}</h3>
                <p className="mt-2 text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
