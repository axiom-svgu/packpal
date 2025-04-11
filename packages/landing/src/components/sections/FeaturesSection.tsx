import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users2, BarChart3, Zap, Smartphone } from "lucide-react";

const features = [
  {
    title: "Employee Management",
    description:
      "Streamline HR processes and manage your workforce efficiently with our comprehensive tools.",
    icon: Users2,
  },
  {
    title: "Analytics Dashboard",
    description:
      "Get real-time insights into your organization's performance with detailed analytics.",
    icon: BarChart3,
  },
  {
    title: "Quick Integration",
    description:
      "Easy setup and seamless integration with your existing systems and workflows.",
    icon: Zap,
  },
  {
    title: "Mobile First",
    description:
      "Access your HR platform anywhere, anytime with our mobile-optimized interface.",
    icon: Smartphone,
  },
];

export default function FeaturesSection() {
  return (
    <section className="container mx-auto py-24 px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">
          Everything you need to manage your workforce
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Powerful features designed to help you transform your HR operations
          and create a better workplace culture.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card
              key={index}
              className="border-2 hover:border-primary/50 transition-colors"
            >
              <CardHeader>
                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="size-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
