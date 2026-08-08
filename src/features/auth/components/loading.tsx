import { Loader2Icon } from "lucide-react";

const PageLoading = () => {
  return (
    <div className="min-h-48 flex items-center justify-center">
      <Loader2Icon className="size-9 animate-spin text-blue-400" />
    </div>
  );
};

export default PageLoading;
