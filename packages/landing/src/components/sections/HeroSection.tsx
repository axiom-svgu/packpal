import { motion } from "framer-motion";
import { CheckCircle, Users, ListChecks, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="container mx-auto py-12 md:py-24 px-4 relative overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
        {/* Left Column */}
        <motion.div
          className="flex flex-col gap-6 md:gap-8"
          initial="initial"
          animate="animate"
          variants={{
            animate: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {/* Heading */}
          <motion.div variants={fadeIn}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 tracking-tight">
              Group Packing{" "}
              <span className="text-primary underline decoration-wavy decoration-primary/30 underline-offset-8">
                Made Simple
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Streamline your event and travel planning with collaborative
              checklists. Assign tasks, track progress, and stay organized as a
              team.
            </p>
          </motion.div>

          {/* Benefits */}
          <motion.div variants={fadeIn} className="space-y-3">
            {[
              "Real-time progress tracking and updates",
              "Role-based access control for teams",
              "Smart conflict detection and alerts",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2">
                <CheckCircle className="text-primary h-5 w-5 flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={fadeIn} className="flex gap-4">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={() =>
                (window.location.href = "https://packpal-app.axiomclub.tech")
              }
            >
              Get Started Free
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            variants={fadeIn}
            className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-8 items-start sm:items-center pt-4 border-t"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                {Array(5)
                  .fill(null)
                  .map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-500 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                <span className="ml-2 font-medium">4.9/5</span>
              </div>
              <p className="text-sm text-muted-foreground">
                From 10,000+ organizers
              </p>
            </div>

            <div className="flex gap-4 mt-2 sm:mt-0">
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-primary">
                  500K+
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Items Packed
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-primary">
                  50K+
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Active Groups
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column - App Features Showcase */}
        <motion.div
          className="relative flex justify-center mt-8 md:mt-0"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative w-full max-w-md">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl transform rotate-3" />
            <div className="relative z-10 bg-card border shadow-xl rounded-3xl p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Feature Cards */}
              <motion.div
                className="bg-background p-4 rounded-lg border shadow-sm"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Team Collaboration</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Assign roles and tasks
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-background p-4 rounded-lg border shadow-sm"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              >
                <div className="flex items-center gap-3">
                  <ListChecks className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Smart Checklists</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Track packing progress
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="bg-background p-4 rounded-lg border shadow-sm"
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Real-time Updates</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Stay in sync with your team
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
