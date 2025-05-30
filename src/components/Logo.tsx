import React from "react";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  isCollapsed?: boolean;
}

const Logo = ({ isCollapsed = false }: LogoProps) => {
  return (
    <Link href="/" aria-label="Go to homepage" className="block w-full">
      {isCollapsed ? (
        <div className="relative w-12 h-12 flex items-center justify-center">
          {/* Dark mode collapsed icon */}
          <Image
            src="/images/collpas-dark-icon.png"
            alt="Collapsed Dark Logo"
            fill
            className="object-contain dark:block hidden"
            priority
          />
          {/* Light mode collapsed icon */}
          <Image
            src="/images/collpas-white-icon.png"
            alt="Collapsed Light Logo"
            fill
            className="object-contain dark:hidden block"
            priority
          />
        </div>
      ) : (
        <div className="relative w-full h-16 flex items-center justify-start">
          {/* Dark mode full logo */}
          <Image
            src="/images/logo-dark.png"
            alt="Full Dark Logo"
            fill
            className="object-contain object-left dark:block hidden"
            priority
          />
          {/* Light mode full logo */}
          <Image
            src="/images/logo-light.png"
            alt="Full Light Logo"
            fill
            className="object-contain object-left dark:hidden block"
            priority
          />
        </div>
      )}
    </Link>
  );
};

export default Logo;
