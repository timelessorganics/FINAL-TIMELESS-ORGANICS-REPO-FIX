import Header from "@/components/header";
import { SmokeFireBackground } from "@/components/SmokeFireBackground";

export default function Waiver() {
  return (
    <>
      <div className="bg-aloe" />
      <SmokeFireBackground />
      <Header />
      
      <div className="relative z-50 min-h-screen py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-8 text-center">
            Workshop Liability Waiver
          </h1>
          
          <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-lg text-foreground/90">
              This waiver applies to all participants attending 2-day bronze casting workshops at Timeless Organics, 
              Kommetjie, South Africa.
            </p>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">1. Acknowledgment of Risks</h2>
              <p>
                I understand that bronze casting involves inherent risks including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Working with molten bronze at temperatures exceeding 1,000°C (1,832°F)</li>
                <li>Operation of kilns, furnaces, and casting equipment</li>
                <li>Handling of sharp tools, ceramic molds, and hot materials</li>
                <li>Exposure to heat, flames, and workshop environment</li>
                <li>Physical exertion and manual labor</li>
              </ul>
              <p>
                I acknowledge these risks and voluntarily assume full responsibility for my safety during the workshop.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">2. Safety Requirements</h2>
              <p>
                By attending the workshop, I agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Follow all safety instructions provided by studio staff</li>
                <li>Wear appropriate protective equipment (closed-toe shoes, long pants, no loose clothing)</li>
                <li>Stay alert and avoid distractions while working</li>
                <li>Immediately report any unsafe conditions or injuries</li>
                <li>Abstain from alcohol or substances that impair judgment</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">3. Release of Liability</h2>
              <p>
                I hereby release, waive, and discharge Timeless Organics, David Junor, and all associated staff, 
                instructors, and property owners from any and all liability for injuries, damages, or losses I may 
                sustain while participating in the workshop, whether caused by negligence or otherwise.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">4. Medical Consent</h2>
              <p>
                In the event of injury or medical emergency, I authorize Timeless Organics staff to arrange for 
                emergency medical treatment. I understand I am responsible for any medical expenses incurred.
              </p>
              <p>
                I confirm that I am in good health and have no medical conditions that would prevent safe participation 
                in physically demanding workshop activities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">5. Photography & Media</h2>
              <p>
                I grant permission for Timeless Organics to photograph and video record workshop activities for 
                promotional, educational, and archival purposes. I understand my likeness may appear in marketing materials.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">6. Property Damage</h2>
              <p>
                I agree to exercise care when using studio equipment and materials. I accept responsibility for any 
                damage caused by my negligence or failure to follow instructions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">7. Workshop Completion</h2>
              <p>
                I understand that bronze casting is an unpredictable art form. While every effort will be made to ensure 
                successful castings, Timeless Organics cannot guarantee perfect results due to the nature of the process.
              </p>
              <p>
                Failed castings are part of the learning experience and will be discussed as teaching opportunities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">8. Agreement</h2>
              <p>
                By attending a Timeless Organics workshop, I confirm that I have read, understood, and agree to this 
                liability waiver. I acknowledge that this waiver is legally binding and affects my legal rights.
              </p>
              <p>
                Participants under 18 years of age require parental/guardian consent and supervision.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4">9. Contact</h2>
              <p>
                For questions about workshop safety or this waiver, contact us at{" "}
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
