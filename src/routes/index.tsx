import { createFileRoute } from "@tanstack/react-router";
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Diamond,
  Instagram,
  MapPin,
  Menu,
  Phone,
  Scissors,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import hero from "@/assets/hero-signage.jpg.asset.json";
import cutting from "@/assets/tailoring-007.jpg.asset.json";
import suitedMan from "@/assets/tailoring-008.jpg.asset.json";
import handStitching from "@/assets/tailoring-040.jpg.asset.json";
import sherwaniMan from "@/assets/tailoring-037.jpg.asset.json";
import suitDisplay from "@/assets/tailoring-041.jpg.asset.json";
import service1 from "@/assets/tailoring-027.jpg.asset.json";
import service2 from "@/assets/tailoring-028.jpg.asset.json";
import service3 from "@/assets/tailoring-029.jpg.asset.json";
import service4 from "@/assets/tailoring-030.jpg.asset.json";
import service5 from "@/assets/tailoring-031.jpg.asset.json";
import service6 from "@/assets/tailoring-032.jpg.asset.json";
import service7 from "@/assets/tailoring-033.jpg.asset.json";
import service8 from "@/assets/tailoring-034.jpg.asset.json";
import studioLeft from "@/assets/tailoring-026.jpg.asset.json";
import studioRight from "@/assets/tailoring-025.jpg.asset.json";
import gallery1 from "@/assets/tailoring-001.jpg.asset.json";
import gallery2 from "@/assets/tailoring-002.jpg.asset.json";
import gallery3 from "@/assets/tailoring-006.jpg.asset.json";
import gallery4 from "@/assets/tailoring-003.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Daula Attire | Bespoke Men's Tailoring" },
      {
        name: "description",
        content: "Luxury bespoke menswear, handcrafted suits, sherwanis, tuxedos and traditional tailoring in Karachi.",
      },
      { property: "og:title", content: "Daula Attire | Bespoke Men's Tailoring" },
      {
        property: "og:description",
        content: "Discover tailored elegance and luxury menswear handcrafted for every occasion.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const services = [
  ["3-Piece Suit", service1.url],
  ["Sherwani", service2.url],
  ["Shalwar Kameez", service3.url],
  ["Tuxedo", service4.url],
  ["Sherwani", service5.url],
  ["Shalwar Kameez", service6.url],
  ["Tuxedo", service7.url],
  ["Sherwani", service8.url],
];

const promises = [
  [CheckCircle2, "Tailored to Perfection"],
  [Sparkles, "Elegance Redefined"],
  [Diamond, "Luxury in Every Detail"],
  [Award, "25 Year Experience"],
] as const;

function Monogram() {
  return (
    <div className="brand-lockup" aria-label="Daula Attire">
      <strong>DAULA ATTIRE</strong>
      <span>HOUSE OF LUXURY MEN'S WEAR</span>
    </div>
  );
}

function Index() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="site-header">
        <button className="icon-button" aria-label="Open menu"><Menu /></button>
        <Monogram />
        <button className="icon-button" aria-label="Open shopping bag"><ShoppingBag /></button>
      </header>

      <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, var(--hero-overlay), transparent), url(${hero.url})` }}>
        <div className="hero-content reveal">
          <p className="eyebrow">Welcome to Daula Attire</p>
          <h1>Tailored Elegance<br />For Every Occasion</h1>
          <p className="hero-copy">Where heritage craftsmanship meets contemporary style. Made by hand, fitted to you.</p>
          <Button variant="outline" size="lg" asChild className="hero-cta">
            <a href="#services">Explore our style <ChevronRight /></a>
          </Button>
        </div>
      </section>

      <section className="section-shell intro-grid">
        <div className="section-copy reveal">
          <p className="eyebrow">About Us</p>
          <h2>The Art of<br /><span>Bespoke Tailoring</span></h2>
          <p>Since 1980, Daula Attire has shaped fine cloth into garments of distinction. Every cut, seam and finish reflects an uncompromising eye for detail.</p>
          <Button size="lg">Discover More</Button>
        </div>
        <div className="intro-images">
          <img src={cutting.url} alt="Tailor cutting fine fabric by hand" />
          <img src={suitedMan.url} alt="Man wearing a tailored navy suit" />
        </div>
      </section>

      <section className="border-band">
        <div className="section-shell craft-grid">
          <img src={handStitching.url} alt="Hand stitching a bespoke suit" />
          <div className="section-copy">
            <p className="eyebrow">Craft</p>
            <h2>Crafted<br />In Detail</h2>
            <p>Each garment is built stitch by stitch. Our artisans bring years of practiced skill to traditional techniques, premium cloth and a truly personal fit.</p>
            <Button size="lg">Learn More</Button>
          </div>
        </div>
      </section>

      <section className="section-shell vision-grid">
        <div className="section-copy">
          <p className="eyebrow">Bespoke Recreation</p>
          <h2>Your Vision,<br />Tailored to<br />Perfection</h2>
          <p>From the first consultation to the final fitting, your preferences guide every choice. We create clothing that feels as individual as the person wearing it.</p>
          <p>Classic suiting or ceremonial dress, restrained or expressive—our house translates your vision into enduring elegance.</p>
        </div>
        <div className="portrait-cluster">
          <img className="portrait-main" src={sherwaniMan.url} alt="Man in a navy embroidered sherwani" />
          <img className="portrait-small" src={suitDisplay.url} alt="Bespoke suit displayed on a mannequin" />
        </div>
      </section>

      <section id="services" className="services-section">
        <div className="section-heading">
          <p className="eyebrow">Services</p>
          <h2>Our Signature Services</h2>
        </div>
        <div className="service-grid">
          {services.map(([name, image]) => (
            <article className="service-card" key={`${name}-${image}`}>
              <img src={image} alt={name} />
              <div><span>{name}</span></div>
            </article>
          ))}
        </div>
      </section>

      <section className="promise-band" style={{ backgroundImage: `linear-gradient(var(--image-overlay), var(--image-overlay)), url(${gallery4.url})` }}>
        <div className="promise-grid">
          {promises.map(([Icon, title]) => (
            <article key={title}>
              <Icon />
              <h3>{title}</h3>
              <p>Measured with care, crafted with patience and finished to the highest standard.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell studio-section">
        <img src={studioLeft.url} alt="Black embroidered formal jacket" />
        <div className="studio-center">
          <h2>Visit Our<br />Studio in Karachi</h2>
          <div className="map-card">
            <MapPin />
            <span>Daula Attire</span>
            <small>Tariq Road · Karachi</small>
          </div>
        </div>
        <img src={studioRight.url} alt="Man wearing a black formal sherwani" />
      </section>

      <section className="section-shell gallery-section">
        <p className="eyebrow">Gallery</p>
        <h2>Style Note &amp; Stories</h2>
        <div className="gallery-grid">
          {[gallery1, gallery2, gallery3, gallery4].map((image, index) => (
            <img key={image.url} src={image.url} alt={`Daula Attire tailoring story ${index + 1}`} />
          ))}
        </div>
      </section>

      <footer style={{ backgroundImage: `linear-gradient(var(--footer-overlay), var(--footer-overlay)), url(${gallery2.url})` }}>
        <Monogram />
        <div className="footer-address">
          <p className="eyebrow">Address</p>
          <p>Visit our Karachi studio for fittings and private consultations.</p>
          <a href="tel:+92223305070"><Phone /> +92 22 3305070</a>
          <a href="mailto:info@daulaattire.com"><Instagram /> info@daulaattire.com</a>
        </div>
        <form className="subscribe" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="email">Subscribe to new arrivals</label>
          <input id="email" type="email" placeholder="Enter your email address" />
          <Button type="submit">Subscribe</Button>
        </form>
      </footer>
    </main>
  );
}