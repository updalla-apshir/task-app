import { ModeToggle } from "@/components/mode-toggle";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center flex-col">
      <ModeToggle/>
    </div>
  );
}
