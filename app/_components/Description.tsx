"use client";

import { motion } from "framer-motion";
import { Code2, Trophy, Users, Zap } from "lucide-react";

const features = [
  {
    icon: Code2,
    title: "Interactive Coding",
    description:
      "Learn by doing with our interactive code editor and real-time feedback",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Trophy,
    title: "Gamified Learning",
    description:
      "Track your progress with streaks, achievements, and leaderboards",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Connect with fellow learners and get help from the community",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "Fast Progress",
    description:
      "Master web development with structured courses and hands-on projects",
    color: "from-green-500 to-emerald-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
    },
  },
};

const Description = () => {
  return (
    <section className="py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-game font-normal mb-4 sm:mb-6 text-gray-900 dark:text-white">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Streak Setter
            </span>
            ?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-comfortaa">
            Experience a revolutionary way to learn programming with our
            gamified platform that makes coding fun and engaging.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{
                  scale: 1.05,
                  transition: { type: "spring", stiffness: 300, damping: 15 },
                }}
                className="group relative bg-white dark:bg-gray-800 rounded-lg p-6 sm:p-8 border-4 border-gray-800 dark:border-white shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff] hover:shadow-[8px_8px_0_0_#000] dark:hover:shadow-[8px_8px_0_0_#fff] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
              >
                {/* Gradient Icon Background */}
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br ${feature.color} p-3 sm:p-4 mb-4 sm:mb-6 border-2 border-gray-800 dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]`}
                >
                  <Icon className="w-full h-full text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-lg sm:text-xl font-bold font-game font-normal mb-2 sm:mb-3 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-comfortaa">
                  {feature.description}
                </p>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-gray-400 dark:group-hover:border-gray-600 transition-colors duration-200 pointer-events-none" />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12 sm:mt-16 md:mt-20"
        >
          <p className="text-lg sm:text-xl md:text-2xl font-game font-normal text-gray-700 dark:text-gray-300 mb-6 sm:mb-8">
            Join thousands of developers learning to code the fun way! 🚀
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a
                href="/courses"
                className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold font-game font-normal text-base sm:text-lg rounded-md border-4 border-gray-800 shadow-[6px_6px_0_0_#000] hover:shadow-[8px_8px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
              >
                Browse Courses
              </a>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a
                href="/pricing"
                className="inline-block px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold font-game font-normal text-base sm:text-lg rounded-md border-4 border-gray-800 dark:border-white shadow-[6px_6px_0_0_#000] dark:shadow-[6px_6px_0_0_#fff] hover:shadow-[8px_8px_0_0_#000] dark:hover:shadow-[8px_8px_0_0_#fff] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-200"
              >
                View Pricing
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Description;
