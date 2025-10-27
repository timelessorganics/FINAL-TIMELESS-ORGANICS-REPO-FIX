import Header from "@/components/header";
import { SmokeFireBackground } from "@/components/SmokeFireBackground";

export default function Privacy() {
  return (
    <>
      <div className="bg-aloe" />
      <SmokeFireBackground />
      <Header />
      
      <div className="relative z-50 min-h-screen py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-8 text-center">
            Privacy Policy
          </h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">1. Information We Collect</h2>
              <p>
                When you create an account or purchase a seat, we collect:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Your name and email address (via Replit authentication)</li>
                <li>Payment information (processed securely by PayFast)</li>
                <li>Botanical cutting selection preferences</li>
                <li>Workshop booking history (when applicable)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">2. How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process your Founding 100 seat purchase</li>
                <li>Send your unique codes and investment certificate</li>
                <li>Facilitate bronze casting selection and delivery</li>
                <li>Communicate workshop availability and updates</li>
                <li>Provide customer support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">3. Data Storage & Security</h2>
              <p>
                Your data is stored securely in our database (Supabase PostgreSQL). We use industry-standard encryption 
                and security measures. Payment information is never stored on our servers — all payment processing is 
                handled by PayFast.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">4. Third-Party Services</h2>
              <p>We use the following third-party services:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Replit Auth:</strong> User authentication and account management</li>
                <li><strong>PayFast:</strong> Secure payment processing</li>
                <li><strong>Supabase:</strong> Database hosting and storage</li>
              </ul>
              <p>
                Each service has its own privacy policy governing their use of your data. We recommend reviewing 
                their policies for complete transparency.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">5. Email Communications</h2>
              <p>
                We will send you transactional emails including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Purchase confirmation and codes</li>
                <li>Certificate delivery</li>
                <li>Workshop availability notifications</li>
                <li>Important studio updates</li>
              </ul>
              <p>
                You may opt out of non-essential communications by contacting us, but we will continue sending 
                transaction-related emails necessary for service delivery.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">6. Data Retention</h2>
              <p>
                We retain your purchase data indefinitely to honor lifetime workshop codes and maintain founding member 
                records. You may request data deletion by contacting us, but this will void your codes and founding status.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal data</li>
                <li>Request data corrections</li>
                <li>Request data deletion (with limitations noted above)</li>
                <li>Withdraw consent for marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">8. Contact</h2>
              <p>
                For privacy-related questions or requests, contact us at{" "}
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
