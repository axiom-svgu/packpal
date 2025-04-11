import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "PackPal made organizing our company retreat so much easier! The role-based access meant everyone knew exactly what they were responsible for packing.",
    author: "Alex Thompson",
    position: "Event Coordinator",
    company: "StartupHub",
    rating: 5,
  },
  {
    quote:
      "As a tour guide, I use PackPal for all my group trips. The real-time tracking helps ensure nothing gets left behind, and the conflict detection is a lifesaver!",
    author: "Maria Garcia",
    position: "Senior Tour Guide",
    company: "Adventure Tours",
    rating: 5,
  },
  {
    quote:
      "We used PackPal for our destination wedding, and it was fantastic! Our wedding party stayed organized, and the collaborative features made packing stress-free.",
    author: "James & Emily Chen",
    position: "Newlyweds",
    company: "Wedding Party of 20",
    rating: 5,
  },
  {
    quote:
      "The smart checklists and status tracking have revolutionized how our theater company manages props and costumes for touring shows.",
    author: "David Williams",
    position: "Production Manager",
    company: "City Theater Company",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="container mx-auto py-24 px-4 bg-secondary/30">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">Loved by Groups Everywhere</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          See how PackPal is helping teams stay organized and stress-free.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
