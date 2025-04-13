import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function CTASection() {
  return (
    <section id="cta" className="container mx-auto py-12 md:py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">
          Ready to make group packing stress-free?
        </h2>
        <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto">
          Join thousands of groups using PackPal to organize their events,
          trips, and activities with smart checklists and real-time
          collaboration.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12 max-w-2xl mx-auto text-left">
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-primary h-5 w-5 flex-shrink-0" />
              <span className="text-sm md:text-base">
                Unlimited checklists and items
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-primary h-5 w-5 flex-shrink-0" />
              <span className="text-sm md:text-base">
                Real-time progress tracking
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-primary h-5 w-5 flex-shrink-0" />
              <span className="text-sm md:text-base">
                Role-based access control
              </span>
            </div>
          </div>
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-primary h-5 w-5 flex-shrink-0" />
              <span className="text-sm md:text-base">
                Smart conflict detection
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-primary h-5 w-5 flex-shrink-0" />
              <span className="text-sm md:text-base">
                Team collaboration tools
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-primary h-5 w-5 flex-shrink-0" />
              <span className="text-sm md:text-base">
                Mobile-friendly interface
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Enter your email"
            className="flex-grow"
          />
          <Button
            className="flex items-center gap-2 w-full sm:w-auto justify-center"
            onClick={() =>
              (window.location.href = "https://packpal-app.axiomclub.tech")
            }
          >
            Start Packing <ArrowRight className="size-4" />
          </Button>
        </div>

        <p className="text-xs md:text-sm text-muted-foreground mt-4">
          Free forever • No credit card required
        </p>
      </div>
    </section>
  );
}
