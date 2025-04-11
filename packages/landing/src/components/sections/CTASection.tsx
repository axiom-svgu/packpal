import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="container mx-auto py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">
          Ready to transform your HR operations?
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of companies already using Scaffold to streamline their
          HR processes and build better workplace culture.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Enter your work email"
            className="flex-grow"
          />
          <Button className="flex items-center gap-2">
            Get Started <ArrowRight className="size-4" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          Free 14-day trial • No credit card required
        </p>
      </div>
    </section>
  );
}
