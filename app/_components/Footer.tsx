"use client";

import { motion } from "framer-motion";
import GithubLogo from "@/public/github.png";
import LinkedinLogo from "@/public/linkedin.png";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import bg from "@/public/footer-bg.webp";

const Footer = () => {
  const socialLinks = [
    {
      name: "GitHub",
      icon: GithubLogo,
      url: "https://github.com/rahuldev403",
    },
    {
      name: "LinkedIn",
      icon: LinkedinLogo,
      url: "https://www.linkedin.com/in/rahul-swain-268484306/",
    },
  ];

  return (
    <footer className="relative overflow-hidden border-gray-800 bg-black">
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src={bg}
          alt="Footer Background"
          fill
          className="object-cover opacity-20"
          style={{ imageRendering: "pixelated" }}
        />
      </div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="border-4 border-gray-800 bg-black/40 p-8 shadow-[8px_8px_0px_0px_rgba(107,114,128,0.3)] "
          style={{ imageRendering: "pixelated" }}
        >
          <motion.div
            className="h-1 bg-linear-to-r from-purple-600 via-pink-300 to-yellow-400 mb-8"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          />

          {/* Main footer content */}
          <div className="grid md:grid-cols-2 gap-12 mb-8">
            {/* Brand section */}
            <div className="text-center md:text-left">
              <div className="mb-6 flex flex-col items-center md:items-start gap-4">
                <motion.div style={{ imageRendering: "pixelated" }}>
                  <Image
                    src="/dev.png"
                    alt="RahulDev Logo"
                    width={96}
                    height={96}
                    className="h-24 w-auto"
                    style={{ imageRendering: "pixelated" }}
                  />
                </motion.div>
                <div>
                  <h3
                    className="text-purple-400 text-lg sm:text-xl font-game font-normal mb-3 tracking-wider"
                    style={{ textShadow: "3px 3px 0 #000, -1px -1px 0 #000" }}
                  >
                    PIXEL PERFECT CODE
                  </h3>
                  <p className="text-gray-300 text-sm sm:text-base font-comfortaa leading-relaxed max-w-md">
                    Hey I&apos;m Rahul Swain. Building 8-bit dreams with modern
                    tech. Level up your skills with hands-on projects and
                    retro-inspired learning.
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="text-center md:text-right">
              <h4
                className="text-xl sm:text-2xl font-game font-normal text-yellow-400 mb-6"
                style={{ textShadow: "2px 2px 0 #000, -1px -1px 0 #000" }}
              >
                CONNECT
              </h4>
              <div className="flex justify-center md:justify-end gap-4">
                {socialLinks.map((social) => {
                  const source = social.icon;
                  return (
                    <motion.a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-14 h-14 border-4 border-gray-700 bg-gray-950 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(147,51,234,0.5)] hover:border-purple-600"
                      title={social.name}
                      whileHover={{ scale: 1.1, y: -4 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      style={{ imageRendering: "pixelated" }}
                    >
                      <Image
                        src={source}
                        alt={social.name}
                        className="w-7 h-7"
                        style={{ imageRendering: "pixelated" }}
                      />
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-1 bg-linear-to-r from-transparent via-gray-700 to-transparent my-6" />

          {/* Bottom section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 flex-col md:flex-row">
              <p className="text-gray-400 text-xs sm:text-sm text-center md:text-left font-comfortaa">
                © {new Date().getFullYear()} streak-it . ALL RIGHTS RESERVED.
              </p>

              {/* Made with love */}
              <div className="flex items-center gap-2 text-pink-400 text-xs sm:text-sm font-game font-normal">
                <span>MADE WITH</span>
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-red-500"
                >
                  ❤
                </motion.div>
                <span>& LEMONADE</span>
              </div>
            </div>
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              variant="pixel"
              className="font-game font-normal text-sm rounded-md"
            >
              ↑ BACK TO TOP
            </Button>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
