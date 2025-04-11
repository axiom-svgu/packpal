import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "Scaffold has completely transformed how we manage our HR operations. The platform is intuitive and our employees love using it.",
    author: "Sarah Johnson",
    position: "HR Director",
    company: "TechCorp Inc.",
    rating: 5,
  },
  {
    quote:
      "The analytics features have given us invaluable insights into our workforce dynamics. It's been a game-changer for our decision-making.",
    author: "Michael Chen",
    position: "Operations Manager",
    company: "Global Solutions Ltd.",
    rating: 5,
  },
  {
    quote:
      "Implementation was smooth and the support team was incredibly helpful. We've seen a significant improvement in employee engagement.",
    author: "Emma Rodriguez",
    position: "People Manager",
    company: "Innovate Co.",
    rating: 4,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="container mx-auto py-24 px-4 bg-secondary/30">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">
          Trusted by leading companies
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          See what our customers have to say about their experience with
          Scaffold.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="bg-background">
            <CardContent className="pt-6">
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="size-5 fill-yellow-500 text-yellow-500"
                  />
                ))}
              </div>
              <blockquote className="text-lg mb-6">
                "{testimonial.quote}"
              </blockquote>
              <div>
                <div className="font-semibold">{testimonial.author}</div>
                <div className="text-sm text-muted-foreground">
                  {testimonial.position}
                </div>
                <div className="text-sm text-muted-foreground">
                  {testimonial.company}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
