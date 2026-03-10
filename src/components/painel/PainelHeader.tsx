import { Eye, EyeOff, HelpCircle, CheckCircle } from "lucide-react";

interface Props {
  inicialNome: string;
  showBalance: boolean;
  onToggleBalance: () => void;
}

const PainelHeader = ({ inicialNome, showBalance, onToggleBalance }: Props) => (
  <header className="nu-gradient-bg px-5 pt-12 pb-6">
    <div className="flex items-center justify-between">
      <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
        <span className="text-primary-foreground text-lg font-heading font-bold">{inicialNome}</span>
      </div>
      <div className="flex items-center gap-5">
        <button className="text-primary-foreground/80 hover:text-primary-foreground transition-colors" onClick={onToggleBalance}>
          {showBalance ? <Eye className="h-6 w-6" /> : <EyeOff className="h-6 w-6" />}
        </button>
        <button className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
          <HelpCircle className="h-6 w-6" />
        </button>
        <button className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
          <CheckCircle className="h-6 w-6" />
        </button>
      </div>
    </div>
  </header>
);

export default PainelHeader;
