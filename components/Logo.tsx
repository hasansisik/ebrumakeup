import React from "react";
import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  className?: string;
  light?: boolean;
}

export default function Logo({ className = "", light = false }: LogoProps) {
  return (
    <Link
      href="/"
      className={`brand-logo ${light ? "brand-logo-light" : ""} ${className}`}
      id="site-logo"
      aria-label="EbruMakeUp - Ana Sayfa"
    >
      {/* Brand Image Mark: @logo.png */}
      <span className="logo-image-wrap">
        <Image
          src="/logo.png"
          alt="EbruMakeUp Logo"
          width={40}
          height={40}
          className="logo-image"
          priority
        />
      </span>

      {/* Typography: Sadece EbruMakeUp */}
      <span className="logo-text">
        <span className="logo-name">Ebru</span>
        <span className="logo-makeup">MakeUp</span>
      </span>
    </Link>
  );
}
