
import { LoaderCircle } from "lucide-react";

export default function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <LoaderCircle className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );
}
