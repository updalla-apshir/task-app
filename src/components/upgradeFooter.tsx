"use client";

import { Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
const UpgradeFooter = () => {
  const { data } = useSession();
  const userRole = data?.user.role;
  if (userRole === "User") {
    return (
      <div className="mt-auto p-3">
        <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-md px-3 py-2 transition hover:brightness-110 cursor-pointer group">
          <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
          <span className="text-sm font-medium hidden lg:inline">
            Upgrade to Pro
          </span>
          <span className="sr-only">Upgrade</span>
        </div>
      </div>
    );
  } else {
    null;
  }
};

export default UpgradeFooter;
