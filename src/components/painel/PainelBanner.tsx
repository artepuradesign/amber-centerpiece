import { RefreshCw } from "lucide-react";

const PainelBanner = () => (
  <section className="px-5 pb-6">
    <div className="bg-secondary rounded-2xl p-5 flex items-center justify-between">
      <p className="text-sm text-foreground font-body">
        Traga seus dados e <strong>aumente suas chances de crédito.</strong>
      </p>
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 ml-4">
        <RefreshCw className="h-5 w-5 text-primary" />
      </div>
    </div>
    <div className="flex justify-center gap-1.5 mt-3">
      <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
      <span className="w-2 h-2 rounded-full bg-muted-foreground" />
      <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
    </div>
  </section>
);

export default PainelBanner;
