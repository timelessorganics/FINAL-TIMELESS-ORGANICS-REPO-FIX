import Header from "@/components/header";
import { SmokeFireBackground } from "@/components/SmokeFireBackground";

export default function Terms() {
  return (
    <>
      <div className="bg-aloe" />
      <SmokeFireBackground />
      <Header />
      
      <div className="relative z-50 min-h-screen py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-8 text-center">
            Terms & Conditions
          </h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">1. Founding 100 Investment Agreement</h2>
              <p>
                By purchasing a Founder's Pass or Patron Gift Card, you agree to invest capital in the final fit-out 
                of Timeless Organics' bronze casting studio in Kommetjie, South Africa. This is not crowdfunding — 
                it is co-creation. Your investment directly funds infrastructure that becomes operational.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">2. Botanical Cutting Selection</h2>
              <p>
                Upon successful payment, you will select one botanical specimen from our curated gallery. This specimen 
                will be encased in ceramic immediately and cast in bronze using the ancient lost-wax method. The resulting 
                bronze casting is yours to keep.
              </p>
              <p>
                Studio-guaranteed cuttings are selected by David Junor for their artistic and botanical merit. All cuttings 
                are sourced ethically and prepared for optimal casting results.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">3. Workshop Codes & Discounts</h2>
              <p>
                <strong>Workshop Voucher (One-Time Use):</strong> Founder's Pass includes 50% off your first 2-day workshop. 
                Patron Gift Card includes 80% off your first 2-day workshop. This code is transferable and valid for one-time 
                use on workshops only (not seat purchases).
              </p>
              <p>
                <strong>Lifetime Workshop Code:</strong> Founder's Pass includes 20% lifetime discount. Patron Gift Card includes 
                30% lifetime discount. This code is unique, transferable, and valid for unlimited workshop bookings for life. 
                Valid for workshops only (not seat purchases).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">4. Bronze Claim Code</h2>
              <p>
                Each purchase includes one bronze claim code. This code is redeemable for your selected botanical casting 
                once completed. Bronze castings typically require 6-12 weeks for ceramic encasement, kiln firing, bronze 
                pouring, and finishing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">5. Refunds & Cancellations</h2>
              <p>
                All sales are final. As an infrastructure investment, Founding 100 seats cannot be refunded once purchased. 
                If you are unable to redeem your codes or claim your bronze casting, codes may be transferred to another party 
                at your discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">6. Payment Processing</h2>
              <p>
                Payments are processed securely through PayFast. Timeless Organics does not store your payment information. 
                Once payment is confirmed, you will receive an email with your unique codes and certificate.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">7. Founding Member Benefits</h2>
              <p>
                As a Founding 100 member, you receive lifetime recognition as an infrastructure investor, priority access 
                to future workshops, and exclusive updates on studio developments. Your investment certificate is proof of 
                your founding status.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">8. Contact</h2>
              <p>
                For questions or concerns, contact us at{" "}
                <a href="mailto:hello@timeless.organic" className="text-accent-gold hover:underline">
                  hello@timeless.organic
                </a>
              </p>
            </section>

            <p className="text-sm text-muted-foreground/70 pt-8 border-t border-border">
              Last updated: October 27, 2025
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
