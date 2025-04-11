import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

export default function HeroSection() {
  return (
    <section className="container mx-auto py-24 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* Left Column */}
        <motion.div
          className="flex flex-col gap-8"
          initial="initial"
          animate="animate"
          variants={{
            animate: { transition: { staggerChildren: 0.1 } },
          }}
        >
          {/* Heading */}
          <motion.div variants={fadeIn}>
            <h1 className="text-6xl font-bold mb-4 tracking-tight">
              Your Gateway to{" "}
              <span className="text-primary underline decoration-wavy decoration-primary/30 underline-offset-8">
                Web3
              </span>{" "}
              Innovation
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Experience the future of decentralized finance. Trade, stake, and
              earn with our next-gen DeFi platform powered by blockchain
              technology.
            </p>
          </motion.div>

          {/* Benefits */}
          <motion.div variants={fadeIn} className="space-y-3">
            {[
              "Zero-gas fees on layer 2 transactions",
              "Military-grade security protocols",
              "Access to 100+ DeFi protocols",
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2">
                <CheckCircle className="text-primary h-5 w-5" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </motion.div>

          {/* Social Proof */}
          <motion.div
            variants={fadeIn}
            className="flex flex-wrap gap-8 items-center pt-4 border-t"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                {Array(5)
                  .fill(null)
                  .map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 fill-current ${
                        i === 4 ? "text-yellow-500/50" : "text-yellow-500"
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                <span className="ml-2 font-medium">4.9/5</span>
              </div>
              <p className="text-sm text-muted-foreground">
                From 50,000+ traders
              </p>
            </div>

            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">$2.5B</p>
                <p className="text-sm text-muted-foreground">
                  Total Value Locked
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">1M+</p>
                <p className="text-sm text-muted-foreground">Active Wallets</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column - App Mockup */}
        <motion.div
          className="relative flex justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="relative w-full max-w-md">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl transform rotate-3" />
            <svg
              viewBox="0 0 400 400"
              className="w-full h-auto relative z-10"
              style={{ maxHeight: "500px" }}
            >
              {/* Modern crypto app wireframe illustration */}
              <rect
                x="100"
                y="50"
                width="200"
                height="300"
                rx="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              {/* Price Chart Area */}
              <path
                d="M120 200 L140 180 L160 190 L180 150 L200 170 L220 140 L240 160 L260 130"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              {/* Token Pairs */}
              <rect
                x="120"
                y="80"
                width="160"
                height="40"
                rx="5"
                fill="currentColor"
                fillOpacity="0.1"
                stroke="currentColor"
                strokeWidth="1"
              />
              {/* Trading Stats */}
              <rect
                x="120"
                y="240"
                width="70"
                height="40"
                rx="5"
                fill="currentColor"
                fillOpacity="0.1"
                stroke="currentColor"
                strokeWidth="1"
              />
              <rect
                x="210"
                y="240"
                width="70"
                height="40"
                rx="5"
                fill="currentColor"
                fillOpacity="0.1"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>

            {/* Floating elements */}
            <motion.div
              className="absolute top-1/4 -right-16 sm:-right-24 bg-card p-6 rounded-xl shadow-lg border"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="text-sm font-medium">Live Trading</div>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <div className="text-sm">ETH/USDT +3.2%</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <div className="text-sm">BTC/USDT +1.8%</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="absolute bottom-1/3 -left-16 sm:-left-24 bg-card p-6 rounded-xl shadow-lg border"
              animate={{ y: [0, 10, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            >
              <div className="text-sm font-medium">Market Cap</div>
              <div className="mt-2 flex h-8 gap-1.5 items-end">
                {[4, 6, 8, 5, 7].map((height, i) => (
                  <div
                    key={i}
                    className="w-2 bg-primary/60 rounded-t"
                    style={{ height: `${height * 4}px` }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
